import {
  API,
  USER_ROLES,
  ATTRIBUTE_STATUSES,
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
  batchDelete: true,
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
      invalidateEntitiesPaths: [API.ACTIONS, API.RESOURCES],
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
    ],
  },
};
