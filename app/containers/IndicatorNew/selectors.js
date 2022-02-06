import { createSelector } from 'reselect';
import { ACTIONTYPE_INDICATORS } from 'themes/config';
import { qe } from 'utils/quasi-equals';

import {
  selectCategories,
  selectActiontypes,
  selectActionTaxonomies,
  selectActionsCategorised,
} from 'containers/App/selectors';

import { prepareTaxonomies } from 'utils/entities';

export const selectDomain = createSelector(
  (state) => state.get('indicatorNew'),
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
  selectActionsCategorised,
  selectActiontypes,
  (actions, actiontypes) => {
    if (!actiontypes || !actions) return null;

    return actiontypes.filter(
      (type) => ACTIONTYPE_INDICATORS && ACTIONTYPE_INDICATORS.indexOf(type.get('id')) > -1
    ).map((type) => actions.filter(
      (action) => qe(
        type.get('id'),
        action.getIn(['attributes', 'measuretype_id']),
      )
    ));
  }
);
