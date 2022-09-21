import { createSelector } from 'reselect';
import { API, INDICATOR_ACTIONTYPES } from 'themes/config';
import { qe } from 'utils/quasi-equals';

import {
  selectEntity,
  selectEntities,
  selectActionsCategorised,
  selectActiontypes,
  selectActionIndicatorsGroupedByIndicatorAttributes,
  selectReady,
} from 'containers/App/selectors';

import {
  entitySetUser,
  entitiesSetAssociated_NEW,
} from 'utils/entities';

import { DEPENDENCIES } from './constants';

export const selectDomain = createSelector(
  (state) => state.get('indicatorEdit'),
  (substate) => substate
);

export const selectDomainPage = createSelector(
  (state) => state.getIn(['indicatorEdit', 'page']),
  (substate) => substate
);

export const selectViewEntity = createSelector(
  (state, id) => selectEntity(state, { path: API.INDICATORS, id }),
  (state) => selectEntities(state, API.USERS),
  (entity, users) => entitySetUser(entity, users)
);

export const selectActionsByActiontype = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectActionsCategorised,
  selectActionIndicatorsGroupedByIndicatorAttributes,
  selectActiontypes,
  (ready, viewIndicator, actions, associations, actiontypes) => {
    if (!viewIndicator || !ready) return null;
    return actiontypes.filter(
      (type) => INDICATOR_ACTIONTYPES && INDICATOR_ACTIONTYPES.indexOf(type.get('id')) > -1
    ).map((type) => {
      const filtered = actions.filter(
        (action) => qe(
          type.get('id'),
          action.getIn(['attributes', 'measuretype_id']),
        )
      );
      return entitiesSetAssociated_NEW(
        filtered,
        associations.get(parseInt(viewIndicator.get('id'), 10)),
        'measure_id'
      );
    });
  }
);
