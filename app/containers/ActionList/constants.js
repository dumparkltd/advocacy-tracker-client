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
  API.USER_ROLES,
];

export const CONFIG = {
  types: 'actiontypes',
  serverPath: API.ACTIONS,
  clientPath: ROUTES.ACTION,
  hasMemberOption: true,
  views: {
    list: {
      search: ['code', 'title', 'description'],
    },
    map: {
      types: [
        ACTIONTYPES.REGLSEAS,
        ACTIONTYPES.REGL,
        ACTIONTYPES.NATL,
        ACTIONTYPES.INIT,
        ACTIONTYPES.DONOR,
      ],
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
      messageByType: 'entities.actors_{typeid}.plural',
      message: 'entities.actors.plural',
      path: API.ACTORS,
      entityType: 'actors',
      clientPath: ROUTES.ACTOR,
      connectPath: API.ACTOR_ACTIONS, // filter by actor connection
      key: 'actor_id',
      ownKey: 'measure_id',
      groupByType: true,
      typeFilter: 'is_active',
      typeMemberFilter: 'has_members',
    },
    // filter by associated target
    targets: {
      query: 'targeted',
      type: 'action-targets',
      search: true,
      messageByType: 'entities.actors_{typeid}.plural',
      message: 'entities.actors.plural',
      path: API.ACTORS,
      entityType: 'actors',
      entityTypeAs: 'targets',
      clientPath: ROUTES.ACTOR,
      connectPath: API.ACTION_ACTORS, // filter by actor connection
      key: 'actor_id',
      ownKey: 'measure_id',
      groupByType: true,
      typeFilter: 'is_target',
      typeMemberFilter: 'has_members',
    },
    // filter by associated entity
    resources: {
      query: 'resources',
      type: 'action-resources',
      search: true,
      messageByType: 'entities.resources_{typeid}.plural',
      message: 'entities.resources.plural',
      path: API.RESOURCES,
      entityType: 'resources',
      clientPath: ROUTES.RESOURCE,
      connectPath: API.ACTION_RESOURCES, // filter by actor connection
      key: 'resource_id',
      ownKey: 'measure_id',
      groupByType: true,
      listItemHide: true,
    },
    // filter by associated parent
    parents: {
      query: 'parent',
      type: 'action-parents',
      search: true,
      message: 'attributes.parent_id',
      path: API.ACTIONS,
      entityType: 'actions',
      entityTypeAs: 'parent',
      clientPath: ROUTES.ACTION,
      attribute: 'parent_id',
      typeFilter: 'has_parent',
      listItemHide: true,
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
        filterUI: 'checkboxes',
      },
    ],
  },
};
