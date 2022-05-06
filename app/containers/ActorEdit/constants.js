/*
 *
 * ActorEdit constants
 *
 */
import { fromJS } from 'immutable';
import { API, ACTOR_FIELDS } from 'themes/config';
export const SAVE = 'impactoss/ActorEdit/SAVE';

export const DEPENDENCIES = [
  API.USERS,
  API.USER_ROLES,
  API.CATEGORIES,
  API.TAXONOMIES,
  API.ACTORS,
  API.ACTIONS,
  API.ACTORTYPES,
  API.ACTIONTYPES,
  API.ACTORTYPE_TAXONOMIES,
  API.ACTIONTYPE_TAXONOMIES,
  API.ACTOR_ACTIONS,
  API.ACTION_ACTORS,
  API.ACTOR_CATEGORIES,
  API.ACTION_CATEGORIES,
  API.MEMBERSHIPS,
  API.USER_ACTORS,
];

export const FORM_INITIAL = fromJS({
  id: '',
  attributes: Object.keys(ACTOR_FIELDS.ATTRIBUTES).reduce((memo, att) => ({
    ...memo,
    [att]: ACTOR_FIELDS.ATTRIBUTES[att].defaultValue || '',
  }), {}),
  associatedTaxonomies: {},
  associatedActionsByActiontype: {},
  associatedActionsAsTargetByActiontype: {},
  associatedMembersByActortype: {},
  associatedAssociationsByActortype: {},
  associatedUsers: [],
});
