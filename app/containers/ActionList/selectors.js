import { createSelector } from 'reselect';
import { Map } from 'immutable';

import {
  selectActiontypeActions,
  selectAttributeQuery,
  selectWithoutQuery,
  selectAnyQuery,
  selectActorQuery,
  selectCategoryQuery,
  selectChildrenQuery,
  selectParentsQuery,
  selectResourceQuery,
  selectActors,
  selectActions,
  // selectActortypes,
  selectReady,
  selectActorCategoriesGroupedByActor,
  selectActionCategoriesGroupedByAction,
  selectActorActionsGroupedByAction, // active
  selectActorActionsMembersGroupedByAction,
  selectCategories,
  selectActionResourcesGroupedByAction,
  selectActionIndicatorsGroupedByAction,
  selectActionIndicatorsGroupedByActionAttributes,
  selectResources,
  selectIndicators,
  selectIncludeMembersForFiltering,
  selectActorActionsAssociationsGroupedByAction,
  selectActionActionsGroupedByTopAction,
  selectActionActionsGroupedBySubAction,
  selectUsers,
  selectUserActionsGroupedByAction,
  selectUserQuery,
  selectIndicatorQuery,
  selectConnectionAttributeQuery,
} from 'containers/App/selectors';

import {
  // filterEntitiesByAttributes,
  filterEntitiesByConnection,
  filterEntitiesByMultipleConnections,
  filterEntitiesByCategories,
  // filterEntitiesByConnectedCategories,
  filterEntitiesByConnectionAttributes,
  filterEntitiesWithoutAssociation,
  filterEntitiesWithAnyAssociation,
  filterEntitiesByAttributes,
  entitiesSetCategoryIds,
} from 'utils/entities';

import { API } from 'themes/config';

import { DEPENDENCIES } from './constants';

export const selectConnections = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActors,
  selectActorCategoriesGroupedByActor,
  selectActions,
  selectActionCategoriesGroupedByAction,
  selectResources,
  selectIndicators,
  selectUsers,
  selectCategories,
  (
    ready,
    actors,
    actorCategoriesGrouped,
    actions,
    actionAssociationsGrouped,
    resources,
    indicators,
    users,
    categories,
  ) => {
    if (ready) {
      return new Map()
        .set(
          API.ACTORS,
          entitiesSetCategoryIds(
            actors,
            actorCategoriesGrouped,
            categories,
          ),
        ).set(
          API.RESOURCES,
          resources,
        ).set(
          API.INDICATORS,
          indicators,
        ).set(
          API.USERS,
          users,
        ).set(
          // potential parents/children
          API.ACTIONS,
          entitiesSetCategoryIds(
            actions,
            actionAssociationsGrouped,
            categories,
          ),
        );
    }
    return new Map();
  }
);

// nest category ids
const selectActionsWithCategories = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  (state, params) => selectActiontypeActions(state, params.type),
  selectActionCategoriesGroupedByAction,
  selectCategories,
  (ready, entities, associationsGrouped, categories) => {
    if (ready) {
      return entitiesSetCategoryIds(
        entities,
        associationsGrouped,
        categories,
      );
    }
    return entities;
  }
);

// nest connected actor ids
// nest connected actor ids by actortype
export const selectActionsWithConnections = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActionsWithCategories,
  selectConnections,
  selectActorActionsGroupedByAction,
  selectActorActionsMembersGroupedByAction,
  selectActorActionsAssociationsGroupedByAction,
  selectActionResourcesGroupedByAction,
  selectActionIndicatorsGroupedByAction,
  selectActionIndicatorsGroupedByActionAttributes,
  selectUserActionsGroupedByAction,
  selectActionActionsGroupedByTopAction,
  selectActionActionsGroupedBySubAction,
  (
    ready,
    entities,
    connections,
    actorConnectionsGrouped,
    actorMemberConnectionsGrouped,
    actorAssociationConnectionsGrouped,
    resourceAssociationsGrouped,
    indicatorAssociationsGrouped,
    indicatorAssociationsFullGrouped,
    userAssociationsGrouped,
    parentConnectionsGrouped,
    childConnectionsGrouped,
  ) => {
    // console.log(actorConnectionsGrouped && actorConnectionsGrouped.toJS())
    if (ready && (connections.get(API.ACTORS) || connections.get(API.RESOURCES))) {
      return entities.map(
        (entity) => {
          // direct actors
          const entityActors = actorConnectionsGrouped.get(parseInt(entity.get('id'), 10));
          const entityActorsByActortype = entityActors && entityActors.filter(
            (actorId) => connections.getIn([
              API.ACTORS,
              actorId.toString(),
            ])
          ).groupBy(
            (actorId) => connections.getIn([
              API.ACTORS,
              actorId.toString(),
              'attributes',
              'actortype_id',
            ])
          ).sortBy((val, key) => key);

          // actors as members
          let entityActorsMembers = actorMemberConnectionsGrouped.get(parseInt(entity.get('id'), 10));
          if (entityActorsMembers) {
            entityActorsMembers = entityActorsMembers.toSet().toMap();
          }
          const entityActorsMembersByActortype = entityActorsMembers && entityActorsMembers.filter(
            (actorId) => connections.getIn([
              API.ACTORS,
              actorId.toString(),
            ])
          ).groupBy(
            (actorId) => connections.getIn([
              API.ACTORS,
              actorId.toString(),
              'attributes',
              'actortype_id',
            ])
          ).sortBy((val, key) => key);
          // actors as parents
          let entityActorsAssociations = actorAssociationConnectionsGrouped.get(parseInt(entity.get('id'), 10));
          if (entityActorsAssociations) {
            entityActorsAssociations = entityActorsAssociations.toSet().toMap();
          }
          const entityActorsAssociationsByActortype = entityActorsAssociations && entityActorsAssociations.filter(
            (actorId) => connections.getIn([
              API.ACTORS,
              actorId.toString(),
            ])
          ).groupBy(
            (actorId) => connections.getIn([
              API.ACTORS,
              actorId.toString(),
              'attributes',
              'actortype_id',
            ])
          ).sortBy((val, key) => key);

          // resources
          const entityResources = resourceAssociationsGrouped.get(parseInt(entity.get('id'), 10));
          const entityResourcesByResourcetype = entityResources && entityResources.filter(
            (resourceId) => connections.getIn([
              API.RESOURCES,
              resourceId.toString(),
            ])
          ).groupBy(
            (resourceId) => connections.getIn([
              API.RESOURCES,
              resourceId.toString(),
              'attributes',
              'resourcetype_id',
            ])
          ).sortBy((val, key) => key);

          // indicators
          const entityIndicators = indicatorAssociationsGrouped.get(
            parseInt(entity.get('id'), 10)
          );
          const entityIndicatorConnections = indicatorAssociationsFullGrouped.get(
            parseInt(entity.get('id'), 10)
          );
          const entityUsers = userAssociationsGrouped.get(
            parseInt(entity.get('id'), 10)
          );

          // parent activities
          const entityParents = parentConnectionsGrouped.get(parseInt(entity.get('id'), 10));
          const entityParentsByType = entityParents && entityParents.filter(
            (actorId) => connections.getIn([
              API.ACTIONS,
              actorId.toString(),
            ])
          ).groupBy(
            (actorId) => connections.getIn([
              API.ACTIONS,
              actorId.toString(),
              'attributes',
              'measuretype_id',
            ])
          ).sortBy((val, key) => key);

          // child activities
          const entityChildren = childConnectionsGrouped.get(parseInt(entity.get('id'), 10));
          const entityChildrenByType = entityChildren && entityChildren.filter(
            (actorId) => connections.getIn([
              API.ACTIONS,
              actorId.toString(),
            ])
          ).groupBy(
            (actorId) => connections.getIn([
              API.ACTIONS,
              actorId.toString(),
              'attributes',
              'measuretype_id',
            ])
          ).sortBy((val, key) => key);

          // the activity
          return entity
            // directly connected actors
            .set('actors', entityActors)
            .set('actorsByType', entityActorsByActortype)
            // indirectly connected actors (member of a directly connected group)
            .set('actorsMembers', entityActorsMembers)
            .set('actorsMembersByType', entityActorsMembersByActortype)
            // indirectly connected actors (group, region, class a directly connected actor belongs to)
            .set('actorsAssociations', entityActorsAssociations)
            .set('actorsAssociationsByType', entityActorsAssociationsByActortype)
            // directly connected resources
            .set('resources', entityResources)
            .set('indicators', entityIndicators)
            .set('indicatorConnections', entityIndicatorConnections)
            .set('parents', entityParents)
            .set('parentsByType', entityParentsByType)
            .set('children', entityChildren)
            .set('childrenByType', entityChildrenByType)
            .set('users', entityUsers)
            .set('resourcesByType', entityResourcesByResourcetype);
        }
      );
    }
    return entities;
  }
);

const selectActionsWhereQuery = createSelector(
  selectAttributeQuery,
  selectActionsWithConnections, // type should be optional
  (query, entities) => query
    ? filterEntitiesByAttributes(entities, query)
    : entities
);

const selectActionsWithout = createSelector(
  selectActionsWhereQuery,
  selectCategories,
  selectWithoutQuery,
  selectIncludeMembersForFiltering,
  (entities, categories, query, includeMembers) => query
    ? filterEntitiesWithoutAssociation(entities, categories, query, includeMembers)
    : entities
);
const selectActionsAny = createSelector(
  selectActionsWithout,
  selectCategories,
  selectAnyQuery,
  selectIncludeMembersForFiltering,
  (entities, categories, query, includeMembers) => query
    ? filterEntitiesWithAnyAssociation(entities, categories, query, includeMembers)
    : entities
);
const selectActionsByActors = createSelector(
  selectActionsAny,
  selectActorQuery,
  selectIncludeMembersForFiltering,
  (entities, query, includeMembers) => {
    if (query) {
      if (includeMembers) {
        return filterEntitiesByMultipleConnections(
          entities,
          query,
          ['actors', 'actorsMembers', 'actorsAssociations'],
          true, // any
        );
      }
      return filterEntitiesByMultipleConnections(
        entities,
        query,
        ['actors', 'actorsMembers'],
        true, // any
      );
      // return filterEntitiesByConnection(entities, query, 'actors');
    }
    return entities;
  }
);
const selectActionsByUsers = createSelector(
  selectActionsByActors,
  selectUserQuery,
  (entities, query) => query
    ? filterEntitiesByConnection(entities, query, 'users')
    : entities
);
const selectActionsByIndicators = createSelector(
  selectActionsByUsers,
  selectIndicatorQuery,
  (entities, query) => query
    ? filterEntitiesByConnection(
      entities,
      query,
      'indicators',
      {
        id: 'indicator_id',
        path: 'indicatorConnections',
      },
    )
    : entities
);
const selectActionsByConnectionAttributes = createSelector(
  selectActionsByIndicators,
  selectConnectionAttributeQuery,
  (entities, query) => query
    ? filterEntitiesByConnectionAttributes(entities, query)
    : entities
);
const selectActionsByResources = createSelector(
  selectActionsByConnectionAttributes,
  selectResourceQuery,
  (entities, query) => query
    ? filterEntitiesByConnection(entities, query, 'resources')
    : entities
);
const selectActionsByChildren = createSelector(
  selectActionsByResources,
  selectChildrenQuery,
  (entities, query) => query
    ? filterEntitiesByConnection(entities, query, 'children')
    : entities
);
const selectActionsByParents = createSelector(
  selectActionsByChildren,
  selectParentsQuery,
  (entities, query) => query
    ? filterEntitiesByConnection(entities, query, 'parents')
    : entities
);
const selectActionsByCategories = createSelector(
  selectActionsByParents,
  selectCategoryQuery,
  (entities, query) => query
    ? filterEntitiesByCategories(entities, query)
    : entities
);
// const selectActionsByConnectedCategories = createSelector(
//   selectActionsByCategories,
//   selectConnections,
//   selectConnectedCategoryQuery,
//   (entities, connections, query) => query
//     ? filterEntitiesByConnectedCategories(entities, connections, query)
//     : entities
// );

// kicks off series of cascading selectors
// 1. selectEntitiesWhere filters by attribute
// 2. selectEntitiesSearchQuery filters by keyword
// 4. selectActionsWithout will filter by absence of taxonomy or connection
// 5. selectActionsByConnections will filter by specific connection
// 6. selectActionsByCategories will filter by specific categories
// 7. selectActionsByCOnnectedCategories will filter by specific categories connected via connection
export const selectViewActions = createSelector(
  selectActionsByCategories,
  (entities) => entities && entities.toList()
);
