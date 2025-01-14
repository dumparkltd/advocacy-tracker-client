import { reduce } from 'lodash/collection';
import { sortEntities } from 'utils/sort';
import { startsWith } from 'utils/string';
import qe from 'utils/quasi-equals';
import isNumber from 'utils/is-number';

import appMessages from 'containers/App/messages';
import { fromJS } from 'immutable';
import {
  // ACTIONTYPES,
  INDICATOR_ACTIONTYPES,
  INDICATOR_ACTION_ACTORTYPES,
  USER_ACTIONTYPES,
  USER_ACTORTYPES,
  ACTIONTYPE_ACTIONTYPES,
} from 'themes/config';

import appMessage from 'utils/app-message';

import {
  makeAttributeFilterOptions,
  makeAnyWithoutFilterOptions,
  makeActiveFilterOptions,
} from './utilFilterOptions';

// figure out filter groups for filter panel
const makeFilterGroups = ({
  config,
  taxonomies,
  hasUserRole,
  actortypes,
  actiontypes,
  resourcetypes,
  activeFilterOption,
  membertypes,
  associationtypes,
  messages,
  typeId,
  intl,
  currentFilters,
  locationQuery,
  includeMembers,
  connectedTaxonomies,
}) => {
  const filterGroups = {};

  // attributes
  if (config.attributes) {
    const groupCurrentFilters = currentFilters && currentFilters.filter(
      (f) => qe(f.type, 'attributes')
    );
    // first prepare taxonomy options
    filterGroups.attributes = {
      id: 'attributes', // filterGroupId
      label: messages.attributes,
      show: true,
      optionsActiveCount: groupCurrentFilters ? groupCurrentFilters.length : 0,
      options: reduce(
        config.attributes.options,
        (memo, option) => {
          if (
            (
              typeof option.role === 'undefined'
              || (hasUserRole && hasUserRole[option.role])
            )
            && (
              typeof option.types === 'undefined'
              || option.types.indexOf(typeId) > -1
            )
          ) {
            const attributeFilterOptions = option.filterUI
              && option.filterUI === 'checkboxes'
              && makeAttributeFilterOptions({
                config: config.attributes,
                activeOptionId: option.attribute,
                locationQueryValue: locationQuery.get('where'),
              });
            return memo.concat([{
              id: option.attribute, // filterOptionId
              label: option.label,
              filterUI: option.filterUI,
              message: option.message,
              options: attributeFilterOptions && attributeFilterOptions.options,
            }]);
          }
          return memo;
        },
        [],
      ),
    };
  }
  // taxonomy option group
  if (config.taxonomies && taxonomies) {
    // first prepare taxonomy options
    const groupCurrentFilters = currentFilters && currentFilters.filter(
      (f) => qe(f.groupId, 'taxonomies')
    );
    filterGroups.taxonomies = {
      id: 'taxonomies', // filterGroupId
      label: messages.taxonomyGroup,
      show: true,
      optionsActiveCount: groupCurrentFilters ? groupCurrentFilters.length : 0,
      options:
        sortEntities(taxonomies, 'asc', 'priority')
          .reduce(
            (memo, taxonomy) => {
              const optionCurrentFilters = currentFilters && currentFilters.filter(
                (f) => qe(f.optionId, taxonomy.get('id')) && qe(f.groupId, 'taxonomies')
              );
              return memo.concat([
                {
                  id: taxonomy.get('id'), // filterOptionId
                  label: messages.taxonomies(taxonomy.get('id')),
                  info: intl.formatMessage(appMessages.entities.taxonomies[taxonomy.get('id')].description),
                  active: !!activeFilterOption
                    && activeFilterOption.group === 'taxonomies'
                    && activeFilterOption.optionId === taxonomy.get('id'),
                  nested: taxonomy.getIn(['attributes', 'parent_id']),
                  currentFilters: optionCurrentFilters,
                },
              ]);
            },
            [],
          ),
    };
  }

  // connections option group
  if (config.connections) {
    Object.keys(config.connections).forEach((connectionKey) => {
      const option = config.connections[connectionKey];
      const groupCurrentFilters = currentFilters && currentFilters.filter(
        (f) => qe(f.groupId, connectionKey)
      );
      if (!option.groupByType) {
        let validType = true;
        if (option.type === 'action-indicators') {
          validType = INDICATOR_ACTIONTYPES.indexOf(typeId) > -1;
        }
        if (option.type === 'actor-action-indicators') {
          validType = INDICATOR_ACTION_ACTORTYPES.indexOf(typeId) > -1;
        }
        if (option.type === 'action-users') {
          validType = USER_ACTIONTYPES.indexOf(typeId) > -1;
        }
        if (option.type === 'actor-users') {
          validType = USER_ACTORTYPES.indexOf(typeId) > -1;
        }
        if (validType) {
          const optionCurrentFilters = currentFilters && currentFilters.filter(
            (f) => qe(f.groupId, connectionKey)
          );
          filterGroups[connectionKey] = {
            id: connectionKey, // filterGroupId
            label: messages.connections(option.type),
            show: true,
            optionsActiveCount: groupCurrentFilters ? groupCurrentFilters.length : 0,
            options: [{
              id: option.type, // filterOptionId
              label: option.label,
              message: option.message,
              active: !!activeFilterOption
                && activeFilterOption.group === connectionKey
                && activeFilterOption.optionId === option.type,
              currentFilters: optionCurrentFilters,
              ...option,
            }],
          };
        }
      } else {
        let types;
        let typeAbout;
        switch (option.type) {
          case 'actor-actions':
          case 'resource-actions':
          case 'action-parents':
          case 'action-children':
          case 'indicator-actions':
          case 'user-actions':
            types = actiontypes;
            break;
          case 'action-actors':
          case 'user-actors':
            types = actortypes;
            break;
          case 'association-members':
            types = membertypes;
            break;
          case 'member-associations':
            types = associationtypes;
            break;
          case 'action-resources':
            types = resourcetypes;
            break;
          default:
            break;
        }
        switch (option.type) {
          case 'action-actors':
            typeAbout = 'actortypes_about';
            break;
          case 'actor-actions':
            typeAbout = 'actiontypes_about';
            break;
          case 'resource-actions':
            typeAbout = 'actiontypes_about';
            break;
          case 'association-members':
            typeAbout = 'actortypes_about';
            break;
          case 'member-associations':
            typeAbout = 'actortypes_about';
            break;
          case 'action-resources':
            typeAbout = 'resourcetypes_about';
            break;
          case 'indicator-actions':
            typeAbout = 'actiontypes_about';
            break;
          case 'user-actions':
            typeAbout = 'actiontypes_about';
            break;
          case 'user-actors':
            typeAbout = 'actortypes_about';
            break;
          default:
            break;
        }
        filterGroups[connectionKey] = {
          id: connectionKey, // filterGroupId
          label: messages.connections(option.type),
          show: true,
          optionsActiveCount: groupCurrentFilters ? groupCurrentFilters.length : 0,
          includeAnyWithout: !!option.groupByType,
          options: types && types
            .filter((type) => {
              if (option.type === 'action-parents') {
                return ACTIONTYPE_ACTIONTYPES[typeId] && ACTIONTYPE_ACTIONTYPES[typeId].indexOf(type.get('id')) > -1;
              }
              if (option.type === 'action-children') {
                const validActiontypeIds = Object.keys(ACTIONTYPE_ACTIONTYPES).filter((actiontypeId) => {
                  const actiontypeIds = ACTIONTYPE_ACTIONTYPES[actiontypeId];
                  return actiontypeIds && actiontypeIds.indexOf(typeId) > -1;
                });
                return validActiontypeIds.indexOf(type.get('id')) > -1;
              }
              if (option.typeFilterPass === 'reverse') {
                return !type.getIn(['attributes', option.typeFilter]);
              }
              if (!option.typeFilter) return true;
              let attribute = option.typeFilter;
              const notFilter = startsWith(option.typeFilter, '!');
              if (notFilter) {
                attribute = option.typeFilter.substring(1);
              }
              const typeCondition = notFilter
                ? !type.getIn(['attributes', attribute])
                : type.getIn(['attributes', attribute]);
              if (includeMembers && option.typeMemberFilter) {
                return typeCondition || type.getIn(['attributes', option.typeMemberFilter]);
              }
              return typeCondition;
            })
            .reduce((memo, type) => {
              let memberType;
              if (option.typeFilter) {
                let attribute = option.typeFilter;
                const notFilter = startsWith(option.typeFilter, '!');
                if (notFilter) {
                  attribute = option.typeFilter.substring(1);
                }
                const properType = notFilter
                  ? !type.getIn(['attributes', attribute])
                  : type.getIn(['attributes', attribute]);
                if (includeMembers && option.typeMemberFilter) {
                  memberType = !properType && type.getIn(['attributes', option.typeMemberFilter]);
                }
              }

              const id = option.attribute || type.get('id');
              const optionCurrentFilters = currentFilters && currentFilters.filter(
                (f) => qe(f.optionId, id) && qe(f.groupId, connectionKey)
              );
              let { label } = option;
              if (intl) {
                const msg = (option.messageByType
                  && option.messageByType.indexOf('{typeid}') > -1
                )
                  ? option.messageByType.replace('{typeid}', type.get('id'))
                  : option.message;
                label = appMessage(intl, msg);
              }
              if (type.get('viaMember')) {
                label = `${label} (via member countries only)`;
              }
              return memo.concat({
                id, // filterOptionId
                label,
                disabled: type.get('viaMember') && !includeMembers,
                info: typeAbout
                  && appMessages[typeAbout]
                  && appMessages[typeAbout][type.get('id')]
                  && intl.formatMessage(appMessages[typeAbout][type.get('id')]),
                color: option.entityType,
                active: !!activeFilterOption
                  && activeFilterOption.group === connectionKey
                  && activeFilterOption.optionId === id,
                currentFilters: optionCurrentFilters,
                memberType,
              });
            }, []),
        };
      }
    });
  }
  // connectedTaxonomies option group
  if (config.connectedTaxonomies && connectedTaxonomies) {
    // first prepare taxonomy options
    filterGroups.connectedTaxonomies = {
      id: 'connectedTaxonomies', // filterGroupId
      label: messages.connectedTaxonomies,
      show: true,
      options: connectedTaxonomies
        .reduce(
          (taxOptionsMemo, taxonomy) => {
            if (
              config.connectedTaxonomies.exclude
              && taxonomy.getIn(['attributes', config.connectedTaxonomies.exclude])
            ) {
              return taxOptionsMemo;
            }
            return taxOptionsMemo.concat([
              {
                id: taxonomy.get('id'), // filterOptionId
                label: messages.taxonomies(taxonomy.get('id')),
                active: !!activeFilterOption && activeFilterOption.optionId === taxonomy.get('id'),
                nested: taxonomy.getIn(['attributes', 'parent_id']),
              },
            ]);
          },
          [],
        ),
    };
  }
  return filterGroups;
};

export const makePanelFilterGroups = ({
  config,
  taxonomies,
  connectedTaxonomies,
  hasUserRole,
  actortypes,
  resourcetypes,
  actiontypes,
  membertypes,
  associationtypes,
  activeOption,
  currentFilters,
  typeId,
  intl,
  locationQuery,
  includeMembersWhenFiltering,
  messages,
}) => {
  let panelGroups = null;
  panelGroups = makeFilterGroups({
    config,
    taxonomies,
    connectedTaxonomies,
    hasUserRole,
    actortypes,
    resourcetypes,
    actiontypes,
    membertypes,
    associationtypes,
    activeFilterOption: activeOption,
    currentFilters,
    typeId,
    intl,
    locationQuery,
    messages,
    includeMembers: includeMembersWhenFiltering,
  });
  panelGroups = Object.keys(panelGroups).reduce(
    (memo, groupId) => {
      const group = panelGroups[groupId];
      if (group.includeAnyWithout && group.options && group.options.length > 0) {
        const allAnyOptions = makeAnyWithoutFilterOptions({
          config,
          locationQuery,
          activeFilterOption: {
            group: groupId,
          },
          intl,
          messages,
        });
        return {
          ...memo,
          [groupId]: {
            ...group,
            optionsGeneral: allAnyOptions,
          },
        };
      }
      return {
        ...memo,
        [groupId]: group,
      };
    },
    {},
  );
  return panelGroups;
};


export const makeQuickFilterGroups = ({
  config,
  typeId,
  actortypes,
  resourcetypes,
  actiontypes,
  membertypes,
  associationtypes,
  includeMembers,
  taxonomies,
  connectedTaxonomies,
  // hasUserRole,
  currentFilters,
  locationQuery,
  intl,
  entities,
  connections,
  messages,
  isAdmin,
  includeActorMembers,
  includeActorChildren,
  onUpdateFilters,
  onUpdateQuery,
}) => {
  const groups = config.quickFilterGroups.reduce(
    (memo, group) => {
      if (group.option && config[group.option]) {
        if (group.option === 'connections') {
          if (group.connection && config.connections[group.connection]) {
            const connectionOption = config.connections[group.connection];
            if (!group.groupByType) {
              let validType = true;
              if (connectionOption.type === 'action-indicators') {
                validType = INDICATOR_ACTIONTYPES.indexOf(typeId) > -1;
              }
              if (connectionOption.type === 'action-users') {
                validType = USER_ACTIONTYPES.indexOf(typeId) > -1;
              }
              if (connectionOption.type === 'actor-users') {
                validType = USER_ACTORTYPES.indexOf(typeId) > -1;
              }
              if (validType) {
                const filterOptions = makeActiveFilterOptions({
                  entities,
                  config,
                  locationQuery,
                  taxonomies,
                  connections,
                  connectedTaxonomies,
                  activeFilterOption: {
                    group: group.connection,
                    optionId: connectionOption.type,
                  },
                  intl,
                  messages,
                  isAdmin,
                  includeMembers,
                  includeActorMembers,
                  includeActorChildren,
                  without: false,
                });

                let filters = [];
                const activeOption = filterOptions && filterOptions.options && Object.values(filterOptions.options).find((o) => o.checked);
                const activeWithoutOption = filterOptions && filterOptions.options && Object.values(filterOptions.options).find((o) => o.checked && o.query === 'without');
                if (activeOption) {
                  filters = Object.values(filterOptions.options).reduce(
                    (memo2, o) => {
                      if (o.checked) {
                        let filter = {
                          id: `${connectionOption.type}-${o.value}`, // filterOptionId
                          filterType: 'dropdownSelect',
                          dropdownLabel: group.dropdownLabel,
                          search: group.search,
                          options: [o],
                          onClear: (value, query) => {
                            onUpdateFilters(fromJS([
                              {
                                hasChanged: true,
                                query: query || connectionOption.query,
                                checked: false,
                                value,
                              },
                            ]));
                          },
                        };
                        if (
                          connectionOption
                          && connectionOption.connectionAttributeFilter
                          && connectionOption.connectionAttributeFilter.options
                          && !activeWithoutOption
                        ) {
                          const optionCAF = connectionOption.connectionAttributeFilter;
                          const optionCurrentFilter = currentFilters && currentFilters.find(
                            (f) => qe(f.query, o.query) && qe(f.queryValue.split('>')[0], o.value)
                          );
                          const cafOptions = Object.values(optionCAF.options)
                            .map((cafo) => {
                              const label = intl.formatMessage(appMessages[optionCAF.optionMessages][cafo.value]);
                              let checked = false;
                              if (
                                optionCurrentFilter
                                && optionCurrentFilter.connectedAttributes
                                && optionCurrentFilter.connectedAttributes.find(
                                  (att) => qe(att.value, cafo.value)
                                )
                              ) {
                                checked = true;
                              }
                              return {
                                ...cafo,
                                label,
                                checked,
                                onClick: () => {
                                  const [value] = optionCurrentFilter.queryValue.split('>');

                                  let newValues = [];
                                  if (optionCurrentFilter.connectedAttributes) {
                                    newValues = optionCurrentFilter.connectedAttributes.map((cafo2) => cafo2.value);
                                  }
                                  if (checked) {
                                    newValues = newValues.filter((val) => val !== cafo.value);
                                  } else {
                                    newValues = [...newValues, cafo.value];
                                  }
                                  onUpdateQuery({
                                    arg: optionCurrentFilter.query,
                                    value: newValues.length > 0
                                      ? `${value}>${optionCAF.attribute}=${newValues.join('|')}`
                                      : value,
                                    prevValue: optionCurrentFilter.queryValue,
                                    replace: true,
                                  });
                                },
                              };
                            })
                            .sort((a, b) => {
                              const valueA = a.order || a.label;
                              const valueB = b.order || b.label;
                              if (isNumber(valueA) && isNumber(valueB)) {
                                return parseInt(valueA, 10) < parseInt(valueB, 10) ? -1 : 1;
                              }
                              return valueA < valueB ? -1 : 1;
                            });
                          if (cafOptions) {
                            filter = {
                              ...filter,
                              connectionAttributeFilterOptions: {
                                id: `${connectionOption.type}-${o.value}-caf`, // filterOptionId
                                filterType: 'pills',
                                label: `Specify ${intl.formatMessage(appMessages.attributes[optionCAF.attribute])}`,
                                options: cafOptions,
                              },
                            };
                          }
                        }
                        return [
                          ...memo2,
                          filter,
                        ];
                      }
                      return memo2;
                    },
                    filters,
                  );
                }
                if (filters.length < 5 && !activeWithoutOption) {
                  filters = [
                    ...filters,
                    {
                      id: connectionOption.type, // filterOptionId
                      filterType: 'dropdownSelect',
                      dropdownLabel: group.dropdownLabel,
                      search: group.search,
                      label: activeOption ? 'Add another filter' : null,
                      options: filterOptions && filterOptions.options && Object.keys(filterOptions.options).reduce(
                        (memo2, key) => {
                          const o = filterOptions.options[key];
                          if (activeOption && o.query === 'without') {
                            return memo2;
                          }
                          return o.checked
                            ? memo2
                            : {
                              ...memo2,
                              [key]: o,
                            };
                        },
                        {},
                      ),
                      onSelect: (value, query) => {
                        onUpdateFilters(fromJS([
                          {
                            hasChanged: true,
                            query: query || connectionOption.query,
                            value,
                            replace: false,
                            checked: true,
                          },
                        ]));
                      },
                    },
                  ];
                }
                return [
                  ...memo,
                  {
                    id: group.connection, // filterGroupId
                    label: group.title,
                    show: true,
                    filters,
                  },
                ];
              }
            } else {
              let types;
              switch (connectionOption.type) {
                case 'actor-actions':
                case 'resource-actions':
                case 'action-parents':
                case 'action-children':
                case 'indicator-actions':
                case 'user-actions':
                  types = actiontypes;
                  break;
                case 'action-actors':
                case 'user-actors':
                  types = actortypes;
                  break;
                case 'association-members':
                  types = membertypes;
                  break;
                case 'member-associations':
                  types = associationtypes;
                  break;
                case 'action-resources':
                  types = resourcetypes;
                  break;
                default:
                  break;
              }
              return [
                ...memo,
                {
                  id: group.connection, // filterGroupId
                  label: group.title,
                  show: true,
                  filters: types && types
                    .filter((type) => {
                      if (group.types && group.types.indexOf(type.get('id')) === -1) {
                        return false;
                      }
                      if (connectionOption.type === 'action-parents') {
                        return ACTIONTYPE_ACTIONTYPES[typeId] && ACTIONTYPE_ACTIONTYPES[typeId].indexOf(type.get('id')) > -1;
                      }
                      if (connectionOption.type === 'action-children') {
                        const validActiontypeIds = Object.keys(ACTIONTYPE_ACTIONTYPES).filter((actiontypeId) => {
                          const actiontypeIds = ACTIONTYPE_ACTIONTYPES[actiontypeId];
                          return actiontypeIds && actiontypeIds.indexOf(typeId) > -1;
                        });
                        return validActiontypeIds.indexOf(type.get('id')) > -1;
                      }
                      return true;
                    }).reduce(
                      (memo2, type) => {
                        let { label } = connectionOption;
                        if (intl) {
                          const msg = (connectionOption.messageByType
                            && connectionOption.messageByType.indexOf('{typeid}') > -1
                          )
                            ? connectionOption.messageByType.replace('{typeid}', type.get('id'))
                            : connectionOption.message;
                          label = appMessage(intl, msg);
                        }
                        if (type.get('viaMember')) {
                          label = `${label} (via member countries only)`;
                        }

                        const filterOptions = makeActiveFilterOptions({
                          entities,
                          config,
                          locationQuery,
                          taxonomies,
                          connections,
                          connectedTaxonomies,
                          activeFilterOption: {
                            group: group.connection,
                            optionId: type.get('id'),
                          },
                          intl,
                          messages,
                          isAdmin,
                          includeMembers,
                          includeActorMembers,
                          includeActorChildren,
                          without: false,
                        });
                        let filters = [];
                        const hasChecked = filterOptions && filterOptions.options && Object.values(filterOptions.options).find((o) => o.checked);
                        if (hasChecked) {
                          filters = Object.values(filterOptions.options).reduce(
                            (memo3, option) => {
                              if (option.checked) {
                                return [
                                  ...memo3,
                                  {
                                    id: `${connectionOption.type}-${type.get('id')}-${option.value}`, // filterOptionId
                                    filterType: 'dropdownSelect',
                                    dropdownLabel: group.dropdownLabel,
                                    search: group.search,
                                    options: [option],
                                    label: memo3.length === 0 ? label : null,
                                    onClear: (value, query) => {
                                      onUpdateFilters(fromJS([
                                        {
                                          hasChanged: true,
                                          query: query || connectionOption.query,
                                          checked: false,
                                          value,
                                        },
                                      ]));
                                    },
                                  },
                                ];
                              }
                              return memo3;
                            },
                            filters,
                          );
                        }
                        if (filters.length < 3) {
                          filters = [
                            ...filters,
                            {
                              id: `${connectionOption.type}-${type.get('id')}`, // filterOptionId
                              filterType: 'dropdownSelect',
                              dropdownLabel: group.dropdownLabel,
                              search: group.search,
                              label: !hasChecked ? label : null,
                              options: filterOptions && filterOptions.options && Object.keys(filterOptions.options).reduce(
                                (memo3, key) => {
                                  const val = filterOptions.options[key];
                                  return val.checked
                                    ? memo3
                                    : {
                                      ...memo3,
                                      [key]: val,
                                    };
                                },
                                {},
                              ),
                              onSelect: (value) => {
                                onUpdateFilters(fromJS([
                                  {
                                    hasChanged: true,
                                    query: connectionOption.query,
                                    value,
                                    replace: false,
                                    checked: true,
                                  },
                                ]));
                              },
                            },
                          ];
                        }
                        // console.log('filters', filters)
                        return [
                          ...memo2,
                          ...filters,
                        ];
                      },
                      [],
                    ),
                },
              ];
            }
          }
        }
      }
      return memo;
    },
    [],
  );
  return groups;
};
