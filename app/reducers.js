/**
 * Combine all reducers in this file and export the combined reducers.
 * If we were to do this in store.js, reducers wouldn't be hot reloadable.
 */
import { fromJS, Map } from 'immutable';
import { combineReducers } from 'redux-immutable';
import { LOCATION_CHANGE } from 'react-router-redux';
import { browserHistory } from 'react-router';

import { ROUTES } from 'themes/config';
import { LOGOUT_SUCCESS } from 'containers/App/constants';
import globalReducer from 'containers/App/reducer';
import languageProviderReducer from 'containers/LanguageProvider/reducer';
import entityNewReducer from 'containers/EntityNewModal/reducer';
import entityListReducer from 'containers/EntityList/reducer';
import entityListFormReducer from 'containers/EntityListForm/reducer';

/*
 * routeReducer
 *
 * The reducer merges route location changes into our immutable state.
 * The change is necessitated by moving to react-router-redux@4
 *
 */
// Initial routing state
const routeInitialState = fromJS({
  locationBeforeTransitions: Object.assign(browserHistory.getCurrentLocation(), {
    pathnamePrevious: '',
    queriesForPath: {},
  }),
});

/**
 * Merge route into the global application state and remember previous route
 */
function routeReducer(state = routeInitialState, action) {
  switch (action.type) {
    /* istanbul ignore next */
    case LOGOUT_SUCCESS:
      return routeInitialState;
    case LOCATION_CHANGE: {
      const pathnamePrevious = state.getIn(['locationBeforeTransitions', 'pathname']);
      const query = state.getIn(['locationBeforeTransitions', 'query']);
      let queriesForPath = state.getIn(['locationBeforeTransitions', 'queriesForPath']);
      if (action.payload.pathname === ROUTES.HOME) {
        queriesForPath = Map();
      } else if (pathnamePrevious !== ROUTES.HOME) {
        queriesForPath = queriesForPath.set(pathnamePrevious, query);
      }
      return state.merge(fromJS({
        locationBeforeTransitions: {
          ...action.payload,
          pathnamePrevious,
          queriesForPath,
        },
      }));
    }
    default:
      return state;
  }
}

/**
 * Creates the main reducer with the asynchronously loaded ones
 */
export default function createReducer(asyncReducers) {
  return combineReducers({
    route: routeReducer,
    global: globalReducer,
    language: languageProviderReducer,
    entityNew: entityNewReducer,
    entityList: entityListReducer,
    entityListForm: entityListFormReducer,
    ...asyncReducers,
  });
}
