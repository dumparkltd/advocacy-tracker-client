import { takeLatest, put } from 'redux-saga/effects';

import {
  saveEntity,
  saveMultipleEntities,
  newEntity,
  newMultipleEntities,
  deleteEntity,
  deleteMultipleEntities,
  updateRouteQuery,
} from 'containers/App/actions';

import {
  SAVE,
  SAVE_MULTIPLE,
  NEW_CONNECTION,
  NEW_MULTIPLE_CONNECTIONS,
  DELETE_CONNECTION,
  DELETE_MULTIPLE_CONNECTIONS,
  UPDATE_QUERY,
  UPDATE_GROUP,
  RESET_FILTERS,
} from './constants';

export function* updateQuery({ value }) {
  const params = value.map((val) => ({
    arg: val.get('query'),
    value: val.get('value'),
    prevValue: val.get('prevValue'),
    replace: val.get('replace'),
    add: val.get('checked'),
    remove: !val.get('checked'),
  })).toJS();
  yield params.push({
    arg: 'page',
    value: '',
    replace: true,
    remove: true,
  });
  yield put(updateRouteQuery(params));
}

export function* resetFilters({ values }) {
  const params = values.map((arg) => ({
    arg,
    value: '',
    replace: true,
    remove: true,
  }));
  yield put(updateRouteQuery(params));
}

export function* updateGroup({ value }) {
  const params = value.map((val) => ({
    arg: val.get('query'),
    value: val.get('value'),
    replace: true,
    // add: value.get('value') !== '',
    // remove: value.get('value') === '',
  })).toJS();
  yield params.push({
    arg: 'page',
    value: '',
    replace: true,
    remove: true,
  });
  yield put(updateRouteQuery(params));
}

export function* save({ data }) {
  yield put(saveEntity({
    path: data.path,
    entity: data.entity,
    saveRef: data.saveRef,
    redirect: false,
  }));
}
export function* saveMultiple({ path, data }) {
  yield put(saveMultipleEntities(path, data));
}
export function* newMultiple({ path, data }) {
  yield put(newMultipleEntities(path, data));
}
export function* deleteMultiple({ path, data }) {
  yield put(deleteMultipleEntities(path, data));
}

export function* newConnection({ data }) {
  yield put(newEntity({
    path: data.path,
    entity: data.entity,
    saveRef: data.saveRef,
    redirect: false,
  }));
}

export function* deleteConnection({ data }) {
  yield put(deleteEntity({
    path: data.path,
    id: data.id,
    saveRef: data.saveRef,
    redirect: false,
  }));
}

export default function* entityList() {
  yield takeLatest(UPDATE_QUERY, updateQuery);
  yield takeLatest(UPDATE_GROUP, updateGroup);
  yield takeLatest(RESET_FILTERS, resetFilters);

  yield takeLatest(SAVE, save);
  yield takeLatest(SAVE_MULTIPLE, saveMultiple);
  yield takeLatest(NEW_CONNECTION, newConnection);
  yield takeLatest(DELETE_CONNECTION, deleteConnection);
  yield takeLatest(NEW_MULTIPLE_CONNECTIONS, newMultiple);
  yield takeLatest(DELETE_MULTIPLE_CONNECTIONS, deleteMultiple);
}
