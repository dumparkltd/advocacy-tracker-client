import { filter, reduce } from 'lodash/collection';
import appMessages from 'containers/App/messages';
import { DATE_FORMAT } from 'themes/config';

const getColumnTitle = (field, formatMessage) => {
  const msg = (appMessages.importFields[field.label] || appMessages.importFields[field.attribute])
    ? formatMessage(appMessages.importFields[field.label || field.attribute])
    : formatMessage(appMessages.attributes[field.label || field.attribute]);
  return `${msg} [database:${field.attribute}]`;
};

export const getImportFields = (shape, formatMessage) => {
  const fields = filter(shape.fields, (field) => field.import === true && !field.disabled);
  const values = reduce(fields, (memo, field) => {
    const value = `${field.required
      ? formatMessage(appMessages.import.required)
      : formatMessage(appMessages.import.optional)}: ${formatMessage(appMessages.import[field.type], { format: DATE_FORMAT })}`;
    return Object.assign(memo, { [getColumnTitle(field, formatMessage)]: value });
  }, {});
  return Object.assign(values, { '': formatMessage(appMessages.import.hint) });
};

export const getColumnAttribute = (columnTitle) => {
  const split = columnTitle.split('[database:');
  return split.length > 1
    ? split[1].replace(']', '')
    : columnTitle;
};
