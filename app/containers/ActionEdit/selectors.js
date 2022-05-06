import { createSelector } from 'reselect';
import {
  API,
  ACTIONTYPE_ACTORTYPES,
  ACTIONTYPE_TARGETTYPES,
  ACTIONTYPE_RESOURCETYPES,
  INDICATOR_ACTIONTYPES,
  ACTIONTYPE_ACTIONTYPES,
  USER_ACTIONTYPES,
} from 'themes/config';
import { qe } from 'utils/quasi-equals';

import {
  selectEntity,
  selectEntities,
  selectActorsCategorised,
  selectActorTaxonomies,
  selectActortypes,
  selectActorActionsGroupedByAction,
  selectActionActorsGroupedByAction,
  selectActionCategoriesGroupedByAction,
  selectCategories,
  selectTaxonomiesSorted,
  selectReady,
  selectResources,
  selectActionResourcesGroupedByAction,
  selectResourcetypes,
  selectIndicators,
  selectActionIndicatorsGroupedByAction,
  selectActionsCategorised,
  selectActionActionsGroupedBySubAction,
  selectActionActionsGroupedByTopAction,
  selectActiontypes,
  selectUsers,
  selectUserActionsGroupedByAction,
} from 'containers/App/selectors';

import {
  entitiesSetAssociated,
  entitySetUser,
  prepareTaxonomiesAssociated,
  prepareTaxonomies,
} from 'utils/entities';

import { DEPENDENCIES } from './constants';

export const selectDomain = createSelector(
  (state) => state.get('actionEdit'),
  (substate) => substate
);

export const selectViewEntity = createSelector(
  (state, id) => selectEntity(state, { path: API.ACTIONS, id }),
  (state) => selectEntities(state, API.USERS),
  (entity, users) => entitySetUser(entity, users)
);

export const selectTopActionsByActiontype = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectActionsCategorised,
  selectActionActionsGroupedByTopAction,
  selectActiontypes,
  (ready, viewAction, actions, associations, actiontypes) => {
    if (!viewAction || !ready) return null;
    const viewActiontypeId = viewAction.getIn(['attributes', 'measuretype_id']).toString();
    const validActiontypeIds = ACTIONTYPE_ACTIONTYPES[viewActiontypeId];
    if (!validActiontypeIds || validActiontypeIds.length === 0) {
      return null;
    }
    return actiontypes.filter(
      (type) => validActiontypeIds
        && validActiontypeIds.indexOf(type.get('id')) > -1
    ).map((type) => {
      const filtered = actions.filter(
        (action) => qe(
          type.get('id'),
          action.getIn(['attributes', 'measuretype_id']),
        )
      ).filter(
        // exclude self
        (action) => action.get('id') !== viewAction.get('id')
      );
      return entitiesSetAssociated(
        filtered,
        associations,
        viewAction.get('id'),
      );
    });
  }
);
export const selectSubActionsByActiontype = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectActionsCategorised,
  selectActionActionsGroupedBySubAction,
  selectActiontypes,
  (ready, viewAction, actions, associations, actiontypes) => {
    if (!viewAction || !ready) return null;
    const viewActiontypeId = viewAction.getIn(['attributes', 'measuretype_id']).toString();
    const validActiontypeIds = Object.keys(ACTIONTYPE_ACTIONTYPES).filter((actiontypeId) => {
      const actiontypeIds = ACTIONTYPE_ACTIONTYPES[actiontypeId];
      return actiontypeIds && actiontypeIds.indexOf(viewActiontypeId) > -1;
    });
    if (!validActiontypeIds || validActiontypeIds.length === 0) {
      return null;
    }
    return actiontypes.filter(
      (type) => validActiontypeIds
        && validActiontypeIds.indexOf(type.get('id')) > -1
    ).map((type) => {
      const filtered = actions.filter(
        (action) => qe(
          type.get('id'),
          action.getIn(['attributes', 'measuretype_id']),
        )
      ).filter(
        // exclude self
        (action) => action.get('id') !== viewAction.get('id')
      );
      return entitiesSetAssociated(
        filtered,
        associations,
        viewAction.get('id'),
      );
    });
  }
);

export const selectIndicatorOptions = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectIndicators,
  selectActionIndicatorsGroupedByAction,
  (ready, action, indicators, associations) => {
    if (!action || !ready) return null;
    const actiontypeId = action.getIn(['attributes', 'measuretype_id']).toString();
    if (INDICATOR_ACTIONTYPES.indexOf(actiontypeId) > -1) {
      return entitiesSetAssociated(
        indicators,
        associations,
        action.get('id'),
      );
    }
    return null;
  }
);

export const selectTaxonomyOptions = createSelector(
  selectViewEntity,
  selectTaxonomiesSorted,
  (state) => selectEntities(state, API.ACTIONTYPE_TAXONOMIES),
  selectCategories,
  selectActionCategoriesGroupedByAction,
  (
    entity,
    taxonomies,
    actiontypeTaxonomies,
    categories,
    associations,
  ) => {
    if (
      entity
      && taxonomies
      && actiontypeTaxonomies
      && categories
      && associations
    ) {
      const id = entity.get('id');
      const taxonomiesForType = taxonomies.filter((tax) => actiontypeTaxonomies.some(
        (type) => qe(
          type.getIn(['attributes', 'taxonomy_id']),
          tax.get('id'),
        ) && qe(
          type.getIn(['attributes', 'measuretype_id']),
          entity.getIn(['attributes', 'measuretype_id']),
        )
      ));
      return prepareTaxonomiesAssociated(
        taxonomiesForType,
        categories,
        associations,
        'tags_actions',
        id,
        false,
      );
    }
    return null;
  }
);

export const selectConnectedTaxonomies = createSelector(
  selectActorTaxonomies,
  selectCategories,
  (taxonomies, categories) => prepareTaxonomies(
    taxonomies,
    categories,
    false,
  )
);

export const selectActorsByActortype = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectActorsCategorised,
  selectActorActionsGroupedByAction,
  selectActortypes,
  (ready, action, actors, associations, actortypes) => {
    if (!action || !ready) return null;
    const actiontypeId = action.getIn(['attributes', 'measuretype_id']).toString();
    const validActortypeIds = ACTIONTYPE_ACTORTYPES[actiontypeId];
    if (!validActortypeIds || validActortypeIds.length === 0) {
      return null;
    }
    return actortypes.filter(
      (type) => validActortypeIds
        && validActortypeIds.indexOf(type.get('id')) > -1
        && type.getIn(['attributes', 'is_active'])
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
        action.get('id'),
      );
    });
  }
);

export const selectTargetsByActortype = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectActorsCategorised,
  selectActionActorsGroupedByAction,
  selectActortypes,
  (ready, action, actors, associations, actortypes) => {
    if (!action || !ready) return null;
    const actiontypeId = action.getIn(['attributes', 'measuretype_id']).toString();
    const validActortypeIds = ACTIONTYPE_TARGETTYPES[actiontypeId];
    if (!validActortypeIds || validActortypeIds.length === 0) {
      return null;
    }
    return actortypes.filter(
      (type) => validActortypeIds
        && validActortypeIds.indexOf(type.get('id')) > -1
        && type.getIn(['attributes', 'is_target'])
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
        action.get('id'),
      );
    });
  }
);

export const selectResourcesByResourcetype = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectResources,
  selectActionResourcesGroupedByAction,
  selectResourcetypes,
  (ready, action, resources, associations, resourcetypes) => {
    if (!action || !ready) return null;
    const actiontypeId = action.getIn(['attributes', 'measuretype_id']).toString();
    const validResourcetypeIds = ACTIONTYPE_RESOURCETYPES[actiontypeId];
    if (!validResourcetypeIds || validResourcetypeIds.length === 0) {
      return null;
    }
    return resourcetypes.filter(
      (type) => validResourcetypeIds && validResourcetypeIds.indexOf(type.get('id')) > -1
    ).map((type) => {
      const filtered = resources.filter(
        (actor) => qe(
          type.get('id'),
          actor.getIn(['attributes', 'resourcetype_id']),
        )
      );
      return entitiesSetAssociated(
        filtered,
        associations,
        action.get('id'),
      );
    });
  }
);
export const selectUserOptions = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectUsers,
  selectUserActionsGroupedByAction,
  (ready, action, users, associations) => {
    if (!action || !ready) return null;
    const actiontypeId = action.getIn(['attributes', 'measuretype_id']).toString();
    if (USER_ACTIONTYPES.indexOf(actiontypeId) > -1) {
      return entitiesSetAssociated(
        users,
        associations,
        action.get('id'),
      );
    }
    return null;
  }
);
