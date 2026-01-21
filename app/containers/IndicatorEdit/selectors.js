import { createSelector } from 'reselect';
import { API, INDICATOR_ACTIONTYPES } from 'themes/config';
import { qe } from 'utils/quasi-equals';
import { Map } from 'immutable';

import {
  selectEntity,
  selectEntities,
  selectActionsCategorised,
  selectActiontypes,
  selectActionIndicatorsGroupedByIndicatorAttributes,
  selectReady,
  selectIndicators,
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

export const selectIndicatorOptions = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectIndicators,
  (ready, indicator, indicators) => {
    if (!indicator || !ready) return null;
    // can only have a parent if not already a parent
    const isParent = indicators.some(
      (option) => qe(option.getIn(['attributes', 'parent_id']), indicator.get('id')),
    );
    if (isParent) return null;
    // figure out parents (children cannot also be parents)
    return indicators
      .filter(
        // exclude self and child indicators
        (option) => !qe(option.get('id'), indicator.get('id')) && !option.getIn(['attributes', 'parent_id'])
      )
      .map((option) => {
        if (qe(option.get('id'), indicator.getIn(['attributes', 'parent_id']))) {
          return option
            .set('associated', true)
            .set('association', Map({
              child_id: indicator.get('id'),
              parent_id: option.get('id'),
            }));
        }
        return option.set('associated', false);
      });
  }
);
