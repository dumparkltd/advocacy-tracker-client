import { createSelector } from 'reselect';
import { Map } from 'immutable';
import { API } from 'themes/config';

import {
  selectReady,
  selectEntity,
  selectEntities,
  selectCategories,
  selectActionConnections,
  selectActions,
  selectActionIndicatorsGroupedByIndicator,
  selectActionCategoriesGroupedByAction,
  selectActorActionsGroupedByAction,
  selectActionActorsGroupedByAction,
  selectActionIndicatorsGroupedByAction,
  selectActionResourcesGroupedByAction,
} from 'containers/App/selectors';

import {
  entitySetUser,
  setActionConnections,
} from 'utils/entities';

import { DEPENDENCIES } from './constants';

export const selectViewEntity = createSelector(
  (state, id) => selectEntity(state, { path: API.INDICATORS, id }),
  (state) => selectEntities(state, API.USERS),
  (entity, users) => entitySetUser(entity, users)
);

const selectActionAssociations = createSelector(
  (state, id) => id,
  selectActionIndicatorsGroupedByIndicator,
  (indicatorId, associationsByIndicator) => associationsByIndicator.get(
    parseInt(indicatorId, 10)
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
  selectActionsAssociated,
  selectActionConnections,
  selectActorActionsGroupedByAction,
  selectActionActorsGroupedByAction,
  selectActionIndicatorsGroupedByAction,
  selectActionResourcesGroupedByAction,
  selectActionCategoriesGroupedByAction,
  selectCategories,
  (
    ready,
    actions,
    actionConnections,
    actorActions,
    actionActors,
    actionIndicators,
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
        actionIndicators,
        actionResources,
        categories,
        actionCategories,
      }))
      .groupBy((r) => r.getIn(['attributes', 'measuretype_id']))
      .sortBy((val, key) => key);
  }
);
