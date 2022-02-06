import { createSelector } from 'reselect';
import { API } from 'themes/config';
import { qe } from 'utils/quasi-equals';
import { selectActors, selectEntities } from 'containers/App/selectors';


export const selectActortypesWithActorCount = createSelector(
  selectActors,
  (state) => selectEntities(state, API.ACTIONTYPES),
  (actions, types) => actions && types && types.map((type) => {
    const typeActors = actions.filter((action) => qe(action.getIn(['attributes', 'actortype_id']), type.get('id')));
    return type.set('count', typeActors.size);
  })
);
