import {
  API,
  ROUTES,
  USER_ROLES,
  PUBLISH_STATUSES,
} from 'themes/config';

export const DEPENDENCIES = [
  API.INDICATORS,
  API.TAXONOMIES,
  API.CATEGORIES,
  API.ACTIONS,
  API.ACTION_INDICATORS,
  API.ACTION_CATEGORIES,
  API.ACTOR_ACTIONS,
  API.ACTIONTYPES,
  API.USERS,
  API.USER_ROLES,
];

export const CONFIG = {
  serverPath: API.INDICATORS,
  clientPath: ROUTES.INDICATOR,
  views: {
    list: {
      search: ['title', 'description'],
      sorting: [
        {
          attribute: 'title',
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
  },
  connections: { // filter by associated entity
    actions: {
      query: 'action',
      type: 'indicator-actions',
      search: true,
      message: 'entities.actions_{typeid}.plural',
      path: API.ACTIONS, // filter by actor connection
      entityType: 'actions', // filter by actor connection
      clientPath: ROUTES.ACTION,
      connectPath: API.ACTION_INDICATORS, // filter by actor connection
      key: 'measure_id',
      ownKey: 'indicator_id',
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
