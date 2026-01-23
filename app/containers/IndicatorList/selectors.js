import { createSelector } from 'reselect';
import { Map } from 'immutable';

import {
  selectIndicatorsWhereQuery,
  selectWithoutQuery,
  selectActionQuery,
  // selectSortByQuery,
  // selectSortOrderQuery,
  selectConnectedCategoryQuery,
  selectActions,
  selectActorsWithPositions,
  selectReady,
  selectActionCategoriesGroupedByAction,
  selectActionIndicatorsGroupedByIndicator,
  selectCategories,
  selectActors,
  selectIncludeInofficialStatements,
  selectIncludeUnpublishedAPIStatements,
  selectUsers,
} from 'containers/App/selectors';

import {
  filterEntitiesByConnection,
  filterEntitiesWithoutAssociation,
  entitiesSetCategoryIds,
  getIndicatorSupportLevels,
} from 'utils/entities';

import asList from 'utils/as-list';
import qe from 'utils/quasi-equals';
// import { sortEntities, getSortOption } from 'utils/sort';
import {
  API,
  ACTORTYPES,
} from 'themes/config';
import { DEPENDENCIES } from './constants';

export const selectConnections = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActions,
  selectActionCategoriesGroupedByAction,
  selectCategories,
  selectActors,
  selectConnectedCategoryQuery,
  selectIncludeInofficialStatements,
  selectIncludeUnpublishedAPIStatements,
  selectUsers,
  (
    ready,
    actions,
    actionAssociationsGrouped,
    categories,
    actors,
    connectedCategoryQuery,
    includeInofficial,
    includeUnpublishedAPI,
    users,
  ) => {
    if (ready) {
      const actionsWithCategories = entitiesSetCategoryIds(
        actions,
        actionAssociationsGrouped,
        categories,
      );
      return new Map().set(
        API.ACTIONS,
        actionsWithCategories.filter(
          (action) => {
            let pass = true;
            if (!includeInofficial) {
              pass = pass && action.getIn(['attributes', 'is_official']);
            }
            if (!includeUnpublishedAPI) {
              pass = pass && action.getIn(['attributes', 'public_api']);
            }
            const actionCategories = action.get('categories');
            if (pass && connectedCategoryQuery) {
              pass = asList(connectedCategoryQuery).every(
                (queryArg) => {
                  const [path, value] = queryArg.split(':');
                  if (path !== API.ACTIONS || !value) {
                    return true;
                  }
                  return actionCategories.find(
                    (catId) => qe(catId, value),
                  );
                },
              );
            }
            return pass;
          }
        )
      ).set(
        API.ACTORS,
        actors,
      ).set(
        API.USERS,
        users,
      );
    }
    return new Map();
  }
);

// const selectIndicatorsSearched = createSelector(
//   (state, locationQuery) => selectEntitiesSearchQuery(state, {
//     path: API.INDICATORS,
//     searchAttributes: CONFIG.views.list.search || ['title'],
//     locationQuery,
//   }),
//   (indicators) => indicators,
// );

export const selectIndicatorsWithConnections = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectIndicatorsWhereQuery,
  (state) => selectActorsWithPositions(state, { type: ACTORTYPES.COUNTRY }),
  selectConnections,
  selectActionIndicatorsGroupedByIndicator,
  (
    ready,
    indicators,
    countriesWithPositions,
    connections,
    indicatorAssociationsGrouped,
  ) => {
    if (ready) {
      // console.log('countries', countries && countries.toJS())
      return indicators.map(
        (indicator) => {
          const indicatorActions = indicatorAssociationsGrouped.get(parseInt(indicator.get('id'), 10));
          // console.log('indicatorActions', entity.toJS(), indicatorActions && indicatorActions.toJS());
          // currently requires both for filtering & display
          const support = getIndicatorSupportLevels({
            indicator,
            countriesWithPositions,
          });
          return indicator.set(
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
          ).set(
            'supportlevels',
            support,
          ).set(
            'parentIndicator',
            indicators.find(
              (parent) => qe(indicator.getIn(['attributes', 'parent_id']), parent.get('id'))
            ),
          );
        }
      );
    }
    return indicators;
  }
);

const selectIndicatorsWithout = createSelector(
  selectIndicatorsWithConnections,
  selectCategories,
  selectWithoutQuery,
  (entities, categories, query) => query
    ? filterEntitiesWithoutAssociation(entities, categories, query)
    : entities
);
export const selectListIndicators = createSelector(
  selectIndicatorsWithout,
  selectActionQuery,
  (entities, query) => query
    ? filterEntitiesByConnection(entities, query, 'actions').toList()
    : entities.toList()
);
// kicks off series of cascading selectors
// 1. selectEntitiesWhere filters by attribute
// 2. selectEntitiesSearchQuery filters by keyword
// 3. selectIndicatorsNested will nest related entities
// 4. selectIndicatorsWithout will filter by absence of taxonomy or connection
// 5. selectIndicatorsByConnections will filter by specific connection
// 6. selectIndicatorsByCategories will filter by specific categories
// 7. selectIndicatorsByCOnnectedCategories will filter by specific categories connected via connection
