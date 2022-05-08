// import { API, USER_ROLES, ROUTES } from 'themes/config';
import { API, ROUTES } from 'themes/config';

export const DEPENDENCIES = [
  API.USERS,
  API.ROLES,
  API.USER_ROLES,
  API.TAXONOMIES,
  API.CATEGORIES,
  API.ACTIONS,
  API.ACTORS,
  API.USER_ACTIONS,
  API.USER_ACTORS,
  API.ACTION_CATEGORIES,
  API.ACTOR_CATEGORIES,
  API.ACTIONTYPES,
  API.ACTORTYPES,
  API.USER_CATEGORIES,
];

export const CONFIG = {
  types: 'users',
  clientPath: ROUTES.USERS,
  serverPath: API.USERS,
  views: {
    list: {
      search: ['name'],
      sorting: [
        {
          attribute: 'id', // proxy for created at
          type: 'number',
          order: 'desc',
        },
        {
          attribute: 'name',
          type: 'string',
          order: 'asc',
          default: true,
        },
        {
          attribute: 'updated_at',
          type: 'date',
          order: 'desc',
        },
      ],
    },
  },
  connections: { // filter by associated entity
    actions: {
      query: 'action',
      type: 'user-actions',
      search: true,
      messageByType: 'entities.actions_{typeid}.plural',
      message: 'entities.actions.plural',
      path: API.ACTIONS, // filter by actor connection
      entityType: 'actions', // filter by actor connection
      clientPath: ROUTES.ACTION,
      connectPath: API.USER_ACTIONS, // filter by actor connection
      key: 'measure_id',
      ownKey: 'user_id',
      groupByType: true,
    },
    actors: {
      query: 'actor',
      type: 'user-actors',
      search: true,
      messageByType: 'entities.actors_{typeid}.plural',
      message: 'entities.actors.plural',
      path: API.ACTORS, // filter by actor connection
      entityType: 'actors', // filter by actor connection
      clientPath: ROUTES.ACTOR,
      connectPath: API.USER_ACTORS, // filter by actor connection
      key: 'actor_id',
      ownKey: 'user_id',
      groupByType: true,
    },
  },
};
