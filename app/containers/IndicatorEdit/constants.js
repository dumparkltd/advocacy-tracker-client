/*
 *
 * ActorEdit constants
 *
 */
import { fromJS } from 'immutable';
import { API, INDICATOR_FIELDS } from 'themes/config';
export const SAVE = 'impactoss/ActorEdit/SAVE';

export const DEPENDENCIES = [
  API.USERS,
  API.USER_ROLES,
  API.CATEGORIES,
  API.TAXONOMIES,
  API.INDICATORS,
  API.ACTIONS,
  API.ACTIONTYPES,
  API.ACTIONTYPE_TAXONOMIES,
  API.ACTION_ACTORS,
  API.ACTION_INDICATORS,
  API.ACTION_CATEGORIES,
];

export const FORM_INITIAL = fromJS({
  id: '',
  attributes: Object.keys(INDICATOR_FIELDS.ATTRIBUTES).reduce((memo, att) => ({
    ...memo,
    [att]: typeof INDICATOR_FIELDS.ATTRIBUTES[att].defaultValue !== 'undefined'
      ? INDICATOR_FIELDS.ATTRIBUTES[att].defaultValue
      : '',
  }), {}),
  associatedActionsByActiontype: [],
});
