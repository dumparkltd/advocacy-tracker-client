/*
 *
 * ActorNew constants
 *
 */
import { fromJS } from 'immutable';
import { API, ACTOR_FIELDS } from 'themes/config';

export const DEPENDENCIES = [
  API.USER_ROLES,
  API.CATEGORIES,
  API.TAXONOMIES,
  API.ACTORS,
  API.ACTIONS,
  API.ACTORTYPES,
  API.ACTIONTYPES,
  API.ACTOR_CATEGORIES,
  API.ACTION_CATEGORIES,
  API.ACTORTYPE_TAXONOMIES,
  API.ACTIONTYPE_TAXONOMIES,
  API.USERS,
  API.USER_ACTORS,
];

export const FORM_INITIAL = fromJS({
  id: '',
  attributes: Object.keys(ACTOR_FIELDS.ATTRIBUTES).reduce((memo, att) => ({
    ...memo,
    [att]: typeof ACTOR_FIELDS.ATTRIBUTES[att].defaultValue !== 'undefined'
      ? ACTOR_FIELDS.ATTRIBUTES[att].defaultValue
      : '',
  }), {}),
  associatedTaxonomies: {},
  associatedActionsByActiontype: {},
  associatedMembersByActortype: {},
  associatedAssociationsByActortype: {},
  associatedUsers: [],
  close: true,
  step: null,
});
