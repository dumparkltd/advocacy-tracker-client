import { createSelector } from 'reselect';
import { Map } from 'immutable';
import {
  API,
  ACTORTYPES_CONFIG,
  ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS,
} from 'themes/config';
import {
  selectReady,
  selectEntity,
  selectEntities,
  selectCategories,
  selectTaxonomiesSorted,
  selectActorConnections,
  selectActionConnections,
  selectActions,
  selectActors,
  selectResources,
  selectIndicators,
  selectActionActorsGroupedByAction,
  selectActorActionsGroupedByActor,
  selectActionActorsGroupedByActor,
  selectActorActionsGroupedByAction,
  selectActorActionsGroupedByActionAttributes,
  selectActorCategoriesGroupedByActor,
  selectActionCategoriesGroupedByAction,
  selectActionResourcesGroupedByAction,
  selectResourceConnections,
  selectActionResourcesGroupedByResource,
  selectMembershipsGroupedByMember,
  selectMembershipsGroupedByAssociation,
  selectActionIndicatorsGroupedByAction,
  selectIndicatorConnections,
  selectActionIndicatorsGroupedByIndicator,
  selectActionActionsGroupedBySubAction,
  selectActionActionsGroupedByTopAction,
  selectUsers,
  selectUserActionsGroupedByAction,
  selectUserConnections,
  selectUserActionsGroupedByUser,
  selectUserActorsGroupedByUser,
  selectUserActorsGroupedByActor,
  selectActionIndicatorsGroupedByActionAttributes,
} from 'containers/App/selectors';

import {
  entitySetUser,
  prepareTaxonomiesIsAssociated,
  setActorConnections,
  setResourceConnections,
  setActionConnections,
  setIndicatorConnections,
  setUserConnections,
} from 'utils/entities';
import qe from 'utils/quasi-equals';

import { DEPENDENCIES } from './constants';

export const selectViewEntity = createSelector(
  (state, id) => selectEntity(state, { path: API.ACTIONS, id }),
  (state) => selectEntities(state, API.USERS),
  (entity, users) => entitySetUser(entity, users)
);

// TODO optimise use selectActionCategoriesGroupedByAction
export const selectViewTaxonomies = createSelector(
  (state, id) => id,
  selectTaxonomiesSorted,
  selectCategories,
  (state) => selectEntities(state, API.ACTION_CATEGORIES),
  (id, taxonomies, categories, associations) => prepareTaxonomiesIsAssociated(
    taxonomies,
    categories,
    associations,
    'tags_actions',
    'measure_id',
    id,
  )
);


// connected actions (topactions)
const selectTopActionJoins = createSelector(
  (state, id) => id,
  selectActionActionsGroupedByTopAction,
  (actionId, joinsByAssociation) => joinsByAssociation.get(
    parseInt(actionId, 10)
  )
);
const selectTopActionsJoined = createSelector(
  selectActions,
  selectTopActionJoins,
  (actions, joins) => actions && joins && joins.reduce(
    (memo, id) => {
      const entity = actions.get(id.toString());
      return entity
        ? memo.set(id, entity)
        : memo;
    },
    Map(),
  )
);
// connected actions (topactions)
const selectSubActionJoins = createSelector(
  (state, id) => id,
  selectActionActionsGroupedBySubAction,
  (actionId, joinsByAssociation) => joinsByAssociation.get(
    parseInt(actionId, 10)
  )
);
const selectSubActionsJoined = createSelector(
  selectActions,
  selectSubActionJoins,
  (actions, joins) => actions && joins && joins.reduce(
    (memo, id) => {
      const entity = actions.get(id.toString());
      return entity
        ? memo.set(id, entity)
        : memo;
    },
    Map(),
  )
);


// get associated actors with associoted actions and categories
// - group by actortype
export const selectTopActionsByActiontype = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectTopActionsJoined,
  selectActionConnections,
  selectActorActionsGroupedByAction,
  selectActionActorsGroupedByAction,
  selectActionCategoriesGroupedByAction,
  selectCategories,
  selectUserActionsGroupedByAction,
  (
    ready,
    actions,
    actionConnections,
    actorActions,
    actionActors,
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
        categories,
        actionCategories,
        users: userActions,
      }))
      .groupBy((r) => r.getIn(['attributes', 'measuretype_id']))
      .sortBy((val, key) => key);
  }
);
// get associated actors with associoted actions and categories
// - group by actortype
export const selectSubActionsByActiontype = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectSubActionsJoined,
  selectActionConnections,
  selectActorActionsGroupedByAction,
  selectActionActorsGroupedByAction,
  selectActionCategoriesGroupedByAction,
  selectCategories,
  selectUserActionsGroupedByAction,
  (
    ready,
    actions,
    actionConnections,
    actorActions,
    actionActors,
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
        categories,
        actionCategories,
        users: userActions,
      }))
      .groupBy((r) => r.getIn(['attributes', 'measuretype_id']))
      .sortBy((val, key) => key);
  }
);

const selectActorAssociations = createSelector(
  (state, id) => id,
  selectActorActionsGroupedByAction,
  (actionId, associationsByAction) => associationsByAction.get(
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

// get associated actors with associoted actions and categories
// - group by actortype
export const selectActorsByType = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActorsAssociated,
  selectActorConnections,
  selectActorActionsGroupedByActionAttributes,
  selectActorActionsGroupedByActor,
  selectActionActorsGroupedByActor,
  selectMembershipsGroupedByMember,
  selectMembershipsGroupedByAssociation,
  selectActorCategoriesGroupedByActor,
  selectUserActorsGroupedByActor,
  selectCategories,
  (
    ready,
    actors,
    actorConnections,
    actorActionsByActionFull,
    actorActionsByActor,
    actionActorsByActor,
    memberships,
    associations,
    actorCategories,
    userActorsByActor,
    categories,
  ) => {
    if (!ready) return Map();
    const actorsWithConnections = actors && actors
      .map((actor) => setActorConnections({
        actor,
        actorConnections,
        actorActions: actorActionsByActor,
        actionActors: actionActorsByActor,
        categories,
        actorCategories,
        memberships,
        associations,
        users: userActorsByActor,
      }));
    return actorsWithConnections && actorsWithConnections
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


const selectTargetAssociations = createSelector(
  (state, id) => id,
  selectActionActorsGroupedByAction,
  (actionId, associationsByAction) => associationsByAction.get(
    parseInt(actionId, 10)
  )
);
const selectTargetsAssociated = createSelector(
  selectActors,
  selectTargetAssociations,
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

// get associated actors with associoted actions and categories
// - group by actortype
export const selectTargetsByType = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectTargetsAssociated,
  selectActorConnections,
  selectActorActionsGroupedByActor,
  selectActionActorsGroupedByActor,
  selectMembershipsGroupedByMember,
  selectMembershipsGroupedByAssociation,
  selectActorCategoriesGroupedByActor,
  selectUserActorsGroupedByActor,
  selectCategories,
  (
    ready,
    targets,
    actorConnections,
    actorActions,
    actionActors,
    memberships,
    associations,
    actorCategories,
    userActorsByActor,
    categories,
  ) => {
    if (!ready) return Map();
    return targets && targets
      .map((actor) => setActorConnections({
        actor,
        actorConnections,
        actorActions,
        actionActors,
        categories,
        actorCategories,
        memberships,
        associations,
        users: userActorsByActor,
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

const selectResourceAssociations = createSelector(
  (state, id) => id,
  selectActionResourcesGroupedByAction,
  (actionId, associationsByAction) => associationsByAction.get(
    parseInt(actionId, 10)
  )
);
const selectResourcesAssociated = createSelector(
  selectResources,
  selectResourceAssociations,
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
// get associated actors with associoted actions and categories
// - group by actortype
export const selectResourcesByType = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectResourcesAssociated,
  selectResourceConnections,
  selectActionResourcesGroupedByResource,
  (
    ready,
    resources,
    resourceConnections,
    actionResources,
  ) => {
    if (!ready) return Map();
    return resources && resources
      .map((resource) => setResourceConnections({
        resource,
        resourceConnections,
        actionResources,
      }))
      .groupBy((r) => r.getIn(['attributes', 'resourcetype_id']))
      .sortBy((val, key) => key);
  }
);

const selectIndicatorAssociations = createSelector(
  (state, id) => id,
  selectActionIndicatorsGroupedByAction,
  (actionId, associationsByAction) => associationsByAction.get(
    parseInt(actionId, 10)
  )
);
const selectIndicatorsAssociated = createSelector(
  selectIndicators,
  selectIndicatorAssociations,
  (indicators, associations) => indicators && associations && associations.reduce(
    (memo, id) => {
      const entity = indicators.get(id.toString());
      return entity
        ? memo.set(id, entity)
        : memo;
    },
    Map(),
  )
);
// get associated actors with associoted actions and categories
// - group by actortype
export const selectEntityIndicators = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectIndicatorsAssociated,
  selectIndicatorConnections,
  selectActionIndicatorsGroupedByActionAttributes,
  selectActionIndicatorsGroupedByIndicator,
  (
    ready,
    viewEntity,
    indicators,
    indicatorConnections,
    actionIndicatorsByActionFull,
    actionIndicators,
  ) => {
    if (!ready) return Map();
    let indicatorsWithConnections = indicators && indicators
      .map((indicator) => setIndicatorConnections({
        indicator,
        indicatorConnections,
        actionIndicators,
      }));
    const hasSupportLevel = viewEntity
      && ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS[viewEntity.getIn(['attributes', 'measuretype_id'])]
      && ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS[viewEntity.getIn(['attributes', 'measuretype_id'])].length > 0;
    if (hasSupportLevel) {
      const viewEntityActors = actionIndicatorsByActionFull.get(parseInt(viewEntity.get('id'), 10));
      if (viewEntityActors) {
        indicatorsWithConnections = indicatorsWithConnections.map(
          (indicator) => {
            let indicatorX = indicator;
            // console.log(actor && actor.toJS())
            const indicatorConnection = viewEntityActors.find(
              (connection) => qe(indicator.get('id'), connection.get('indicator_id'))
            );
            if (indicatorConnection) {
              indicatorX = indicatorX.setIn(['supportlevel', viewEntity.get('id')], indicatorConnection.get('supportlevel_id'));
            }
            return indicatorX;
          }
        );
      }
    }
    return indicatorsWithConnections && indicatorsWithConnections.sortBy((val, key) => key);
  }
);

const selectUserAssociations = createSelector(
  (state, id) => id,
  selectUserActionsGroupedByAction,
  (actionId, associationsByAction) => associationsByAction.get(
    parseInt(actionId, 10)
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
  selectUserActionsGroupedByUser,
  selectUserActorsGroupedByUser,
  (
    ready,
    users,
    userConnections,
    userActions,
    userActors,
  ) => {
    if (!ready) return Map();
    return users && users
      .map((user) => setUserConnections({
        user,
        userConnections,
        userActions,
        userActors,
      }))
      .sortBy((val, key) => key);
  }
);
