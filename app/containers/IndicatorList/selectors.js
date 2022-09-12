import { createSelector } from 'reselect';
import { Map } from 'immutable';

import {
  selectEntitiesSearchQuery,
  selectWithoutQuery,
  selectActionQuery,
  selectSortByQuery,
  selectSortOrderQuery,
  selectConnectedCategoryQuery,
  selectActions,
  selectActorsWithPositions,
  selectReady,
  selectActionCategoriesGroupedByAction,
  selectActionIndicatorsGroupedByIndicator,
  selectCategories,
  selectActors,
  selectIncludeInofficialStatements,
} from 'containers/App/selectors';

import {
  filterEntitiesByConnection,
  filterEntitiesWithoutAssociation,
  entitiesSetCategoryIds,
} from 'utils/entities';

import asList from 'utils/as-list';
import qe from 'utils/quasi-equals';
import { sortEntities, getSortOption } from 'utils/sort';
import {
  API,
  ACTORTYPES,
  ACTION_INDICATOR_SUPPORTLEVELS,
  OFFICIAL_STATEMENT_CATEGORY_ID,
} from 'themes/config';
import { CONFIG, DEPENDENCIES } from './constants';

export const selectConnections = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActions,
  selectActionCategoriesGroupedByAction,
  selectCategories,
  selectActors,
  selectConnectedCategoryQuery,
  selectIncludeInofficialStatements,
  (
    ready,
    actions,
    actionAssociationsGrouped,
    categories,
    actors,
    connectedCategoryQuery,
    includeInofficial,
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
            const actionCategories = action.get('categories');
            let pass = true;
            if (!includeInofficial) {
              pass = actionCategories && actionCategories.includes(OFFICIAL_STATEMENT_CATEGORY_ID);
            }
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
      );
    }
    return new Map();
  }
);

const selectIndicatorsSearched = createSelector(
  (state, locationQuery) => selectEntitiesSearchQuery(state, {
    path: API.INDICATORS,
    searchAttributes: CONFIG.views.list.search || ['title'],
    locationQuery,
  }),
  (indicators) => indicators,
);

export const selectIndicatorsWithConnections = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectIndicatorsSearched,
  (state) => selectActorsWithPositions(state, { type: ACTORTYPES.COUNTRY }),
  selectConnections,
  selectActionIndicatorsGroupedByIndicator, // as targets
  (
    ready,
    indicators,
    countries,
    connections,
    indicatorAssociationsGrouped,
  ) => {
    if (ready) {
      return indicators.map(
        (indicator) => {
          const indicatorActions = indicatorAssociationsGrouped.get(parseInt(indicator.get('id'), 10));
          // console.log('indicatorActions', entity.toJS(), indicatorActions && indicatorActions.toJS());
          // currently requires both for filtering & display
          const support = countries.reduce(
            (levelsMemo, country) => {
              const countrySupport = country
                && country.getIn(['indicatorPositions', indicator.get('id')]);
              if (countrySupport && countrySupport.size > 0) {
                const latest = countrySupport.first();
                const level = latest.get('supportlevel_id')
                  ? latest.get('supportlevel_id').toString()
                  : '0';
                if (levelsMemo.get(level)) {
                  return levelsMemo.setIn(
                    [level, 'count'],
                    levelsMemo.getIn([level, 'count'])
                      ? levelsMemo.getIn([level, 'count']) + 1
                      : 1,
                  ).setIn(
                    [level, 'actors'],
                    levelsMemo.getIn([level, 'actors'])
                      ? levelsMemo.getIn([level, 'actors']).set(country.get('id'), country.get('id'))
                      : Map().set(country.get('id'), parseInt(country.get('id'), 10)),
                  );
                }
                return levelsMemo;
              }
              return levelsMemo;
            },
            Map(ACTION_INDICATOR_SUPPORTLEVELS),
          );
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
      sort || (sortOption ? sortOption.attribute : 'title'),
      sortOption ? sortOption.type : 'string',
    );
  }
);
