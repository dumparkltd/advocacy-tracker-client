import {
  API,
  ROUTES,
  USER_ROLES,
  PUBLISH_STATUSES,
  PRIVACY_STATUSES,
  ARCHIVE_STATUSES,
} from 'themes/config';

export const DEPENDENCIES = [
  API.INDICATORS,
  API.TAXONOMIES,
  API.CATEGORIES,
  API.ACTORS,
  API.MEMBERSHIPS,
  API.ACTIONS,
  API.ACTION_INDICATORS,
  API.ACTION_CATEGORIES,
  API.ACTIONTYPE_TAXONOMIES,
  API.ACTOR_ACTIONS,
  API.ACTIONTYPES,
  API.USERS,
  API.USER_ROLES,
];

export const CONFIG = {
  types: 'indicators',
  serverPath: API.INDICATORS,
  clientPath: ROUTES.INDICATOR,
  batchDelete: true,
  views: {
    list: {
      search: ['code', 'title', 'description'],
    },
  },
  connections: { // filter by associated entity
    actions: {
      query: 'action',
      type: 'indicator-actions',
      search: true,
      messageByType: 'entities.actions_{typeid}.plural',
      message: 'entities.actions.plural',
      path: API.ACTIONS, // filter by actor connection
      invalidateEntitiesPaths: [API.ACTIONS, API.INDICATORS],
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
        filterUI: 'checkboxes',
      },
      {
        search: false,
        message: 'attributes.private',
        attribute: 'private',
        options: PRIVACY_STATUSES,
        role: USER_ROLES.MANAGER.value,
        roleEdit: USER_ROLES.ADMIN.value,
        filterUI: 'checkboxes',
      },
      {
        search: false,
        message: 'attributes.is_archive',
        attribute: 'is_archive',
        options: ARCHIVE_STATUSES,
        role: USER_ROLES.ADMIN.value,
        filterUI: 'checkboxes',
        default: false,
      },
    ],
  },
  // connectedTaxonomies: { // filter by each category
  //   query: 'catx',
  //   search: true,
  //   path: 'actions', // filter by action connection
  //   typeId: ACTIONTYPES.EXPRESS,
  //   otherPath: API.ACTIONS, // filter by action connection
  //   key: 'measure_id',
  // },
};
