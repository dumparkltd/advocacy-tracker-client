import { createSelector } from 'reselect';
import { selectEntities, selectLocation } from 'containers/App/selectors';
import { getBookmarkForLocation } from 'utils/bookmark';
import { API } from 'themes/config';

export const selectBookmarkForLocation = createSelector(
  (state) => selectEntities(state, API.BOOKMARKS),
  (state) => selectLocation(state),
  (bookmarks, location) => getBookmarkForLocation(location, bookmarks),
);
