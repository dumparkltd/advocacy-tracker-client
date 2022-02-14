import { createSelector } from 'reselect';
import {
  ACTIONTYPE_ACTORTYPES,
  ACTIONTYPE_TARGETTYPES,
  USER_ACTORTYPES,
} from 'themes/config';
import { qe } from 'utils/quasi-equals';

import {
  selectCategories,
  selectActiontypes,
  selectActionTaxonomies,
  selectActionsCategorised,
  selectActorsCategorised,
  selectActortypes,
  selectUsers,
} from 'containers/App/selectors';
import { prepareTaxonomies } from 'utils/entities';

export const selectDomain = createSelector(
  (state) => state.get('actorNew'),
  (substate) => substate
);

export const selectConnectedTaxonomies = createSelector(
  selectActionTaxonomies,
  selectCategories,
  (taxonomies, categories) => prepareTaxonomies(
    taxonomies,
    categories,
    false,
  )
);

export const selectActionsByActiontype = createSelector(
  (state, id) => id,
  selectActionsCategorised,
  selectActiontypes,
  (actortypeId, actions, actiontypes) => {
    if (!actiontypes || !actions) return null;
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
    ).map((type) => actions.filter(
      (action) => qe(
        type.get('id'),
        action.getIn(['attributes', 'measuretype_id']),
      )
    ));
  }
);
export const selectActionsAsTargetByActiontype = createSelector(
  (state, id) => id,
  selectActionsCategorised,
  selectActiontypes,
  (actortypeId, actions, actiontypes) => {
    if (!actiontypes || !actions) return null;
    // compare App/selectors/selectActiontypesForActortype
    const validActiontypeIds = Object.keys(ACTIONTYPE_TARGETTYPES).filter((actiontypeId) => {
      const actortypeIds = ACTIONTYPE_TARGETTYPES[actiontypeId];
      return actortypeIds && actortypeIds.indexOf(actortypeId) > -1;
    });
    if (!validActiontypeIds || validActiontypeIds.length === 0) {
      return null;
    }
    return actiontypes.filter(
      (type) => validActiontypeIds
        && validActiontypeIds.indexOf(type.get('id')) > -1
        && type.getIn(['attributes', 'has_target'])
    ).map((type) => actions.filter(
      (action) => qe(
        type.get('id'),
        action.getIn(['attributes', 'measuretype_id']),
      )
    ));
  }
);

export const selectMembersByActortype = createSelector(
  (state, id) => id,
  selectActorsCategorised,
  selectActortypes,
  (actortypeId, actors, actortypes) => {
    if (!actortypes || !actors) return null;
    const viewActortype = actortypes && actortypes.get(actortypeId);
    if (!viewActortype || !viewActortype.getIn(['attributes', 'has_members'])) {
      // console.log('no members for actortype', actortypeId)
      return null;
    }
    return actortypes.filter(
      (type) => !type.getIn(['attributes', 'has_members'])
    ).map((type) => actors.filter(
      (actor) => qe(
        type.get('id'),
        actor.getIn(['attributes', 'actortype_id']),
      )
    ));
  }
);

export const selectAssociationsByActortype = createSelector(
  (state, id) => id,
  selectActorsCategorised,
  selectActortypes,
  (actortypeId, actors, actortypes) => {
    if (!actortypes || !actors) return null;
    const viewActortype = actortypes && actortypes.get(actortypeId);
    if (!viewActortype || viewActortype.getIn(['attributes', 'has_members'])) {
      // console.log('no memberships for actortype', actortypeId)
      return null;
    }
    return actortypes.filter(
      (type) => type.getIn(['attributes', 'has_members'])
    ).map((type) => actors.filter(
      (actor) => qe(
        type.get('id'),
        actor.getIn(['attributes', 'actortype_id']),
      )
    ));
  }
);

export const selectUserOptions = createSelector(
  (state, id) => id,
  selectUsers,
  (actortypeId, users) => {
    if (USER_ACTORTYPES.indexOf(actortypeId) > -1) {
      return users;
    }
    return null;
  }
);
