/*
 *
 * ActorActionsImport constants
 *
 */
import { fromJS } from 'immutable';
import { API } from 'themes/config';

export const SAVE = 'impactoss/ActorActionsImport/SAVE';
export const RESET_FORM = 'impactoss/ActorActionsImport/RESET_FORM';
export const FORM_INITIAL = fromJS({
  import: null,
});

export const DEPENDENCIES = [
  API.USERS,
  API.USER_ROLES,
  API.ACTIONS,
  API.ACTORS,
  API.ACTOR_ACTIONS,
];
