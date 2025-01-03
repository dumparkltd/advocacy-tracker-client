import {
  API,
  ROUTES,
  USER_ROLES,
  PUBLISH_STATUSES,
  PRIVACY_STATUSES,
  ARCHIVE_STATUSES,
  NOTIFICATION_STATUSES,
  ACTIONTYPES,
  ACTION_INDICATOR_SUPPORTLEVELS,
} from 'themes/config';

export const DEPENDENCIES = [
  API.ACTORS,
  API.ACTIONS,
  API.RESOURCES,
  API.ACTION_ACTIONS,
  API.ACTOR_ACTIONS,
  API.ACTION_ACTORS,
  API.ACTION_RESOURCES,
  API.ACTOR_CATEGORIES,
  API.ACTION_CATEGORIES,
  API.ACTORTYPES,
  API.ACTIONTYPES,
  API.RESOURCETYPES,
  API.ACTORTYPE_TAXONOMIES,
  API.ACTIONTYPE_TAXONOMIES,
  API.TAXONOMIES,
  API.CATEGORIES,
  API.MEMBERSHIPS,
  API.USERS,
  API.USER_ACTIONS,
  API.USER_ROLES,
  API.INDICATORS,
  API.ACTION_INDICATORS,
];

export const CONFIG = {
  types: 'actiontypes',
  serverPath: API.ACTIONS,
  clientPath: ROUTES.ACTION,
  hasMemberFilterOption: [
    ACTIONTYPES.EXPRESS,
    ACTIONTYPES.TASK,
    ACTIONTYPES.INTERACTION,
    ACTIONTYPES.EVENT,
    ACTIONTYPES.OP,
    ACTIONTYPES.AP,
  ],
  downloadCSV: true,
  batchDelete: true,
  views: {
    list: {
      search: ['code', 'title', 'description'],
    },
    map: {
      types: [
        ACTIONTYPES.EXPRESS,
        ACTIONTYPES.TASK,
        ACTIONTYPES.INTERACTION,
        ACTIONTYPES.EVENT,
        ACTIONTYPES.OP,
        ACTIONTYPES.AP,
      ],
    },
  },
  taxonomies: { // filter by each category
    query: 'cat',
    search: true,
    connectPath: API.ACTION_CATEGORIES,
    key: 'category_id',
    ownKey: 'measure_id',
    invalidateEntitiesPaths: [API.CATEGORIES, API.ACTIONS],
    // defaultGroupAttribute: 'groups_actions_default',
  },
  connections: { // filter by associated entity
    // filter by associated actor
    actors: {
      query: 'actor',
      type: 'action-actors',
      search: true,
      messageByType: 'entities.actors_{typeid}.plural',
      message: 'entities.actors.plural',
      path: API.ACTORS,
      invalidateEntitiesPaths: [API.ACTORS, API.ACTIONS],
      entityType: 'actors',
      clientPath: ROUTES.ACTOR,
      connectPath: API.ACTOR_ACTIONS, // filter by actor connection
      key: 'actor_id',
      ownKey: 'measure_id',
      groupByType: true,
    },
    parents: {
      query: 'by-parent',
      type: 'action-parents',
      search: true,
      messageByType: 'entities.actions_{typeid}.plural',
      message: 'entities.actions.plural',
      path: API.ACTIONS, // filter by actor connection
      invalidateEntitiesPaths: [API.ACTIONS],
      entityType: 'actions', // filter by actor connection
      entityTypeAs: 'parents', // filter by actor connection
      clientPath: ROUTES.ACTION,
      connectPath: API.ACTION_ACTIONS, // filter by actor connection
      ownKey: 'measure_id',
      key: 'other_measure_id',
      groupByType: true,
    },
    children: {
      query: 'by-child',
      type: 'action-children',
      search: true,
      messageByType: 'entities.actions_{typeid}.plural',
      message: 'entities.actions.plural',
      path: API.ACTIONS, // filter by actor connection
      invalidateEntitiesPaths: [API.ACTIONS],
      entityType: 'actions', // filter by actor connection
      entityTypeAs: 'children', // filter by actor connection
      clientPath: ROUTES.ACTION,
      connectPath: API.ACTION_ACTIONS, // filter by actor connection
      ownKey: 'other_measure_id', //  parent
      key: 'measure_id', // child
      groupByType: true,
    },
    indicators: {
      query: 'indicators',
      type: 'action-indicators',
      search: true,
      message: 'entities.indicators.plural',
      path: API.INDICATORS,
      invalidateEntitiesPaths: [API.INDICATORS, API.ACTIONS],
      entityType: 'indicators',
      clientPath: ROUTES.INDICATOR,
      connectPath: API.ACTION_INDICATORS, // filter by actor connection
      key: 'indicator_id',
      ownKey: 'measure_id',
      connectionAttributeFilter: {
        path: 'indicatorConnections',
        // query: 'indicatorConnections',
        attribute: 'supportlevel_id',
        message: 'attributes.supportlevel_id',
        options: ACTION_INDICATOR_SUPPORTLEVELS,
        optionMessages: 'supportlevels',
      },
    },
    // filter by associated entity
    resources: {
      query: 'resources',
      type: 'action-resources',
      search: true,
      messageByType: 'entities.resources_{typeid}.plural',
      message: 'entities.resources.plural',
      path: API.RESOURCES,
      invalidateEntitiesPaths: [API.RESOURCES, API.ACTIONS],
      entityType: 'resources',
      clientPath: ROUTES.RESOURCE,
      connectPath: API.ACTION_RESOURCES, // filter by actor connection
      key: 'resource_id',
      ownKey: 'measure_id',
      groupByType: true,
      listItemHide: true,
    },
    users: {
      query: 'users',
      type: 'action-users',
      search: true,
      message: 'entities.users.plural',
      path: API.USERS,
      invalidateEntitiesPaths: [API.ACTIONS, API.USERS],
      entityType: 'users',
      clientPath: ROUTES.USER,
      connectPath: API.USER_ACTIONS, // filter by actor connection
      key: 'user_id',
      ownKey: 'measure_id',
    },
  },
  attributes: { // filter by attribute value
    options: [
      {
        search: false,
        message: 'attributes.draft',
        attribute: 'draft',
        options: PUBLISH_STATUSES,
        role: USER_ROLES.MEMBER.value,
        filterUI: 'checkboxes',
      },
      {
        search: false,
        message: 'attributes.private',
        attribute: 'private',
        options: PRIVACY_STATUSES,
        role: USER_ROLES.MEMBER.value,
        roleEdit: USER_ROLES.ADMIN.value,
        filterUI: 'checkboxes',
      },
      {
        search: false,
        message: 'attributes.is_archive',
        attribute: 'is_archive',
        options: ARCHIVE_STATUSES,
        role: USER_ROLES.ADMIN.value,
        filterUI: 'checkboxes',
        default: false,
      },
      {
        search: false,
        message: 'attributes.notifications',
        attribute: 'notifications',
        options: NOTIFICATION_STATUSES,
        role: USER_ROLES.ADMIN.value,
        filterUI: 'checkboxes',
        default: false,
      },
    ],
  },
};
