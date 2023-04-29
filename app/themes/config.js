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

export const VERSION = `${version}${IS_DEV ? ' [DEV]' : ''}`;

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

export const OFFICIAL_STATEMENT_CATEGORY_ID = 55;
export const AUTHORITY_TAXONOMY = 13;


export const ACTION_INDICATOR_SUPPORTLEVELS = {
  // not assigned
  0: {
    value: '0',
    default: true,
    color: '#EDEFF0',
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

export const MAP_OPTIONS = {
  RANGE: ['#CAE0F7', '#164571'],
  GRADIENT: {
    // actors: ['#FAFA6E', '#81DD90', '#029481', '#035E93', '#043465'],
    actors: ['#FAFA6E', '#81DD90', '#029481', '#00728f', '#043465'],
    targets: ['#FAFA6E', '#FAAB4B', '#DD654A', '#BF0071', '#59004d'],
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
    },
    // expressed by country
    // column: country-code
    'country-code': {
      type: 'text',
      optional: [
        ACTIONTYPES.EXPRESS,
        ACTIONTYPES.EVENT,
        ACTIONTYPES.INTERACTION,
      ],
      lookup: {
        table: API.ACTORS,
        attribute: 'code',
      },
      table: API.ACTOR_ACTIONS,
      keyPair: ['measure_id', 'actor_id'], // own, other
    },
    // expressed by actor
    // column: country-code
    'actor-code': {
      type: 'text',
      optional: [
        ACTIONTYPES.EXPRESS,
        ACTIONTYPES.EVENT,
        ACTIONTYPES.INTERACTION,
      ],
      multiple: true,
      lookup: {
        table: API.ACTORS,
        attribute: 'code',
      },
      table: API.ACTOR_ACTIONS,
      keyPair: ['measure_id', 'actor_id'], // own, other
    },
    // column: country-code
    'actor-id': {
      type: 'text',
      optional: [
        ACTIONTYPES.EXPRESS,
        ACTIONTYPES.EVENT,
        ACTIONTYPES.INTERACTION,
      ],
      multiple: true,
      lookup: {
        table: API.ACTORS, // id assumed
      },
      table: API.ACTOR_ACTIONS,
      keyPair: ['measure_id', 'actor_id'], // own, other
    },
    // column: country-code
    'target-code': {
      type: 'text',
      optional: [
        ACTIONTYPES.OP,
        ACTIONTYPES.AP,
        ACTIONTYPES.TASK,
      ],
      multiple: true,
      lookup: {
        table: API.ACTORS,
        attribute: 'code',
      },
      table: API.ACTION_ACTORS,
      keyPair: ['measure_id', 'actor_id'], // own, other
    },
    // column: country-code
    'target-id': {
      type: 'text',
      optional: [
        ACTIONTYPES.OP,
        ACTIONTYPES.AP,
        ACTIONTYPES.TASK,
      ],
      multiple: true,
      lookup: {
        table: API.ACTORS, // id assumed
      },
      table: API.ACTION_ACTORS,
      keyPair: ['measure_id', 'actor_id'], // own, other
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
      multiple: true,
      lookup: {
        table: API.ACTIONS,
      },
      table: API.ACTION_ACTIONS,
      keyPair: ['measure_id', 'other_measure_id'], // own, other
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
      multiple: true,
      lookup: {
        table: API.RESOURCES, // id assumed
      },
      table: API.ACTION_RESOURCES,
      keyPair: ['measure_id', 'resource_id'], // own, other
    },
    // has category
    'category-id': {
      type: 'number',
      optional: [
        ACTIONTYPES.EXPRESS,
        ACTIONTYPES.INTERACTION,
        ACTIONTYPES.EVENT,
        ACTIONTYPES.OP,
        ACTIONTYPES.AP,
        ACTIONTYPES.TASK,
      ],
      multiple: true,
      lookup: {
        table: API.CATEGORIES, // id assumed
      },
      table: API.ACTION_CATEGORIES,
      keyPair: ['measure_id', 'category_id'], // own, other
    },
    // has category
    'category-code': {
      type: 'number',
      optional: [
        ACTIONTYPES.EXPRESS,
        ACTIONTYPES.INTERACTION,
        ACTIONTYPES.EVENT,
        ACTIONTYPES.OP,
        ACTIONTYPES.AP,
        ACTIONTYPES.TASK,
      ],
      multiple: true,
      lookup: {
        table: API.CATEGORIES, // id assumed
        attribute: 'code',
      },
      table: API.ACTION_CATEGORIES,
      keyPair: ['measure_id', 'category_id'], // own, other
    },
  },
  ATTRIBUTES: {
    measuretype_id: {
      defaultValue: '1',
      required: Object.values(ACTIONTYPES), // all types
      type: 'number',
      importDefault: 'type',
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
      type: 'bool',
    },
    is_archive: {
      defaultValue: false,
      type: 'bool',
    },
    notifications: {
      defaultValue: true,
      type: 'bool',
    },
    code: {
      optional: Object.values(ACTIONTYPES), // all types
      adminOnly: true,
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
      optional: true,
      adminOnly: true,
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
        id: 'associations', // one row per type,
        type: 'associations', // one row per type,
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
  2: { // ORG
    id: ACTORTYPES.ORG,
    order: 3,
    columns: [
      {
        id: 'taxonomy',
        type: 'taxonomy',
        taxonomy_id: 2, // sector
      },
      {
        id: 'associations', // one row per type,
        type: 'associations', // one row per type,
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
      {
        id: 'taxonomy',
        type: 'taxonomy',
        taxonomy_id: 3, // role
      },
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
    columns: [
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
        taxonomy_id: AUTHORITY_TAXONOMY, // level of authority
      },
      {
        id: 'actors',
        type: 'actors',
        sort: 'title',
      },
    ],
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
    ],
  },
  3: {
    id: ACTIONTYPES.OP,
    order: 5,
    is_code_public: true,
    columns: [
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
        id: 'childActions', // one row per type,
        type: 'childActions', // one row per type,
        showOnSingle: false,
      },
      {
        id: 'targets', // one row per type,
        type: 'targets', // one row per type,
        sort: 'title',
      },
      {
        id: 'targetsViaChildren', // one row per type,
        type: 'targetsViaChildren', // one row per type,
        sort: 'title',
        showOnSingle: false,
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
        id: 'childActions', // one row per type,
        type: 'childActions', // one row per type,
        showOnSingle: false,
      },
      {
        id: 'targets',
        type: 'targets',
        sort: 'title',
      },
      {
        id: 'targetsViaChildren', // one row per type,
        type: 'targetsViaChildren', // one row per type,
        sort: 'title',
      },
      {
        id: 'users', // one row per type,
        type: 'users', // one row per type,
      },
    ],
  },
  5: {
    id: ACTIONTYPES.TASK,
    order: 1,
    columns: [
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
        id: 'parentActions', // one row per type,
        type: 'parentActions', // one row per type,
        showOnSingle: false,
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
  INDICATOR_SELECT: 30,
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
export const NOTIFICATION_STATUSES = [
  { value: true, message: 'ui.notificationStatuses.enabled' },
  { value: false, message: 'ui.notificationStatuses.disabled' },
];
export const ARCHIVE_STATUSES = [
  { value: false, message: 'ui.archiveStatuses.current' },
  { value: true, message: 'ui.archiveStatuses.archived' },
];
export const EMAIL_STATUSES = [
  { value: 'valid', message: 'ui.emailStatuses.valid' },
  { value: 'invalid', message: 'ui.emailStatuses.invalid' },
  { value: 'empty', message: 'ui.emailStatuses.empty' },
];

export const DEFAULT_RESOURCETYPE = RESOURCETYPES.REF;
export const DEFAULT_ACTIONTYPE = ACTIONTYPES.TASK;
export const DEFAULT_ACTORTYPE = ACTORTYPES.COUNTRY;
export const DEFAULT_TAXONOMY = '11';
export const NO_PARENT_KEY = 'parentUndefined';
