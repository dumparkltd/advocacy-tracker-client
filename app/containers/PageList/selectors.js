import { createSelector } from 'reselect';

import { selectPages, selectAttributeQuery } from 'containers/App/selectors';
import { filterEntitiesByAttributes } from 'utils/entities';

// filter entities by attributes, using locationQuery
const selectPagesWhereQuery = createSelector(
  selectAttributeQuery,
  selectPages, // type should be optional
  (query, entities) => query
    ? filterEntitiesByAttributes(entities, query)
    : entities
);

export const selectListPages = createSelector(
  selectPagesWhereQuery,
  (entities) => entities && entities.toList()
);
