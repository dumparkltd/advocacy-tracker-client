import { createSelector } from 'reselect';
import { Map } from 'immutable';

import {
  selectActiontypeActions,
  selectAttributeQuery,
  // selectWithoutQuery,
  // selectAnyQuery,
  selectActorQuery,
  selectActors,
  // selectActortypes,
  selectReady,
  selectActorActionsMembersGroupedByAction,
  selectActorActionsGroupedByAction, // active
  selectActionIndicatorsGroupedByAction,
  selectActionIndicatorsGroupedByActionAttributes,
  selectIndicators,
  selectIncludeMembersForFiltering,
  selectActorActionsAssociationsGroupedByAction,
  selectIndicatorQuery,
} from 'containers/App/selectors';

import {
  // filterEntitiesByAttributes,
  filterEntitiesByConnection,
  filterEntitiesByMultipleConnections,
  // filterEntitiesByConnectedCategories,
  // filterEntitiesByConnectionAttributes,
  // filterEntitiesWithoutAssociation,
  // filterEntitiesWithAnyAssociation,
  filterEntitiesByAttributes,
} from 'utils/entities';

import { API } from 'themes/config';

import { DEPENDENCIES } from './constants';

export const selectConnections = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActors,
  selectIndicators,
  (
    ready,
    actors,
    indicators,
  ) => {
    if (ready) {
      return new Map()
        .set(
          API.ACTORS,
          actors,
        ).set(
          API.INDICATORS,
          indicators,
        );
    }
    return new Map();
  }
);


// nest connected actor ids
// nest connected actor ids by actortype
export const selectActionsWithConnections = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActiontypeActions,
  selectConnections,
  selectActorActionsMembersGroupedByAction,
  selectActorActionsGroupedByAction,
  selectActorActionsAssociationsGroupedByAction,
  selectActionIndicatorsGroupedByAction,
  selectActionIndicatorsGroupedByActionAttributes,
  (
    ready,
    entities,
    connections,
    actorConnectionsGrouped,
    actorMemberConnectionsGrouped,
    actorAssociationConnectionsGrouped,
    indicatorAssociationsGrouped,
    indicatorAssociationsFullGrouped,
  ) => {
    // console.log(actorConnectionsGrouped && actorConnectionsGrouped.toJS())
    if (ready && (connections.get(API.ACTORS) || connections.get(API.INDICATORS))) {
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

          // indicators
          const entityIndicators = indicatorAssociationsGrouped.get(
            parseInt(entity.get('id'), 10)
          );
          const entityIndicatorConnections = indicatorAssociationsFullGrouped.get(
            parseInt(entity.get('id'), 10)
          );

          return entity
            // directly connected actors
            .set('actors', entityActors)
            .set('actorsByType', entityActorsByActortype)
            // indirectly connected actors (group, region, class a directly connected actor belongs to)
            .set('actorsAssociations', entityActorsAssociations)
            .set('actorsAssociationsByType', entityActorsAssociationsByActortype)
            // indirectly connected actors (member of a directly connected group)
            .set('actorsMembers', entityActorsMembers)
            .set('actorsMembersByType', entityActorsMembersByActortype)
            .set('indicators', entityIndicators)
            .set('indicatorConnections', entityIndicatorConnections);
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

const selectActionsByActors = createSelector(
  selectActionsWhereQuery,
  selectActorQuery,
  selectIncludeMembersForFiltering,
  (entities, query, includeMembers) => {
    if (query) {
      if (includeMembers) {
        return filterEntitiesByMultipleConnections(
          entities,
          query,
          ['actors', 'actorsAssociations'],
          true, // any
        );
      }
      return filterEntitiesByConnection(entities, query, 'actors');
    }
    return entities;
  }
);

const selectActionsByIndicators = createSelector(
  selectActionsByActors,
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

// kicks off series of cascading selectors
// 1. selectActionsByIndicators
// 2. selectActionsByActors
// 3. selectEntitiesWhere filters by attribute
// 4. selectAttributeQuery
export const selectViewActions = createSelector(
  selectActionsByIndicators,
  (entities) => entities && entities.toList()
);
