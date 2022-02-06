import { API, ROUTES } from 'themes/config';
// specify the filter and query  options
export const DEPENDENCIES = [
  API.PAGES,
  API.USER_ROLES,
];

export const CONFIG = {
  serverPath: API.PAGES,
  clientPath: ROUTES.PAGES,
  views: {
    list: {
      search: ['title'],
      sorting: [
        {
          attribute: 'order',
          type: 'number',
          order: 'asc',
          default: true,
        },
        {
          attribute: 'title',
          type: 'string',
          order: 'asc',
        },
        {
          attribute: 'id', // proxy for created at
          type: 'number',
          order: 'desc',
        },
        {
          attribute: 'updated_at',
          type: 'date',
          order: 'desc',
        },
      ],
    },
  },
};
