import { createSelector } from 'reselect';
import { API, ACTIONTYPE_RESOURCETYPES } from 'themes/config';
import { qe } from 'utils/quasi-equals';

import {
  selectEntity,
  selectEntities,
  selectActionsCategorised,
  selectActiontypes,
  selectActionResourcesGroupedByResource,
  selectReady,
} from 'containers/App/selectors';

import {
  entitySetUser,
  entitiesSetAssociated,
} from 'utils/entities';

import { DEPENDENCIES } from './constants';

export const selectDomain = createSelector(
  (state) => state.get('resourceEdit'),
  (substate) => substate
);

export const selectDomainPage = createSelector(
  (state) => state.getIn(['resourceEdit', 'page']),
  (substate) => substate
);

export const selectViewEntity = createSelector(
  (state, id) => selectEntity(state, { path: API.RESOURCES, id }),
  (state) => selectEntities(state, API.USERS),
  (entity, users) => entitySetUser(entity, users)
);

export const selectActionsByActiontype = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  (state) => selectActionsCategorised(state), // do not pass type, we want all
  selectActionResourcesGroupedByResource,
  selectActiontypes,
  (ready, viewResource, actions, associations, actiontypes) => {
    if (!viewResource || !ready) return null;
    const resourcetypeId = viewResource.getIn(['attributes', 'resourcetype_id']).toString();
    // compare App/selectors/selectActiontypesForActortype
    const validActiontypeIds = Object.keys(ACTIONTYPE_RESOURCETYPES).filter((actiontypeId) => {
      const resourcetypeIds = ACTIONTYPE_RESOURCETYPES[actiontypeId];
      return resourcetypeIds && resourcetypeIds.indexOf(resourcetypeId) > -1;
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
        viewResource.get('id'),
      );
    });
  }
);
