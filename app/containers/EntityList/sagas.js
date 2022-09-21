import { takeLatest, put } from 'redux-saga/effects';

import {
  saveEntity,
  newEntity,
  deleteEntity,
  updateRouteQuery,
} from 'containers/App/actions';

import {
  SAVE,
  NEW_CONNECTION,
  DELETE_CONNECTION,
  UPDATE_QUERY,
  UPDATE_GROUP,
  RESET_FILTERS,
  SET_FILTERS,
} from './constants';

export function* updateQuery({ value }) {
  // console.log('updateQuery', value && value.toJS())
  const params = value.map(
    (val) => ({
      arg: val.get('query'),
      value: val.get('value'),
      prevValue: val.get('prevValue'),
      replace: val.get('replace'),
      add: val.get('checked'),
      remove: !val.get('checked'),
    })
  ).toJS();
  yield params.push({
    arg: 'page',
    value: '',
    replace: true,
    remove: true,
  });
  yield put(updateRouteQuery(params));
}

export function* updateQueryMultiple({ values }) {
  // console.log('updateQueryMultiple', values && values.toJS())
  const params = values.filter(
    (value) => value.get('hasChanged')
  ).map(
    (value) => ({
      arg: value.get('query'),
      value: value.get('value') || 1,
      replace: value.get('replace'),
      add: value.get('checked'),
      remove: !value.get('checked'),
    })
  ).toJS();
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
  yield takeLatest(SET_FILTERS, updateQueryMultiple);

  yield takeLatest(SAVE, save);
  yield takeLatest(NEW_CONNECTION, newConnection);
  yield takeLatest(DELETE_CONNECTION, deleteConnection);
}
