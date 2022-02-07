import { reduce } from 'lodash/collection';
import { startsWith } from 'utils/string';

import { qe } from 'utils/quasi-equals';
import { API, INDICATOR_ACTIONTYPES } from 'themes/config';

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
        if (option.type === 'action-actors') {
          types = actortypes;
          typeAttribute_id = 'actortypeattribute_id';
        } else if (option.type === 'action-targets') {
          types = targettypes;
          typeAttribute_id = 'actortype_id';
        } else if (option.type === 'target-actions') {
          types = actiontypesForTarget;
          typeAttribute_id = 'measuretype_id';
        } else if (option.type === 'actor-actions') {
          types = actiontypes;
          typeAttribute_id = 'measuretype_id';
        } else if (option.type === 'resource-actions') {
          types = actiontypes;
          typeAttribute_id = 'measuretype_id';
        } else if (option.type === 'association-members') {
          types = membertypes;
          typeAttribute_id = 'actortype_id';
        } else if (option.type === 'member-associations') {
          types = associationtypes;
          typeAttribute_id = 'actortype_id';
        } else if (option.type === 'action-resources') {
          types = resourcetypes;
          typeAttribute_id = 'resourcetype_id';
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
