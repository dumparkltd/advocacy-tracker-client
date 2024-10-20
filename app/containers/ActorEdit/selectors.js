import { createSelector } from 'reselect';
import {
  API,
  ACTIONTYPE_ACTORTYPES,
  USER_ACTORTYPES,
  MEMBERSHIPS,
} from 'themes/config';
import { qe } from 'utils/quasi-equals';

import {
  selectEntity,
  selectEntities,
  selectActionsCategorised,
  selectActiontypes,
  selectActorActionsGroupedByActor,
  selectActorCategoriesGroupedByActor,
  selectCategories,
  selectTaxonomiesSorted,
  selectReady,
  selectActorsCategorised,
  selectMembershipsGroupedByMember,
  selectMembershipsGroupedByParent,
  selectActortypes,
  selectUsers,
  selectUserActorsGroupedByActor,
} from 'containers/App/selectors';

import {
  entitySetUser,
  entitiesSetAssociated,
  prepareTaxonomiesAssociated,
} from 'utils/entities';

import { DEPENDENCIES } from './constants';

export const selectDomain = createSelector(
  (state) => state.get('actorEdit'),
  (substate) => substate
);

export const selectDomainPage = createSelector(
  (state) => state.getIn(['actorEdit', 'page']),
  (substate) => substate
);

export const selectViewEntity = createSelector(
  (state, id) => selectEntity(state, { path: API.ACTORS, id }),
  (state) => selectEntities(state, API.USERS),
  (entity, users) => entitySetUser(entity, users)
);

export const selectTaxonomyOptions = createSelector(
  selectViewEntity,
  selectTaxonomiesSorted,
  (state) => selectEntities(state, API.ACTORTYPE_TAXONOMIES),
  selectCategories,
  selectActorCategoriesGroupedByActor,
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

      return prepareTaxonomiesAssociated(
        taxonomiesForType,
        categories,
        associations,
        'tags_actors',
        id,
        false,
      );
    }
    return null;
  }
);

export const selectActionsByActiontype = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectActionsCategorised,
  selectActorActionsGroupedByActor,
  selectActiontypes,
  (ready, viewActor, actions, associations, actiontypes) => {
    if (!viewActor || !ready) return null;
    const actortypeId = viewActor.getIn(['attributes', 'actortype_id']).toString();
    // compare App/selectors/selectActiontypesForActortype
    const validActiontypeIds = Object.keys(ACTIONTYPE_ACTORTYPES).filter((actiontypeId) => {
      const actortypeIds = ACTIONTYPE_ACTORTYPES[actiontypeId];
      return actortypeIds && actortypeIds.indexOf(actortypeId) > -1;
    });
    if (!validActiontypeIds || validActiontypeIds.length === 0) {
      return null;
    }
    return actiontypes.filter(
      (type) => validActiontypeIds && validActiontypeIds.indexOf(type.get('id')) > -1
    ).map((type) => {
      const filtered = actions.filter(
        (action) => qe(
          type.get('id'),
          action.getIn(['attributes', 'measuretype_id']),
        )
      );
      return entitiesSetAssociated(
        filtered,
        associations,
        viewActor.get('id'),
      );
    });
  }
);

export const selectMembersByActortype = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectActorsCategorised,
  selectMembershipsGroupedByParent,
  selectActortypes,
  (ready, viewActor, actors, associations, actortypes) => {
    if (!viewActor || !ready) return null;
    const viewActortypeId = viewActor.getIn(['attributes', 'actortype_id']).toString();
    const validActortypeIds = Object.keys(MEMBERSHIPS).filter((actortypeId) => {
      const actiontypeIds = MEMBERSHIPS[actortypeId];
      return actiontypeIds && actiontypeIds.indexOf(viewActortypeId) > -1;
    });
    if (!validActortypeIds || validActortypeIds.length === 0) {
      return null;
    }
    return actortypes.filter(
      (type) => validActortypeIds
        && validActortypeIds.indexOf(type.get('id')) > -1
    ).map((type) => {
      const filtered = actors.filter(
        (actor) => qe(
          type.get('id'),
          actor.getIn(['attributes', 'actortype_id']),
        )
      );
      return entitiesSetAssociated(
        filtered,
        associations,
        viewActor.get('id'),
      );
    });
  }
);

export const selectAssociationsByActortype = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectActorsCategorised,
  selectMembershipsGroupedByMember,
  selectActortypes,
  (ready, viewActor, actors, joins, actortypes) => {
    if (!viewActor || !ready) return null;
    const actortypeId = viewActor.getIn(['attributes', 'actortype_id']).toString();

    const validActortypeIds = MEMBERSHIPS[actortypeId];
    if (!validActortypeIds || validActortypeIds.length === 0) {
      return null;
    }
    return actortypes.filter(
      (type) => validActortypeIds
        && validActortypeIds.indexOf(type.get('id')) > -1
    ).map((type) => {
      const filtered = actors.filter(
        (actor) => qe(
          type.get('id'),
          actor.getIn(['attributes', 'actortype_id']),
        )
      );
      return entitiesSetAssociated(
        filtered,
        joins,
        viewActor.get('id'),
      );
    });
  }
);

export const selectUserOptions = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectUsers,
  selectUserActorsGroupedByActor,
  (ready, actor, users, associations) => {
    if (!actor || !ready) return null;
    const actortypeId = actor.getIn(['attributes', 'actortype_id']).toString();
    if (USER_ACTORTYPES.indexOf(actortypeId) > -1) {
      return entitiesSetAssociated(
        users,
        associations,
        actor.get('id'),
      );
    }
    return null;
  }
);
