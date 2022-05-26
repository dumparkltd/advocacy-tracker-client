import { createSelector } from 'reselect';

export const selectDomain = createSelector(
  (state) => state.get('entityNew'),
  (substate) => substate
);

export const selectDomainPage = createSelector(
  (state) => state.getIn(['entityNew', 'page']),
  (substate) => substate
);
