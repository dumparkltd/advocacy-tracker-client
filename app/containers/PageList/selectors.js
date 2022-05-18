import { createSelector } from 'reselect';

import { selectPagesWhereQuery } from 'containers/App/selectors';

export const selectListPages = createSelector(
  selectPagesWhereQuery,
  (entities) => entities && entities.toList()
);
