import { createSelector } from 'reselect';
import { Map } from 'immutable';
import {
  selectResourcesSearchQuery,
  selectWithoutQuery,
  selectActionQuery,
  selectSortByQuery,
  selectSortOrderQuery,
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

// export const selectConnectedTaxonomies = createSelector(
//   (state) => selectReady(state, { path: DEPENDENCIES }),
//   selectConnections,
//   selectActionTaxonomies,
//   selectCategories,
//   (state) => selectEntities(state, API.ACTION_CATEGORIES),
//   (
//     ready,
//     connections,
//     taxonomies,
//     categories,
//     actionCategories,
//   ) => {
//     if (!ready) return Map();
//     const relationship = {
//       tags: 'tags_actions',
//       path: 'actions',
//       key: 'measure_id',
//       associations: actionCategories,
//     };
//
//     const groupedAssociations = relationship.associations.filter(
//       (association) => association.getIn(['attributes', relationship.key])
//         && connections.getIn([
//           relationship.path,
//           association.getIn(['attributes', relationship.key]).toString(),
//         ])
//     ).groupBy(
//       (association) => association.getIn(['attributes', 'category_id'])
//     );
//     return taxonomies.map(
//       (taxonomy) => taxonomy.set(
//         'categories',
//         getTaxonomyCategories(
//           taxonomy,
//           categories,
//           relationship,
//           groupedAssociations,
//         )
//       )
//     );
//   }
// );

const selectResourcesWithActions = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  (state, args) => selectResourcesSearchQuery(state, {
    searchAttributes: CONFIG.views.list.search || ['code', 'title'],
    ...args,
  }),
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

const selectResourcesWithout = createSelector(
  selectResourcesWithActions,
  selectCategories,
  selectWithoutQuery,
  (entities, categories, query) => query
    ? filterEntitiesWithoutAssociation(entities, categories, query)
    : entities
);
const selectResourcesByConnections = createSelector(
  selectResourcesWithout,
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
  selectSortByQuery,
  selectSortOrderQuery,
  (entities, sort, order) => {
    const sortOption = getSortOption(CONFIG.views.list.sorting, sort);
    return sortEntities(
      entities,
      order || (sortOption ? sortOption.order : 'desc'),
      sort || (sortOption ? sortOption.attribute : 'id'),
      sortOption ? sortOption.type : 'string'
    );
  }
);
