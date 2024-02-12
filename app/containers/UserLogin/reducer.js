/*
 *
 * UserLogin reducer
 *
 */

import { fromJS } from 'immutable';

import { combineReducers } from 'redux-immutable';
import { combineForms } from 'react-redux-form/immutable';

const formData = fromJS({
  email: '',
  password: '',
});

export default combineReducers({
  form: combineForms({
    data: formData,
  }, 'userLogin.form'),
});
