/**
 * The global state selectors
 *
 * use the makeSelector () => createSelector pattern when you want a selector that
 * doesn't take arguments, but can have its own cache between components
 *
 * otherwise use straight createSelector
 * https://github.com/react-boilerplate/react-boilerplate/pull/1205#issuecomment-274319934
 *
 */
import { createSelector } from 'reselect';
import createCachedSelector from 're-reselect';
import { reduce } from 'lodash/collection';
import { Map, List } from 'immutable';

import asArray from 'utils/as-array';
import asList from 'utils/as-list';
import isDate from 'utils/is-date';
import { sortEntities } from 'utils/sort';

import {
  API,
  ROUTES,
  USER_ROLES,
  ACTIONTYPE_ACTORTYPES,
  ACTIONTYPE_RESOURCETYPES,
  DEFAULT_ACTIONTYPE,
  DEFAULT_ACTORTYPE,
  ACTORTYPES,
  ACTIONTYPES,
  ACTORTYPES_CONFIG,
  ACTIONTYPES_CONFIG,
  INDICATOR_ACTIONTYPES,
  USER_ACTIONTYPES,
  USER_ACTORTYPES,
  MEMBERSHIPS,
  ACTION_INDICATOR_SUPPORTLEVELS,
} from 'themes/config';

import {
  filterEntitiesByAttributes,
  filterEntitiesByKeywords,
  entitiesSetCategoryIds,
  prepareTaxonomies,
  prepareTaxonomiesTags,
} from 'utils/entities';
import { qe } from 'utils/quasi-equals';
import { PARAMS } from './constants';

// used for selectActorsWithPositionsData
export const ACTORS_WITH_POSITIONS_DEPENDENCIES = [
  API.ACTORS,
  API.ACTIONS,
  API.TAXONOMIES,
  API.CATEGORIES,
  API.ACTION_CATEGORIES,
  API.MEMBERSHIPS,
  API.INDICATORS,
  API.ACTION_INDICATORS,
  API.ACTION_ACTIONS,
  API.ACTOR_ACTIONS,
];

// high level state selects
const getRoute = (state) => state.get('route');
const getGlobal = (state) => state.get('global');

// data loading ///////////////////////////////////////////////////////////////

const getGlobalRequested = (state) => state.getIn(['global', 'requested']);

export const selectRequestedAt = createSelector(
  getGlobalRequested,
  (state, { path }) => path,
  (requested, path) => requested.get(path)
);

export const selectReady = (state, { path }) => reduce(asArray(path),
  (areReady, readyPath) => areReady && (
    !!state.getIn(['global', 'ready', readyPath])
    || Object.values(API).indexOf(readyPath) === -1
  ),
  true);


// ui states ///////////////////////////////////////////////////////////////////

export const selectNewEntityModal = createSelector(
  getGlobal,
  (globalState) => globalState.get('newEntityModal')
);
export const selectListPreviewContent = createSelector(
  getGlobal,
  (globalState) => globalState.get('listPreviewContent')
);

// users and user authentication ///////////////////////////////////////////////

export const selectIsAuthenticating = createSelector(
  getGlobal,
  (globalState) => globalState.getIn(['auth', 'sending'])
);

export const selectAuthError = createSelector(
  getGlobal,
  (globalState) => globalState.getIn(['auth', 'error'])
);

const selectReadyUserRoles = (state) => !!state.getIn(['global', 'ready', 'user_roles']);

export const selectReadyForAuthCheck = createSelector(
  selectIsAuthenticating,
  selectReadyUserRoles,
  (isAuthenticating, rolesReady) => !isAuthenticating && rolesReady
);

export const selectSessionUser = createSelector(
  getGlobal,
  (state) => state.get('user')
);

export const selectIsSignedIn = createSelector(
  selectSessionUser,
  (sessionUser) => sessionUser && sessionUser.get('isSignedIn')
);

export const selectSessionUserAttributes = createSelector(
  selectSessionUser,
  (sessionUser) => sessionUser && sessionUser.get('attributes')
);

export const selectSessionUserId = createSelector(
  selectSessionUserAttributes,
  (sessionUserAttributes) => sessionUserAttributes && sessionUserAttributes.id.toString()
);

export const selectIsSigningIn = createSelector(
  selectIsSignedIn,
  selectSessionUserAttributes,
  (signedIn, user) => signedIn && !user
);

// const makeSessionUserRoles = () => selectSessionUserRoles;
export const selectSessionUserRoles = createSelector(
  (state) => state,
  selectIsSignedIn,
  selectSessionUserId,
  (state) => selectEntities(state, API.USER_ROLES),
  (state, isSignedIn, sessionUserId, userRoles) => isSignedIn && sessionUserId && userRoles && userRoles.size > 0
    ? userRoles.toList().filter(
      (userRoleConnection) => qe(userRoleConnection.getIn(['attributes', 'user_id']), sessionUserId)
    ).map(
      (userRoleConnection) => userRoleConnection.getIn(['attributes', 'role_id'])
    )
    : List()
);

// admins require the admin role
export const selectIsUserAdmin = createSelector(
  selectSessionUserRoles,
  (userRoles) => userRoles.includes(USER_ROLES.ADMIN.value)
);

// admins also have coordinator privileges
export const selectIsUserCoordinator = createSelector(
  selectSessionUserRoles,
  (userRoles) => userRoles.includes(USER_ROLES.COORDINATOR.value)
    || userRoles.includes(USER_ROLES.ADMIN.value)
);
// admins and coordinators also have member privileges
export const selectIsUserMember = createSelector(
  selectSessionUserRoles,
  (userRoles) => userRoles.includes(USER_ROLES.MEMBER.value)
    || userRoles.includes(USER_ROLES.COORDINATOR.value)
    || userRoles.includes(USER_ROLES.ADMIN.value)
);
// admins, coordinators and members also have visitor privileges
export const selectIsUserVisitor = createSelector(
  selectSessionUserRoles,
  (userRoles) => userRoles.includes(USER_ROLES.VISITOR.value)
    || userRoles.includes(USER_ROLES.MEMBER.value)
    || userRoles.includes(USER_ROLES.COORDINATOR.value)
    || userRoles.includes(USER_ROLES.ADMIN.value)
);

export const selectHasUserRole = createSelector(
  selectIsUserAdmin,
  selectIsUserCoordinator,
  selectIsUserMember,
  selectIsUserVisitor,
  (isAdmin, isCoordinator, isMember, isVisitor) => ({
    [USER_ROLES.ADMIN.value]: isAdmin,
    [USER_ROLES.COORDINATOR.value]: isCoordinator,
    [USER_ROLES.MEMBER.value]: isMember,
    [USER_ROLES.VISITOR.value]: isVisitor,
  })
);

export const selectSessionUserHighestRoleId = createSelector(
  selectSessionUserRoles,
  (userRoles) => {
    if (userRoles.includes(USER_ROLES.ADMIN.value)) {
      return USER_ROLES.ADMIN.value;
    }
    if (userRoles.includes(USER_ROLES.COORDINATOR.value)) {
      return USER_ROLES.COORDINATOR.value;
    }
    if (userRoles.includes(USER_ROLES.MEMBER.value)) {
      return USER_ROLES.MEMBER.value;
    }
    if (userRoles.includes(USER_ROLES.VISITOR.value)) {
      return USER_ROLES.VISITOR.value;
    }
    return USER_ROLES.DEFAULT.value;
  }
);


// location and queries ////////////////////////////////////////////////////////

// makeSelectLocationState expects a plain JS object for the routing state
export const makeSelectLocationState = () => {
  let prevRoutingState;
  let prevRoutingStateJS;

  return (state) => {
    const routingState = state.get('route'); // or state.route

    if (!routingState.equals(prevRoutingState)) {
      prevRoutingState = routingState;
      prevRoutingStateJS = routingState.toJS();
    }

    return prevRoutingStateJS;
  };
};

export const selectCurrentPathname = createSelector(
  getRoute,
  (routeState) => {
    try {
      return routeState.getIn(['locationBeforeTransitions', 'pathname']);
    } catch (error) {
      return null;
    }
  }
);

export const selectRedirectOnAuthSuccessPath = createSelector(
  getRoute,
  (routeState) => {
    try {
      return routeState.getIn([
        'locationBeforeTransitions',
        'query',
        PARAMS.REDIRECT_ON_AUTH_SUCCESS,
      ]);
    } catch (error) {
      return null;
    }
  }
);
export const selectRedirectOnAuthSuccessSearch = createSelector(
  getRoute,
  (routeState) => {
    try {
      return routeState.getIn([
        'locationBeforeTransitions',
        'query',
        PARAMS.REDIRECT_ON_AUTH_SUCCESS_QUERY,
      ]);
    } catch (error) {
      return null;
    }
  }
);

export const selectQueryMessages = createSelector(
  getRoute,
  (routeState) => {
    try {
      return ({
        info: routeState.getIn(['locationBeforeTransitions', 'query', 'info']),
        warning: routeState.getIn(['locationBeforeTransitions', 'query', 'warning']),
        error: routeState.getIn(['locationBeforeTransitions', 'query', 'error']),
        infotype: routeState.getIn(['locationBeforeTransitions', 'query', 'infotype']),
      });
    } catch (error) {
      return null;
    }
  }
);

export const selectPreviousPathname = createSelector(
  getRoute,
  (routeState) => {
    try {
      return routeState.getIn(['locationBeforeTransitions', 'pathnamePrevious']);
    } catch (error) {
      return null;
    }
  }
);

export const selectHasBack = createSelector(
  selectCurrentPathname,
  selectPreviousPathname,
  (currentPath, previousPath) => {
    const isPreviousValid = previousPath.indexOf('/edit') > -1
      || previousPath.indexOf('/new') > -1;
    return !isPreviousValid && previousPath && (previousPath !== currentPath);
  }
);

export const selectLocation = createSelector(
  getRoute,
  (routeState) => {
    try {
      return routeState.get('locationBeforeTransitions');
    } catch (error) {
      return null;
    }
  }
);
export const selectLocationKey = createSelector(
  getRoute,
  (routeState) => {
    try {
      return routeState.getIn(['locationBeforeTransitions', 'key']);
    } catch (error) {
      return null;
    }
  }
);

export const selectLocationQuery = createSelector(
  selectLocation,
  (location) => location && location.get('query')
);
export const selectSavedQuery = createSelector(
  (state, path) => path,
  selectLocation,
  (path, location) => location && location.getIn(['queriesForPath', path])
);
export const selectHiddenColumns = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('xcol') && asList(locationQuery.get('xcol'))
);

export const selectStepQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('step')
);

// filter queries //////////////////////////////////////////////////////////////

const selectWhereQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('where')
);
export const selectAttributeQuery = createSelector(
  selectWhereQuery,
  (whereQuery) => whereQuery && asList(whereQuery).reduce(
    (memo, where) => {
      const attrValue = where.split(':');
      return Object.assign(memo, { [attrValue[0]]: attrValue[1] });
    },
    {},
  )
);
const selectConnectionWhereQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('xwhere')
);
export const selectConnectionAttributeQuery = createSelector(
  selectConnectionWhereQuery,
  (whereQuery) => whereQuery && asList(whereQuery).reduce(
    (memo, where) => {
      const [attr, value] = where.split(':');
      // store as array not object, as query can include multiple values for same attribute
      const res = [
        ...memo,
        { [attr]: value },
      ];
      return res;
    },
    [],
  )
);

export const selectWithoutQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('without')
);
export const selectAnyQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('any')
);
export const selectCategoryQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('cat')
);
export const selectConnectionQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('connected')
);
export const selectActionQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('action')
);
export const selectActorQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('actor')
);
export const selectRoleQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('role')
);
export const selectParentsQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('by-parent')
);
export const selectChildrenQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('by-child')
);
export const selectMemberQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('by-member')
);
export const selectAssociationQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('by-association')
);
export const selectAssociationTypeQuery = createSelector(
  (state, { typeId }) => typeId,
  selectLocationQuery,
  (typeId, locationQuery) => locationQuery && locationQuery.get(`by-association-${typeId}`)
);
export const selectConnectedCategoryQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('catx')
);
export const selectResourceQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('resources')
);
export const selectUserQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('users')
);
export const selectIndicatorQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('indicators')
);

export const selectSearchQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('search')
);
export const selectActortypeListQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('actortypex')
);
export const selectActiontypeListQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('actiontypex')
);
export const selectSortOrderQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('order')
);
export const selectSortByQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('sort')
);
export const selectPageItemsQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('items')
);
export const selectPageNoQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('page')
);

export const selectActortypeQuery = createSelector(
  selectLocationQuery,
  (query) => (query && query.get('actortype'))
    ? query.get('actortype')
    : DEFAULT_ACTORTYPE
);
export const selectActiontypeQuery = createSelector(
  selectLocationQuery,
  (query) => (query && query.get('actiontype'))
    ? query.get('actiontype')
    : DEFAULT_ACTIONTYPE
);

export const selectViewQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && (locationQuery.get('view') || 'list')
);
export const selectSubjectQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && (locationQuery.get('subj'))
);
export const selectMapSubjectQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && (locationQuery.get('msubj'))
);
export const selectIncludeActorMembers = createSelector(
  selectLocationQuery,
  (locationQuery) => {
    if (locationQuery && locationQuery.get('am')) {
      return qe(locationQuery.get('am'), 1) || locationQuery.get('am') === 'true';
    }
    return true; // default
  }
);
export const selectIncludeActorChildren = createSelector(
  selectLocationQuery,
  (locationQuery) => {
    if (locationQuery && locationQuery.get('ach')) {
      return qe(locationQuery.get('ach'), 1) || locationQuery.get('ach') === 'true';
    }
    return true; // default
  }
);
export const selectIncludeActorChildrenOnMap = createSelector(
  selectLocationQuery,
  (locationQuery) => {
    if (locationQuery && locationQuery.get('achmap')) {
      return qe(locationQuery.get('achmap'), 1) || locationQuery.get('achmap') === 'true';
    }
    return true; // default
  }
);
export const selectIncludeActorChildrenMembersOnMap = createSelector(
  selectLocationQuery,
  (locationQuery) => {
    if (locationQuery && locationQuery.get('achmmap')) {
      return qe(locationQuery.get('achmmap'), 1) || locationQuery.get('achmmap') === 'true';
    }
    return true; // default
  }
);
export const selectIncludeMembersForFiltering = createSelector(
  selectLocationQuery,
  (locationQuery) => {
    if (locationQuery && locationQuery.get('fm')) {
      return qe(locationQuery.get('fm'), 1) || locationQuery.get('fm') === 'true';
    }
    return true; // default
  }
);

// true if
// - ?inofficial=true or
// - not ?where=is_official:true or
// - ?where=is_official:false
export const selectIncludeInofficialStatements = createSelector(
  selectLocationQuery,
  selectAttributeQuery,
  (locationQuery, attributeQuery) => {
    if (locationQuery && locationQuery.get('inofficial')) {
      return qe(locationQuery.get('inofficial'), 1) || locationQuery.get('inofficial') === 'true';
    }
    if (attributeQuery && typeof attributeQuery.is_official !== 'undefined') {
      return attributeQuery.is_official !== 'true';
    }
    return true; // default
  }
);
export const selectIncludeUnpublishedAPIStatements = createSelector(
  selectLocationQuery,
  selectAttributeQuery,
  (locationQuery, attributeQuery) => {
    if (locationQuery && locationQuery.get('unpublishedAPI')) {
      return qe(locationQuery.get('unpublishedAPI'), 1) || locationQuery.get('unpublishedAPI') === 'true';
    }
    if (attributeQuery && typeof attributeQuery.public_api !== 'undefined') {
      return !attributeQuery.public_api;
    }
    return true; // default
  }
);
export const selectMapIndicator = createSelector(
  selectLocationQuery,
  (locationQuery) => {
    if (locationQuery && locationQuery.get('topic')) {
      return locationQuery.get('topic');
    }
    return null; // default
  }
);
export const selectSupportQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => {
    if (locationQuery && locationQuery.get('support')) {
      return locationQuery.get('support');
    }
    return null; // default
  }
);
export const selectPreviewQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => {
    if (locationQuery && locationQuery.get('preview')) {
      return locationQuery.get('preview');
    }
    return null; // default
  }
);
export const selectIsPrintView = createSelector(
  getGlobal,
  (state) => !!state.get('printConfig')
);

export const selectPrintConfig = createSelector(
  getGlobal,
  (state) => state.get('printConfig') || null
);
export const selectBlockNavigation = createSelector(
  getGlobal,
  (state) => state.get('blockNavigation') || false
);

// database ////////////////////////////////////////////////////////////////////////

export const selectEntitiesAll = (state) => state.getIn(['global', 'entities']);

export const selectEntities = createSelector(
  selectEntitiesAll,
  (state, path) => path,
  (entities, path) => entities.get(path)
);

// select a single entity by path and id
export const selectEntity = createSelector(
  (state, { path }) => selectEntities(state, path),
  (state, { id }) => id,
  (entities, id) => id && entities && entities.get(id.toString())
);


// actions and activities //////////////////////////////////////////////////////

// all actions
export const selectActions = createSelector(
  (state) => selectEntities(state, API.ACTIONS),
  (entities) => sortEntities(entities, 'asc', 'title', null, false)
);
export const selectAction = createSelector(
  (state, id) => selectEntity(state, { id, path: API.ACTIONS }),
  (entity) => entity
);
// all actors
export const selectActors = createSelector(
  (state) => selectEntities(state, API.ACTORS),
  (entities) => sortEntities(entities, 'asc', 'title', null, false)
);
export const selectPages = createSelector(
  (state) => selectEntities(state, API.PAGES),
  (entities) => sortEntities(entities, 'asc', 'title', null, false)
);
export const selectActor = createSelector(
  (state, id) => selectEntity(state, { id, path: API.ACTORS }),
  (entity) => entity
);
// all resources
export const selectResources = createSelector(
  (state) => selectEntities(state, API.RESOURCES),
  (entities) => sortEntities(entities, 'desc', 'id', null, false)
);
export const selectResource = createSelector(
  (state, id) => selectEntity(state, { id, path: API.RESOURCES }),
  (entity) => entity
);
export const selectIndicators = createSelector(
  (state) => selectEntities(state, API.INDICATORS),
  (indicators) => sortEntities(
    indicators.map((indicator) => {
      const hasChildIndicators = indicators.some(
        (child) => qe(child.getIn(['attributes', 'parent_id']), indicator.get('id'))
      );
      return indicator.setIn(['attributes', 'is_parent'], hasChildIndicators);
    }),
    'asc',
    'referenceThenTitle',
    null,
    false,
  )
);
export const selectIndicator = createSelector(
  (state, id) => selectEntity(state, { id, path: API.INDICATOR }),
  (entity) => entity
);
export const selectUsers = createSelector(
  (state) => selectEntities(state, API.USERS),
  (entities) => sortEntities(entities, 'asc', 'name', null, false)
);
export const selectUser = createSelector(
  (state, id) => selectEntity(state, { id, path: API.USERS }),
  (entity) => entity
);
export const selectActortypes = createSelector(
  (state) => selectEntities(state, API.ACTORTYPES),
  (entities) => entities && entities.sort((a, b) => {
    const configA = ACTORTYPES_CONFIG[a.get('id')];
    const configB = ACTORTYPES_CONFIG[b.get('id')];
    return configA.order < configB.order
      ? -1
      : 1;
  })
);
// all action types
export const selectActiontypes = createSelector(
  (state) => selectEntities(state, API.ACTIONTYPES),
  (entities) => {
    if (!entities) return null;
    const sorted = entities.sort((a, b) => {
      const configA = ACTIONTYPES_CONFIG[a.get('id')];
      const configB = ACTIONTYPES_CONFIG[b.get('id')];
      return configA.order < configB.order ? -1 : 1;
    });
    return sorted;
  }
);

// all resource types
export const selectResourcetypes = createSelector(
  (state) => selectEntities(state, API.RESOURCETYPES),
  (entities) => entities
);
export const selectActortypesForActiontype = createSelector(
  (state, { type }) => type,
  selectActortypes,
  (typeId, actortypes) => {
    if (!actortypes) return null;
    const validActortypeIds = ACTIONTYPE_ACTORTYPES[typeId];
    return actortypes.filter(
      (type) => validActortypeIds && validActortypeIds.indexOf(type.get('id')) > -1
    );
  }
);
export const selectParentActortypesForActiontype = createSelector(
  selectActortypesForActiontype,
  selectActortypes,
  // selectIncludeMembersForFiltering,
  (directActortypes, actortypes) => {
    if (!directActortypes) return null;
    const directActortypeIds = directActortypes.map((type) => type.get('id')).toList().toArray();
    const parentActortypeIds = directActortypeIds.reduce(
      (memo, actortypeId) => {
        const parentIds = MEMBERSHIPS[actortypeId].filter(
          (parentId) => memo.indexOf(parentId) === -1 && directActortypeIds.indexOf(parentId) === -1
        );
        return [
          ...memo,
          ...parentIds,
        ];
      },
      [],
    );
    return actortypes.filter(
      (actortype) => {
        const id = actortype.get('id');
        const isDirect = directActortypeIds.indexOf(id) > -1;
        if (isDirect) {
          return false;
        }
        return isDirect ? false : parentActortypeIds.indexOf(id) > -1;
      }
    ).map(
      (type) => type.set('viaMember', true)
    );
  }
);
export const selectResourcetypesForActiontype = createSelector(
  (state, { type }) => type,
  selectResourcetypes,
  (typeId, types) => {
    if (!types) return null;
    const validTypeIds = ACTIONTYPE_RESOURCETYPES[typeId];
    return types.filter(
      (type) => validTypeIds && validTypeIds.indexOf(type.get('id')) > -1
    );
  }
);

export const selectActiontypesForActortype = createSelector(
  (state, { type }) => type,
  selectActiontypes,
  (typeId, actiontypes) => {
    if (!actiontypes) return null;
    const validActiontypeIds = Object.keys(ACTIONTYPE_ACTORTYPES).filter((actiontypeId) => {
      const actortypeIds = ACTIONTYPE_ACTORTYPES[actiontypeId];
      return actortypeIds && actortypeIds.indexOf(typeId) > -1;
    });
    return actiontypes.filter(
      (type) => validActiontypeIds && validActiontypeIds.indexOf(type.get('id')) > -1
    );
  }
);
export const selectActiontypesForIndicators = createSelector(
  selectActiontypes,
  (actiontypes) => {
    if (!actiontypes) return null;
    return actiontypes.filter(
      (type) => INDICATOR_ACTIONTYPES.indexOf(type.get('id')) > -1
    );
  }
);
export const selectActiontypesForUsers = createSelector(
  selectActiontypes,
  (actiontypes) => {
    if (!actiontypes) return null;
    return actiontypes.filter(
      (type) => USER_ACTIONTYPES.indexOf(type.get('id')) > -1
    );
  }
);
export const selectActortypesForUsers = createSelector(
  selectActiontypes,
  (actiontypes) => {
    if (!actiontypes) return null;
    return actiontypes.filter(
      (type) => USER_ACTORTYPES.indexOf(type.get('id')) > -1
    );
  }
);

export const selectActiontypesForResourcetype = createSelector(
  (state, { type }) => type,
  selectActiontypes,
  (typeId, actiontypes) => {
    if (!actiontypes) return null;
    const validActiontypeIds = Object.keys(ACTIONTYPE_RESOURCETYPES).filter((actiontypeId) => {
      const actortypeIds = ACTIONTYPE_RESOURCETYPES[actiontypeId];
      return actortypeIds && actortypeIds.indexOf(typeId) > -1;
    });
    return actiontypes.filter(
      (type) => validActiontypeIds && validActiontypeIds.indexOf(type.get('id')) > -1
    );
  }
);
export const selectMembertypesForActortype = createSelector(
  (state, { type }) => type,
  selectActortypes,
  (typeId, actortypes) => {
    if (!actortypes) return null;
    const validActortypeIds = Object.keys(MEMBERSHIPS).filter((actortypeId) => {
      const actiontypeIds = MEMBERSHIPS[actortypeId];
      return actiontypeIds && actiontypeIds.indexOf(typeId) > -1;
    });
    return actortypes.filter(
      (type) => validActortypeIds && validActortypeIds.indexOf(type.get('id')) > -1
    );
  }
);

export const selectAssociationtypesForActortype = createSelector(
  (state, { type }) => type,
  selectActortypes,
  (typeId, actortypes) => {
    if (!actortypes) return null;
    const validActortypeIds = MEMBERSHIPS[typeId];
    return actortypes.filter(
      (type) => validActortypeIds && validActortypeIds.indexOf(type.get('id')) > -1
    );
  }
);

export const selectParentAssociationtypesForActortype = createSelector(
  selectAssociationtypesForActortype,
  selectActortypes,
  (directActortypes, actortypes) => {
    if (!directActortypes) return null;
    const directActortypeIds = directActortypes.map((type) => type.get('id')).toList().toArray();
    const parentActortypeIds = directActortypeIds.reduce(
      (memo, actortypeId) => {
        const parentIds = MEMBERSHIPS[actortypeId].filter(
          (parentId) => memo.indexOf(parentId) === -1 && directActortypeIds.indexOf(parentId) === -1
        );
        return [
          ...memo,
          ...parentIds,
        ];
      },
      [],
    );
    return actortypes.filter(
      (actortype) => {
        const id = actortype.get('id');
        const isDirect = directActortypeIds.indexOf(id) > -1;
        if (isDirect) {
          return false;
        }
        return isDirect ? false : parentActortypeIds.indexOf(id) > -1;
      }
    ).map(
      (type) => type.set('viaMember', true)
    );
  }
);
// single action type
export const selectActiontype = createSelector(
  (state) => selectEntities(state, API.ACTIONTYPES),
  (state, id) => id,
  (entities, id) => entities && entities.get(id.toString())
);
// single actor type
export const selectActortype = createSelector(
  (state) => selectEntities(state, API.ACTORTYPES),
  (state, id) => id, // type id
  (entities, id) => entities && entities.get(id.toString())
);
// single resource type
export const selectResourcetype = createSelector(
  (state) => selectEntities(state, API.RESOURCETYPES),
  (state, id) => id, // type id
  (entities, id) => entities && entities.get(id.toString())
);

// TODO check: likely not needed
// export const selectActiveActortypes = createSelector(
//   selectActortypes,
//   selectActortypeQuery,
//   (entities, typeQuery) => {
//     if (
//       entities
//       && entities.size > 1
//       && typeQuery
//       && typeQuery !== 'all'
//     ) {
//       return entities.filter((type) => qe(typeQuery, type.get('id')));
//     }
//     return entities;
//   }
// );
// // TODO check: likely not needed
// export const selectActiveActiontypes = createSelector(
//   selectActiontypes,
//   selectActiontypeQuery,
//   (entities, typeQuery) => {
//     if (
//       entities
//       && entities.size > 1
//       && typeQuery
//       && typeQuery !== 'all'
//     ) {
//       return entities.filter((type) => qe(typeQuery, type.get('id')));
//     }
//     return entities;
//   }
// );
// all actors for a given type id
// export const selectActortypeActors = createSelector(
//   selectActors,
//   (state, args) => args ? args.type : null,
//   (entities, type) => {
//     if (entities && type) {
//       return entities.filter(
//         (actor) => qe(
//           type,
//           actor.getIn(['attributes', 'actortype_id']),
//         )
//       );
//     }
//     return entities;
//   }
// );
export const selectActortypeActors = createCachedSelector(
  selectActors,
  (state, type) => type,
  (entities, type) => {
    if (entities && type) {
      return entities.filter(
        (action) => qe(type, action.getIn(['attributes', 'actortype_id']))
      );
    }
    return entities;
  }
)(
  (state, type) => type || 'all' // Cache key - creates separate memoized instance per type
);
export const selectResourcetypeResources = createSelector(
  selectResources,
  (state, args) => args ? args.type : null,
  (entities, type) => {
    if (entities && type) {
      return entities.filter(
        (actor) => qe(
          type,
          actor.getIn(['attributes', 'resourcetype_id']),
        )
      );
    }
    return entities;
  }
);
// all actions for a given type id
export const selectActiontypeActions = createCachedSelector(
  selectActions,
  (state, type) => type,
  (entities, type) => {
    if (entities && type) {
      return entities.filter(
        (action) => qe(type, action.getIn(['attributes', 'measuretype_id']))
      );
    }
    return entities;
  }
)(
  (state, type) => type || 'all' // Cache key - creates separate memoized instance per type
);

// TODO check: likely not needed
// returns actions not associated or associated with current actortype
// export const selectActortypeActions = createSelector(
//   (state) => selectEntities(state, API.ACTIONS),
//   (entities) => entities
// );
// export const selectActortypeActions = createSelector(
//   (state) => selectEntities(state, API.ACTIONS),
//   selectActortypeQuery,
//   selectActortypeActors,
//   (state) => selectEntities(state, API.ACTOR_ACTIONS), // active
//   selectIsUserMember,
//   (entities, actortype, actors, actorActions, isMember) => {
//     if (entities && actors && actorActions) {
//       if (actortype && actortype !== 'all') {
//         return entities.filter(
//           (action) => {
//             const actorIds = actorActions.filter(
//               (rm) => qe(
//                 rm.getIn(['attributes', 'measure_id']),
//                 action.get('id'),
//               )
//             ).map(
//               (rm) => rm.getIn(['attributes', 'actor_id'])
//             );
//             return (isMember && actorIds.size === 0) || actorIds.some(
//               (id) => !!actors.find(
//                 (actor) => qe(actor.get('id'), id)
//               )
//             );
//           }
//         );
//       }
//       return entities;
//     }
//     return null;
//   }
// );F

// TODO check: likely not needed
export const selectActortypeEntitiesAll = createSelector(
  selectEntitiesAll,
  selectActors,
  selectActions,
  (entities, actors, actions) => entities
    .set('actors', actors)
    .set('actions', actions)
);
// TODO check: likely not needed
export const selectActiontypeEntitiesAll = createSelector(
  selectEntitiesAll,
  selectActors,
  selectActions,
  (entities, actors, actions) => entities
    .set('actors', actors)
    .set('actions', actions)
);

// filtered entities ///////////////////////////////////////////////////////////

// filter entities by attributes, using object
export const selectEntitiesWhere = createSelector(
  (state, { where }) => where,
  (state, { path }) => selectEntities(state, path),
  (query, entities) => query
    ? filterEntitiesByAttributes(entities, query)
    : entities
);

// filter entities by attributes, using locationQuery
const selectEntitiesWhereQuery = createSelector(
  selectAttributeQuery,
  (state, { path }) => selectEntities(state, path),
  (query, entities) => query
    ? filterEntitiesByAttributes(entities, query)
    : entities
);
export const selectEntitiesSearchQuery = createSelector(
  selectEntitiesWhereQuery,
  selectSearchQuery,
  (state, { searchAttributes }) => searchAttributes,
  (entities, query, searchAttributes) => query
    ? filterEntitiesByKeywords(entities, query, searchAttributes)
    : entities // !search
);

// filter entities by attributes, using object
export const selectActorsWhere = createSelector(
  (state, { where }) => where,
  (state, params) => selectActortypeActors(state, params && params.type), // type should be optional
  (query, entities) => query
    ? filterEntitiesByAttributes(entities, query)
    : entities
);

// filter entities by attributes, using locationQuery
export const selectActorsWhereQuery = createSelector(
  selectAttributeQuery,
  (state, params) => selectActortypeActors(state, params && params.type), // type should be optional
  (query, entities) => query
    ? filterEntitiesByAttributes(entities, query)
    : entities
);
// filter entities by attributes, using locationQuery
export const selectPagesWhereQuery = createSelector(
  selectAttributeQuery,
  selectPages, // type should be optional
  (query, entities) => query
    ? filterEntitiesByAttributes(entities, query)
    : entities
);
// filter entities by attributes, using locationQuery
export const selectResourcesWhereQuery = createSelector(
  selectAttributeQuery,
  selectResourcetypeResources, // type should be optional
  (query, entities) => query
    ? filterEntitiesByAttributes(entities, query)
    : entities
);

// TODO: passing of location query likely not needed if selectSearchQuery changed
export const selectActorsSearchQuery = createSelector(
  selectActorsWhereQuery,
  selectSearchQuery,
  (state, { searchAttributes }) => searchAttributes,
  (entities, query, searchAttributes) => query
    ? filterEntitiesByKeywords(entities, query, searchAttributes)
    : entities // !search
);
export const selectResourcesSearchQuery = createSelector(
  selectResourcesWhereQuery,
  selectSearchQuery,
  (state, { searchAttributes }) => searchAttributes,
  (entities, query, searchAttributes) => query
    ? filterEntitiesByKeywords(entities, query, searchAttributes)
    : entities // !search
);

// filter entities by attributes, using object
export const selectActionsWhere = createSelector(
  (state, { where }) => where,
  (state, params) => selectActiontypeActions(state, params && params.type),
  (query, entities) => query
    ? filterEntitiesByAttributes(entities, query)
    : entities
);

// filter entities by attributes, using locationQuery
export const selectActionsWhereQuery = createSelector(
  selectAttributeQuery,
  (state, params) => selectActiontypeActions(state, params && params.type), // type should be optional
  (query, entities) => query
    ? filterEntitiesByAttributes(entities, query)
    : entities
);
export const selectActionsSearchQuery = createSelector(
  selectActionsWhereQuery,
  selectSearchQuery,
  (state, { searchAttributes }) => searchAttributes,
  (entities, query, searchAttributes) => query
    ? filterEntitiesByKeywords(entities, query, searchAttributes)
    : entities // !search
);

// filter entities by attributes, using locationQuery
export const selectIndicatorsWhereQuery = createSelector(
  selectAttributeQuery,
  selectIndicators, // type should be optional
  (query, entities) => query
    ? filterEntitiesByAttributes(entities, query)
    : entities
);

// taxonomies and categories ///////////////////////////////////////////////////

// select all categories
export const selectCategories = createSelector(
  (state) => selectEntities(state, API.CATEGORIES),
  (entities) => entities
);
// select all taxonomies
export const selectTaxonomies = createSelector(
  (state) => selectEntities(state, API.TAXONOMIES),
  (state) => selectEntities(state, API.ACTORTYPE_TAXONOMIES),
  (state) => selectEntities(state, API.ACTIONTYPE_TAXONOMIES),
  (entities, actortypeTaxonomies, actiontypeTaxonomies) => {
    if (entities) {
      // set and check for applicable types
      return (!actortypeTaxonomies && !actiontypeTaxonomies)
        ? entities
        : entities.map((tax) => {
          const actortypeIds = actortypeTaxonomies && actortypeTaxonomies
            .filter((type) => qe(
              type.getIn(['attributes', 'taxonomy_id']),
              tax.get('id'),
            ))
            .map((type) => type.getIn(['attributes', 'actortype_id']));
          const actiontypeIds = actiontypeTaxonomies && actiontypeTaxonomies
            .filter((type) => qe(
              type.getIn(['attributes', 'taxonomy_id']),
              tax.get('id'),
            ))
            .map((type) => type.getIn(['attributes', 'measuretype_id']));

          return tax
            .setIn(['attributes', 'tags_actors'], actortypeIds && actortypeIds.size > 0)
            .setIn(['attributes', 'tags_actions'], actiontypeIds && actiontypeIds.size > 0)
            .set('actortypeIds', actortypeIds.toList())
            .set('actiontypeIds', actiontypeIds.toList());
        });
    }
    return null;
  }
);

// select all taxonomies sorted by priority
export const selectTaxonomiesSorted = createSelector(
  selectTaxonomies,
  (entities) => entities
    && sortEntities(entities, 'asc', 'id', null, false)
);

// select all taxonomies with respective categories
export const selectTaxonomiesWithCategories = createSelector(
  selectTaxonomiesSorted,
  selectCategories,
  (taxonomies, categories) => prepareTaxonomies(
    taxonomies,
    categories,
    false,
  )
);

// all categories for a given taxonomy id
export const selectTaxonomyCategories = createCachedSelector(
  selectCategories,
  (state, taxonomy_id) => taxonomy_id,
  (entities, taxonomy_id) => {
    if (entities && taxonomy_id) {
      return entities.filter(
        (category) => qe(
          taxonomy_id,
          category.getIn(['attributes', 'taxonomy_id']),
        )
      );
    }
    return entities;
  }
)(
  (state, taxonomy_id) => taxonomy_id || 'all' // Cache key
);

// get all actor taxonomies for a given type

// select single taxonomy
export const selectTaxonomy = createSelector(
  (state, id) => id,
  selectTaxonomies,
  (id, entities) => id && entities.get(id.toString())
);
// select single taxonomy
export const selectCategory = createSelector(
  (state, id) => id,
  selectCategories,
  (id, entities) => id && entities.get(id.toString())
);

// get all taxonomies applicable to actors (of any type)
export const selectActorTaxonomies = createSelector(
  selectTaxonomiesSorted,
  (state) => selectEntities(state, API.ACTORTYPE_TAXONOMIES),
  (taxonomies, actortypeTaxonomies) => taxonomies
    && actortypeTaxonomies
    && taxonomies.filter(
      // connected to current actortype
      (tax) => actortypeTaxonomies.some(
        (type) => qe(
          type.getIn(['attributes', 'taxonomy_id']),
          tax.get('id'),
        )
      )
    ).map(
      // TODO check if really needed
      (tax) => {
        // connectedActortypes
        const actortypeIds = actortypeTaxonomies.reduce(
          (memo, type) => {
            if (
              qe(
                type.getIn(['attributes', 'taxonomy_id']),
                tax.get('id')
              )
            ) {
              return memo.push(type.getIn(['attributes', 'actortype_id']));
            }
            return memo;
          },
          List(),
        );
        return tax.set('actortypeIds', actortypeIds);
      }
    )
);

// get all taxonomies applicable to actions
export const selectActionTaxonomies = createSelector(
  selectTaxonomiesSorted,
  (state) => selectEntities(state, API.ACTIONTYPE_TAXONOMIES),
  (taxonomies, actiontypeTaxonomies) => taxonomies
    && actiontypeTaxonomies
    && taxonomies.filter(
      // connected to any actortype
      (tax) => actiontypeTaxonomies.some(
        (type) => qe(
          type.getIn(['attributes', 'taxonomy_id']),
          tax.get('id'),
        )
      )
      // ).map(
      //   (tax) => {
      //     // connectedActortypes
      //     const actiontypeIds = actiontypeTaxonomies.reduce(
      //       (memo, type) => {
      //         if (
      //           qe(
      //             type.getIn(['attributes', 'taxonomy_id']),
      //             tax.get('id')
      //           )
      //         ) {
      //           return memo.push(type.getIn(['attributes', 'actortype_id']));
      //         }
      //         return memo;
      //       },
      //       List(),
      //     );
      //     return tax.set('actiontypeIds', actiontypeIds);
      //   }
    )
);

// get all taxonomies applicable to actor type
export const selectActortypeTaxonomies = createSelector(
  (state, args) => args ? args.type : null,
  selectTaxonomiesSorted,
  (state) => selectEntities(state, API.ACTORTYPE_TAXONOMIES),
  (typeId, taxonomies, actortypeTaxonomies) => typeId
    && taxonomies
    && actortypeTaxonomies
    && taxonomies.filter(
      // connected to current actortype
      (tax) => actortypeTaxonomies.some(
        (type) => qe(
          type.getIn(['attributes', 'taxonomy_id']),
          tax.get('id'),
        ) && qe(
          type.getIn(['attributes', 'actortype_id']),
          typeId,
        )
      )
    ).map(
      // TODO check if needed
      (tax) => {
        // connectedActortypes
        const actortypeIds = actortypeTaxonomies.reduce(
          (memo, type) => {
            if (
              qe(
                type.getIn(['attributes', 'taxonomy_id']),
                tax.get('id')
              )
            ) {
              return memo.push(type.getIn(['attributes', 'actortype_id']));
            }
            return memo;
          },
          List(),
        );
        return tax.set('actortypeIds', actortypeIds);
      }
    )
);

// get all taxonomies applicable to actor type with categories
export const selectActortypeTaxonomiesWithCats = createSelector(
  (state, args) => args ? args.includeParents : true,
  selectActortypeTaxonomies,
  selectCategories,
  (includeParents, taxonomies, categories) => prepareTaxonomies(
    taxonomies,
    categories,
    includeParents,
  )
);

// // get all taxonomies applicable to action type
export const selectActiontypeTaxonomies = createSelector(
  (state, args) => args ? args.type : null,
  selectTaxonomiesSorted,
  (state) => selectEntities(state, API.ACTIONTYPE_TAXONOMIES),
  (typeId, taxonomies, actiontypeTaxonomies) => typeId
    && taxonomies
    && actiontypeTaxonomies
    && taxonomies.filter(
      // connected to current actortype
      (tax) => actiontypeTaxonomies.some(
        (type) => qe(
          type.getIn(['attributes', 'taxonomy_id']),
          tax.get('id'),
        ) && qe(
          type.getIn(['attributes', 'measuretype_id']),
          typeId,
        )
      )
      // ).map(
      //   (tax) => {
      //     // set all actiontypes valid for taxonomy
      //     const actiontypeIds = actiontypeTaxonomies.reduce(
      //       (memo, type) => {
      //         if (
      //           qe(
      //             type.getIn(['attributes', 'taxonomy_id']),
      //             tax.get('id')
      //           )
      //         ) {
      //           return memo.push(type.getIn(['attributes', 'measuretype_id']));
      //         }
      //         return memo;
      //       },
      //       List(),
      //     );
      //     return tax.set('actiontypeIds', actiontypeIds);
      //   }
    )
);

// get all taxonomies applicable to action type with categories
export const selectActiontypeTaxonomiesWithCats = createSelector(
  (state, args) => args ? args.includeParents : true,
  selectActiontypeTaxonomies,
  selectCategories,
  (includeParents, taxonomies, categories) => prepareTaxonomies(
    taxonomies,
    categories,
    includeParents,
  )
);

// get all taxonomies with nested categories
export const selectAllTaxonomiesWithCategories = createSelector(
  selectTaxonomiesSorted,
  selectCategories,
  (taxonomies, categories) => taxonomies && taxonomies.map(
    (tax) => tax.set(
      'categories',
      categories.filter(
        (cat) => qe(
          tax.get('id'),
          cat.getIn(['attributes', 'taxonomy_id']),
        )
      )
    )
  )
);

export const selectUserTaxonomies = createSelector(
  selectTaxonomiesSorted,
  selectCategories,
  (taxonomies, categories) => prepareTaxonomiesTags(
    taxonomies,
    categories,
    'tags_users',
  )
);

// entity joins ///////////////////////////////////////////////////////

export const selectActorActionsForAction = createSelector(
  (state) => selectActorActions(state),
  (state, id) => id,
  (connections, id) => connections && connections
    .filter((connection) => qe(connection.getIn(['attributes', 'measure_id']), id))
    .map((connection) => connection.get('attributes'))
);
export const selectActionIndicatorsForAction = createSelector(
  (state) => selectEntities(state, API.ACTION_INDICATORS),
  (state, id) => id,
  (connections, id) => connections && connections
    .filter((connection) => qe(connection.getIn(['attributes', 'measure_id']), id))
    .map((connection) => connection.get('attributes'))
);

// potential connections ///////////////////////////////////////////////////////

export const selectUserConnections = createSelector(
  (state) => selectEntities(state, API.ROLES),
  selectActions,
  selectActors,
  (roles, actions, actors) => Map()
    .set('roles', roles)
    .set(API.ACTIONS, actions)
    .set(API.ACTORS, actors)
);

export const selectActorConnections = createSelector(
  selectActions,
  selectActors,
  selectUsers,
  (actions, actors, users) => Map()
    .set(API.ACTIONS, actions)
    .set(API.ACTORS, actors)
    .set(API.USERS, users)
);
export const selectResourceConnections = createSelector(
  (state, typeId) => selectActiontypeActions(state, typeId),
  (actions) => Map()
    .set(API.ACTIONS, actions)
);

export const selectIndicatorConnections = createSelector(
  (state, typeId) => selectActiontypeActions(state, typeId),
  (actions) => Map()
    .set(API.ACTIONS, actions)
);

export const selectActionConnections = createSelector(
  selectActors,
  selectActions,
  selectResources,
  selectIndicators,
  selectUsers,
  (actors, actions, resources, indicators, users) => Map()
    .set(API.ACTORS, actors)
    .set(API.ACTIONS, actions)
    .set(API.RESOURCES, resources)
    .set(API.INDICATORS, indicators)
    .set(API.USERS, users)
);

// grouped JOIN tables /////////////////////////////////////////////////////////////////

export const selectActorCategoriesGroupedByActor = createSelector(
  (state) => selectEntities(state, API.ACTOR_CATEGORIES),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'actor_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'category_id'])
      )
    ),
);
export const selectActorCategoriesGroupedByCategory = createSelector(
  (state) => selectEntities(state, API.ACTOR_CATEGORIES),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'category_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'actor_id'])
      )
    )
);

export const selectActorActions = createSelector(
  (state) => selectEntities(state, API.ACTOR_ACTIONS),
  (state) => selectEntities(state, API.ACTION_ACTORS),
  (connections, tempConnections) => {
    if (!connections) return null;
    let mergedConnections = connections;
    if (Object.values(API).indexOf(API.ACTION_ACTORS) > -1) {
      if (!tempConnections) return null;
      mergedConnections = tempConnections.reduce((memo, c) => {
        const id = `-${c.get('id')}`;
        return memo.set(id, c.set('id', id));
      }, connections);
    }
    return mergedConnections;
  }
);
export const selectActorActionsGroupedByActor = createSelector(
  (state) => selectActorActions(state),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'actor_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'measure_id'])
      )
    ),
);
export const selectActorActionsGroupedByAction = createSelector(
  (state) => selectActorActions(state),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'measure_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'actor_id'])
      )
    ),
);
export const selectActorActionsGroupedByActionAttributes = createSelector(
  (state) => selectActorActions(state),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'measure_id'])
    ).map(
      (group) => group.map((entity) => entity.get('attributes'))
    ),
);
export const selectActorActionsGroupedByActorAttributes = createSelector(
  (state) => selectActorActions(state),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'actor_id'])
    ).map(
      (group) => group.map((entity) => entity.get('attributes'))
    ),
);
export const selectActionResourcesGroupedByResource = createSelector(
  (state) => selectEntities(state, API.ACTION_RESOURCES),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'resource_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'measure_id'])
      )
    ),
);
export const selectActionResourcesGroupedByAction = createSelector(
  (state) => selectEntities(state, API.ACTION_RESOURCES),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'measure_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'resource_id'])
      )
    ),
);

export const selectActionIndicatorsGroupedByIndicator = createSelector(
  (state) => selectEntities(state, API.ACTION_INDICATORS),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'indicator_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'measure_id'])
      )
    ),
);
export const selectActionIndicatorsGroupedByIndicatorAttributes = createSelector(
  (state) => selectEntities(state, API.ACTION_INDICATORS),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'indicator_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.get('attributes')
      )
    ),
);
export const selectActionIndicatorsGroupedByAction = createSelector(
  (state) => selectEntities(state, API.ACTION_INDICATORS),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'measure_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'indicator_id'])
      )
    ),
);
export const selectActionIndicatorsGroupedByActionAttributes = createSelector(
  (state) => selectEntities(state, API.ACTION_INDICATORS),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'measure_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.get('attributes')
      )
    ),
);
export const selectUserActionsGroupedByAction = createSelector(
  (state) => selectEntities(state, API.USER_ACTIONS),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'measure_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'user_id'])
      )
    ),
);
export const selectUserActionsGroupedByUser = createSelector(
  (state) => selectEntities(state, API.USER_ACTIONS),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'user_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'measure_id'])
      )
    ),
);
export const selectUserActorsGroupedByActor = createSelector(
  (state) => selectEntities(state, API.USER_ACTORS),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'actor_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'user_id'])
      )
    ),
);
export const selectUserActorsGroupedByUser = createSelector(
  (state) => selectEntities(state, API.USER_ACTORS),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'user_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'actor_id'])
      )
    ),
);

export const selectActionActionsGroupedByTopAction = createSelector(
  (state) => selectEntities(state, API.ACTION_ACTIONS),
  (connections) => {
    if (!connections) return null;
    // measures by measure_id
    return connections.groupBy(
      (entity) => entity.getIn(['attributes', 'measure_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'other_measure_id'])
      )
    );
  },
);
export const selectActionActionsGroupedBySubAction = createSelector(
  (state) => selectEntities(state, API.ACTION_ACTIONS),
  (connections) => {
    if (!connections) return null;
    // measures by measure_id
    return connections.groupBy(
      (entity) => entity.getIn(['attributes', 'other_measure_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'measure_id'])
      )
    );
  },
);
export const selectParentEventsByStatement = createSelector(
  (state) => selectEntities(state, API.ACTION_ACTIONS),
  (state) => selectActiontypeActions(state, ACTIONTYPES.EVENT),
  (state) => selectActiontypeActions(state, ACTIONTYPES.EXPRESS),
  (connections, events, statements) => {
    if (!connections || !events || !statements) return null;
    return connections.filter(
      (connection) => statements.has(`${connection.getIn(['attributes', 'measure_id'])}`)
      && events.has(`${connection.getIn(['attributes', 'other_measure_id'])}`)
    ).groupBy(
      (connection) => connection.getIn(['attributes', 'measure_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'other_measure_id'])
      )
    );
  },
);
export const selectMembershipsGroupedByMember = createSelector(
  (state) => selectEntities(state, API.MEMBERSHIPS),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'member_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'memberof_id'])
      )
    ),
);
export const selectMembershipParentsGroupedByMember = createSelector(
  selectMembershipsGroupedByMember,
  (memberships) => memberships && memberships.map(
    (actors) => actors.reduce((memo, actorId) => {
      if (memberships.get(actorId)) {
        return memo.concat(memberships.get(actorId));
      }
      return memo;
    }, Map()),
  ),
);

export const selectMembershipsGroupedByParent = createSelector(
  (state) => selectEntities(state, API.MEMBERSHIPS),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'memberof_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'member_id'])
      )
    ),
);

export const selectActorActionsMembersGroupedByAction = createSelector(
  selectActorActionsGroupedByAction,
  selectMembershipsGroupedByParent,
  (entities, memberships) => entities && memberships && entities.map(
    (actors) => actors.reduce((memo, actorId) => {
      if (memberships.get(actorId)) {
        return memo.concat(memberships.get(actorId));
      }
      return memo;
    }, Map())
  )
);
export const selectActorActionsAssociationsGroupedByAction = createSelector(
  selectActorActionsGroupedByAction,
  selectMembershipsGroupedByMember,
  (entities, memberships) => entities && memberships && entities.map(
    (actors) => actors.reduce((memo, actorId) => {
      if (memberships.get(actorId)) {
        return memo.concat(memberships.get(actorId));
      }
      return memo;
    }, Map())
  )
);

export const selectActionCategoriesGroupedByAction = createSelector(
  (state) => selectEntities(state, API.ACTION_CATEGORIES),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'measure_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'category_id'])
      )
    ),
);
export const selectActionCategoriesGroupedByCategory = createSelector(
  (state) => selectEntities(state, API.ACTION_CATEGORIES),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'category_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'measure_id'])
      )
    ),
);
export const selectUserCategoriesGroupedByUser = createSelector(
  (state) => selectEntities(state, API.USER_CATEGORIES),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'user_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'category_id'])
      )
    ),
);

// TABLES with nested ids /////////////////////////////////////////////////////////////
// get actors with category ids
export const selectActorsCategorised = createSelector(
  (state, params) => selectActortypeActors(state, params && params.type),
  selectActorCategoriesGroupedByActor,
  (entities, associationsGrouped) => entitiesSetCategoryIds(
    entities,
    associationsGrouped,
  )
);
// get actions with category ids
export const selectActionsCategorised = createSelector(
  selectActiontypeActions,
  selectActionCategoriesGroupedByAction,
  (entities, associationsGrouped) => entitiesSetCategoryIds(
    entities,
    associationsGrouped,
  )
);

// TODO: check, likely obsolete
export const selectViewActorActortypeId = createSelector(
  (state, id) => selectEntity(state, { path: API.ACTORS, id }),
  selectCurrentPathname,
  (entity, pathname) => {
    if (
      pathname.startsWith(ROUTES.ACTORS)
      && entity
      && entity.getIn(['attributes', 'actortype_id'])
    ) {
      return entity.getIn(['attributes', 'actortype_id']).toString();
    }
    return null;
  }
);

const filterStatements = (
  statements,
  statementId,
  includeInofficial,
  includeUnpublishedAPI = true,
  actionCategoriesByAction,
  connectedCategoryQuery,
) => {
  let pass = true;
  const statement = statements.get(statementId.toString());
  if (!statement) {
    return false;
  }
  if (!includeInofficial) {
    pass = statement.getIn(['attributes', 'is_official']);
  }
  if (!includeUnpublishedAPI) {
    pass = statement.getIn(['attributes', 'public_api']);
  }
  const statementCategories = actionCategoriesByAction.get(parseInt(statementId, 10));
  if (pass && connectedCategoryQuery) {
    pass = asList(connectedCategoryQuery).every(
      (queryArg) => {
        const [path, value] = queryArg
          ? queryArg.split(':')
          : [null, null];
        if (path !== API.ACTIONS || !value) {
          return true;
        }
        return statementCategories && statementCategories.includes(parseInt(value, 10));
      },
    );
  }
  return pass;
};
const getAggregateSupport = (aggregateCounts, childCount) => {
  if (!aggregateCounts) return 0;
  const supportCount = (aggregateCounts.get(1) || 0) + (aggregateCounts.get(2) || 0);
  // country has strong support for all topics
  if (aggregateCounts.get(1) === childCount) return 1;
  // country has some support for all topics
  if (supportCount === childCount) return 2;
  // country has some support for any topic
  if (supportCount > 0) return 3;
  return 0;
};
const addAggregatePositions = ({
  indicators,
  indicatorPositions,
}) => {
  const childIndicatorsByParent = indicators
    .filter((indicator) => indicator.getIn(['attributes', 'parent_id']))
    .groupBy((indicator) => indicator.getIn(['attributes', 'parent_id']));

  if (childIndicatorsByParent && childIndicatorsByParent.size > 0) {
    const parentsIndicatorPositions = childIndicatorsByParent.map((children, parentId) => {
      const aggregateCountSupport = children.reduce((memo, child) => {
        const childPositions = indicatorPositions && indicatorPositions.get(child.get('id'));
        const childPositionCurrent = childPositions && childPositions.first();
        const childSupport = childPositionCurrent && childPositionCurrent.get('supportlevel_id');
        if (typeof childSupport !== 'undefined') {
          if (memo.has(childSupport)) {
            return memo.set(childSupport, memo.get(childSupport) + 1);
          }
          return memo.set(childSupport, 1);
        }
        return memo;
      }, Map());
      const aggregateSupport = getAggregateSupport(aggregateCountSupport, children.size);

      if (typeof aggregateSupport !== 'undefined') {
        return List().push(
          Map({
            indicator_id: parentId,
            supportlevel_id: aggregateSupport,
            is_parent: true,
          }).set(
            'child_ids', children.map((child) => child.get('id'))
          ).set(
            'supportCount', aggregateCountSupport
          )
        );
      }
      return List();
    });
    return indicatorPositions.merge(parentsIndicatorPositions.mapKeys((key) => String(key)));
  }
  return indicatorPositions;
};

const getActorStatementsAndPositions = ({
  actor,
  actors,
  indicators,
  statements,
  groupActors,
  actorActions,
  actionIndicators,
  memberships,
  actionCategoriesByAction,
  includeMembers,
  includeInofficial,
  includeUnpublishedAPI,
  connectedCategoryQuery,
  eventsByStatement,
}) => {
  // console.log('getActorStatementsAndPositions');
  // 1. figure out any actor statements /////////////////////////////////////
  // actorActions
  let actorIndicatorPositions;
  let actorStatementsAsMemberByGroup = List();
  // direct
  let actorStatements = actorActions.get(parseInt(actor.get('id'), 10));
  if (actorStatements) {
    actorStatements = actorStatements
      .filter((statementId) => filterStatements(
        statements,
        statementId,
        includeInofficial,
        includeUnpublishedAPI,
        actionCategoriesByAction,
        asList(connectedCategoryQuery),
      ))
      .toList();
  }
  // indirect via group
  // if actor can belong to a "group"
  const hasGroups = MEMBERSHIPS[actor.getIn(['attributes', 'actortype_id'])]
    && MEMBERSHIPS[actor.getIn(['attributes', 'actortype_id'])].length > 0;
  if (includeMembers && hasGroups) {
    const actorMemberships = memberships.get(parseInt(actor.get('id'), 10));
    if (actorMemberships) {
      actorStatementsAsMemberByGroup = actorMemberships.reduce(
        (memo, groupId) => {
          if (groupActors.get(groupId.toString()) && actorActions && actorActions.get(groupId)) {
            // for contacts we should only include statements/positions from "groups" and not countries or orgs they may belong to
            if (
              qe(actor.getIn(['attributes', 'actortype_id']), ACTORTYPES.CONTACT)
              && !qe(groupActors.get(groupId.toString()).getIn(['attributes', 'actortype_id']), ACTORTYPES.GROUP)
            ) {
              return memo;
            }
            return memo.set(
              groupId,
              actorActions
                .get(groupId)
                .filter((statementId) => filterStatements(
                  statements,
                  statementId,
                  includeInofficial,
                  includeUnpublishedAPI,
                  actionCategoriesByAction,
                  asList(connectedCategoryQuery),
                ))
                .toList()
            );
          }
          return memo;
        },
        Map(),
      );
    }
  }

  // 2. figure out actor positions on all indicators/topics
  if (
    (actorStatements && actorStatements.size > 0)
    || (actorStatementsAsMemberByGroup && actorStatementsAsMemberByGroup.size > 0)
  ) {
    // now for each indicator
    actorIndicatorPositions = indicators.filter(
      // excluding parents/aggregates
      (indicator) => !indicators.some((i) => qe(indicator.get('id'), i.getIn(['attributes', 'parent_id'])))
    ).map(
      (indicator) => {
        // get all statements for topic
        let indicatorStatements = actionIndicators.get(parseInt(indicator.get('id'), 10));
        if (indicatorStatements) {
          // filter for current actor
          indicatorStatements = indicatorStatements.reduce(
            (memo, indicatorStatement, id) => {
              const statementId = indicatorStatement.get('measure_id');
              const hasDirectStatement = actorStatements && actorStatements.includes(parseInt(statementId, 10));
              const groupsWithStatement = actorStatementsAsMemberByGroup
                && actorStatementsAsMemberByGroup.filter(
                  (ids) => ids.includes(parseInt(statementId, 10))
                );
              if (hasDirectStatement || (groupsWithStatement && groupsWithStatement.size > 0)) {
                const statement = statements.get(statementId.toString());
                let result = statement
                  ? indicatorStatement.set(
                    'measure',
                    statement.get('attributes').set('id', statement.get('id')),
                  )
                  : indicatorStatement;
                // result = result.set('authority', statement.getIn(['attributes', 'is_official']));
                if (!hasDirectStatement && groupsWithStatement && groupsWithStatement.size > 0) {
                  result = result.set(
                    'viaGroupIds',
                    groupsWithStatement.keySeq()
                  ).set(
                    'viaGroups',
                    groupsWithStatement.keySeq().map(
                      (groupId) => actors.get(groupId.toString())
                    )
                  );
                }
                return memo.set(id, result);
              }
              return memo;
            },
            Map(),
          ).sort(
            // sort:
            // first check for event and group statements,
            // then dates
            // then use higher level of suuport
            (a, b) => {
              const aEventId = eventsByStatement.get(a.get('measure_id'))
                && eventsByStatement.get(a.get('measure_id')).first();
              const bEventId = eventsByStatement.get(b.get('measure_id'))
                && eventsByStatement.get(b.get('measure_id')).first();

              // If both statements are from the same event
              if (aEventId && bEventId && aEventId === bEventId) {
                // Individual statements (no viaGroups) come before group statements
                if (!a.get('viaGroups') && !!b.get('viaGroups')) {
                  return -1;
                }
                if (!!a.get('viaGroups') && !b.get('viaGroups')) {
                  return 1;
                }
              }
              let aDate = a.getIn(['measure', 'date_start']);
              let bDate = b.getIn(['measure', 'date_start']);
              /* eslint-disable no-restricted-globals */
              let aIsDate = aDate && isDate(aDate);
              let bIsDate = bDate && isDate(bDate);
              if (!aIsDate) {
                aDate = a.getIn(['measure', 'created_at']);
                aIsDate = new Date(aDate) instanceof Date && !isNaN(new Date(aDate));
              }
              if (!bIsDate) {
                bDate = b.getIn(['measure', 'created_at']);
                bIsDate = new Date(bDate) instanceof Date && !isNaN(new Date(bDate));
              }
              /* eslint-enable no-restricted-globals */
              if (aIsDate && bIsDate) {
                const aDateOnly = new Date(new Date(aDate).toDateString()).getTime();
                const bDateOnly = new Date(new Date(bDate).toDateString()).getTime();
                // check for support level if dates equals
                if (aDateOnly === bDateOnly) {
                  // if (a) {
                  //   console.log(aDate, a.get('supportlevel_id'), a.getIn(['measure', 'code']))
                  //   console.log(bDate, b.get('supportlevel_id'), b.getIn(['measure', 'code']))
                  // }
                  const aSupportLevel = ACTION_INDICATOR_SUPPORTLEVELS[a.get('supportlevel_id') || 0];
                  const bSupportLevel = ACTION_INDICATOR_SUPPORTLEVELS[b.get('supportlevel_id') || 0];
                  return aSupportLevel.order < bSupportLevel.order ? -1 : 1;
                }
                return aDateOnly < bDateOnly ? 1 : -1;
              }
              if (aIsDate) {
                return -1;
              }
              if (bIsDate) {
                return 1;
              }
              return 1;
            }
          ).toList();
          return indicatorStatements || null;
        }
        return null;
      },
    );
    // combine direct and indirect statements
    if (actorStatementsAsMemberByGroup) {
      actorStatements = actorStatements
        ? actorStatements.concat(actorStatementsAsMemberByGroup.flatten(true).toList()).toSet()
        : actorStatementsAsMemberByGroup.flatten(true).toList().toSet();
    }
    // figure out aggrgate positions (count support for child indicators)
    actorIndicatorPositions = addAggregatePositions({
      indicators,
      indicatorPositions: actorIndicatorPositions,
    });
    return actor
      .set('statements', actorStatements)
      .set('statementsAsGroup', actorStatementsAsMemberByGroup && actorStatementsAsMemberByGroup.flatten(true).toList().toSet())
      .set('indicatorPositions', actorIndicatorPositions)
      .set('indicators', actorIndicatorPositions && actorIndicatorPositions.reduce(
        (memo, indicatorPosition, key) => {
          if (indicatorPosition && indicatorPosition.size > 0) {
            return memo.set(key, key);
          }
          return memo;
        },
        Map(),
      ));
  }
  return actor;
};

const selectGroupActors = createSelector(
  (state) => selectActors(state),
  (actors) => {
    if (!actors) return null;
    const groupActorTypes = Object.values(MEMBERSHIPS).reduce(
      (memo, actorGroups) => [...memo, ...actorGroups],
      [],
    );
    return actors.filter(
      (actor) => groupActorTypes.indexOf(
        actor.getIn(['attributes', 'actortype_id']).toString()
      ) > -1
    );
  }
);

export const selectActorsWithPositionsData = createSelector(
  (state) => selectReady(state, { path: ACTORS_WITH_POSITIONS_DEPENDENCIES }),
  // from param
  (state, params) => params && params.includeActorMembers,
  (state, params) => params && params.includeInofficial,
  (state, params) => params && params.includeUnpublishedAPI,
  (state, params) => params && params.type,
  // from query
  selectIncludeInofficialStatements,
  selectIncludeUnpublishedAPIStatements,
  selectIncludeActorMembers,
  selectConnectedCategoryQuery,
  // from state
  (state) => selectActors(state),
  (state, params) => selectActortypeActors(state, params && params.type),
  (state) => selectActiontypeActions(state, ACTIONTYPES.EXPRESS),
  selectActionCategoriesGroupedByAction,
  selectMembershipsGroupedByMember,
  selectActorActionsGroupedByActor,
  selectIndicators,
  selectActionIndicatorsGroupedByIndicatorAttributes,
  selectParentEventsByStatement,
  selectGroupActors,
  (
    ready,
    includeActorMembersParam,
    includeInofficialParam,
    includeUnpublishedAPIParam,
    actortypeId,
    includeInofficialQuery,
    includeUnpublishedAPIQuery,
    includeActorMembersQuery,
    connectedCategoryQuery,
    actors,
    typeActors,
    statements,
    actionCategoriesByAction,
    memberships,
    actorActions,
    indicators,
    actionIndicators,
    eventsByStatement, // { [statement_id] : { [connection_id] : event_id } }
    groupActors,
  ) => {
    if (
      !ready
      || !actors
      || !typeActors
      || !statements
      || !actionCategoriesByAction
      || !memberships
      || !actorActions
      || !indicators
      || !actionIndicators
      || !eventsByStatement
      || !groupActors
    ) {
      return null;
    }
    // use query unless param set
    let includeInofficial = true;
    if (typeof includeInofficialParam !== 'undefined') {
      includeInofficial = includeInofficialParam;
    } else if (typeof includeInofficialQuery !== 'undefined') {
      includeInofficial = includeInofficialQuery;
    }
    let includeUnpublishedAPI = true;
    if (typeof includeUnpublishedAPIParam !== 'undefined') {
      includeUnpublishedAPI = includeUnpublishedAPIParam;
    } else if (typeof includeUnpublishedAPIQuery !== 'undefined') {
      includeUnpublishedAPI = includeUnpublishedAPIQuery;
    }
    let includeMembers = true;
    if (typeof includeActorMembersParam !== 'undefined') {
      includeMembers = includeActorMembersParam;
    } else if (typeof includeActorMembersQuery !== 'undefined') {
      includeMembers = includeActorMembersQuery;
    }

    return {
      typeActors,
      actors,
      indicators,
      statements,
      groupActors,
      actorActions,
      actionIndicators,
      memberships,
      actionCategoriesByAction,
      includeMembers,
      includeInofficial,
      includeUnpublishedAPI,
      connectedCategoryQuery,
      eventsByStatement,
    };
  }
);

export const selectActorsWithPositions = createSelector(
  selectActorsWithPositionsData,
  (data) => {
    if (!data) return null;
    const result = data.typeActors.map(
      (actor) => getActorStatementsAndPositions({
        actor,
        ...data,
      }),
    );
    return result;
  }
);

export const selectActorWithPositions = createSelector(
  selectActorsWithPositionsData,
  (state, { id }) => id,
  (data, actorId) => {
    if (!data || !actorId) return null;
    const actor = data.actors.get(actorId);
    if (!actor) return null;

    const result = getActorStatementsAndPositions({
      actor,
      ...data,
    });
    return result;
  }
);

export const selectActorsByType = createSelector(
  selectActors,
  (actors) => actors && actors.groupBy((actor) => actor.getIn(['attributes', 'actortype_id']))
);

export const selectIsCurrentActionStatement = createSelector(
  (state, id) => id,
  selectLocation,
  selectAction,
  (id, location, action) => {
    if (
      action // we have an action for the id
      && location.get('pathname').startsWith(`${ROUTES.ACTION}/`) // we are lookking at a single action
      && qe(action.getIn(['attributes', 'measuretype_id']), ACTIONTYPES.EXPRESS) // actiontype is statement
    ) {
      return true;
    }
    return false;
  }
);
