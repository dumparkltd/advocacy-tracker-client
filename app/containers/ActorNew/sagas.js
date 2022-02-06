import {
  take, put, cancel, takeLatest,
} from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';

import { newEntity } from 'containers/App/actions';
import { ROUTES, API } from 'themes/config';

import { SAVE } from './constants';

export function* save({ data }) {
  yield put(newEntity({
    path: API.ACTORS,
    entity: data,
    redirect: ROUTES.ACTOR,
  }));
}

export function* defaultSaga() {
  const saveWatcher = yield takeLatest(SAVE, save);

  yield take(LOCATION_CHANGE);

  yield cancel(saveWatcher);
}

// All sagas to be loaded
export default [
  defaultSaga,
];
