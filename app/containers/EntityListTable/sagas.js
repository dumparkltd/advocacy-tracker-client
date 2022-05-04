import { takeLatest, put } from 'redux-saga/effects';

import { updateRouteQuery } from 'containers/App/actions';

import {
  PAGE_CHANGE,
  PAGE_ITEM_CHANGE,
  SORTBY_CHANGE,
  SORTORDER_CHANGE,
  SORT_CHANGE,
} from './constants';

export function* updatePage({ page }) {
  yield put(updateRouteQuery({
    arg: 'page',
    value: page,
    replace: true,
  }));
}
export function* updatePageItems({ no }) {
  yield put(updateRouteQuery([
    {
      arg: 'items',
      value: no,
      replace: true,
    },
    {
      arg: 'page',
      value: '',
      replace: true,
      remove: true,
    },
  ]));
}
export function* updateSortBy({ sort }) {
  yield put(updateRouteQuery({
    arg: 'sort',
    value: sort,
    replace: true,
  }));
}
export function* updateSortOrder({ order }) {
  yield put(updateRouteQuery({
    arg: 'order',
    value: order,
    replace: true,
  }));
}

export function* updateSort(args) {
  // yield console.log('updateSort saga', args)
  yield put(updateRouteQuery([
    {
      arg: 'sort',
      value: args.sort,
      replace: true,
    },
    {
      arg: 'order',
      value: args.order,
      replace: true,
    },
  ]));
}
export default function* entityList() {
  yield takeLatest(PAGE_CHANGE, updatePage);
  yield takeLatest(PAGE_ITEM_CHANGE, updatePageItems);
  yield takeLatest(SORTBY_CHANGE, updateSortBy);
  yield takeLatest(SORTORDER_CHANGE, updateSortOrder);
  yield takeLatest(SORT_CHANGE, updateSort);
}
