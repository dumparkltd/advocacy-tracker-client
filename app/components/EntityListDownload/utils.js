import qe from 'utils/quasi-equals';
import appMessages from 'containers/App/messages';
import { ACTIONTYPES, ACTION_INDICATOR_SUPPORTLEVELS } from 'themes/config';


// const IN_CELL_SEPARATOR = ', \n';
const IN_CELL_SEPARATOR = ', ';

export const getDateSuffix = (datetime) => {
  const date = datetime ? new Date(datetime) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
};

const sanitiseText = (text) => {
  let val = text ? `${text}`.trim() : '';
  if (val.startsWith('-') || val.startsWith('+')) {
    val = `'${val}`;
  }
  return `"${val
    .replaceAll(/“/g, '"')
    .replaceAll(/”/g, '"')
    .replaceAll(/‘/g, "'")
    .replaceAll(/’/g, "'")
    .replaceAll(/"/g, '""')}"`;
};

const getValue = ({
  key, attribute, entity, typeNames, relationships,
}) => {
  const val = entity.getIn(['attributes', key]) || '';
  if (key === 'measuretype_id' && typeNames) {
    return typeNames.actiontypes[val] || val;
  }
  if (key === 'actortype_id' && typeNames) {
    return typeNames.actortypes[val] || val;
  }
  if (attribute.type === 'bool') {
    return val || false;
  }
  if (attribute.type === 'date') {
    if (val && val !== '') {
      const date = new Date(val);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return '';
  }
  if (attribute.type === 'datetime') {
    if (val && val !== '') {
      return getDateSuffix(val);
    }
    return '';
  }
  if (
    attribute.type === 'markdown'
    || attribute.type === 'text'
  ) {
    return sanitiseText(val);
  }
  if (attribute.type === 'key' && relationships && relationships.get(attribute.table)) {
    const connectedEntity = relationships.getIn([attribute.table, `${val}`]);
    if (connectedEntity) {
      const title = connectedEntity.getIn(['attributes', 'title']) || connectedEntity.getIn(['attributes', 'name']);
      if (title) {
        const email = connectedEntity.getIn(['attributes', 'email']);
        if (email) {
          return `${title} (${email})`;
        }
        return title;
      }
    }
  }
  return val;
};
const getTaxonomyValue = ({ taxonomy, categories }) => {
  const cats = categories.reduce((memo, catId) => {
    if (taxonomy.get('categories') && taxonomy.get('categories').get(`${catId}`)) {
      const catShortTitle = taxonomy.getIn(['categories', `${catId}`, 'attributes', 'short_title']);
      const catTitle = taxonomy.getIn(['categories', `${catId}`, 'attributes', 'title']);
      return [
        ...memo,
        catShortTitle || catTitle,
      ];
    }
    return memo;
  }, []);
  return `"${cats.join(',')}"`;
};

const prepAttributeData = ({
  entity,
  attributes,
  typeNames,
  data,
  relationships,
}) => Object.keys(attributes).reduce((memo, attKey) => {
  if (!attributes[attKey].active) {
    return memo;
  }
  const value = getValue({
    key: attKey,
    attribute: attributes[attKey],
    entity,
    typeNames,
    relationships,
  });
  return ({
    ...memo,
    [attKey]: value,
  });
}, data);

const prepTaxonomyData = ({
  entity,
  taxonomyColumns,
  taxonomies,
  data,
}) => Object.keys(taxonomyColumns).reduce((memo, taxId) => {
  if (!taxonomyColumns[taxId].active) {
    return memo;
  }
  const value = getTaxonomyValue({
    taxonomy: taxonomies.get(taxId),
    categories: entity.get('categories')
      ? entity.get('categories').toList().toJS()
      : [],
  });
  return ({
    ...memo,
    [`taxonomy_${taxId}`]: value,
  });
}, data);
const addWarnings = ({
  value,
  entity,
}) => {
  const draft = entity.getIn(['attributes', 'draft']);
  const isPrivate = entity.getIn(['attributes', 'private']);
  let warnings = [];
  if (draft || isPrivate) {
    if (draft) {
      warnings = [...warnings, 'draft'];
    }
    if (isPrivate) {
      warnings = [...warnings, 'private'];
    }
    return `${value} [${warnings.join('/')}]`;
  }
  return value;
};

const prepActorData = ({
  entity, // Map
  actortypes,
  actors, // Map
  data,
}) => Object.keys(actortypes).reduce((memo, actortypeId) => {
  if (!actortypes[actortypeId].active) {
    return memo;
  }
  const entityActorIds = entity.getIn(['actorsByType', parseInt(actortypeId, 10)]);
  let actorsValue = '';
  // console.log(entityActorIds)
  if (entityActorIds) {
    actorsValue = entityActorIds.reduce((memo2, actorId) => {
      // console.log(actorId)
      const actor = actors.get(actorId.toString());
      if (actor) {
        const title = actor.getIn(['attributes', 'title']);
        const code = actor.getIn(['attributes', 'code']);
        let actorValue = (code && code !== '') ? `${code}|${title}` : title;
        actorValue = addWarnings({
          value: actorValue,
          entity: actor,
        });
        return memo2 === ''
          ? actorValue
          : `${memo2}${IN_CELL_SEPARATOR}${actorValue}`;
      }
      return memo2;
    }, '');
  }
  return ({
    ...memo,
    [`actors_${actortypeId}`]: `"${actorsValue}"`,
  });
}, data);
const prepActionData = ({
  entity, // Map
  actiontypes,
  actions, // Map
  data,
}) => Object.keys(actiontypes).reduce((memo, actiontypeId) => {
  if (!actiontypes[actiontypeId].active) {
    return memo;
  }
  const entityActionIds = entity.getIn(['actionsByType', parseInt(actiontypeId, 10)]);
  let actionsValue = '';
  // console.log(entityActorIds)
  if (entityActionIds) {
    actionsValue = entityActionIds.reduce((memo2, actionId) => {
      // console.log(actionId)
      const action = actions.get(actionId.toString());
      if (action) {
        const title = action.getIn(['attributes', 'title']);
        const code = action.getIn(['attributes', 'code']);
        let actionValue = (code && code !== '') ? `${code}|${title}` : title;
        actionValue = addWarnings({
          value: actionValue,
          entity: action,
        });
        return memo2 === ''
          ? actionValue
          : `${memo2}${IN_CELL_SEPARATOR}${actionValue}`;
      }
      return memo2;
    }, '');
  }
  return ({
    ...memo,
    [`actions_${actiontypeId}`]: sanitiseText(actionsValue),
  });
}, data);

const prepParentData = ({
  entity, // Map
  parenttypes,
  parents, // Map
  data,
}) => Object.keys(parenttypes).reduce((memo, parenttypeId) => {
  if (!parenttypes[parenttypeId].active) {
    return memo;
  }
  const entityParentIds = entity.getIn(['parentsByType', parseInt(parenttypeId, 10)]);
  let parentsValue = '';
  if (entityParentIds) {
    parentsValue = entityParentIds.reduce((memo2, parentId) => {
      const parent = parents && parents.get(parentId.toString());
      if (parent) {
        const title = parent.getIn(['attributes', 'title']);
        const code = parent.getIn(['attributes', 'code']);
        let parentValue = (code && code !== '') ? `${code}|${title}` : title;
        parentValue = addWarnings({ value: parentValue, entity: parent });
        return memo2 === ''
          ? parentValue
          : `${memo2}${IN_CELL_SEPARATOR}${parentValue}`;
      }
      return memo2;
    }, '');
  }
  return ({
    ...memo,
    [`parents_${parenttypeId}`]: sanitiseText(parentsValue),
  });
}, data);
const prepAssociationData = ({
  entity, // Map
  associationtypes,
  associations, // Map
  data,
}) => Object.keys(associationtypes).reduce((memo, actortypeId) => {
  if (!associationtypes[actortypeId].active) {
    return memo;
  }
  const entityAssociationIds = entity.getIn(['associationsByType', parseInt(actortypeId, 10)]);
  let associationsValue = '';
  // console.log(entityActorIds)
  if (entityAssociationIds) {
    associationsValue = entityAssociationIds.reduce((memo2, actorId) => {
      // console.log(actorId)
      const association = associations && associations.get(actorId.toString());
      if (association) {
        const title = association.getIn(['attributes', 'title']);
        const code = associations.getIn(['attributes', 'code']);
        let associationValue = (code && code !== '') ? `${code}|${title}` : title;
        associationValue = addWarnings({ value: associationValue, entity: association });
        return memo2 === ''
          ? associationValue
          : `${memo2}${IN_CELL_SEPARATOR}${associationValue}`;
      }
      return memo2;
    }, '');
  }
  return ({
    ...memo,
    [`associations_${actortypeId}`]: sanitiseText(associationsValue),
  });
}, data);
const prepChildData = ({
  entity, // Map
  childtypes,
  children, // Map
  data,
}) => Object.keys(childtypes).reduce((memo, childtypeId) => {
  if (!childtypes[childtypeId].active) {
    return memo;
  }
  const entityChildrenIds = entity.getIn(['childrenByType', parseInt(childtypeId, 10)]);
  let childrenValue = '';
  // console.log(entityActorIds)
  if (entityChildrenIds) {
    childrenValue = entityChildrenIds.reduce((memo2, childId) => {
      // console.log(actorId)
      const child = children && children.get(childId.toString());
      if (child) {
        const title = child.getIn(['attributes', 'title']);
        const code = child.getIn(['attributes', 'code']);
        let childValue = (code && code !== '') ? `${code}|${title}` : title;
        childValue = addWarnings({ value: childValue, entity: child });
        return memo2 === ''
          ? childValue
          : `${memo2}${IN_CELL_SEPARATOR}${childValue}`;
      }
      return memo2;
    }, '');
  }
  return ({
    ...memo,
    [`children_${childtypeId}`]: sanitiseText(childrenValue),
  });
}, data);
const prepMemberData = ({
  entity, // Map
  membertypes,
  members, // Map
  data,
}) => Object.keys(membertypes).reduce((memo, actortypeId) => {
  if (!membertypes[actortypeId].active) {
    return memo;
  }
  const entityMemberIds = entity.getIn(['membersByType', parseInt(actortypeId, 10)]);
  let membersValue = '';
  // console.log(entityActorIds)
  if (entityMemberIds) {
    membersValue = entityMemberIds.reduce((memo2, memberId) => {
      // console.log(actorId)
      const member = members && members.get(memberId.toString());
      if (member) {
        const title = member.getIn(['attributes', 'title']);
        const code = member.getIn(['attributes', 'code']);
        let memberValue = (code && code !== '') ? `${code}|${title}` : title;
        memberValue = addWarnings({ value: memberValue, entity: member });
        return memo2 === ''
          ? memberValue
          : `${memo2}${IN_CELL_SEPARATOR}${memberValue}`;
      }
      return memo2;
    }, '');
  }
  return ({
    ...memo,
    [`members_${actortypeId}`]: sanitiseText(membersValue),
  });
}, data);

const prepResourceData = ({
  entity, // Map
  resourcetypes,
  resources, // Map
  data,
}) => Object.keys(resourcetypes).reduce((memo, resourcetypeId) => {
  if (!resourcetypes[resourcetypeId].active) {
    return memo;
  }
  const entityParentIds = entity.getIn(['resourcesByType', parseInt(resourcetypeId, 10)]);
  let resourcesValue = '';
  // console.log(entityActorIds)
  if (entityParentIds) {
    resourcesValue = entityParentIds.reduce((memo2, resourceId) => {
      // console.log(actorId)
      const resource = resources && resources.get(resourceId.toString());
      if (resource) {
        const title = resource.getIn(['attributes', 'title']);
        const code = resource.getIn(['attributes', 'code']);
        const url = resource.getIn(['attributes', 'url']);
        let resourceValue = (code && code !== '') ? `${code}|${title}` : title;
        resourceValue = (url && url !== '') ? `${resourceValue}(${url})` : title;
        resourceValue = addWarnings({ value: resourceValue, entity: resource });

        return memo2 === ''
          ? resourceValue
          : `${memo2}${IN_CELL_SEPARATOR}${resourceValue}`;
      }
      return memo2;
    }, '');
  }
  return ({
    ...memo,
    [`resources_${resourcetypeId}`]: sanitiseText(resourcesValue),
  });
}, data);

const getIndicatorValue = ({ entity, indicatorId }) => {
  const indicatorConnection = entity
    .get('indicatorConnections')
    .find((connection) => qe(connection.get('indicator_id'), indicatorId));
  if (indicatorConnection) {
    return indicatorConnection.get('supportlevel_id') || '';
  }
  return '';
};
const prepIndicatorDataColumns = ({
  entity, // Map
  indicators, // Map
  data,
}) => indicators.reduce((memo, indicator) => {
  const value = getIndicatorValue({
    entity,
    indicatorId: indicator.get('id'),
  });

  return ({
    ...memo,
    [`indicator_${indicator.get('id')}`]: value,
  });
}, data);
const prepUserData = ({
  entity, // Map
  users, // Map
  data,
}) => {
  const entityUsers = entity.get('users');
  // let actorsValue = '';
  // // console.log(entityActorIds)
  if (entityUsers) {
    const usersValue = entityUsers.reduce((memo, userId) => {
      // console.log(actorId)
      const user = users.get(userId.toString());
      if (user) {
        const title = user.getIn(['attributes', 'name']);
        const email = user.getIn(['attributes', 'email']);
        const indicatorValue = email !== '' ? `${title}(${email})` : title;
        return memo === ''
          ? indicatorValue
          : `${memo}${IN_CELL_SEPARATOR}${indicatorValue}`;
      }
      return memo;
    }, '');
    return ({
      ...data,
      users: sanitiseText(usersValue),
    });
  }
  return data;
};

const prepSupportData = ({ entity, data }) => {
  const statementCount = entity.getIn(['actionsByType', parseInt(ACTIONTYPES.EXPRESS, 10)])
    ? entity.getIn(['actionsByType', parseInt(ACTIONTYPES.EXPRESS, 10)]).size
    : 0;
  const supportCounts = Object.values(ACTION_INDICATOR_SUPPORTLEVELS).reduce((memo, level) => {
    if (level.value === '0') {
      return memo;
    }
    const count = entity.getIn(['supportlevels', level.value, 'count']) || 0;
    return ({
      ...memo,
      [`support_level_${level.value}`]: count,
    });
  }, {});
  return ({
    ...data,
    statement_count: statementCount,
    ...supportCounts,
  });
};

const prepActorDataAsRows = ({
  entity, // Map
  actortypes,
  actors, // Map
  data,
  typeNames,
}) => {
  if (entity.get('actors') && actortypes) {
    const dataRows = Object.keys(actortypes).reduce((memo, actortypeId) => {
      if (!actortypes[actortypeId].active) {
        return memo;
      }
      const entityActorIds = entity.getIn(['actorsByType', parseInt(actortypeId, 10)]);
      // console.log(entityActorIds)
      if (entityActorIds) {
        const dataTypeRows = entityActorIds.reduce((memo2, actorId) => {
          const actor = actors.get(actorId.toString());
          const dataRow = {
            ...data,
            actor_id: actorId,
            actortype_id: typeNames.actortypes[actortypeId] || actortypeId,
            actor_code: actor.getIn(['attributes', 'code']),
            actor_title: sanitiseText(actor.getIn(['attributes', 'title'])),
            actor_draft: !!actor.getIn(['attributes', 'draft']),
            actor_private: !!actor.getIn(['attributes', 'private']),
          };
          return [
            ...memo2,
            dataRow,
          ];
        }, []);
        return [
          ...memo,
          ...dataTypeRows,
        ];
      }
      return memo;
    }, []);
    return dataRows.length > 0 ? dataRows : [data];
  }
  return [data];
};
const prepActionDataAsRows = ({
  entity, // Map
  actiontypes,
  actions, // Map
  data,
  typeNames,
}) => {
  if (entity.get('actions') && actiontypes) {
    const dataRows = Object.keys(actiontypes).reduce((memo, actiontypeId) => {
      if (!actiontypes[actiontypeId].active) {
        return memo;
      }
      const entityActionIds = entity.getIn(['actionsByType', parseInt(actiontypeId, 10)]);
      // console.log(entityActorIds)
      if (entityActionIds) {
        const dataTypeRows = entityActionIds.reduce((memo2, actionId) => {
          const action = actions.get(actionId.toString());
          const dataRow = {
            ...data,
            action_id: actionId,
            actiontype_id: typeNames.actiontypes[actiontypeId] || actiontypeId,
            action_code: action.getIn(['attributes', 'code']),
            action_title: sanitiseText(action.getIn(['attributes', 'title'])),
            action_draft: !!action.getIn(['attributes', 'draft']),
            action_private: !!action.getIn(['attributes', 'private']),
          };
          return [
            ...memo2,
            dataRow,
          ];
        }, []);
        return [
          ...memo,
          ...dataTypeRows,
        ];
      }
      return [
        ...memo,
      ];
    }, []);
    return dataRows.length > 0 ? dataRows : [data];
  }
  return [data];
};
const prepIndicatorDataAsRows = ({
  entity, // Map
  indicators, // Map
  dataRows, // array of entity rows (i.e. for each actor and action)
}) => {
  const entityIndicatorConnections = entity.get('indicatorConnections');
  // let actorsValue = '';
  if (entityIndicatorConnections) {
    // console.log('entityIndicatorConnections', entityIndicatorConnections)
    // for each indicator
    const dataIndicatorRows = entityIndicatorConnections.reduce((memo, indicatorConnection) => {
      const indicator = indicators.get(indicatorConnection.get('indicator_id').toString());
      // and for each row: add indicator columns
      if (indicator) {
        const dataRowsIndicator = dataRows.reduce((memo2, data) => {
          const dataRow = {
            ...data,
            indicator_id: indicatorConnection.get('indicator_id'),
            indicator_code: indicator.getIn(['attributes', 'code']),
            indicator_title: sanitiseText(indicator.getIn(['attributes', 'title'])),
            indicator_supportlevel: indicatorConnection.get('supportlevel_id'),
            indicator_draft: !!indicator.getIn(['attributes', 'draft']),
            indicator_private: !!indicator.getIn(['attributes', 'private']),
          };
          return [
            ...memo2,
            dataRow,
          ];
        }, []);
        return [
          ...memo,
          ...dataRowsIndicator,
        ];
      }
      return memo;
    }, []);
    return dataIndicatorRows.length > 0 ? dataIndicatorRows : dataRows;
  }
  return dataRows;
};

export const prepareDataForActions = ({
  // typeId,
  // config,
  attributes,
  entities,
  typeNames,
  taxonomies,
  taxonomyColumns,
  relationships,
  hasActors,
  actorsAsRows,
  actortypes,
  hasIndicators,
  indicatorsAsRows,
  hasParents,
  parenttypes,
  hasChildren,
  childtypes,
  hasResources,
  resourcetypes,
  hasUsers,
}) => entities.reduce((memo, entity) => {
  let data = { id: entity.get('id') };
  // add attribute columns
  if (attributes) {
    data = prepAttributeData({
      entity,
      attributes,
      typeNames,
      data,
      relationships,
    });
  }
  if (taxonomyColumns) {
    data = prepTaxonomyData({
      entity,
      taxonomyColumns,
      taxonomies,
      data,
    });
  }
  if (hasActors && !actorsAsRows) {
    data = prepActorData({
      entity,
      actortypes,
      actors: relationships && relationships.get('actors'),
      data,
    });
  }
  if (hasParents) {
    data = prepParentData({
      entity,
      parenttypes,
      parents: relationships && relationships.get('parents'),
      data,
    });
  }
  if (hasChildren) {
    data = prepChildData({
      entity,
      childtypes,
      children: relationships && relationships.get('children'),
      data,
    });
  }
  if (hasResources) {
    data = prepResourceData({
      entity,
      resourcetypes,
      resources: relationships && relationships.get('resources'),
      data,
    });
  }
  if (hasIndicators && !indicatorsAsRows) {
    data = prepIndicatorDataColumns({
      entity,
      indicators: relationships && relationships.get('indicators'),
      data,
    });
  }
  if (hasUsers) {
    data = prepUserData({
      entity,
      users: relationships && relationships.get('users'),
      data,
    });
  }
  let dataRows = [data];
  if (hasActors && actorsAsRows) {
    dataRows = prepActorDataAsRows({
      entity,
      actortypes,
      actors: relationships && relationships.get('actors'),
      data,
      typeNames,
    });
  }
  if (hasIndicators && indicatorsAsRows) {
    dataRows = prepIndicatorDataAsRows({
      entity,
      indicators: relationships && relationships.get('indicators'),
      dataRows,
    });
  }
  return [...memo, ...dataRows];
}, []);
export const prepareDataForActors = ({
  // typeId,
  // config,
  attributes,
  entities,
  typeNames,
  taxonomies,
  taxonomyColumns,
  relationships,
  hasActions,
  actionsAsRows,
  actiontypes,
  hasAssociations,
  associationtypes,
  hasMembers,
  membertypes,
  hasUsers,
}) => entities.reduce((memo, entity) => {
  let data = { id: entity.get('id') };
  // add attribute columns
  if (attributes) {
    data = prepAttributeData({
      entity,
      attributes,
      typeNames,
      data,
      relationships,
    });
  }
  if (taxonomyColumns) {
    data = prepTaxonomyData({
      entity,
      taxonomyColumns,
      taxonomies,
      data,
    });
  }
  if (hasActions && !actionsAsRows) {
    data = prepActionData({
      entity,
      actiontypes,
      actions: relationships && relationships.get('measures'),
      data,
    });
  }
  if (hasAssociations) {
    data = prepAssociationData({
      entity,
      associationtypes,
      associations: relationships && relationships.get('associations'),
      data,
    });
  }
  if (hasMembers) {
    data = prepMemberData({
      entity,
      membertypes,
      members: relationships && relationships.get('members'),
      data,
    });
  }
  if (hasUsers) {
    data = prepUserData({
      entity,
      users: relationships && relationships.get('users'),
      data,
    });
  }
  let dataRows = [data];
  if (hasActions && actionsAsRows) {
    dataRows = prepActionDataAsRows({
      entity,
      actiontypes,
      actions: relationships && relationships.get('measures'),
      data,
      typeNames,
    });
  }
  // if (hasIndicators && indicatorsAsRows) {
  //   dataRows = prepIndicatorDataAsRows({
  //     entity,
  //     indicators: relationships && relationships.get('indicators'),
  //     dataRows,
  //   });
  // }
  return [...memo, ...dataRows];
}, []);

export const prepareDataForIndicators = ({
  // typeId,
  // config,
  entities,
  relationships,
  attributes,
  includeSupport,
}) => entities.reduce((memo, entity) => {
  let data = { id: entity.get('id') };
  // add attribute columns
  if (attributes) {
    data = prepAttributeData({
      data,
      entity,
      attributes,
      relationships,
    });
  }
  if (includeSupport) {
    data = prepSupportData({ entity, data });
  }
  // const dataRows = [data];
  return [...memo, data];
}, []);


export const getAttributes = ({
  typeId,
  fieldAttributes,
  isAdmin,
  intl,
}) => {
  if (fieldAttributes) {
    return Object.keys(fieldAttributes).reduce((memo, attKey) => {
      const attValue = fieldAttributes[attKey];
      const optional = typeof attValue.optional === 'boolean'
        ? attValue.optional
        : attValue.optional && attValue.optional.indexOf(typeId) > -1;
      const required = typeof attValue.required === 'boolean'
        ? attValue.required
        : attValue.required && attValue.required.indexOf(typeId) > -1;
      let passAdmin = true;
      if (
        !isAdmin
        && (
          attValue.adminOnly
          || (attValue.adminOnlyForTypes && attValue.adminOnlyForTypes.indexOf(typeId) > -1)
        )
      ) {
        passAdmin = false;
      }
      if (
        !attValue.skipExport
        // TODO: adminOnlyForTypes
        && passAdmin
        && (optional || required || (!attValue.optional && !attValue.required))
      ) {
        let active = false;
        if (attValue.exportDefault) {
          active = attValue.exportDefault;
        }
        if (attValue.exportRequired) {
          active = true;
        }
        const label = `${intl.formatMessage(appMessages.attributes[attKey])}${attValue.exportRequired ? ' (required)' : ''}`;
        return {
          ...memo,
          [attKey]: {
            ...attValue,
            active,
            column: attValue.exportColumn || attKey,
            label,
          },
        };
      }
      return memo;
    }, {});
  }
  return [];
};
