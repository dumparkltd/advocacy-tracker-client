/*
 *
 * ActorImport constants
 *
 */
import { fromJS } from 'immutable';

import { API } from 'themes/config';
export const SAVE = 'impactoss/ActorImport/SAVE';
export const RESET_FORM = 'impactoss/ActorImport/RESET_FORM';

export const DEPENDENCIES = [
  API.USERS,
  API.USER_ROLES,
  API.ACTORS,
  API.ACTIONS,
  API.RESOURCES,
  API.INDICATORS,
  API.CATEGORIES,
];

export const FORM_INITIAL = fromJS({
  import: null,
});
