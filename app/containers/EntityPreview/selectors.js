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
  selectActorActionsGroupedByActor,
  selectMembershipsGroupedByParent,
  selectMembershipsGroupedByMember,
  selectActors,
  selectActorCategoriesGroupedByActor,
  selectCategories,
  selectActorConnections,
} from 'containers/App/selectors';

import qe from 'utils/quasi-equals';
import {
  setIndicatorConnections,
  setActorConnections,
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

export const selectPreviewEntity = createSelector(
  (state, { id, path }) => selectEntity(state, { id, path }),
  selectIndicatorsAssociated,
  selectIndicatorConnections,
  selectActionIndicatorsGroupedByActionAttributes,
  selectActionIndicatorsGroupedByIndicator,
  selectActorMembersByType,
  selectActorAssociationsByType,
  (
    previewEntity,
    indicators,
    indicatorConnections,
    actionIndicatorsByActionFull,
    actionIndicators,
    actorMembersByType,
    actorAssociationsByType,
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
      return indicatorsWithConnections
        ? previewEntity.set('indicators', indicatorsWithConnections.sortBy((val, key) => key))
        : previewEntity;
    }
    if (previewEntity.get('type') === API.ACTORS) {
      return previewEntity
        .set('membersByType', actorMembersByType)
        .set('associationsByType', actorAssociationsByType);
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
