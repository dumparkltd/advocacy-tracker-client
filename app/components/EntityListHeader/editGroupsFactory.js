import { reduce } from 'lodash/collection';
import { startsWith } from 'utils/string';

import { qe } from 'utils/quasi-equals';
import {
  API, INDICATOR_ACTIONTYPES, USER_ACTIONTYPES, USER_ACTORTYPES,
} from 'themes/config';

export const makeEditGroups = ({
  config,
  taxonomies,
  activeEditOption,
  hasUserRole,
  messages,
  actortypes,
  actiontypes,
  targettypes,
  actiontypesForTarget,
  membertypes,
  associationtypes,
  resourcetypes,
  typeId,
}) => {
  const editGroups = {};
  // const selectedActortypes = actortypes && actortypes.filter(
  //   (actortype) => selectedActortypeIds.find((id) => qe(id, actortype.get('id'))),
  // );
  // taxonomy option group
  if (config.taxonomies && taxonomies) {
    // first prepare taxonomy options
    editGroups.taxonomies = {
      id: 'taxonomies', // filterGroupId
      label: messages.taxonomyGroup,
      show: true,
      icon: 'categories',
      options:
        // all selectedActortypeIds must be included in tax.actortypeIds
        taxonomies
          .filter(
            // exclude parent taxonomies
            (tax) => !taxonomies.some(
              (otherTax) => qe(
                tax.get('id'),
                otherTax.getIn(['attributes', 'parent_id']),
              )
            )
          )
          .reduce(
            (memo, taxonomy) => memo.concat([
              {
                id: taxonomy.get('id'), // filterOptionId
                label: messages.taxonomies(taxonomy.get('id')),
                path: config.taxonomies.connectPath,
                key: config.taxonomies.key,
                ownKey: config.taxonomies.ownKey,
                active: !!activeEditOption
                  && activeEditOption.group === 'taxonomies'
                  && activeEditOption.optionId === taxonomy.get('id'),
                create: {
                  path: API.CATEGORIES,
                  attributes: { taxonomy_id: taxonomy.get('id') },
                },
              },
            ]),
            [],
          ),
    };
  }

  // connections option group
  // connections option group
  if (config.connections) {
    Object.keys(config.connections).forEach((connectionKey) => {
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
          editGroups[connectionKey] = {
            id: connectionKey, // filterGroupId
            label: messages.connections(option.type),
            show: true,
            options: [{
              id: option.type, // filterOptionId
              label: option.label,
              message: option.message,
              path: option.connectPath,
              connection: option.entityType,
              key: option.key,
              ownKey: option.ownKey,
              active: !!activeEditOption
                && activeEditOption.group === connectionKey
                && activeEditOption.optionId === option.type,
              create: {
                path: option.path,
              },
              color: option.entityType,
            }],
          };
        }
      } else {
        let types;
        let typeAttribute_id;

        switch (option.type) {
          case 'user-actors':
          case 'action-actors':
            types = actortypes;
            break;
          case 'action-targets':
            types = targettypes;
            break;
          case 'actor-actions':
          case 'user-actions':
          case 'resource-actions':
            types = actiontypes;
            break;
          case 'target-actions':
            types = actiontypesForTarget;
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
          // actors
          case 'user-actors':
          case 'action-actors':
          case 'action-targets':
          case 'association-members':
          case 'member-associations':
            typeAttribute_id = 'actortype_id';
            break;
          // actions
          case 'target-actions':
          case 'actor-actions':
          case 'user-actions':
          case 'resource-actions':
            typeAttribute_id = 'measuretype_id';
            break;
          // resources
          case 'action-resources':
            typeAttribute_id = 'resourcetype_id';
            break;
          default:
            break;
        }
        editGroups[connectionKey] = {
          id: connectionKey, // filterGroupId
          label: messages.connections(option.type),
          show: true,
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
              return notFilter
                ? !type.getIn(['attributes', attribute])
                : type.getIn(['attributes', attribute]);
            })
            .reduce(
              (memo, type) => {
                const id = type.get('id');
                return memo.concat({
                  id, // filterOptionId
                  label: option.label,
                  message: (option.messageByType && option.messageByType.indexOf('{typeid}') > -1)
                    ? option.messageByType.replace('{typeid}', type.get('id'))
                    : option.message,
                  path: option.connectPath,
                  connection: option.entityTypeAs || option.entityType,
                  key: option.key,
                  ownKey: option.ownKey,
                  active: !!activeEditOption
                    && activeEditOption.group === connectionKey
                    && activeEditOption.optionId === id,
                  create: {
                    path: option.path,
                    attributes: { [typeAttribute_id]: type.get('id') },
                  },
                  color: option.entityType,
                });
              }, [],
            ),
        };
      }
    });
  }

  // attributes
  if (config.attributes) {
    // first prepare taxonomy options
    editGroups.attributes = {
      id: 'attributes', // filterGroupId
      label: messages.attributes,
      show: true,
      options: reduce(
        config.attributes.options,
        (optionsMemo, option) => {
          if (
            (typeof option.edit === 'undefined' || option.edit)
            && (typeof option.role === 'undefined' || hasUserRole[option.role])
          ) {
            return optionsMemo.concat({
              id: option.attribute, // filterOptionId
              label: option.label,
              message: option.message,
              active: !!activeEditOption
                && activeEditOption.group === 'attributes'
                && activeEditOption.optionId === option.attribute,
            });
          }
          return optionsMemo;
        },
        [],
      ),
    };
  }
  return editGroups;
};
