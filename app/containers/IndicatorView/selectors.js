import { createSelector } from 'reselect';
import { Map } from 'immutable';
import {
  API,
  ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS,
  OFFICIAL_STATEMENT_CATEGORY_ID,
} from 'themes/config';

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
  selectActionIndicatorsGroupedByActionAttributes,
  selectActionIndicatorsGroupedByIndicatorAttributes,
  selectActionResourcesGroupedByAction,
  selectUserActionsGroupedByAction,
  selectActorsWithPositions,
  selectIncludeInofficialStatements,
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
  selectActionIndicatorsGroupedByActionAttributes,
  selectActionIndicatorsGroupedByIndicatorAttributes,
  selectActionResourcesGroupedByAction,
  selectActionCategoriesGroupedByAction,
  selectUserActionsGroupedByAction,
  selectCategories,
  selectIncludeInofficialStatements,
  (
    ready,
    viewEntity,
    actions,
    actionConnections,
    actorActions,
    actionActors,
    actionIndicators,
    actionIndicatorsByActionAttributes,
    actionIndicatorsByIndicatorAttributes,
    actionResources,
    actionCategories,
    userActions,
    categories,
    includeInofficial,
  ) => {
    if (!ready) return Map();
    let actionsWithConnections = actions && actions
      .filter(
        (action) => {
          if (!action) {
            return false;
          }
          if (includeInofficial) {
            return true;
          }
          const acs = actionCategories.get(parseInt(action.get('id'), 10));
          return acs && acs.includes(OFFICIAL_STATEMENT_CATEGORY_ID);
        }
      )
      .map((action) => setActionConnections({
        action,
        actionConnections,
        actorActions,
        actionActors,
        actionIndicators,
        actionIndicatorAttributes: actionIndicatorsByActionAttributes,
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
          const viewEntityActions = actionIndicatorsByIndicatorAttributes.get(parseInt(viewEntity.get('id'), 10));
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
export const selectActorsByType = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  (state, id) => id,
  selectActorsWithPositions,
  (
    ready,
    viewEntityId, // the indicator
    actors,
  ) => {
    if (!ready) return Map();
    return actors && actors
      .filter(
        (actor) => actor.get('indicatorPositions')
          && actor.getIn(['indicatorPositions', viewEntityId.toString()])
          && actor.getIn(['indicatorPositions', viewEntityId.toString()]).size > 0
      )
      .map(
        (actor) => actor.set(
          'position',
          actor.getIn(['indicatorPositions', viewEntityId.toString()]).first()
        )
      )
      .groupBy(
        (actor) => actor.getIn(['attributes', 'actortype_id'])
      )
      .sortBy(
        (val, key) => key
      );
  }
);
