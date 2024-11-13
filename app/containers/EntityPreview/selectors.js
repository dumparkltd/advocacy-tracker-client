import { createSelector } from 'reselect';
import { Map } from 'immutable';
import {
  API,
  ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS,
  ACTORTYPES_CONFIG,
} from 'themes/config';
import {
  selectEntity,
  selectIndicators,
  selectIndicatorConnections,
  selectActionIndicatorsGroupedByAction,
  selectActionIndicatorsGroupedByIndicator,
  selectActionIndicatorsGroupedByActionAttributes,
  selectActorActionsGroupedByActionAttributes,
  selectActorActionsGroupedByActor,
  selectMembershipsGroupedByParent,
  selectMembershipsGroupedByMember,
  selectUserActorsGroupedByActor,
  selectActorActionsGroupedByAction,
  selectActors,
  selectActorCategoriesGroupedByActor,
  selectCategories,
  selectActorConnections,
  selectTaxonomiesSorted,
  selectEntities,
  selectUserConnections,
  selectUserActorsGroupedByUser,
  selectUserActionsGroupedByUser,
  selectUsers,
} from 'containers/App/selectors';

import qe from 'utils/quasi-equals';
import {
  setIndicatorConnections,
  setActorConnections,
  prepareTaxonomiesIsAssociated,
  setUserConnections,
} from 'utils/entities';

const selectIndicatorAssociations = createSelector(
  (state, { id }) => id,
  selectActionIndicatorsGroupedByAction,
  (actionId, associationsByAction) => associationsByAction.get(
    parseInt(actionId, 10)
  )
);
const selectIndicatorsAssociated = createSelector(
  selectIndicators,
  selectIndicatorAssociations,
  (indicators, associations) => indicators && associations && associations.reduce(
    (memo, id) => {
      const entity = indicators.get(id.toString());
      return entity
        ? memo.set(id, entity)
        : memo;
    },
    Map(),
  )
);

// connected actors (members/associations)
const selectMemberJoins = createSelector(
  (state, { id }) => id,
  selectMembershipsGroupedByParent,
  (actorId, joinsByAssociation) => joinsByAssociation.get(
    parseInt(actorId, 10)
  )
);
const selectMembersJoined = createSelector(
  selectActors,
  selectMemberJoins,
  (members, joins) => members && joins && joins.reduce(
    (memo, id) => {
      const entity = members.get(id.toString());
      return entity
        ? memo.set(id, entity)
        : memo;
    },
    Map(),
  )
);
// get associated actors with associoted actions and categories
// - group by actortype
export const selectActorMembersByType = createSelector(
  (state, { id }) => id,
  selectMembersJoined,
  selectActorConnections,
  selectActorActionsGroupedByActor,
  selectMembershipsGroupedByMember,
  selectMembershipsGroupedByParent,
  selectActorCategoriesGroupedByActor,
  selectCategories,
  (
    id,
    actors,
    actorConnections,
    actorActions,
    memberships,
    associations,
    actorCategories,
    categories,
  ) => {
    if (!id) return Map();
    return actors && actors
      .filter((actor) => !!actor)
      .map((actor) => setActorConnections({
        actor,
        actorConnections,
        actorActions,
        categories,
        actorCategories,
        memberships,
        associations,
      }))
      .groupBy((r) => r.getIn(['attributes', 'actortype_id']))
      .sortBy(
        (val, key) => key,
        (a, b) => {
          const configA = ACTORTYPES_CONFIG[a];
          const configB = ACTORTYPES_CONFIG[b];
          return configA.order < configB.order ? -1 : 1;
        }
      );
  }
);

// all groups joins current actor has as member
const selectAssociationJoins = createSelector(
  (state, { id }) => id,
  selectMembershipsGroupedByMember,
  (actorId, joinsByMember) => actorId && joinsByMember.get(
    parseInt(actorId, 10)
  )
);
// all groups current actor is member of
const selectAssociationsJoined = createSelector(
  selectActors,
  selectAssociationJoins,
  (members, joins) => members && joins && joins.reduce(
    (memo, id) => {
      const entity = members.get(id.toString());
      return entity
        ? memo.set(id, entity)
        : memo;
    },
    Map(),
  )
);
// get associated actors with associoted actions and categories
// - group by actortype
export const selectActorAssociationsByType = createSelector(
  (state, { id }) => id,
  selectAssociationsJoined,
  (
    id,
    actors,
  ) => {
    if (!id) return Map();
    return actors && actors
      .groupBy((r) => r.getIn(['attributes', 'actortype_id']))
      .sortBy((val, key) => key);
  }
);

const selectActionViewTaxonomyOptions = createSelector(
  (state, { id, path }) => selectEntity(state, { id, path }),
  selectTaxonomiesSorted,
  (state) => selectEntities(state, API.ACTIONTYPE_TAXONOMIES),
  selectCategories,
  (state) => selectEntities(state, API.ACTION_CATEGORIES),
  (
    entity,
    taxonomies,
    typeTaxonomies,
    categories,
    associations,
  ) => {
    if (
      entity
      && taxonomies
      && typeTaxonomies
      && categories
      && associations
    ) {
      const id = entity.get('id');
      const taxonomiesForType = taxonomies.filter((tax) => typeTaxonomies.some(
        (type) => qe(
          type.getIn(['attributes', 'taxonomy_id']),
          tax.get('id')
        ) && qe(
          entity.getIn(['attributes', 'measuretype_id']),
          type.getIn(['attributes', 'measuretype_id'])
        )
      ));
      return prepareTaxonomiesIsAssociated(
        taxonomiesForType,
        categories,
        associations,
        'tags_actions',
        'measure_id',
        id,
      );
    }
    return null;
  }
);
const selectActorViewTaxonomyOptions = createSelector(
  (state, { id, path }) => selectEntity(state, { id, path }),
  selectTaxonomiesSorted,
  (state) => selectEntities(state, API.ACTORTYPE_TAXONOMIES),
  selectCategories,
  (state) => selectEntities(state, API.ACTOR_CATEGORIES),
  (
    entity,
    taxonomies,
    typeTaxonomies,
    categories,
    associations,
  ) => {
    if (
      entity
      && taxonomies
      && typeTaxonomies
      && categories
      && associations
    ) {
      const id = entity.get('id');
      const taxonomiesForType = taxonomies.filter((tax) => typeTaxonomies.some(
        (type) => qe(
          type.getIn(['attributes', 'taxonomy_id']),
          tax.get('id'),
        ) && qe(
          type.getIn(['attributes', 'actortype_id']),
          entity.getIn(['attributes', 'actortype_id']),
        )
      ));
      return prepareTaxonomiesIsAssociated(
        taxonomiesForType,
        categories,
        associations,
        'tags_actions',
        'actor_id',
        id,
      );
    }
    return null;
  }
);
const selectActorAssociations = createSelector(
  (state, { id }) => id,
  selectActorActionsGroupedByAction,
  (actionId, associationsByAction) => associationsByAction.get(
    parseInt(actionId, 10)
  )
);
const selectActorsAssociated = createSelector(
  selectActors,
  selectActorAssociations,
  (actors, associations) => actors && associations && associations.reduce(
    (memo, id) => {
      const entity = actors.get(id.toString());
      return entity
        ? memo.set(id, entity)
        : memo;
    },
    Map(),
  )
);
// get associated actors with associoted actions and categories
// - group by actortype
export const selectActorsByType = createSelector(
  selectActorsAssociated,
  selectActorConnections,
  selectActorActionsGroupedByActionAttributes,
  selectActorActionsGroupedByActor,
  selectMembershipsGroupedByMember,
  selectMembershipsGroupedByParent,
  selectActorCategoriesGroupedByActor,
  selectUserActorsGroupedByActor,
  selectCategories,
  (
    actors,
    actorConnections,
    actorActionsByActionFull,
    actorActionsByActor,
    memberships,
    associations,
    actorCategories,
    userActorsByActor,
    categories,
  ) => {
    if (!actors) return Map();
    const actorsWithConnections = actors && actors
      .filter((actor) => !!actor)
      .map((actor) => setActorConnections({
        actor,
        actorConnections,
        actorActions: actorActionsByActor,
        categories,
        actorCategories,
        memberships,
        associations,
        users: userActorsByActor,
      }));
    return actorsWithConnections && actorsWithConnections
      .groupBy((r) => r.getIn(['attributes', 'actortype_id']))
      .sortBy(
        (val, key) => key,
        (a, b) => {
          const configA = ACTORTYPES_CONFIG[a];
          const configB = ACTORTYPES_CONFIG[b];
          return configA.order < configB.order ? -1 : 1;
        }
      );
  }
);
export const selectPreviewEntity = createSelector(
  (state, { id, path }) => selectEntity(state, { id, path }),
  selectIndicatorsAssociated,
  selectIndicatorConnections,
  selectActionIndicatorsGroupedByActionAttributes,
  selectActionIndicatorsGroupedByIndicator,
  selectActionViewTaxonomyOptions,
  selectActorsByType,

  selectActorMembersByType,
  selectActorAssociationsByType,
  selectActorViewTaxonomyOptions,

  (
    previewEntity,
    indicators,
    indicatorConnections,
    actionIndicatorsByActionFull,
    actionIndicators,
    actionTaxonomiesWithCategories,
    actionActorsByType,

    actorMembersByType,
    actorAssociationsByType,
    actorTaxonomiesWithCategories,
  ) => {
    if (
      !previewEntity
    ) return null;
    if (previewEntity.get('type') === API.ACTIONS) {
      let indicatorsWithConnections;
      const hasSupportLevel = previewEntity
        && ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS[previewEntity.getIn(['attributes', 'measuretype_id'])]
        && ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS[previewEntity.getIn(['attributes', 'measuretype_id'])].length > 0;
      if (hasSupportLevel && indicators && indicatorConnections && actionIndicators) {
        indicatorsWithConnections = indicators
          .map((indicator) => setIndicatorConnections({
            indicator,
            indicatorConnections,
            actionIndicators,
          }));
        const viewEntityActors = actionIndicatorsByActionFull.get(parseInt(previewEntity.get('id'), 10));
        if (viewEntityActors) {
          indicatorsWithConnections = indicatorsWithConnections.map(
            (indicator) => {
              let indicatorX = indicator;
              // console.log(actor && actor.toJS())
              const indicatorConnection = viewEntityActors.find(
                (connection) => qe(indicator.get('id'), connection.get('indicator_id'))
              );
              if (indicatorConnection) {
                indicatorX = indicatorX.setIn(['supportlevel', previewEntity.get('id')], indicatorConnection.get('supportlevel_id'));
              }
              return indicatorX;
            }
          );
        }
      }
      return previewEntity
        .set('indicators', indicatorsWithConnections ? indicatorsWithConnections.sortBy((val, key) => key) : Map())
        .set('categories', actionTaxonomiesWithCategories)
        .set('actorsByType', actionActorsByType);
    }
    if (previewEntity.get('type') === API.ACTORS) {
      return previewEntity
        .set('membersByType', actorMembersByType)
        .set('associationsByType', actorAssociationsByType)
        .set('taxonomiesByType', actorTaxonomiesWithCategories);
    }
    return previewEntity;
  }
);
//
// export const selectConnections = createSelector(
//   (state, { item }) => item,
//   select
//   // selectIndicatorsAssociated,
// export const selectPreviewContent = createSelector(
//   (state, { item }) => item,
//   // selectIndicatorsAssociated,
//   // selectIndicatorConnections,
//   // selectActionIndicatorsGroupedByActionAttributes,
//   // selectActionIndicatorsGroupedByIndicator,
//   (
//     item,
//     // indicators,
//     // indicatorConnections,
//     // actionIndicatorsByActionFull,
//     // actionIndicators,
//   ) => {
//     if (!item) return null;
//     return null;
//   }
// );

const selectUserAssociations = createSelector(
  (state, id) => id,
  selectUserActorsGroupedByActor,
  (actorId, associationsByActor) => associationsByActor.get(
    parseInt(actorId, 10)
  )
);
const selectUsersAssociated = createSelector(
  selectUsers,
  selectUserAssociations,
  (users, associations) => users && associations && associations.reduce(
    (memo, id) => {
      const entity = users.get(id.toString());
      return entity
        ? memo.set(id, entity)
        : memo;
    },
    Map(),
  )
);

export const selectEntityUsers = createSelector(
  selectUsersAssociated,
  selectUserConnections,
  selectUserActorsGroupedByUser,
  selectUserActionsGroupedByUser,
  (
    users,
    userConnections,
    userActors,
    userActions,
  ) => {
    if (!users || !userConnections) return Map();
    return users && users
      .map((user) => setUserConnections({
        user,
        userConnections,
        userActors,
        userActions,
      }))
      .sortBy((val, key) => key);
  }
);
