import { createSelector } from 'reselect';
import { Map } from 'immutable';

import {
  selectEntities,
  selectAttributeQuery,
  selectWithoutQuery,
  selectActorQuery,
  selectActionQuery,
  selectCategoryQuery,
  selectSortByQuery,
  selectSortOrderQuery,
  selectCategories,
  selectActions,
  selectActionCategoriesGroupedByAction,
  selectActors,
  selectActorCategoriesGroupedByActor,
  selectReady,
  selectUserActionsGroupedByUser,
  selectUserActorsGroupedByUser,
  selectRoleQuery,
} from 'containers/App/selectors';
import { USER_ROLES, API } from 'themes/config';

import {
  filterEntitiesByConnection,
  filterEntitiesByCategories,
  filterEntitiesWithoutAssociation,
  filterEntitiesByAttributes,
  entitiesSetCategoryIds,
} from 'utils/entities';
import { qe } from 'utils/quasi-equals';
import { sortEntities, getSortOption } from 'utils/sort';

import { CONFIG, DEPENDENCIES } from './constants';

export const selectConnections = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActions,
  selectActionCategoriesGroupedByAction,
  selectActors,
  selectActorCategoriesGroupedByActor,
  selectCategories,
  (
    ready,
    actions,
    actionAssociationsGrouped,
    actors,
    actorAssociationsGrouped,
    categories,
  ) => {
    if (ready) {
      return new Map()
        .set(
          API.ACTIONS,
          entitiesSetCategoryIds(
            actions,
            actionAssociationsGrouped,
            categories,
          )
        ).set(
          API.ACTORS,
          entitiesSetCategoryIds(
            actors,
            actorAssociationsGrouped,
            categories,
          )
        );
    }
    return new Map();
  }
);

const getHighestUserRoleId = (roleIds) => roleIds.reduce(
  (currentHighestRoleId, roleId) => {
    if (roleId) {
      const theRole = Object.values(USER_ROLES).find((r) => qe(r.value, parseInt(roleId, 10)));
      const highestRole = Object.values(USER_ROLES).find((r) => qe(r.value, parseInt(currentHighestRoleId, 10)));
      return theRole.order < highestRole.order
        ? roleId
        : currentHighestRoleId;
    }
    return currentHighestRoleId;
  },
  USER_ROLES.DEFAULT.value
);

export const selectUsersWithConnections = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  (state) => selectEntities(state, API.USERS),
  (state) => selectEntities(state, API.USER_CATEGORIES),
  (state) => selectEntities(state, API.USER_ROLES),
  selectConnections,
  selectUserActionsGroupedByUser,
  selectUserActorsGroupedByUser,
  (
    ready,
    entities,
    entityCategories,
    entityRoles,
    connections,
    actionAssociationsGrouped,
    actorAssociationsGrouped,
  ) => {
    if (ready) {
      return entities.map(
        (entity) => {
          const entityRoleIds = entityRoles.filter(
            (association) => qe(
              association.getIn(['attributes', 'user_id']),
              entity.get('id')
            )
          ).map(
            (association) => association.getIn(['attributes', 'role_id'])
          );
          const entityHighestRoleId = getHighestUserRoleId(entityRoleIds);
          const userActions = actionAssociationsGrouped.get(parseInt(entity.get('id'), 10));
          const userActors = actorAssociationsGrouped.get(parseInt(entity.get('id'), 10));
          const userCategories = entityCategories && entityCategories.filter(
            (association) => qe(
              association.getIn(['attributes', 'user_id']),
              entity.get('id')
            )
          ).map(
            (association) => association.getIn(['attributes', 'category_id'])
          );

          return entity.set(
            'categories',
            userCategories,
          ).set(
            'roles',
            entityHighestRoleId !== USER_ROLES.DEFAULT.value
              ? Map({ 0: entityHighestRoleId })
              : Map()
          ).set(
            'allRoles',
            entityRoleIds,
          ).set(
            'actions',
            userActions
          ).set(
            'actionsByType',
            userActions && connections.get(API.ACTIONS) && userActions.filter(
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
            'actors',
            userActors
          ).set(
            'actorsByType',
            userActors && connections.get(API.ACTORS) && userActors.filter(
              (id) => connections.getIn([
                API.ACTORS,
                id.toString(),
              ])
            ).groupBy(
              (actorId) => connections.getIn([
                API.ACTORS,
                actorId.toString(),
                'attributes',
                'actortype_id',
              ])
            ).sortBy((val, key) => key),
          );
        }
      );
    }
    return entities;
  }
);

const selectUsersWhereQuery = createSelector(
  selectAttributeQuery,
  selectUsersWithConnections, // type should be optional
  (query, entities) => query
    ? filterEntitiesByAttributes(entities, query)
    : entities
);

const selectUsersWithout = createSelector(
  selectUsersWhereQuery,
  selectCategories,
  selectWithoutQuery,
  (entities, categories, query) => query
    ? filterEntitiesWithoutAssociation(entities, categories, query)
    : entities
);
const selectUsersByActions = createSelector(
  selectUsersWithout,
  selectActionQuery,
  (entities, query) => query
    ? filterEntitiesByConnection(entities, query, 'actions')
    : entities
);
const selectUsersByActors = createSelector(
  selectUsersByActions,
  selectActorQuery,
  (entities, query) => query
    ? filterEntitiesByConnection(entities, query, 'actors')
    : entities
);
const selectUsersByRole = createSelector(
  selectUsersByActors,
  selectRoleQuery,
  (entities, query) => query
    ? filterEntitiesByConnection(entities, query, 'roles')
    : entities
);
const selectUsersByCategories = createSelector(
  selectUsersByRole,
  selectCategoryQuery,
  (entities, query) => query
    ? filterEntitiesByCategories(entities, query)
    : entities
);

// kicks off series of cascading selectors
// 1. selectEntitiesWhere filters by attribute
// 2. selectEntitiesSearchQuery filters by keyword
// 4. selectUsersWithout will filter by absence of taxonomy or connection
// 5. selectUsersByConnections will filter by specific connection
// 6. selectUsersByCategories will filter by specific categories
export const selectUsers = createSelector(
  selectUsersByCategories,
  selectSortByQuery,
  selectSortOrderQuery,
  (entities, sort, order) => {
    const sortOption = getSortOption(CONFIG.sorting, sort);
    return sortEntities(
      entities,
      order || (sortOption ? sortOption.order : 'asc'),
      sort || (sortOption ? sortOption.attribute : 'name'),
      sortOption ? sortOption.type : 'string'
    );
  }
);
