/*
 *
 * EntityNew reducer
 *
 */

import { combineReducers } from 'redux-immutable';
import { combineForms } from 'react-redux-form/immutable';

import { entityFormReducer } from 'containers/App/entityFormReducer';
import { UPDATE_ENTITY_FORM } from 'containers/App/constants';

import { RESET_FORM, FORM_INITIAL } from './constants';

function formReducer(state = FORM_INITIAL, action) {
  switch (action.type) {
    case RESET_FORM:
      return FORM_INITIAL;
    case UPDATE_ENTITY_FORM:
      return action.data;
    default:
      return state;
  }
}

export default combineReducers({
  page: entityFormReducer,
  form: combineForms({
    data: formReducer,
  }, 'entityNew.form'),
});
