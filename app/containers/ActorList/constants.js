import {
  API,
  USER_ROLES,
  PUBLISH_STATUSES,
  PRIVACY_STATUSES,
  ARCHIVE_STATUSES,
  EMAIL_STATUSES,
  ROUTES,
  ACTORTYPES,
} from 'themes/config';

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
      types: {
        actor: 'actor-actions',
        target: 'target-actions',
      },
      search: true,
      messageByType: 'entities.actions_{typeid}.plural',
      message: 'entities.actions.plural',
      path: API.ACTIONS, // filter by actor connection
      invalidateEntitiesPaths: [API.ACTORS, API.ACTIONS],
      entityType: 'actions', // filter by actor connection
      clientPath: ROUTES.ACTION,
      connectPath: API.ACTOR_ACTIONS, // filter by actor connection
      connectPaths: {
        actor: API.ACTOR_ACTIONS,
        target: API.ACTION_ACTORS,
      }, // filter by actor connection
      key: 'measure_id',
      ownKey: 'actor_id',
      groupByType: true,
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
        options: PUBLISH_STATUSES,
        role: USER_ROLES.MEMBER.value,
        filterUI: 'checkboxes',
      },
      {
        search: false,
        message: 'attributes.private',
        attribute: 'private',
        options: PRIVACY_STATUSES,
        role: USER_ROLES.MEMBER.value,
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
