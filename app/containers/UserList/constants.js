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
  types: 'users',
  clientPath: ROUTES.USERS,
  serverPath: API.USERS,
  views: {
    list: {
      search: ['name'],
    },
  },
};
