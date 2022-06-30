import { createSelector } from 'reselect';
import { Map } from 'immutable';
import { API, ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS } from 'themes/config';

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
  selectActionIndicatorsGroupedByIndicatorAttributes,
  selectActionResourcesGroupedByAction,
  selectUserActionsGroupedByAction,
} from 'containers/App/selectors';

import {
  entitySetUser,
  setActionConnections,
} from 'utils/entities';
import qe from 'utils/quasi-equals';

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
  selectViewEntity,
  selectActionsAssociated,
  selectActionConnections,
  selectActorActionsGroupedByAction,
  selectActionActorsGroupedByAction,
  selectActionIndicatorsGroupedByAction,
  selectActionIndicatorsGroupedByIndicatorAttributes,
  selectActionResourcesGroupedByAction,
  selectActionCategoriesGroupedByAction,
  selectUserActionsGroupedByAction,
  selectCategories,
  (
    ready,
    viewEntity,
    actions,
    actionConnections,
    actorActions,
    actionActors,
    actionIndicators,
    actionIndicatorsAttributes,
    actionResources,
    actionCategories,
    userActions,
    categories,
  ) => {
    if (!ready) return Map();
    let actionsWithConnections = actions && actions
      .map((action) => setActionConnections({
        action,
        actionConnections,
        actorActions,
        actionActors,
        actionIndicators,
        actionIndicatorsAttributes,
        actionResources,
        categories,
        actionCategories,
        users: userActions,
      }));
    actionsWithConnections = actionsWithConnections && actionsWithConnections
      .map((action) => {
        const hasSupportLevel = action
          && ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS[action.getIn(['attributes', 'measuretype_id'])]
          && ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS[action.getIn(['attributes', 'measuretype_id'])].length > 0;
        if (hasSupportLevel) {
          const viewEntityActions = actionIndicatorsAttributes.get(parseInt(viewEntity.get('id'), 10));
          const actionConnection = viewEntityActions.find(
            (connection) => qe(action.get('id'), connection.get('measure_id'))
          );
          return action.setIn(['supportlevel', viewEntity.get('id')], actionConnection.get('supportlevel_id'));
        }
        return action;
      });
    return actionsWithConnections && actionsWithConnections
      .groupBy((r) => r.getIn(['attributes', 'measuretype_id']))
      .sortBy((val, key) => key);
  }
);
