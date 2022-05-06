import { createSelector } from 'reselect';
import { Map } from 'immutable';
import { API } from 'themes/config';

import {
  selectReady,
  selectEntity,
  selectEntities,
  selectTaxonomiesSorted,
  selectCategories,
  selectUserActorsGroupedByUser,
  selectActors,
  selectActorConnections,
  selectUserActionsGroupedByUser,
  selectActions,
  selectActionConnections,
  selectActorActionsGroupedByAction,
  selectActionActorsGroupedByAction,
  selectActionIndicatorsGroupedByAction,
  selectActionResourcesGroupedByAction,
  selectActionCategoriesGroupedByAction,
  selectActorActionsGroupedByActor,
  selectActionActorsGroupedByActor,
  selectActorCategoriesGroupedByActor,
} from 'containers/App/selectors';

import {
  entitySetUser,
  prepareTaxonomiesIsAssociated,
  setActorConnections,
  setActionConnections,
} from 'utils/entities';
import { qe } from 'utils/quasi-equals';

import { DEPENDENCIES } from './constants';

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


const selectActorAssociations = createSelector(
  (state, id) => id,
  selectUserActorsGroupedByUser,
  (actionId, associationsByUser) => associationsByUser.get(
    parseInt(actionId, 10)
  )
);
const selectActorsAssociated = createSelector(
  selectActors,
  selectActorAssociations,
  (actors, associations) => actors && associations && associations.reduce(
    (memo, id) => {
      const entity = actors.get(id.toString());
      return entity
        ? memo.set(id, entity)
        : memo;
    },
    Map(),
  )
);
export const selectActorsByType = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActorsAssociated,
  selectActorConnections,
  selectActorActionsGroupedByActor,
  selectActionActorsGroupedByActor,
  selectActorCategoriesGroupedByActor,
  selectCategories,
  (
    ready,
    actors,
    actorConnections,
    actorActions,
    actionActors,
    actorCategories,
    categories,
  ) => {
    if (!ready) return Map();
    return actors && actors
      .map((actor) => setActorConnections({
        actor,
        actorConnections,
        actorActions,
        actionActors,
        categories,
        actorCategories,
      }))
      .groupBy((r) => r.getIn(['attributes', 'actortype_id']))
      .sortBy((val, key) => key);
  }
);

const selectActionAssociations = createSelector(
  (state, id) => id,
  selectUserActionsGroupedByUser,
  (actorId, associationsByUser) => associationsByUser.get(
    parseInt(actorId, 10)
  )
);

const selectActionsAssociated = createSelector(
  selectActions,
  selectActionAssociations,
  (actions, associations) => actions && associations && associations.reduce(
    (memo, id) => {
      const entity = actions.get(id.toString());
      return entity
        ? memo.set(id, entity)
        : memo;
    },
    Map(),
  )
);

// all connected actions
// get associated actors with associoted actions and categories
// - group by actortype
export const selectActionsByType = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectActionsAssociated,
  selectActionConnections,
  selectActorActionsGroupedByAction,
  selectActionActorsGroupedByAction,
  selectActionResourcesGroupedByAction,
  selectActionIndicatorsGroupedByAction,
  selectCategories,
  selectActionCategoriesGroupedByAction,
  (
    ready,
    viewActor,
    actions,
    actionConnections,
    actorActions,
    actionActors,
    actionResources,
    actionIndicators,
    categories,
    actionCategories,
  ) => {
    if (!ready) return Map();
    return actions && actions
      .map((action) => setActionConnections({
        action,
        actionConnections,
        actorActions,
        actionActors,
        categories,
        actionCategories,
      }))
      .groupBy((r) => r.getIn(['attributes', 'measuretype_id']))
      .sortBy((val, key) => key);
  }
);
