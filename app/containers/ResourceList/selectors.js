import { createSelector } from 'reselect';
import { Map } from 'immutable';
import {
  selectResourcetypeResources,
  selectAttributeQuery,
  selectWithoutQuery,
  selectAnyQuery,
  selectActionQuery,
  selectActions,
  // selectResources,
  selectReady,
  selectActionCategoriesGroupedByAction,
  selectActionResourcesGroupedByResource,
  selectCategories,
} from 'containers/App/selectors';

import {
  filterEntitiesByConnection,
  filterEntitiesWithoutAssociation,
  filterEntitiesWithAnyAssociation,
  filterEntitiesByAttributes,
  entitiesSetCategoryIds,
} from 'utils/entities';
// import { qe } from 'utils/quasi-equals';

import { API } from 'themes/config';
import { DEPENDENCIES } from './constants';

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

export const selectResourcesWithConnections = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectResourcetypeResources,
  selectConnections,
  selectActionResourcesGroupedByResource, // as targets
  (
    ready,
    entities,
    connections,
    resourceAssociationsGrouped,
  ) => {
    if (ready) {
      return entities.map(
        (entity) => {
          const entityActions = resourceAssociationsGrouped.get(parseInt(entity.get('id'), 10));
          // console.log(entityActorsByActortype && entityActorsByActortype.toJS());
          // currently requires both for filtering & display
          return entity.set(
            'actions',
            entityActions
          ).set(
            'actionsByType',
            entityActions && connections.get(API.ACTIONS) && entityActions.filter(
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
    return entities;
  }
);

const selectResourcesWhereQuery = createSelector(
  selectAttributeQuery,
  selectResourcesWithConnections, // type should be optional
  (query, entities) => query
    ? filterEntitiesByAttributes(entities, query)
    : entities
);

const selectResourcesWithout = createSelector(
  selectResourcesWhereQuery,
  selectCategories,
  selectWithoutQuery,
  (entities, categories, query) => query
    ? filterEntitiesWithoutAssociation(entities, categories, query)
    : entities
);
const selectResourcesAny = createSelector(
  selectResourcesWithout,
  selectCategories,
  selectAnyQuery,
  (entities, categories, query) => query
    ? filterEntitiesWithAnyAssociation(entities, categories, query)
    : entities
);
const selectResourcesByConnections = createSelector(
  selectResourcesAny,
  selectActionQuery,
  (entities, query) => query
    ? filterEntitiesByConnection(entities, query, 'actions')
    : entities
);

// kicks off series of cascading selectors
// 1. selectEntitiesWhere filters by attribute
// 2. selectEntitiesSearchQuery filters by keyword
// 4. selectActorsWithout will filter by absence of taxonomy or connection
// 5. selectActorsByConnections will filter by specific connection
// 6. selectActorsByCategories will filter by specific categories
export const selectListResources = createSelector(
  selectResourcesByConnections,
  (entities) => entities && entities.toList()
);
