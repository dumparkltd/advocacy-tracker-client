import {
  API,
  ROUTES,
  USER_ROLES,
  ATTRIBUTE_STATUSES,
  ACTIONTYPES,
  ACTORTYPES,
  ACTION_INDICATOR_SUPPORTLEVELS,
  AUTHORITY_TAXONOMY,
  PRIORITY_TAXONOMY,
  INTERACTION_TYPE_TAXONOMY,
  EVENT_TYPE_TAXONOMY,
} from 'themes/config';

import qe from 'utils/quasi-equals';

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
  quickFilterGroups: [
    {
      id: 'attributes',
      title: 'Confidentiality',
      option: 'attributes',
      attributes: [{
        attribute: 'private',
        filterType: 'buttonGroup',
        multiple: false,
      }],
    },
    {
      id: `taxonomies-${AUTHORITY_TAXONOMY}`,
      title: 'Levels of authority',
      option: 'taxonomies',
      taxonomies: [{
        id: AUTHORITY_TAXONOMY,
        filterType: 'pills',
      }],
    },
    {
      id: `taxonomies-${PRIORITY_TAXONOMY}`,
      title: 'Priorities',
      option: 'taxonomies',
      taxonomies: [{
        id: PRIORITY_TAXONOMY,
        filterType: 'pills',
      }],
    },
    {
      id: `taxonomies-${INTERACTION_TYPE_TAXONOMY}`,
      title: 'Interaction types',
      option: 'taxonomies',
      taxonomies: [{
        id: INTERACTION_TYPE_TAXONOMY,
        filterType: 'pills',
      }],
    },
    {
      id: `taxonomies-${EVENT_TYPE_TAXONOMY}`,
      title: 'Event types',
      option: 'taxonomies',
      taxonomies: [{
        id: EVENT_TYPE_TAXONOMY,
        filterType: 'pills',
      }],
    },
    {
      id: 'indicators',
      title: 'Topics',
      option: 'connections',
      connection: 'indicators',
      search: false,
    },
    {
      id: 'actors',
      title: 'Stakeholders',
      option: 'connections',
      connection: 'actors',
      groupByType: true,
      filteringOptions: [
        'filter-member-option',
      ],
      types: [
        ACTORTYPES.COUNTRY,
        ACTORTYPES.REG,
        ACTORTYPES.GROUP,
      ],
    },
    {
      id: 'users',
      title: 'WWF staff',
      option: 'connections',
      connection: 'users',
      search: false,
    },
  ],
  taxonomies: { // filter by each category
    query: 'cat',
    search: true,
    connectPath: API.ACTION_CATEGORIES,
    key: 'category_id',
    ownKey: 'measure_id',
    invalidateEntitiesPaths: [API.CATEGORIES, API.ACTIONS],
  },
  connections: { // filter by associated entity
    // filter by associated actor
    indicators: {
      edit: false,
      query: 'indicators',
      type: 'action-indicators',
      search: true,
      message: 'entities.indicators.plural',
      path: API.INDICATORS,
      entityType: 'indicators',
      sort: 'referenceThenTitle',
      connectionAttributeFilter: {
        addonOnly: true,
        path: 'indicatorConnections',
        // query: 'indicatorConnections',
        attribute: 'supportlevel_id',
        connectionId: 'indicator_id',
        message: 'attributes.supportlevel_id',
        options: Object.keys(ACTION_INDICATOR_SUPPORTLEVELS).reduce(
          (memo, key) => qe(key, 99) ? memo : { ...memo, [key]: ACTION_INDICATOR_SUPPORTLEVELS[key] },
          {},
        ),
        optionMessages: 'supportlevels',
      },
    },
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
        options: ATTRIBUTE_STATUSES.draft,
        role: USER_ROLES.MEMBER.value,
        filterUI: 'checkboxes',
      },
      {
        search: false,
        message: 'attributes.private',
        attribute: 'private',
        options: ATTRIBUTE_STATUSES.private,
        role: USER_ROLES.MEMBER.value,
        roleEdit: USER_ROLES.ADMIN.value,
        filterUI: 'checkboxes',
      },
      {
        search: false,
        message: 'attributes.is_archive',
        attribute: 'is_archive',
        options: ATTRIBUTE_STATUSES.is_archive,
        role: USER_ROLES.ADMIN.value,
        filterUI: 'checkboxes',
        default: false,
      },
      {
        search: false,
        message: 'attributes.public_api',
        attribute: 'public_api',
        options: ATTRIBUTE_STATUSES.public_api,
        role: USER_ROLES.ADMIN.value,
        filterUI: 'checkboxes',
        default: false,
        types: [
          ACTIONTYPES.EXPRESS,
        ],
      },
      {
        search: false,
        message: 'attributes.notifications',
        attribute: 'notifications',
        options: ATTRIBUTE_STATUSES.notifications,
        role: USER_ROLES.ADMIN.value,
        filterUI: 'checkboxes',
        default: false,
      },
    ],
  },
};
