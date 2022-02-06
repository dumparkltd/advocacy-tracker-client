import { createSelector } from 'reselect';
import { API, ACTIONTYPE_INDICATORS } from 'themes/config';
import { qe } from 'utils/quasi-equals';

import {
  selectEntity,
  selectEntities,
  selectActionsCategorised,
  selectActiontypes,
  selectActionIndicatorsGroupedByIndicator,
  selectCategories,
  selectTaxonomiesSorted,
  selectReady,
} from 'containers/App/selectors';

import {
  entitySetUser,
  entitiesSetAssociated,
  prepareTaxonomies,
} from 'utils/entities';

import { DEPENDENCIES } from './constants';

export const selectDomain = createSelector(
  (state) => state.get('indicatorEdit'),
  (substate) => substate
);

export const selectViewEntity = createSelector(
  (state, id) => selectEntity(state, { path: API.INDICATORS, id }),
  (state) => selectEntities(state, API.USERS),
  (entity, users) => entitySetUser(entity, users)
);

export const selectConnectedTaxonomies = createSelector(
  selectTaxonomiesSorted,
  selectCategories,
  (taxonomies, categories) => prepareTaxonomies(
    taxonomies,
    categories,
    false,
  )
);

export const selectActionsByActiontype = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectActionsCategorised,
  selectActionIndicatorsGroupedByIndicator,
  selectActiontypes,
  (ready, viewIndicator, actions, associations, actiontypes) => {
    if (!viewIndicator || !ready) return null;
    return actiontypes.filter(
      (type) => ACTIONTYPE_INDICATORS && ACTIONTYPE_INDICATORS.indexOf(type.get('id')) > -1
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
        viewIndicator.get('id'),
      );
    });
  }
);
