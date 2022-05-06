import { reduce } from 'lodash/collection';
import { sortEntities } from 'utils/sort';
import { startsWith } from 'utils/string';
import qe from 'utils/quasi-equals';
import appMessages from 'containers/App/messages';

import {
  ACTIONTYPES,
  INDICATOR_ACTIONTYPES,
  USER_ACTIONTYPES,
  USER_ACTORTYPES,
} from 'themes/config';

import { makeAttributeFilterOptions } from './filterOptionsFactory';
// figure out filter groups for filter panel
export const makeFilterGroups = ({
  config,
  taxonomies,
  hasUserRole,
  actortypes,
  actiontypes,
  resourcetypes,
  actiontypesForTarget,
  activeFilterOption,
  membertypes,
  associationtypes,
  messages,
  typeId,
  intl,
  currentFilters,
  locationQuery,
  includeMembers,
}) => {
  const filterGroups = {};
  // taxonomy option group
  if (config.taxonomies && taxonomies) {
    // first prepare taxonomy options
    filterGroups.taxonomies = {
      id: 'taxonomies', // filterGroupId
      label: messages.taxonomyGroup,
      show: true,
      icon: 'categories',
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
    Object.keys(config.connections).filter((connectionKey) => {
      // exclude targets for non-target actions
      if (connectionKey === 'targets' && config.types === 'actiontypes') {
        const actiontype = actiontypes.find((t) => qe(t.get('id'), typeId));
        return actiontype.getIn(['attributes', 'has_target']);
      }
      return true;
    }).forEach((connectionKey) => {
      const option = config.connections[connectionKey];
      if (!option.groupByType) {
        let validType = true;
        if (option.entityType === 'indicators') {
          validType = INDICATOR_ACTIONTYPES.indexOf(typeId) > -1;
        }
        if (option.type === 'action-users') {
          validType = USER_ACTIONTYPES.indexOf(typeId) > -1;
        }
        if (option.type === 'actor-users') {
          validType = USER_ACTORTYPES.indexOf(typeId) > -1;
        }
        if (validType) {
          filterGroups[connectionKey] = {
            id: connectionKey, // filterGroupId
            label: messages.connections(option.type),
            show: true,
            options: [{
              id: option.type, // filterOptionId
              label: option.label,
              message: option.message,
              color: option.entityType,
              active: !!activeFilterOption
                && activeFilterOption.group === connectionKey
                && activeFilterOption.optionId === option.type,
            }],
          };
        }
      } else {
        let types;
        let typeAbout;
        let label;
        if (option.type === 'action-actors') {
          types = actortypes;
          label = qe(ACTIONTYPES.DONOR, typeId) && 'By donor';
          typeAbout = 'actortypes_about';
        } else if (option.type === 'action-targets') {
          types = actortypes;
          label = qe(ACTIONTYPES.DONOR, typeId) && 'By recipient';
          typeAbout = 'actortypes_about';
        } else if (option.type === 'target-actions') {
          types = actiontypesForTarget;
          typeAbout = 'actiontypes_about';
        } else if (option.type === 'actor-actions') {
          types = actiontypes;
          typeAbout = 'actiontypes_about';
        } else if (option.type === 'resource-actions') {
          types = actiontypes;
          typeAbout = 'actiontypes_about';
        } else if (option.type === 'action-parents') {
          types = actiontypes;
        } else if (option.type === 'association-members') {
          types = membertypes;
          typeAbout = 'actortypes_about';
        } else if (option.type === 'member-associations') {
          types = associationtypes;
          typeAbout = 'actortypes_about';
        } else if (option.type === 'action-resources') {
          types = resourcetypes;
          typeAbout = 'resourcetypes_about';
        } else if (option.type === 'indicator-actions') {
          types = actiontypes;
          typeAbout = 'actiontypes_about';
        } else if (option.type === 'user-actions') {
          types = actiontypes;
          typeAbout = 'actiontypes_about';
        } else if (option.type === 'user-actors') {
          types = actortypes;
          typeAbout = 'actortypes_about';
        }
        filterGroups[connectionKey] = {
          id: connectionKey, // filterGroupId
          label: label || messages.connections(option.type),
          show: true,
          includeAnyWithout: !!option.groupByType,
          options: types && types
            .filter((type) => {
              if (option.type === 'action-parents') {
                return type.get('id') === typeId && (!option.typeFilter || type.getIn(['attributes', option.typeFilter]));
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
              return memo.concat({
                id, // filterOptionId
                label: option.label,
                info: typeAbout
                  && appMessages[typeAbout]
                  && appMessages[typeAbout][type.get('id')]
                  && intl.formatMessage(appMessages[typeAbout][type.get('id')]),
                message: (option.messageByType && option.messageByType.indexOf('{typeid}') > -1)
                  ? option.messageByType.replace('{typeid}', type.get('id'))
                  : option.message,
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

  // attributes
  if (config.attributes) {
    // first prepare taxonomy options
    filterGroups.attributes = {
      id: 'attributes', // filterGroupId
      label: messages.attributes,
      show: true,
      options: reduce(
        config.attributes.options,
        (memo, option) => {
          if (
            typeof option.role === 'undefined'
            || (hasUserRole && hasUserRole[option.role])
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
  return filterGroups;
};
