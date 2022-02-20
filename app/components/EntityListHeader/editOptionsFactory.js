import { find, forEach } from 'lodash/collection';

import {
  testEntityEntityAssociation,
  testEntityCategoryAssociation,
  getEntityTitle,
  getEntityReference,
  getEntityParentId,
} from 'utils/entities';
import { qe } from 'utils/quasi-equals';
import { makeTagFilterGroups } from 'utils/forms';

import { checkedState } from './utils';

export const makeActiveEditOptions = ({
  entities,
  config,
  taxonomies,
  connections,
  connectedTaxonomies,
  activeEditOption,
  contextIntl,
  messages,
}) => {
  // create edit options
  switch (activeEditOption.group) {
    case 'taxonomies':
      return makeTaxonomyEditOptions(entities, taxonomies, activeEditOption, messages);
    case 'actions':
    case 'actors':
    case 'targets':
    case 'members':
    case 'associations':
    case 'resources':
      return makeGroupedConnectionEditOptions(
        entities,
        config.connections,
        connections,
        connectedTaxonomies,
        activeEditOption.optionId,
        messages,
        contextIntl,
        activeEditOption.group,
      );
    case 'indicators':
      return makeConnectionEditOptions(
        entities,
        config.connections,
        connections,
        connectedTaxonomies,
        activeEditOption.optionId,
        messages,
        contextIntl,
        activeEditOption.group,
      );
    case 'attributes':
      return makeAttributeEditOptions(entities, config, activeEditOption, messages);
    default:
      return null;
  }
};

const makeAttributeEditOptions = (entities, config, activeEditOption, messages) => {
  const editOptions = {
    groupId: 'attributes',
    search: true,
    options: {},
    selectedCount: entities.size,
    multiple: false,
    required: true,
    selectAll: false,
  };

  const option = find(config.attributes.options, (o) => o.attribute === activeEditOption.optionId);
  if (option) {
    editOptions.title = messages.title;
    editOptions.search = option.search;
    forEach(option.options, (attributeOption) => {
      const count = entities.reduce((counter, entity) => typeof entity.getIn(['attributes', option.attribute]) !== 'undefined'
          && entity.getIn(['attributes', option.attribute]) !== null
          && entity.getIn(['attributes', option.attribute]).toString() === attributeOption.value.toString()
        ? counter + 1
        : counter,
      0);

      editOptions.options[attributeOption.value] = {
        label: attributeOption.label,
        message: attributeOption.message,
        value: attributeOption.value,
        attribute: option.attribute,
        checked: checkedState(count, entities.size),
      };
    });
  }
  return editOptions;
};

const makeTaxonomyEditOptions = (entities, taxonomies, activeEditOption, messages) => {
  const editOptions = {
    groupId: 'taxonomies',
    search: true,
    options: {},
    selectedCount: entities.size,
    multiple: true,
    required: false,
    selectAll: true,
    groups: null,
  };

  const taxonomy = taxonomies.get(activeEditOption.optionId);
  if (taxonomy) {
    const parentId = getEntityParentId(taxonomy);
    const parent = parentId && taxonomies.get(parentId);
    if (parent) {
      editOptions.groups = parent.get('categories').map((cat) => getEntityTitle(cat));
    }
    editOptions.title = messages.title;
    editOptions.multiple = taxonomy.getIn(['attributes', 'allow_multiple']);
    editOptions.search = taxonomy.getIn(['attributes', 'search']);
    taxonomy.get('categories').forEach((category) => {
      const count = entities.reduce((counter, entity) => testEntityCategoryAssociation(entity, category.get('id')) ? counter + 1 : counter,
        0);
      editOptions.options[category.get('id')] = {
        reference: getEntityReference(category, false),
        label: getEntityTitle(category),
        description: category.getIn(['attributes', 'description']),
        group: parent && getEntityParentId(category),
        value: category.get('id'),
        checked: checkedState(count, entities.size),
        draft: category && category.getIn(['attributes', 'draft']),
      };
    });
  }
  return editOptions;
};

const makeGroupedConnectionEditOptions = (
  entities,
  config,
  connections,
  connectedTaxonomies,
  activeOptionId,
  messages,
  contextIntl,
  group,
) => {
  // const option = find(config.connections.options, (o) => o.path === activeEditOption.optionId);
  // get the active option
  const typeId = activeOptionId;
  const option = config[group];
  const { type } = option;
  const editOptions = {
    groupId: group,
    search: true,
    options: {},
    selectedCount: entities.size,
    multiple: true,
    required: false,
    advanced: true,
    selectAll: true,
    tagFilterGroups: option && makeTagFilterGroups(connectedTaxonomies, contextIntl),
  };
  if (option) {
    editOptions.title = messages.title;
    editOptions.path = option.connectPath;
    editOptions.search = option.search;
    const connectionPath = option.path;
    connections
      .get(connectionPath)
      .filter((c) => {
        if (
          type === 'target-actions'
          || type === 'actor-actions'
          || type === 'resource-actions'
          || type === 'indicator-actions'
        ) {
          return qe(typeId, c.getIn(['attributes', 'measuretype_id']));
        }
        if (type === 'action-resources') {
          return qe(typeId, c.getIn(['attributes', 'resourcetype_id']));
        }
        if (
          type === 'action-targets' // targets
          || type === 'action-actors' // active actors
          || type === 'member-associations' // associations
          || type === 'association-members' // members
        ) {
          return qe(typeId, c.getIn(['attributes', 'actortype_id']));
        }
        return true;
      })
      .forEach((connection) => {
        const count = entities.reduce(
          (counter, entity) => testEntityEntityAssociation(
            entity,
            option.entityTypeAs || option.entityType,
            connection.get('id')
          ) ? counter + 1 : counter,
          0, // initial value
        );
        editOptions.options[connection.get('id')] = {
          reference: getEntityReference(connection),
          label: getEntityTitle(connection),
          description: connection.getIn(['attributes', 'description']),
          value: connection.get('id'),
          checked: checkedState(count, entities.size),
          tags: connection.get('categories'),
          draft: connection.getIn(['attributes', 'draft']),
        };
      });
  }
  return editOptions;
};
const makeConnectionEditOptions = (
  entities,
  config,
  connections,
  connectedTaxonomies,
  activeOptionId,
  messages,
  contextIntl,
  group,
) => {
  // const option = find(config.connections.options, (o) => o.path === activeEditOption.optionId);
  // get the active option
  // const typeId = activeOptionId;
  const option = config[group];
  const editOptions = {
    groupId: group,
    search: true,
    options: {},
    selectedCount: entities.size,
    multiple: true,
    required: false,
    advanced: true,
    selectAll: true,
    tagFilterGroups: option && makeTagFilterGroups(connectedTaxonomies, contextIntl),
  };
  if (option) {
    editOptions.title = messages.title;
    editOptions.path = option.connectPath;
    editOptions.search = option.search;
    const connectionPath = option.path;
    connections
      .get(connectionPath)
      .forEach((connection) => {
        const count = entities.reduce(
          (counter, entity) => testEntityEntityAssociation(
            entity,
            option.entityTypeAs || option.entityType,
            connection.get('id')
          ) ? counter + 1 : counter,
          0, // initial value
        );
        editOptions.options[connection.get('id')] = {
          reference: getEntityReference(connection),
          label: getEntityTitle(connection),
          description: connection.getIn(['attributes', 'description']),
          value: connection.get('id'),
          checked: checkedState(count, entities.size),
          tags: connection.get('categories'),
          draft: connection.getIn(['attributes', 'draft']),
        };
      });
  }
  return editOptions;
};
