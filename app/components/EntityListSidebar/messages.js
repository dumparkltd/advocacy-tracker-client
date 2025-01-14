/*
 * EntityListSidebar Messages
 *
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  header: {
    filter: {
      id: 'app.components.EntityListSidebar.header.filter',
      defaultMessage: 'Filter List',
    },
    edit: {
      id: 'app.components.EntityListSidebar.header.editedit',
      defaultMessage: 'Edit selected items',
    },
  },
  groupExpand: {
    show: {
      id: 'app.components.EntityListSidebar.groupExpand.show',
      defaultMessage: 'Show group',
    },
    hide: {
      id: 'app.components.EntityListSidebar.groupExpand.hide',
      defaultMessage: 'Hide group',
    },
  },
  groupOptionSelect: {
    show: {
      id: 'app.components.EntityListSidebar.groupOptionSelect.show',
      defaultMessage: 'Show options',
    },
    hide: {
      id: 'app.components.EntityListSidebar.groupOptionSelect.hide',
      defaultMessage: 'Hide options',
    },
  },
  filterGroupLabel: {
    attributes: {
      id: 'app.components.EntityListSidebar.filterGroupLabel.attributes',
      defaultMessage: 'By attribute',
    },
    actortypes: {
      id: 'app.components.EntityListSidebar.filterGroupLabel.actortypes',
      defaultMessage: 'By actortype',
    },
    taxonomies: {
      id: 'app.components.EntityListSidebar.filterGroupLabel.taxonomies',
      defaultMessage: 'By category',
    },
    taxonomiesByActortype: {
      id: 'app.components.EntityListSidebar.filterGroupLabel.taxonomiesByActortype',
      defaultMessage: 'By category ({actortype})',
    },
    connections: {
      id: 'app.components.EntityListSidebar.filterGroupLabel.connections',
      defaultMessage: 'By connection',
    },
    'connections-action-actors': {
      id: 'app.components.EntityListSidebar.filterGroupLabel.connections-action-actors',
      defaultMessage: 'By connection',
    },
    'connections-actor-actions': {
      id: 'app.components.EntityListSidebar.filterGroupLabel.connections-actor-actions',
      defaultMessage: 'By connection',
    },
    'connections-association-members': {
      id: 'app.components.EntityListSidebar.filterGroupLabel.connections-association-members',
      defaultMessage: 'By member',
    },
    'connections-member-associations': {
      id: 'app.components.EntityListSidebar.filterGroupLabel.connections-member-associations',
      defaultMessage: 'By membership',
    },
    'connections-action-parents': {
      id: 'app.components.EntityListSidebar.filterGroupLabel.connections-action-parents',
      defaultMessage: 'By parent activity',
    },
    'connections-action-children': {
      id: 'app.components.EntityListSidebar.filterGroupLabel.connections-action-children',
      defaultMessage: 'By child activity',
    },
    'connections-action-resources': {
      id: 'app.components.EntityListSidebar.filterGroupLabel.connections-action-resources',
      defaultMessage: 'By resource',
    },
    'connections-resource-actions': {
      id: 'app.components.EntityListSidebar.filterGroupLabel.connections-resource-actions',
      defaultMessage: 'By activity',
    },
    'connections-action-indicators': {
      id: 'app.components.EntityListSidebar.filterGroupLabel.connections-action-indicators',
      defaultMessage: 'By country position',
    },
    'connections-actor-action-indicators': {
      id: 'app.components.EntityListHeader.filterGroupLabel.connections-actor-action-indicators',
      defaultMessage: 'By country position',
    },
    'connections-indicator-actions': {
      id: 'app.components.EntityListSidebar.filterGroupLabel.connections-indicator-actions',
      defaultMessage: 'By activity',
    },
    'connections-action-users': {
      id: 'app.components.EntityListSidebar.filterGroupLabel.connections-action-users',
      defaultMessage: 'By assigned WWF staff',
    },
    'connections-actor-users': {
      id: 'app.components.EntityListSidebar.filterGroupLabel.connections-actor-users',
      defaultMessage: 'By assigned WWF staff',
    },
    'connections-user-actions': {
      id: 'app.components.EntityListSidebar.filterGroupLabel.connections-user-actions',
      defaultMessage: 'By activity',
    },
    'connections-user-actors': {
      id: 'app.components.EntityListSidebar.filterGroupLabel.connections-user-actors',
      defaultMessage: 'By actor',
    },
    'connections-user-roles': {
      id: 'app.components.EntityListSidebar.filterGroupLabel.connections-user-roles',
      defaultMessage: 'By role',
    },
    connectedTaxonomies: {
      id: 'app.components.EntityListSidebar.filterGroupLabel.connectedTaxonomies',
      defaultMessage: 'Activities by category',
    },
  },
  editGroupLabel: {
    attributes: {
      id: 'app.components.EntityListSidebar.editGroupLabel.attributes',
      defaultMessage: 'Update attributes',
    },
    taxonomies: {
      id: 'app.components.EntityListSidebar.editGroupLabel.taxonomies',
      defaultMessage: 'Update categories',
    },
    connections: {
      id: 'app.components.EntityListSidebar.editGroupLabel.connections',
      defaultMessage: 'Update connections',
    },
    'connections-action-actors': {
      id: 'app.components.EntityListSidebar.editGroupLabel.connections-action-actors',
      defaultMessage: 'Update actors',
    },
    'connections-actor-actions': {
      id: 'app.components.EntityListSidebar.editGroupLabel.connections-actor-actions',
      defaultMessage: 'Update activities',
    },
    'connections-association-members': {
      id: 'app.components.EntityListSidebar.editGroupLabel.connections-association-members',
      defaultMessage: 'Update members',
    },
    'connections-member-associations': {
      id: 'app.components.EntityListSidebar.editGroupLabel.connections-member-associations',
      defaultMessage: 'Update memberships',
    },
    'connections-action-resources': {
      id: 'app.components.EntityListSidebar.editGroupLabel.connections-action-resources',
      defaultMessage: 'Update resources',
    },
    'connections-indicator-actions': {
      id: 'app.components.EntityListSidebar.editGroupLabel.connections-indicator-actions',
      defaultMessage: 'Update activities',
    },
    'connections-action-indicators': {
      id: 'app.components.EntityListSidebar.editGroupLabel.connections-action-indicators',
      defaultMessage: 'Update country positions',
    },
    'connections-action-users': {
      id: 'app.components.EntityListSidebar.editGroupLabel.connections-action-users',
      defaultMessage: 'Update user assignments',
    },
    'connections-actor-users': {
      id: 'app.components.EntityListSidebar.editGroupLabel.connections-actor-users',
      defaultMessage: 'Update WWF staff',
    },
    'connections-user-actions': {
      id: 'app.components.EntityListSidebar.editGroupLabel.connections-user-actions',
      defaultMessage: 'Update activity assignments',
    },
    'connections-user-actors': {
      id: 'app.components.EntityListSidebar.editGroupLabel.connections-user-actors',
      defaultMessage: 'Update actor assignments',
    },
    'connections-user-roles': {
      id: 'app.components.EntityListSidebar.editGroupLabel.connections-user-roles',
      defaultMessage: 'Update user role',
    },
    'connections-action-parents': {
      id: 'app.components.EntityListSidebar.editGroupLabel.connections-action-parents',
      defaultMessage: 'Update activities',
    },
    'connections-action-children': {
      id: 'app.components.EntityListSidebar.editGroupLabel.connections-action-children',
      defaultMessage: 'Update sub-activities',
    },
  },
  filterFormTitlePrefix: {
    id: 'app.components.EntityListSidebar.filterFormTitlePrefix',
    defaultMessage: 'Filter by',
  },
  filterFormWithoutPrefix: {
    id: 'app.components.EntityListSidebar.filterFormWithoutPrefix',
    defaultMessage: 'Without any',
  },
  filterFormAnyPrefix: {
    id: 'app.components.EntityListSidebar.filterFormAnyPrefix',
    defaultMessage: 'With some',
  },
  editFormTitlePrefix: {
    id: 'app.components.EntityListSidebar.editFormTitlePrefix',
    defaultMessage: 'Update',
  },
  editFormTitlePostfix: {
    id: 'app.components.EntityListSidebar.editFormTitlePostfix',
    defaultMessage: 'selected',
  },
  entitiesNotFound: {
    id: 'app.components.EntityListSidebar.entitiesNotFound',
    defaultMessage: 'No entities found',
  },
  entitiesNotSelected: {
    id: 'app.components.EntityListSidebar.entitiesNotSelected',
    defaultMessage: 'Please select one or more entities from the list for available edit options',
  },
  selectType: {
    id: 'app.components.EntityListSidebar.selectType',
    defaultMessage: 'Select {types}',
  },
});
