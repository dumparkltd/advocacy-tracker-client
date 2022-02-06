import { API, ROUTES } from 'themes/config';

export const DEPENDENCIES = [
  API.PAGES,
  API.CATEGORIES,
  API.TAXONOMIES,
  API.ACTIONS,
  API.ACTORS,
  API.ACTORTYPE_TAXONOMIES,
  API.ACTOR_ACTIONS,
];

export const UPDATE_QUERY = 'impactoss/Search/UPDATE_QUERY';
export const RESET_SEARCH_QUERY = 'impactoss/Search/RESET_SEARCH_QUERY';
export const SORTBY_CHANGE = 'impactoss/Search/SORTBY_CHANGE';
export const SORTORDER_CHANGE = 'impactoss/Search/SORTORDER_CHANGE';

export const CONFIG = {
  search: [
    {
      group: 'entities',
      targets: [
        {
          path: API.ACTIONS,
          clientPath: ROUTES.ACTIONS,
          search: ['title', 'description', 'outcome'],
          sorting: [
            {
              attribute: 'id', // proxy for created at
              type: 'number',
              order: 'desc',
              default: true,
            },
            {
              attribute: 'title',
              type: 'string',
              order: 'asc',
            },
            {
              attribute: 'updated_at',
              type: 'date',
              order: 'desc',
            },
          ],
        },
        {
          path: API.ACTORS,
          clientPath: ROUTES.ACTORS,
          search: ['title', 'description', 'code'],
          groupByType: true,
          sorting: [
            {
              attribute: 'id', // proxy for created at
              type: 'number',
              order: 'desc',
              default: true,
            },
            {
              attribute: 'title',
              type: 'string',
              order: 'asc',
            },
            {
              attribute: 'updated_at',
              type: 'date',
              order: 'desc',
            },
          ],
        },
      ],
    },
    {
      group: 'taxonomies',
      search: [{
        attribute: 'title',
        as: 'taxonomy',
      }],
      categorySearch: ['title', 'short_title', 'description', 'url', 'taxonomy'],
      sorting: [
        {
          attribute: 'title',
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
    {
      group: 'content',
      targets: [
        {
          path: API.PAGES,
          clientPath: ROUTES.PAGES,
          search: ['title', 'content', 'menu_title'],
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
      ],
    },
  ],
};
