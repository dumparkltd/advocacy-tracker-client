import { createSelector } from 'reselect';
import { API } from 'themes/config';

import {
  selectEntity,
  selectEntities,
} from 'containers/App/selectors';

import {
  entitySetUser,
} from 'utils/entities';

export const selectViewEntity = createSelector(
  (state, id) => selectEntity(state, { path: API.PAGES, id }),
  (state) => selectEntities(state, API.USERS),
  (entity, users) => entitySetUser(entity, users)
);
