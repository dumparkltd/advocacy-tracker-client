import { createSelector } from 'reselect';
import {
  ACTIONTYPE_ACTORTYPES,
  ACTIONTYPE_RESOURCETYPES,
  INDICATOR_ACTIONTYPES,
  ACTIONTYPE_ACTIONTYPES,
  USER_ACTIONTYPES,
} from 'themes/config';
import { qe } from 'utils/quasi-equals';

import {
  selectActortypes,
  selectActions,
  selectActiontypes,
  selectActorsCategorised,
  selectIndicators,
  selectResources,
  selectResourcetypes,
  selectUsers,
} from 'containers/App/selectors';

export const selectDomain = createSelector(
  (state) => state.get('actionNew'),
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

export const selectIndicatorOptions = createSelector(
  (state, id) => id,
  selectIndicators,
  (actiontypeId, indicators) => {
    if (INDICATOR_ACTIONTYPES.indexOf(actiontypeId) > -1) {
      return indicators;
    }
    return null;
  }
);

export const selectActorsByActortype = createSelector(
  (state, id) => id,
  selectActorsCategorised,
  selectActortypes,
  (actiontypeId, actors, actortypes) => {
    // compare App/selectors/selectActortypesForActiontype
    const validActortypeIds = ACTIONTYPE_ACTORTYPES[actiontypeId];
    if (!validActortypeIds || validActortypeIds.length === 0) {
      return null;
    }
    return actortypes.map((type) => actors.filter(
      (actor) => qe(
        type.get('id'),
        actor.getIn(['attributes', 'actortype_id']),
      )
    ));
  }
);
export const selectResourcesByResourcetype = createSelector(
  (state, id) => id,
  selectResources,
  selectResourcetypes,
  (actiontypeId, resources, resourcetypes) => {
    // compare App/selectors/selectActortypesForActiontype
    const validResourcetypeIds = ACTIONTYPE_RESOURCETYPES[actiontypeId];
    if (!validResourcetypeIds || validResourcetypeIds.length === 0) {
      return null;
    }
    return resourcetypes.filter(
      (type) => validResourcetypeIds && validResourcetypeIds.indexOf(type.get('id')) > -1
    ).map((type) => resources.filter(
      (resource) => qe(
        type.get('id'),
        resource.getIn(['attributes', 'resourcetype_id']),
      )
    ));
  }
);

export const selectTopActionsByActiontype = createSelector(
  (state, id) => id,
  selectActions,
  selectActiontypes,
  (viewActiontypeId, actions, actiontypes) => {
    // compare App/selectors/selectActortypesForActiontype
    const validActiontypeIds = ACTIONTYPE_ACTIONTYPES[viewActiontypeId];
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
export const selectSubActionsByActiontype = createSelector(
  (state, id) => id,
  selectActions,
  selectActiontypes,
  (viewActiontypeId, actions, actiontypes) => {
    // compare App/selectors/selectActortypesForActiontype
    const validActiontypeIds = Object.keys(ACTIONTYPE_ACTIONTYPES).filter((actiontypeId) => {
      const actiontypeIds = ACTIONTYPE_ACTIONTYPES[actiontypeId];
      return actiontypeIds && actiontypeIds.indexOf(viewActiontypeId) > -1;
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
export const selectUserOptions = createSelector(
  (state, id) => id,
  selectUsers,
  (actiontypeId, users) => {
    if (USER_ACTIONTYPES.indexOf(actiontypeId) > -1) {
      return users;
    }
    return null;
  }
);
