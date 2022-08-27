import appMessage from 'utils/app-message';
import { lowerCase } from 'utils/string';
import { reduce } from 'lodash/collection';

export const getFilterLabel = (filter, intl, long) => {
  // not used I think?
  if (filter.message) {
    console.log('USED AFTER ALL');
    return filter.messagePrefix
      ? `${filter.messagePrefix} ${lowerCase(appMessage(intl, filter.message))}`
      : appMessage(intl, filter.message);
  }
  if (filter.labels) {
    return reduce(filter.labels, (memo, label) => {
      if (!label.label) return memo;
      let labelValue = label.appMessage ? appMessage(intl, label.label) : label.label;
      labelValue = label.postfix ? `${labelValue}${label.postfix}` : labelValue;
      return `${memo}${label.lowerCase ? lowerCase(labelValue) : labelValue} `;
    }, '').trim();
  }
  return long && filter.labelLong ? filter.labelLong : filter.label;
};
