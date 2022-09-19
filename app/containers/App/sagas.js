/**
 * Gets the entities from server
 */

import {
  call, put, select, takeLatest, takeEvery, race, take, all,
} from 'redux-saga/effects';
import { push, replace, goBack } from 'react-router-redux';
import { reduce, keyBy } from 'lodash/collection';
// import { without } from 'lodash/array';

import asArray from 'utils/as-array';
import {
  hasRoleRequired,
  replaceUnauthorised,
  replaceIfNotSignedIn,
} from 'utils/redirects';


import {
  LOAD_ENTITIES_IF_NEEDED,
  REDIRECT_IF_NOT_PERMITTED,
  SAVE_ENTITY,
  SAVE_MULTIPLE_ENTITIES,
  NEW_ENTITY,
  NEW_MULTIPLE_ENTITIES,
  DELETE_ENTITY,
  DELETE_MULTIPLE_ENTITIES,
  AUTHENTICATE,
  LOGOUT,
  VALIDATE_TOKEN,
  INVALIDATE_ENTITIES,
  SAVE_CONNECTIONS,
  UPDATE_ROUTE_QUERY,
  AUTHENTICATE_FORWARD,
  UPDATE_PATH,
  RECOVER_PASSWORD,
  CLOSE_ENTITY,
  DISMISS_QUERY_MESSAGES,
  SET_ACTIONTYPE,
  SET_ACTORTYPE,
  SET_VIEW,
  SET_SUBJECT,
  SET_MAPSUBJECT,
  SET_MAPINDICATOR,
  OPEN_BOOKMARK,
  SET_INCLUDE_ACTOR_MEMBERS,
  SET_INCLUDE_TARGET_MEMBERS,
  SET_INCLUDE_ACTOR_CHILDREN,
  SET_INCLUDE_TARGET_CHILDREN,
  SET_INCLUDE_MEMBERS_FORFILTERS,
  SET_INCLUDE_INOFFICAL_STATEMENTS,
  SET_INCLUDE_TARGET_CHILDREN_ON_MAP,
  SET_INCLUDE_TARGET_CHILDREN_MEMBERS_ON_MAP,
  PARAMS,
} from 'containers/App/constants';

import {
  ROUTES,
  ENDPOINTS,
  KEYS,
  API,
  KEEP_FILTERS,
} from 'themes/config';

import {
  entitiesLoaded,
  entitiesLoadingError,
  authenticateSuccess,
  authenticateSending,
  authenticateError,
  logoutSuccess,
  entitiesRequested,
  invalidateEntities,
  updateEntity,
  updateConnections,
  addEntity,
  removeEntity,
  saveSending,
  saveSuccess,
  saveError,
  deleteSending,
  deleteSuccess,
  deleteError,
  recoverSending,
  recoverSuccess,
  recoverError,
  forwardOnAuthenticationChange,
  updatePath,
} from 'containers/App/actions';

import {
  selectCurrentPathname,
  selectPreviousPathname,
  selectRedirectOnAuthSuccessPath,
  selectRequestedAt,
  selectIsSignedIn,
  selectLocation,
  selectSessionUserRoles,
  selectIsAuthenticating,
} from 'containers/App/selectors';

import {
  newEntityRequest,
  deleteEntityRequest,
  updateEntityRequest,
  updateAssociationsRequest,
} from 'utils/entities-update';
import { qe } from 'utils/quasi-equals';
import apiRequest, { getAuthValues, clearAuthValues } from 'utils/api-request';

const MAX_LOAD_ATTEMPTS = 3;

/**
 * Generator function. Function for restarting sagas multiple times before giving up and calling the error handler.
 * - following https://codeburst.io/try-again-more-redux-saga-patterns-bfbc3ffcdc
 *
 * @param {function} generator the saga generator to be restarted
 * @param {function} handleError the error handler after X unsuccessful tries
 * @param {integer} maxTries the maximum number of tries
 */
const autoRestart = (generator, handleError, maxTries = MAX_LOAD_ATTEMPTS) => function* autoRestarting(...args) {
  let n = 0;
  while (n < maxTries) {
    n += 1;
    try {
      // console.log('call', n, args)
      yield call(generator, ...args);
      break;
    } catch (err) {
      // console.log('err', n)
      if (n >= maxTries) {
        // console.log('handleError', n)
        yield handleError(err, ...args);
      }
    }
  }
};
  /**
   * Generator function. Load data error handler:
   * - Record load error
   *
   * @param {object} payload {key: data set key}
   */
function* loadEntitiesErrorHandler(err, { path }) {
  // console.log('handle loading error', path)
  yield put(entitiesLoadingError(err, path));
}
/**
 * Check if entities already present
 */
export function* loadEntitiesSaga({ path }) {
  if (Object.values(API).indexOf(path) > -1) {
    // requestedSelector returns the times that entities where fetched from the API
    const requestedAt = yield select(selectRequestedAt, { path });

    // If haven't requested yet, do so now.
    if (!requestedAt) {
      const signedIn = yield select(selectIsSignedIn);
      if (signedIn) {
        try {
          // First record that we are requesting
          yield put(entitiesRequested(path, Date.now()));
          // check role to prevent requesting endpoints not authorised
          // TODO check could be refactored
          // Call the API, cancel on invalidate
          // console.log('call', path)
          const { response } = yield race({
            response: call(apiRequest, 'get', path),
            cancel: take(INVALIDATE_ENTITIES), // will also reset entities requested
          });
          // console.log('response', response)
          if (response && response.data) {
            // Save response
            yield put(entitiesLoaded(keyBy(response.data, 'id'), path, Date.now()));
          } else {
            // console.log('no response data', response)
            yield put(entitiesRequested(path, false));
            throw new Error(response.statusText || 'error');
          }
        } catch (err) {
          // console.log('error', err)
          // Whoops Save error
          // Clear the request time on error, This will cause us to try again next time, which we probably want to do?
          yield put(entitiesRequested(path, false));
          // throw error
          throw new Error((err.response && err.response.status) || err);
        }
      } else {
        // console.log('error: not signedin', )
        yield put(entitiesRequested(path, false));
        throw new Error('not signed in');
      }
    }
  }
}
/**
 * Check if user is authorized
 */
export function* checkRoleSaga({ role }) {
  const signedIn = yield select(selectIsSignedIn);
  if (!signedIn) {
    const authenticating = yield select(selectIsAuthenticating);
    if (!authenticating) {
      const redirectOnAuthSuccess = yield select(selectCurrentPathname);
      yield put(replaceIfNotSignedIn(redirectOnAuthSuccess, replace));
    }
  } else {
    const roleIds = yield select(selectSessionUserRoles);
    if (!hasRoleRequired(roleIds, role)) {
      yield put(replaceUnauthorised(replace));
    }
  }
}

export function* authenticateSaga(payload) {
  const { password, email } = payload.data;
  try {
    yield put(authenticateSending());
    const response = yield call(apiRequest, 'post', ENDPOINTS.SIGN_IN, { email, password });
    yield put(authenticateSuccess(response.data));
    yield put(invalidateEntities()); // important invalidate before forward to allow for reloading of entities
    yield put(forwardOnAuthenticationChange());
  } catch (err) {
    err.response.json = yield err.response.json();
    yield put(authenticateError(err));
  }
}

export function* recoverSaga(payload) {
  const { email } = payload.data;
  try {
    yield put(recoverSending());
    yield call(apiRequest, 'post', ENDPOINTS.PASSWORD, {
      email,
      redirect_url: `${window.location.origin}${ROUTES.RESET_PASSWORD}`,
    });
    yield put(recoverSuccess());
    // forward to login
    yield put(updatePath(
      ROUTES.LOGIN,
      {
        replace: true,
        query: { info: PARAMS.RECOVER_SUCCESS },
      }
    ));
  } catch (err) {
    err.response.json = yield err.response.json();
    yield put(recoverError(err));
  }
}

export function* authChangeSaga() {
  const redirectPathname = yield select(selectRedirectOnAuthSuccessPath);
  if (redirectPathname) {
    yield put(updatePath(redirectPathname, { replace: true }));
  } else {
    // forward to home
    yield put(updatePath('/', { replace: true }));
  }
}

export function* logoutSaga() {
  try {
    yield call(apiRequest, 'delete', ENDPOINTS.SIGN_OUT);
    yield call(clearAuthValues);
    yield put(logoutSuccess());
    yield put(updatePath(ROUTES.LOGIN, { replace: true }));
  } catch (err) {
    yield call(clearAuthValues);
    yield put(authenticateError(err));
  }
}

export function* validateTokenSaga() {
  try {
    const {
      [KEYS.UID]: uid,
      [KEYS.CLIENT]: client,
      [KEYS.ACCESS_TOKEN]: accessToken,
    } = yield getAuthValues();

    if (uid && client && accessToken) {
      yield put(authenticateSending());
      const response = yield call(
        apiRequest,
        'get',
        ENDPOINTS.VALIDATE_TOKEN, {
          [KEYS.UID]: uid,
          [KEYS.CLIENT]: client,
          [KEYS.ACCESS_TOKEN]: accessToken,
        }
      );
      if (!response.success) {
        yield call(clearAuthValues);
        yield put(invalidateEntities());
      }
      yield put(authenticateSuccess(response.data)); // need to store currentUserData
    }
  } catch (err) {
    yield call(clearAuthValues);
    err.response.json = yield err.response.json();
    yield put(authenticateError(err));
  }
}


function stampPayload(payload, type) {
  return Object.assign(payload, {
    timestamp: `${Date.now()}-${Math.random().toString(36).slice(-8)}`,
    type,
  });
}


function* createConnectionsSaga({
  entityId, path, updates, keyPair,
}) {
  if (updates.create) {
    const create = updates.create.reduce(
      (memo, createX) => {
        // get attributes other than key pair
        const attributes = Object.keys(createX).reduce(
          (m, key) => {
            if (keyPair.indexOf(key) > -1) {
              return m;
            }
            return ({
              ...m,
              [key]: createX[key],
            });
          },
          {},
        );
        // make sure to use new entity id for full payload
        // we should have either the one (actor_id) or the other (measure_id)
        return ([
          ...memo,
          {
            [keyPair[0]]: createX[keyPair[0]] || entityId,
            [keyPair[1]]: createX[keyPair[1]] || entityId,
            ...attributes,
          },
        ]);
      },
      [],
    );
    yield call(saveConnectionsSaga, { data: { path, updates: { create } } });
  }
}

export function* saveEntitySaga({ data }, updateClient = true, multiple = false) {
  const dataTS = stampPayload(data, 'save');
  try {
    yield put(saveSending(dataTS));
    // update entity attributes
    const entityUpdated = yield call(updateEntityRequest, data.path, data.entity);
    // and on the client
    if (updateClient) {
      yield put(updateEntity(data.path, {
        id: entityUpdated.data.id,
        attributes: entityUpdated.data.attributes,
      }));
    }
    if (!multiple) {
      // update user-roles connections
      if (data.entity.userRoles) {
        yield call(saveConnectionsSaga, {
          data: {
            path: API.USER_ROLES,
            updates: data.entity.userRoles,
          },
        });
      }

      // update user-category connections
      if (data.entity.userCategories) {
        yield call(saveConnectionsSaga, {
          data: {
            path: API.USER_CATEGORIES,
            updates: data.entity.userCategories,
          },
        });
      }

      // update actor-action connections
      if (data.entity.actorActions) {
        yield call(saveConnectionsSaga, {
          data: {
            path: API.ACTOR_ACTIONS,
            updates: data.entity.actorActions,
          },
        });
      }
      // update action-actors connections (targets)
      if (data.entity.actionActors) {
        yield call(saveConnectionsSaga, {
          data: {
            path: API.ACTION_ACTORS,
            updates: data.entity.actionActors,
          },
        });
      }
      // update action-actions connections (relationships)
      if (data.entity.topActions) {
        yield call(saveConnectionsSaga, {
          data: {
            path: API.ACTION_ACTIONS,
            updates: data.entity.topActions,
          },
        });
      }
      if (data.entity.subActions) {
        yield call(saveConnectionsSaga, {
          data: {
            path: API.ACTION_ACTIONS,
            updates: data.entity.subActions,
          },
        });
      }
      // update action-actors connections (targets)
      if (data.entity.actionResources) {
        yield call(saveConnectionsSaga, {
          data: {
            path: API.ACTION_RESOURCES,
            updates: data.entity.actionResources,
          },
        });
      }
      if (data.entity.actionIndicators) {
        yield call(saveConnectionsSaga, {
          data: {
            path: API.ACTION_INDICATORS,
            updates: data.entity.actionIndicators,
          },
        });
      }
      if (data.entity.userActions) {
        yield call(saveConnectionsSaga, {
          data: {
            path: API.USER_ACTIONS,
            updates: data.entity.userActions,
          },
        });
      }
      if (data.entity.userActors) {
        yield call(saveConnectionsSaga, {
          data: {
            path: API.USER_ACTORS,
            updates: data.entity.userActors,
          },
        });
      }
      // update memberships connections
      if (data.entity.memberships) {
        yield call(saveConnectionsSaga, {
          data: {
            path: API.MEMBERSHIPS,
            updates: data.entity.memberships,
          },
        });
      }
      // update associations connections
      // inverse of membership
      if (data.entity.associations) {
        yield call(saveConnectionsSaga, {
          data: {
            path: API.MEMBERSHIPS,
            updates: data.entity.associations,
          },
        });
      }
      // update action-category connections
      if (data.entity.actionCategories) {
        yield call(saveConnectionsSaga, {
          data: {
            path: API.ACTION_CATEGORIES,
            updates: data.entity.actionCategories,
          },
        });
      }

      // update actor-category connections
      if (data.entity.actorCategories) {
        yield call(saveConnectionsSaga, {
          data: {
            path: API.ACTOR_CATEGORIES,
            updates: data.entity.actorCategories,
          },
        });
      }
    }
    yield put(saveSuccess(dataTS));
    if (!multiple && data.redirect) {
      yield put(updatePath(data.redirect, { replace: true }));
    }
    if (updateClient && data.invalidateEntitiesOnSuccess) {
      yield all(
        asArray(data.invalidateEntitiesOnSuccess).map(
          (path) => put(invalidateEntities(path))
        )
      );
    }
  } catch (err) {
    err.response.json = yield err.response.json();
    yield put(saveError(err, dataTS));
    if (updateClient) {
      yield put(invalidateEntities(data.path));
    }
  }
}

export function* saveMultipleEntitiesSaga({ path, data, invalidateEntitiesPaths }) {
  const updateClient = data && data.length <= 20;
  yield all(data.map(
    (datum) => call(
      saveEntitySaga,
      { data: datum },
      updateClient, // update client for small batch jobs
      true, // multiple
    )
  ));
  if (invalidateEntitiesPaths) {
    yield all(
      asArray(invalidateEntitiesPaths).map(
        (item) => put(invalidateEntities(item))
      )
    );
  } else if (path) {
    yield put(invalidateEntities(path));
  }
}

export function* deleteEntitySaga({ data }, updateClient = true, multiple = false) {
  const dataTS = stampPayload(data, 'delete');
  try {
    yield put(deleteSending(dataTS));
    yield call(deleteEntityRequest, data.path, data.id);
    if (!multiple && data.redirect !== false) {
      yield put(updatePath(
        `${data.redirect || data.path}`,
        { replace: true },
      ));
    }
    if (updateClient) {
      yield put(removeEntity(data.path, data.id));
    }
    yield put(deleteSuccess(dataTS));
  } catch (err) {
    err.response.json = yield err.response.json();
    yield put(deleteError(err, dataTS));
    if (updateClient) {
      yield put(invalidateEntities(data.path));
    }
  }
}

export function* deleteMultipleEntitiesSaga({ path, data, invalidateEntitiesPaths }) {
  const updateClient = data && data.length <= 20;
  yield all(data.map(
    (datum) => call(
      deleteEntitySaga,
      { data: datum },
      updateClient, // do not update client
      true, // multiple
    )
  ));
  if (invalidateEntitiesPaths) {
    yield all(
      asArray(invalidateEntitiesPaths).map(
        (item) => put(invalidateEntities(item))
      )
    );
  } else if (path) {
    yield put(invalidateEntities(path));
  } else if (!path && !invalidateEntitiesPaths) {
    yield put(invalidateEntities());
  }
}

export function* newEntitySaga({ data }, updateClient = true, multiple = false) {
  const dataTS = stampPayload(data, 'new');
  try {
    yield put(saveSending(dataTS));
    // update entity attributes
    // on the server
    const entityCreated = yield call(newEntityRequest, data.path, data.entity.attributes);
    if (!data.createAsGuest) {
      if (updateClient) {
        yield put(addEntity(data.path, entityCreated.data));
      }
      if (!multiple) {
        // check for associations/connections
        // update actor-action connections
        if (data.entity.actorActions) {
          yield call(createConnectionsSaga, {
            entityId: entityCreated.data.id,
            path: API.ACTOR_ACTIONS,
            updates: data.entity.actorActions,
            keyPair: ['actor_id', 'measure_id'],
          });
        }
        // update action-actors connections (targets)
        if (data.entity.actionActors) {
          yield call(createConnectionsSaga, {
            entityId: entityCreated.data.id,
            path: API.ACTION_ACTORS,
            updates: data.entity.actionActors,
            keyPair: ['actor_id', 'measure_id'],
          });
        }
        if (data.entity.actionResources) {
          yield call(createConnectionsSaga, {
            entityId: entityCreated.data.id,
            path: API.ACTION_RESOURCES,
            updates: data.entity.actionResources,
            keyPair: ['resource_id', 'measure_id'],
          });
        }
        if (data.entity.actionIndicators) {
          yield call(createConnectionsSaga, {
            entityId: entityCreated.data.id,
            path: API.ACTION_INDICATORS,
            updates: data.entity.actionIndicators,
            keyPair: ['indicator_id', 'measure_id'],
          });
        }
        if (data.entity.userActions) {
          yield call(createConnectionsSaga, {
            entityId: entityCreated.data.id,
            path: API.USER_ACTIONS,
            updates: data.entity.userActions,
            keyPair: ['user_id', 'measure_id'],
          });
        }
        if (data.entity.userActors) {
          yield call(createConnectionsSaga, {
            entityId: entityCreated.data.id,
            path: API.USER_ACTORS,
            updates: data.entity.userActors,
            keyPair: ['user_id', 'actor_id'],
          });
        }
        // update action-actions connections (relationships)
        if (data.entity.topActions) {
          yield call(createConnectionsSaga, {
            entityId: entityCreated.data.id,
            path: API.ACTION_ACTIONS,
            updates: data.entity.topActions,
            keyPair: ['measure_id', 'other_measure_id'],
          });
        }
        if (data.entity.subActions) {
          yield call(createConnectionsSaga, {
            entityId: entityCreated.data.id,
            path: API.ACTION_ACTIONS,
            updates: data.entity.subActions,
            keyPair: ['other_measure_id', 'measure_id'],
          });
        }
        // update memberships connections
        if (data.entity.memberships) {
          yield call(createConnectionsSaga, {
            entityId: entityCreated.data.id,
            path: API.MEMBERSHIPS,
            updates: data.entity.memberships,
            keyPair: ['member_id', 'memberof_id'],
          });
        }
        // update associations connections
        // inverse of memberships
        if (data.entity.associations) {
          yield call(createConnectionsSaga, {
            entityId: entityCreated.data.id,
            path: API.MEMBERSHIPS,
            updates: data.entity.associations,
            keyPair: ['memberof_id', 'member_id'],
          });
        }
        // update action-category connections
        if (data.entity.actionCategories) {
          yield call(createConnectionsSaga, {
            entityId: entityCreated.data.id,
            path: API.ACTION_CATEGORIES,
            updates: data.entity.actionCategories,
            keyPair: ['category_id', 'measure_id'],
          });
        }

        // update actor-category connections
        if (data.entity.actorCategories) {
          yield call(createConnectionsSaga, {
            entityId: entityCreated.data.id,
            path: API.ACTOR_CATEGORIES,
            updates: data.entity.actorCategories,
            keyPair: ['category_id', 'actor_id'],
          });
        }
      }
    }
    yield put(saveSuccess(dataTS));
    if (data.onSuccess) {
      data.onSuccess();
    }
    if (!multiple && data.redirect) {
      if (data.createAsGuest) {
        yield put(updatePath(
          data.redirect,
          {
            query: { info: 'createdAsGuest', infotype: data.path },
            replace: true,
          }
        ));
      } else {
        yield put(updatePath(
          `${data.redirect}/${entityCreated.data.id}`,
          { replace: true },
        ));
      }
    }
    if (updateClient && data.invalidateEntitiesOnSuccess) {
      yield all(
        asArray(data.invalidateEntitiesOnSuccess).map(
          (path) => put(invalidateEntities(path))
        )
      );
    }
  } catch (err) {
    if (err.response) {
      err.response.json = yield err.response.json && err.response.json();
    }
    yield put(saveError(err, dataTS));
    if (updateClient) {
      yield put(invalidateEntities(data.path));
    }
  }
}

export function* newMultipleEntitiesSaga({ path, data, invalidateEntitiesPaths }) {
  const updateClient = data && data.length <= 20;
  yield all(data.map(
    (datum) => call(
      newEntitySaga,
      { data: datum },
      updateClient, // do not update client
      true, // multiple
    )
  ));

  if (invalidateEntitiesPaths) {
    yield all(
      asArray(invalidateEntitiesPaths).map(
        (item) => put(invalidateEntities(item))
      )
    );
  } else if (path) {
    yield put(invalidateEntities(path));
  } else if (!path && !invalidateEntitiesPaths) {
    yield put(invalidateEntities());
  }
}

export function* saveConnectionsSaga({ data }) {
  if (data.updates && (
    (data.updates.create && data.updates.create.length > 0)
    || (data.updates.delete && data.updates.delete.length > 0)
    || (data.updates.update && data.updates.update.length > 0)
  )) {
    const dataTS = stampPayload(data);
    try {
      yield put(saveSending(dataTS));
      // on the server
      const connectionsUpdated = yield call(updateAssociationsRequest, data.path, data.updates);
      // and on the client
      yield put(updateConnections(data.path, connectionsUpdated));
      yield put(saveSuccess(dataTS));
    } catch (err) {
      err.response.json = yield err.response && err.response.json && err.response.json();
      yield put(saveError(err, dataTS));
      yield put(invalidateEntities(data.path));
    }
  }
}

const getNextQuery = (query, extend, location) => {
  // figure out new query
  // get old query or new query if not extending (replacing)
  const queryPrevious = extend
    ? location.get('query').toJS()
    : location.get('query').filter((val, key) => key === 'view').toJS();
  // and figure out new query
  // console.log('query', query)
  // console.log('queryPrevious', queryPrevious)
  return asArray(query).reduce((memo, param) => {
    const queryUpdated = memo;
    // if arg already set and not replacing
    if (queryUpdated[param.arg] && !param.replace) {
      const val = param.value && param.value.toString();
      // check for connection attribute queries
      if (
        val
        && val.indexOf(':') > -1
        && typeof param.multipleAttributeValues !== 'undefined'
        && param.multipleAttributeValues === false
      ) {
        if (param.add) {
          const [attribute] = val.split(':');
          const keepAttributeValues = queryPrevious[param.arg]
            ? asArray(queryPrevious[param.arg]).filter(
              (attVal) => {
                const [att] = attVal.split(':');
                return !qe(att, attribute);
              }
            )
            : [];
          queryUpdated[param.arg] = [
            ...keepAttributeValues,
            param.value,
          ];
        } else if (param.remove) {
          queryUpdated[param.arg] = asArray(queryPrevious[param.arg]).filter(
            (attVal) => !qe(attVal, param.value)
          );
        }
      } else {
        queryUpdated[param.arg] = asArray(queryUpdated[param.arg]);
        const isIncluded = !!param.value && !!queryUpdated[param.arg].find(
          (qv) => qe(qv && qv.toString().split('>')[0], param.value.toString().split('>')[0])
        );

        // add if not already present
        if (param.add && !isIncluded) {
          queryUpdated[param.arg].push(param.value);
        // remove if present
        } else if (extend && param.remove && param.value && isIncluded) {
          queryUpdated[param.arg] = queryUpdated[param.arg].filter(
            (qv) => !qe(qv.toString().split('>')[0], param.value.toString().split('>')[0])
          );
          // convert to single value if only one value left
          if (queryUpdated[param.arg].length === 1) {
            /* eslint-disable prefer-destructuring */
            queryUpdated[param.arg] = queryUpdated[param.arg][0];
            /* eslint-enable prefer-destructuring */
          } else if (queryUpdated[param.arg].length === 0) {
            delete queryUpdated[param.arg];
          }
        }
      // if single value set
      // add if not already present and convert to array
      }
      // if (extend && param.remove && (!param.value || (param.value && queryUpdated[param.arg] === param.value.toString()))) {
      //   console.log('remove')
      //   delete queryUpdated[param.arg];
      // }
    // if set and removing
    } else if (queryUpdated[param.arg] && param.value && param.replace) {
      // only replace the previous value if defined
      if (param.prevValue && queryUpdated[param.arg]) {
        queryUpdated[param.arg] = asArray(queryUpdated[param.arg]).map(
          (argValue) => qe(argValue, param.prevValue)
            ? param.value
            : argValue
        );
      } else {
        queryUpdated[param.arg] = param.value;
      }
    } else if (queryUpdated[param.arg] && (param.remove || typeof param.value === 'undefined')) {
      delete queryUpdated[param.arg];
    // if not set or replacing with new value
    } else if (typeof param.value !== 'undefined' && !param.remove) {
      queryUpdated[param.arg] = param.value;
    }
    return queryUpdated;
  }, queryPrevious);
};

// convert to string
export const getNextQueryString = (queryNext) => reduce(queryNext, (result, value, key) => {
  let params;
  if (Array.isArray(value)) {
    params = value.reduce((memo, val) => `${memo}${memo.length > 0 ? '&' : ''}${key}=${encodeURIComponent(val)}`, '');
  } else {
    params = `${key}=${encodeURIComponent(value)}`;
  }
  return `${result}${result.length > 0 ? '&' : ''}${params}`;
}, '');

export function* updateRouteQuerySaga({ query, extend = true }) {
  const location = yield select(selectLocation);
  yield put(updatePath(
    location.get('pathname'),
    {
      query,
      extend,
      // replace: true, ineffective
    },
  ));
}

export function* setActortypeSaga({ actortype }) {
  const location = yield select(selectLocation);
  const queryNext = getNextQuery(
    {
      arg: 'actortype',
      value: actortype,
      replace: true,
    },
    true, // extend
    location,
  );

  yield put(replace(`${location.get('pathname')}?${getNextQueryString(queryNext)}`));
}
export function* setActiontypeSaga({ actiontype }) {
  const location = yield select(selectLocation);
  const queryNext = getNextQuery(
    {
      arg: 'actiontype',
      value: actiontype,
      replace: true,
    },
    true, // extend
    location,
  );
  yield put(replace(`${location.get('pathname')}?${getNextQueryString(queryNext)}`));
}
export function* setViewSaga({ view }) {
  const location = yield select(selectLocation);
  const queryNext = getNextQuery(
    {
      arg: 'view',
      value: view,
      replace: true,
    },
    true, // extend
    location,
  );
  yield put(replace(`${location.get('pathname')}?${getNextQueryString(queryNext)}`));
}
export function* setMapSubjectSaga({ subject }) {
  const location = yield select(selectLocation);
  const queryNext = getNextQuery(
    {
      arg: 'msubj',
      value: subject,
      replace: true,
    },
    true, // extend
    location,
  );
  yield put(replace(`${location.get('pathname')}?${getNextQueryString(queryNext)}`));
}
export function* setMapIndicatorSaga({ value }) {
  const location = yield select(selectLocation);
  const queryNext = getNextQuery(
    {
      arg: 'topic',
      value,
      replace: true,
    },
    true, // extend
    location,
  );
  yield put(replace(`${location.get('pathname')}?${getNextQueryString(queryNext)}`));
}
export function* setSubjectSaga({ subject }) {
  const location = yield select(selectLocation);
  const queryNext = getNextQuery(
    {
      arg: 'subj',
      value: subject,
      replace: true,
    },
    true, // extend
    location,
  );
  yield put(replace(`${location.get('pathname')}?${getNextQueryString(queryNext)}`));
}
export function* setIncludeActorMembersSaga({ value }) {
  const location = yield select(selectLocation);
  const queryNext = getNextQuery(
    {
      arg: 'am',
      value,
      replace: true,
    },
    true, // extend
    location,
  );
  yield put(replace(`${location.get('pathname')}?${getNextQueryString(queryNext)}`));
}
export function* setIncludeTargetMembersSaga({ value }) {
  const location = yield select(selectLocation);
  const queryNext = getNextQuery(
    {
      arg: 'tm',
      value,
      replace: true,
    },
    true, // extend
    location,
  );
  yield put(replace(`${location.get('pathname')}?${getNextQueryString(queryNext)}`));
}
export function* setIncludeActorChildrenSaga({ value }) {
  const location = yield select(selectLocation);
  const queryNext = getNextQuery(
    {
      arg: 'ach',
      value,
      replace: true,
    },
    true, // extend
    location,
  );
  yield put(replace(`${location.get('pathname')}?${getNextQueryString(queryNext)}`));
}
export function* setIncludeTargetChildrenSaga({ value }) {
  const location = yield select(selectLocation);
  const queryNext = getNextQuery(
    {
      arg: 'tch',
      value,
      replace: true,
    },
    true, // extend
    location,
  );
  yield put(replace(`${location.get('pathname')}?${getNextQueryString(queryNext)}`));
}
export function* setIncludeTargetChildrenOnMapSaga({ value }) {
  const location = yield select(selectLocation);
  const queryNext = getNextQuery(
    {
      arg: 'mtch',
      value,
      replace: true,
    },
    true, // extend
    location,
  );
  yield put(replace(`${location.get('pathname')}?${getNextQueryString(queryNext)}`));
}
export function* setIncludeTargetChildrenMembersOnMapSaga({ value }) {
  const location = yield select(selectLocation);
  const queryNext = getNextQuery(
    {
      arg: 'mtchm',
      value,
      replace: true,
    },
    true, // extend
    location,
  );
  yield put(replace(`${location.get('pathname')}?${getNextQueryString(queryNext)}`));
}
export function* setIncludeMembersForFilterSaga({ value }) {
  const location = yield select(selectLocation);
  const queryNext = getNextQuery(
    {
      arg: 'fm',
      value,
      replace: true,
    },
    true, // extend
    location,
  );
  yield put(replace(`${location.get('pathname')}?${getNextQueryString(queryNext)}`));
}
export function* setIncludeInofficialStatementsSaga({ value }) {
  const location = yield select(selectLocation);
  const queryNext = getNextQuery(
    {
      arg: 'inofficial',
      value,
      replace: true,
    },
    true, // extend
    location,
  );
  yield put(replace(`${location.get('pathname')}?${getNextQueryString(queryNext)}`));
}
export function* openBookmarkSaga({ bookmark }) {
  const path = bookmark.getIn(['attributes', 'view', 'path']);
  const queryString = getNextQueryString(
    bookmark.getIn(['attributes', 'view', 'query']).toJS(),
  );
  yield put(push(`${path}?${queryString}`));
}

export function* dismissQueryMessagesSaga() {
  const location = yield select(selectLocation);
  yield put(updatePath(
    location.get('pathname'),
    {
      query: [
        { arg: 'info', remove: true },
        { arg: 'warning', remove: true },
        { arg: 'error', remove: true },
      ],
      extend: true,
      replace: true,
    },
  ));
}

export function* updatePathSaga({ path, args }) {
  const relativePath = path.startsWith('/') ? path : `/${path}`;
  const location = yield select(selectLocation);
  let queryNext = {};
  if (args && (args.query || args.keepQuery)) {
    if (args.query) {
      queryNext = getNextQuery(args.query, args.extend, location);
    }
    if (args.keepQuery) {
      queryNext = location.get('query').toJS();
    }
  } else {
    // always keep "specific filters"
    queryNext = location.get('query').filter(
      (val, key) => KEEP_FILTERS.indexOf(key) > -1
    ).toJS();
  }
  // convert to string
  const queryNextString = getNextQueryString(queryNext);
  const nextPath = `${relativePath}?${queryNextString}`;
  if (args && args.replace) {
    yield put(replace(nextPath));
  } else {
    yield put(push(nextPath));
  }
}

export function* closeEntitySaga({ path }) {
  // the close icon is to function like back if possible, otherwise go to default path provided
  const previousPath = yield select(selectPreviousPathname);
  const currentPath = yield select(selectCurrentPathname);
  const isPreviousValid = previousPath.indexOf('/edit') > -1
    || previousPath.indexOf('/new') > -1;
  yield put(
    !isPreviousValid && previousPath && (previousPath !== currentPath)
      ? goBack()
      : updatePath(path || '/')
  );
}

/**
 * Root saga manages watcher lifecycle
 */
export default function* rootSaga() {
  // console.log('calling rootSaga');

  yield takeEvery(
    LOAD_ENTITIES_IF_NEEDED,
    autoRestart(loadEntitiesSaga, loadEntitiesErrorHandler, MAX_LOAD_ATTEMPTS),
  );
  yield takeLatest(VALIDATE_TOKEN, validateTokenSaga);

  yield takeLatest(AUTHENTICATE, authenticateSaga);
  yield takeLatest(RECOVER_PASSWORD, recoverSaga);
  yield takeLatest(LOGOUT, logoutSaga);
  yield takeLatest(AUTHENTICATE_FORWARD, authChangeSaga);

  yield takeEvery(SAVE_ENTITY, saveEntitySaga);
  yield takeEvery(SAVE_MULTIPLE_ENTITIES, saveMultipleEntitiesSaga);
  yield takeEvery(NEW_ENTITY, newEntitySaga);
  yield takeEvery(NEW_MULTIPLE_ENTITIES, newMultipleEntitiesSaga);
  yield takeEvery(DELETE_ENTITY, deleteEntitySaga);
  yield takeEvery(DELETE_MULTIPLE_ENTITIES, deleteMultipleEntitiesSaga);
  yield takeEvery(SAVE_CONNECTIONS, saveConnectionsSaga);

  yield takeLatest(REDIRECT_IF_NOT_PERMITTED, checkRoleSaga);
  yield takeEvery(UPDATE_ROUTE_QUERY, updateRouteQuerySaga);
  yield takeEvery(UPDATE_PATH, updatePathSaga);
  yield takeEvery(SET_ACTORTYPE, setActortypeSaga);
  yield takeEvery(SET_ACTIONTYPE, setActiontypeSaga);
  yield takeEvery(SET_VIEW, setViewSaga);
  yield takeEvery(SET_SUBJECT, setSubjectSaga);
  yield takeEvery(SET_MAPSUBJECT, setMapSubjectSaga);
  yield takeEvery(SET_MAPINDICATOR, setMapIndicatorSaga);
  yield takeEvery(SET_INCLUDE_ACTOR_MEMBERS, setIncludeActorMembersSaga);
  yield takeEvery(SET_INCLUDE_TARGET_MEMBERS, setIncludeTargetMembersSaga);
  yield takeEvery(SET_INCLUDE_ACTOR_CHILDREN, setIncludeActorChildrenSaga);
  yield takeEvery(SET_INCLUDE_TARGET_CHILDREN, setIncludeTargetChildrenSaga);
  yield takeEvery(SET_INCLUDE_TARGET_CHILDREN_ON_MAP, setIncludeTargetChildrenOnMapSaga);
  yield takeEvery(SET_INCLUDE_TARGET_CHILDREN_MEMBERS_ON_MAP, setIncludeTargetChildrenMembersOnMapSaga);
  yield takeEvery(SET_INCLUDE_MEMBERS_FORFILTERS, setIncludeMembersForFilterSaga);
  yield takeEvery(SET_INCLUDE_INOFFICAL_STATEMENTS, setIncludeInofficialStatementsSaga);
  yield takeEvery(OPEN_BOOKMARK, openBookmarkSaga);
  yield takeEvery(DISMISS_QUERY_MESSAGES, dismissQueryMessagesSaga);

  yield takeEvery(CLOSE_ENTITY, closeEntitySaga);
}
