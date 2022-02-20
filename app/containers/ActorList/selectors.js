import { createSelector } from 'reselect';
import { Map } from 'immutable';
import {
  selectEntities,
  selectActorsSearchQuery,
  selectWithoutQuery,
  selectActionQuery,
  selectCategoryQuery,
  selectSortByQuery,
  selectSortOrderQuery,
  selectActions,
  selectActors,
  selectReady,
  selectActorCategoriesGroupedByActor,
  selectActionCategoriesGroupedByAction,
  selectActorActionsGroupedByActor,
  selectActionActorsGroupedByActor,
  selectMembershipsGroupedByMember,
  selectMembershipsGroupedByAssociation,
  selectCategories,
  selectTargetingQuery,
  selectActionTaxonomies,
  selectMemberQuery,
  selectAssociationQuery,
  selectUserQuery,
  selectUserActorsGroupedByActor,
  selectUsers,
} from 'containers/App/selectors';

import {
  filterEntitiesByConnection,
  filterEntitiesByCategories,
  filterEntitiesWithoutAssociation,
  entitiesSetCategoryIds,
  getTaxonomyCategories,
} from 'utils/entities';
// import { qe } from 'utils/quasi-equals';

import { sortEntities, getSortOption } from 'utils/sort';

import { API } from 'themes/config';

import { CONFIG, DEPENDENCIES } from './constants';

export const selectConnections = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActions,
  selectActors,
  selectActionCategoriesGroupedByAction,
  selectActorCategoriesGroupedByActor,
  selectUsers,
  selectCategories,
  (
    ready,
    actions,
    actors,
    actionAssociationsGrouped,
    actorAssociationsGrouped,
    users,
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
      );
    }
    return new Map();
  }
);

// export const selectConnectedTaxonomies = createSelector(
//   (state) => selectActiontypeTaxonomies(state),
//   selectCategories,
//   (taxonomies, categories) => prepareTaxonomiesMultipleTags(
//     taxonomies,
//     categories,
//     ['tags_actions'],
//   )
// );


export const selectConnectedTaxonomies = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectConnections,
  selectActionTaxonomies,
  selectCategories,
  (state) => selectEntities(state, API.ACTION_CATEGORIES),
  (
    ready,
    connections,
    taxonomies,
    categories,
    actionCategories,
  ) => {
    if (!ready) return Map();
    const relationship = {
      tags: 'tags_actions',
      path: 'actions',
      key: 'measure_id',
      associations: actionCategories,
    };

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

const selectActorsWithCategories = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  (state, args) => selectActorsSearchQuery(state, {
    searchAttributes: CONFIG.views.list.search || ['code', 'title'],
    ...args,
  }),
  selectActorCategoriesGroupedByActor,
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
const actionsByType = (actorActions, actions) => actorActions && actions && actorActions.filter(
  (id) => actions.get(id.toString())
).groupBy(
  (actionId) => actions.getIn([
    actionId.toString(),
    'attributes',
    'measuretype_id',
  ])
).sortBy((val, key) => key);

const actorsByType = (actorActors, actors) => actorActors && actors && actorActors.filter(
  (id) => actors.get(id.toString())
).groupBy(
  (actionId) => actors.getIn([
    actionId.toString(),
    'attributes',
    'actortype_id',
  ])
).sortBy((val, key) => key);

const selectActorsWithActions = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActorsWithCategories,
  selectConnections,
  selectActorActionsGroupedByActor,
  selectActionActorsGroupedByActor, // as targets
  selectMembershipsGroupedByAssociation,
  selectMembershipsGroupedByMember,
  selectUserActorsGroupedByActor,
  (
    ready,
    actors,
    connections,
    actionsAsActorGrouped,
    actionsAsTargetGrouped,
    memberAssociationsGrouped,
    associationAssociationsGrouped,
    userAssociationsGrouped,
  ) => {
    if (ready) {
      return actors.map(
        (actor) => {
          // actors
          const actorActions = actionsAsActorGrouped.get(parseInt(actor.get('id'), 10)) || Map();
          const actorActionsByType = actionsByType(actorActions, connections.get(API.ACTIONS));

          // targets
          const targetActions = actionsAsTargetGrouped.get(parseInt(actor.get('id'), 10)) || Map();
          const targetingActionsByType = actionsByType(targetActions, connections.get(API.ACTIONS));

          // members
          const actorMembers = memberAssociationsGrouped.get(parseInt(actor.get('id'), 10));
          const actorMembersByType = actorsByType(actorMembers, connections.get(API.ACTORS));

          // memberships
          const actorAssociations = associationAssociationsGrouped.get(parseInt(actor.get('id'), 10));
          const actorAssociationsByType = actorsByType(actorAssociations, connections.get(API.ACTORS));

          // actions as member of group
          const actorActionsAsMember = actorAssociations && actorAssociations.size > 0 && actorAssociations.reduce((memo, associationId) => {
            const associationActions = actionsAsActorGrouped.get(parseInt(associationId, 10));
            if (associationActions) {
              return memo.concat(associationActions);
            }
            return memo;
          }, Map());
          const actorActionsAsMemberByType = actorActionsAsMember && actionsByType(actorActionsAsMember, connections.get(API.ACTIONS));

          // targeted by actions as member of group
          const targetActionsAsMember = actorAssociations && actorAssociations.size > 0 && actorAssociations.reduce((memo, associationId) => {
            const associationActionsAsTarget = actionsAsTargetGrouped.get(parseInt(associationId, 10));
            if (associationActionsAsTarget) {
              return memo.concat(associationActionsAsTarget);
            }
            return memo;
          }, Map());
          const targetActionsAsMemberByType = targetActionsAsMember && actionsByType(targetActionsAsMember, connections.get(API.ACTIONS));
          const actorUsers = userAssociationsGrouped.get(parseInt(actor.get('id'), 10));
          return actor
            .set('actions', actorActions)
            .set('actionsByType', actorActionsByType)
            .set('actionsAsMembers', actorActionsAsMember)
            .set('actionsAsMembersByType', actorActionsAsMemberByType)
            .set('targetingActions', targetActions)
            .set('targetingActionsByType', targetingActionsByType)
            .set('targetingActionsAsMember', targetActionsAsMember)
            .set('targetingActionsAsMemberByType', targetActionsAsMemberByType)
            .set('members', actorMembers)
            .set('membersByType', actorMembersByType)
            .set('associations', actorAssociations)
            .set('associationsByType', actorAssociationsByType)
            .set('users', actorUsers);
        }
      );
    }
    return actors;
  }
);

// TODO probably not needed
// const selectActorsByActortype = createSelector(
//   selectActorsWithActions,
//   selectActortypeQuery,
//   selectActortypeListQuery,
//   (entities, actortypeQuery, listQuery) => actortypeQuery === 'all'
//     && listQuery
//     ? entities.filter(
//       (entity) => qe(
//         entity.getIn(['attributes', 'actortype_id']),
//         listQuery,
//       )
//     )
//     : entities
// );

const selectActorsWithout = createSelector(
  selectActorsWithActions,
  selectCategories,
  selectWithoutQuery,
  (entities, categories, query) => query
    ? filterEntitiesWithoutAssociation(entities, categories, query)
    : entities
);
const selectActorsByActions = createSelector(
  selectActorsWithout,
  selectActionQuery,
  (entities, query) => query
    ? filterEntitiesByConnection(entities, query, 'actions')
    : entities
);
const selectActorsByTargeted = createSelector(
  selectActorsByActions,
  selectTargetingQuery,
  (entities, query) => query
    ? filterEntitiesByConnection(entities, query, 'targeting')
    : entities
);

const selectActorsByMembers = createSelector(
  selectActorsByTargeted,
  selectMemberQuery,
  (entities, query) => query
    ? filterEntitiesByConnection(entities, query, 'members')
    : entities
);
const selectActorsByAssociations = createSelector(
  selectActorsByMembers,
  selectAssociationQuery,
  (entities, query) => query
    ? filterEntitiesByConnection(entities, query, 'associations')
    : entities
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
