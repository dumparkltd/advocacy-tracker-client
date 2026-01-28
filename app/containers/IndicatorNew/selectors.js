import { createSelector } from 'reselect';
import { INDICATOR_ACTIONTYPES } from 'themes/config';
import { qe } from 'utils/quasi-equals';


import {
  selectActiontypes,
  selectActionsCategorised,
  selectReady,
  selectIndicators,
} from 'containers/App/selectors';

import { DEPENDENCIES } from './constants';

export const selectDomain = createSelector(
  (state) => state.get('indicatorNew'),
  (substate) => substate
);
export const selectDomainPage = createSelector(
  (state) => state.getIn(['indicatorNew', 'page']),
  (substate) => substate.get('page')
    && substate.getIn(['page', 'saveSendingAll'])
    ? substate.setIn(
      ['page', 'isAnySending'],
      substate.getIn(['page', 'saveSendingAll']).some(
        (value) => value,
      )
    )
    : substate
);

export const selectActionsByActiontype = createSelector(
  (state) => selectActionsCategorised(state), // do not pass type, we want all
  selectActiontypes,
  (actions, actiontypes) => {
    if (!actiontypes || !actions) return null;

    return actiontypes.filter(
      (type) => INDICATOR_ACTIONTYPES && INDICATOR_ACTIONTYPES.indexOf(type.get('id')) > -1
    ).map((type) => actions.filter(
      (action) => qe(
        type.get('id'),
        action.getIn(['attributes', 'measuretype_id']),
      )
    ));
  }
);

export const selectIndicatorOptions = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectIndicators,
  (ready, indicators) => {
    if (!ready) return null;
    // figure out parents (children cannot also be parents)
    // exclude child indicators
    return indicators.filter((option) => !option.getIn(['attributes', 'parent_id']));
  }
);
