import { createSelector } from 'reselect';
import { API } from 'themes/config';

import {
  selectEntities,
  selectLocationQuery,
} from 'containers/App/selectors';

export const selectTypeQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('type')
);

// kicks off series of cascading selectors
// 1. selectEntitiesWhere filters by attribute
// 2. selectEntitiesSearchQuery filters by keyword
// 3. selectUsers
export const selectBookmarks = createSelector(
  (state) => selectEntities(state, API.BOOKMARKS),
  (entities) => entities && entities.toList()
);
