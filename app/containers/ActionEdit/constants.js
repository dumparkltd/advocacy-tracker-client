/*
 *
 * ActionEdit constants
 *
 */
import { fromJS } from 'immutable';
import { API, ACTION_FIELDS } from 'themes/config';
export const SAVE = 'impactoss/ActionEdit/SAVE';

export const DEPENDENCIES = [
  API.USERS,
  API.USER_ROLES,
  API.CATEGORIES,
  API.TAXONOMIES,
  API.ACTORS,
  API.ACTIONS,
  API.RESOURCES,
  API.ACTORTYPES,
  API.ACTIONTYPES,
  API.RESOURCETYPES,
  API.ACTORTYPE_TAXONOMIES,
  API.ACTIONTYPE_TAXONOMIES,
  API.ACTOR_ACTIONS,
  API.ACTION_ACTORS,
  API.ACTION_RESOURCES,
  API.ACTOR_CATEGORIES,
  API.ACTION_CATEGORIES,
  API.INDICATORS,
  API.ACTION_INDICATORS,
  API.ACTION_ACTIONS,
  API.USER_ACTIONS,
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
  associatedResourcesByResourcetype: {},
  // associatedParent: [],
  associatedIndicators: [],
  associatedTopActionsByActiontype: {},
  associatedSubActionsByActiontype: {},
  associatedUsers: [],
  close: true,
  step: null,
});

export const REDUCER_NAME = 'actionEdit';
