import { createSelector } from 'reselect';
import {
  ACTIONTYPE_ACTORTYPES,
  USER_ACTORTYPES,
  MEMBERSHIPS,
} from 'themes/config';
import { qe } from 'utils/quasi-equals';

import {
  selectActiontypes,
  selectActionsCategorised,
  selectActorsCategorised,
  selectActortypes,
  selectUsers,
} from 'containers/App/selectors';

export const selectDomain = createSelector(
  (state) => state.get('actorNew'),
  (substate) => substate.get('page')
    && substate.getIn(['page', 'saveSendingAll'])
    ? substate.setIn(
      ['page', 'isAnySending'],
      substate.getIn(['page', 'saveSendingAll']).some(
        (value) => value,
      )
    )
    : substate
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
export const selectMembersByActortype = createSelector(
  (state, id) => id,
  selectActorsCategorised,
  selectActortypes,
  (viewActortypeId, actors, actortypes) => {
    if (!actortypes || !actors) return null;
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
  (viewActortypeId, actors, actortypes) => {
    if (!actortypes || !actors) return null;
    const validActortypeIds = MEMBERSHIPS[viewActortypeId];
    if (!validActortypeIds || validActortypeIds.length === 0) {
      return null;
    }
    return actortypes.filter(
      (type) => validActortypeIds
        && validActortypeIds.indexOf(type.get('id')) > -1
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
