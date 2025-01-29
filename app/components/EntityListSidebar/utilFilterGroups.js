import { reduce } from 'lodash/collection';
import { sortEntities } from 'utils/sort';
import { startsWith, lowerCase } from 'utils/string';
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

import messages from './messages'

import {
  makeAttributeFilterOptions,
  makeAnyWithoutFilterOptions,
  makeActiveFilterOptions,
  makeTaxonomyFilterOptions,
} from './utilFilterOptions';


// work out existing attribute filter options (ie supportlevels) from entities
const filterAttributeOptions = ({
  entities,
  filterValue,
  connectionOption,
  connectionAttributeValue,
}) => entities.some((e) => {
    let eConnections;
    // actors have the indicator positions stored like
    //  {
    //    indicatorPositions: {
    //      [indicatorId]: [...statementsWithPosition] // array of statements by indicator id
    //    }
    //  }
    if (connectionOption.byIndicator) {
      eConnections = e.getIn([connectionOption.path, filterValue]);
      return eConnections && eConnections.some(
        (c) => qe((c.get(connectionOption.attribute) || 0), connectionAttributeValue)
      );
    }
    // actions have the related indicators stored like
    //  {
    //    indicatorConnections: {
    //      ...statementsWithPosition // object of statements by statement id
    //    }
    //  }
    eConnections = e.get(connectionOption.path);
    return eConnections && eConnections.some(
      (c) => qe(c.get(connectionOption.connectionId), filterValue)
        && qe((c.get(connectionOption.attribute) || 0), connectionAttributeValue)
    );
});



// figure out filter groups for filter panel
const makeFilterGroups = ({
  config,
  entities,
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
      const connectionOption = config.connections[connectionKey];
      const groupCurrentFilters = currentFilters && currentFilters.filter(
        (f) => qe(f.groupId, connectionKey)
      );
      if (!connectionOption.groupByType) {
        let validType = true;
        if (connectionOption.type === 'action-indicators') {
          validType = INDICATOR_ACTIONTYPES.indexOf(typeId) > -1;
        }
        if (connectionOption.type === 'actor-action-indicators') {
          validType = INDICATOR_ACTION_ACTORTYPES.indexOf(typeId) > -1;
        }
        if (connectionOption.type === 'action-users') {
          validType = USER_ACTIONTYPES.indexOf(typeId) > -1;
        }
        if (connectionOption.type === 'actor-users') {
          validType = USER_ACTORTYPES.indexOf(typeId) > -1;
        }
        if (validType) {
          let optionCurrentFilters = currentFilters && currentFilters.filter(
            (filter) => qe(filter.groupId, connectionKey)
          );
          // console.log(optionCurrentFilters)
          if (entities
            && optionCurrentFilters
            && connectionOption.connectionAttributeFilter
            && connectionOption.connectionAttributeFilter.path
            && connectionOption.connectionAttributeFilter.options
            && connectionOption.connectionAttributeFilter.attribute
            && connectionOption.connectionAttributeFilter.connectionId
          ) {
            const optionCAF = connectionOption.connectionAttributeFilter;
            optionCurrentFilters = optionCurrentFilters
              .map(
                (filter) => {
                  const filterValue = filter.queryValue.split('>')[0];
                  const attributeOptions = Object.values(optionCAF.options)
                    .filter(
                      (cafo) => filterAttributeOptions({
                        filterValue,
                        connectionAttributeValue: cafo.value,
                        entities,
                        connectionOption: optionCAF,
                      })
                    );
                  return ({
                    ...filter,
                    attributeOptions,
                  });
                }
              );
          }
          filterGroups[connectionKey] = {
            id: connectionKey, // filterGroupId
            label: messages.connections(connectionOption.type),
            show: true,
            optionsActiveCount: groupCurrentFilters ? groupCurrentFilters.length : 0,
            options: [{
              id: connectionOption.type, // filterOptionId
              label: connectionOption.label,
              active: !!activeFilterOption
                && activeFilterOption.group === connectionKey
                && activeFilterOption.optionId === connectionOption.type,
              currentFilters: optionCurrentFilters,
              ...connectionOption,
            }],
          };
        }
      } else {
        let types;
        let typeAbout;
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
        switch (connectionOption.type) {
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
          label: messages.connections(connectionOption.type),
          show: true,
          optionsActiveCount: groupCurrentFilters ? groupCurrentFilters.length : 0,
          includeAnyWithout: !!connectionOption.groupByType,
          options: types && types
            .filter((type) => {
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
            })
            .reduce((memo, type) => {
              const id = connectionOption.attribute || type.get('id');
              const optionCurrentFilters = currentFilters && currentFilters.filter(
                (f) => qe(f.optionId, id) && qe(f.groupId, connectionKey)
              );
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
              return memo.concat({
                id, // filterOptionId
                label,
                disabled: type.get('viaMember') && !includeMembers,
                info: typeAbout
                  && appMessages[typeAbout]
                  && appMessages[typeAbout][type.get('id')]
                  && intl.formatMessage(appMessages[typeAbout][type.get('id')]),
                color: connectionOption.entityType,
                active: !!activeFilterOption
                  && activeFilterOption.group === connectionKey
                  && activeFilterOption.optionId === id,
                currentFilters: optionCurrentFilters,
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
  entities,
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
    entities,
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
      if (group.includeAnyWithout && group.options && group.options.length > 1) {
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
        if (
          group.option === 'connections'
          && group.connection
          && config.connections[group.connection]
        ) {
          const connectionOption = config.connections[group.connection];
          if (!group.groupByType) {
            let validType = true;
            if (connectionOption.type === 'action-indicators') {
              validType = INDICATOR_ACTIONTYPES.indexOf(typeId) > -1;
            }
            if (connectionOption.type === 'actor-action-indicators') {
              validType = INDICATOR_ACTION_ACTORTYPES.indexOf(typeId) > -1;
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
              });
              let typeLabel;
              if (intl && connectionOption.entityType) {
                const msg = `entities.${connectionOption.entityType}.single`;
                typeLabel = lowerCase(appMessage(intl, msg));
              }
              let { dropdownLabel } = group;
              if (!dropdownLabel) {
                dropdownLabel = `Select ${typeLabel}`;
              }
              let filters = [];
              const activeOption = filterOptions && filterOptions.options && Object.values(filterOptions.options).find((o) => o.checked);
              const activeWithoutOption = filterOptions && filterOptions.options && Object.values(filterOptions.options).find((o) => o.checked && o.query === 'without');
              const activeAnyOption = filterOptions && filterOptions.options && Object.values(filterOptions.options).find((o) => o.checked && o.query === 'any');
              if (activeOption) {
                filters = Object.values(filterOptions.options).reduce(
                  (memo2, o) => {
                    if (o.checked) {
                      let filter = {
                        id: `${connectionOption.type}-${o.value}`, // filterOptionId
                        filterType: 'dropdownSelect',
                        dropdownLabel,
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
                        !activeWithoutOption
                        && !activeAnyOption
                        && entities
                        && connectionOption
                        && connectionOption.connectionAttributeFilter
                        && connectionOption.connectionAttributeFilter.path
                        && connectionOption.connectionAttributeFilter.options
                        && connectionOption.connectionAttributeFilter.attribute
                        && connectionOption.connectionAttributeFilter.connectionId
                      ) {
                        const optionCAF = connectionOption.connectionAttributeFilter;
                        const optionCurrentFilter = currentFilters && currentFilters.find(
                          (f) => qe(f.query, o.query) && qe(f.queryValue.split('>')[0], o.value)
                        );
                        const cafOptions = Object.values(optionCAF.options)
                          .filter( // only offer available options
                            (cafo) => filterAttributeOptions({
                              filterValue: o.value,
                              connectionAttributeValue: cafo.value,
                              entities,
                              connectionOption: optionCAF,
                            })
                          )
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
                      return [...memo2, filter];
                    }
                    return memo2;
                  },
                  filters,
                );
              }
              if (filters.length < 5 && !activeWithoutOption && !activeAnyOption) {
                filters = [
                  ...filters,
                  {
                    id: connectionOption.type, // filterOptionId
                    filterType: 'dropdownSelect',
                    dropdownLabel,
                    search: group.search,
                    label: activeOption ? `Add another ${typeLabel} filter` : null,
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
                  filteringOptions: group.filteringOptions,
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
                filteringOptions: group.filteringOptions,
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
                      // skip viaMember types when disabled
                      if (type.get('viaMember') && !includeMembers) {
                        return memo2;
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
                      });
                      let { label } = connectionOption;
                      if (intl && connectionOption.messageByType) {
                        const msg = connectionOption.messageByType.replace('{typeid}', type.get('id'));
                        label = appMessage(intl, msg);
                      }
                      if (type.get('viaMember')) {
                        label = `${label} (via member countries only)`;
                      }

                      let typeLabel;
                      if (intl && connectionOption.entityType) {
                        const msg = `entities.${connectionOption.entityType}_${type.get('id')}.single`;
                        typeLabel = lowerCase(appMessage(intl, msg));
                      }
                      let { dropdownLabel } = group;
                      if (!dropdownLabel) {
                        dropdownLabel = `Select ${typeLabel}`;
                      }
                      let filters = [];
                      const activeOption = filterOptions && filterOptions.options && Object.values(filterOptions.options).find((o) => o.checked);
                      const activeWithoutOption = filterOptions && filterOptions.options && Object.values(filterOptions.options).find((o) => o.checked && o.query === 'without');
                      const activeAnyOption = filterOptions && filterOptions.options && Object.values(filterOptions.options).find((o) => o.checked && o.query === 'any');

                      if (activeOption) {
                        filters = Object.values(filterOptions.options).reduce(
                          (memo3, option) => {
                            if (option.checked) {
                              return [
                                ...memo3,
                                {
                                  id: `${connectionOption.type}-${type.get('id')}-${option.value}`, // filterOptionId
                                  filterType: 'dropdownSelect',
                                  search: group.search,
                                  options: [option],
                                  label: memo3.length === 0 ? label : null, // first
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
                      if (filters.length < 5 && !activeWithoutOption && !activeAnyOption) {
                        filters = [
                          ...filters,
                          {
                            id: `${connectionOption.type}-${type.get('id')}`, // filterOptionId
                            filterType: 'dropdownSelect',
                            dropdownLabel,
                            search: group.search,
                            label: filters.length === 0 ? label : null, // first
                            options: filterOptions && filterOptions.options && Object.keys(filterOptions.options).reduce(
                              (memo3, key) => {
                                const val = filterOptions.options[key];
                                return val.checked
                                  ? memo3
                                  : [...memo3, val];
                              },
                              [],
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
                      // console.log('filters', filters)
                      return [...memo2, ...filters];
                    },
                    [],
                  ),
              },
            ];
          }
        }
        // console.log('group', group);
        if (
          group.option === 'taxonomies'
          && group.taxonomies
          && config.taxonomies
          && taxonomies
        ) {
          // console.log('config', config.taxonomies)
          // console.log('taxonomies', taxonomies && taxonomies.toJS())
          // console.log('entities', entities && entities.toJS())

          const filters = group.taxonomies.reduce(
            (memo2, tax) => {
              const activeTaxId = `${tax.id}`;
              if (taxonomies.get(activeTaxId)) {
                let label = tax.label;
                if (!label && group.taxonomies.length > 1 && appMessages.entities.taxonomies[tax.id]) {
                  label = intl.formatMessage(appMessages.entities.taxonomies[tax.id].single)
                }
                const taxOptions = makeTaxonomyFilterOptions({
                  entities,
                  config: config.taxonomies,
                  taxonomies,
                  activeTaxId,
                  locationQuery,
                  messages,
                  intl,
                });
                if (taxOptions && taxOptions.options && Object.keys(taxOptions.options).length > 0) {
                  return [
                    ...memo2,
                    {
                      id: tax.id,
                      label,
                      filterType: tax.filterType,
                      options: Object.values(taxOptions.options),
                      onClick: ({ value, query, checked }) => {
                        onUpdateFilters(fromJS([
                          {
                            hasChanged: true,
                            query: query || config.taxonomies.query,
                            value,
                            replace: false,
                            checked,
                          },
                        ]));
                      },
                    },
                  ];
                }
              }
              return memo2;
            },
            [],
          );
          // console.log('filters', filters)
          return [
            ...memo,
            {
              id: group.id, // filterGroupId
              label: group.title,
              filters,
            },
          ];
        }
      }
      return memo;
    },
    [],
  );
  return groups;
};
