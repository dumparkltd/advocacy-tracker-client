import { fromJS } from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';

import {
  SAVE_SENDING,
  SAVE_ERROR,
  SAVE_SUCCESS,
  DELETE_SENDING,
  DELETE_ERROR,
  DELETE_SUCCESS,
  SUBMIT_INVALID,
  SAVE_ERROR_DISMISS,
  LOGOUT_SUCCESS,
} from 'containers/App/constants';

import { checkResponseError } from 'utils/request';

const initialState = fromJS({
  saveSending: false,
  saveSuccess: false,
  saveError: false,
  saveSendingAll: {},
  saveSuccessAll: {},
  saveErrorAll: {},
  deleteSending: false,
  deleteSuccess: false,
  deleteError: false,
  submitValid: true,
});

export const entityFormReducer = (state = initialState, action) => {
  let res = state;
  switch (action.type) {
    case LOGOUT_SUCCESS:
    case LOCATION_CHANGE:
      return initialState;
    case SAVE_SENDING:
      res = res
        .set('saveSending', true)
        .set('saveSuccess', false)
        .set('saveError', false);
      if (action.data) {
        res = res
          .setIn(['saveSendingAll', action.data.timestamp], true)
          .setIn(['saveSuccessAll', action.data.timestamp], false)
          .setIn(['saveErrorAll', action.data.timestamp], false);
      }
      return res;
    case SAVE_SUCCESS:
      res = res
        .set('saveSending', false)
        .set('saveSuccess', true);
      if (action.data) {
        res = res
          .setIn(['saveSendingAll', action.data.timestamp], false)
          .setIn(['saveSuccessAll', action.data.timestamp], true);
      }
      return res;
    case SAVE_ERROR:
      res = res
        .set('saveSending', false)
        .set('saveSuccess', false)
        .set('saveError', checkResponseError(action.error));
      if (action.data) {
        res = res
          .setIn(['saveSendingAll', action.data.timestamp], false)
          .setIn(['saveSuccessAll', action.data.timestamp], false)
          .setIn(['saveErrorAll', action.data.timestamp], checkResponseError(action.error));
      }
      return res;
    case SAVE_ERROR_DISMISS:
      res = res
        .set('saveSending', false)
        .set('saveSuccess', false)
        .set('saveError', false);
      if (action.data) {
        res = res
          .setIn(['saveSendingAll', action.data.timestamp], false)
          .setIn(['saveSuccessAll', action.data.timestamp], false)
          .setIn(['saveErrorAll', action.data.timestamp], false);
      }
      return res;
    case DELETE_SENDING:
      return state
        .set('deleteSending', true)
        .set('deleteSuccess', false)
        .set('deleteError', false);
    case DELETE_SUCCESS:
      return state
        .set('deleteSending', false)
        .set('deleteSuccess', true);
    case DELETE_ERROR:
      return state
        .set('deleteSending', false)
        .set('deleteSuccess', false)
        .set('deleteError', checkResponseError(action.error));
    case SUBMIT_INVALID:
      return state.set('submitValid', action.valid);
    default:
      return state;
  }
};
