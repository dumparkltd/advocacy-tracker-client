import { reduce } from 'lodash/collection';
import { sortEntities } from 'utils/sort';
import { startsWith } from 'utils/string';
import qe from 'utils/quasi-equals';
import appMessages from 'containers/App/messages';

import {
  // ACTIONTYPES,
  INDICATOR_ACTIONTYPES,
  INDICATOR_ACTION_ACTORTYPES,
  USER_ACTIONTYPES,
  USER_ACTORTYPES,
  ACTIONTYPE_ACTIONTYPES,
} from 'themes/config';

import appMessage from 'utils/app-message';

import { makeAttributeFilterOptions } from './utilFilterOptions';
// figure out filter groups for filter panel
export const makeFilterGroups = ({
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
          if (
            option.connectionAttributeFilter
            && !option.connectionAttributeFilter.addonOnly
          ) {
            const connectionFilterOption = {
              id: option.connectionAttributeFilter.path, // filterOptionId
              active: !!activeFilterOption
                && activeFilterOption.group === connectionKey
                && activeFilterOption.optionId === option.connectionAttributeFilter.path,
              currentFilters: currentFilters.filter(
                (f) => qe(f.groupId, option.connectionAttributeFilter.path)
              ),
              ...option.connectionAttributeFilter,
            };
            filterGroups[connectionKey].options = [
              ...filterGroups[connectionKey].options,
              connectionFilterOption,
            ];
          }
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
