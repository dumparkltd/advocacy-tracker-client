/*
 *
 * ActorNew constants
 *
 */
import { fromJS } from 'immutable';
import { API, RESOURCE_FIELDS } from 'themes/config';

export const DEPENDENCIES = [
  API.USER_ROLES,
  API.CATEGORIES,
  API.TAXONOMIES,
  API.RESOURCES,
  API.ACTIONS,
  API.RESOURCETYPES,
  API.ACTIONTYPES,
  API.ACTION_CATEGORIES,
  API.ACTIONTYPE_TAXONOMIES,
];

export const FORM_INITIAL = fromJS({
  id: '',
  attributes: Object.keys(RESOURCE_FIELDS.ATTRIBUTES).reduce((memo, att) => ({
    ...memo,
    [att]: typeof RESOURCE_FIELDS.ATTRIBUTES[att].defaultValue !== 'undefined'
      ? RESOURCE_FIELDS.ATTRIBUTES[att].defaultValue
      : '',
  }), {}),
  associatedActionsByActiontype: [],
  close: true,
  step: null,
});

export const REDUCER_NAME = 'resourceNew';
