import { API, ROUTES } from 'themes/config';
// specify the filter and query  options
export const DEPENDENCIES = [
  API.PAGES,
  API.USER_ROLES,
];

export const CONFIG = {
  types: 'pages',
  serverPath: API.PAGES,
  clientPath: ROUTES.PAGES,
  views: {
    list: {
      search: ['title', 'description'],
    },
  },
};
