import { createSelector } from 'reselect';
import { qe } from 'utils/quasi-equals';
import { selectActors, selectActortypes } from 'containers/App/selectors';


export const selectActortypesWithActorCount = createSelector(
  selectActors,
  selectActortypes,
  (actors, types) => actors && types && types.map((type) => {
    const typeActors = actors.filter((actor) => qe(actor.getIn(['attributes', 'actortype_id']), type.get('id')));
    return type.set('count', typeActors.size);
  })
);
