import qe from 'utils/quasi-equals';
export const getAttributes = ({
  typeId,
  fieldAttributes,
}) => {
  if (fieldAttributes) {
    return Object.keys(fieldAttributes).reduce((memo, attKey) => {
      const attValue = fieldAttributes[attKey];
      if (
        !attValue.skipExport
        && (
          (attValue.optional && attValue.optional.indexOf(parseInt(typeId, 10)))
          || (attValue.required && attValue.required.indexOf(parseInt(typeId, 10)))
          || (!attValue.optional && !attValue.required)
        )
      ) {
        return {
          ...memo,
          [attKey]: {
            ...attValue,
            active: typeof attValue.export === 'undefined' || !!attValue.export || !!attValue.exportRequired,
            column: attValue.exportColumn || attKey,
          },
        };
      }
      return memo;
    }, {});
  }
  return [];
};

const sanitiseText = (text) => {
  let val = text.trim();
  if (val.startsWith('-')) {
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
  key, attribute, entity, typeNames,
}) => {
  const val = entity.getIn(['attributes', key]) || '';
  if (key === 'measuretype_id') {
    return typeNames.actiontypes[val] || val;
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
  if (
    attribute.type === 'markdown'
    || attribute.type === 'text'
  ) {
    return sanitiseText(val);
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
  return cats.join(',');
};

const prepAttributeData = ({
  entity,
  attributes,
  typeNames,
  data,
}) => Object.keys(attributes).reduce((memo, attKey) => {
  if (!attributes[attKey].active) {
    return memo;
  }
  const value = getValue({
    key: attKey,
    attribute: attributes[attKey],
    entity,
    typeNames,
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
        const actorValue = code !== '' ? `${code}|${title}` : title;
        return memo2 === ''
          ? actorValue
          : `${memo2}, ${actorValue}`;
      }
      return memo2;
    }, '');
  }
  return ({
    ...memo,
    [`actors_${actortypeId}`]: `"${actorsValue}"`,
  });
}, data);
// const prepIndicatorData = ({
//   entity, // Map
//   indicators, // Map
//   data,
// }) => {
//   const entityIndicatorConnections = entity.get('indicatorConnections');
//   // let actorsValue = '';
//   // // console.log(entityActorIds)
//   if (entityIndicatorConnections) {
//     const indicatorsValue = entityIndicatorConnections.reduce((memo, indicatorConnection) => {
//       // console.log(actorId)
//       const indicator = indicators.get(indicatorConnection.get('indicator_id').toString());
//       if (indicator) {
//         const code = indicator.getIn(['attributes', 'code']);
//         const title = indicator.getIn(['attributes', 'title']);
//         let indicatorValue = code !== '' ? `${code}|${title}` : title;
//         indicatorValue = indicatorConnection.get('supportlevel_id')
//           ? `${indicatorValue}|Support:${indicatorConnection.get('supportlevel_id')}`
//           : indicatorValue;
//         return memo === ''
//           ? indicatorValue
//           : `${memo}, ${indicatorValue}`;
//       }
//       return memo;
//     }, '');
//     return ({
//       ...data,
//       indicators: `"${indicatorsValue}"`,
//     });
//   }
//   return data;
// };
const getIndicatorValue = ({ entity, indicatorId }) => {
  const indicatorConnection = entity
    .get('indicatorConnections')
    .find((connection) => qe(connection.get('indicator_id'), indicatorId));
  if (indicatorConnection) {
    return indicatorConnection.get('supportlevel_id');
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

const prepActorDataAsRows = ({
  entity, // Map
  actortypes,
  actors, // Map
  data,
  typeNames,
}) => {
  // console.log('entity', entity && entity.toJS());
  // console.log('actortypes', actortypes)
  // console.log('actors', actors && actors.toJS())
  // console.log('data', data)
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
          const actorTypeId = actor.getIn(['attributes', 'actortype_id']);
          const dataRow = {
            ...data,
            actor_id: actorId,
            actortype_id: typeNames.actortypes[actorTypeId] || actorTypeId,
            actor_code: actor.getIn(['attributes', 'code']),
            actor_title: actor.getIn(['attributes', 'title']),
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
    return dataRows;
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
            indicator_title: indicator.getIn(['attributes', 'title']),
            indicator_supportlevel: indicatorConnection.get('supportlevel_id'),
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
    return dataIndicatorRows;
  }
  return dataRows;
};

export const prepareData = ({
  // typeId,
  // config,
  attributes,
  entities,
  typeNames,
  taxonomies,
  taxonomyColumns,
  connections,
  hasActors,
  actorsAsRows,
  actortypes,
  hasIndicators,
  indicatorsAsRows,
}) => entities.reduce((memo, entity) => {
  let data = { id: entity.get('id') };
  // add attribute columns
  if (attributes) {
    data = prepAttributeData({
      entity,
      attributes,
      typeNames,
      data,
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
      actors: connections && connections.get('actors'),
      data,
    });
  }
  if (hasIndicators && !indicatorsAsRows) {
    data = prepIndicatorDataColumns({
      entity,
      indicators: connections && connections.get('indicators'),
      data,
    });
  }
  let dataRows = [data];
  if (hasActors && actorsAsRows) {
    dataRows = prepActorDataAsRows({
      entity,
      actortypes,
      actors: connections && connections.get('actors'),
      data,
      typeNames,
    });
  }
  if (hasIndicators && indicatorsAsRows) {
    dataRows = prepIndicatorDataAsRows({
      entity,
      indicators: connections && connections.get('indicators'),
      dataRows,
    });
  }
  return [...memo, ...dataRows];
}, []);
