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
  key, attribute, entity, types,
}) => {
  const val = entity.getIn(['attributes', key]) || '';
  if (key === 'measuretype_id') {
    return types.actiontypes[val] || val;
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

export const prepareDatas = ({
  // typeId,
  // config,
  attributes,
  entities,
  types,
  // taxonomies,
  // connections,
}) => entities.reduce((memo, entity) => {
  const result = { id: entity.get('id') };
  return [
    ...memo,
    Object.keys(attributes).reduce((memo2, attKey) => {
      if (!attributes[attKey].active) {
        return memo2;
      }
      const value = getValue({
        key: attKey,
        attribute: attributes[attKey],
        entity,
        types,
      });
      return ({
        ...memo2,
        [attKey]: value,
      });
    }, result),
  ];
}, []);
