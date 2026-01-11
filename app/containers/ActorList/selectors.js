import { createSelector } from 'reselect';
import { Map } from 'immutable';
import asList from 'utils/as-list';

import {
  selectActorsWithPositions,
  selectAttributeQuery,
  selectWithoutQuery,
  selectAnyQuery,
  selectActionQuery,
  selectCategoryQuery,
  selectActions,
  selectActors,
  selectReady,
  selectActorCategoriesGroupedByActor,
  selectActionCategoriesGroupedByAction,
  selectActorActionsGroupedByActor,
  selectMembershipsGroupedByMember,
  selectMembershipParentsGroupedByMember,
  selectMembershipsGroupedByParent,
  selectCategories,
  selectMemberQuery,
  selectAssociationQuery,
  selectUserQuery,
  selectUserActorsGroupedByActor,
  selectUsers,
  selectIncludeMembersForFiltering,
  selectIncludeActorMembers,
  selectIncludeActorChildren,
  selectIndicators,
  selectLocationQuery,
  // selectActortypeActors,
} from 'containers/App/selectors';

import {
  checkQuery,
  filterEntitiesByConnection,
  filterEntitiesByCategories,
  filterEntitiesWithoutAssociation,
  filterEntitiesWithAnyAssociation,
  filterEntitiesByMultipleConnections,
  filterEntitiesByAttributes,
  entitiesSetCategoryIds,
  actionsByType,
  actorsByType,
} from 'utils/entities';
// import { qe } from 'utils/quasi-equals';
import { getValueFromPositions } from 'containers/EntityListTable/utils';

import { API, INDICATOR_ACTION_ACTORTYPES } from 'themes/config';

import { DEPENDENCIES } from './constants';

export const selectConnections = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActions,
  selectActors,
  selectActionCategoriesGroupedByAction,
  selectActorCategoriesGroupedByActor,
  selectUsers,
  selectCategories,
  selectIndicators,
  (
    ready,
    actions,
    actors,
    actionAssociationsGrouped,
    actorAssociationsGrouped,
    users,
    categories,
    indicators,
  ) => {
    if (ready) {
      return new Map().set(
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
      ).set(
        API.USERS,
        users,
      ).set(
        API.INDICATORS,
        indicators,
      );
    }
    return new Map();
  }
);

const selectActorsWithCategories = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActorsWithPositions,
  selectActorCategoriesGroupedByActor,
  selectCategories,
  (ready, actors, associationsGrouped, categories) => {
    if (ready) {
      return entitiesSetCategoryIds(
        actors,
        associationsGrouped,
        categories,
      );
    }
    return actors;
  }
);
// const selectActorsWithActions = createSelector(
//   (state) => selectReady(state, { path: DEPENDENCIES }),
//   selectActorsWithCategories,
//   (state) => selectActorConnections(state),
//   selectActorActionsGroupedByActor,
//   (ready, entities, connections, associationsGrouped) => {
//     if (ready && connections.get('actions')) {
//       return entities.map(
//         (entity) => entity.set(
//           'actions',
//           associationsGrouped.get(parseInt(entity.get('id'), 10)),
//         )
//       );
//     }
//     return entities;
//   }
// );

export const selectActorsWithConnections = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActorsWithCategories,
  selectConnections,
  selectActorActionsGroupedByActor,
  selectMembershipsGroupedByParent,
  selectMembershipsGroupedByMember,
  selectMembershipParentsGroupedByMember,
  selectUserActorsGroupedByActor,
  (
    ready,
    actors,
    connections,
    actionsAsActorGrouped,
    memberConnectionsGrouped,
    associationConnectionsGrouped,
    associationParentConnectionsGrouped,
    userConnectionsGrouped,
  ) => {
    if (ready) {
      return actors.map(
        (actor) => {
          const actorId = parseInt(actor.get('id'), 10);
          // actors
          const actorActions = actionsAsActorGrouped.get(actorId) || Map();
          const actorActionsByType = actionsByType(actorActions, connections.get(API.ACTIONS));

          // members
          const actorMembers = memberConnectionsGrouped.get(actorId);
          const actorMembersByType = actorsByType(actorMembers, connections.get(API.ACTORS));

          // memberships
          const actorAssociations = associationConnectionsGrouped.get(actorId);
          const actorAssociationsByType = actorsByType(actorAssociations, connections.get(API.ACTORS));

          // memberships of children
          let actorAssociationParents = associationParentConnectionsGrouped.get(actorId);
          if (actorAssociationParents) {
            actorAssociationParents = actorAssociationParents.toSet().toMap();
          }
          const actorAssociationParentsByType = actorsByType(actorAssociationParents, connections.get(API.ACTORS));

          // actions as member of group
          const actorActionsAsMember = actorAssociations && actorAssociations.size > 0 && actorAssociations.reduce((memo, associationId) => {
            const associationActions = actionsAsActorGrouped.get(parseInt(associationId, 10));
            if (associationActions) {
              return memo.concat(associationActions);
            }
            return memo;
          }, Map());
          const actorActionsAsMemberByType = actorActionsAsMember && actionsByType(actorActionsAsMember, connections.get(API.ACTIONS));

          // actions as parent of actor
          const actorActionsAsParent = actorMembers && actorMembers.size > 0 && actorMembers.reduce((memo, memberId) => {
            const memberActions = actionsAsActorGrouped.get(parseInt(memberId, 10));
            if (memberActions) {
              return memo.concat(memberActions);
            }
            return memo;
          }, Map());
          const actorActionsAsParentByType = actorActionsAsParent && actionsByType(actorActionsAsParent, connections.get(API.ACTIONS));

          const actorUsers = userConnectionsGrouped.get(actorId);

          return actor
            .set('actions', actorActions)
            .set('actionsByType', actorActionsByType)
            .set('actionsAsMembers', actorActionsAsMember)
            .set('actionsAsMemberByType', actorActionsAsMemberByType)
            .set('actionsAsParent', actorActionsAsParent)
            .set('actionsAsParentByType', actorActionsAsParentByType)
            .set('members', actorMembers)
            .set('membersByType', actorMembersByType)
            .set('associations', actorAssociations)
            .set('associationsByType', actorAssociationsByType)
            .set('associationsAssociations', actorAssociationParents)
            .set('associationsAssociationsByType', actorAssociationParentsByType)
            .set('users', actorUsers);
        }
      );
    }
    return actors;
  }
);

const selectActorsWhereQuery = createSelector(
  selectAttributeQuery,
  selectActorsWithConnections, // type should be optional
  (query, entities) => query
    ? filterEntitiesByAttributes(entities, query)
    : entities
);

const selectActorsWithout = createSelector(
  selectActorsWhereQuery,
  selectCategories,
  selectWithoutQuery,
  (entities, categories, query) => query
    ? filterEntitiesWithoutAssociation(entities, categories, query)
    : entities
);
const selectActorsAny = createSelector(
  selectActorsWithout,
  selectCategories,
  selectAnyQuery,
  (entities, categories, query) => query
    ? filterEntitiesWithAnyAssociation(entities, categories, query)
    : entities
);
const selectActorsByActions = createSelector(
  selectActorsAny,
  selectActionQuery,
  selectIncludeActorMembers,
  selectIncludeActorChildren,
  (entities, query, includeActorMembersQuery, includeActorChildrenQuery) => query && entities
    ? entities.filter(
      (entity) => {
        let pass = asList(query).some(
          (queryValue) => checkQuery({
            entity,
            queryValue,
            path: 'actions',
          })
        );
        if (!pass && includeActorMembersQuery) {
          pass = asList(query).some(
            (queryValue) => checkQuery({
              entity,
              queryValue,
              path: 'actionsAsMembers',
            })
          );
        }
        if (!pass && includeActorChildrenQuery) {
          pass = asList(query).some(
            (queryValue) => checkQuery({
              entity,
              queryValue,
              path: 'actionsAsParent',
            })
          );
        }
        return pass;
      }
    )
    : entities
);

const selectActorsByTopicPosition = createSelector(
  (state, params) => params && params.type,
  selectActorsByActions,
  selectLocationQuery,
  (type, actors, locationQuery) => {
    if (INDICATOR_ACTION_ACTORTYPES.indexOf(type) > -1 && locationQuery.get('indicators')) {
      const locationQueryValue = locationQuery.get('indicators');
      // console.log('locationQueryValue', type, locationQueryValue)
      return actors.filter((actor) => {
        const countryPositions = actor.get('indicatorPositions');
        // countries pass when they pass all queried indicators
        const pass = asList(locationQueryValue).reduce(
          (memo, queryValue) => {
            if (!memo) return memo;
            const indicatorId = queryValue.split('>')[0];
            const countryIndicatorPositions = countryPositions && countryPositions.get(indicatorId);
            // console.log('countryIndicatorPosition', countryIndicatorPositions && countryIndicatorPositions.toJS())
            if (!countryIndicatorPositions || countryIndicatorPositions.size === 0) {
              return false;
            }
            let countrySupportLevel;
            if (countryPositions) {
              countrySupportLevel = getValueFromPositions(countryPositions.get(indicatorId));
            }
            countrySupportLevel = countrySupportLevel || 99;
            const levels = queryValue.indexOf('=') > -1
              && queryValue.split('=')[1].split('|');
            if (!levels) return memo;
            return levels.indexOf(`${countrySupportLevel}`) > -1;
          },
          true,
        );
        return pass;
      });
    }
    return actors;
  }
);

const selectActorsByMembers = createSelector(
  selectActorsByTopicPosition,
  selectMemberQuery,
  (entities, query) => query
    ? filterEntitiesByConnection(entities, query, 'members')
    : entities
);
const selectActorsByAssociations = createSelector(
  selectActorsByMembers,
  selectAssociationQuery,
  selectIncludeMembersForFiltering,
  (entities, query, includeMembers) => {
    if (query) {
      if (includeMembers) {
        return filterEntitiesByMultipleConnections(
          entities,
          query,
          ['associations', 'associationsAssociations'],
          true, // any
        );
      }
      return filterEntitiesByConnection(entities, query, 'associations');
    }
    return entities;
  }
);
const selectActorsByUsers = createSelector(
  selectActorsByAssociations,
  selectUserQuery,
  (entities, query) => query
    ? filterEntitiesByConnection(entities, query, 'users')
    : entities
);
const selectActorsByCategories = createSelector(
  selectActorsByUsers,
  selectCategoryQuery,
  (entities, query) => query
    ? filterEntitiesByCategories(entities, query)
    : entities
);

// TODO adapt for actors
// const selectActionsByConnectedCategories = createSelector(
//   selectActionsByCategories,
//   selectConnections,
//   (state, { locationQuery }) => selectConnectedCategoryQuery(state, locationQuery),
//   (entities, connections, query) => query
//     ? filterEntitiesByConnectedCategories(entities, connections, query)
//     : entities
// );


// kicks off series of cascading selectors
// 1. selectEntitiesWhere filters by attribute
// 2. selectEntitiesSearchQuery filters by keyword
// 4. selectActorsWithout will filter by absence of taxonomy or connection
// 5. selectActorsByConnections will filter by specific connection
// 6. selectActorsByCategories will filter by specific categories
export const selectListActors = createSelector(
  selectActorsByCategories,
  (entities) => entities && entities.toList()
);
