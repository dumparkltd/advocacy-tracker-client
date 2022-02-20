import {
  API,
  ROUTES,
  USER_ROLES,
  PUBLISH_STATUSES,
  ACTIONTYPES,
} from 'themes/config';

export const DEPENDENCIES = [
  API.ACTORS,
  API.ACTIONS,
  API.RESOURCES,
  API.INDICATORS,
  API.ACTOR_ACTIONS,
  API.ACTION_ACTORS,
  API.ACTION_RESOURCES,
  API.ACTION_INDICATORS,
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
  API.USERS,
  API.USER_ACTIONS,
  API.USER_ROLES,
];

export const CONFIG = {
  types: 'actiontypes',
  serverPath: API.ACTIONS,
  clientPath: ROUTES.ACTION,
  views: {
    list: {
      search: ['code', 'title', 'description'],
      sorting: [
        {
          attribute: 'title',
          type: 'string',
          order: 'asc',
        },
        {
          attribute: 'code',
          type: 'string',
          order: 'asc',
        },
        {
          attribute: 'updated_at',
          type: 'date',
          order: 'desc',
          default: true,
        },
        {
          attribute: 'id', // proxy for created at
          type: 'number',
          order: 'desc',
        },
      ],
    },
    map: {
      types: Object.values(ACTIONTYPES),
    },
  },
  taxonomies: { // filter by each category
    query: 'cat',
    search: true,
    connectPath: API.ACTION_CATEGORIES,
    key: 'category_id',
    ownKey: 'measure_id',
    // defaultGroupAttribute: 'groups_actions_default',
  },
  // connectedTaxonomies: { // filter by each category
  //   query: 'catx',
  //   search: true,
  //   exclude: 'tags_actions',
  //   connections: [
  //     {
  //       path: API.ACTORS, // filter by actor connection
  //       message: 'entities.actors.plural',
  //       key: 'actor_id',
  //     },
  //   ],
  // },
  connections: { // filter by associated entity
    // filter by associated actor
    actors: {
      query: 'actor',
      type: 'action-actors',
      search: true,
      message: 'entities.actors_{typeid}.plural',
      path: API.ACTORS,
      entityType: 'actors',
      clientPath: ROUTES.ACTOR,
      connectPath: API.ACTOR_ACTIONS, // filter by actor connection
      key: 'actor_id',
      ownKey: 'measure_id',
      groupByType: true,
      typeFilter: 'is_active',
    },
    // filter by associated target
    targets: {
      query: 'targeted',
      type: 'action-targets',
      search: true,
      message: 'entities.actors_{typeid}.plural',
      path: API.ACTORS,
      entityType: 'actors',
      entityTypeAs: 'targets',
      clientPath: ROUTES.ACTOR,
      connectPath: API.ACTION_ACTORS, // filter by actor connection
      key: 'actor_id',
      ownKey: 'measure_id',
      groupByType: true,
      typeFilter: 'is_target',
    },
    indicators: {
      query: 'indicators',
      type: 'action-indicators',
      search: true,
      message: 'entities.indicators.plural',
      path: API.INDICATORS,
      entityType: 'indicators',
      clientPath: ROUTES.INDICATOR,
      connectPath: API.ACTION_INDICATORS, // filter by actor connection
      key: 'indicator_id',
      ownKey: 'measure_id',
    },
    // filter by associated entity
    resources: {
      query: 'resources',
      type: 'action-resources',
      search: true,
      message: 'entities.resources_{typeid}.plural',
      path: API.RESOURCES,
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
        role: USER_ROLES.MANAGER.value,
      },
    ],
  },
};
