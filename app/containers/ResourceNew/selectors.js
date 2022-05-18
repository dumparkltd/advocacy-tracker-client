import { createSelector } from 'reselect';
import { ACTIONTYPE_RESOURCETYPES } from 'themes/config';
import { qe } from 'utils/quasi-equals';

import {
  selectCategories,
  selectActiontypes,
  selectActionTaxonomies,
  selectActionsCategorised,
} from 'containers/App/selectors';
import { prepareTaxonomies } from 'utils/entities';

export const selectDomain = createSelector(
  (state) => state.get('resourceNew'),
  (substate) => substate
);
export const selectDomainPage = createSelector(
  (state) => state.getIn(['resourceNew', 'page']),
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
  (resourcetypeId, actions, actiontypes) => {
    if (!actiontypes || !actions) return null;
    // compare App/selectors/selectActiontypesForResourcetype
    const validActiontypeIds = Object.keys(ACTIONTYPE_RESOURCETYPES).filter((actiontypeId) => {
      const resourcetypeIds = ACTIONTYPE_RESOURCETYPES[actiontypeId];
      return resourcetypeIds && resourcetypeIds.indexOf(resourcetypeId) > -1;
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
