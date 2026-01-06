import {
  API,
  USER_ROLES,
  ATTRIBUTE_STATUSES,
  EMAIL_STATUSES,
  ROUTES,
  ACTORTYPES,
  GENERAL_POS_TAXONOMY,
  REGION_TYPE_TAXONOMY,
  GROUP_TYPE_TAXONOMY,
  SECTOR_TAXONOMY,
  ROLES_TAXONOMY,
  ACTION_INDICATOR_SUPPORTLEVELS,
} from 'themes/config';

import qe from 'utils/quasi-equals';

export const DEPENDENCIES = [
  API.ACTORS,
  API.ACTIONS,
  API.ACTOR_ACTIONS,
  API.ACTION_ACTORS,
  API.ACTOR_CATEGORIES,
  API.ACTION_CATEGORIES,
  API.ACTORTYPES,
  API.ACTIONTYPES,
  API.ACTORTYPE_TAXONOMIES,
  API.ACTIONTYPE_TAXONOMIES,
  API.TAXONOMIES,
  API.CATEGORIES,
  API.USERS,
  API.USER_ROLES,
  API.USER_ACTORS,
  API.MEMBERSHIPS,
  API.INDICATORS,
  API.ACTION_INDICATORS,
];

export const CONFIG = {
  types: 'actortypes',
  serverPath: API.ACTORS,
  clientPath: ROUTES.ACTOR,
  downloadCSV: true,
  batchDelete: true,
  includeMembersWhenFiltering: [
    ACTORTYPES.CONTACT,
  ],
  hasMemberOption: [
    ACTORTYPES.CONTACT,
    ACTORTYPES.COUNTRY,
    ACTORTYPES.ORG,
  ],
  hasChildOption: [
    ACTORTYPES.GROUP,
    ACTORTYPES.COUNTRY,
    ACTORTYPES.REGION,
  ],
  views: {
    list: {
      search: ['code', 'title', 'description'],
    },
    map: {
      types: [ACTORTYPES.COUNTRY],
    },
  },
  quickFilterGroups: [
    {
      id: `taxonomies-${GENERAL_POS_TAXONOMY}`,
      title: 'Country general positions',
      option: 'taxonomies',
      taxonomies: [{
        id: GENERAL_POS_TAXONOMY,
        filterType: 'pills',
      }],
    },
    {
      id: `taxonomies-${ROLES_TAXONOMY}`,
      title: 'Roles',
      option: 'taxonomies',
      taxonomies: [{
        id: ROLES_TAXONOMY,
        filterType: 'pills',
      }],
    },
    {
      id: `taxonomies-${SECTOR_TAXONOMY}`,
      title: 'Sectors',
      option: 'taxonomies',
      taxonomies: [{
        id: SECTOR_TAXONOMY,
        filterType: 'pills',
      }],
    },
    {
      id: `taxonomies-${GROUP_TYPE_TAXONOMY}`,
      title: 'Group types',
      option: 'taxonomies',
      taxonomies: [{
        id: GROUP_TYPE_TAXONOMY,
        filterType: 'pills',
      }],
    },
    {
      id: `taxonomies-${REGION_TYPE_TAXONOMY}`,
      title: 'Region types',
      option: 'taxonomies',
      taxonomies: [{
        id: REGION_TYPE_TAXONOMY,
        filterType: 'pills',
      }],
    },
    {
      id: 'indicators',
      title: 'Topics',
      option: 'connections',
      connection: 'indicators',
      search: false,
    },
    {
      id: 'users',
      title: 'WWF staff',
      option: 'connections',
      connection: 'users',
      search: false,
    },
  ],
  taxonomies: { // filter by each category
    query: 'cat',
    search: true,
    connectPath: API.ACTOR_CATEGORIES,
    key: 'category_id',
    ownKey: 'actor_id',
    invalidateEntitiesPaths: [API.CATEGORIES, API.ACTORS],
    // defaultGroupAttribute: 'groups_actors_default', // used when no actortype is set
    // // TODO better store in database join table actortype_taxonomies
    // defaultGroupsByActortype: {
    //   1: { 1: '1', 2: '2' }, // actortype 1 actors are grouped by taxonomies 1 & 2
    //   2: { 1: '9', 2: '10' }, // actortype 2 SDS are grouped by taxonomies 9 & 10
    //   3: { 1: '7' }, // actortype 3 SDGs are grouped by taxonomy 7
    // },
    // groupBy: 'actortype_id',
    // editForActortypes: true,
  },
  connections: { // filter by associated entity
    actions: {
      query: 'action',
      type: 'actor-actions',
      search: true,
      messageByType: 'entities.actions_{typeid}.plural',
      message: 'entities.actions.plural',
      path: API.ACTIONS, // filter by actor connection
      invalidateEntitiesPaths: [API.ACTORS, API.ACTIONS],
      entityType: 'actions', // filter by actor connection
      clientPath: ROUTES.ACTION,
      connectPath: API.ACTOR_ACTIONS, // filter by actor connection
      key: 'measure_id',
      ownKey: 'actor_id',
      groupByType: true,
    },
    indicators: {
      edit: false,
      query: 'indicators',
      type: 'actor-action-indicators',
      search: true,
      message: 'entities.indicators.plural',
      path: API.INDICATORS,
      entityType: 'indicators',
      sort: 'referenceThenTitle',
      connectionAttributeFilter: {
        addonOnly: true,
        path: 'indicatorPositions',
        byIndicator: true,
        // query: 'indicatorConnections',
        attribute: 'supportlevel_id',
        connectionId: 'indicator_id',
        message: 'attributes.supportlevel_id',
        options: Object.keys(ACTION_INDICATOR_SUPPORTLEVELS).reduce(
          (memo, key) => qe(key, 99) ? memo : { ...memo, [key]: ACTION_INDICATOR_SUPPORTLEVELS[key] },
          {},
        ),
        optionMessages: 'supportlevels',
      },
    },
    members: { // filter by associated entity
      query: 'by-member',
      type: 'association-members',
      search: true,
      messageByType: 'entities.actors_{typeid}.plural',
      message: 'entities.actors.plural',
      path: API.ACTORS, // filter by actor connection
      invalidateEntitiesPaths: [API.ACTORS],
      entityTypeAs: 'members', // filter by actor connection
      entityType: 'actors',
      clientPath: ROUTES.ACTOR,
      connectPath: API.MEMBERSHIPS, // filter by actor connection
      key: 'member_id',
      ownKey: 'memberof_id',
      groupByType: true,
    },
    associations: { // filter by associated entity
      query: 'by-association',
      type: 'member-associations',
      search: true,
      messageByType: 'entities.actors_{typeid}.plural',
      message: 'entities.actors.plural',
      path: API.ACTORS, // filter by actor connection
      invalidateEntitiesPaths: [API.ACTORS],
      entityType: 'actors',
      entityTypeAs: 'associations', // filter by actor connection
      clientPath: ROUTES.ACTOR,
      connectPath: API.MEMBERSHIPS, // filter by actor connection
      key: 'memberof_id',
      ownKey: 'member_id',
      groupByType: true,
    },
    users: {
      query: 'users',
      type: 'actor-users',
      search: true,
      message: 'entities.users.plural',
      path: API.USERS,
      invalidateEntitiesPaths: [API.USERS, API.ACTORS],
      entityType: 'users',
      clientPath: ROUTES.USER,
      connectPath: API.USER_ACTORS, // filter by actor connection
      key: 'user_id',
      ownKey: 'actor_id',
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
        role: USER_ROLES.ADMIN.value,
        filterUI: 'checkboxes',
        default: false,
      },
      {
        search: false,
        message: 'attributes.email',
        attribute: 'email',
        options: EMAIL_STATUSES,
        role: USER_ROLES.ADMIN.value,
        filterUI: 'checkboxes',
        default: false,
        edit: false,
        types: [
          ACTORTYPES.CONTACT,
        ],
      },
    ],
  },
};
