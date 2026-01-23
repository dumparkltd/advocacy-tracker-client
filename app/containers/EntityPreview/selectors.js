import { createSelector } from 'reselect';
import { Map } from 'immutable';
import {
  API,
  ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS,
  ACTORTYPES_CONFIG,
  ACTORTYPES,
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
  selectActions,
  selectActionConnections,
  selectActionResourcesGroupedByAction,
  selectUserActionsGroupedByAction,
  selectActionCategoriesGroupedByAction,
  selectActorWithPositions,
  selectActorsWithPositions,
} from 'containers/App/selectors';

import qe from 'utils/quasi-equals';
import {
  setIndicatorConnections,
  setActorConnections,
  setActionConnections,
  prepareTaxonomiesIsAssociated,
  setUserConnections,
  getIndicatorSupportLevels,
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


const selectUserActionAssociationsForUser = createSelector(
  (state, { id }) => id,
  selectUserActionsGroupedByUser,
  (userId, associationsByUser) => associationsByUser.get(
    parseInt(userId, 10)
  )
);

const selectUserActionsAssociated = createSelector(
  selectActions,
  selectUserActionAssociationsForUser,
  (actions, associations) => actions && associations && associations.reduce(
    (memo, id) => {
      const entity = actions.get(id.toString());
      return entity
        ? memo.set(id, entity)
        : memo;
    },
    Map(),
  )
);

const selectUserActionsByType = createSelector(
  selectUserActionsAssociated,
  selectActionConnections,
  selectActorActionsGroupedByAction,
  selectActionResourcesGroupedByAction,
  selectActionIndicatorsGroupedByAction,
  selectUserActionsGroupedByAction,
  selectCategories,
  selectActionCategoriesGroupedByAction,
  (
    actions,
    actionConnections,
    actorActions,
    actionResources,
    actionIndicators,
    userActions,
    categories,
    actionCategories,
  ) => {
    if (!actions) return Map();
    return actions && actions
      .filter((action) => !!action)
      .map((action) => setActionConnections({
        action,
        actionConnections,
        actorActions,
        categories,
        actionCategories,
        users: userActions,
      }))
      .groupBy((r) => r.getIn(['attributes', 'measuretype_id']))
      .sortBy((val, key) => key);
  }
);
export const selectPreviewEntity = createSelector(
  (state, { id, path }) => selectEntity(state, { id, path }),
  (entity) => entity
);

export const selectPreviewEntityWithConnections = createSelector(
  selectPreviewEntity,
  selectIndicatorsAssociated,
  (state, { actionType }) => selectIndicatorConnections(state, actionType),
  selectActionIndicatorsGroupedByActionAttributes,
  selectActionIndicatorsGroupedByIndicator,
  selectActionViewTaxonomyOptions,
  selectActorsByType,

  selectActorMembersByType,
  selectActorAssociationsByType,
  selectActorViewTaxonomyOptions,

  (state) => selectEntities(state, API.USER_ROLES),
  (state) => selectEntities(state, API.ROLES),
  selectUserActionsByType,
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

    userRoles,
    roles,
    userActionsByType,
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
    if (previewEntity.get('type') === API.USERS && userRoles) {
      return previewEntity
        .set(
          'roles',
          userRoles
            .filter((association) => qe(association.getIn(['attributes', 'user_id']), previewEntity.get('id')))
            .map((association) => roles.find((role) => qe(role.get('id'), association.getIn(['attributes', 'role_id']))))
        )
        .set('actionsByType', userActionsByType);
    }
    return previewEntity;
  }
);
const selectUserActorAssociations = createSelector(
  (state, { id }) => id,
  selectUserActorsGroupedByActor,
  (actorId, associationsByActor) => associationsByActor.get(
    parseInt(actorId, 10)
  )
);
const selectUserActionAssociations = createSelector(
  (state, { id }) => id,
  selectUserActionsGroupedByAction,
  (actionId, associationsByAction) => associationsByAction.get(
    parseInt(actionId, 10)
  )
);
const selectUsersAssociatedActors = createSelector(
  selectUsers,
  selectUserActorAssociations,
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
const selectUsersAssociatedActions = createSelector(
  selectUsers,
  selectUserActionAssociations,
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

export const selectActorUsers = createSelector(
  selectUsersAssociatedActors,
  selectUserConnections,
  selectUserActorsGroupedByUser,
  (
    users,
    userConnections,
    userActors,
  ) => {
    if (!users || !userConnections) return Map();
    return users && users
      .map((user) => setUserConnections({
        user,
        userConnections,
        userActors,
      }))
      .sortBy((val, key) => key);
  }
);
export const selectActionUsers = createSelector(
  selectUsersAssociatedActions,
  selectUserConnections,
  selectUserActionsGroupedByUser,
  (
    users,
    userConnections,
    userActions,
  ) => {
    if (!users || !userConnections) return Map();
    return users && users
      .map((user) => setUserConnections({
        user,
        userConnections,
        userActions,
      }))
      .sortBy((val, key) => key);
  }
);

export const selectActionIndicators = createSelector(
  (state, { id }) => id,
  (state, { actionType }) => actionType,
  selectIndicatorsAssociated,
  (state, { actionType }) => selectIndicatorConnections(state, actionType),
  selectActionIndicatorsGroupedByActionAttributes,
  selectActionIndicatorsGroupedByIndicator,
  (
    actionId,
    actionType,
    indicators,
    indicatorConnections,
    actionIndicatorsByActionFull,
    actionIndicators,
  ) => {
    if (!indicators) return Map();
    let indicatorsWithConnections = indicators && indicators
      .map((indicator) => setIndicatorConnections({
        indicator,
        indicatorConnections,
        actionIndicators,
      }));
    const hasSupportLevel = actionType
      && ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS[actionType]
      && ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS[actionType].length > 0;
    if (hasSupportLevel) {
      const viewEntityActors = actionIndicatorsByActionFull.get(parseInt(actionId, 10));
      if (viewEntityActors) {
        indicatorsWithConnections = indicatorsWithConnections.map(
          (indicator) => {
            let indicatorX = indicator;
            // console.log(actor && actor.toJS())
            const indicatorConnection = viewEntityActors.find(
              (connection) => qe(indicator.get('id'), connection.get('indicator_id'))
            );
            if (indicatorConnection) {
              indicatorX = indicatorX.setIn(['supportlevel', actionId], indicatorConnection.get('supportlevel_id'));
            }
            return indicatorX;
          }
        );
      }
    }
    return indicatorsWithConnections && indicatorsWithConnections.sortBy((val, key) => key);
  }
);

export const selectIndicatorsWithSupport = createSelector(
  (state, { id }) => id,
  selectActorWithPositions,
  selectIndicators,
  (actorId, actorWithPositions, indicators) => {
    const indicatorsWithSupport = indicators && indicators.reduce(
      (memo, indicator, id) => {
        const indicatorPositions = actorWithPositions
          && actorWithPositions.get('indicatorPositions')
          && actorWithPositions.getIn([
            'indicatorPositions',
            indicator.get('id'),
          ]);
        if (indicatorPositions) {
          const relPos = indicatorPositions.first();
          const result = relPos && indicator
            .setIn(
              ['supportlevel', actorId],
              relPos.get('supportlevel_id')
            )
            .set(
              'position',
              relPos,
            );
          if (result) {
            return memo.set(id, result);
          }
          return memo;
        }
        return memo;
      },
      Map()
    );
    return indicatorsWithSupport;
  }
);

export const selectChildIndicators = createSelector(
  (state, id) => id,
  selectIndicators,
  (state) => selectActorsWithPositions(state, { type: ACTORTYPES.COUNTRY }),
  (
    viewEntityId,
    indicators,
    countriesWithPositions,
  ) => {
    if (!indicators || !countriesWithPositions) return null;
    return indicators.filter(
      (indicator) => qe(viewEntityId, indicator.getIn(['attributes', 'parent_id']))
    ).map(
      (indicator) => {
        const support = getIndicatorSupportLevels({
          indicator,
          countriesWithPositions,
        });
        return indicator.set('supportlevels', support);
      }
    );
  }
);
