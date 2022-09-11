import { createSelector } from 'reselect';
import { Map } from 'immutable';

import {
  selectEntities,
  selectActionsWhereQuery,
  selectWithoutQuery,
  selectAnyQuery,
  selectActorQuery,
  selectCategoryQuery,
  selectTargetedQuery,
  selectChildrenQuery,
  selectParentsQuery,
  selectResourceQuery,
  selectActors,
  selectActions,
  selectActorTaxonomies,
  // selectActortypes,
  selectReady,
  selectActorCategoriesGroupedByActor,
  selectActionCategoriesGroupedByAction,
  selectActorActionsGroupedByAction, // active
  selectActorActionsMembersGroupedByAction,
  selectActionActorsGroupedByAction, // passive, as targets
  selectActionActorsMembersGroupedByAction, // passive, as targets
  selectCategories,
  selectActionResourcesGroupedByAction,
  selectActionIndicatorsGroupedByAction,
  selectActionIndicatorsGroupedByActionAttributes,
  selectResources,
  selectIndicators,
  selectIncludeMembersForFiltering,
  selectActorActionsAssociationsGroupedByAction,
  selectActionActorsAssociationsGroupedByAction,
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
  entitiesSetCategoryIds,
  // filterTaxonomies,
  getTaxonomyCategories,
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

export const selectConnectedTaxonomies = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectConnections,
  selectActorTaxonomies,
  selectCategories,
  (state) => selectEntities(state, API.ACTOR_CATEGORIES),
  // selectActortypes,
  // (state) => selectEntities(state, API.ACTORTYPE_TAXONOMIES),
  (
    ready,
    connections,
    taxonomies,
    categories,
    actorCategories,
    // actortypes,
    // actortypeTaxonomies,
  ) => {
    if (!ready) return Map();
    const relationship = {
      tags: 'tags_actors',
      path: API.ACTORS,
      key: 'actor_id',
      associations: actorCategories,
    };
    // const connectedTaxonomies = filterTaxonomies(
    //   taxonomies,
    //   relationship.tags,
    //   true,
    // ).filter(
    //   (taxonomy) => actortypeTaxonomies.some(
    //     (actortypet) => actionActortypes.some(
    //       (actortype) => qe(API.ACTORSconnections
    //         actortype.get('id'),
    //         actortypet.getIn(['attributes', 'actortype_id']),
    //       ),
    //     ) && qe(
    //       taxonomy.get('id'),
    //       actortypet.getIn(['attributes', 'taxonomy_id']),
    //     )
    //   )
    // );
    // if (!connections.get(relationship.path)) {
    //   return connectedTaxonomies;
    // }
    const groupedAssociations = relationship.associations.filter(
      (association) => association.getIn(['attributes', relationship.key])
        && connections.getIn([
          relationship.path,
          association.getIn(['attributes', relationship.key]).toString(),
        ])
    ).groupBy(
      (association) => association.getIn(['attributes', 'category_id'])
    );
    return taxonomies.map(
      (taxonomy) => taxonomy.set(
        'categories',
        getTaxonomyCategories(
          taxonomy,
          categories,
          relationship,
          groupedAssociations,
        )
      )
    );
  }
);

// nest category ids
const selectActionsWithCategories = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActionsWhereQuery,
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
  selectActionActorsGroupedByAction, // targetConnectionsGrouped
  selectActionActorsMembersGroupedByAction,
  selectActionActorsAssociationsGroupedByAction,
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
    targetConnectionsGrouped,
    targetMemberConnectionsGrouped,
    targetAssociationConnectionsGrouped,
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
          // actors
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
          const entityActorsMembers = actorMemberConnectionsGrouped.get(parseInt(entity.get('id'), 10));
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
          const entityActorsAssociations = actorAssociationConnectionsGrouped.get(parseInt(entity.get('id'), 10));
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

          // targets
          const entityTargets = targetConnectionsGrouped.get(parseInt(entity.get('id'), 10));
          // console.log('actorConnectionsGrouped', actorConnectionsGrouped && actorConnectionsGrouped.toJS())
          // console.log('targetConnectionsGrouped', targetConnectionsGrouped && targetConnectionsGrouped.toJS())
          const entityTargetsByActortype = entityTargets && entityTargets.filter(
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

          // targets as members
          // indirect targets (via groups "children of targets")
          const entityTargetsMembers = targetMemberConnectionsGrouped.get(parseInt(entity.get('id'), 10));
          // console.log('actorConnectionsGrouped', actorConnectionsGrouped && actorConnectionsGrouped.toJS())
          // console.log('targetConnectionsGrouped', targetConnectionsGrouped && targetConnectionsGrouped.toJS())
          const entityTargetsMembersByActortype = entityTargetsMembers && entityTargetsMembers.filter(
            (actorId) => connections.getIn([
              'actors',
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
          // targets as parents
          const entityTargetsAssociations = targetAssociationConnectionsGrouped.get(parseInt(entity.get('id'), 10));
          const entityTargetsAssociationsByActortype = entityTargetsAssociations && entityTargetsAssociations.filter(
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

          // indirect targets (via children, "targets of children")
          const entityTargetsViaChildren = entityChildren && entityChildren.reduce(
            (memo, childId) => {
              const childTargets = targetConnectionsGrouped.get(parseInt(childId, 10));
              return childTargets
                ? childTargets.reduce(
                  (memo2, childTarget, key) => memo2.includes(childTarget)
                    ? memo2
                    : memo2.set(key, childTarget),
                  memo,
                )
                : memo;
            },
            Map(),
          );
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
            // directly connected targets
            .set('targets', entityTargets)
            .set('targetsByType', entityTargetsByActortype)
            // indirectly connected targets (via group, region, class)
            .set('targetsMembers', entityTargetsMembers)
            .set('targetsMembersByType', entityTargetsMembersByActortype)
            .set('targetsViaChildren', entityTargetsViaChildren)
            // indirectly connected targets (group, region, class a directly connected actor belongs to)
            .set('targetsAssociations', entityTargetsAssociations)
            .set('targetsAssociationsByType', entityTargetsAssociationsByActortype)
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

const selectActionsWithout = createSelector(
  selectActionsWithConnections,
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
        return filterEntitiesByMultipleConnections(entities, query, ['actors', 'actorsAssociations']);
      }
      return filterEntitiesByConnection(entities, query, 'actors');
    }
    return entities;
  }
);
const selectActionsByTargets = createSelector(
  selectActionsByActors,
  selectTargetedQuery,
  selectIncludeMembersForFiltering,
  (entities, query, includeMembers) => {
    if (query) {
      if (includeMembers) {
        return filterEntitiesByMultipleConnections(
          entities,
          query,
          ['targets', 'targetsAssociations'],
          true, // any
        );
      }
      return filterEntitiesByConnection(
        entities,
        query,
        'targets',
        null, // connectionAttribute
        true, // any
      );
    }
    return entities;
  }
);
const selectActionsByUsers = createSelector(
  selectActionsByTargets,
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
