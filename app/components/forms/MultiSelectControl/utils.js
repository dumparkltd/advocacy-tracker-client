import { reduce } from 'lodash/collection';
import { List } from 'immutable';

import { cleanupSearchTarget, regExMultipleWords } from 'utils/string';
import { testEntityEntityAssociation } from 'utils/entities';
import { getEntitySortComparator } from 'utils/sort';
import asArray from 'utils/as-array';

export const getOptionSortValueMapper = (option) => {
  if (option.get('order')) {
    return option.get('order');
  }
  if (option.get('reference') && option.get('reference').trim().length > 0) {
    return option.get('reference');
  }
  return option.get('label');
};
export const getOptionSortCheckedValueMapper = (option) => {
  if (option.get('initialChecked')) {
    return -3;
  }
  if (option.get('isIndeterminate')) {
    return -2;
  }
  if (option.get('query') === 'any') {
    return -4;
  }
  if (
    option.get('query') === 'without'
    || (typeof option.get('value') === 'string' && option.get('value').slice(-5) === ':null')
  ) {
    return -5;
  }
  return 1;
};

export const getOptionSortRecentlyCreatedValueMapper = (option) => {
  if (option.get('isNew')) return -1;
  return 1;
};

export const sortOptions = (options) => options
  .sortBy(
    (option) => getOptionSortValueMapper(option),
    (a, b) => getEntitySortComparator(a, b, 'asc')
  )
  .sortBy(
    (option) => getOptionSortRecentlyCreatedValueMapper(option),
    (a, b) => getEntitySortComparator(a, b, 'asc')
  )
  .sortBy(
    (option) => getOptionSortCheckedValueMapper(option),
    (a, b) => getEntitySortComparator(a, b, 'asc')
  );

export const prepareOptionSearchTarget = (option, fields, queryLength) => reduce(
  fields,
  (target, field) => {
    if (option.get(field)) {
      if (field === 'id' || field === 'code' || field === 'value') {
        return `${target} ${option.get(field)}`;
      } if (queryLength > 1) {
        return `${target} ${cleanupSearchTarget(option.get(field))}`;
      }
      return target;
    }
    return target;
  }, ''
);

// compare to utils/entities.js filterEntitiesByKeywords
export const filterOptionsByKeywords = (options, query) => { // filter checkboxes if needed
  if (query) {
    try {
      const regex = new RegExp(regExMultipleWords(query), 'i');
      return options.filter((option) => regex.test(prepareOptionSearchTarget(
        option,
        (option.get('searchFields') && option.get('searchFields').size > 0)
          ? option.get('searchFields').toArray()
          : ['id', 'code', 'label', 'search', 'reference', 'description'],
        query.length
      )));
    } catch (e) {
      // nothing
      return options;
    }
  }
  return options;
};

export const filterOptionsByTags = (options, queryTags) => options.filter(
  (option) => asArray(queryTags).every(
    (tag) => testEntityEntityAssociation(option, 'tags', parseInt(tag, 10)),
  )
);

export const getChangedOptions = (options) => options.filter((o) => o.get('hasChanged'));

export const getCheckedValuesFromOptions = (options, onlyChanged = false) => {
  if (!options) return List();
  const opts = onlyChanged ? getChangedOptions(options) : options;
  return opts.filter((o) => o.get('checked')).map((o) => o.get('value'));
};

export const getCheckedOptions = (options, onlyChanged = false) => {
  if (!options) return List();
  const opts = onlyChanged ? getChangedOptions(options) : options;
  return opts.filter((o) => o.get('checked'));
};

export const getUncheckedValuesFromOptions = (options, onlyChanged = false) => {
  if (!options) return List();
  const opts = onlyChanged ? getChangedOptions(options) : options;
  return opts.filterNot((o) => o.get('checked')).map((o) => o.get('value'));
};
