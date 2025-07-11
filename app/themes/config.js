/*
 * Global config
 *
 * Theme and icons:
 * - theme file is set in app.js "import theme from 'themes/[theme-file]';"
 * - icon file is set in components/Icon/index.js "import icons from 'themes/[icons-file]';"
 *
 * Images: images are stored in 'themes/media' folder
 *
 */
import { version } from '../../package.json';
// General ********************
export const SERVER = (process && process.env && process.env.SERVER) || 'production';
export const IS_DEV = SERVER !== 'production';

export const VERSION = `${version}${IS_DEV ? ' [TEST-DB]' : ''}`;

export const ENDPOINTS = {
  API: IS_DEV // server API endpoint
    ? 'https://advocacy-tracker-dev.herokuapp.com'
    : 'https://advocacy-tracker-api.herokuapp.com',
  SIGN_IN: 'auth/sign_in',
  SIGN_OUT: 'auth/sign_out',
  PASSWORD: 'auth/password',
  VALIDATE_TOKEN: 'auth/validate_token',
};

// client app routes **************************
export const ROUTES = {
  ID: '/:id',
  VIEW: '/:view', //  e.g. list or map or stats
  NEW: '/new',
  EDIT: '/edit',
  IMPORT: '/import',
  OVERVIEW: '/overview',
  BOOKMARKS: '/bookmarks',
  PASSWORD: '/password', // change password
  LOGIN: '/login',
  LOGOUT: '/logout',
  REGISTER: '/register',
  RESET_PASSWORD: '/resetpassword',
  RECOVER_PASSWORD: '/recoverpassword',
  UNAUTHORISED: '/unauthorised',
  USERS: '/users',
  ACTIONS: '/actions',
  ACTOR_ACTIONS: '/actoractions',
  ACTION: '/action',
  ACTORS: '/actors',
  ACTOR: '/actor',
  INDICATORS: '/topics', // api: indicators
  INDICATOR: '/topic',
  RESOURCES: '/resources',
  RESOURCE: '/resource',
  TAXONOMIES: '/categories',
  CATEGORY: '/category',
  PAGES: '/pages',
  SEARCH: '/search',
  POSITIONS: '/positions',
  // OUTREACH: '/outreach',
  MYSTUFF: '/mystuff',
};

// Server endpoints for database tables **************************
// should match https://github.com/dumparkltd/marine-defrag-server/blob/master/config/routes.rb
export const API = {
  ACTORS: 'actors',
  ACTIONS: 'measures', // actions/ACTIONS
  INDICATORS: 'indicators', // actions/ACTIONS
  ACTORTYPES: 'actortypes', // action types
  ACTIONTYPES: 'measuretypes', // action types
  ACTOR_ACTIONS: 'actor_measures', // linking actors with their actions
  ACTION_ACTORS: 'measure_actors', // linking actions with their targets
  ACTION_ACTIONS: 'measure_measures', // linking actions with related axtions
  USER_ACTORS: 'user_actors', // linking users with actors
  USER_ACTIONS: 'user_measures', // linking users with assigned actions
  ACTION_INDICATORS: 'measure_indicators', // linking actions with indicators
  ACTOR_CATEGORIES: 'actor_categories',
  ACTION_CATEGORIES: 'measure_categories', // measure_categories
  ACTORTYPE_TAXONOMIES: 'actortype_taxonomies', // action taxonomies
  ACTIONTYPE_TAXONOMIES: 'measuretype_taxonomies', // action taxonomies
  MEMBERSHIPS: 'memberships', // quasi: actor_actors
  RESOURCES: 'resources',
  ACTION_RESOURCES: 'measure_resources',
  RESOURCETYPES: 'resourcetypes', // resource types
  TAXONOMIES: 'taxonomies',
  CATEGORIES: 'categories',
  USERS: 'users',
  USER_ROLES: 'user_roles',
  // USER_CATEGORIES: 'user_categories',
  ROLES: 'roles',
  PAGES: 'pages',
  BOOKMARKS: 'bookmarks',
};

export const API_FOR_ROUTE = {
  [ROUTES.ACTOR]: API.ACTORS,
  [ROUTES.ACTION]: API.ACTIONS,
  [ROUTES.INDICATOR]: API.INDICATORS,
  [ROUTES.CATEGORY]: API.CATEGORIES,
  [ROUTES.RESOURCE]: API.RESOURCES,
  [ROUTES.USERS]: API.USERS,
};
export const ROUTE_FOR_API = {
  [API.ACTORS]: ROUTES.ACTOR,
  [API.ACTIONS]: ROUTES.ACTION,
  [API.INDICATORS]: ROUTES.INDICATOR,
  [API.CATEGORIES]: ROUTES.CATEGORY,
  [API.RESOURCES]: ROUTES.RESOURCE,
  [API.USERS]: ROUTES.USERS,
};

export const ACTIONTYPES = {
  EXPRESS: '1',
  EVENT: '2',
  OP: '3',
  AP: '4',
  TASK: '5',
  INTERACTION: '6',
};

export const ACTORTYPES = {
  COUNTRY: '1',
  CONTACT: '3',
  ORG: '2',
  GROUP: '5',
  REG: '4',
};

export const RESOURCETYPES = {
  WEB: '2',
  REF: '1',
  DOC: '3',
};

export const OFFICIAL_STATEMENT_CATEGORY_ID = 55;
export const GENERAL_POS_TAXONOMY = 1;
export const SECTOR_TAXONOMY = 2;
export const ROLES_TAXONOMY = 3;
export const REGION_TYPE_TAXONOMY = 4;
export const GROUP_TYPE_TAXONOMY = 5;
export const EXPRESSFORM_TAXONOMY = 7;
export const EVENT_TYPE_TAXONOMY = 9;
export const PRIORITY_TAXONOMY = 10;
export const INTERACTION_TYPE_TAXONOMY = 12;
export const AUTHORITY_TAXONOMY = 13;

export const ACTION_INDICATOR_SUPPORTLEVELS = {
  // not assigned
  0: {
    value: '0',
    default: true,
    color: '#d8d9d9',
    order: 100,
  },
  // strong
  1: {
    value: '1',
    color: '#02A650', // green-purple
    // color: '#02A650', // green-pink
    // color: '#029481', // teal-brown
    order: 1,
  },
  // quite positive
  2: {
    value: '2',
    color: '#81DD90', // green-purple
    // color: '#81DD90', // green-pink
    // color: '#80CDC1', // teal-brown
    order: 2,
  },
  // on the fence
  3: {
    value: '3',
    color: '#E5CCF3', // green-purple
    // color: '#EBB2D3', // green-pink
    // color: '#E2CDAD', // teal-brown
    order: 3,
  },
  // rather sceptical
  4: {
    value: '4',
    color: '#BF7FDD', // green-purple
    // color: '#D966A8', // green-pink
    // color: '#B88034', // teal-brown
    order: 4,
  },
  // opponent
  5: {
    value: '5',
    color: '#5B0290', // green-purple
    // color: '#BF0071', // green-pink
    // color: '#67402E', // teal-brown
    order: 5,
  },
  // proxy for no statement
  99: {
    value: '99',
    color: '#EDEFF0',
    order: 99,
  },
};

export const ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS = {
  [ACTIONTYPES.EXPRESS]: [
    ACTION_INDICATOR_SUPPORTLEVELS['0'],
    ACTION_INDICATOR_SUPPORTLEVELS['1'],
    ACTION_INDICATOR_SUPPORTLEVELS['2'],
    ACTION_INDICATOR_SUPPORTLEVELS['3'],
    ACTION_INDICATOR_SUPPORTLEVELS['4'],
    ACTION_INDICATOR_SUPPORTLEVELS['5'],
  ],
};

export const OUTREACH_ACTIONTYPES = [
  ACTIONTYPES.INTERACTION,
  ACTIONTYPES.TASK,
  ACTIONTYPES.OP,
  ACTIONTYPES.AP,
  ACTIONTYPES.EVENT,
];
export const ACTIONTYPE_NAVGROUPS = {
  // Plans & Tasks
  1: {
    types: [
      ACTIONTYPES.TASK,
      ACTIONTYPES.OP,
      ACTIONTYPES.AP,
    ],
  },
  // country expressions
  2: {
    types: [
      ACTIONTYPES.EXPRESS, // international frameworks
    ],
  },
  // events and interactions
  3: {
    types: [
      ACTIONTYPES.INTERACTION,
      ACTIONTYPES.EVENT,
    ],
  },
};
export const ACTORTYPE_NAVGROUPS = {
  // Contacts & countries
  1: {
    types: [
      ACTORTYPES.CONTACT,
      ACTORTYPES.COUNTRY,
    ],
  },
  // Other actors
  2: {
    types: [
      ACTORTYPES.ORG, // orgs
      ACTORTYPES.GROUP, // groups
      ACTORTYPES.REG, // regions
    ],
  },
};
export const RESOURCETYPE_NAVGROUPS = {
  // temp: one group only for now
  1: {
    types: [
      RESOURCETYPES.REF,
      RESOURCETYPES.WEB,
      RESOURCETYPES.DOC,
    ],
  },
};

export const ACTION_FIELDS = {
  CONNECTIONS: {
    categories: {
      table: API.CATEGORIES,
      connection: API.ACTION_CATEGORIES,
      groupby: {
        table: API.TAXONOMIES,
        on: '_id',
      },
    },
    actors: {
      table: API.ACTORS,
      connection: API.ACTOR_ACTIONS,
      groupby: {
        table: API.ACTORTYPES,
        on: 'actortype_id',
      },
    },
    indicators: {
      table: API.INDICATORS,
      preview: [ACTIONTYPES.EXPRESS],
    },
  },
  ATTRIBUTES: {
    measuretype_id: {
      defaultValue: '1',
      required: Object.values(ACTIONTYPES), // all types
      type: 'number',
      skipImport: true,
      table: API.ACTIONTYPES,
      exportColumn: 'activity_type',
      export: true,
      editable: false,
    },
    code: {
      optional: Object.values(ACTIONTYPES), // all types
      adminOnly: true,
      type: 'text',
    },
    title: {
      required: Object.values(ACTIONTYPES), // all types
      type: 'text',
      // exportRequired: true,
    },
    // parent_id: {
    //   skipImport: true,
    //   optional: Object.values(ACTIONTYPES), // controlled by type setting
    //   type: 'number',
    // },
    description: {
      optional: Object.values(ACTIONTYPES),
      type: 'markdown',
    },
    comment: {
      optional: Object.values(ACTIONTYPES),
      type: 'markdown',
      hideByDefault: true,
    },
    url: {
      optional: Object.values(ACTIONTYPES),
      type: 'url',
    },
    date_start: {
      optional: Object.values(ACTIONTYPES),
      preview: Object.values(ACTIONTYPES),
      type: 'date',
    },
    date_end: {
      optional: [ACTIONTYPES.EVENT],
      section: 1,
      type: 'date',
    },
    date_comment: {
      optional: Object.values(ACTIONTYPES),
      type: 'text',
      section: 1,
      hideByDefault: true,
    },
    draft: {
      defaultValue: true,
      controlType: 'checkbox',
      type: 'bool',
      section: 'footer',
      // ui: 'dropdown',
      skipImport: true,
      // options: [
      //   { value: true, message: 'ui.publishStatuses.draft' },
      //   { value: false, message: 'ui.publishStatuses.public' },
      // ],
    },
    private: {
      defaultValue: false,
      controlType: 'checkbox',
      type: 'bool',
    },
    is_archive: {
      defaultValue: false,
      controlType: 'checkbox',
      type: 'bool',
    },
    notifications: {
      defaultValue: true,
      controlType: 'checkbox',
      type: 'bool',
    },
    created_at: {
      skipImport: true,
      type: 'datetime',
      adminOnly: true,
      meta: true,
    },
    created_by_id: {
      skipImport: true,
      type: 'key',
      adminOnly: true,
      meta: true,
      table: API.USERS,
      exportColumn: 'created_by',
    },
    updated_at: {
      skipImport: true,
      type: 'datetime',
      adminOnly: true,
      meta: true,
    },
    updated_by_id: {
      skipImport: true,
      type: 'key',
      adminOnly: true,
      meta: true,
      table: API.USERS,
      exportColumn: 'updated_by',
    },
    relationship_updated_at: {
      skipImport: true,
      type: 'datetime',
      adminOnly: true,
      meta: true,
      exportColumn: 'connection_updated_at',
    },
    relationship_updated_by_id: {
      skipImport: true,
      type: 'key',
      adminOnly: true,
      meta: true,
      table: API.USERS,
      exportColumn: 'connection_updated_by',
    },
  },
  // additional
  RELATIONSHIPS_IMPORT: {
    // related to a topic with a position
    // column: topic-code:supportNo
    'topic-code': {
      type: 'text',
      optional: [ACTIONTYPES.EXPRESS],
      lookup: {
        table: API.INDICATORS,
        attribute: 'code',
      },
      table: API.ACTION_INDICATORS,
      keyPair: ['measure_id', 'indicator_id'], // own, other
      attribute: {
        column: 'supportlevel_id',
        code: 'supportNo',
        map: ACTION_INDICATOR_SUPPORTLEVELS,
      },
      separator: '|',
      hint:
        'one or more unique topic codes (as assigned by the users/comma-separated) optionally specifying levels of support for each using |. Example: CODE1|3,CODE2|1',
    },
    'actor-code': {
      type: 'text',
      optional: Object.values(ACTIONTYPES),
      lookup: {
        table: API.ACTORS,
        attribute: 'code',
      },
      table: API.ACTOR_ACTIONS,
      keyPair: ['measure_id', 'actor_id'], // own, other
      hint: 'one or more unique actor codes (as assigned by the users / comma-separated)',
    },
    // column: country-code
    'actor-id': {
      type: 'text',
      optional: Object.values(ACTIONTYPES),
      multiple: true,
      table: API.ACTOR_ACTIONS,
      keyPair: ['measure_id', 'actor_id'], // own, other
      hint: 'one or more unique actor ids (as assigned by the database / comma-separated)',
    },
    // belongs to event
    'event-code': {
      type: 'text',
      optional: [
        ACTIONTYPES.EXPRESS,
        ACTIONTYPES.TASK,
        ACTIONTYPES.INTERACTION,
      ],
      multiple: true,
      lookup: {
        table: API.ACTIONS,
        attribute: 'code',
      },
      table: API.ACTION_ACTIONS,
      keyPair: ['measure_id', 'other_measure_id'], // own, other
      hint: 'one or more unique event codes (as assigned by the users / comma-separated) for events the action belongs to',
    },
    // belongs to interaction
    'interaction-code': {
      type: 'text',
      optional: [ACTIONTYPES.EXPRESS],
      multiple: true,
      lookup: {
        table: API.ACTIONS,
        attribute: 'code',
      },
      table: API.ACTION_ACTIONS,
      keyPair: ['measure_id', 'other_measure_id'], // own, other
      hint: 'one or more unique interaction codes (as assigned by the users / comma-separated) for events the action belongs to',
    },
    // belongs to action by code
    'parent-action-code': {
      type: 'text',
      optional: [
        ACTIONTYPES.EXPRESS,
        ACTIONTYPES.TASK,
        ACTIONTYPES.INTERACTION,
        ACTIONTYPES.EVENT,
        ACTIONTYPES.OP,
      ],
      multiple: true,
      lookup: {
        table: API.ACTIONS,
        attribute: 'code',
      },
      table: API.ACTION_ACTIONS,
      keyPair: ['measure_id', 'other_measure_id'], // own, other
      hint: 'one or more unique action codes (as assigned by the users / comma-separated) for any associated parent-actions',
    },
    // belongs to action by ID
    'parent-action-id': {
      type: 'text',
      optional: [
        ACTIONTYPES.EXPRESS,
        ACTIONTYPES.TASK,
        ACTIONTYPES.INTERACTION,
        ACTIONTYPES.EVENT,
        ACTIONTYPES.OP,
      ],
      table: API.ACTION_ACTIONS,
      keyPair: ['measure_id', 'other_measure_id'], // own, other
      hint: 'one or more action ids (as assigned by the database / comma-separated) for any associated parent-actions',
    },
    // has resource
    'resources-id': {
      type: 'number',
      optional: [
        ACTIONTYPES.EXPRESS,
        ACTIONTYPES.EVENT,
        ACTIONTYPES.OP,
        ACTIONTYPES.AP,
        ACTIONTYPES.TASK,
        ACTIONTYPES.INTERACTION,
      ],
      table: API.ACTION_RESOURCES,
      keyPair: ['measure_id', 'resource_id'], // own, other
      hint: 'one or more resource ids (as assigned by the database / comma-separated)',
    },
    // has category
    'category-id': {
      type: 'number',
      optional: Object.values(ACTIONTYPES),
      table: API.ACTION_CATEGORIES,
      keyPair: ['measure_id', 'category_id'], // own, other
      hint: 'one or more category ids (as assigned by the database / comma-separated)',
    },
    // has category
    'category-code': {
      type: 'number',
      optional: Object.values(ACTIONTYPES),
      lookup: {
        table: API.CATEGORIES, // id assumed
        attribute: 'code',
      },
      table: API.ACTION_CATEGORIES,
      keyPair: ['measure_id', 'category_id'], // own, other
      hint: 'one or more category codes (as assigned by the users / comma-separated)',
    },
    // has category
    'user-id': {
      type: 'number',
      optional: [
        ACTIONTYPES.OP,
        ACTIONTYPES.AP,
        ACTIONTYPES.TASK,
        ACTIONTYPES.EVENT,
        ACTIONTYPES.INTERACTION,
      ],
      table: API.USER_ACTIONS,
      keyPair: ['measure_id', 'user_id'], // own, other
      hint: 'one or more user IDs (as assigned by the database / comma-separated)',
    },
    'user-email': {
      type: 'number',
      optional: [
        ACTIONTYPES.OP,
        ACTIONTYPES.AP,
        ACTIONTYPES.TASK,
        ACTIONTYPES.EVENT,
        ACTIONTYPES.INTERACTION,
      ],
      lookup: {
        table: API.USERS, // id assumed
        attribute: 'email',
      },
      table: API.USER_ACTIONS,
      keyPair: ['measure_id', 'user_id'], // own, other
      hint: 'one or more user email addresses (exact / comma-separated)',
    },
  },
};

export const ACTOR_FIELDS = {
  // CONNECTIONS: {
  //   categories: {
  //     table: API.CATEGORIES,
  //     connection: API.ACTOR_CATEGORIES,
  //     groupby: {
  //       table: API.TAXONOMIES,
  //       on: '_id',
  //     },
  //   },
  //   actions: {
  //     table: API.ACTIONS,
  //     connection: API.ACTOR_ACTIONS,
  //     groupby: {
  //       table: API.ACTIONTYPES,
  //       on: 'measuretype_id',
  //     },
  //   },
  // },
  ATTRIBUTES: {
    actortype_id: {
      defaultValue: '1',
      required: true,
      type: 'number',
      table: API.ACTORTYPES,
      skipImport: true,
      exportColumn: 'actor_type',
    },
    code: {
      optional: [
        ACTORTYPES.COUNTRY,
        ACTORTYPES.ORG,
        ACTORTYPES.GROUP,
      ], // all types
      type: 'text',
      adminOnlyForTypes: [
        ACTORTYPES.ORG,
        ACTORTYPES.GROUP,
      ],
    },
    title: {
      required: [
        ACTORTYPES.COUNTRY,
        ACTORTYPES.ORG,
        ACTORTYPES.GROUP,
        ACTORTYPES.REG,
        ACTORTYPES.CONTACT,
      ],
      display: {
        field: 'name',
        types: [ACTORTYPES.CONTACT],
      },
      type: 'text',
    },
    description: {
      optional: [
        ACTORTYPES.COUNTRY,
        ACTORTYPES.ORG,
        ACTORTYPES.GROUP,
        ACTORTYPES.REG,
        ACTORTYPES.CONTACT,
      ],
      type: 'markdown',
    },
    activity_summary: {
      optional: Object.values(ACTORTYPES),
      type: 'markdown',
    },
    url: {
      optional: [
        ACTORTYPES.CONTACT,
        ACTORTYPES.ORG,
        ACTORTYPES.GROUP,
      ],
      type: 'url',
    },
    prefix: {
      optional: [ACTORTYPES.CONTACT],
      type: 'text',
    },
    email: {
      optional: [ACTORTYPES.CONTACT, ACTORTYPES.ORG],
      type: 'text',
    },
    phone: {
      optional: [ACTORTYPES.CONTACT],
      type: 'text',
    },
    address: {
      optional: [ACTORTYPES.CONTACT],
      type: 'textarea',
    },
    draft: {
      defaultValue: true,
      type: 'bool',
      controlType: 'checkbox',
      skipImport: true,
      // ui: 'dropdown',
      // options: [
      //   { value: true, message: 'ui.publishStatuses.draft' },
      //   { value: false, message: 'ui.publishStatuses.public' },
      // ],
    },
    private: {
      defaultValue: false,
      required: true,
      type: 'bool',
    },
    is_archive: {
      defaultValue: false,
      required: true,
      type: 'bool',
    },
    created_at: {
      skipImport: true,
      type: 'datetime',
      adminOnly: true,
      meta: true,
    },
    created_by_id: {
      skipImport: true,
      type: 'key',
      adminOnly: true,
      meta: true,
      table: API.USERS,
      exportColumn: 'created_by',
    },
    updated_at: {
      skipImport: true,
      type: 'datetime',
      adminOnly: true,
      meta: true,
    },
    updated_by_id: {
      skipImport: true,
      type: 'key',
      adminOnly: true,
      meta: true,
      table: API.USERS,
      exportColumn: 'updated_by',
    },
    relationship_updated_at: {
      skipImport: true,
      type: 'datetime',
      adminOnly: true,
      meta: true,
      exportColumn: 'connection_updated_at',
    },
    relationship_updated_by_id: {
      skipImport: true,
      type: 'key',
      adminOnly: true,
      meta: true,
      table: API.USERS,
      exportColumn: 'connection_updated_by',
    },
  },
  RELATIONSHIPS_IMPORT: {
    // related to a topic with a position
    // column: topic-code:supportNo
    'country-code': {
      type: 'text',
      optional: [ACTORTYPES.CONTACT],
      lookup: {
        table: API.ACTORS,
        attribute: 'code',
      },
      table: API.MEMBERSHIPS,
      keyPair: ['member_id', 'memberof_id'], // own, other
      hint: 'one or more unique country codes (as assigned by the users/comma-separated) actors are member of',
    },
    // belongs to event
    'event-code': {
      type: 'text',
      optional: [ACTORTYPES.CONTACT],
      lookup: {
        table: API.ACTIONS,
        attribute: 'code',
      },
      table: API.ACTOR_ACTIONS,
      keyPair: ['actor_id', 'measure_id'], // own, other
      hint: 'one or more unique event codes (as assigned by the users / comma-separated) for events the action belongs to',
    },
    // has category
    'user-id': {
      type: 'number',
      optional: [ACTORTYPES.CONTACT],
      table: API.USER_ACTORS,
      keyPair: ['actor_id', 'user_id'], // own, other
      hint: 'one or more user IDs (as assigned by the database / comma-separated)',
    },
    'user-email': {
      type: 'number',
      optional: [ACTORTYPES.CONTACT],
      lookup: {
        table: API.USERS, // id assumed
        attribute: 'email',
      },
      table: API.USER_ACTORS,
      keyPair: ['actor_id', 'user_id'], // own, other
      hint: 'one or more user email addresses (exact / comma-separated)',
    },
    // has category
    'category-id': {
      type: 'number',
      optional: Object.values(ACTORTYPES),
      table: API.ACTOR_CATEGORIES,
      keyPair: ['actor_id', 'category_id'], // own, other
      hint: 'one or more category ids (as assigned by the database / comma-separated)',
    },
    // has category
    'category-code': {
      type: 'number',
      optional: Object.values(ACTORTYPES),
      lookup: {
        table: API.CATEGORIES, // id assumed
        attribute: 'code',
      },
      table: API.ACTOR_CATEGORIES,
      keyPair: ['actor_id', 'category_id'], // own, other
      hint: 'one or more category codes (as assigned by the users / comma-separated)',
    },
  },
};

export const RESOURCE_FIELDS = {
  // CONNECTIONS: {
  //   actions: {
  //     table: API.ACTIONS,
  //     connection: API.ACTION_RESOURCES,
  //     groupby: {
  //       table: API.ACTIONTYPES,
  //       on: 'measuretype_id',
  //     },
  //   },
  // },
  ATTRIBUTES: {
    resourcetype_id: {
      defaultValue: '1',
      required: Object.values(RESOURCETYPES), // all types
      type: 'number',
      table: API.RESOURCETYPES,
      skipImport: true,
    },
    draft: {
      defaultValue: true,
      controlType: 'checkbox',
      type: 'bool',
      skipImport: true,
      // ui: 'dropdown',
      // options: [
      //   { value: true, message: 'ui.publishStatuses.draft' },
      //   { value: false, message: 'ui.publishStatuses.public' },
      // ],
    },
    private: {
      defaultValue: false,
      required: Object.values(RESOURCETYPES), // all types
      type: 'bool',
    },
    is_archive: {
      defaultValue: false,
      required: Object.values(RESOURCETYPES), // all types
      type: 'bool',
    },
    title: {
      required: Object.values(RESOURCETYPES), // all types
      type: 'text',
    },
    description: {
      optional: Object.values(RESOURCETYPES), // all types,
      type: 'markdown',
    },
    url: {
      optional: Object.values(RESOURCETYPES), // all types,
      type: 'url',
    },
    publication_date: {
      optional: Object.values(RESOURCETYPES), // all types,
      type: 'date',
    },
    access_date: {
      optional: Object.values(RESOURCETYPES), // all types,
      type: 'date',
    },
  },
};

export const INDICATOR_FIELDS = {
  ATTRIBUTES: {
    reference: {
      type: 'text',
      optional: true,
      adminOnly: true,
    },
    code: {
      type: 'text',
      optional: true,
      adminOnly: true,
    },
    title: {
      required: true,
      type: 'text',
    },
    description: {
      type: 'markdown',
    },
    draft: {
      defaultValue: true,
      controlType: 'checkbox',
      type: 'bool',
      skipImport: true,
    },
    private: {
      defaultValue: false,
      required: true,
      type: 'bool',
    },
    is_archive: {
      defaultValue: false,
      required: true,
      type: 'bool',
    },
    created_at: {
      skipImport: true,
      type: 'datetime',
      adminOnly: true,
      meta: true,
    },
    created_by_id: {
      skipImport: true,
      type: 'key',
      adminOnly: true,
      meta: true,
      table: API.USERS,
      exportColumn: 'created_by',
    },
    updated_at: {
      skipImport: true,
      type: 'datetime',
      adminOnly: true,
      meta: true,
    },
    updated_by_id: {
      skipImport: true,
      type: 'key',
      adminOnly: true,
      meta: true,
      table: API.USERS,
      exportColumn: 'updated_by',
    },
    relationship_updated_at: {
      skipImport: true,
      type: 'datetime',
      adminOnly: true,
      meta: true,
      exportColumn: 'connection_updated_at',
    },
    relationship_updated_by_id: {
      skipImport: true,
      type: 'key',
      adminOnly: true,
      meta: true,
      table: API.USERS,
      exportColumn: 'connection_updated_by',
    },
  },
};

// type compatibility: actors for actions
export const ACTIONTYPE_ACTORTYPES = {
  // countries make expressions/statements
  [ACTIONTYPES.EXPRESS]: [
    ACTORTYPES.COUNTRY,
    ACTORTYPES.CONTACT,
    ACTORTYPES.ORG,
    ACTORTYPES.GROUP,
  ],
  // events are attended by countries, contacts, orgs
  [ACTIONTYPES.EVENT]: [
    ACTORTYPES.COUNTRY,
    ACTORTYPES.CONTACT,
    ACTORTYPES.ORG,
    ACTORTYPES.GROUP,
  ],
  // interactions with countries, contacts or organisations
  [ACTIONTYPES.INTERACTION]: [
    ACTORTYPES.COUNTRY,
    ACTORTYPES.CONTACT,
    ACTORTYPES.ORG,
    ACTORTYPES.GROUP,
  ],
  // outreach plans are targeting countries & contacts
  [ACTIONTYPES.OP]: [
    ACTORTYPES.COUNTRY,
    ACTORTYPES.CONTACT,
    ACTORTYPES.REG,
    ACTORTYPES.GROUP,
  ],
  // advocacy plans are targeting countries & contacts
  [ACTIONTYPES.AP]: [
    ACTORTYPES.COUNTRY,
    ACTORTYPES.CONTACT,
    ACTORTYPES.REG,
    ACTORTYPES.GROUP,
  ],
  // tasks target countries
  [ACTIONTYPES.TASK]: [
    ACTORTYPES.COUNTRY,
    ACTORTYPES.ORG,
    ACTORTYPES.CONTACT,
    ACTORTYPES.REG,
    ACTORTYPES.GROUP,
  ],
};

export const ACTIONTYPE_RESOURCETYPES = {
  [ACTIONTYPES.EXPRESS]: [
    RESOURCETYPES.REF,
    RESOURCETYPES.WEB,
    RESOURCETYPES.DOC,
  ],
  [ACTIONTYPES.EVENT]: [
    RESOURCETYPES.WEB,
    RESOURCETYPES.DOC,
  ],
  [ACTIONTYPES.OP]: [
    RESOURCETYPES.WEB,
    RESOURCETYPES.DOC,
  ],
  [ACTIONTYPES.AP]: [
    RESOURCETYPES.WEB,
    RESOURCETYPES.DOC,
  ],
  [ACTIONTYPES.TASK]: [
    RESOURCETYPES.WEB,
    RESOURCETYPES.DOC,
  ],
  [ACTIONTYPES.INTERACTION]: [
    RESOURCETYPES.WEB,
    RESOURCETYPES.DOC,
  ],
};

// related parent actions
export const ACTIONTYPE_ACTIONTYPES = {
  // top-actions - no sub-actions
  // child: [...parents],
  // [ACTIONTYPES.EVENT]: [],
  [ACTIONTYPES.EVENT]: [
    ACTIONTYPES.AP,
  ],
  [ACTIONTYPES.OP]: [
    ACTIONTYPES.EVENT,
    ACTIONTYPES.AP,
  ],
  // sub-actions with top-actions
  [ACTIONTYPES.EXPRESS]: [
    ACTIONTYPES.EVENT,
    ACTIONTYPES.INTERACTION,
  ],
  [ACTIONTYPES.TASK]: [
    ACTIONTYPES.OP,
    ACTIONTYPES.AP,
    ACTIONTYPES.EVENT,
  ],
  [ACTIONTYPES.INTERACTION]: [
    ACTIONTYPES.OP,
    ACTIONTYPES.AP,
    ACTIONTYPES.TASK,
    ACTIONTYPES.EVENT,
  ],
};
// member of
export const MEMBERSHIPS = {
  [ACTORTYPES.COUNTRY]: [
    ACTORTYPES.REG,
    ACTORTYPES.GROUP,
  ],
  [ACTORTYPES.ORG]: [
    ACTORTYPES.GROUP,
    ACTORTYPES.COUNTRY,
  ],
  [ACTORTYPES.CONTACT]: [
    ACTORTYPES.COUNTRY,
    ACTORTYPES.ORG,
    ACTORTYPES.GROUP,
  ],
  [ACTORTYPES.REG]: [],
  [ACTORTYPES.GROUP]: [],
};

export const INDICATOR_ACTIONTYPES = [ACTIONTYPES.EXPRESS];
export const INDICATOR_ACTION_ACTORTYPES = [
  ACTORTYPES.COUNTRY,
  ACTORTYPES.CONTACT,
  // ACTORTYPES.GROUP,
];

export const USER_ACTIONTYPES = [
  ACTIONTYPES.OP,
  ACTIONTYPES.AP,
  ACTIONTYPES.TASK,
  ACTIONTYPES.EVENT,
  ACTIONTYPES.INTERACTION,
];
export const USER_ACTORTYPES = Object.values(ACTORTYPES);

export const ACTORTYPES_CONFIG = {
  1: { // COUNTRY
    id: ACTORTYPES.COUNTRY,
    order: 1,
    columns: [
      {
        id: 'associations', // one row per type,
        type: 'associations', // one row per type,
        title: 'Part of',
        minSize: 'small',
      },
      {
        id: 'members', // one row per type,
        type: 'members', // one row per type,
        type_id: ACTORTYPES.CONTACT,
        minSize: 'ms',
        showOnSingle: false,
      },
      {
        id: 'users', // one row per type,
        type: 'users', // one row per type,
        minSize: 'medium',
      },
      {
        id: `action_${ACTIONTYPES.INTERACTION}`,
        type: 'actiontype',
        type_id: ACTIONTYPES.INTERACTION,
        actions: 'actionsByType',
        actionsMembers: 'actionsAsMemberByType',
        actionsChildren: 'actionsAsParentByType',
        minSize: 'large',
        showOnSingle: false,
      },
      {
        id: `action_${ACTIONTYPES.EXPRESS}`,
        type: 'actiontype',
        type_id: ACTIONTYPES.EXPRESS,
        actions: 'actionsByType',
        actionsMembers: 'actionsAsMemberByType',
        actionsChildren: 'actionsAsParentByType',
        minSize: 'medium',
        showOnSingle: false,
      },
      {
        id: `action_${ACTIONTYPES.TASK}`,
        type: 'actiontype',
        type_id: ACTIONTYPES.TASK,
        actions: 'actionsByType',
        actionsMembers: 'actionsAsMemberByType',
        actionsChildren: 'actionsAsParentByType',
        minSize: 'large',
        showOnSingle: false,
      },
      {
        id: 'taxonomy',
        type: 'taxonomy',
        taxonomy_id: 1, // general position
        minSize: 'optional',
      },
    ],
    form: [
      {
        id: 'footer',
        fields: [
          { attribute: 'is_archive', needsAdmin: true, skipNew: true },
          { attribute: 'private', needsAdminOrOwn: true },
          { attribute: 'draft', needsAdminOrOwn: true },
        ],
      },
      {
        id: 'main',
        title: 'Main',
        sections: [
          {
            id: 'name',
            title: 'Name & role',
            rows: [
              [
                {
                  attribute: 'title',
                  required: true,
                  basis: '2/3',
                },
                {
                  attribute: 'code',
                  basis: '1/3',
                },
              ],
              [{
                taxonomy: 1, // general position
                basis: '2/3',
              }],
            ],
          },
          {
            id: 'staff',
            title: 'Assigned staff',
            rows: [
              [
                {
                  connection: API.USERS,
                  prepopulate: true, // current user
                  basis: '2/3',
                },
              ],
            ],
          },
          {
            id: 'content',
            title: 'Description, notes, summary of activities',
            rows: [
              [{
                attribute: 'description',
              }],
              [{
                attribute: 'activity_summary',
                hideByDefault: true,
              }],
            ], // rows
          }, // section
        ], //
      }, // step
      {
        id: 'stakeholders',
        title: 'Associated stakeholders',
        titleSmall: 'Stakeholders',
        sections: [
          {
            id: 'stakeholders',
            title: 'Regions & Groups the Country belongs to',
            rows: [
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.REG,
                asParents: true,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.GROUP,
                asParents: true,
                prepopulateIfPrevious: true,
              }],
            ],
          },
          {
            id: 'members',
            title: 'Contacts (Members of Country)',
            rows: [
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.CONTACT,
                asChildren: true,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ], // sections
      }, // step
      {
        id: 'activities',
        title: 'Activities',
        sections: [
          {
            id: 'statements',
            title: 'Statements',
            rows: [
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.EXPRESS,
                prepopulateIfPrevious: true,
              }],
            ],
          },
          {
            id: 'interactions',
            title: 'Interactions & Events',
            rows: [
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.INTERACTION,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.EVENT,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ],
      }, // step
      {
        id: 'outreach',
        title: 'Outreach',
        sections: [
          {
            id: 'outreach',
            title: 'Outreach the country is targeted by',
            rows: [
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.TASK,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.OP,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.AP,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ],
      }, // step
    ], // steps
  },
  2: { // ORG
    id: ACTORTYPES.ORG,
    order: 3,
    columns: [
      {
        id: 'taxonomy',
        type: 'taxonomy',
        taxonomy_id: 2, // sector
        minSize: 'ms',
      },
      {
        id: 'members', // one row per type,
        type: 'members', // one row per type,
        type_id: ACTORTYPES.CONTACT,
        minSize: 'small',
      },
      {
        id: 'associations', // one row per type,
        type: 'associations', // one row per type,
        title: 'Affiliation',
        minSize: 'hidden',
      },
      {
        id: 'users', // one row per type,
        type: 'users', // one row per type,
        minSize: 'medium',
      },
      {
        id: `action_${ACTIONTYPES.INTERACTION}`,
        type: 'actiontype',
        type_id: ACTIONTYPES.INTERACTION,
        actions: 'actionsByType',
        actionsMembers: 'actionsAsMemberByType',
        actionsChildren: 'actionsAsParentByType',
        minSize: 'medium',
        showOnSingle: false,
      },
      {
        id: `action_${ACTIONTYPES.EXPRESS}`,
        type: 'actiontype',
        type_id: ACTIONTYPES.EXPRESS,
        actions: 'actionsByType',
        actionsMembers: 'actionsAsMemberByType',
        actionsChildren: 'actionsAsParentByType',
        minSize: 'hidden',
        showOnSingle: false,
      },
      {
        id: `action_${ACTIONTYPES.TASK}`,
        type: 'actiontype',
        type_id: ACTIONTYPES.TASK,
        actions: 'actionsByType',
        actionsMembers: 'actionsAsMemberByType',
        actionsChildren: 'actionsAsParentByType',
        minSize: 'hidden',
        showOnSingle: false,
      },
    ],
    form: [
      {
        id: 'footer',
        fields: [
          { attribute: 'is_archive', needsAdmin: true, skipNew: true },
          { attribute: 'private', needsAdminOrOwn: true },
          { attribute: 'draft', needsAdminOrOwn: true },
        ],
      },
      {
        id: 'main',
        title: 'Main',
        sections: [
          {
            id: 'name',
            title: 'Title & sector',
            rows: [
              [
                {
                  attribute: 'title',
                  required: true,
                  basis: '2/3',
                },
                {
                  attribute: 'code',
                  needsAdmin: true,
                  basis: '1/3',
                },
              ],
              [{
                taxonomy: 2, // sector
                basis: '2/3',
              }],
            ],
          },
          {
            id: 'staff',
            title: 'Assigned staff',
            rows: [
              [
                {
                  connection: API.USERS,
                  prepopulate: true, // current user
                  basis: '2/3',
                },
              ],
            ],
          },
          {
            id: 'contact',
            title: 'Email & website',
            asColumns: ['2/3'],
            rows: [
              [
                {
                  attribute: 'email',
                },
                {
                  attribute: 'url',
                },
              ],
            ], // rows
          }, // section
          {
            id: 'content',
            title: 'Description, notes,  summary of activities',
            rows: [
              [{
                attribute: 'description',
              }],
              [{
                attribute: 'activity_summary',
                hideByDefault: true,
              }],
            ], // rows
          }, // section
        ], //
      }, // step
      {
        id: 'stakeholders',
        title: 'Associated stakeholders',
        titleSmall: 'Stakeholders',
        sections: [
          {
            id: 'stakeholders',
            title: 'Country and Groups the Organisation belongs to',
            rows: [
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.COUNTRY,
                asParents: true,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.GROUP,
                asParents: true,
                prepopulateIfPrevious: true,
              }],
            ],
          },
          {
            id: 'members',
            title: 'Members of the organisation',
            rows: [
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.CONTACT,
                asChildren: true,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ], // sections
      }, // step
      {
        id: 'activities',
        title: 'Activities & outreach',
        sections: [
          {
            id: 'statements',
            title: 'Statements',
            rows: [
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.EXPRESS,
                prepopulateIfPrevious: true,
              }],
            ],
          },
          {
            id: 'interactions',
            title: 'Interactions & Events',
            rows: [
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.INTERACTION,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.EVENT,
                prepopulateIfPrevious: true,
              }],
            ],
          },
          {
            id: 'outreach',
            title: 'Tasks the organisation is targeted by',
            rows: [
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.TASK,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ],
      }, // step
    ], // steps
  },
  3: { // CONTACT
    id: ACTORTYPES.CONTACT,
    order: 5,
    columns: [
      {
        id: 'taxonomy',
        type: 'taxonomy',
        taxonomy_id: 3, // role
        minSize: 'ms',
      },
      {
        id: 'associations', // one row per type,
        type: 'associations', // one row per type,
        title: 'Affiliation',
        minSize: 'small',
      },
      {
        id: 'users', // one row per type,
        type: 'users', // one row per type,
        minSize: 'medium',
      },
      {
        id: `action_${ACTIONTYPES.INTERACTION}`,
        type: 'actiontype',
        type_id: ACTIONTYPES.INTERACTION,
        actions: 'actionsByType',
        actionsMembers: 'actionsAsMemberByType',
        actionsChildren: 'actionsAsParentByType',
        minSize: 'medium',
        showOnSingle: false,
      },
      {
        id: `action_${ACTIONTYPES.EXPRESS}`,
        type: 'actiontype',
        type_id: ACTIONTYPES.EXPRESS,
        actions: 'actionsByType',
        actionsMembers: 'actionsAsMemberByType',
        actionsChildren: 'actionsAsParentByType',
        minSize: 'large',
        showOnSingle: false,
      },
      {
        id: `action_${ACTIONTYPES.TASK}`,
        type: 'actiontype',
        type_id: ACTIONTYPES.TASK,
        actions: 'actionsByType',
        actionsMembers: 'actionsAsMemberByType',
        actionsChildren: 'actionsAsParentByType',
        minSize: 'large',
        showOnSingle: false,
      },
    ],
    form: [
      {
        id: 'footer',
        fields: [
          { attribute: 'is_archive', needsAdmin: true, skipNew: true },
          { attribute: 'private', needsAdminOrOwn: true },
          { attribute: 'draft', needsAdminOrOwn: true },
        ],
      },
      {
        id: 'main',
        title: 'Main',
        sections: [
          {
            id: 'name',
            title: 'Name & role',
            rows: [
              [
                {
                  attribute: 'title',
                  label: 'name',
                  required: true,
                  basis: '2/3',
                },
                {
                  attribute: 'prefix',
                  basis: '1/3',
                },
              ],
              [{
                taxonomy: 3,
                basis: '2/3',
              }],
            ],
          },
          {
            id: 'staff',
            title: 'Assigned staff',
            rows: [
              [
                {
                  connection: API.USERS,
                  prepopulate: true, // current user
                  basis: '2/3',
                },
              ],
            ],
          },
          {
            id: 'contact',
            title: 'Contact details',
            asColumns: ['2/3'],
            rows: [
              [
                {
                  attribute: 'email',
                  required: true,
                },
                {
                  attribute: 'phone',
                },
                {
                  attribute: 'address',
                },
                {
                  attribute: 'url',
                },
              ],
            ], // rows
          }, // section
          {
            id: 'content',
            title: 'Description, notes, summary of activities',
            rows: [
              [{
                attribute: 'description',
              }],
              [{
                attribute: 'activity_summary',
                hideByDefault: true,
              }],
            ], // rows
          }, // section
        ], //
      }, // step
      {
        id: 'stakeholders',
        title: 'Associated stakeholders',
        titleSmall: 'Stakeholders',
        sections: [
          {
            id: 'stakeholders',
            title: 'Stakeholders the contact belongs to',
            rows: [
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.COUNTRY,
                asParents: true,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.GROUP,
                asParents: true,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.ORG,
                asParents: true,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ], // sections
      }, // step
      {
        id: 'activities',
        title: 'Activities',
        sections: [
          {
            id: 'statements',
            title: 'Statements',
            rows: [
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.EXPRESS,
                prepopulateIfPrevious: true,
              }],
            ],
          },
          {
            id: 'interactions',
            title: 'Interactions & Events',
            rows: [
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.INTERACTION,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.EVENT,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ],
      }, // step
      {
        id: 'outreach',
        title: 'Outreach',
        sections: [
          {
            id: 'outreach',
            title: 'Outreach the contact is targeted by',
            rows: [
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.TASK,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.OP,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.AP,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ],
      }, // step
    ], // steps
  },
  4: { // REG
    id: ACTORTYPES.REG,
    order: 4,
    columns: [
      {
        id: 'taxonomy',
        type: 'taxonomy',
        taxonomy_id: 4, // region type
        minSize: 'large',
      },
      {
        id: `members_${ACTORTYPES.COUNTRY}`, // one row per type,
        type: 'members', // one row per type,
        type_id: ACTORTYPES.COUNTRY,
        minSize: 'small',
      },
      {
        id: 'users', // one row per type,
        type: 'users', // one row per type,
        minSize: 'ms',
      },
      {
        id: `action_${ACTIONTYPES.TASK}`,
        type: 'actiontype',
        type_id: ACTIONTYPES.TASK,
        actions: 'actionsByType',
        actionsMembers: 'actionsAsMemberByType',
        actionsChildren: 'actionsAsParentByType',
        minSize: 'medium',
        showOnSingle: false,
      },
    ],
    form: [
      {
        id: 'footer',
        fields: [
          { attribute: 'is_archive', needsAdmin: true, skipNew: true },
          { attribute: 'private', needsAdminOrOwn: true },
          { attribute: 'draft', needsAdminOrOwn: true },
        ],
      },
      {
        id: 'main',
        title: 'Main',
        sections: [
          {
            id: 'name',
            title: 'Title & type',
            rows: [
              [
                {
                  attribute: 'title',
                  required: true,
                  basis: '2/3',
                },
              ],
              [{
                taxonomy: 4, // region type
                basis: '2/3',
              }],
            ],
          },
          {
            id: 'staff',
            title: 'Assigned staff',
            rows: [
              [
                {
                  connection: API.USERS,
                  prepopulate: true, // current user
                  basis: '2/3',
                },
              ],
            ],
          },
          {
            id: 'content',
            title: 'Description, notes, summary of activities',
            rows: [
              [{
                attribute: 'description',
              }],
              [{
                attribute: 'activity_summary',
                hideByDefault: true,
              }],
            ], // rows
          }, // section
        ], //
      }, // step
      {
        id: 'stakeholders',
        title: 'Countries',
        titleSmall: 'Countries',
        sections: [
          {
            id: 'members',
            title: 'Countries (Members of Region)',
            rows: [
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.COUNTRY,
                asChildren: true,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ], // sections
      }, // step
      {
        id: 'outreach',
        title: 'Outreach',
        sections: [
          {
            id: 'outreach',
            title: 'Outreach the region is targeted by',
            rows: [
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.TASK,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.OP,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.AP,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ],
      }, // step
    ], // steps
  },
  5: { // GROUP
    id: ACTORTYPES.GROUP,
    order: 2,
    columns: [
      {
        id: 'taxonomy',
        type: 'taxonomy',
        taxonomy_id: 5, // group type
        minSize: 'large',
      },
      {
        id: `members_${ACTORTYPES.COUNTRY}`, // one row per type,
        type: 'members', // one row per type,
        type_id: ACTORTYPES.COUNTRY,
        title: 'Member countries',
        minSize: 'ms',
      },
      {
        id: `members_${ACTORTYPES.CONTACT}`, // one row per type,
        type: 'members', // one row per type,
        type_id: ACTORTYPES.CONTACT,
        minSize: 'medium',
      },
      {
        id: `members_${ACTORTYPES.ORG}`, // one row per type,
        type: 'members', // one row per type,
        type_id: ACTORTYPES.ORG,
        minSize: 'hidden',
      },
      {
        id: 'users', // one row per type,
        type: 'users', // one row per type,
        minSize: 'large',
      },
      {
        id: `action_${ACTIONTYPES.INTERACTION}`,
        type: 'actiontype',
        type_id: ACTIONTYPES.INTERACTION,
        actions: 'actionsByType',
        actionsMembers: 'actionsAsMemberByType',
        actionsChildren: 'actionsAsParentByType',
        minSize: 'medium',
        showOnSingle: false,
      },
      {
        id: `action_${ACTIONTYPES.EXPRESS}`,
        type: 'actiontype',
        type_id: ACTIONTYPES.EXPRESS,
        actions: 'actionsByType',
        actionsMembers: 'actionsAsMemberByType',
        actionsChildren: 'actionsAsParentByType',
        minSize: 'small',
        showOnSingle: false,
      },
      {
        id: `action_${ACTIONTYPES.TASK}`,
        type: 'actiontype',
        type_id: ACTIONTYPES.TASK,
        actions: 'actionsByType',
        actionsMembers: 'actionsAsMemberByType',
        actionsChildren: 'actionsAsParentByType',
        minSize: 'large',
        showOnSingle: false,
      },
    ],
    form: [
      {
        id: 'footer',
        fields: [
          { attribute: 'is_archive', needsAdmin: true, skipNew: true },
          { attribute: 'private', needsAdminOrOwn: true },
          { attribute: 'draft', needsAdminOrOwn: true },
        ],
      },
      {
        id: 'main',
        title: 'Main',
        sections: [
          {
            id: 'name',
            title: 'Title & type',
            rows: [
              [
                {
                  attribute: 'title',
                  required: true,
                  basis: '2/3',
                },
                {
                  attribute: 'code',
                  needsAdmin: true,
                  basis: '1/3',
                },
              ],
              [{
                taxonomy: 5, // group type
                basis: '2/3',
              }],
            ],
          },
          {
            id: 'staff',
            title: 'Assigned staff',
            rows: [
              [
                {
                  connection: API.USERS,
                  prepopulate: true, // current user
                  basis: '2/3',
                },
              ],
            ],
          },
          {
            id: 'contact',
            title: 'Website',
            asColumns: ['2/3'],
            rows: [
              [
                {
                  attribute: 'email',
                },
                {
                  attribute: 'url',
                },
              ],
            ], // rows
          }, // section
          {
            id: 'content',
            title: 'Description, notes, summary of activities',
            rows: [
              [{
                attribute: 'description',
              }],
              [{
                attribute: 'activity_summary',
                hideByDefault: true,
              }],
            ], // rows
          }, // section
        ], //
      }, // step
      {
        id: 'stakeholders',
        title: 'Members',
        titleSmall: 'Members',
        sections: [
          {
            id: 'members',
            title: 'Group Members',
            rows: [
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.CONTACT,
                asChildren: true,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.ORG,
                asChildren: true,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.COUNTRY,
                asChildren: true,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ], // sections
      }, // step
      {
        id: 'activities',
        title: 'Activities',
        sections: [
          {
            id: 'statements',
            title: 'Statements',
            rows: [
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.EXPRESS,
                prepopulateIfPrevious: true,
              }],
            ],
          },
          {
            id: 'interactions',
            title: 'Interactions & Events',
            rows: [
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.INTERACTION,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.EVENT,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ],
      }, // step
      {
        id: 'outreach',
        title: 'Outreach',
        sections: [
          {
            id: 'outreach',
            title: 'Outreach the group is targeted by',
            rows: [
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.TASK,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.OP,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.AP,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ],
      }, // step
    ], // steps
  },
};

export const ACTIONTYPES_CONFIG = {
  1: {
    id: ACTIONTYPES.EXPRESS,
    order: 1,
    columns: [
      {
        id: 'date',
        type: 'date',
        sort: 'date',
        sortOrder: 'desc',
        sortDefault: true,
        attribute: 'date_start',
        fallbackAttribute: 'created_at',
        minSize: 'medium', // default
      },
      {
        id: 'indicators',
        type: 'indicators',
        sort: 'title',
        minSize: 'ms',
      },
      {
        id: 'taxonomy-13',
        type: 'taxonomy',
        taxonomy_id: AUTHORITY_TAXONOMY, // level of authority
        minSize: 'medium',
      },
      {
        id: 'taxonomy-7',
        type: 'taxonomy',
        taxonomy_id: EXPRESSFORM_TAXONOMY, // level of authority
        minSize: 'medium',
        showOnSingle: false,
      },
      {
        id: `actors_${ACTORTYPES.GROUP}`,
        type: 'actors',
        sort: 'title',
        type_id: ACTORTYPES.GROUP,
        minSize: 'small',
        showOnSingle: false,
      },
      {
        id: `actors_${ACTORTYPES.COUNTRY}`,
        type: 'actors',
        sort: 'title',
        type_id: ACTORTYPES.COUNTRY,
        minSize: 'small',
        showOnSingle: false,
        includeViaParent: true,
      },
      {
        id: `actors_${ACTORTYPES.CONTACT}`,
        type: 'actors',
        sort: 'title',
        type_id: ACTORTYPES.CONTACT,
        minSize: 'hidden',
        showOnSingle: false,
      },
      {
        id: `actors_${ACTORTYPES.ORG}`,
        type: 'actors',
        sort: 'title',
        type_id: ACTORTYPES.ORG,
        minSize: 'hidden',
        showOnSingle: false,
      },
      {
        id: `parents_${ACTIONTYPES.EVENT}`,
        type: 'parentActions',
        type_id: ACTIONTYPES.EVENT,
        sort: 'title',
        minSize: 'large',
        showOnSingle: false,
      },
      {
        id: `parents_${ACTIONTYPES.INTERACTION}`,
        type: 'parentActions',
        type_id: ACTIONTYPES.INTERACTION,
        sort: 'title',
        minSize: 'hidden',
        showOnSingle: false,
      },
    ],
    form: [
      {
        id: 'footer',
        fields: [
          { attribute: 'is_archive', needsAdmin: true, skipNew: true },
          { attribute: 'private', needsAdminOrOwn: true },
          { attribute: 'draft', needsAdminOrOwn: true },
        ],
      },
      {
        id: 'main',
        title: 'Main',
        sections: [
          {
            id: 'main',
            title: 'General info',
            asColumns: ['1/3', '2/3'],
            rows: [
              [{
                attribute: 'date_start',
                prepopulate: true, // today
              },
              {
                attribute: 'date_comment',
                fieldType: 'textarea',
                hideByDefault: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.EVENT,
                asParents: true,
                prepopulateIfPrevious: true,
              }],
            ],
          },
          {
            id: 'indicators',
            title: 'Topic positions',
            rows: [
              [{
                connection: API.INDICATORS,
              }],
            ],
          },
          {
            id: 'categories',
            title: 'Type of statement',
            rows: [
              [
                { taxonomy: 7, basis: '1/2' }, // form
                { taxonomy: 13, basis: '1/2' }, // authority
              ],
              [
                { taxonomy: 8, basis: '1/2' }, // tags
              ],
            ], // rows
          }, // section
          {
            id: 'content',
            title: 'Main content',
            rows: [
              [
                {
                  attribute: 'title',
                  required: true,
                  basis: '2/3',
                },
                {
                  attribute: 'code',
                  needsAdmin: true,
                  basis: '1/3',
                },
              ],
              [{
                attribute: 'url',
                basis: '2/3',
              }],
              [{
                attribute: 'description',
              }],
              [{
                attribute: 'comment',
                hideByDefault: true,
              }],
            ], // rows
          }, // section
        ], //
      }, // step
      {
        id: 'stakeholders',
        title: 'Issuing Stakeholders',
        titleSmall: 'Stakeholders',
        sections: [
          {
            id: 'stakeholders',
            rows: [
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.CONTACT,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.COUNTRY,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.GROUP,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.ORG,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ], // sections
      }, // step
      {
        id: 'outreach',
        title: 'Related Outreach',
        titleSmall: 'Outreach',
        sections: [
          {
            id: 'outreach',
            rows: [
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.INTERACTION,
                asParents: true,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.EVENT,
                asParents: true,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ],
      }, // step
      {
        id: 'other',
        title: 'Related Resources',
        titleSmall: 'Resources',
        sections: [
          {
            id: 'resources',
            rows: [
              [{
                connection: API.RESOURCES,
                type: RESOURCETYPES.REF,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.RESOURCES,
                type: RESOURCETYPES.WEB,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.RESOURCES,
                type: RESOURCETYPES.DOC,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ],
      }, // step
    ], // steps
  },
  2: {
    id: ACTIONTYPES.EVENT,
    order: 4,
    is_code_public: true,
    columns: [
      {
        id: 'date',
        type: 'date',
        sort: 'date',
        sortOrder: 'desc',
        sortDefault: true,
        attribute: 'date_start',
        minSize: 'medium',
        title: 'Date (start)',
      },
      {
        id: 'date_end',
        type: 'date',
        sort: 'date',
        sortOrder: 'desc',
        attribute: 'date_end',
        minSize: 'medium',
        title: 'Date (end)',
        showOnSingle: false,
      },
      {
        id: 'taxonomy',
        type: 'taxonomy',
        taxonomy_id: 9, // event type
        minSize: 'hidden',
      },
      {
        id: 'users', // one row per type,
        type: 'users', // one row per type,
        adminOnly: true,
        minSize: 'small',
      },
      {
        id: `childActions_${ACTIONTYPES.INTERACTION}`, // one row per type,
        type: 'childActions', // one row per type,
        showOnSingle: false,
        type_id: ACTIONTYPES.INTERACTION,
        minSize: 'ms',
      },
      {
        id: `childActions_${ACTIONTYPES.EXPRESS}`, // one row per type,
        type: 'childActions', // one row per type,
        showOnSingle: false,
        type_id: ACTIONTYPES.EXPRESS,
        minSize: 'medium',
      },
      {
        id: `childActions_${ACTIONTYPES.TASK}`, // one row per type,
        type: 'childActions', // one row per type,
        showOnSingle: false,
        type_id: ACTIONTYPES.TASK,
        minSize: 'large',
      },
      {
        id: `childActions_${ACTIONTYPES.OP}`, // one row per type,
        type: 'childActions', // one row per type,
        showOnSingle: false,
        type_id: ACTIONTYPES.OP,
        minSize: 'hidden',
      },
      {
        id: `parentActions_${ACTIONTYPES.AP}`, // one row per type,
        type: 'parentActions', // one row per type,
        showOnSingle: false,
        type_id: ACTIONTYPES.AP,
        minSize: 'hidden',
      },
      {
        id: 'actors', // one row per type,
        type: 'actors', // one row per type,
        showOnSingle: false,
        minSize: 'large',
      },
    ],
    form: [
      {
        id: 'footer',
        fields: [
          { attribute: 'is_archive', needsAdmin: true, skipNew: true },
          { attribute: 'private', needsAdminOrOwn: true },
          { attribute: 'draft', needsAdminOrOwn: true },
        ],
      },
      {
        id: 'main',
        title: 'Main',
        sections: [
          {
            id: 'date',
            title: '(Target) date',
            rows: [
              [{
                attribute: 'date_start',
                basis: '1/3',
              },
              {
                attribute: 'date_end',
                basis: '1/3',
              }],
              [{
                attribute: 'date_comment',
                fieldType: 'textarea',
                hideByDefault: true,
              }],
            ],
          },
          {
            id: 'staff',
            title: 'Assigned/participating staff',
            rows: [
              [
                {
                  connection: API.USERS,
                  prepopulate: true, // current user
                  basis: '2/3',
                },
                {
                  attribute: 'notifications',
                  basis: '1/3',
                },
              ],
            ],
          },
          {
            id: 'statements',
            title: 'Event statements',
            rows: [
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.EXPRESS,
                asChildren: true,
                prepopulateIfPrevious: true,
              }],
            ],
          },
          {
            id: 'categories',
            title: 'Type of event',
            rows: [
              [
                { taxonomy: 9, basis: '1/2' }, // event type
              ],
            ], // rows
          }, // section
          {
            id: 'content',
            title: 'Main content',
            rows: [
              [
                {
                  attribute: 'title',
                  required: true,
                  basis: '2/3',
                },
                {
                  attribute: 'code',
                  needsAdmin: true,
                  basis: '1/3',
                },
              ],
              [{
                attribute: 'url',
                basis: '2/3',
              }],
              [{
                attribute: 'description',
              }],
              [{
                attribute: 'comment',
                hideByDefault: true,
              }],
            ], // rows
          }, // section
        ], //
      }, // step
      {
        id: 'stakeholders',
        title: 'Participating stakeholders',
        titleSmall: 'Stakeholders',
        sections: [
          {
            id: 'stakeholders',
            rows: [
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.CONTACT,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.COUNTRY,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.GROUP,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.ORG,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ], // sections
      }, // step
      {
        id: 'outreach',
        title: 'Related Outreach',
        titleSmall: 'Outreach',
        sections: [
          {
            id: 'outreach',
            rows: [
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.INTERACTION,
                asChildren: true,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.TASK,
                asChildren: true,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.OP,
                asChildren: true,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.AP,
                asParents: true,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ],
      }, // step
      {
        id: 'other',
        title: 'Related Resources',
        titleSmall: 'Resources',
        sections: [
          {
            id: 'resources',
            rows: [
              [{
                connection: API.RESOURCES,
                type: RESOURCETYPES.WEB,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.RESOURCES,
                type: RESOURCETYPES.DOC,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ],
      }, // step
    ], // steps
  },
  3: {
    id: ACTIONTYPES.OP,
    order: 5,
    is_code_public: true,
    columns: [
      {
        id: 'users', // one row per type,
        type: 'users', // one row per type,
        adminOnly: true,
        minSize: 'medium',
      },
      {
        id: 'date',
        type: 'date',
        sort: 'date',
        sortOrder: 'desc',
        sortDefault: true,
        attribute: 'date_start',
        minSize: 'large',
      },
      {
        id: 'taxonomy',
        type: 'taxonomy',
        taxonomy_id: 10, // event type
        minSize: 'large',
      },
      {
        id: `actions_${ACTIONTYPES.TASK}`,
        type: 'childActions',
        type_id: ACTIONTYPES.TASK,
        minSize: 'large',
        showOnSingle: false,
      },
      {
        id: `actions_${ACTIONTYPES.EVENT}`,
        type: 'parentActions',
        type_id: ACTIONTYPES.EVENT,
        minSize: 'large',
        showOnSingle: false,
      },
      {
        id: `actions_${ACTIONTYPES.INTERACTION}`,
        type: 'parentActions',
        type_id: ACTIONTYPES.INTERACTION,
        minSize: 'hidden',
        showOnSingle: false,
      },
      {
        id: `actions_${ACTIONTYPES.AP}`,
        type: 'parentActions',
        type_id: ACTIONTYPES.AP,
        minSize: 'hidden',
        showOnSingle: false,
      },
      {
        id: `actors_${ACTORTYPES.CONTACT}`,
        type_id: ACTORTYPES.CONTACT,
        type: 'actors',
        minSize: 'small',
        showOnSingle: false,
      },
      {
        id: `actors_${ACTORTYPES.COUNTRY}`,
        type_id: ACTORTYPES.COUNTRY,
        type: 'actors',
        minSize: 'hidden',
        showOnSingle: false,
      },
      {
        id: `actors_${ACTORTYPES.GROUP}`,
        type_id: ACTORTYPES.GROUP,
        type: 'actors',
        minSize: 'hidden',
        showOnSingle: false,
      },
      {
        id: `actors_${ACTORTYPES.ORG}`,
        type_id: ACTORTYPES.ORG,
        type: 'actors',
        minSize: 'hidden',
        showOnSingle: false,
      },
    ],
    form: [
      {
        id: 'footer',
        fields: [
          { attribute: 'is_archive', needsAdmin: true, skipNew: true },
          { attribute: 'private', needsAdminOrOwn: true },
          { attribute: 'draft', needsAdminOrOwn: true },
        ],
      },
      {
        id: 'main',
        title: 'Main',
        sections: [
          {
            id: 'date',
            title: '(Target) date',
            asColumns: ['1/3'],
            rows: [
              [{
                attribute: 'date_start',
                prepopulate: true, // today
              },
              {
                attribute: 'date_comment',
                fieldType: 'textarea',
                hideByDefault: true,
              }],
            ],
          },
          {
            id: 'main',
            title: 'Assigned staff',
            rows: [
              [
                {
                  connection: API.USERS,
                  prepopulate: true, // current user
                  basis: '2/3',
                },
                {
                  attribute: 'notifications',
                  basis: '1/3',
                },
              ],
            ],
          },
          {
            id: 'categories',
            title: 'Priority',
            rows: [
              [
                { taxonomy: 10, basis: '1/2' }, // priority
              ],
            ], // rows
          }, // section
          {
            id: 'content',
            title: 'Main content',
            rows: [
              [
                {
                  attribute: 'title',
                  required: true,
                  basis: '2/3',
                },
                {
                  attribute: 'code',
                  needsAdmin: true,
                  basis: '1/3',
                },
              ],
              [{
                attribute: 'url',
                basis: '2/3',
              }],
              [{
                attribute: 'description',
              }],
              [{
                attribute: 'comment',
                hideByDefault: true,
              }],
            ], // rows
          }, // section
        ], //
      }, // step
      {
        id: 'stakeholders',
        title: 'Targeted stakeholders',
        titleSmall: 'Stakeholders',
        sections: [
          {
            id: 'stakeholders',
            rows: [
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.CONTACT,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.COUNTRY,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.GROUP,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.REG,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.ORG,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ], // sections
      }, // step
      {
        id: 'outreach',
        title: 'Related Outreach',
        titleSmall: 'Outreach',
        sections: [
          {
            id: 'outreach',
            rows: [
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.INTERACTION,
                asChildren: true,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.TASK,
                asChildren: true,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.AP,
                asParents: true,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.EVENT,
                asParents: true,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ],
      }, // step
      {
        id: 'other',
        title: 'Related Resources',
        titleSmall: 'Resources',
        sections: [
          {
            id: 'resources',
            rows: [
              [{
                connection: API.RESOURCES,
                type: RESOURCETYPES.WEB,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.RESOURCES,
                type: RESOURCETYPES.DOC,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ],
      }, // step
    ], // steps
  },
  4: {
    id: ACTIONTYPES.AP,
    order: 6,
    columns: [
      {
        id: 'users', // one row per type,
        type: 'users', // one row per type,
        adminOnly: true,
        minSize: 'medium',
      },
      {
        id: 'date',
        type: 'date',
        sort: 'date',
        sortOrder: 'desc',
        sortDefault: true,
        attribute: 'date_start',
        minSize: 'large',
      },
      {
        id: 'taxonomy',
        type: 'taxonomy',
        taxonomy_id: 10, // event type
        minSize: 'large',
      },
      {
        id: `actions_${ACTIONTYPES.TASK}`,
        type: 'childActions',
        type_id: ACTIONTYPES.TASK,
        minSize: 'large',
        showOnSingle: false,
      },
      {
        id: `actions_${ACTIONTYPES.EVENT}`,
        type: 'parentActions',
        type_id: ACTIONTYPES.EVENT,
        minSize: 'hidden',
        showOnSingle: false,
      },
      {
        id: `actions_${ACTIONTYPES.INTERACTION}`,
        type: 'parentActions',
        type_id: ACTIONTYPES.INTERACTION,
        minSize: 'hidden',
        showOnSingle: false,
      },
      {
        id: `actions_${ACTIONTYPES.AP}`,
        type: 'parentActions',
        type_id: ACTIONTYPES.AP,
        minSize: 'hidden',
        showOnSingle: false,
      },
      {
        id: `actors_${ACTORTYPES.CONTACT}`,
        type_id: ACTORTYPES.CONTACT,
        type: 'actors',
        minSize: 'small',
        showOnSingle: false,
      },
      {
        id: `actors_${ACTORTYPES.COUNTRY}`,
        type_id: ACTORTYPES.COUNTRY,
        type: 'actors',
        minSize: 'hidden',
        showOnSingle: false,
      },
      {
        id: `actors_${ACTORTYPES.GROUP}`,
        type_id: ACTORTYPES.GROUP,
        type: 'actors',
        minSize: 'hidden',
        showOnSingle: false,
      },
      {
        id: `actors_${ACTORTYPES.ORG}`,
        type_id: ACTORTYPES.ORG,
        type: 'actors',
        minSize: 'hidden',
        showOnSingle: false,
      },
    ],
    form: [
      {
        id: 'footer',
        fields: [
          { attribute: 'is_archive', needsAdmin: true, skipNew: true },
          { attribute: 'private', needsAdminOrOwn: true },
          { attribute: 'draft', needsAdminOrOwn: true },
        ],
      },
      {
        id: 'main',
        title: 'Main',
        sections: [
          {
            id: 'date',
            title: '(Target) date',
            asColumns: ['1/3'],
            rows: [
              [{
                attribute: 'date_start',
                prepopulate: true, // today
              },
              {
                attribute: 'date_comment',
                fieldType: 'textarea',
                hideByDefault: true,
              }],
            ],
          },
          {
            id: 'main',
            title: 'Assigned staff',
            rows: [
              [
                {
                  connection: API.USERS,
                  prepopulate: true, // current user
                  basis: '2/3',
                },
                {
                  attribute: 'notifications',
                  basis: '1/3',
                },
              ],
            ],
          },
          {
            id: 'categories',
            title: 'Priority',
            rows: [
              [
                { taxonomy: 10, basis: '1/2' }, // priority
              ],
            ], // rows
          }, // section
          {
            id: 'content',
            title: 'Main content',
            rows: [
              [
                {
                  attribute: 'title',
                  required: true,
                  basis: '2/3',
                },
                {
                  attribute: 'code',
                  needsAdmin: true,
                  basis: '1/3',
                },
              ],
              [{
                attribute: 'url',
                basis: '2/3',
              }],
              [{
                attribute: 'description',
              }],
              [{
                attribute: 'comment',
                hideByDefault: true,
              }],
            ], // rows
          }, // section
        ], //
      }, // step
      {
        id: 'stakeholders',
        title: 'Targeted Stakeholders',
        titleSmall: 'Stakeholders',
        sections: [
          {
            id: 'stakeholders',
            rows: [
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.CONTACT,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.COUNTRY,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.GROUP,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.REG,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.ORG,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ], // sections
      }, // step
      {
        id: 'outreach',
        title: 'Related Outreach',
        titleSmall: 'Outreach',
        sections: [
          {
            id: 'outreach',
            rows: [
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.INTERACTION,
                asChildren: true,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.TASK,
                asChildren: true,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.OP,
                asChildren: true,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.EVENT,
                asChildren: true,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ],
      }, // step
      {
        id: 'other',
        title: 'Related Resources',
        titleSmall: 'Resources',
        sections: [
          {
            id: 'resources',
            rows: [
              [{
                connection: API.RESOURCES,
                type: RESOURCETYPES.WEB,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.RESOURCES,
                type: RESOURCETYPES.DOC,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ],
      }, // step
    ], // steps
  },
  5: {
    id: ACTIONTYPES.TASK,
    order: 3,
    columns: [
      {
        id: 'users', // one row per type,
        type: 'users', // one row per type,
        adminOnly: true,
        minSize: 'medium',
      },
      {
        id: 'date',
        type: 'date',
        sort: 'date',
        sortOrder: 'desc',
        sortDefault: true,
        attribute: 'date_start',
        minSize: 'large',
      },
      {
        id: 'taxonomy',
        type: 'taxonomy',
        taxonomy_id: 11, // status
        minSize: 'large',
      },
      {
        id: 'taxonomy-10',
        type: 'taxonomy',
        taxonomy_id: 10, // priority
        minSize: 'large',
      },
      {
        id: `actors_${ACTORTYPES.CONTACT}`,
        type_id: ACTORTYPES.CONTACT,
        type: 'actors',
        minSize: 'small',
        showOnSingle: false,
      },
      {
        id: `actors_${ACTORTYPES.COUNTRY}`,
        type_id: ACTORTYPES.COUNTRY,
        type: 'actors',
        minSize: 'ms',
        showOnSingle: false,
      },
      {
        id: `actors_${ACTORTYPES.GROUP}`,
        type_id: ACTORTYPES.GROUP,
        type: 'actors',
        minSize: 'medium',
        showOnSingle: false,
      },
      {
        id: `actors_${ACTORTYPES.ORG}`,
        type_id: ACTORTYPES.ORG,
        type: 'actors',
        minSize: 'hidden',
        showOnSingle: false,
      },
      {
        id: `parentActions_${ACTIONTYPES.EVENT}`, // one row per type,
        type: 'parentActions', // one row per type,
        showOnSingle: false,
        type_id: ACTIONTYPES.EVENT,
        minSize: 'hidden',
      },
      {
        id: `parentActions_${ACTIONTYPES.OP}`, // one row per type,
        type: 'parentActions', // one row per type,
        showOnSingle: false,
        type_id: ACTIONTYPES.OP,
        minSize: 'hidden',
      },
      {
        id: `parentActions_${ACTIONTYPES.AP}`, // one row per type,
        type: 'parentActions', // one row per type,
        showOnSingle: false,
        type_id: ACTIONTYPES.AP,
        title: 'Advocacy plans',
        minSize: 'hidden',
      },
      {
        id: `actions_${ACTIONTYPES.INTERACTION}`,
        type: 'childActions',
        type_id: ACTIONTYPES.INTERACTION,
        minSize: 'hidden',
        showOnSingle: false,
      },
    ],
    form: [
      {
        id: 'footer',
        fields: [
          { attribute: 'is_archive', needsAdmin: true, skipNew: true },
          { attribute: 'private', needsAdminOrOwn: true },
          { attribute: 'draft', needsAdminOrOwn: true },
        ],
      },
      {
        id: 'main',
        title: 'Main',
        sections: [
          {
            id: 'date',
            title: 'Target date',
            asColumns: ['1/3'],
            rows: [
              [{
                attribute: 'date_start',
                prepopulate: true, // today
              },
              {
                attribute: 'date_comment',
                fieldType: 'textarea',
                hideByDefault: true,
              }],
            ],
          },
          {
            id: 'staff',
            title: 'Assigned staff',
            rows: [
              [
                {
                  connection: API.USERS,
                  prepopulate: true, // current user
                  basis: '2/3',
                },
                {
                  attribute: 'notifications',
                  basis: '1/3',
                },
              ],
            ],
          },
          {
            id: 'categories',
            title: 'Priority & status',
            rows: [
              [
                { taxonomy: 10 },
                { taxonomy: 11 },
              ],
            ], // rows
          }, // section
          {
            id: 'content',
            title: 'Main content',
            rows: [
              [
                {
                  attribute: 'title',
                  required: true,
                  basis: '2/3',
                },
                {
                  attribute: 'code',
                  needsAdmin: true,
                  basis: '1/3',
                },
              ],
              [{
                attribute: 'url',
                basis: '2/3',
              }],
              [{
                attribute: 'description',
              }],
              [{
                attribute: 'comment',
                hideByDefault: true,
              }],
            ], // rows
          }, // section
        ], //
      }, // step
      {
        id: 'stakeholders',
        title: 'Targeted Stakeholders',
        titleSmall: 'Stakeholders',
        sections: [
          {
            id: 'stakeholders',
            rows: [
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.CONTACT,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.COUNTRY,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.GROUP,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.REG,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.ORG,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ], // sections
      }, // step
      {
        id: 'outreach',
        title: 'Related Outreach',
        titleSmall: 'Outreach',
        sections: [
          {
            id: 'outreach',
            rows: [
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.INTERACTION,
                asChildren: true,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.OP,
                asParents: true,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.AP,
                asParents: true,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.EVENT,
                asParents: true,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ],
      }, // step
      {
        id: 'other',
        title: 'Related Resources',
        titleSmall: 'Resources',
        sections: [
          {
            id: 'resources',
            rows: [
              [{
                connection: API.RESOURCES,
                type: RESOURCETYPES.WEB,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.RESOURCES,
                type: RESOURCETYPES.DOC,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ],
      }, // step
    ], // steps
  },
  6: {
    id: ACTIONTYPES.INTERACTION,
    order: 2,
    columns: [
      {
        id: 'date',
        type: 'date',
        sort: 'date',
        sortOrder: 'desc',
        sortDefault: true,
        attribute: 'date_start',
        minSize: 'small',
      },
      {
        id: 'taxonomy',
        type: 'taxonomy',
        taxonomy_id: 12, // interaction type
        minSize: 'large',
      },
      {
        id: `actors_${ACTORTYPES.CONTACT}`,
        type_id: ACTORTYPES.CONTACT,
        type: 'actors',
        minSize: 'ms',
        showOnSingle: false,
      },
      {
        id: `actors_${ACTORTYPES.COUNTRY}`,
        type_id: ACTORTYPES.COUNTRY,
        type: 'actors',
        minSize: 'medium',
        showOnSingle: false,
      },
      {
        id: `actors_${ACTORTYPES.GROUP}`,
        type_id: ACTORTYPES.GROUP,
        type: 'actors',
        minSize: 'medium',
        showOnSingle: false,
      },
      {
        id: `actors_${ACTORTYPES.ORG}`,
        type_id: ACTORTYPES.ORG,
        type: 'actors',
        minSize: 'hidden',
        showOnSingle: false,
      },
      {
        id: `parentActions_${ACTIONTYPES.EVENT}`, // one row per type,
        type: 'parentActions', // one row per type,
        showOnSingle: false,
        type_id: ACTIONTYPES.EVENT,
        minSize: 'large',
      },
      {
        id: `parentActions_${ACTIONTYPES.TASK}`, // one row per type,
        type: 'parentActions', // one row per type,
        showOnSingle: false,
        type_id: ACTIONTYPES.TASK,
        minSize: 'hidden',
      },
      {
        id: `parentActions_${ACTIONTYPES.OP}`, // one row per type,
        type: 'parentActions', // one row per type,
        showOnSingle: false,
        type_id: ACTIONTYPES.OP,
        minSize: 'hidden',
      },
      {
        id: `parentActions_${ACTIONTYPES.AP}`, // one row per type,
        type: 'parentActions', // one row per type,
        showOnSingle: false,
        type_id: ACTIONTYPES.AP,
        minSize: 'hidden',
      },
      {
        id: `childActions_${ACTIONTYPES.EXPRESS}`, // one row per type,
        type: 'childActions', // one row per type,
        showOnSingle: false,
        type_id: ACTIONTYPES.EXPRESS,
        minSize: 'hidden',
      },
      {
        id: 'users', // one row per type,
        type: 'users', // one row per type,
        adminOnly: true,
        minSize: 'medium',
      },
    ],
    form: [
      {
        id: 'footer',
        fields: [
          { attribute: 'is_archive', needsAdmin: true, skipNew: true },
          { attribute: 'private', needsAdminOrOwn: true },
          { attribute: 'draft', needsAdminOrOwn: true },
        ],
      },
      {
        id: 'main',
        title: 'Main',
        sections: [
          {
            id: 'main',
            title: 'General info',
            asColumns: ['1/3', '2/3'],
            rows: [
              [{
                attribute: 'date_start',
                prepopulate: true, // today
                basis: '1/3',
              },
              {
                attribute: 'date_comment',
                fieldType: 'textarea',
                hideByDefault: true,
              },
              ],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.EVENT,
                asParents: true,
                prepopulateIfPrevious: true,
                basis: '2/3',
              }],
            ],
          },
          {
            id: 'content',
            title: 'Main content',
            rows: [
              [
                {
                  attribute: 'title',
                  required: true,
                  basis: '2/3',
                },
                {
                  attribute: 'code',
                  // needsAdmin: true,
                  basis: '1/3',
                },
              ],
              [{
                attribute: 'url',
              }],
              [{
                attribute: 'description',
              }],
              [{
                attribute: 'comment',
                hideByDefault: true,
              }],
            ], // rows
          }, // section
        ], //
      }, // step
      {
        id: 'stakeholders',
        title: 'Participants',
        sections: [
          {
            id: 'interaction',
            title: 'Type of interaction',
            rows: [
              [{
                taxonomy: 12, // interaction type,
                type: 'pills',
              }],
            ],
          },
          {
            id: 'staff-stakeholders',
            title: 'Participating WWF Staff',
            rows: [
              [
                {
                  connection: API.USERS,
                  prepopulate: true, // current user
                  basis: '2/3',
                },
                {
                  attribute: 'notifications',
                  basis: '1/3',
                },
              ],
            ],
          },
          {
            id: 'other-stakeholders',
            title: 'Participating stakeholders',
            rows: [
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.CONTACT,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.COUNTRY,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTORS,
                type: ACTORTYPES.GROUP,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ], // sections
      }, // step
      {
        id: 'outreach',
        title: 'Related Outreach',
        titleSmall: 'Outreach',
        sections: [
          {
            id: 'outreach',
            rows: [
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.TASK,
                asParents: true,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.OP,
                asParents: true,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.ACTIONS,
                type: ACTIONTYPES.AP,
                asParents: true,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ],
      }, // step
      {
        id: 'other',
        title: 'Statements & resources',
        titleSmall: 'Statements & more',
        sections: [
          {
            id: 'statements',
            title: 'Related Statements',
            rows: [[{
              connection: API.ACTIONS,
              type: ACTIONTYPES.EXPRESS,
              asChildren: true,
              prepopulateIfPrevious: true,
            }]],
          },
          {
            id: 'resources',
            title: 'Related Resources',
            rows: [
              [{
                connection: API.RESOURCES,
                type: RESOURCETYPES.WEB,
                prepopulateIfPrevious: true,
              }],
              [{
                connection: API.RESOURCES,
                type: RESOURCETYPES.DOC,
                prepopulateIfPrevious: true,
              }],
            ],
          },
        ],
      }, // step
    ], // steps
  },
};

export const RESOURCETYPES_CONFIG = {
  form: [
    {
      id: 'footer',
      fields: [
        { attribute: 'is_archive', needsAdmin: true, skipNew: true },
        { attribute: 'private', needsAdminOrOwn: true },
        { attribute: 'draft', needsAdminOrOwn: true },
      ],
    },
    {
      id: 'main',
      title: 'All content',
      sections: [
        {
          id: 'content',
          rows: [
            [{
              attribute: 'title',
              required: true,
              basis: '2/3',
            }],
            [{
              attribute: 'url',
              basis: '2/3',
            }],
            [{
              attribute: 'publication_date',
              basis: '1/2',
            },
            {
              attribute: 'access_date',
              basis: '1/2',
            }],
            [{
              attribute: 'description',
              hideByDefault: true,
            }],
          ], // rows
        }, // section
      ], // sectipms
    },
  ], // steps
};

export const INDICATOR_CONFIG = {
  form: [
    {
      id: 'footer',
      fields: [
        { attribute: 'is_archive', needsAdmin: true, skipNew: true },
        { attribute: 'private', needsAdminOrOwn: true },
        { attribute: 'draft', needsAdminOrOwn: true },
      ],
    },
    {
      id: 'main',
      title: 'All content',
      sections: [
        {
          id: 'content',
          rows: [
            [
              {
                attribute: 'code',
                needsAdmin: true,
                basis: '1/3',
              },
            ],
            [
              {
                attribute: 'title',
                required: true,
                basis: '2/3',
              },
              {
                attribute: 'reference',
                label: 'order',
                placeholder: 'order',
              },
            ],
            [{
              attribute: 'description',
            }],
          ], // rows
        }, // section,
        {
          id: 'activities',
          title: 'Statements (with Level of Support)',
          rows: [
            [{
              connection: API.ACTIONS,
              type: ACTIONTYPES.EXPRESS,
              prepopulateIfPrevious: true,
            }],
          ],
        }, // section,
      ], // sections
    }, // step
  ],
};
export const PAGE_CONFIG = {
  attributes: {
    draft: {
      defaultValue: true,
      controlType: 'checkbox',
      type: 'bool',
    },
    private: {
      defaultValue: false,
      required: true,
      type: 'bool',
    },
    title: {
      type: 'text',
      required: true,
    },
    content: {
      type: 'markdown',
      required: true,
    },
    menu_title: {
      type: 'short',
    },
    order: {
      type: 'short',
    },
  },
  form: [
    {
      id: 'footer',
      fields: [
        { attribute: 'private', needsAdminOrOwn: true },
        { attribute: 'draft', needsAdminOrOwn: true },
      ],
    },
    {
      id: 'main',
      title: 'All content',
      sections: [
        {
          id: 'content',
          rows: [
            [{
              attribute: 'title',
              required: true,
              basis: '2/3',
            }],
            [
              {
                attribute: 'menu_title',
                basis: '1/3',
              },
              {
                attribute: 'order',
                basis: '1/3',
              },
            ],
            [{
              attribute: 'content',
              required: true,
            }],
          ], // rows
        }, // section,
      ], // sections
    }, // step
  ],
};
export const CATEGORY_CONFIG = {
  attributes: {
    draft: {
      defaultValue: true,
      controlType: 'checkbox',
      type: 'bool',
    },
    private: {
      defaultValue: false,
      required: true,
      type: 'bool',
    },
    is_archive: {
      defaultValue: false,
      required: true,
      type: 'bool',
    },
    reference: {
      type: 'short',
    },
    title: {
      type: 'text',
      required: true,
    },
    short_title: {
      type: 'short',
    },
    description: {
      type: 'markdown',
    },
    url: {
      type: 'url',
    },
  },
  form: [
    {
      id: 'footer',
      fields: [
        { attribute: 'is_archive', needsAdmin: true, skipNew: true },
        { attribute: 'private', needsAdminOrOwn: true },
        { attribute: 'draft', needsAdminOrOwn: true },
      ],
    },
    {
      id: 'main',
      title: 'All content',
      sections: [
        {
          id: 'content',
          rows: [
            [
              {
                attribute: 'title',
                required: true,
                basis: '2/3',
              },
              {
                attribute: 'reference',
                label: 'order',
                placeholder: 'order',
                basis: '1/3',
              },
            ],
            [{
              attribute: 'short_title',
            }],
            [{
              attribute: 'url',
            }],
            [{
              attribute: 'description',
            }],
          ], // rows
        }, // section,
      ], // sections
    }, // step
  ],
};
export const USER_CONFIG = {
  attributes: {
    draft: {
      defaultValue: true,
      controlType: 'checkbox',
      type: 'bool',
    },
    private: {
      defaultValue: false,
      required: true,
      type: 'bool',
    },
    name: {
      type: 'text',
      required: true,
    },
    email: {
      type: 'text',
      required: true,
    },

  },
  form: [
    {
      id: 'main',
      title: 'User data',
      sections: [
        {
          id: 'content',
          title: 'User Details',
          rows: [
            [{
              attribute: 'name',
              required: true,
              basis: '2/3',
            }],
            [
              {
                attribute: 'email',
                required: true,
                basis: '2/3',
              },
            ],
          ], // rows
        }, // section,
        {
          id: 'role',
          title: 'User Role',
          needsAdmin: true,
          rows: [
            [{
              connection: API.ROLES,
              needsAdmin: true,
              basis: '2/3',
            }],
          ], // rows
        }, // section,
      ], // sections
    }, // step
    {
      id: 'stakeholders',
      title: 'Stakeholders',
      needsMember: true,
      sections: [
        {
          id: 'content',
          title: 'Contacts',
          rows: [
            [{
              connection: API.ACTORS,
              type: ACTORTYPES.CONTACT,
            }],
          ], // rows
        }, // section,
        {
          id: 'content1',
          title: 'Countries & Organisations',
          rows: [
            [{
              connection: API.ACTORS,
              type: ACTORTYPES.COUNTRY,
            }],
            [{
              connection: API.ACTORS,
              type: ACTORTYPES.ORG,
            }],
          ], // rows
        }, // section,
        {
          id: 'content2',
          title: 'Countries Groups & Regions',
          rows: [
            [{
              connection: API.ACTORS,
              type: ACTORTYPES.GROUP,
            }],
            [{
              connection: API.ACTORS,
              type: ACTORTYPES.REG,
            }],
          ], // rows
        }, // section,
      ], // sections
    }, // step
    {
      id: 'outreach',
      title: 'Outreach',
      needsMember: true,
      sections: [
        {
          id: 'content',
          title: 'Assigned Tasks & Plans',
          rows: [
            [{
              connection: API.ACTIONS,
              type: ACTIONTYPES.TASK,
            }],
            [{
              connection: API.ACTIONS,
              type: ACTIONTYPES.OP,
            }],
            [{
              connection: API.ACTIONS,
              type: ACTIONTYPES.AP,
            }],
          ], // rows
        }, // section,
        {
          id: 'content2',
          title: 'Interactions & Events',
          rows: [
            [{
              connection: API.ACTIONS,
              type: ACTIONTYPES.INTERACTION,
            }],
            [{
              connection: API.ACTIONS,
              type: ACTIONTYPES.EVENT,
            }],
          ], // rows
        }, // section,
      ], // sections
    }, // step
  ],
};

export const KEEP_FILTERS = ['view', 'ms', 'subj', 'msubj', 'tm', 'am'];

// Language and date settings ********************
// Note: you may also set the locales in i18n.js

// default language locale
export const DEFAULT_LOCALE = 'en-GB';
// date format - change to format according to locale, only used for form error message
export const DATE_FORMAT = 'dd/MM/yyyy';

// UI settings ************************

// show app title and claim in header when not included in graphic
// set in translations/[LOCALE].js
// - app.containers.App.app.title
// - app.containers.App.app.claim

// show header pattern
// specified in themes/[theme].js: theme.backgroundImages.header
export const SHOW_HEADER_PATTERN = true;
export const HEADER_PATTERN_HEIGHT = 254;

// show header pattern
// specified in themes/[theme].js: theme.backgroundImages.sidebarHeader
export const SHOW_SIDEBAR_HEADER_PATTERN = false;

// show app title and claim in home when not included in graphic
// set in translations/[LOCALE].js
// - app.containers.App.app.title
// - app.containers.App.app.claim
export const SHOW_HOME_TITLE = true;

export const SHOW_BRAND_ON_HOME = true;
export const SHOW_HEADER_PATTERN_HOME_GRAPHIC = false;

// show footer logo section
export const FOOTER = {
  PARTNERS: false,
  LINK_TARGET_INTERNAL: false,
  LINK_TARGET_INTERNAL_ID: 1,
};

// entitylists items-per-page options
// export const PAGE_ITEM_OPTIONS = [10, 20, 50, 100, 'all'];
export const PAGE_ITEM_OPTIONS = [
  { value: 10 },
  { value: 20 },
  { value: 50 },
  { value: 100 },
  {
    value: 'all',
    message: 'ui.pageItemOptions.all',
  },
];

export const TEXT_TRUNCATE = {
  CONNECTION_TAG: 10,
  ATTRIBUTE_TAG: 10,
  ENTITY_TAG: 7,
  CONNECTION_POPUP: 80,
  LINK_FIELD: 30,
  TYPE_SELECT: 24,
  GRACE: 2,
  META_TITLE: 20,
  INDICATOR_SELECT: 35,
  INDICATOR_SELECT_OPTION: 40,
};

export const COLUMN_WIDTHS = {
  FULL: 1,
  HALF: 0.5,
  MAIN: 0.72,
  OTHER: 0.28,
};


/**
 * Server settings
 * */

// API request Authentification keys
export const KEYS = {
  ACCESS_TOKEN: 'access-token',
  TOKEN_TYPE: 'token-type',
  CLIENT: 'client',
  EXPIRY: 'expiry',
  UID: 'uid',
  RESET_PASSWORD: 'reset_password',
};

// database date format
export const API_DATE_FORMAT = 'yyyy-MM-dd';


// Map server messages *********************************

// Map server error messages to allow client-side translation
export const SERVER_ERRORS = {
  RECORD_OUTDATED: 'Record outdated',
  EMAIL_FORMAT: 'Email: is not an email',
  PASSWORD_MISMATCH: 'Password confirmation doesn\'t match Password',
  PASSWORD_SHORT: 'Password is too short (minimum is 6 characters)',
  PASSWORD_INVALID: 'Current password is invalid',
  TITLE_REQUIRED: 'Title: can\'t be blank',
  REFERENCE_REQUIRED: 'Reference: can\'t be blank',
};

// Map server attribute values **************************

// user roles
// value: db-id
// order: order of privileges, smaller values encompass larger values
export const USER_ROLES = {
  ADMIN: { value: 1, message: 'ui.userRoles.admin', order: 1 },
  COORDINATOR: { value: 4, message: 'ui.userRoles.coordinator', order: 2 },
  MEMBER: { value: 2, message: 'ui.userRoles.member', order: 3 },
  VISITOR: { value: 3, message: 'ui.userRoles.visitor', order: 4 },
  DEFAULT: { value: 9999, message: 'ui.userRoles.default', order: 9999 }, // note: client side only - no role assigned on server
};

export const EMAIL_STATUSES = [
  { value: 'valid', message: 'ui.emailStatuses.valid' },
  { value: 'invalid', message: 'ui.emailStatuses.invalid' },
  { value: 'empty', message: 'ui.emailStatuses.empty' },
];

export const ATTRIBUTE_STATUSES = {
  // Entity publish statuses
  draft: [
    { value: true, message: 'ui.publishStatuses.draft' },
    { value: false, message: 'ui.publishStatuses.public' },
  ],
  private: [
    { value: true, message: 'ui.privacyStatuses.private' },
    { value: false, message: 'ui.privacyStatuses.public' },
  ],
  notifications: [
    { value: true, message: 'ui.notificationStatuses.enabled' },
    { value: false, message: 'ui.notificationStatuses.disabled' },
  ],
  is_archive: [
    { value: true, message: 'ui.archiveStatuses.archived' },
    { value: false, message: 'ui.archiveStatuses.current' },
  ],
};

export const DEFAULT_RESOURCETYPE = RESOURCETYPES.REF;
export const DEFAULT_ACTIONTYPE = ACTIONTYPES.TASK;
export const DEFAULT_ACTORTYPE = ACTORTYPES.COUNTRY;
export const DEFAULT_TAXONOMY = '11';
export const NO_PARENT_KEY = 'parentUndefined';

export const PRINT = {
  SIZES: {
    // actual
    // A4: { W: 595, H: 842 }, // pt
    // A3: { W: 842, H: 1190 }, // pt
    // rendering
    A4: {
      portrait: { W: 520, H: 720 }, // pt
      landscape: { W: 760, H: 500 }, // pt
      // portrait: { W: 760, H: 1050 }, // pt
      // landscape: { H: 720, W: 1100 }, // pt
    },
    A3: {
      portrait: { W: 760, H: 1100 }, // pt
      landscape: { W: 1100, H: 720 }, // pt
    },
    portrait: { W: 760, H: 1080 }, // pt
    landscape: { W: 1100, H: 680 }, // pt
  },
};

export const MAP_OPTIONS = {
  RANGE: ['#CAE0F7', '#164571'],
  GRADIENT: {
    // actors: ['#FAFA6E', '#81DD90', '#029481', '#035E93', '#043465'],
    actors: ['#FAFA6E', '#81DD90', '#029481', '#00728f', '#043465'],
  },
  NO_DATA_COLOR: '#EDEFF0',
  DEFAULT_STYLE: {
    weight: 1,
    color: '#CFD3D7',
    fillOpacity: 1,
    fillColor: '#EDEFF0',
  },
  STYLE: {
    active: {
      weight: 2,
      color: '#000000',
    },
    members: {
      fillColor: '#aaa',
    },
    country: {
      fillColor: '#0063b5',
      weight: 1.5,
      color: '#333333',
    },
  },
  TOOLTIP_STYLE: {
    weight: 1,
    fillOpacity: 0,
    color: '#666666',
    interactive: false,
  },
  OVER_STYLE: {
    weight: 1,
    fillOpacity: 0,
    color: '#ADB4B9',
    interactive: false,
  },
  BBOX_STYLE: {
    fillColor: '#F9F9FA',
    fillOpacity: 1,
    weight: 0.5,
    color: '#DEE1E3',
  },
  CENTER: [20, 0],
  ZOOM: {
    INIT: 1,
    MIN: 0,
    MAX: 9,
  },
  BOUNDS: {
    N: 90,
    W: -3600,
    S: -90,
    E: 3600,
  },
  PROJ: {
    robinson: {
      name: 'Robinson',
      crs: 'ESRI:54030',
      proj4def: '+proj=robin +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs',
      resolutions: [
        65536, 32768, 16384, 8192, 4096, 2048, 1024, 512, 256, 128,
      ],
      origin: [0, 0],
      bounds: [[90, -180], [-90, 180]], // [[N, W], [S, E]]
      addBBox: true,
    },
  },
};


export const FORM_NON_CONTROL_PROPS = [
  'hint',
  'label',
  'component',
  'controlType',
  'children',
  'errorMessages',
  'hasrequired',
  'hideByDefault',
  'prepopulate',
  'autofill',
  'basis',
  'isBlocked',
  'info',
];
