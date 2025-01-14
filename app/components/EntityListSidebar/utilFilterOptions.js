import { List } from 'immutable';
import { find, forEach } from 'lodash/collection';
import { upperFirst } from 'lodash/string';
import appMessages from 'containers/App/messages';

import { lowerCase } from 'utils/string';
import isNumber from 'utils/is-number';
import asArray from 'utils/as-array';
import asList from 'utils/as-list';
import qe from 'utils/quasi-equals';

import {
  testEntityCategoryAssociation,
  getEntityTitle,
  getEntityReference,
  getEntityParentId,
  checkActionAttribute,
  checkActorAttribute,
  getConnectedCategories,
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
  intl,
  messages,
  isAdmin,
  includeMembers,
  includeActorMembers,
  includeActorChildren,
  // any = true,
}) => {
  switch (activeFilterOption.group) {
  // create filterOptions
    case 'taxonomies':
      return makeTaxonomyFilterOptions({
        entities,
        config: config.taxonomies,
        taxonomies,
        activeTaxId: activeFilterOption.optionId,
        locationQuery,
        messages,
        intl,
      //  any,
      });
    case 'connectedTaxonomies':
      return makeConnectedTaxonomyFilterOptions(
        entities,
        config,
        connectedTaxonomies,
        activeFilterOption.optionId,
        locationQuery,
        messages,
        intl,
      );
    case 'actors':
    case 'actions':
    case 'members':
    case 'associations':
    case 'resources':
    case 'parents':
    case 'children':
      return makeGroupedConnectionFilterOptions({
        entities,
        config: config.connections,
        connections,
        connectedTaxonomies,
        activeOptionId: activeFilterOption.optionId,
        locationQuery,
        messages,
        intl,
        group: activeFilterOption.group,
        isAdmin,
        includeMembers,
        includeActorMembers,
        includeActorChildren,
      //  any,
      });
    case 'users':
    case 'indicators':
    case 'roles':
      return makeConnectionFilterOptions({
        entities,
        config: config.connections,
        connections,
        connectedTaxonomies,
        activeOptionId: activeFilterOption.optionId,
        locationQuery,
        messages,
        intl,
        group: activeFilterOption.group,
        isAdmin,
      //  any,
      });
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
  intl,
  messages,
}) => {
  // create filterOptions
  switch (activeFilterOption.group) {
    case 'actors':
    case 'actions':
    case 'members':
    case 'associations':
    case 'resources':
    case 'indicators':
    case 'parents':
    case 'children':
      return makeAnyWithoutConnectionFilterOptions(
        config.connections,
        locationQuery,
        messages,
        intl,
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


const getTaxTitle = (id, intl) => intl.formatMessage(appMessages.entities.taxonomies[id].single);

export const makeTaxonomyFilterOptions = ({
  entities,
  config,
  taxonomies,
  activeTaxId,
  locationQuery,
  messages,
  intl,
//  any,
}) => {
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
    filterOptions.title = `${messages.titlePrefix} ${lowerCase(getTaxTitle(parseInt(taxonomy.get('id'), 10), intl))}`;
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
              label: `${messages.without} ${lowerCase(getTaxTitle(parseInt(taxonomy.get('id'), 10), intl))}`,
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
              label: `${messages.without} ${lowerCase(getTaxTitle(parseInt(taxonomy.get('id'), 10), intl))}`,
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


const getShowEntityReference = (entityType, typeId, isAdmin) => {
  if (typeId && entityType === 'actions') {
    return checkActionAttribute(typeId, 'code', isAdmin);
  }
  if (typeId && entityType === 'actors') {
    return checkActorAttribute(typeId, 'code', isAdmin);
  }
  if (!typeId || entityType === 'indicators') {
    return false;
  }
  return true;
};
//
//
//
const makeGroupedConnectionFilterOptions = ({
  entities,
  config,
  connections,
  connectedTaxonomies,
  activeOptionId,
  locationQuery,
  messages,
  intl,
  group,
  isAdmin,
  includeMembers,
  includeActorMembers,
  includeActorChildren,
//  any,
}) => {
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
    const showEntityReference = getShowEntityReference(option.entityType, typeId, isAdmin);
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
                label: connection ? getEntityTitle(connection, option.labels, intl) : upperFirst(value),
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
              if (!filterOptions.options[connectedAttributeId]) {
                const value = `${typeId}:${connectedAttributeId}`;
                const reference = showEntityReference && getEntityReference(connection);
                const label = getEntityTitle(connection, option.labels, intl);
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
                  const label = getEntityTitle(connection, option.labels, intl);
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
          if (includeMembers
            && (option.type === 'action-actors' || option.type === 'member-associations')
          ) {
            let entityMemberConnections;
            if (option.type === 'action-actors') {
              entityMemberConnections = entity.getIn([`${entityType}AssociationsByType`, parseInt(typeId, 10)]);
            } else {
              entityMemberConnections = entity.getIn(['associationsAssociationsByType', parseInt(typeId, 10)]);
            }
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
                    const label = getEntityTitle(connection, option.labels, intl);
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
          if (includeActorMembers && option.type === 'actor-actions') {
            const entityMemberConnections = entity.getIn(['actionsAsMemberByType', parseInt(typeId, 10)]);
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
                    const label = getEntityTitle(connection, option.labels, intl);
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
            // console.log(optionConnections && optionConnections.toJS())
          }
          if (includeActorChildren && option.type === 'actor-actions') {
            const entityMemberConnections = entity.getIn(['actionsAsParentByType', parseInt(typeId, 10)]);
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
                    const label = getEntityTitle(connection, option.labels, intl);
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
            // console.log(optionConnections && optionConnections.toJS())
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
  // console.log('filterOptions', filterOptions.options)
  filterOptions.tagFilterGroups = option && makeTagFilterGroups(connectedTaxonomies, intl);
  return filterOptions;
};
const getConnectionAttributeFilterOptions = ({
  filterOptions,
  option,
  entities,
  messages,
  intl,
  locationQuery,
}) => {
  const resultOptions = {
    ...filterOptions,
    messagePrefix: messages.titlePrefix,
    message: option.message,
  };
  const {
    path,
    options,
    attribute,
    optionMessages,
  } = option;
  const locationQueryValue = locationQuery.get('xwhere');
  if (entities.size === 0) {
    if (locationQueryValue) {
      asList(locationQueryValue).forEach((lqv) => {
        // if no entities found show any active options
        const [queryPath, queryAttributeValue] = lqv.split('|');
        const [queryAttribute, queryValue] = queryAttributeValue.split(':');
        if (path === queryPath && attribute === queryAttribute) {
          const value = queryValue;
          const attributeOption = options[value];
          if (attributeOption) {
            resultOptions.options[value] = {
              value: lqv,
              label: intl.formatMessage(appMessages[optionMessages][value]),
              query: 'xwhere',
              checked: true,
            };
          }
        }
      });
    }
  } else {
    resultOptions.options = Object.values(options).reduce(
      (memo, o) => {
        if (entities.some(
          (entity) => {
            const connectionAttributes = entity.get(path);
            return connectionAttributes && connectionAttributes.some(
              (ca) => qe(ca.get(attribute), o.value)
                || (qe(o.value, 0) && !ca.get(attribute)),
            );
          }
        )) {
          const queryValue = `${path}|${attribute}:${o.value}`;
          const checked = asList(locationQueryValue).indexOf(queryValue) > -1;
          return ({
            ...memo,
            [o.value]: {
              value: queryValue,
              label: intl.formatMessage(appMessages[optionMessages][o.value]),
              checked,
              query: 'xwhere',
            },
          });
        }
        return memo;
      },
      {}
    ); // reduce
  }
  return resultOptions;
};

const getConnectionFilterOptions = ({
  filterOptions,
  option,
  entities,
  isAdmin,
  messages,
  intl,
  locationQuery,
  connections,
}) => {
  const resultOptions = {
    ...filterOptions,
    messagePrefix: messages.titlePrefix,
    message: option.message,
    search: option.search,
    sort: option.sort,
  };
  const { query, path } = option;
  const showEntityReference = getShowEntityReference(option.entityType, null, isAdmin);
  const entityType = option.entityTypeAs || option.entityType;
  let locationQueryValue = locationQuery.get(query);

  // console.log('option', option);
  // if no entities found show any active options
  if (entities.size === 0) {
    if (locationQueryValue) {
      asList(locationQueryValue).forEach((queryValue) => {
        const value = queryValue.split('>')[0];
        const connection = connections.get(path) && connections.getIn([path, value]);
        const reference = showEntityReference && connection && getEntityReference(connection);
        resultOptions.options[value] = {
          reference,
          label: connection ? getEntityTitle(connection, option.labels, intl) : upperFirst(value),
          info: connection && connection.getIn(['attributes', 'description']),
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
          resultOptions.options[queryValue] = {
            messagePrefix: messages.without,
            label: option.label,
            message: option.message,
            showCount: true,
            labelEmphasis: true,
            value: queryValue,
            count: 0,
            query: 'without',
            checked: true,
            sortValue: '-1',
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
              resultOptions.options[connectedAttributeId].count += 1;
            } else {
              const value = connectedAttributeId;
              const reference = showEntityReference && getEntityReference(connection);
              const label = getEntityTitle(connection, option.labels, intl);
              resultOptions.options[connectedAttributeId] = {
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
          if (resultOptions.options.without) {
            // no connection present
            // add without option
            resultOptions.options.without.count += 1;
          } else {
            const { message } = option;
            resultOptions.options.without = {
              messagePrefix: messages.without,
              label: option.label,
              message,
              showCount: true,
              labelEmphasis: true,
              value: `att:${option.attribute}`,
              count: 1,
              query: 'without',
              checked: optionChecked(locationQuery.get('without'), `att:${option.attribute}`),
              order: '-1',
            };
          }
        }
      // join connection (n : m)
      } else {
        let optionConnections = false;
        const entityConnections = entity.get(entityType);
        // if entity has connected entities
        // console.log('entityConnections', entityConnections && entityConnections.toJS())
        if (entityConnections) {
          // add connected entities if not present otherwise increase count
          entityConnections.forEach((connectedId) => {
            // console.log('connectedId', connectedId)
            const connection = connections.getIn([entityType, connectedId.toString()]);
            if (connection && !resultOptions.options[connectedId]) {
              optionConnections = true;
              const value = connectedId;
              const reference = showEntityReference && getEntityReference(connection);
              const label = getEntityTitle(connection, option.labels, intl);
              let sortValue = label;
              if (option.sort === 'referenceThenTitle') {
                sortValue = connection.getIn(['attributes', 'reference']) || sortValue;
              }
              resultOptions.options[connectedId] = {
                reference,
                label,
                info: connection.getIn(['attributes', 'description']),
                value,
                count: 1,
                query,
                checked: optionChecked(locationQueryValue, value),
                tags: connection.get('categories'),
                draft: connection.getIn(['attributes', 'draft']),
                order: sortValue,
              };
              // }
            }
          });
        }
        if (!optionConnections) {
          if (resultOptions.options.without) {
            // no connection present
            // add without option
            resultOptions.options.without.count += 1;
          } else {
            const { message } = option;
            resultOptions.options.without = {
              messagePrefix: messages.without,
              label: option.label,
              message,
              showCount: true,
              labelEmphasis: true,
              value: entityType,
              count: 1,
              query: 'without',
              checked: optionChecked(locationQuery.get('without'), entityType),
              order: '-1',
            };
          }
        }
      }
    }); // for each entities
  }
  return resultOptions;
};

const makeConnectionFilterOptions = ({
  entities,
  config,
  connections,
  connectedTaxonomies,
  activeOptionId,
  locationQuery,
  messages,
  intl,
  group,
  isAdmin,
//  any,
}) => {
  let filterOptions = {};
  const option = config[group];
  // if option active
  if (option) {
    // make sure we don't have a "connection-attribute" option
    if (option.type === activeOptionId) {
      filterOptions = getConnectionFilterOptions({
        option,
        filterOptions: {
          groupId: group,
          options: {},
          multiple: true,
          required: false,
          search: true,
          advanced: true,
          selectAll: false,
        },
        entities,
        isAdmin,
        messages,
        intl,
        locationQuery,
        connections,
      });
      filterOptions.tagFilterGroups = option && makeTagFilterGroups(connectedTaxonomies, intl);
    } else if (
      option.connectionAttributeFilter
      && option.connectionAttributeFilter.path === activeOptionId
    ) {
      // "connection-attribute" option
      filterOptions = getConnectionAttributeFilterOptions({
        filterOptions: {
          groupId: group,
          options: {},
          multiple: true,
          required: false,
          search: false,
          advanced: false,
          selectAll: false,
        },
        option: option.connectionAttributeFilter,
        entities,
        messages,
        intl,
        locationQuery,
      });
    }
  }
  return filterOptions;
};
export const makeAnyWithoutConnectionFilterOptions = (
  config,
  locationQuery,
  messages,
  intl,
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
      ? intl.formatMessage(appMessages.nav[group])
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

export const makeConnectedTaxonomyFilterOptions = (
  entities,
  config,
  connectedTaxonomies,
  activeOptionId,
  locationQuery,
  messages,
  intl,
) => {
  const filterOptions = {
    groupId: 'connectedTaxonomies',
    search: config.connectedTaxonomies.search,
    options: {},
    multiple: true,
    required: false,
    selectAll: false,
    groups: null,
  };

  const taxonomy = connectedTaxonomies.get(activeOptionId);
  if (taxonomy) {
    // figure out parent taxonomy for nested grouping
    const parentId = getEntityParentId(taxonomy);
    const parent = parentId && connectedTaxonomies.get(parentId);
    if (parent) {
      filterOptions.groups = parent.get('categories').map((cat) => getEntityTitle(cat));
    }
    filterOptions.title = `${messages.titlePrefix} ${lowerCase(getTaxTitle(parseInt(taxonomy.get('id'), 10), intl))}`;
    const { query } = config.connectedTaxonomies;
    const locationQueryValue = locationQuery.get(query);
    const connection = config.connectedTaxonomies;
    if (entities.size === 0) {
      if (locationQueryValue) {
        asList(locationQueryValue).forEach((queryValue) => {
          const locationQueryValueCategory = queryValue.split(':');
          if (locationQueryValueCategory.length > 1) {
            // for each connection
            if (connection.path === locationQueryValueCategory[0]) {
              const categoryId = parseInt(locationQueryValueCategory[1], 10);
              if (taxonomy.getIn(['categories', categoryId])) {
                const category = taxonomy.getIn(['categories', categoryId]);
                filterOptions.options[categoryId] = {
                  reference: getEntityReference(category, false),
                  label: getEntityTitle(category),
                  group: parent && getEntityParentId(category),
                  showCount: true,
                  value: `${connection.path}:${categoryId}`,
                  count: 0,
                  query,
                  checked: true,
                };
              }
            }
          }
        });
      }
    } else {
      entities.forEach((entity) => {
        // connection eg recommendations
        // if entity has taxonomies
        if (entity.get(connection.path)) { // action.recommendations stores recommendation_measures
          // add categories from entities for taxonomy
          const categories = getConnectedCategories(
            entity.get(connection.path),
            taxonomy.get('categories'),
            connection.otherPath || connection.path,
          );
          categories.forEach((category) => {
            // if category already added
            if (filterOptions.options[category.get('id')]) {
              filterOptions.options[category.get('id')].count += 1;
            } else {
              const value = `${connection.otherPath || connection.path}:${category.get('id')}`;
              const label = getEntityTitle(category);
              filterOptions.options[category.get('id')] = {
                reference: getEntityReference(category, false),
                group: parent && getEntityParentId(category),
                label,
                showCount: true,
                value,
                count: 1,
                query,
                checked: optionChecked(locationQueryValue, value),
              };
            }
          });
        }
      });
    }
  }
  return filterOptions;
};
