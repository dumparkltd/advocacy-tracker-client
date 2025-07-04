/*
 *
 * ActionNew constants
 *
 */
import { fromJS } from 'immutable';
import { API, ACTION_FIELDS } from 'themes/config';

export const DEPENDENCIES = [
  API.USER_ROLES,
  API.CATEGORIES,
  API.TAXONOMIES,
  API.ACTIONS,
  API.ACTORS,
  API.ACTORTYPES,
  API.RESOURCES,
  API.RESOURCETYPES,
  API.ACTIONTYPES,
  API.ACTORTYPE_TAXONOMIES,
  API.ACTIONTYPE_TAXONOMIES,
  API.ACTOR_CATEGORIES,
  API.ACTION_CATEGORIES,
  API.INDICATORS,
  API.ACTION_INDICATORS,
  API.ACTION_ACTIONS,
  API.USER_ACTIONS,
  API.USERS,
];

export const FORM_INITIAL = fromJS({
  id: '',
  attributes: Object.keys(ACTION_FIELDS.ATTRIBUTES).reduce((memo, att) => ({
    ...memo,
    [att]: typeof ACTION_FIELDS.ATTRIBUTES[att].defaultValue !== 'undefined'
      ? ACTION_FIELDS.ATTRIBUTES[att].defaultValue
      : '',
  }), {}),
  associatedTaxonomies: {},
  associatedActorsByActortype: {},
  associatedResourcesByResource: {},
  associatedTopActionsByActiontype: {},
  associatedSubActionsByActiontype: {},
  associatedIndicators: [],
  associatedUsers: [],
  close: true,
  step: null,
});
