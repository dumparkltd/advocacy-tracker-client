/*
*
* PageEdit reducer
*
*/

import { combineReducers } from 'redux-immutable';
import { combineForms } from 'react-redux-form/immutable';

import { entityFormReducer } from 'containers/App/entityFormReducer';
import { UPDATE_ENTITY_FORM } from 'containers/App/constants';
import { FORM_INITIAL, REDUCER_NAME } from './constants';

function formReducer(state = FORM_INITIAL, action) {
  if (action.formId !== REDUCER_NAME) return state;
  switch (action.type) {
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
  }, `${REDUCER_NAME}.form`),
});
