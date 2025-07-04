import { createSelector } from 'reselect';

import {
  selectEntities,
  selectTaxonomiesSorted,
  selectCategory,
} from 'containers/App/selectors';

import { API } from 'themes/config';

import { prepareCategory } from 'utils/entities';


export const selectDomain = createSelector(
  (state) => state.get('categoryEdit'),
  (substate) => substate
);

export const selectDomainPage = createSelector(
  (state) => state.getIn(['categoryEdit', 'page']),
  (substate) => substate
);

export const selectViewEntity = createSelector(
  selectCategory,
  (state) => selectEntities(state, API.USERS),
  selectTaxonomiesSorted,
  (entity, users, taxonomies) => prepareCategory(entity, users, taxonomies)
);
