import { createSelector } from 'reselect';
import { API, USER_ACTORTYPES, USER_ACTIONTYPES } from 'themes/config';

import {
  selectReady,
  selectEntity,
  selectEntities,
  selectTaxonomiesSorted,
  selectUserCategoriesGroupedByUser,
  selectCategories,
  selectActorsCategorised,
  selectActionsCategorised,
  selectUserActorsGroupedByUser,
  selectUserActionsGroupedByUser,
  selectActortypes,
  selectActiontypes,
} from 'containers/App/selectors';

import {
  entitySetUser,
  prepareTaxonomiesAssociated,
  entitiesSetAssociated,
  prepareTaxonomies,
} from 'utils/entities';
import { qe } from 'utils/quasi-equals';

import { DEPENDENCIES } from './constants';

export const selectDomain = createSelector(
  (state) => state.get('userEdit'),
  (substate) => substate
);

export const selectViewEntity = createSelector(
  (state, id) => selectEntity(state, { path: API.USERS, id }),
  (state) => selectEntities(state, API.USERS),
  (state) => selectEntities(state, API.USER_ROLES),
  (state) => selectEntities(state, API.ROLES),
  (entity, users, userRoles, roles) => entity && users && userRoles && roles && entitySetUser(entity, users).set(
    'roles',
    userRoles.filter(
      (association) => qe(
        association.getIn(['attributes', 'user_id']),
        entity.get('id'),
      )
    ).map(
      (association) => roles.find(
        (role) => qe(
          role.get('id'),
          association.getIn(['attributes', 'role_id']),
        )
      )
    )
  )
);

export const selectTaxonomies = createSelector(
  (state, id) => id,
  selectTaxonomiesSorted,
  selectCategories,
  selectUserCategoriesGroupedByUser,
  (id, taxonomies, categories, associations) => prepareTaxonomiesAssociated(
    taxonomies,
    categories,
    associations,
    'tags_users',
    id,
  )
);

export const selectConnectedTaxonomies = createSelector(
  selectTaxonomiesSorted,
  selectCategories,
  (taxonomies, categories) => prepareTaxonomies(
    taxonomies,
    categories,
    false,
  )
);


export const selectRoles = createSelector(
  (state, id) => id,
  (state) => selectEntities(state, API.ROLES),
  (state) => selectEntities(state, API.USER_ROLES),
  (id, roles, userRoles) => roles && roles.map(
    (role) => {
      const filteredAssociations = userRoles.filter(
        (association) => qe(
          association.getIn(['attributes', 'user_id']),
          id,
        )
      );
      const entityAssociation = filteredAssociations.find(
        (association) => qe(
          association.getIn(['attributes', 'role_id']),
          role.get('id'),
        )
      );
      return role.set('associated', entityAssociation || null);
    }
  )
);

export const selectActorsByActortype = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectActorsCategorised,
  selectUserActorsGroupedByUser,
  selectActortypes,
  (ready, user, actors, associations, actortypes) => {
    if (!user || !ready) return null;
    const validActortypeIds = USER_ACTORTYPES;
    if (!validActortypeIds || validActortypeIds.length === 0) {
      return null;
    }
    return actortypes.filter(
      (type) => validActortypeIds
        && validActortypeIds.indexOf(type.get('id')) > -1
    ).map((type) => {
      const filtered = actors.filter(
        (actor) => qe(
          type.get('id'),
          actor.getIn(['attributes', 'actortype_id']),
        )
      );
      return entitiesSetAssociated(
        filtered,
        associations,
        user.get('id'),
      );
    });
  }
);

export const selectActionsByActiontype = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectActionsCategorised,
  selectUserActionsGroupedByUser,
  selectActiontypes,
  (ready, user, actions, associations, actiontypes) => {
    if (!user || !ready) return null;
    const validActiontypeIds = USER_ACTIONTYPES;
    if (!validActiontypeIds || validActiontypeIds.length === 0) {
      return null;
    }
    return actiontypes.filter(
      (type) => validActiontypeIds
        && validActiontypeIds.indexOf(type.get('id')) > -1
    ).map((type) => {
      const filtered = actions.filter(
        (action) => qe(
          type.get('id'),
          action.getIn(['attributes', 'measuretype_id']),
        )
      );
      return entitiesSetAssociated(
        filtered,
        associations,
        user.get('id'),
      );
    });
  }
);
