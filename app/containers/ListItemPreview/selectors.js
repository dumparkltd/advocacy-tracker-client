import { createSelector } from 'reselect';
import { Map } from 'immutable';
import {
  API,
  ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS,
} from 'themes/config';
import {
  selectEntity,
  selectIndicators,
  selectIndicatorConnections,
  selectActionIndicatorsGroupedByAction,
  selectActionIndicatorsGroupedByIndicator,
  selectActionIndicatorsGroupedByActionAttributes,
} from 'containers/App/selectors';

import qe from 'utils/quasi-equals';
import { setIndicatorConnections } from 'utils/entities';

const selectIndicatorAssociations = createSelector(
  (state, { id }) => id,
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

export const selectPreviewEntity = createSelector(
  (state, { id, path }) => selectEntity(state, { id, path }),
  selectIndicatorsAssociated,
  selectIndicatorConnections,
  selectActionIndicatorsGroupedByActionAttributes,
  selectActionIndicatorsGroupedByIndicator,
  (
    previewEntity,
    indicators,
    indicatorConnections,
    actionIndicatorsByActionFull,
    actionIndicators,
  ) => {
    console.log('previewEntity', previewEntity && previewEntity.toJS())
    if (
      !previewEntity
    ) return null;
    if (previewEntity.get('type') === API.ACTIONS) {
      let indicatorsWithConnections;
      const hasSupportLevel = previewEntity
        && ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS[previewEntity.getIn(['attributes', 'measuretype_id'])]
        && ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS[previewEntity.getIn(['attributes', 'measuretype_id'])].length > 0;
      if (hasSupportLevel && indicators && indicatorConnections && actionIndicators) {
        indicatorsWithConnections = indicators
          .map((indicator) => setIndicatorConnections({
            indicator,
            indicatorConnections,
            actionIndicators,
          }));
        const viewEntityActors = actionIndicatorsByActionFull.get(parseInt(previewEntity.get('id'), 10));
        if (viewEntityActors) {
          indicatorsWithConnections = indicatorsWithConnections.map(
            (indicator) => {
              let indicatorX = indicator;
              // console.log(actor && actor.toJS())
              const indicatorConnection = viewEntityActors.find(
                (connection) => qe(indicator.get('id'), connection.get('indicator_id'))
              );
              if (indicatorConnection) {
                indicatorX = indicatorX.setIn(['supportlevel', previewEntity.get('id')], indicatorConnection.get('supportlevel_id'));
              }
              return indicatorX;
            }
          );
        }
      }
      return indicatorsWithConnections
        ? previewEntity.set('indicators', indicatorsWithConnections.sortBy((val, key) => key))
        : previewEntity;
    }
    return previewEntity;
  }
);
