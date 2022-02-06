/*
 *
 * UserEdit constants
 *
 */
import { fromJS } from 'immutable';
import { API } from 'themes/config';
export const SAVE = 'impactoss/UserEdit/SAVE';

export const DEPENDENCIES = [
  API.USERS,
  API.ROLES,
  API.USER_ROLES,
  API.CATEGORIES,
  API.TAXONOMIES,
  API.USER_CATEGORIES,
];

export const FORM_INITIAL = fromJS({
  id: '',
  attributes: {
    email: '',
    name: '',
  },
});
