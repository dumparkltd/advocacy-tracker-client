import {
  API,
  ROUTES,
  USER_ROLES,
  ATTRIBUTE_STATUSES,
} from 'themes/config';

// required for selectActorsWithPositionsData
import { ACTORS_WITH_POSITIONS_DEPENDENCIES } from 'containers/App/selectors';

export const DEPENDENCIES = [
  ...new Set([
    ...ACTORS_WITH_POSITIONS_DEPENDENCIES,
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
  ]),
];

export const CONFIG = {
  types: 'indicators',
  serverPath: API.INDICATORS,
  clientPath: ROUTES.INDICATOR,
  batchDelete: true,
  downloadCSV: true,
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
      {
        search: false,
        message: 'attributes.public_api',
        attribute: 'public_api',
        options: ATTRIBUTE_STATUSES.public_api,
        role: USER_ROLES.MEMBER.value,
        roleEdit: USER_ROLES.COORDINATOR.value,
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
