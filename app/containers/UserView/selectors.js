import { createSelector } from 'reselect';
import { API } from 'themes/config';

import {
  selectEntity,
  selectEntities,
  selectTaxonomiesSorted,
  selectCategories,
} from 'containers/App/selectors';

import {
  entitySetUser,
  prepareTaxonomiesIsAssociated,
} from 'utils/entities';
import { qe } from 'utils/quasi-equals';

export const selectViewEntity = createSelector(
  (state, id) => selectEntity(state, { path: API.USERS, id }),
  (state) => selectEntities(state, API.USERS),
  (state) => selectEntities(state, API.USER_ROLES),
  (state) => selectEntities(state, API.ROLES),
  (entity, users, userRoles, roles) => entity && users && userRoles && roles && entitySetUser(entity, users).set(
    'roles',
    userRoles
      .filter((association) => qe(association.getIn(['attributes', 'user_id']), entity.get('id')))
      .map((association) => roles.find((role) => qe(role.get('id'), association.getIn(['attributes', 'role_id']))))
  )
);

export const selectTaxonomies = createSelector(
  (state, id) => id,
  (state) => selectTaxonomiesSorted(state),
  selectCategories,
  (state) => selectEntities(state, API.USER_CATEGORIES),
  (id, taxonomies, categories, associations) => taxonomies && prepareTaxonomiesIsAssociated(taxonomies, categories, associations, 'tags_users', 'user_id', id)
);
