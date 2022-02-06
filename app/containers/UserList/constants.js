// import { API, USER_ROLES, ROUTES } from 'themes/config';
import { API, ROUTES } from 'themes/config';

export const DEPENDENCIES = [
  API.USERS,
  API.ROLES,
  API.USER_ROLES,
  API.CATEGORIES,
  API.TAXONOMIES,
  API.USER_CATEGORIES,
];

export const CONFIG = {
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
  // taxonomies: { // filter by each category
  //   query: 'cat',
  //   search: true,
  //   connectPath: API.USER_CATEGORIES,
  //   key: 'category_id',
  //   ownKey: 'user_id',
  // },
  // connections: { // filter by associated entity
  //   query: 'connected',
  //   options: [
  //     {
  //       edit: false,
  //       search: true,
  //       popover: false,
  //       message: 'entities.roles.single',
  //       path: API.ROLES, // filter by actor connection
  //       key: 'role_id',
  //       labels: Object.values(USER_ROLES),
  //     },
  //   ],
  // },
};
