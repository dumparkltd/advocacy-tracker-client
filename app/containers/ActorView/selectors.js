import { createSelector } from 'reselect';
import { Map } from 'immutable';
import {
  API,
  ACTIONTYPES_CONFIG,
  ACTORTYPES_CONFIG,
  ACTIONTYPE_ACTORTYPES,
} from 'themes/config';

import {
  selectReady,
  selectEntity,
  selectEntities,
  selectCategories,
  selectTaxonomiesSorted,
  selectActionConnections,
  selectActorConnections,
  selectActions,
  selectActorActionsGroupedByAction,
  selectActionActorsGroupedByAction,
  selectActorActionsGroupedByActor,
  selectActionActorsGroupedByActor,
  selectActionCategoriesGroupedByAction,
  selectActionResourcesGroupedByAction,
  selectActionIndicatorsGroupedByAction,
  selectMembershipsGroupedByMember,
  selectMembershipsGroupedByAssociation,
  selectActionIndicatorsGroupedByActionAttributes,
  selectActionIndicatorsGroupedByIndicatorAttributes,
  selectActors,
  selectActorCategoriesGroupedByActor,
  // selectActiontypes,
  selectUserConnections,
  selectUserActorsGroupedByUser,
  selectUserActorsGroupedByActor,
  selectUserActionsGroupedByUser,
  selectUserActionsGroupedByAction,
  selectUsers,
} from 'containers/App/selectors';

import {
  entitySetUser,
  prepareTaxonomiesIsAssociated,
  setActionConnections,
  setActorConnections,
  setUserConnections,
} from 'utils/entities';

// import qe from 'utils/quasi-equals';

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
export const selectActionsWith = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectActionsAssociated,
  selectActionConnections,
  selectActorActionsGroupedByAction,
  selectActionActorsGroupedByAction,
  selectActionResourcesGroupedByAction,
  selectActionIndicatorsGroupedByAction,
  selectActionIndicatorsGroupedByActionAttributes,
  selectActionIndicatorsGroupedByIndicatorAttributes,
  selectCategories,
  selectActionCategoriesGroupedByAction,
  selectUserActionsGroupedByAction,
  // selectActiontypes,
  (
    ready,
    viewActor,
    actions,
    actionConnections,
    actorActions,
    actionActors,
    actionResources,
    actionIndicators,
    actionIndicatorsByActionAttributes,
    actionIndicatorsByIndicatorAttributes,
    categories,
    actionCategories,
    userActions,
    // actiontypes,
  ) => {
    // if (!ready) return Map();
    if (!viewActor || !ready) return null;
    const actortypeId = viewActor.getIn(['attributes', 'actortype_id']).toString();
    const validActiontypeIds = Object.keys(ACTIONTYPE_ACTORTYPES).filter((actiontypeId) => {
      const actortypeIds = ACTIONTYPE_ACTORTYPES[actiontypeId];
      return actortypeIds && actortypeIds.indexOf(actortypeId) > -1;
    });
    if (!validActiontypeIds || validActiontypeIds.length === 0) {
      return null;
    }

    const actionsWithConnections = actions && actions
      .filter(
        (action) => validActiontypeIds.indexOf(action.getIn(['attributes', 'measuretype_id']).toString()) > -1
      )
      .map((action) => setActionConnections({
        action,
        actionConnections,
        actorActions,
        actionActors,
        actionResources,
        actionIndicators,
        actionIndicatorAttributes: actionIndicatorsByActionAttributes,
        categories,
        actionCategories,
        users: userActions,
      }));
    return actionsWithConnections;
  }
);
export const selectActionsByType = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActionsWith,
  (
    ready,
    actions,
  ) => {
    if (!ready) return Map();
    return actions && actions
      .groupBy((r) => r.getIn(['attributes', 'measuretype_id']))
      .sortBy((val, key) => key);
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
  selectUserActionsGroupedByAction,
  (
    ready,
    actions,
    actionConnections,
    actorActions,
    actionActors,
    actionResources,
    actionCategories,
    categories,
    userActions,
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
        users: userActions,
      }))
      .groupBy((r) => r.getIn(['attributes', 'measuretype_id']))
      .sortBy(
        (val, key) => key,
        (a, b) => {
          const configA = ACTIONTYPES_CONFIG[a];
          const configB = ACTIONTYPES_CONFIG[b];
          return configA.order < configB.order ? -1 : 1;
        }
      );
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

// get associated actors with associoted actions and categories
// - group by actortype
export const selectMembersByType = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectMembersJoined,
  selectActorConnections,
  selectActorActionsGroupedByActor,
  selectActionActorsGroupedByActor,
  selectMembershipsGroupedByMember,
  selectMembershipsGroupedByAssociation,
  selectActorCategoriesGroupedByActor,
  selectCategories,
  (
    ready,
    actors,
    actorConnections,
    actorActions,
    actionActors,
    memberships,
    associations,
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
        memberships,
        associations,
      }))
      .groupBy((r) => r.getIn(['attributes', 'actortype_id']))
      .sortBy(
        (val, key) => key,
        (a, b) => {
          const configA = ACTORTYPES_CONFIG[a];
          const configB = ACTORTYPES_CONFIG[b];
          return configA.order < configB.order ? -1 : 1;
        }
      );
  }
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
export const selectAssociationsByType = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectAssociationsJoined,
  (
    ready,
    actors,
  ) => {
    if (!ready) return Map();
    return actors && actors
      .groupBy((r) => r.getIn(['attributes', 'actortype_id']))
      .sortBy((val, key) => key);
  }
);

// get any indirect actions actor is associated with via any associations it belongs to
export const selectActionsAsMemberByActortype = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectAssociationsJoined, // all groups current actor is member of
  selectActorActionsGroupedByActor,
  selectActorConnections,
  selectActionConnections,
  selectActorActionsGroupedByAction,
  selectActionActorsGroupedByAction,
  selectActionResourcesGroupedByAction,
  selectCategories,
  selectActionCategoriesGroupedByAction,
  selectActions,
  (
    ready,
    associations,
    actorActionsByActor,
    actorConnections,
    actionConnections,
    actorActionsByAction,
    actionActors,
    actionResources,
    categories,
    actionCategories,
    actions,
  ) => {
    if (!ready || !associations) return Map();
    return associations.map(
      (actor) => setActorConnections({ actor, actorActions: actorActionsByActor, actorConnections })
    ).filter(
      (actor) => actor.get('actionsByType') && actor.get('actionsByType').size > 0
    ).map(
      (actor) => actor.set(
        'actionsByType',
        actor.get('actionsByType').map(
          (actionIdsForType) => actionIdsForType.map(
            (actionId) => setActionConnections({
              action: actions.get(actionId.toString()),
              categories,
              actionCategories,
              actionConnections,
              actorActions: actorActionsByAction,
              actionActors,
              actionResources,
            })
          )
        )
      )
    ).groupBy(
      (r) => r.getIn(['attributes', 'actortype_id'])
    ).sortBy(
      (val, key) => key,
      (a, b) => {
        const configA = ACTORTYPES_CONFIG[a];
        const configB = ACTORTYPES_CONFIG[b];
        return configA.order < configB.order ? -1 : 1;
      }
    );
  },
);
export const selectActionsAsTargetAsMemberByActortype = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectAssociationsJoined, // all associations
  selectActionActorsGroupedByActor,
  selectActorConnections,
  selectActionConnections,
  selectActorActionsGroupedByAction,
  selectActionActorsGroupedByAction,
  selectActionResourcesGroupedByAction,
  selectCategories,
  selectActionCategoriesGroupedByAction,
  selectActions,
  (
    ready,
    associations,
    actionActorsByActor,
    actorConnections,
    actionConnections,
    actorActionsByAction,
    actionActors,
    actionResources,
    categories,
    actionCategories,
    actions,
  ) => {
    if (!ready || !associations) return Map();
    return associations.map(
      (actor) => setActorConnections({ actor, actionActors: actionActorsByActor, actorConnections })
    ).filter(
      (actor) => actor.get('targetingActionsByType') && actor.get('targetingActionsByType').size > 0
    ).map(
      (actor) => actor.set(
        'targetingActionsByType',
        actor.get('targetingActionsByType').map(
          (actionIdsForType) => actionIdsForType.map(
            (actionId) => setActionConnections({
              action: actions.get(actionId.toString()),
              categories,
              actionCategories,
              actionConnections,
              actorActions: actorActionsByAction,
              actionActors,
              actionResources,
            })
          )
        )
      )
    ).groupBy(
      (r) => r.getIn(['attributes', 'actortype_id'])
    ).sortBy(
      (val, key) => key,
      (a, b) => {
        const configA = ACTORTYPES_CONFIG[a];
        const configB = ACTORTYPES_CONFIG[b];
        return configA.order < configB.order ? -1 : 1;
      }
    );
  },
);
const selectUserAssociations = createSelector(
  (state, id) => id,
  selectUserActorsGroupedByActor,
  (actorId, associationsByActor) => associationsByActor.get(
    parseInt(actorId, 10)
  )
);
const selectUsersAssociated = createSelector(
  selectUsers,
  selectUserAssociations,
  (users, associations) => users && associations && associations.reduce(
    (memo, id) => {
      const entity = users.get(id.toString());
      return entity
        ? memo.set(id, entity)
        : memo;
    },
    Map(),
  )
);

export const selectEntityUsers = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectUsersAssociated,
  selectUserConnections,
  selectUserActorsGroupedByUser,
  selectUserActionsGroupedByUser,
  (
    ready,
    users,
    userConnections,
    userActors,
    userActions,
  ) => {
    if (!ready) return Map();
    return users && users
      .map((user) => setUserConnections({
        user,
        userConnections,
        userActors,
        userActions,
      }))
      .sortBy((val, key) => key);
  }
);
