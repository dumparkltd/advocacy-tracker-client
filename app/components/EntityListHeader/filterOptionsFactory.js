import { List } from 'immutable';
import { find, forEach } from 'lodash/collection';
import { upperFirst } from 'lodash/string';
import { lowerCase } from 'utils/string';
import isNumber from 'utils/is-number';
import asArray from 'utils/as-array';
import asList from 'utils/as-list';

import appMessages from 'containers/App/messages';

import {
  testEntityCategoryAssociation,
  getEntityTitle,
  getEntityReference,
  getEntityParentId,
  checkActionAttribute,
  checkActorAttribute,
} from 'utils/entities';

import { makeTagFilterGroups } from 'utils/forms';

import { optionChecked } from './utils';

export const makeActiveFilterOptions = ({
  entities,
  config,
  locationQuery,
  taxonomies,
  connections,
  connectedTaxonomies,
  activeFilterOption,
  contextIntl,
  messages,
  isManager,
  includeMembers,
}) => {
  // create filterOptions
  switch (activeFilterOption.group) {
    case 'taxonomies':
      return makeTaxonomyFilterOptions(
        entities,
        config.taxonomies,
        taxonomies,
        activeFilterOption.optionId,
        locationQuery,
        messages,
        contextIntl,
      );
    case 'actors':
    case 'actions':
    case 'targets':
    case 'members':
    case 'associations':
    case 'resources':
    case 'parents':
      return makeGroupedConnectionFilterOptions(
        entities,
        config.connections,
        connections,
        connectedTaxonomies,
        activeFilterOption.optionId,
        locationQuery,
        messages,
        contextIntl,
        activeFilterOption.group,
        isManager,
        includeMembers,
      );
    case 'indicators':
      return makeConnectionFilterOptions(
        entities,
        config.connections,
        connections,
        connectedTaxonomies,
        activeFilterOption.optionId,
        locationQuery,
        messages,
        contextIntl,
        activeFilterOption.group,
        isManager,
      );
    case 'attributes':
      return makeAttributeFilterOptions({
        config: config.attributes,
        activeOptionId: activeFilterOption.optionId,
        locationQueryValue: locationQuery.get('where'),
      });
    default:
      return null;
  }
};
export const makeAnyWithoutFilterOptions = ({
  config,
  locationQuery,
  activeFilterOption,
  contextIntl,
  messages,
}) => {
  // create filterOptions
  switch (activeFilterOption.group) {
    case 'actors':
    case 'actions':
    case 'targets':
    case 'members':
    case 'associations':
    case 'resources':
      return makeAnyWithoutConnectionFilterOptions(
        config.connections,
        locationQuery,
        messages,
        contextIntl,
        activeFilterOption.group,
      );
    default:
      return null;
  }
};

// not as list but other filter UI, eg checkboxes
export const makeAttributeFilterOptions = ({
  config,
  activeOptionId,
  locationQueryValue,
}) => {
  const filterOptions = {
    groupId: 'attributes',
    options: {},
  };
  // the attribute option
  const option = find(config.options, (o) => o.attribute === activeOptionId);
  if (option) {
    filterOptions.message = option.message;
    if (option.filterUI && option.filterUI === 'checkboxes') {
      filterOptions.options = option.options.map(
        (attributeOption) => {
          const queryValue = `${option.attribute}:${attributeOption.value}`;
          const checked = asList(locationQueryValue).indexOf(queryValue) > -1;
          return ({
            message: attributeOption.message,
            value: queryValue,
            query: 'where',
            checked,
          });
        }
      );
    }
  } // if option
  return filterOptions;
};


const getTaxTitle = (id, contextIntl) => contextIntl.formatMessage(appMessages.entities.taxonomies[id].single);

export const makeTaxonomyFilterOptions = (
  entities,
  config,
  taxonomies,
  activeTaxId,
  locationQuery,
  messages,
  contextIntl,
) => {
  const filterOptions = {
    groupId: 'taxonomies',
    search: config.search,
    options: {},
    multiple: true,
    required: false,
    selectAll: false,
    groups: null,
  };
  // get the active taxonomy
  const taxonomy = taxonomies.get(activeTaxId);
  if (taxonomy && taxonomy.get('categories')) {
    const parentId = getEntityParentId(taxonomy);
    const parent = parentId && taxonomies.get(parentId);
    if (parent) {
      filterOptions.groups = parent.get('categories').map((cat) => getEntityTitle(cat));
    }
    filterOptions.title = `${messages.titlePrefix} ${lowerCase(getTaxTitle(parseInt(taxonomy.get('id'), 10), contextIntl))}`;
    if (entities.size === 0) {
      if (locationQuery.get(config.query)) {
        const locationQueryValue = locationQuery.get(config.query);
        forEach(asArray(locationQueryValue), (queryValue) => {
          const value = parseInt(queryValue, 10);
          const category = taxonomy.getIn(['categories', value]);
          if (category) {
            filterOptions.options[value] = {
              reference: getEntityReference(category, false),
              label: getEntityTitle(category),
              info: category.getIn(['attributes', 'description']),
              group: parent && getEntityParentId(category),
              showCount: true,
              value,
              count: 0,
              query: config.query,
              checked: true,
              draft: category && category.getIn(['attributes', 'draft']),
            };
          }
        });
      }
      // check for checked without options
      if (locationQuery.get('without')) {
        const locationQueryValue = locationQuery.get('without');
        asList(locationQueryValue).forEach((queryValue) => {
          // numeric means taxonomy
          if (isNumber(queryValue) && taxonomy.get('id') === queryValue) {
            const value = parseInt(queryValue, 10);
            filterOptions.options[value] = {
              label: `${messages.without} ${lowerCase(getTaxTitle(parseInt(taxonomy.get('id'), 10), contextIntl))}`,
              showCount: true,
              labelEmphasis: true,
              value,
              count: 0,
              query: 'without',
              checked: true,
            };
          }
        });
      }
    } else {
      entities.forEach((entity) => {
        const taxCategoryIds = [];
        // if entity has categories
        if (entity.get('categories')) {
          // add categories from entities if not present otherwise increase count
          taxonomy.get('categories').forEach((category, catId) => {
            // if entity has category of active taxonomy
            if (testEntityCategoryAssociation(entity, catId)) {
              taxCategoryIds.push(catId);
              // if category already added
              if (filterOptions.options[catId]) {
                filterOptions.options[catId].count += 1;
              } else {
                filterOptions.options[catId] = {
                  reference: getEntityReference(category, false),
                  label: getEntityTitle(category),
                  info: category.getIn(['attributes', 'description']),
                  group: parent && getEntityParentId(category),
                  showCount: true,
                  value: catId,
                  count: 1,
                  query: config.query,
                  checked: optionChecked(locationQuery.get(config.query), catId),
                  draft: category && category.getIn(['attributes', 'draft']),
                };
              }
            }
          });
        }
        if (taxCategoryIds.length === 0) {
          if (filterOptions.options.without) {
            filterOptions.options.without.count += 1;
          } else {
            filterOptions.options.without = {
              label: `${messages.without} ${lowerCase(getTaxTitle(parseInt(taxonomy.get('id'), 10), contextIntl))}`,
              showCount: true,
              labelEmphasis: true,
              value: taxonomy.get('id'),
              count: 1,
              query: 'without',
              checked: optionChecked(locationQuery.get('without'), taxonomy.get('id')),
            };
          }
        }
      }); // for each entities
    }
  }
  return filterOptions;
};


const getShowEntityReference = (entityType, typeId, isManager) => {
  if (typeId && entityType === 'actions') {
    return checkActionAttribute(typeId, 'code', isManager);
  }
  if (typeId && entityType === 'actors') {
    return checkActorAttribute(typeId, 'code', isManager);
  }
  if (!typeId || entityType === 'indicators') {
    return false;
  }
  return true;
};
//
//
//
export const makeGroupedConnectionFilterOptions = (
  entities,
  config,
  connections,
  connectedTaxonomies,
  activeOptionId,
  locationQuery,
  messages,
  contextIntl,
  group,
  isManager,
  includeMembers,
) => {
  const filterOptions = {
    groupId: group,
    options: {},
    multiple: true,
    required: false,
    search: true,
    advanced: true,
    selectAll: false,
  };

  // get the active option
  const typeId = activeOptionId;
  const option = config[group];
  // if option active
  if (option) {
    // the option path
    const { query, path } = option;
    const showEntityReference = getShowEntityReference(option.entityType, typeId, isManager);
    const entityType = option.entityTypeAs || option.entityType;
    filterOptions.messagePrefix = messages.titlePrefix;
    filterOptions.message = (typeId && option.message && option.message.indexOf('{typeid}') > -1)
      ? option.message.replace('{typeid}', typeId)
      : option.message;
    filterOptions.search = option.search;
    let locationQueryValue = locationQuery.get(query);
    // if no entities found show any active options
    if (entities.size === 0) {
      if (locationQueryValue) {
        asList(locationQueryValue).forEach((queryValue) => {
          const locationQueryValueConnection = queryValue.split(':');
          if (locationQueryValueConnection.length > 1) {
            if (typeId === locationQueryValueConnection[0]) {
              const value = locationQueryValueConnection[1];
              const connection = connections.get(path) && connections.getIn([path, value]);
              const reference = showEntityReference && connection && getEntityReference(connection);
              filterOptions.options[value] = {
                reference,
                label: connection ? getEntityTitle(connection, option.labels, contextIntl) : upperFirst(value),
                info: connection.getIn(['attributes', 'description']),
                showCount: true,
                value: `${typeId}:${value}`,
                count: 0,
                query,
                checked: true,
                tags: connection ? connection.get('categories') : null,
                draft: connection && connection.getIn(['attributes', 'draft']),
              };
            }
          }
        });
      }
      // also check for active without options
      if (locationQuery.get('without')) {
        locationQueryValue = locationQuery.get('without');
        asList(locationQueryValue).forEach((queryValue) => {
          if (`${query}:${typeId}` === queryValue) {
            filterOptions.options[queryValue] = {
              messagePrefix: messages.without,
              label: option.label,
              message: option.message,
              showCount: true,
              labelEmphasis: true,
              value: queryValue,
              count: 0,
              query: 'without',
              checked: true,
            };
          }
        });
      }
      // also check for active any options
      if (locationQuery.get('any')) {
        locationQueryValue = locationQuery.get('any');
        asList(locationQueryValue).forEach((queryValue) => {
          if (`${query}:${typeId}` === queryValue) {
            filterOptions.options[queryValue] = {
              messagePrefix: messages.any,
              label: option.label,
              message: option.message,
              showCount: true,
              labelEmphasis: true,
              value: queryValue,
              count: 0,
              query: 'any',
              checked: true,
            };
          }
        });
      }
    } else {
      entities.forEach((entity) => {
        // FK connection (1 : n)
        if (option.attribute) {
          let connection;
          const connectedAttributeId = entity.getIn(['attributes', 'parent_id']);
          if (connectedAttributeId) {
            connection = connections.getIn([path, connectedAttributeId.toString()]);
            if (connection) {
            // if not taxonomy already considered
              // optionConnections = optionConnections.push(connection);
              // if category already added
              if (filterOptions.options[connectedAttributeId]) {
                filterOptions.options[connectedAttributeId].count += 1;
              } else {
                const value = `${typeId}:${connectedAttributeId}`;
                const reference = showEntityReference && getEntityReference(connection);
                const label = getEntityTitle(connection, option.labels, contextIntl);
                filterOptions.options[connectedAttributeId] = {
                  reference,
                  label,
                  info: connection.getIn(['attributes', 'description']),
                  showCount: true,
                  value: `${typeId}:${connectedAttributeId}`,
                  count: 1,
                  query,
                  checked: optionChecked(locationQueryValue, value),
                  tags: connection.get('categories'),
                  draft: connection.getIn(['attributes', 'draft']),
                };
              }
            }
          }
          if (!connection) {
            if (filterOptions.options.without) {
              // no connection present
              // add without option
              filterOptions.options.without.count += 1;
            } else {
              let { message } = option;
              if (
                option.groupByType
                && option.messageByType
                && option.messageByType.indexOf('{typeid}') > -1
              ) {
                message = option.messageByTypemessageByType.replace('{typeid}', typeId);
              }
              filterOptions.options.without = {
                messagePrefix: messages.without,
                label: option.label,
                message,
                showCount: true,
                labelEmphasis: true,
                value: `att:${option.attribute}`,
                count: 1,
                query: 'without',
                checked: optionChecked(locationQuery.get('without'), `att:${option.attribute}`),
              };
            }
          }
          if (connection) {
            if (filterOptions.options.any) {
              // no connection present
              // add without option
              filterOptions.options.any.count += 1;
            } else {
              let { message } = option;
              if (
                option.groupByType
                && option.messageByType
                && option.messageByType.indexOf('{typeid}') > -1
              ) {
                message = option.messageByTypemessageByType.replace('{typeid}', typeId);
              }
              filterOptions.options.any = {
                messagePrefix: messages.any,
                label: option.label,
                message,
                showCount: true,
                labelEmphasis: true,
                value: `att:${option.attribute}`,
                count: 1,
                query: 'any',
                checked: optionChecked(locationQuery.get('any'), `att:${option.attribute}`),
              };
            }
          }
        // join connection (n : m)
        } else {
          let optionConnections = List();
          const entityConnections = entity.getIn([`${entityType}ByType`, parseInt(typeId, 10)]);
          // if entity has connected entities
          if (entityConnections) {
            // add connected entities if not present otherwise increase count
            entityConnections.forEach((connectedId) => {
              const connection = connections.getIn([path, connectedId.toString()]);
              // if not taxonomy already considered
              if (connection) {
                optionConnections = optionConnections.push(connection);
                // if category already added
                if (filterOptions.options[connectedId]) {
                  filterOptions.options[connectedId].count += 1;
                } else {
                  const value = `${typeId}:${connectedId}`;
                  const reference = showEntityReference && getEntityReference(connection);
                  const label = getEntityTitle(connection, option.labels, contextIntl);
                  filterOptions.options[connectedId] = {
                    reference,
                    label,
                    info: connection.getIn(['attributes', 'description']),
                    showCount: true,
                    value: `${typeId}:${connectedId}`,
                    count: 1,
                    query,
                    checked: optionChecked(locationQueryValue, value),
                    tags: connection.get('categories'),
                    draft: connection.getIn(['attributes', 'draft']),
                  };
                }
              }
            });
          }
          if (includeMembers) {
            const entityMemberConnections = entity.getIn([`${entityType}AssociationsByType`, parseInt(typeId, 10)]);
            // if entity has connected entities
            if (entityMemberConnections) {
              // add connected entities if not present otherwise increase count
              entityMemberConnections.forEach((connectedId) => {
                const connection = connections.getIn([path, connectedId.toString()]);
                // if not taxonomy already considered
                if (connection) {
                  optionConnections = optionConnections.push(connection);
                  // if category already added
                  if (filterOptions.options[connectedId]) {
                    filterOptions.options[connectedId].count += 1;
                  } else {
                    const value = `${typeId}:${connectedId}`;
                    const reference = showEntityReference && getEntityReference(connection);
                    const label = getEntityTitle(connection, option.labels, contextIntl);
                    filterOptions.options[connectedId] = {
                      reference,
                      label,
                      info: connection.getIn(['attributes', 'description']),
                      showCount: true,
                      value: `${typeId}:${connectedId}`,
                      count: 1,
                      query,
                      checked: optionChecked(locationQueryValue, value),
                      tags: connection.get('categories'),
                      draft: connection.getIn(['attributes', 'draft']),
                    };
                  }
                }
              });
            }
          }
          if (optionConnections.size === 0) {
            if (filterOptions.options.without) {
              // no connection present
              // add without option
              filterOptions.options.without.count += 1;
            } else {
              let { message } = option;
              if (
                option.groupByType
                && option.messageByType
                && option.messageByType.indexOf('{typeid}') > -1
              ) {
                message = option.messageByType.replace('{typeid}', typeId);
              }
              filterOptions.options.without = {
                messagePrefix: messages.without,
                label: option.label,
                message,
                showCount: true,
                labelEmphasis: true,
                value: `${entityType}_${typeId}`,
                count: 1,
                query: 'without',
                checked: optionChecked(locationQuery.get('without'), `${entityType}_${typeId}`),
              };
            }
          }
          if (optionConnections.size > 0) {
            if (filterOptions.options.any) {
              // no connection present
              // add without option
              filterOptions.options.any.count += 1;
            } else {
              let { message } = option;
              if (
                option.groupByType
                && option.messageByType
                && option.messageByType.indexOf('{typeid}') > -1
              ) {
                message = option.messageByType.replace('{typeid}', typeId);
              }
              filterOptions.options.any = {
                messagePrefix: messages.any,
                label: option.label,
                message,
                showCount: true,
                labelEmphasis: true,
                value: `${entityType}_${typeId}`,
                count: 1,
                query: 'any',
                checked: optionChecked(locationQuery.get('any'), `${entityType}_${typeId}`),
              };
            }
          }
        }
      }); // for each entities
    }
  }
  filterOptions.tagFilterGroups = option && makeTagFilterGroups(connectedTaxonomies, contextIntl);
  return filterOptions;
};
export const makeConnectionFilterOptions = (
  entities,
  config,
  connections,
  connectedTaxonomies,
  activeOptionId,
  locationQuery,
  messages,
  contextIntl,
  group,
  isManager,
) => {
  const filterOptions = {
    groupId: group,
    options: {},
    multiple: true,
    required: false,
    search: true,
    advanced: true,
    selectAll: false,
  };
  const option = config[group];
  // if option active
  if (option) {
    // the option path
    const { query, path } = option;
    const showEntityReference = getShowEntityReference(option.entityType, null, isManager);
    const entityType = option.entityTypeAs || option.entityType;
    filterOptions.messagePrefix = messages.titlePrefix;
    filterOptions.message = option.message;
    filterOptions.search = option.search;
    let locationQueryValue = locationQuery.get(query);
    // if no entities found show any active options
    if (entities.size === 0) {
      if (locationQueryValue) {
        asList(locationQueryValue).forEach((queryValue) => {
          const value = queryValue;
          const connection = connections.get(path) && connections.getIn([path, value]);
          const reference = showEntityReference && connection && getEntityReference(connection);
          filterOptions.options[value] = {
            reference,
            label: connection ? getEntityTitle(connection, option.labels, contextIntl) : upperFirst(value),
            info: connection.getIn(['attributes', 'description']),
            showCount: true,
            value,
            count: 0,
            query,
            checked: true,
            tags: connection ? connection.get('categories') : null,
            draft: connection && connection.getIn(['attributes', 'draft']),
          };
        });
      }
      // also check for active without options
      if (locationQuery.get('without')) {
        locationQueryValue = locationQuery.get('without');
        asList(locationQueryValue).forEach((queryValue) => {
          if (query === queryValue) {
            filterOptions.options[queryValue] = {
              messagePrefix: messages.without,
              label: option.label,
              message: option.message,
              showCount: true,
              labelEmphasis: true,
              value: queryValue,
              count: 0,
              query: 'without',
              checked: true,
            };
          }
        });
      }
    } else {
      entities.forEach((entity) => {
        // FK connection (1 : n)
        if (option.attribute) {
          let connection;
          const connectedAttributeId = entity.getIn(['attributes', 'parent_id']);
          if (connectedAttributeId) {
            connection = connections.getIn([path, connectedAttributeId.toString()]);
            if (connection) {
            // if not taxonomy already considered
              // optionConnections = optionConnections.push(connection);
              // if category already added
              if (filterOptions.options[connectedAttributeId]) {
                filterOptions.options[connectedAttributeId].count += 1;
              } else {
                const value = connectedAttributeId;
                const reference = showEntityReference && getEntityReference(connection);
                const label = getEntityTitle(connection, option.labels, contextIntl);
                filterOptions.options[connectedAttributeId] = {
                  reference,
                  label,
                  info: connection.getIn(['attributes', 'description']),
                  showCount: true,
                  value,
                  count: 1,
                  query,
                  checked: optionChecked(locationQueryValue, value),
                  tags: connection.get('categories'),
                  draft: connection.getIn(['attributes', 'draft']),
                };
              }
            }
          }
          if (!connection) {
            if (filterOptions.options.without) {
              // no connection present
              // add without option
              filterOptions.options.without.count += 1;
            } else {
              const { message } = option;
              filterOptions.options.without = {
                messagePrefix: messages.without,
                label: option.label,
                message,
                showCount: true,
                labelEmphasis: true,
                value: `att:${option.attribute}`,
                count: 1,
                query: 'without',
                checked: optionChecked(locationQuery.get('without'), `att:${option.attribute}`),
              };
            }
          }
        // join connection (n : m)
        } else {
          let optionConnections = List();
          const entityConnections = entity.get(entityType);
          // if entity has connected entities
          if (entityConnections) {
            // add connected entities if not present otherwise increase count
            entityConnections.forEach((connectedId) => {
              const connection = connections.getIn([entityType, connectedId.toString()]);
              if (connection) {
                optionConnections = optionConnections.push(connection);
                // if category already added
                if (filterOptions.options[connectedId]) {
                  filterOptions.options[connectedId].count += 1;
                } else {
                  const value = connectedId;
                  const reference = showEntityReference && getEntityReference(connection);
                  const label = getEntityTitle(connection, option.labels, contextIntl);
                  filterOptions.options[connectedId] = {
                    reference,
                    label,
                    info: connection.getIn(['attributes', 'description']),
                    showCount: true,
                    value,
                    count: 1,
                    query,
                    checked: optionChecked(locationQueryValue, value),
                    tags: connection.get('categories'),
                    draft: connection.getIn(['attributes', 'draft']),
                  };
                }
              }
            });
          }
          if (optionConnections.size === 0) {
            if (filterOptions.options.without) {
              // no connection present
              // add without option
              filterOptions.options.without.count += 1;
            } else {
              const { message } = option;
              filterOptions.options.without = {
                messagePrefix: messages.without,
                label: option.label,
                message,
                showCount: true,
                labelEmphasis: true,
                value: entityType,
                count: 1,
                query: 'without',
                checked: optionChecked(locationQuery.get('without'), entityType),
              };
            }
          }
        }
      }); // for each entities
    }
  }
  filterOptions.tagFilterGroups = option && makeTagFilterGroups(connectedTaxonomies, contextIntl);
  return filterOptions;
};
export const makeAnyWithoutConnectionFilterOptions = (
  config,
  locationQuery,
  messages,
  contextIntl,
  group,
) => {
  // get the active option
  const option = config[group];
  // if option active
  if (option) {
    // the option path
    // const { query, path } = option;
    const entityType = option.entityTypeAs || option.entityType;
    const withoutChecked = asList(locationQuery.get('without')).includes(entityType);
    const anyChecked = asList(locationQuery.get('any')).includes(entityType);
    const label = appMessages.nav[group]
      ? contextIntl.formatMessage(appMessages.nav[group])
      : 'LABEL NOT FOUND';
    return [
      {
        messagePrefix: messages.any,
        label,
        value: entityType,
        query: 'any',
        filterUI: 'checkbox',
        checked: anyChecked,
      },
      {
        messagePrefix: messages.without,
        label,
        value: entityType,
        query: 'without',
        filterUI: 'checkbox',
        checked: withoutChecked,
      },
    ];
  }
  return null;
};
