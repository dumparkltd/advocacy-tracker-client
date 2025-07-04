import {
  takeLatest, take, put, cancel,
} from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';

import { saveEntity } from 'containers/App/actions';
import { ROUTES, API } from 'themes/config';

import { SAVE } from './constants';


export function* save({ data }) {
  yield put(saveEntity({
    path: API.CATEGORIES,
    entity: data,
    redirect: data.close ? `${ROUTES.CATEGORY}/${data.id}` : `${ROUTES.CATEGORY}${ROUTES.EDIT}/${data.id}`,
    redirectQuery: data.close || { arg: 'step', value: data.step },
  }));
}

// Individual exports for testing
export function* defaultSaga() {
  // See example in containers/HomePage/sagas.js
  const saveWatcher = yield takeLatest(SAVE, save);

  yield take(LOCATION_CHANGE);
  yield cancel(saveWatcher);
}

// All sagas to be loaded
export default [
  defaultSaga,
];
