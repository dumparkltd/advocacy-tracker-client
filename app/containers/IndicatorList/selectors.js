import { createSelector } from 'reselect';
import { Map } from 'immutable';

import {
  selectEntitiesSearchQuery,
  selectWithoutQuery,
  selectActionQuery,
  selectSortByQuery,
  selectSortOrderQuery,
  selectActions,
  // selectResources,
  selectReady,
  selectActionCategoriesGroupedByAction,
  selectActionIndicatorsGroupedByIndicator,
  selectCategories,
} from 'containers/App/selectors';

import {
  filterEntitiesByConnection,
  filterEntitiesWithoutAssociation,
  entitiesSetCategoryIds,
} from 'utils/entities';
// import { qe } from 'utils/quasi-equals';

import { sortEntities, getSortOption } from 'utils/sort';
import { API } from 'themes/config';
import { CONFIG, DEPENDENCIES } from './constants';

export const selectConnections = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActions,
  selectActionCategoriesGroupedByAction,
  selectCategories,
  (
    ready,
    actions,
    actionAssociationsGrouped,
    categories,
  ) => {
    if (ready) {
      return new Map().set(
        API.ACTIONS,
        entitiesSetCategoryIds(
          actions,
          actionAssociationsGrouped,
          categories,
        )
      );
    }
    return new Map();
  }
);

const selectIndicatorsWithActions = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  (state, locationQuery) => selectEntitiesSearchQuery(state, {
    path: API.INDICATORS,
    searchAttributes: CONFIG.views.list.search || ['title'],
    locationQuery,
  }),
  selectConnections,
  selectActionIndicatorsGroupedByIndicator, // as targets
  (
    ready,
    indicators,
    connections,
    indicatorAssociationsGrouped,
  ) => {
    if (ready) {
      return indicators.map(
        (entity) => {
          const indicatorActions = indicatorAssociationsGrouped.get(parseInt(entity.get('id'), 10));
          // console.log(entityActorsByActortype && entityActorsByActortype.toJS());
          // currently requires both for filtering & display
          return entity.set(
            'actions',
            indicatorActions
          ).set(
            'actionsByType',
            indicatorActions && connections.get(API.ACTIONS) && indicatorActions.filter(
              (id) => connections.getIn([
                API.ACTIONS,
                id.toString(),
              ])
            ).groupBy(
              (actionId) => connections.getIn([
                API.ACTIONS,
                actionId.toString(),
                'attributes',
                'measuretype_id',
              ])
            ).sortBy((val, key) => key),
          );
        }
      );
    }
    return indicators;
  }
);

const selectIndicatorsWithout = createSelector(
  selectIndicatorsWithActions,
  selectCategories,
  selectWithoutQuery,
  (entities, categories, query) => query
    ? filterEntitiesWithoutAssociation(entities, categories, query)
    : entities
);
const selectIndicatorsByConnections = createSelector(
  selectIndicatorsWithout,
  selectActionQuery,
  (entities, query) => query
    ? filterEntitiesByConnection(entities, query, 'actions')
    : entities
);
// kicks off series of cascading selectors
// 1. selectEntitiesWhere filters by attribute
// 2. selectEntitiesSearchQuery filters by keyword
// 3. selectIndicatorsNested will nest related entities
// 4. selectIndicatorsWithout will filter by absence of taxonomy or connection
// 5. selectIndicatorsByConnections will filter by specific connection
// 6. selectIndicatorsByCategories will filter by specific categories
// 7. selectIndicatorsByCOnnectedCategories will filter by specific categories connected via connection
export const selectListIndicators = createSelector(
  selectIndicatorsByConnections,
  selectSortByQuery,
  selectSortOrderQuery,
  (entities, sort, order) => {
    const sortOption = getSortOption(CONFIG.views.list.sorting, sort);
    return entities && sortEntities(
      entities,
      order || (sortOption ? sortOption.order : 'desc'),
      sort || (sortOption ? sortOption.attribute : 'id'),
      sortOption ? sortOption.type : 'string',
    );
  }
);
