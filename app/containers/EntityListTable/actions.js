/*
 *
 * EntityListForm actions
 *
 */

import {
  PAGE_CHANGE,
  PAGE_ITEM_CHANGE,
  SORTBY_CHANGE,
  SORTORDER_CHANGE,
  SORT_CHANGE,
} from './constants';

export function updatePage(page) {
  return {
    type: PAGE_CHANGE,
    page,
  };
}

export function updatePageItems(no) {
  return {
    type: PAGE_ITEM_CHANGE,
    no,
  };
}

export function updateSortBy(sort) {
  return {
    type: SORTBY_CHANGE,
    sort,
  };
}

export function updateSortOrder(order) {
  return {
    type: SORTORDER_CHANGE,
    order,
  };
}

export function updateSort({ sort, order }) {
  // console.log('updateSort action')
  return {
    type: SORT_CHANGE,
    sort,
    order,
  };
}
