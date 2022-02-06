import { createSelector } from 'reselect';
import { API } from 'themes/config';
import { qe } from 'utils/quasi-equals';
import { selectResources, selectEntities } from 'containers/App/selectors';


export const selectResourcetypesWithResourceCount = createSelector(
  selectResources,
  (state) => selectEntities(state, API.RESOURCETYPES),
  (resources, types) => resources && types && types.map((type) => {
    const typeResources = resources.filter((resource) => qe(resource.getIn(['attributes', 'resourcetype_id']), type.get('id')));
    return type.set('count', typeResources.size);
  })
);
