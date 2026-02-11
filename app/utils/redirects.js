import { PARAMS } from 'containers/App/constants';
import { USER_ROLES, ROUTES } from 'themes/config';
import { reduce } from 'lodash/collection';
import {
  selectIsSignedIn,
  selectSessionUserRoles,
  selectReadyForAuthCheck,
  selectSavedQuery,
} from 'containers/App/selectors';

import checkStore from './checkStore';

export const getNextQueryString = (queryNext) => reduce(queryNext, (result, value, key) => {
  let params;
  if (Array.isArray(value)) {
    params = value.reduce((memo, val) => `${memo}${memo.length > 0 ? '&' : ''}${key}=${encodeURIComponent(val)}`, '');
  } else {
    params = `${key}=${encodeURIComponent(value)}`;
  }
  return `${result}${result.length > 0 ? '&' : ''}${params}`;
}, '');

export function replaceIfNotSignedIn(location, replace, info = PARAMS.NOT_SIGNED_IN, replacePath) {
  const redirectOnAuthSuccess = location.pathname;
  const redirectOnAuthSuccessSearch = location.search;
  return replacePath
    ? replace(replacePath)
    : replace({ pathname: ROUTES.LOGIN, query: { redirectOnAuthSuccess, info, redirectOnAuthSuccessSearch } });
}

export function replaceUnauthorised(replace, replacePath) {
  return replace(replacePath || ROUTES.UNAUTHORISED);
}

export function replaceAlreadySignedIn(replace, info = PARAMS.ALREADY_SIGNED_IN) {
  return replace({ pathname: ROUTES.POSITIONS, query: { info } });
}

export function hasRoleRequired(roleIds, roleRequired) {
  return roleIds.includes(roleRequired)
  || (roleRequired === USER_ROLES.MEMBER.value && roleIds.includes(USER_ROLES.ADMIN.value))
  || (roleRequired === USER_ROLES.VISITOR.value && (roleIds.includes(USER_ROLES.MEMBER.value) || roleIds.includes(USER_ROLES.ADMIN.value)));
}

function redirectIfSignedIn(store, replacePath) {
  return (nextState, replace) => {
    // console.log('redirectIfSignedIn', replacePath, selectIsSignedIn(store.getState()));
    if (selectIsSignedIn(store.getState())) {
      if (replacePath) {
        const savedQuery = selectSavedQuery(store.getState(), replacePath);
        if (savedQuery && savedQuery.size > 0) {
          replace(`${replacePath}?${getNextQueryString(savedQuery.toJS())}`);
        } else {
          replace(replacePath);
        }
      } else {
        replaceAlreadySignedIn(replace);
      }
    }
  };
}

function redirectIfNotSignedIn(store, info = PARAMS.NOT_SIGNED_IN) {
  return (nextState, replace) => {
    // console.log('redirectIfNotSignedIn');
    if (!selectIsSignedIn(store.getState())) {
      replaceIfNotSignedIn(nextState.location, replace, info);
    }
  };
}

function redirectIfNotPermitted(store, roleRequired, replacePath) {
  return (nextState, replace) => {
    // console.log('redirectIfNotPermitted');
    if (!selectIsSignedIn(store.getState())) {
      // console.log('redirectIfNotPermitted replaceIfNotSignedIn');
      replaceIfNotSignedIn(nextState.location, replace, PARAMS.NOT_SIGNED_IN, replacePath);
    } else if (selectReadyForAuthCheck(store.getState()) && !hasRoleRequired(selectSessionUserRoles(store.getState()), roleRequired)) {
      // console.log('replaceUnauthorised');
      replaceUnauthorised(replace, replacePath);
    }
    // console.log('redirectIfNotPermitted else (not redirecting)');
  };
}
function redirect(store, replacePath) {
  return (nextState, replace) => {
    replace(replacePath);
  };
}

/**
 * Helper for creating redirects
 */
export function getRedirects(store) {
  checkStore(store);

  return {
    redirectIfSignedIn: (replacePath) => redirectIfSignedIn(store, replacePath),
    redirectIfNotSignedIn: (info) => redirectIfNotSignedIn(store, info),
    redirectIfNotPermitted: (roleRequired, replacePath) => redirectIfNotPermitted(store, roleRequired, replacePath),
    redirect: (replacePath) => redirect(store, replacePath),
  };
}
