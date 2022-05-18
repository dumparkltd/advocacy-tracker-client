import { createSelector } from 'reselect';

export const selectDomain = createSelector(
  (state) => state.get('pageNew'),
  (substate) => substate
);

export const selectDomainPage = createSelector(
  (state) => state.getIn(['pageNew', 'page']),
  (substate) => substate
);
