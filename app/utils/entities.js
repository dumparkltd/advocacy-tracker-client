import { Map } from 'immutable';

import {
  TEXT_TRUNCATE,
  ACTION_FIELDS,
  ACTOR_FIELDS,
  RESOURCE_FIELDS,
  INDICATOR_FIELDS,
  ACTIONTYPES_CONFIG,
  ACTORTYPES_CONFIG,
  API,
} from 'themes/config';
import { find, reduce, every } from 'lodash/collection';

import {
  cleanupSearchTarget,
  regExMultipleWords,
  truncateText,
  startsWith,
} from 'utils/string';
import asList from 'utils/as-list';
import isNumber from 'utils/is-number';
import appMessage from 'utils/app-message';
import { qe } from 'utils/quasi-equals';
import validateEmailFormat from 'components/forms/validators/validate-email-format';

// check if entity has nested connection by id
// - connectionAttributes: { path: 'indicatorConnections', id: 'indicator_id' }
// - connectionAttributeQuery: { attribute: connectionAttribute, values: [value2,value3] }
export const testEntityEntityAssociation = (
  entity,
  path,
  associatedId,
  connectionAttribute, // information on any connection attributes
  connectionAttributeQuery,
) => {
  // first check if entities are connected at all
  const passConnection = entity.get(path)
    && entity.get(path).includes(parseInt(associatedId, 10));
  // then check for any connection attribute queries
  // ignore connection attribute query if info not present
  if (
    !connectionAttribute
    || !connectionAttribute.path
    || !connectionAttribute.id
    || !connectionAttributeQuery
    || !connectionAttributeQuery.attribute
    || !connectionAttributeQuery.values
  ) {
    return passConnection;
  }
  // ... otherwise check all connections
  return passConnection
    && entity.get(connectionAttribute.path)
    && entity.get(connectionAttribute.path).some(
      (connection) => {
        const isAssociated = connection.get(connectionAttribute.id)
          && qe(connection.get(connectionAttribute.id), associatedId);
        if (!isAssociated) {
          return false;
        }
        const attValue = connection.get(connectionAttributeQuery.attribute);

        // test "null case"
        if (!attValue) {
          return connectionAttributeQuery.values.indexOf('0') > -1;
        }
        return connectionAttributeQuery.values.indexOf(
          connection.get(connectionAttributeQuery.attribute).toString()
        ) > -1; // allow any value
      }
    );
};

// check if entity has nested category by id
export const testEntityCategoryAssociation = (
  entity,
  categoryId,
) => testEntityEntityAssociation(entity, 'categories', categoryId);

export const testEntityParentCategoryAssociation = (
  entity,
  categories,
  categoryId,
) => testEntityEntityAssociation(entity, 'categories', categoryId);

// check if entity has any category by taxonomy id
export const testEntityTaxonomyAssociation = (
  entity,
  categories,
  taxonomyId,
) => entity.get('categories')
  && entity.get('categories').some(
    (catId) => categories.size > 0
      && categories.get(catId.toString())
      && qe(
        taxonomyId,
        categories.getIn([
          catId.toString(),
          'attributes', 'taxonomy_id',
        ])
      )
  );

// check if entity has any nested connection by type
export const testEntityAssociation = (entity, associatedPath, includeMembers) => {
  // check for actortype
  if (associatedPath.indexOf('_') > -1) {
    const [path, typeId] = associatedPath.split('_');
    const associations = entity.getIn([`${path}ByType`, parseInt(typeId, 10)]);
    if (associations && associations.size > 0) {
      return true;
    }
    if (includeMembers) {
      const memberAssociations = entity.getIn([`${path}AssociationsByType`, parseInt(typeId, 10)]);
      return memberAssociations && memberAssociations.size > 0;
    }
    return false;
  }
  const pass = entity.get(associatedPath) && entity.get(associatedPath).size > 0;
  if (pass) {
    return true;
  }
  if (includeMembers) {
    const memberAssociations = entity.get(`${associatedPath}Associations`);
    return memberAssociations && memberAssociations.size > 0;
  }
  return false;
};

// prep searchtarget, incl id
export const prepareEntitySearchTarget = (entity, fields, queryLength) => reduce(
  fields,
  (target, field) => queryLength > 1 || field === 'reference '
    ? `${target} ${cleanupSearchTarget(entity.getIn(['attributes', field]))}`
    : target,
  entity.get('id')
);

export const getConnectedCategories = (
  entityConnectedIds,
  taxonomyCategories,
  path,
) => taxonomyCategories.filter(
  (category) => entityConnectedIds.some(
    (connectionId) => testEntityEntityAssociation(
      category,
      path,
      connectionId,
    )
  )
);


// filter entities by absence of association either by taxonomy id or connection type
// assumes prior nesting of relationships
export const filterEntitiesWithoutAssociation = (
  entities,
  categories,
  query,
  includeMembers,
) => entities && entities.filter(
  (entity) => asList(query).every(
    (queryValue) => {
      const isTax = isNumber(queryValue);
      if (isTax) {
        return !testEntityTaxonomyAssociation(entity, categories, parseInt(queryValue, 10));
      }
      const isAttribute = startsWith(queryValue, 'att:');
      if (isAttribute) {
        const [, attribute] = queryValue.split(':');
        return !entity.getIn(['attributes', attribute]);
      }
      return !testEntityAssociation(entity, queryValue, includeMembers);
    }
  )
);
// filter entities by presence of any association either by taxonomy id or connection type
// assumes prior nesting of relationships
export const filterEntitiesWithAnyAssociation = (
  entities,
  categories,
  query,
  includeMembers,
) => entities && entities.filter(
  (entity) => asList(query).every(
    (queryValue) => {
      const isTax = isNumber(queryValue);
      if (isTax) {
        return testEntityTaxonomyAssociation(entity, categories, parseInt(queryValue, 10));
      }
      const isAttribute = startsWith(queryValue, 'att:');
      if (isAttribute) {
        const [, attribute] = queryValue.split(':');
        return entity.getIn(['attributes', attribute]);
      }
      return testEntityAssociation(entity, queryValue, includeMembers);
    }
  )
);

// filter entities by association with one or more categories
// assumes prior nesting of relationships
export const filterEntitiesByCategories = (
  entities,
  query,
  any = true,
) => entities
  && entities.filter(
    (entity) => any
      ? asList(query).some(
        (categoryId) => testEntityCategoryAssociation(
          entity,
          parseInt(categoryId, 10),
        )
      )
      : asList(query).every(
        (categoryId) => testEntityCategoryAssociation(
          entity,
          parseInt(categoryId, 10),
        )
      )
  );

// filter entities by association with one or more categories
// assumes prior nesting of relationships
export const filterEntitiesByConnectedCategories = (
  entities,
  connections,
  query,
  any = true,
) => entities && entities.filter(
  // consider replacing with .every()
  (entity) => any
    ? asList(query).some(
      (queryArg) => {
        const pathValue = queryArg.split(':');
        const path = pathValue[0];
        const connectionsForPath = connections.get(path);
        return !connectionsForPath || connectionsForPath.some(
          (connection) => testEntityEntityAssociation(
            entity,
            path,
            connection.get('id'),
          ) && testEntityCategoryAssociation(
            connection,
            pathValue[1],
          )
        );
      },
    )
    : asList(query).every(
      (queryArg) => {
        const pathValue = queryArg.split(':');
        const path = pathValue[0];
        const connectionsForPath = connections.get(path);
        return !connectionsForPath || connectionsForPath.some(
          (connection) => testEntityEntityAssociation(
            entity,
            path,
            connection.get('id'),
          ) && testEntityCategoryAssociation(
            connection,
            pathValue[1],
          )
        );
      },
    )
);

const checkQuery = ({
  queryValue,
  path,
  connectionAttribute,
  entity,
}) => {
  let value = queryValue;
  let connectionAttributeQuery;
  // check for connection attribute queries
  if (connectionAttribute && value.indexOf('>') > -1) {
    [value, connectionAttributeQuery] = value.split('>');
    const [attribute, values] = connectionAttributeQuery.split('=');
    connectionAttributeQuery = {
      attribute,
      values: values.split('|'),
    };
  }
  // check for type:id form
  // sometimes related entity ids are stored as [type]:[id]
  // ignore type
  if (value.indexOf(':') > -1) {
    [, value] = queryValue.split(':');
  }
  return entity.get(path)
    && testEntityEntityAssociation(
      entity,
      path,
      value,
      connectionAttribute,
      connectionAttributeQuery,
    );
};

// filter entities by by association with one or more entities of specific connection type
// assumes prior nesting of relationships
// - query: type:id>connectionAttribute=value
// - connectionAttributes: { path: 'indicatorConnections', id: 'indicator_id' }
export const filterEntitiesByConnection = (
  entities,
  query,
  path,
  connectionAttribute,
  any = true, // bool
) => entities && entities.filter(
  // consider replacing with .every()
  (entity) => any
    ? asList(query).some(
      (queryValue) => checkQuery({
        entity,
        queryValue,
        path,
        connectionAttribute,
      })
    )
    : asList(query).every(
      (queryValue) => checkQuery({
        entity,
        queryValue,
        path,
        connectionAttribute,
      })
    )
);
export const filterEntitiesByMultipleConnections = (
  entities,
  query,
  paths,
  any = true,
) => entities && entities.filter(
  // consider replacing with .every()
  (entity) => any
    ? asList(query).some(
      (queryArg) => {
        const [, value] = queryArg.split(':');
        return paths.some(
          (path) => entity.get(path) && testEntityEntityAssociation(entity, path, value)
        );
      },
    )
    : asList(query).every(
      (queryArg) => {
        const [, value] = queryArg.split(':');
        return paths.some(
          (path) => entity.get(path) && testEntityEntityAssociation(entity, path, value)
        );
      },
    )
);

const fieldEmpty = (entity, attribute) => !entity.getIn(['attributes', attribute])
  || qe(entity.getIn(['attributes', attribute]).trim(), '');

// query is object not string!
export const filterEntitiesByAttributes = (entities, query) => entities
  && entities.filter(
    (entity) => every(
      query,
      (value, attribute) => {
        switch (attribute) {
          case 'id':
            return qe(entity.get('id'), value);
          case 'email':
            switch (value) {
              case 'valid':
                return !fieldEmpty(entity, attribute)
                  && validateEmailFormat(entity.getIn(['attributes', 'email']));
              case 'invalid':
                return !fieldEmpty(entity, attribute)
                  && !validateEmailFormat(entity.getIn(['attributes', 'email']));
              case 'empty':
                return fieldEmpty(entity, attribute);
              default:
                return qe(entity.getIn(['attributes', attribute]), value);
            }
          default:
            return qe(entity.getIn(['attributes', attribute]), value);
        }
      },
    )
  );

// query is object not string!
export const filterEntitiesByConnectionAttributes = (entities, query) => entities
  && entities.filter(
    (entity) => every(
      query,
      (condition) => {
        // condition stored as object { path|att: value }
        // e.g. { 'indicatorConnections|supportlevel_id': '0' }
        const [path, att] = Object.keys(condition)[0].split('|');
        const value = Object.values(condition)[0];
        return entity.get(path) && entity.get(path).some(
          (connection) => qe(connection.get(att), value)
            || (qe(value, 0) && !connection.get(att))
        );
      },
    )
  );

export const filterEntitiesByKeywords = (
  entities,
  query,
  searchAttributes,
) => {
  try {
    const regex = new RegExp(regExMultipleWords(query), 'i');
    return entities && entities.filter(
      (entity) => regex.test(
        prepareEntitySearchTarget(
          entity,
          searchAttributes,
          query.length,
        )
      )
    );
  } catch (e) {
    return entities;
  }
};

export const entitiesSetCategoryIds = (
  entities,
  associationsGrouped,
  categories
) => entities && entities.map(
  (entity) => entity.set(
    'categories',
    getEntityCategories(
      parseInt(entity.get('id'), 10),
      associationsGrouped,
      categories,
    )
  )
);
const entitySetAssociated_NEW = (
  entity, // associated entity
  associations,
  key,
  // associationId,
) => {
  if (associations) {
    // console.log('entitySetAssociated', associations && associations.toJS())
    // console.log('entitySetAssociated', key)
    const entityAssociationKey = associations.findKey(
      (association) => qe(association.get(key), entity.get('id'))
    );
    // console.log('entitySetAssociated', entityAssociation && entityAssociation.toJS())
    if (entityAssociationKey) {
      return entity
        .set('associated', entityAssociationKey)
        .set('association', associations.get(entityAssociationKey));
    }
  }
  return entity.set('associated', false);
};
export const entitiesSetAssociated_NEW = (
  entities,
  associations,
  key,
) => entities && entities.map(
  (entity) => entitySetAssociated_NEW(
    entity,
    associations,
    key,
  ),
);
const entitySetAssociated = (
  entity, // associated entity
  associations,
  // associationId,
) => {
  if (associations) {
    const entityAssociationKey = associations.findKey(
      (association) => qe(association, entity.get('id'))
    );
    if (entityAssociationKey) {
      return entity.set('associated', entityAssociationKey);
    }
  }
  return entity.set('associated', false);
};
export const entitiesSetAssociated = (
  entities,
  associationsGrouped,
  associationId,
) => {
  const associations = associationsGrouped.get(
    parseInt(associationId, 10)
  );
  return entities && entities.map(
    (entity) => entitySetAssociated(
      entity,
      associations,
    ),
  );
};

const entitySetAssociatedCategory = (
  entityCategorised,
  categoryId,
) => {
  if (entityCategorised.get('categories')) {
    const associationKey = entityCategorised.get('categories').findKey(
      (id) => qe(id, categoryId)
    );
    return entityCategorised.set('associated', associationKey);
  }
  return entityCategorised.set('associated', false);
};
export const entitiesSetAssociatedCategory = (
  entitiesCategorised,
  categoryId,
) => entitiesCategorised && entitiesCategorised.map(
  (entity) => entitySetAssociatedCategory(entity, categoryId)
);

export const entitiesSetSingle = (
  entities,
  related,
  key,
  relatedKey,
) => entities && entities.map(
  (entity) => entitySetSingle(entity, related, key, relatedKey)
);

export const entitySetSingle = (
  entity,
  related,
  key,
  relatedKey,
) => entity
  && entity.set(
    key,
    related.find(
      (r) => qe(entity.getIn(['attributes', relatedKey]), r.get('id'))
    )
  );

export const entitySetUser = (entity, users) => entity
  && entitySetSingle(
    entitySetSingle(entity, users, 'creator', 'created_by_id'),
    users,
    'user',
    'updated_by_id',
  );

export const entitySetSingles = (entity, singles) => entity
  && singles.reduce(
    (memo, { related, key, relatedKey }) => entitySetSingle(
      memo,
      related,
      key,
      relatedKey,
    ),
    entity,
  );

// taxonomies or parent taxonomies
export const filterTaxonomiesTags = (
  taxonomies,
  tagsKey,
  includeParents = true,
) => taxonomies && taxonomies.filter(
  (tax, key, list) => tax.getIn(['attributes', tagsKey])
    && (
      includeParents
      // only non-parents
      || !list.some(
        (other) => other.getIn(['attributes', tagsKey])
          && qe(tax.get('id'), other.getIn(['attributes', 'parent_id']))
      )
    )
);
export const filterTaxonomies = (
  taxonomies,
  includeParents = true,
) => taxonomies && taxonomies.filter(
  (tax, key, list) => includeParents
    // only non-parents
    || !list.some(
      (otherTax) => qe(tax.get('id'), otherTax.getIn(['attributes', 'parent_id']))
    )
);

export const prepareTaxonomiesIsAssociated = (
  taxonomies,
  categories,
  associations,
  tagsKey,
  associationKey,
  associationId,
  includeParents = true,
) => {
  const filteredAssociations = associations && associations.filter(
    (association) => qe(
      association.getIn(['attributes', associationKey]),
      associationId
    )
  );
  const filteredTaxonomies = taxonomies && filterTaxonomies(
    taxonomies,
    includeParents,
  ).map(
    (tax) => tax.set(
      'tags',
      tax.getIn(['attributes', tagsKey])
      // set categories
    )
  );
  return filteredTaxonomies.map(
    (tax) => {
      const childTax = includeParents
        && taxonomies.find((potential) => qe(
          potential.getIn(['attributes', 'parent_id']),
          tax.get('id')
        ));
      return tax.set(
        'categories',
        categories.filter(
          (cat) => qe(
            cat.getIn(['attributes', 'taxonomy_id']),
            tax.get('id')
          )
        ).filter(
          (cat) => {
            const hasAssociations = filteredAssociations && filteredAssociations.some(
              (association) => qe(
                association.getIn(['attributes', 'category_id']),
                cat.get('id')
              )
            );
            if (hasAssociations) {
              return true;
            }
            if (!includeParents) {
              return false;
            }
            return childTax && categories.filter(
              (childCat) => qe(
                childCat.getIn(['attributes', 'taxonomy_id']),
                childTax.get('id'),
              )
            ).filter(
              (childCat) => qe(
                childCat.getIn(['attributes', 'parent_id']),
                cat.get('id'),
              )
            ).some(
              (child) => filteredAssociations && filteredAssociations.find(
                (association) => qe(
                  association.getIn(['attributes', 'category_id']),
                  child.get('id')
                )
              )
            ); // some
          }
        ) // filter
      ); // set
    },
  ); // map/return
};

const getTaxCategories = (categories, taxonomy, tagsKey) => categories.filter(
  (cat) => qe(
    cat.getIn(['attributes', 'taxonomy_id']),
    taxonomy.get('id')
  ) && (
    !cat.getIn(['attributes', 'user_only']) || tagsKey === 'tags_users'
  )
);

export const prepareTaxonomiesAssociated = (
  taxonomies,
  categories,
  associationsGrouped,
  tagsKey,
  associationId,
  includeParents = true,
) => taxonomies
  && filterTaxonomies(taxonomies, includeParents).map(
    (tax) => {
      const taxCategories = getTaxCategories(categories, tax, tagsKey);
      const catsAssociated = entitiesSetAssociated(
        taxCategories,
        associationsGrouped,
        associationId
      );
      return tax.set(
        'tags',
        tax.getIn(['attributes', tagsKey]),
      ).set('categories', catsAssociated);
    }
  );

// TODO deal with conflicts
export const prepareTaxonomiesMultipleTags = (
  taxonomies,
  categories,
  tagsKeys,
  includeParents = true,
) => reduce(
  tagsKeys,
  (memo, tagsKey) => memo.merge(
    prepareTaxonomiesTags(
      taxonomies,
      categories,
      tagsKey,
      includeParents,
    )
  ),
  Map(),
);
export const prepareTaxonomiesTags = (
  taxonomies,
  categories,
  tagsKey,
  includeParents = true,
) => taxonomies
  && filterTaxonomiesTags(taxonomies, tagsKey, includeParents).map(
    (tax) => {
      const taxCategories = getTaxCategories(categories, tax, tagsKey);
      return tax.set(
        'tags',
        tax.getIn(['attributes', tagsKey])
      ).set('categories', taxCategories);
    }
  );
export const prepareTaxonomies = (
  taxonomies,
  categories,
  includeParents = true,
) => taxonomies
  && filterTaxonomies(taxonomies, includeParents).map(
    (tax) => tax.set(
      'categories',
      getTaxCategories(categories, tax),
    )
  );

export const prepareCategory = (
  category,
  users,
  taxonomies,
) => {
  if (category) {
    const catWithTaxonomy = category.set(
      'taxonomy',
      taxonomies.find(
        (tax) => qe(
          category.getIn(['attributes', 'taxonomy_id']),
          tax.get('id')
        ),
      ),
    );
    return entitySetUser(
      catWithTaxonomy,
      users,
    );
  }
  return null;
};

export const usersByRole = (
  users,
  userRoles,
  roleId,
) => users && users.filter(
  (user) => {
    const roles = userRoles.filter(
      (association) => qe(
        association.getIn(['attributes', 'role_id']),
        roleId,
      ) && qe(
        association.getIn(['attributes', 'user_id']),
        user.get('id')
      )
    );
    return roles && roles.size > 0;
  }
);

export const getEntityTitle = (entity, labels, intl) => {
  if (labels && intl) {
    const label = find(labels, { value: parseInt(entity.get('id'), 10) });
    if (label && label.message) {
      return appMessage(intl, label.message);
    }
  }
  return entity.getIn(['attributes', 'title'])
    || entity.getIn(['attributes', 'name']);
};
export const getEntityTitleTruncated = (
  entity,
  labels,
  intl,
) => truncateText(
  getEntityTitle(entity, labels, intl),
  TEXT_TRUNCATE.META_TITLE,
);

export const getEntityReference = (entity, defaultToId = false) => defaultToId
  ? (
    entity.getIn(['attributes', 'reference'])
    || entity.getIn(['attributes', 'code'])
    || entity.getIn(['attributes', 'number'])
    || entity.get('id')
  )
  : (entity.getIn(['attributes', 'reference']) || entity.getIn(['attributes', 'code']) || null);

export const getCategoryShortTitle = (category) => truncateText(
  category.getIn(['attributes', 'short_title'])
  && category.getIn(['attributes', 'short_title']).trim().length > 0
    ? category.getIn(['attributes', 'short_title'])
    : (
      category.getIn(['attributes', 'title'])
      || category.getIn(['attributes', 'name'])
    ),
  TEXT_TRUNCATE.ENTITY_TAG
);

export const getCategoryTitle = (cat) => cat.getIn(['attributes', 'code'])
  ? `${cat.getIn(['attributes', 'code'])}. ${cat.getIn(['attributes', 'title']) || cat.getIn(['attributes', 'name'])}`
  : (cat.getIn(['attributes', 'title']) || cat.getIn(['attributes', 'name']));

export const getEntityParentId = (cat) => cat.getIn(['attributes', 'parent_id'])
  && cat.getIn(['attributes', 'parent_id']).toString();

export const getEntityCategories = (
  entityId,
  associationsGrouped,
  categories,
) => {
  if (!associationsGrouped) return Map();
  // directly associated categories
  const categoryIds = associationsGrouped.get(
    parseInt(entityId, 10)
  );

  // include parent categories of associated categories when categories present
  if (categories && categoryIds) {
    const parentCategoryIds = categoryIds.reduce(
      (memo, id, key) => {
        // if any of categories children
        const parentId = categories.getIn([
          id.toString(),
          'attributes',
          'parent_id',
        ]);
        return parentId
          ? memo.set(`${key}-${id}`, parseInt(parentId, 10))
          : memo;
      },
      Map(),
    );
    return categoryIds.merge(parentCategoryIds);
  }
  return categoryIds;
};

export const getTaxonomyCategories = (
  taxonomy,
  categories,
  relationship,
  groupedAssociations, // grouped by category
) => {
  if (!groupedAssociations) return null;
  const taxCategories = categories.filter(
    (category) => qe(
      category.getIn(['attributes', 'taxonomy_id']),
      taxonomy.get('id')
    )
  );
  return taxCategories.map(
    (category) => {
      let categoryAssocations = groupedAssociations.get(parseInt(category.get('id'), 10));

      // figure out child categories if not directly tagging connection
      const childCategories = categories.filter(
        (item) => qe(
          category.get('id'),
          item.getIn(['attributes', 'parent_id']),
        ),
      );
      if (childCategories && childCategories.size > 0) {
        categoryAssocations = childCategories.reduce(
          (memo, child) => {
            if (!groupedAssociations.get(parseInt(child.get('id'), 10))) {
              return memo;
            }
            return memo.merge(
              groupedAssociations.get(parseInt(child.get('id'), 10))
            );
          },
          categoryAssocations || Map(),
        );
      }
      return categoryAssocations
        ? category.set(
          relationship.path,
          // consider reduce for combined filter and map
          categoryAssocations.map(
            (association) => association.getIn(['attributes', relationship.key])
          )
        )
        : category;
    }
  );
};


const checkAttribute = ({
  typeId,
  att,
  attributes,
  isAdmin,
}) => {
  if (typeId && attributes && attributes[att]) {
    if (attributes[att].adminOnly && !isAdmin
    ) {
      return false;
    }
    if (attributes[att].adminOnlyForTypes
      && attributes[att].adminOnlyForTypes.indexOf(typeId.toString()) > -1
      && !isAdmin
    ) {
      return false;
    }
    if (attributes[att].optional) {
      return Array.isArray(attributes[att].optional)
        ? attributes[att].optional.indexOf(typeId.toString()) > -1
        : attributes[att].optional;
    }
    if (attributes[att].required) {
      return Array.isArray(attributes[att].required)
        ? attributes[att].required.indexOf(typeId.toString()) > -1
        : attributes[att].required;
    }
  } else if (!typeId && attributes && attributes[att]) {
    if (attributes[att].adminOnly && !isAdmin) {
      return false;
    }
    if (attributes[att].optional) {
      return !!attributes[att].optional;
    }
    if (attributes[att].required) {
      return !!attributes[att].required;
    }
  }
  return false;
};

const checkRequired = ({ typeId, att, attributes }) => {
  if (typeId && attributes && attributes[att] && attributes[att].required) {
    return typeof attributes[att].required === 'boolean'
      ? attributes[att].required
      : attributes[att].required.indexOf(typeId.toString()) > -1;
  }
  return false;
};
export const checkActionAttribute = (typeId, att, isAdmin) => ACTION_FIELDS
  && ACTION_FIELDS.ATTRIBUTES
  && checkAttribute({
    typeId,
    att,
    attributes: ACTION_FIELDS.ATTRIBUTES,
    isAdmin,
  });
export const checkIndicatorAttribute = (att, isAdmin) => INDICATOR_FIELDS
  && INDICATOR_FIELDS.ATTRIBUTES
  && checkAttribute({
    att,
    attributes: INDICATOR_FIELDS.ATTRIBUTES,
    isAdmin,
  });

export const checkActionRequired = (typeId, att) => ACTION_FIELDS
  && ACTION_FIELDS.ATTRIBUTES
  && checkRequired({
    typeId,
    att,
    attributes: ACTION_FIELDS.ATTRIBUTES,
  });

export const checkActorAttribute = (typeId, att, isAdmin) => ACTOR_FIELDS
  && ACTOR_FIELDS.ATTRIBUTES
  && checkAttribute({
    typeId,
    att,
    attributes: ACTOR_FIELDS.ATTRIBUTES,
    isAdmin,
  });

export const checkActorRequired = (typeId, att) => ACTOR_FIELDS
  && ACTOR_FIELDS.ATTRIBUTES
  && checkRequired({
    typeId,
    att,
    attributes: ACTOR_FIELDS.ATTRIBUTES,
  });
export const checkIndicatorRequired = (att) => INDICATOR_FIELDS
  && INDICATOR_FIELDS.ATTRIBUTES
  && checkRequired({
    att,
    attributes: INDICATOR_FIELDS.ATTRIBUTES,
  });
export const checkResourceAttribute = (typeId, att) => RESOURCE_FIELDS
  && RESOURCE_FIELDS.ATTRIBUTES
  && checkAttribute({
    typeId,
    att,
    attributes: RESOURCE_FIELDS.ATTRIBUTES,
  });

export const checkResourceRequired = (typeId, att) => RESOURCE_FIELDS
  && RESOURCE_FIELDS.ATTRIBUTES
  && checkRequired({
    typeId,
    att,
    attributes: RESOURCE_FIELDS.ATTRIBUTES,
  });

export const hasGroupActors = (actortypesForActiontype) => actortypesForActiontype
  && actortypesForActiontype.some(
    (type) => type.getIn(['attributes', 'has_members'])
  );


export const setActionConnections = ({
  action,
  actionConnections,
  actorActions, // as active actor
  actionActors, // as passive target of action
  actionResources,
  actionIndicators,
  actionIndicatorAttributes,
  categories,
  actionCategories,
  users,
}) => {
  const actionId = parseInt(action.get('id'), 10);
  // actors
  const entityActors = actorActions && actorActions.get(actionId);
  const entityActorsByActortype = entityActors
    && actionConnections.get(API.ACTORS)
    && entityActors
      .filter((actorId) => actionConnections.getIn([API.ACTORS, actorId.toString()]))
      .groupBy((actorId) => actionConnections.getIn([API.ACTORS, actorId.toString(), 'attributes', 'actortype_id']).toString())
      .sortBy((val, key) => key);
  // actors
  const entityTargets = actionActors && actionActors.get(actionId);
  const entityTargetsByActortype = entityTargets
    && actionConnections.get(API.ACTORS)
    && entityTargets
      .filter((actorId) => actionConnections.getIn([API.ACTORS, actorId.toString()]))
      .groupBy((actorId) => actionConnections.getIn([API.ACTORS, actorId.toString(), 'attributes', 'actortype_id']).toString())
      .sortBy((val, key) => key);
  // resources
  const entityResources = actionResources && actionResources.get(actionId);
  const entityResourcesByResourcetype = entityResources
    && actionConnections.get(API.RESOURCES)
    && entityResources
      .filter((resId) => actionConnections.getIn([API.RESOURCES, resId.toString()]))
      .groupBy((resId) => actionConnections.getIn([API.RESOURCES, resId.toString(), 'attributes', 'resourcetype_id']).toString())
      .sortBy((val, key) => key);
  // indicators
  const entityIndicators = actionIndicators
    && actionIndicators.get(actionId)
    && actionConnections.get(API.INDICATORS)
    && actionIndicators
      .get(actionId)
      .filter((id) => actionConnections.getIn([API.INDICATORS, id.toString()]))
      .sortBy((val, key) => key);
  // users
  const entityUsers = users
    && users.get(actionId)
    && actionConnections.get(API.USERS)
    && users
      .get(actionId)
      .filter((id) => actionConnections.getIn([API.USERS, id.toString()]))
      .sortBy((val, key) => key);

  // categories
  const entityCategories = getEntityCategories(
    action.get('id'),
    actionCategories,
    categories,
  );
  return action
    .set('categories', entityCategories)
    .set('actorsByType', entityActorsByActortype)
    .set('targetsByType', entityTargetsByActortype)
    .set('resourcesByType', entityResourcesByResourcetype)
    .set('indicators', entityIndicators)
    .set('indicatorConnections', actionIndicatorAttributes && actionIndicatorAttributes.get(parseInt(action.get('id'), 10)))
    .set('users', entityUsers);
};

export const setActorConnections = ({
  actor,
  actorConnections,
  actorActions,
  actionActors,
  categories,
  actorCategories,
  memberships,
  associations,
  users,
}) => {
  const actorId = parseInt(actor.get('id'), 10);
  if (!actorConnections) return actor;
  // actors
  const entityActions = actorActions && actorActions.get(actorId);
  const entityActionsByActiontype = entityActions
    && actorConnections.get(API.ACTIONS)
    && entityActions
      .filter((actionId) => actorConnections.getIn([API.ACTIONS, actionId.toString()]))
      .groupBy((actionId) => actorConnections.getIn([API.ACTIONS, actionId.toString(), 'attributes', 'measuretype_id']).toString())
      .sortBy((val, key) => key);

  // targets
  const entityTargetingActions = actionActors && actionActors.get(actorId);
  const entityTargetingActionsByType = entityTargetingActions
    && actorConnections.get(API.ACTIONS)
    && entityTargetingActions
      .filter((actionId) => actorConnections.getIn([API.ACTIONS, actionId.toString()]))
      .groupBy((actionId) => actorConnections.getIn([API.ACTIONS, actionId.toString(), 'attributes', 'measuretype_id']).toString())
      .sortBy((val, key) => key);

  // memberships
  const entityMembers = associations && associations.get(actorId);
  const entityMembersByActortype = entityMembers
    && actorConnections.get(API.ACTORS)
    && entityMembers
      .filter((localActorId) => actorConnections.getIn([API.ACTORS, localActorId.toString()]))
      .groupBy((localActorId) => actorConnections.getIn([API.ACTORS, localActorId.toString(), 'attributes', 'actortype_id']).toString())
      .sortBy((val, key) => key);

  // assocciations
  const entityAssociations = memberships && memberships.get(actorId);
  const entityAssociationsByActortype = entityAssociations
    && actorConnections.get(API.ACTORS)
    && entityAssociations
      .filter((localActorId) => actorConnections.getIn([API.ACTORS, localActorId.toString()]))
      .groupBy((localActorId) => actorConnections.getIn([API.ACTORS, localActorId.toString(), 'attributes', 'actortype_id']).toString())
      .sortBy((val, key) => key);

  // users
  const entityUsers = users
    && users.get(actorId)
    && actorConnections.get(API.USERS)
    && users
      .get(actorId)
      .filter((id) => actorConnections.getIn([API.USERS, id.toString()]))
      .sortBy((val, key) => key);

  // categories
  const entityCategories = getEntityCategories(
    actor.get('id'),
    actorCategories,
    categories,
  );

  return actor
    .set('categories', entityCategories)
    .set('actionsByType', entityActionsByActiontype)
    .set('targetingActionsByType', entityTargetingActionsByType)
    .set('membersByType', entityMembersByActortype)
    .set('associationsByType', entityAssociationsByActortype)
    .set('users', entityUsers);
};

export const setResourceConnections = ({
  resource,
  resourceConnections,
  actionResources,
}) => {
  // actors
  const entityActions = actionResources.get(parseInt(resource.get('id'), 10));
  const entityActionsByActiontype = entityActions
    && resourceConnections.get(API.ACTIONS)
    && entityActions
      .filter((actionId) => resourceConnections.getIn([API.ACTIONS, actionId.toString()]))
      .groupBy((actionId) => resourceConnections.getIn([API.ACTIONS, actionId.toString(), 'attributes', 'measuretype_id']).toString())
      .sortBy((val, key) => key);

  return resource.set('actionsByType', entityActionsByActiontype);
};

export const setIndicatorConnections = ({
  indicator,
  indicatorConnections,
  actionIndicators,
}) => {
  // actors
  const entityActions = actionIndicators.get(parseInt(indicator.get('id'), 10));
  const entityActionsByActiontype = entityActions
    && indicatorConnections.get(API.ACTIONS)
    && entityActions
      .filter((actionId) => indicatorConnections.getIn([API.ACTIONS, actionId.toString()]))
      .groupBy((actionId) => indicatorConnections.getIn([API.ACTIONS, actionId.toString(), 'attributes', 'measuretype_id']).toString())
      .sortBy((val, key) => key);

  return indicator.set('actionsByType', entityActionsByActiontype);
};
export const setUserConnections = ({
  user,
  userConnections,
  userActions,
  userActors,
}) => {
  // actions
  const entityActions = userActions && userActions.get(parseInt(user.get('id'), 10));
  const entityActionsByActiontype = entityActions
    && userConnections.get(API.ACTIONS)
    && entityActions
      .filter((actionId) => userConnections.getIn([API.ACTIONS, actionId.toString()]))
      .groupBy((actionId) => userConnections.getIn([API.ACTIONS, actionId.toString(), 'attributes', 'measuretype_id']).toString())
      .sortBy((val, key) => key);
  // actors
  const entityActors = userActors && userActors.get(parseInt(user.get('id'), 10));
  const entityActorsByActortype = entityActors
    && userConnections.get(API.ACTORS)
    && entityActors
      .filter((actorId) => userConnections.getIn([API.ACTORS, actorId.toString()]))
      .groupBy((actorId) => userConnections.getIn([API.ACTORS, actorId.toString(), 'attributes', 'actortype_id']).toString())
      .sortBy((val, key) => key);

  return user
    .set('actionsByType', entityActionsByActiontype)
    .set('actorsByType', entityActorsByActortype);
};

export const getActiontypeColumns = ({
  typeId,
  viewSubject,
  isAdmin,
  otherColumns,
  skipTypeColumns,
  isSingle = true,
  includeMain = true,
}) => {
  let columns = includeMain
    ? [{
      id: 'main',
      type: 'main',
      sort: 'title',
      attributes: isAdmin ? ['code', 'title'] : ['title'],
    }]
    : [];

  if (
    !skipTypeColumns
    && ACTIONTYPES_CONFIG[parseInt(typeId, 10)]
    && ACTIONTYPES_CONFIG[parseInt(typeId, 10)].columns
  ) {
    const typeColumns = ACTIONTYPES_CONFIG[parseInt(typeId, 10)].columns.filter(
      (col) => {
        if (isSingle && typeof col.showOnSingle !== 'undefined') {
          if (viewSubject && Array.isArray(col.showOnSingle)) {
            return col.showOnSingle.indexOf(viewSubject) > -1;
          }
          return col.showOnSingle;
        }
        return true;
      }
    );
    columns = [
      ...columns,
      ...typeColumns,
    ];
  }
  // e.g. supportlevel
  if (otherColumns) {
    columns = [
      ...columns,
      ...otherColumns,
    ];
  }
  return columns;
};

export const getActortypeColumns = ({
  typeId,
  showCode,
  otherColumns,
  includeMain = true,
  skipTypeColumns,
  isSingle = true,
}) => {
  let columns = includeMain
    ? [{
      id: 'main',
      type: 'main',
      sort: 'title',
      attributes: showCode ? ['code', 'title'] : ['title'],
    }]
    : [];
  if (
    !skipTypeColumns
    && ACTORTYPES_CONFIG[parseInt(typeId, 10)]
    && ACTORTYPES_CONFIG[parseInt(typeId, 10)].columns
  ) {
    const typeColumns = ACTORTYPES_CONFIG[parseInt(typeId, 10)].columns.filter(
      (col) => {
        if (isSingle && typeof col.showOnSingle !== 'undefined') {
          return col.showOnSingle;
        }
        return true;
      }
    );
    columns = [
      ...columns,
      ...typeColumns,
    ];
  }
  if (otherColumns) {
    columns = [
      ...columns,
      ...otherColumns,
    ];
  }
  return columns;
};
