import { createSelector } from 'reselect';
import { Map } from 'immutable';
import { API } from 'themes/config';
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
  selectActionActorsGroupedByAction,
  selectActorActionsGroupedByActor,
  selectActionActorsGroupedByActor,
  selectActorActionsGroupedByAction,
  selectActorCategoriesGroupedByActor,
  selectActionCategoriesGroupedByAction,
  selectActionResourcesGroupedByAction,
  selectResourceConnections,
  selectActionResourcesGroupedByResource,
} from 'containers/App/selectors';

import {
  entitySetSingles,
  prepareTaxonomiesIsAssociated,
  setActorConnections,
  setActionConnections,
  setResourceConnections,
} from 'utils/entities';
import { qe } from 'utils/quasi-equals';

import { DEPENDENCIES } from './constants';

export const selectViewEntity = createSelector(
  (state, id) => selectEntity(state, { path: API.ACTIONS, id }),
  (state) => selectEntities(state, API.USERS),
  (entity, users) => entity && entitySetSingles(
    entity, [
      {
        related: users,
        key: 'user',
        relatedKey: 'updated_by_id',
      },
    ],
  )
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


export const selectChildActions = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  (state, id) => id,
  selectActions,
  selectActionConnections,
  selectActorActionsGroupedByAction,
  selectActionActorsGroupedByAction,
  selectActionResourcesGroupedByAction,
  selectActionCategoriesGroupedByAction,
  selectCategories,
  (
    ready,
    actionId,
    actions,
    actionConnections,
    actorActions,
    actionActors,
    actionResources,
    actionCategories,
    categories,
  ) => {
    if (!ready) return null;
    const children = actions.filter((action) => qe(
      action.getIn(['attributes', 'parent_id']),
      actionId,
    ));
    if (!children || children.size === 0) return null;
    return children && children
      .map((action) => setActionConnections({
        action,
        actionConnections,
        actorActions,
        actionActors,
        actionResources,
        categories,
        actionCategories,
      }));
  }
);
export const selectParentActions = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectActions,
  selectActionConnections,
  selectActorActionsGroupedByAction,
  selectActionActorsGroupedByAction,
  selectActionResourcesGroupedByAction,
  selectActionCategoriesGroupedByAction,
  selectCategories,
  (
    ready,
    viewAction,
    actions,
    actionConnections,
    actorActions,
    actionActors,
    actionResources,
    actionCategories,
    categories,
  ) => {
    if (!ready) return null;
    const parents = actions.filter((action) => qe(
      viewAction.getIn(['attributes', 'parent_id']),
      action.get('id'),
    ));
    if (!parents || parents.size === 0) return null;
    return parents && parents
      .map((action) => setActionConnections({
        action,
        actionConnections,
        actorActions,
        actionActors,
        actionResources,
        categories,
        actionCategories,
      }));
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
  selectActorCategoriesGroupedByActor,
  selectCategories,
  (
    ready,
    targets,
    actorConnections,
    actorActions,
    actionActors,
    actorCategories,
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
      }))
      .groupBy((r) => r.getIn(['attributes', 'actortype_id']))
      .sortBy((val, key) => key);
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
