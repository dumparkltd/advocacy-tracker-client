import { API, ROUTES } from 'themes/config';

export const DEPENDENCIES = [
  API.PAGES,
  API.CATEGORIES,
  API.TAXONOMIES,
  API.ACTIONS,
  API.ACTORS,
  API.RESOURCES,
  API.ACTORTYPES,
  API.ACTIONTYPES,
  API.RESOURCETYPES,
  // API.ACTORTYPE_TAXONOMIES,
  // API.ACTOR_ACTIONS,
];

export const UPDATE_QUERY = 'impactoss/Search/UPDATE_QUERY';
export const RESET_SEARCH_QUERY = 'impactoss/Search/RESET_SEARCH_QUERY';
export const SORTBY_CHANGE = 'impactoss/Search/SORTBY_CHANGE';
export const SORTORDER_CHANGE = 'impactoss/Search/SORTORDER_CHANGE';

export const CONFIG = {
  search: [
    {
      group: 'actions',
      targets: [
        {
          path: API.ACTIONS,
          optionPath: 'actions',
          typePath: API.ACTIONTYPES,
          typeAttribute: 'measuretype_id',
          clientPath: ROUTES.ACTION,
          search: ['code', 'title', 'description', 'comment', 'url'],
          groupByType: true,
        },
      ],
    },
    {
      group: 'actors',
      targets: [
        {
          path: API.ACTORS,
          typePath: API.ACTORTYPES,
          typeAttribute: 'actortype_id',
          clientPath: ROUTES.ACTOR,
          search: ['code', 'title', 'description', 'activity_summary', 'url'],
          groupByType: true,
        },
      ],
    },
    {
      group: 'resources',
      targets: [
        {
          path: API.RESOURCES,
          typePath: API.RESOURCETYPES,
          typeAttribute: 'resourcetype_id',
          clientPath: ROUTES.RESOURCE,
          search: ['title', 'description', 'status', 'url'],
          groupByType: true,
        },
      ],
    },
  ],
};
