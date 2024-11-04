import { truncateText } from 'utils/string';
import { sortEntities, sortCategories } from 'utils/sort';
import {
  getEntityTitle,
  checkActionAttribute,
  checkActorAttribute,
  checkIndicatorAttribute,
  getIndicatorColumnsForStatement,
  getActortypeColumns,
} from 'utils/entities';
import isNumber from 'utils/is-number';
import qe from 'utils/quasi-equals';

import {
  USER_ROLES,
  TEXT_TRUNCATE,
  ROUTES,
  API,
  ACTION_FIELDS,
  ACTOR_FIELDS,
  RESOURCE_FIELDS,
  INDICATOR_FIELDS,
} from 'themes/config';

import appMessages from 'containers/App/messages';

export const roundNumber = (value, digits = 0) => {
  const factor = 10 ** Math.min(digits, 3);
  return isNumber(value) && Math.round(value * factor) / factor;
};
export const formatNumber = (value, args = {}) => {
  const {
    intl, digits, unit, unitBefore,
  } = args;
  let formatted = value;
  if (isNumber(value)) {
    const rounded = roundNumber(value, digits);
    formatted = intl
      ? intl.formatNumber(rounded, { minimumFractionDigits: digits })
      : rounded.toFixed(digits);
  }
  if (unit && unit.trim() !== '') {
    return unitBefore
      ? `${unit} ${formatted}`
      : `${formatted} ${unit}`;
  }
  return formatted;
};

export const checkEmpty = (
  val
) => typeof val !== 'undefined' && val !== null && val.toString().trim().length > 0;

export const getInfoField = (att, value, large = false) => checkEmpty(value) && ({
  controlType: 'info',
  value,
  large,
  label: appMessages.attributes[att],
});
export const getIdField = (entity) => checkEmpty(entity.get('id')) && ({
  controlType: 'info',
  type: 'reference',
  value: entity.get('id'),
  large: true,
  label: appMessages.attributes.id,
});
export const getReferenceField = (entity, att, isAdmin) => {
  const value = att
    ? entity.getIn(['attributes', 'reference']) || entity.getIn(['attributes', att])
    : entity.getIn(['attributes', 'reference']);
  if (checkEmpty(value)) {
    return ({
      controlType: 'info',
      type: 'reference',
      value,
      large: true,
      isAdmin,
    });
  }
  return false;
};
const getLinkAnchor = (url) => truncateText(url.replace(/^https?:\/\//i, ''), TEXT_TRUNCATE.LINK_FIELD);

export const getLinkField = (
  entity
) => checkEmpty(entity.getIn(['attributes', 'url'])) && ({
  type: 'link',
  value: entity.getIn(['attributes', 'url']),
  anchor: getLinkAnchor(entity.getIn(['attributes', 'url'])),
});
export const getEntityLinkField = (
  entity,
  path,
  label,
  labelFormatted,
) => checkEmpty(entity.getIn(['attributes', 'title']) || entity.getIn(['attributes', 'name'])) && ({
  type: 'link',
  internal: true,
  value: `${path}/${entity.get('id')}`,
  anchor: entity.getIn(['attributes', 'title']) || entity.getIn(['attributes', 'name']),
  label,
  labelFormatted,
});

export const getTitleField = (
  entity, isMember, attribute = 'title', label
) => checkEmpty(entity.getIn(['attributes', attribute])) && ({
  type: 'title',
  value: entity.getIn(['attributes', attribute]),
  isMember,
  label,
});
export const getTitleTextField = (
  entity, isMember, attribute = 'title', label
) => checkEmpty(entity.getIn(['attributes', attribute])) && ({
  type: 'titleText',
  value: entity.getIn(['attributes', attribute]),
  isMember,
  label,
});
export const getStatusField = (
  entity,
  attribute = 'draft',
  options,
  label,
  defaultValue = true,
) => (defaultValue || checkEmpty(entity.getIn(['attributes', attribute]))) && ({
  controlType: 'info',
  type: 'status',
  attribute,
  value: (
    entity
    && entity.getIn(['attributes', attribute]) !== null
    && typeof entity.getIn(['attributes', attribute]) !== 'undefined'
  )
    ? entity.getIn(['attributes', attribute])
    : defaultValue,
  options,
  label,
});
export const getStatusFieldIf = ({
  entity,
  attribute = 'draft',
  options,
  label,
  defaultValue = true,
  ifValue = true,
}) => {
  if (entity.getIn(['attributes', attribute]) === ifValue) {
    return getStatusField(
      entity,
      attribute,
      options,
      label,
      defaultValue,
    );
  }
  return null;
};

// only show the highest rated role (lower role ids means higher)
// const getHighestUserRoleId = (roles) => roles.reduce(
//   (memo, role) => role && role.get('id') < memo ? role.get('id') : memo,
//   USER_ROLES.DEFAULT.value
// );
//

// only show the highest rated role (lower role ids means higher)
export const getHighestUserRoleId = (roles) => roles.reduce(
  (currentHighestRoleId, role) => {
    if (role) {
      const theRole = Object.values(USER_ROLES).find((r) => qe(r.value, parseInt(role.get('id'), 10)));
      const highestRole = Object.values(USER_ROLES).find((r) => qe(r.value, parseInt(currentHighestRoleId, 10)));
      return theRole.order < highestRole.order
        ? role.get('id')
        : currentHighestRoleId;
    }
    return currentHighestRoleId;
  },
  USER_ROLES.DEFAULT.value
);

export const getRoleField = (entity) => ({
  controlType: 'info',
  type: 'role',
  value: entity.get('roles') && getHighestUserRoleId(entity.get('roles')),
  options: Object.values(USER_ROLES),
});

export const getMetaField = (entity, includeRelationshipUpdatedAt) => {
  const fields = [];

  // creation
  fields.push({
    label: appMessages.attributes.created_at,
    value: entity.getIn(['attributes', 'created_at']),
    date: true,
  });
  if (entity.get('creator') && entity.getIn(['creator', 'attributes', 'name'])) {
    fields.push({
      label: appMessages.attributes.created_by_id,
      value: entity.getIn(['creator', 'attributes', 'name']),
    });
  }
  // updated
  const updated = entity.getIn(['attributes', 'updated_at']);
  const updatedRelationship = entity.getIn(['attributes', 'relationship_updated_at']);
  const hasUpdated = updated && updated.trim() !== '';
  const hasUpdatedRelationship = updatedRelationship && updatedRelationship.trim() !== '';
  const updatedEarlier = new Date(updatedRelationship) < new Date(updated);
  if (
    hasUpdated
    && (
      !hasUpdatedRelationship
      || updatedEarlier
      || !includeRelationshipUpdatedAt
    )
  ) {
    fields.push({
      label: appMessages.attributes.updated_at,
      value: entity.getIn(['attributes', 'updated_at']),
      date: true,
      time: true,
    });
    if (entity.get('user') && entity.getIn(['user', 'attributes', 'name'])) {
      fields.push({
        label: appMessages.attributes.updated_by_id,
        value: entity.getIn(['user', 'attributes', 'name']),
      });
    }
  } else if (includeRelationshipUpdatedAt && hasUpdatedRelationship) {
    // updated connections
    fields.push({
      label: appMessages.attributes.updated_at,
      value: entity.getIn(['attributes', 'relationship_updated_at']),
      date: true,
      time: true,
    });
    if (entity.get('userRelationship') && entity.getIn(['userRelationship', 'attributes', 'name'])) {
      fields.push({
        label: appMessages.attributes.updated_by_id,
        value: entity.getIn(['userRelationship', 'attributes', 'name']),
      });
    }
  }
  return {
    controlType: 'info',
    type: 'meta',
    fields,
  };
};

export const getMarkdownField = (
  entity,
  attribute,
  hasLabel = true,
  label,
) => checkEmpty(entity.getIn(['attributes', attribute])) && ({
  type: 'markdown',
  value: entity.getIn(['attributes', attribute]),
  label: hasLabel && (appMessages.attributes[label || attribute]),
});

export const getNumberField = (
  entity,
  attribute,
  args = {},
) => {
  const { showEmpty, emptyMessage, ...otherArgs } = args;
  return (showEmpty || checkEmpty(entity.getIn(['attributes', attribute]))) && ({
    type: 'number',
    value: !!entity.getIn(['attributes', attribute]) && entity.getIn(['attributes', attribute]),
    label: appMessages.attributes[attribute],
    showEmpty: showEmpty && (emptyMessage || appMessages.attributes[`${attribute}_empty`]),
    ...otherArgs,
  });
};

export const getDateField = (
  entity,
  attribute,
  args = {},
) => {
  const {
    showEmpty,
    emptyMessage,
    specificity,
    attributeLabel,
    fallbackAttribute,
    fallbackAttributeLabel,
  } = args;
  let value = entity.getIn(['attributes', attribute]);
  let label = appMessages.attributes[attributeLabel || attribute];
  if (!checkEmpty(value) && fallbackAttribute) {
    value = entity.getIn(['attributes', fallbackAttribute]);
    label = appMessages.attributes[fallbackAttributeLabel || attribute];
  }
  return (showEmpty || checkEmpty(value)) && ({
    type: 'date',
    value: !!value && value,
    label,
    showEmpty: showEmpty && (emptyMessage || appMessages.attributes[`${attribute}_empty`]),
    specificity: specificity || 'd',
  });
};

export const getDateRelatedField = (
  value,
  attribute,
  showEmpty,
  emptyMessage,
) => (showEmpty || checkEmpty(value)) && ({
  type: 'date',
  value: !!value && value,
  label: appMessages.attributes[attribute],
  showEmpty: showEmpty && (emptyMessage || appMessages.attributes[`${attribute}_empty`]),
});

export const getTextField = (
  entity,
  attribute,
) => checkEmpty(entity.getIn(['attributes', attribute])) && ({
  type: 'text',
  value: entity.getIn(['attributes', attribute]),
  label: appMessages.attributes[attribute],
});

const mapCategoryOptions = (categories, taxId) => categories
  ? sortCategories(categories, taxId)
    .map((cat) => ({
      label: cat.getIn(['attributes', 'title']),
      info: cat.getIn(['attributes', 'description']),
      reference: cat.getIn(['attributes', 'reference']) || null,
      draft: cat.getIn(['attributes', 'draft']) || null,
      linkTo: `${ROUTES.CATEGORY}/${cat.get('id')}`,
    }))
    .valueSeq().toArray()
  : [];

export const getTaxonomyFields = (taxonomies) => taxonomies
  && sortEntities(
    taxonomies,
    'asc',
    'priority',
  ).map(
    (taxonomy) => ({
      type: 'taxonomy',
      label: appMessages.entities.taxonomies[taxonomy.get('id')].plural,
      info: appMessages.entities.taxonomies[taxonomy.get('id')].description,
      entityType: 'taxonomies',
      id: taxonomy.get('id'),
      values: mapCategoryOptions(taxonomy.get('categories'), taxonomy.get('id')),
    })
  ).valueSeq().toArray();

export const hasTaxonomyCategories = (taxonomies) => taxonomies
  ? taxonomies.reduce((memo, taxonomy) => memo || (taxonomy.get('categories') && taxonomy.get('categories').size > 0), false)
  : false;

const getCategoryShortTitle = (category) => {
  const title = (
    category.getIn(['attributes', 'short_title'])
    && (category.getIn(['attributes', 'short_title']).trim().length > 0)
  )
    ? category.getIn(['attributes', 'short_title'])
    : category.getIn(['attributes', 'title']);
  return truncateText(title, TEXT_TRUNCATE.ENTITY_TAG);
};

export const getCategoryShortTitleField = (entity) => ({
  type: 'short_title',
  value: getCategoryShortTitle(entity),
  inverse: entity.getIn(['attributes', 'draft']),
  taxonomyId: entity.getIn(['attributes', 'taxonomy_id']),
});

const getConnectionField = ({
  entities,
  taxonomies,
  connections,
  connectionOptions,
  entityType,
  entityIcon,
  entityPath,
  onEntityClick,
  skipLabel,
  showValueForAction,
  columns,
  isGrouped,
  onCreate,
  moreLess = true,
}) => ({
  type: 'connections',
  values: entities && entities.toList(),
  taxonomies,
  connections,
  entityType,
  entityIcon,
  entityPath: entityPath || entityType,
  onEntityClick,
  showEmpty: appMessages.entities[entityType].empty,
  connectionOptions,
  skipLabel,
  isGrouped,
  showValueForAction,
  columns: columns || [{
    id: 'main',
    type: 'main',
    sort: 'title',
    attributes: ['code', 'title'],
  }],
  onCreate,
  moreLess,
});

export const getActorConnectionField = ({
  actors,
  taxonomies,
  connections,
  onEntityClick,
  typeid, // actortype id
  skipLabel,
  connectionOptions,
  showValueForAction,
  columns,
}) => getConnectionField({
  entities: actors && sortEntities(actors, 'asc', 'id'),
  taxonomies,
  connections,
  connectionOptions: connectionOptions || {
    actions: {
      message: 'entities.actions_{typeid}.plural',
      entityType: 'actions',
      path: API.ACTIONS,
      clientPath: ROUTES.ACTION,
      groupByType: true,
    },
    targets: {
      message: 'entities.actions_{typeid}.plural',
      entityType: 'actions',
      entityTypeAs: 'targetingActions',
      path: API.ACTIONS,
      clientPath: ROUTES.ACTION,
      groupByType: true,
    },
    members: {
      message: 'entities.actors_{typeid}.plural',
      entityType: 'actors',
      entityTypeAs: 'members',
      path: API.ACTORS,
      clientPath: ROUTES.ACTOR,
      groupByType: true,
    },
    associations: {
      message: 'entities.actors_{typeid}.plural',
      entityType: 'actors',
      entityTypeAs: 'associations',
      path: API.ACTORS,
      clientPath: ROUTES.ACTOR,
      groupByType: true,
    },
    users: {
      message: 'entities.users.plural',
      entityType: 'users',
      path: API.USERS,
      clientPath: ROUTES.USER,
    },
  },
  entityType: typeid ? `actors_${typeid}` : 'actors',
  entityPath: ROUTES.ACTOR,
  onEntityClick,
  skipLabel,
  showValueForAction,
  columns,
  isGrouped: true,
});

export const getActionConnectionField = ({
  actions,
  taxonomies,
  connections,
  onEntityClick,
  typeid, // actortype id
  skipLabel,
  connectionOptions,
  columns,
  onCreateOption,
}) => getConnectionField({
  entities: sortEntities(actions, 'asc', 'id'),
  taxonomies,
  connections,
  connectionOptions: connectionOptions || {
    indicators: {
      message: 'entities.indicators.plural',
      entityType: 'indicators',
      path: API.INDICATORS,
      clientPath: ROUTES.INDICATOR,
    },
    actors: {
      message: 'entities.actors_{typeid}.plural',
      entityType: 'actors',
      path: API.ACTORS,
      clientPath: ROUTES.ACTOR,
      groupByType: true,
    },
    targets: {
      message: 'entities.actors_{typeid}.plural',
      entityType: 'actors',
      entityTypeAs: 'targets',
      path: API.ACTORS,
      clientPath: ROUTES.ACTOR,
      groupByType: true,
    },
    resources: {
      message: 'entities.resources_{typeid}.plural',
      entityType: 'resources',
      path: API.RESOURCES,
      clientPath: ROUTES.RESOURCE,
      groupByType: true,
    },
    users: {
      message: 'entities.users.plural',
      entityType: 'users',
      path: API.USERS,
      clientPath: ROUTES.USER,
    },
  },
  entityType: typeid ? `actions_${typeid}` : 'actions',
  entityPath: ROUTES.ACTION,
  onEntityClick,
  skipLabel,
  columns,
  isGrouped: true,
  onCreate: onCreateOption || null,
});

export const getResourceConnectionField = ({
  resources,
  connections,
  onEntityClick,
  typeid, // actortype id
  skipLabel,
  connectionOptions,
  columns,
}) => getConnectionField({
  entities: sortEntities(resources, 'asc', 'id'),
  connections,
  connectionOptions: connectionOptions || {
    actions: {
      message: 'entities.actions_{typeid}.plural',
      entityType: 'actions',
      path: API.ACTIONS,
      clientPath: ROUTES.ACTION,
      groupByType: true,
    },
  },
  entityType: typeid ? `resources_${typeid}` : 'resources',
  entityPath: ROUTES.RESOURCE,
  onEntityClick,
  skipLabel,
  columns,
  isGrouped: true,
});
export const getIndicatorConnectionField = ({
  indicators,
  connections,
  onEntityClick,
  skipLabel,
  connectionOptions,
  columns,
  moreLess,
}) => getConnectionField({
  entities: sortEntities(indicators, 'asc', 'id'),
  connections,
  connectionOptions: connectionOptions || {
    actions: {
      message: 'entities.actions_{typeid}.plural',
      entityType: 'actions',
      path: API.ACTIONS,
      clientPath: ROUTES.ACTION,
    },
  },
  entityType: 'indicators',
  entityPath: ROUTES.INDICATOR,
  onEntityClick,
  skipLabel,
  columns,
  moreLess,
});
export const getUserConnectionField = ({
  users,
  connections,
  onEntityClick,
  skipLabel,
  connectionOptions,
  columns,
}) => getConnectionField({
  entities: sortEntities(users, 'asc', 'name'),
  connections,
  connectionOptions: connectionOptions || {
    actions: {
      message: 'entities.actions_{typeid}.plural',
      entityType: 'actions',
      path: API.ACTIONS,
      clientPath: ROUTES.ACTION,
    },
    actors: {
      message: 'entities.actors_{typeid}.plural',
      entityType: 'actors',
      path: API.ACTORS,
      clientPath: ROUTES.ACTOR,
    },
  },
  entityType: 'users',
  entityPath: ROUTES.USER,
  onEntityClick,
  skipLabel,
  columns: columns || [{
    id: 'main',
    type: 'main',
    sort: 'title',
    attributes: ['name'],
  }],
});

export const getManagerField = (entity, messageLabel, messageEmpty) => ({
  label: messageLabel,
  type: 'manager',
  value: entity.get('manager') && entity.getIn(['manager', 'attributes', 'name']),
  showEmpty: messageEmpty,
});

export const getEmailField = (entity) => ({
  type: 'email',
  value: entity.getIn(['attributes', 'email']),
});

export const getActionPreviewHeader = (action, intl) => ({
  aboveTitle: intl.formatMessage(
    appMessages.entities[`actions_${action.getIn(['attributes', 'measuretype_id'])}`].single
  ),
  path: `${ROUTES.ACTION}/${action.get('id')}`,
  title: getEntityTitle(action),
  code: checkActionAttribute(action, 'code'),
});
export const getActionPreviewFooter = (action, intl) => {
  const typeId = action && action.getIn(['attributes', 'measuretype_id']);
  return ({
    primaryLink: action && {
      path: `${ROUTES.ACTION}/${action.get('id')}`,
      title: `${intl.formatMessage(
        appMessages.entities[`actions_${typeId}`].single
      )} details`,
    },
    secondaryLink: {
      path: `${ROUTES.ACTIONS}/${typeId}`,
      title: `All ${intl.formatMessage(
        appMessages.entities[`actions_${typeId}`].plural
      )}`,
    },
  });
};
export const getActionPreviewFields = ({
  action,
  actorsByType,
  indicators,
  categories,
  actorConnections,
  taxonomies,
  onEntityClick,
  intl,
  isAdmin,
}) => {
  let fields = [];
  fields = Object.keys(ACTION_FIELDS.ATTRIBUTES).reduce(
    (memo, key) => {
      const attribute = ACTION_FIELDS.ATTRIBUTES[key];
      if (
        action
        && attribute.preview
        && attribute.preview.indexOf(`${action.getIn(['attributes', 'measuretype_id'])}`) > -1
      ) {
        if (key === 'date_start') {
          return [
            ...memo,
            getDateField(action, key, { showEmpty: false }),
          ];
        }
      }
      return memo;
    },
    [],
  );
  if (ACTION_FIELDS.CONNECTIONS) {
    fields = Object.keys(ACTION_FIELDS.CONNECTIONS).reduce(
      (memo, key) => {
        const connection = ACTION_FIELDS.CONNECTIONS[key];
        if (
          action
          && indicators
          && key === 'indicators'
          && connection.preview
          && connection.preview.indexOf(`${action.getIn(['attributes', 'measuretype_id'])}`) > -1
        ) {
          // console.log('indicators', indicators && indicators.toJS())
          const field = getIndicatorConnectionField({
            indicators,
            onEntityClick,
            columns: getIndicatorColumnsForStatement({
              action,
              intl,
              isAdmin,
            }),
            moreLess: false,
          });
          return [
            ...memo,
            field,
          ];
        }
        if (action
          && categories
          && key === 'categories') {
          return [...memo, ...getTaxonomyFields(categories)];
        }
        if (action
          && actorsByType
          && key === 'actors') {
          return actorsByType.reduce(
            (memo2, actors, typeid) => {
              if (actors) {
                return [...memo2,
                  getActorConnectionField({
                    actors,
                    taxonomies,
                    onEntityClick,
                    connections: actorConnections,
                    typeid,
                    columns: getActortypeColumns({
                      typeId: typeid,
                      showCode: checkActorAttribute(typeid, 'code', isAdmin),
                    }),
                  }),
                ];
              }
              return memo2;
            }, memo
          );
        }
        return memo;
      },
      fields,
    );
  }
  return fields;
};
export const getActorPreviewHeader = (actor, intl) => ({
  aboveTitle: intl.formatMessage(
    appMessages.entities[`actors_${actor.getIn(['attributes', 'actortype_id'])}`].single
  ),
  title: getEntityTitle(actor),
  code: checkActorAttribute(actor, 'code'),
});
export const getActorPreviewFooter = (actor, intl) => {
  const typeId = actor && actor.getIn(['attributes', 'actortype_id']);
  return ({
    primaryLink: actor && {
      path: `${ROUTES.ACTOR}/${actor.get('id')}`,
      title: `${intl.formatMessage(
        appMessages.entities[`actors_${typeId}`].single
      )} details`,
    },
    secondaryLink: {
      path: `${ROUTES.ACTORS}/${typeId}`,
      title: `All ${intl.formatMessage(
        appMessages.entities[`actors_${typeId}`].plural
      )}`,
    },
  });
};
export const getActorPreviewFields = ({
  actor,
  membersByType,
  associationsByType,
  taxonomiesWithCategoriesByType,
  // indicators,
  // onEntityClick,
  // intl,
  // isAdmin,
}) => {
  let fields = [];
  fields = Object.keys(ACTOR_FIELDS.ATTRIBUTES).reduce(
    (memo, key) => {
      const attribute = ACTOR_FIELDS.ATTRIBUTES[key];
      if (
        actor
        && attribute.preview
        && attribute.preview.indexOf(`${actor.getIn(['attributes', 'actortype_id'])}`) > -1
      ) {
        if (key === 'date_start') {
          return [
            ...memo,
            getDateField(actor, key, { showEmpty: false }),
          ];
        }
      }
      return memo;
    },
    [],
  );
  // member of
  if (associationsByType) {
    fields = associationsByType.reduce(
      (memo, actors, typeid) => {
        if (actors) {
          return ([
            ...memo,
            getActorConnectionField({
              actors,
              // onEntityClick,
              typeid,
            }),
          ]);
        }
        return memo;
      },
      fields,
    );
  }
  // members
  if (membersByType) {
    fields = membersByType.reduce(
      (memo, actors, typeid) => {
        if (actors) {
          return [
            ...memo,
            getActorConnectionField({
              actors,
              // onEntityClick,
              typeid,
            }),
          ];
        }
        return memo;
      }, fields
    );
  }
  // associated taxonomies
  if (taxonomiesWithCategoriesByType) {
    fields = [
      ...fields,
      ...getTaxonomyFields(taxonomiesWithCategoriesByType),
    ];
  }
  return fields;
};

export const getIndicatorPreviewHeader = (indicator, intl) => ({
  aboveTitle: intl.formatMessage(
    appMessages.entities.indicators.single
  ),
  title: getEntityTitle(indicator),
  code: checkIndicatorAttribute(indicator, 'code'),
});
export const getIndicatorPreviewFooter = (indicator, intl) => ({
  primaryLink: indicator && {
    path: `${ROUTES.INDICATOR}/${indicator.get('id')}`,
    title: `${intl.formatMessage(
      appMessages.entities.indicators.single
    )} details`,
  },
  secondaryLink: {
    path: ROUTES.INDICATORS,
    title: `All ${intl.formatMessage(appMessages.entities.indicators.plural)}`,
  },
});

export const getIndicatorPreviewFields = ({
  indicator,
  // onEntityClick,
  // intl,
}) => {
  let fields = [];
  fields = Object.keys(INDICATOR_FIELDS.ATTRIBUTES).reduce(
    (memo, key) => {
      // const attribute = INDICATOR_FIELDS.ATTRIBUTES[key];
      if (
        indicator
        // && attribute.preview
        //  && attribute.preview.indexOf(`${indicator.getIn(['attributes', 'actortype_id'])}`) > -1
      ) {
        if (key === 'date_start') {
          return [
            ...memo,
            getDateField(indicator, key, { showEmpty: false }),
          ];
        }
        if (key === 'description') {
          return [
            ...memo,
            getMarkdownField(indicator, key, true),
          ];
        }
      }
      return memo;
    },
    [],
  );
  return fields;
};
export const getResourcePreviewHeader = (resource, intl) => ({
  aboveTitle: intl.formatMessage(
    appMessages.entities[`resources_${resource.getIn(['attributes', 'resourcetype_id'])}`].single
  ),
  title: getEntityTitle(resource),
});
export const getResourcePreviewFooter = (resource, intl) => {
  const typeId = resource && resource.getIn(['attributes', 'resourcetype_id']);
  return ({
    primaryLink: resource && {
      path: `${ROUTES.RESOURCE}/${resource.get('id')}`,
      title: `${intl.formatMessage(
        appMessages.entities[`resources_${typeId}`].single
      )} details`,
    },
    secondaryLink: {
      path: `${ROUTES.RESOURCES}/${typeId}`,
      title: `All ${intl.formatMessage(
        appMessages.entities[`resources_${typeId}`].plural
      )}`,
    },
  });
};

export const getResourcePreviewFields = ({
  resource,
  // indicators,
  // onEntityClick,
  // intl,
  // isAdmin,
}) => {
  let fields = [];
  fields = Object.keys(RESOURCE_FIELDS.ATTRIBUTES).reduce(
    (memo, key) => {
      const attribute = RESOURCE_FIELDS.ATTRIBUTES[key];
      if (
        resource
        && attribute.preview
        && attribute.preview.indexOf(`${resource.getIn(['attributes', 'resourcetype_id'])}`) > -1
      ) {
        if (key === 'date_start') {
          return [
            ...memo,
            getDateField(resource, key, { showEmpty: false }),
          ];
        }
      }
      return memo;
    },
    [],
  );
  return fields;
};

export const getUserPreviewHeader = (user, intl) => ({
  aboveTitle: intl.formatMessage(
    appMessages.entities.users.single
  ),
  title: getEntityTitle(user),
});
export const getUserPreviewFooter = (user, intl) => ({
  primaryLink: user && {
    path: `${ROUTES.USERS}/${user.get('id')}`,
    title: `${intl.formatMessage(
      appMessages.entities.users.single
    )} details`,
  },
  secondaryLink: {
    path: ROUTES.USERS,
    title: `All ${intl.formatMessage(appMessages.entities.users.plural)}`,
  },
});

export const getUserPreviewFields = (
// {
  // user,
  // indicators,
  // onEntityClick,
  // intl,
  // isAdmin,
// }) => {
) => {
  const fields = [];
  return fields;
};
