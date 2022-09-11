/*
 *
 * EntityListForm actions
 *
 */

import {
  SHOW_PANEL,
  SAVE,
  NEW_CONNECTION,
  DELETE_CONNECTION,
  RESET_STATE,
  RESET_PROGRESS,
  ENTITY_SELECTED,
  ENTITIES_SELECT,
  UPDATE_QUERY,
  UPDATE_GROUP,
  PATH_CHANGE,
  DISMISS_ERROR,
  DISMISS_ALL_ERRORS,
  RESET_FILTERS,
  SET_FILTERS,
} from './constants';

export function setClientPath(path) {
  return {
    type: PATH_CHANGE,
    path,
  };
}
export function showPanel(activePanel) {
  return {
    type: SHOW_PANEL,
    activePanel,
  };
}

export function save(data) {
  return {
    type: SAVE,
    data,
  };
}
export function newConnection(data) {
  return {
    type: NEW_CONNECTION,
    data,
  };
}
export function deleteConnection(data) {
  return {
    type: DELETE_CONNECTION,
    data,
  };
}

export function resetState(path) {
  return {
    type: RESET_STATE,
    path,
  };
}

export function resetProgress() {
  return {
    type: RESET_PROGRESS,
  };
}

export function selectEntity(data) {
  return {
    type: ENTITY_SELECTED,
    data,
  };
}

export function selectMultipleEntities(ids) {
  return {
    type: ENTITIES_SELECT,
    ids,
  };
}

export function updateQuery(value) {
  return {
    type: UPDATE_QUERY,
    value,
  };
}

export function resetFilters(values) {
  return {
    type: RESET_FILTERS,
    values,
  };
}
export function setFilters(values) {
  return {
    type: SET_FILTERS,
    values,
  };
}

export function updateGroup(value) {
  return {
    type: UPDATE_GROUP,
    value,
  };
}

export function dismissError(key) {
  return {
    type: DISMISS_ERROR,
    key,
  };
}
export function dismissAllErrors(key) {
  return {
    type: DISMISS_ALL_ERRORS,
    key,
  };
}
