import { createSelector } from 'reselect';
import { Map } from 'immutable';
import { API, ACTIONTYPE_ACTORTYPES } from 'themes/config';

import {
  selectReady,
  selectEntity,
  selectEntities,
  selectCategories,
  selectTaxonomiesSorted,
  selectActionConnections,
  selectActions,
  selectActorActionsGroupedByAction,
  selectActionActorsGroupedByAction,
  selectActorActionsGroupedByActor,
  selectActionActorsGroupedByActor,
  selectActionCategoriesGroupedByAction,
  selectActionResourcesGroupedByAction,
  selectActionIndicatorsGroupedByAction,
  selectActorConnections,
  selectMembershipsGroupedByMember,
  selectMembershipsGroupedByAssociation,
  selectActorCategoriesGroupedByActor,
  selectActors,
  selectActiontypes,
} from 'containers/App/selectors';

import {
  entitySetUser,
  prepareTaxonomiesIsAssociated,
  setActorConnections,
  setActionConnections,
} from 'utils/entities';

import qe from 'utils/quasi-equals';

import { DEPENDENCIES } from './constants';

export const selectViewEntity = createSelector(
  (state, id) => selectEntity(state, { path: API.ACTORS, id }),
  (state) => selectEntities(state, API.USERS),
  (entity, users) => entitySetUser(entity, users)
);

// TODO optimise use selectActorCategoriesGroupedByActor
export const selectViewTaxonomies = createSelector(
  (state, id) => id,
  selectTaxonomiesSorted,
  selectCategories,
  (state) => selectEntities(state, API.ACTOR_CATEGORIES),
  (id, taxonomies, categories, associations) => prepareTaxonomiesIsAssociated(
    taxonomies,
    categories,
    associations,
    'tags_actors',
    'actor_id',
    id,
  )
);

const selectActionAssociations = createSelector(
  (state, id) => id,
  selectActorActionsGroupedByActor,
  (actorId, associationsByActor) => associationsByActor.get(
    parseInt(actorId, 10)
  )
);
const selectActionAsTargetAssociations = createSelector(
  (state, id) => id,
  selectActionActorsGroupedByActor,
  (actorId, associationsByActor) => associationsByActor.get(
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
  selectActionIndicatorsGroupedByAction,
  selectActionResourcesGroupedByAction,
  selectCategories,
  selectActionCategoriesGroupedByAction,
  selectActiontypes,
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
    actiontypes,
  ) => {
    if (!ready) return Map();
    // console.log(actiontypes && actiontypes.toJS());
    if (!viewActor || !ready) return null;
    const actortypeId = viewActor.getIn(['attributes', 'actortype_id']).toString();
    const validActiontypeIds = Object.keys(ACTIONTYPE_ACTORTYPES).filter((actiontypeId) => {
      const actortypeIds = ACTIONTYPE_ACTORTYPES[actiontypeId];
      return actortypeIds && actortypeIds.indexOf(actortypeId) > -1;
    });
    if (!validActiontypeIds || validActiontypeIds.length === 0) {
      return null;
    }
    return actiontypes
      .filter(
        (type) => validActiontypeIds && validActiontypeIds.indexOf(type.get('id')) > -1
      )
      .map(
        (type) => actions
          .filter(
            (action) => qe(type.get('id'), action.getIn(['attributes', 'measuretype_id']))
          ).map(
            (action) => setActionConnections({
              action,
              actionConnections,
              actorActions,
              actionActors,
              actionResources,
              actionIndicators,
              categories,
              actionCategories,
            })
          )
      );
    // actions && actions
    //   .map((action) => setActionConnections({
    //     action,
    //     actionConnections,
    //     actorActions,
    //     actionActors,
    //     actionResources,
    //     categories,
    //     actionCategories,
    //   }))
    //   .groupBy((r) => r.getIn(['attributes', 'measuretype_id']))
    //   .sortBy((val, key) => key);
  }
);

const selectActionsAsTargetAssociated = createSelector(
  selectActions,
  selectActionAsTargetAssociations,
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
// all connected actions where view entity is target
// get associated actors with associoted actions and categories
// - group by actortype
export const selectActionsAsTargetByType = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActionsAsTargetAssociated,
  selectActionConnections,
  selectActorActionsGroupedByAction,
  selectActionActorsGroupedByAction,
  selectActionResourcesGroupedByAction,
  selectActionCategoriesGroupedByAction,
  selectCategories,
  (
    ready,
    actions,
    actionConnections,
    actorActions,
    actionActors,
    actionResources,
    actionCategories,
    categories,
  ) => {
    if (!ready) return Map();
    return actions && actions
      .map((action) => setActionConnections({
        action,
        actionConnections,
        actorActions,
        actionActors,
        actionResources,
        categories,
        actionCategories,
      }))
      .groupBy((r) => r.getIn(['attributes', 'measuretype_id']))
      .sortBy((val, key) => key);
  }
);

// connected actors (members/associations)
const selectMemberJoins = createSelector(
  (state, id) => id,
  selectMembershipsGroupedByAssociation,
  (actorId, joinsByAssociation) => joinsByAssociation.get(
    parseInt(actorId, 10)
  )
);
const selectMembersJoined = createSelector(
  selectActors,
  selectMemberJoins,
  (members, joins) => members && joins && joins.reduce(
    (memo, id) => {
      const entity = members.get(id.toString());
      return entity
        ? memo.set(id, entity)
        : memo;
    },
    Map(),
  )
);
const selectAssociationJoins = createSelector(
  (state, id) => id,
  selectMembershipsGroupedByMember,
  (actorId, joinsByMember) => joinsByMember.get(
    parseInt(actorId, 10)
  )
);
const selectAssociationsJoined = createSelector(
  selectActors,
  selectAssociationJoins,
  (members, joins) => members && joins && joins.reduce(
    (memo, id) => {
      const entity = members.get(id.toString());
      return entity
        ? memo.set(id, entity)
        : memo;
    },
    Map(),
  )
);

// get associated actors with associoted actions and categories
// - group by actortype
export const selectMembersByType = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectMembersJoined,
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
// get associated actors with associoted actions and categories
// - group by actortype
export const selectAssociationsByType = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectAssociationsJoined,
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
