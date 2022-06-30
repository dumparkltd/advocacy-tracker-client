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

// General ********************
export const NODE_ENV = sessionStorage.NODE_ENV || 'production';

const IS_DEV = false;
export const version = '1.0.4';

export const ENDPOINTS = {
  API: (
    NODE_ENV === 'production' && !IS_DEV
      ? 'https://advocacy-tracker-api.herokuapp.com'
      : 'https://advocacy-tracker-dev.herokuapp.com'
  ), // server API endpoint
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
  ORG: '2',
  CONTACT: '3',
  REG: '4',
  GROUP: '5',
};

export const RESOURCETYPES = {
  REF: '1',
  WEB: '2',
  DOC: '3',
};

export const ACTION_INDICATOR_SUPPORTLEVELS = {
  0: {
    value: '0',
    default: true,
  },
  1: {
    value: '1',
  },
  2: {
    value: '2',
  },
  3: {
    value: '3',
  },
  4: {
    value: '4',
  },
};

export const ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS = {
  [ACTIONTYPES.EXPRESS]: [
    ACTION_INDICATOR_SUPPORTLEVELS['0'],
    ACTION_INDICATOR_SUPPORTLEVELS['1'],
    ACTION_INDICATOR_SUPPORTLEVELS['2'],
    ACTION_INDICATOR_SUPPORTLEVELS['3'],
    ACTION_INDICATOR_SUPPORTLEVELS['4'],
  ],
};

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
  },
  ATTRIBUTES: {
    measuretype_id: {
      defaultValue: '1',
      required: Object.values(ACTIONTYPES), // all types
      type: 'number',
      table: API.ACTIONTYPES,
    },
    draft: {
      defaultValue: true,
      required: Object.values(ACTIONTYPES), // all types
      type: 'bool',
      // ui: 'dropdown',
      skipImport: true,
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
    code: {
      optional: Object.values(ACTIONTYPES), // all types
      type: 'text',
    },
    title: {
      required: Object.values(ACTIONTYPES), // all types
      type: 'text',
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
    },
    url: {
      optional: Object.values(ACTIONTYPES),
      type: 'url',
    },
    date_start: {
      optional: Object.values(ACTIONTYPES),
      type: 'date',
    },
    date_end: {
      optional: [ACTIONTYPES.EVENT],
      type: 'date',
    },
    date_comment: {
      optional: Object.values(ACTIONTYPES),
      type: 'text',
    },
  },
};

export const ACTOR_FIELDS = {
  CONNECTIONS: {
    categories: {
      table: API.CATEGORIES,
      connection: API.ACTOR_CATEGORIES,
      groupby: {
        table: API.TAXONOMIES,
        on: '_id',
      },
    },
    actions: {
      table: API.ACTIONS,
      connection: API.ACTOR_ACTIONS,
      groupby: {
        table: API.ACTIONTYPES,
        on: 'measuretype_id',
      },
    },
  },
  ATTRIBUTES: {
    actortype_id: {
      defaultValue: '1',
      required: true,
      type: 'number',
      table: API.ACTORTYPES,
    },
    draft: {
      defaultValue: true,
      required: true,
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
      required: true,
      type: 'bool',
    },
    is_archive: {
      defaultValue: false,
      required: true,
      type: 'bool',
    },
    code: {
      optional: [
        ACTORTYPES.COUNTRY,
        ACTORTYPES.ORG,
        ACTORTYPES.GROUP,
      ], // all types
      type: 'text',
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
      type: 'text',
    },
  },
};

export const RESOURCE_FIELDS = {
  CONNECTIONS: {
    actions: {
      table: API.ACTIONS,
      connection: API.ACTION_RESOURCES,
      groupby: {
        table: API.ACTIONTYPES,
        on: 'measuretype_id',
      },
    },
  },
  ATTRIBUTES: {
    resourcetype_id: {
      defaultValue: '1',
      required: Object.values(RESOURCETYPES), // all types
      type: 'number',
      table: API.RESOURCETYPES,
    },
    draft: {
      defaultValue: true,
      required: Object.values(RESOURCETYPES), // all types
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
      required: Object.values(ACTIONTYPES), // all types
      type: 'bool',
    },
    is_archive: {
      defaultValue: false,
      required: Object.values(ACTIONTYPES), // all types
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
  CONNECTIONS: {
    actions: {
      table: API.ACTIONS,
      connection: API.ACTION_INDICATORS,
      groupby: {
        table: API.ACTIONTYPES,
        on: 'measuretype_id',
      },
    },
  },
  ATTRIBUTES: {
    draft: {
      defaultValue: true,
      required: true,
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
      required: true,
      type: 'bool',
    },
    is_archive: {
      defaultValue: false,
      required: true,
      type: 'bool',
    },
    title: {
      required: true,
      type: 'text',
    },
    code: {
      type: 'text',
    },
    description: {
      type: 'markdown',
    },
  },
};

// type compatibility: actors for actions
export const ACTIONTYPE_ACTORTYPES = {
  // countries make expressions/statements
  [ACTIONTYPES.EXPRESS]: [
    ACTORTYPES.GROUP,
    ACTORTYPES.COUNTRY,
    ACTORTYPES.CONTACT,
    ACTORTYPES.ORG,
  ],
  // events are attended by countries, contacts, orgs
  [ACTIONTYPES.EVENT]: [
    ACTORTYPES.GROUP,
    ACTORTYPES.COUNTRY,
    ACTORTYPES.CONTACT,
    ACTORTYPES.ORG,
  ],
  // interactions with countries, contacts or organisations
  [ACTIONTYPES.INTERACTION]: [
    ACTORTYPES.GROUP,
    ACTORTYPES.COUNTRY,
    ACTORTYPES.CONTACT,
    ACTORTYPES.ORG,
  ],
  // // outreach plans are targeting countries & contacts
  // [ACTIONTYPES.OP]: [
  //   ACTORTYPES.COUNTRY,
  //   ACTORTYPES.CONTACT,
  // ],
  // // advocacy plans are targeting countries & contacts
  // [ACTIONTYPES.AP]: [
  //   ACTORTYPES.COUNTRY,
  //   ACTORTYPES.CONTACT,
  // ],
  // // tasks target countries
  // [ACTIONTYPES.TASK]: [
  //   ACTORTYPES.COUNTRY,
  // ],
};

export const ACTIONTYPE_TARGETTYPES = {
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
    ACTORTYPES.CONTACT,
    ACTORTYPES.REG,
    ACTORTYPES.GROUP,
    ACTORTYPES.ORG,
  ],
};


export const ACTIONTYPE_RESOURCETYPES = {
  [ACTIONTYPES.EXPRESS]: [
    RESOURCETYPES.REF,
    RESOURCETYPES.WEB,
    RESOURCETYPES.DOC,
  ],
  [ACTIONTYPES.EVENT]: [],
  [ACTIONTYPES.OP]: [],
  [ACTIONTYPES.AP]: [],
  [ACTIONTYPES.TASK]: [],
  [ACTIONTYPES.INTERACTION]: [],
};

// related actions
export const ACTIONTYPE_ACTIONTYPES = {
  // top-actions - no sub-actions
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
        id: 'members', // one row per type,
        type: 'members', // one row per type,
      },
      {
        id: 'users', // one row per type,
        type: 'users', // one row per type,
      },
    ],
  },
  2: { // ORG
    id: ACTORTYPES.ORG,
    order: 3,
    columns: [
      {
        id: '',
        type: '',
        _id: 2, // sector
      },
      {
        id: 'members', // one row per type,
        type: 'members', // one row per type,
      },
      {
        id: 'users', // one row per type,
        type: 'users', // one row per type,
      },
    ],
  },
  3: {
    id: ACTORTYPES.CONTACT,
    order: 5,
    columns: [
      // {
      //   id: '',
      //   type: '',
      //   taxonomy_id: 3, // role
      // },
      {
        id: 'associations', // one row per type,
        type: 'associations', // one row per type,
      },
      {
        id: 'users', // one row per type,
        type: 'users', // one row per type,
      },
    ],
  },
  4: { // REG
    id: ACTORTYPES.REG,
    order: 4,
    columns: [
      {
        id: 'taxonomy',
        type: 'taxonomy',
        taxonomy_id: 4, // region type
      },
      {
        id: 'members', // one row per type,
        type: 'members', // one row per type,
      },
      {
        id: 'users', // one row per type,
        type: 'users', // one row per type,
      },
    ],
  },
  5: { // GROUP
    id: ACTORTYPES.GROUP,
    order: 2,
    columns: [
      {
        id: 'taxonomy',
        type: 'taxonomy',
        taxonomy_id: 5, // group type
      },
      {
        id: 'members', // one row per type,
        type: 'members', // one row per type,
      },
      {
        id: 'users', // one row per type,
        type: 'users', // one row per type,
      },
    ],
  },
};

export const ACTIONTYPES_CONFIG = {
  1: {
    id: ACTIONTYPES.EXPRESS,
    order: 3,
    is_code_public: true,
    columns: [
      {
        id: 'main',
        type: 'main',
        sort: 'title',
        attributes: ['title'],
      },
      {
        id: 'date',
        type: 'date',
        sort: 'date',
        sortOrder: 'desc',
        sortDefault: true,
        attribute: 'date_start',
        primary: true,
      },
      {
        id: 'indicators',
        type: 'indicators',
        sort: 'title',
      },
      {
        id: 'taxonomy-13',
        type: 'taxonomy',
        taxonomy_id: 13, // level of authority
      },
      {
        id: 'actors',
        type: 'actors',
        sort: 'title',
      },
      // {
      //   id: 'users', // one row per type,
      //   type: 'users', // one row per type,
      // },
      // {
      //   id: 'taxonomy-12',
      //   type: 'taxonomy',
      //   taxonomy_id: 12, // commitment type
      // },
      // {
      //   id: 'taxonomy-11',
      //   type: 'taxonomy',
      //   taxonomy_id: 11, // level of commitment: as link
      // },
      // {
      //   id: 'date',
      //   type: 'date',
      //   sort: 'date_start',
      //   sortOrder: 'asc',
      //   attribute: 'date_start',
      //   align: 'end',
      //   primary: true,
      // },
    ],
  },
  2: {
    id: ACTIONTYPES.EVENT,
    order: 4,
    is_code_public: true,
    columns: [
      {
        id: 'main',
        type: 'main',
        sort: 'title',
        attributes: ['title'],
      },
      {
        id: 'date',
        type: 'date',
        sort: 'date',
        sortOrder: 'desc',
        sortDefault: true,
        attribute: 'date_start',
        primary: true,
      },
      {
        id: 'taxonomy',
        type: 'taxonomy',
        taxonomy_id: 9, // event type
      },
      {
        id: 'actors', // one row per type,
        type: 'actors', // one row per type,
        showOnSingle: false,
      },
      {
        id: 'users', // one row per type,
        type: 'users', // one row per type,
      },
      // {
      //   id: 'taxonomy-3',
      //   type: 'taxonomy',
      //   taxonomy_id: 3, // LBS-protocol statuses: as link
      // },
    ],
  },
  3: {
    id: ACTIONTYPES.OP,
    order: 5,
    is_code_public: true,
    columns: [
      {
        id: 'main',
        type: 'main',
        sort: 'title',
        attributes: ['title'],
      },
      {
        id: 'date',
        type: 'date',
        sort: 'date',
        sortOrder: 'desc',
        sortDefault: true,
        attribute: 'date_start',
        primary: true,
      },
      {
        id: 'taxonomy',
        type: 'taxonomy',
        taxonomy_id: 10, // event type
      },
      {
        id: 'targets', // one row per type,
        type: 'targets', // one row per type,
        sort: 'title',
      },
      {
        id: 'users', // one row per type,
        type: 'users', // one row per type,
      },
    ],
  },
  4: {
    id: ACTIONTYPES.AP,
    order: 6,
    columns: [
      {
        id: 'main',
        type: 'main',
        sort: 'title',
        attributes: ['title'],
      },
      {
        id: 'date',
        type: 'date',
        sort: 'date',
        sortOrder: 'desc',
        sortDefault: true,
        attribute: 'date_start',
        primary: true,
      },
      {
        id: 'taxonomy',
        type: 'taxonomy',
        taxonomy_id: 10, // event type
      },
      {
        id: 'targets',
        type: 'targets',
        sort: 'title',
      },
      {
        id: 'users', // one row per type,
        type: 'users', // one row per type,
      },
      // {
      //   id: 'taxonomy',
      //   type: 'taxonomy',
      //   taxonomy_id: 4, // strategy types: as link
      // },
    ],
  },
  5: {
    id: ACTIONTYPES.TASK,
    order: 1,
    columns: [
      {
        id: 'main',
        type: 'main',
        sort: 'title',
        attributes: ['title'],
      },
      {
        id: 'date',
        type: 'date',
        sort: 'date',
        sortOrder: 'desc',
        sortDefault: true,
        attribute: 'date_start',
        primary: true,
      },
      {
        id: 'taxonomy',
        type: 'taxonomy',
        taxonomy_id: 11, // status
      },
      {
        id: 'taxonomy-10',
        type: 'taxonomy',
        taxonomy_id: 10, // priority
      },
      {
        id: 'targets', // one row per type,
        type: 'targets', // one row per type,
      },
      {
        id: 'users', // one row per type,
        type: 'users', // one row per type,
      },
    ],
  },
  6: {
    id: ACTIONTYPES.INTERACTION,
    order: 2,
    columns: [
      {
        id: 'main',
        type: 'main',
        sort: 'title',
        attributes: ['title'],
      },
      {
        id: 'date',
        type: 'date',
        sort: 'date',
        sortOrder: 'desc',
        sortDefault: true,
        attribute: 'date_start',
        primary: true,
      },
      {
        id: 'taxonomy',
        type: 'taxonomy',
        taxonomy_id: 12, // interaction type
      },
      {
        id: 'actors', // one row per type,
        type: 'actors', // one row per type,
      },
      {
        id: 'users', // one row per type,
        type: 'users', // one row per type,
      },
    ],
  },
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
export const USER_ROLES = {
  ADMIN: { value: 1, message: 'ui.userRoles.admin' },
  MANAGER: { value: 2, message: 'ui.userRoles.manager' },
  ANALYST: { value: 3, message: 'ui.userRoles.analyst' },
  DEFAULT: { value: 9999, message: 'ui.userRoles.default' }, // note: client side only - no role assigned on server
};
// Entity publish statuses
export const PUBLISH_STATUSES = [
  { value: true, message: 'ui.publishStatuses.draft' },
  { value: false, message: 'ui.publishStatuses.public' },
];
// Entity publish statuses
export const PRIVACY_STATUSES = [
  { value: false, message: 'ui.privacyStatuses.public' },
  { value: true, message: 'ui.privacyStatuses.private' },
];
export const ARCHIVE_STATUSES = [
  { value: false, message: 'ui.archiveStatuses.current' },
  { value: true, message: 'ui.archiveStatuses.archived' },
];

export const DEFAULT_RESOURCETYPE = RESOURCETYPES.REF;
export const DEFAULT_ACTIONTYPE = ACTIONTYPES.TASK;
export const DEFAULT_ACTORTYPE = ACTORTYPES.COUNTRY;
export const DEFAULT_TAXONOMY = '11';
export const NO_PARENT_KEY = 'parentUndefined';

export const MAP_OPTIONS = {
  RANGE: ['#CAE0F7', '#164571'],
  GRADIENT: {
    actors: ['#fafa6e', '#72d07d', '#009a8a', '#006076', '#052b43'],
    targets: ['#fafa6e', '#faad4a', '#dd654b', '#a52752', '#59004d'],
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
