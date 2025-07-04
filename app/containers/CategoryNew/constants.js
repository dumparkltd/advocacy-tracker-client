/*
 *
 * CategoryNew constants
 *
 */

import { fromJS } from 'immutable';
import { API } from 'themes/config';

export const DEPENDENCIES = [
  API.USERS,
  API.USER_ROLES,
  API.CATEGORIES,
  API.TAXONOMIES,
  API.ACTIONS,
  API.ACTORS,
  API.ACTORTYPES,
  API.ACTORTYPE_TAXONOMIES,
  API.ACTOR_CATEGORIES,
  API.ACTION_CATEGORIES,
];

export const FORM_INITIAL = fromJS({
  attributes: {
    title: '',
    description: '',
    short_title: '',
    url: '',
    manager_id: '',
    taxonomy_id: '',
    parent_id: '',
    reference: '',
    user_only: false,
    draft: true,
    date: '',
    private: false,
    is_archive: false,
  },
  associatedActions: [],
  associatedActorsByActortype: {},
  associatedUser: [],
  associatedCategory: [],
  close: true,
  step: null,
});
