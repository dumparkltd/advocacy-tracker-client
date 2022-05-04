import {
  API,
  USER_ROLES,
  PUBLISH_STATUSES,
  ROUTES,
  // RESOURCETYPES,
} from 'themes/config';

export const DEPENDENCIES = [
  API.RESOURCES,
  API.ACTIONS,
  API.ACTION_RESOURCES,
  API.ACTION_CATEGORIES,
  API.RESOURCETYPES,
  API.ACTIONTYPES,
  API.ACTIONTYPE_TAXONOMIES,
  API.TAXONOMIES,
  API.CATEGORIES,
  API.USERS,
  API.USER_ROLES,
];

export const CONFIG = {
  types: 'resourcetypes',
  serverPath: API.RESOURCES,
  clientPath: ROUTES.RESOURCE,
  views: {
    list: {
      search: ['title', 'description'],
    },
  },
  connections: { // filter by associated entity
    actions: {
      query: 'action',
      type: 'resource-actions',
      search: true,
      messageByType: 'entities.actions_{typeid}.plural',
      message: 'entities.actions.plural',
      path: API.ACTIONS, // filter by actor connection
      entityType: 'actions', // filter by actor connection
      clientPath: ROUTES.ACTION,
      connectPath: API.ACTION_RESOURCES, // filter by actor connection
      key: 'measure_id',
      ownKey: 'resource_id',
      groupByType: true,
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
