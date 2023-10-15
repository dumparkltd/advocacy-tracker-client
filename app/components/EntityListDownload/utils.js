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
}) => {
  console.log('entity', entity && entity.toJS());
  // console.log('actortypes', actortypes)
  // console.log('types', types)
  // console.log('actors', actors && actors.toJS())
  // console.log('data', data)
  return Object.keys(actortypes).reduce((memo, actortypeId) => {
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
};
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
  let dataRows;
  if (hasActors && actorsAsRows) {
    dataRows = prepActorDataAsRows({
      entity,
      actortypes,
      actors: connections && connections.get('actors'),
      data,
      typeNames,
    });
  }
  return dataRows
    ? [...memo, ...dataRows]
    : [...memo, data];
}, []);
