import { createSelector } from 'reselect';
import { API } from 'themes/config';
import { qe } from 'utils/quasi-equals';
import { selectActions, selectEntities } from 'containers/App/selectors';


export const selectActiontypesWithActionCount = createSelector(
  selectActions,
  (state) => selectEntities(state, API.ACTIONTYPES),
  (actions, types) => actions && types && types.map((type) => {
    const typeActions = actions.filter(
      (action) => qe(
        action.getIn(['attributes', 'measuretype_id']),
        type.get('id'),
      )
    );
    return type.set('count', typeActions.size);
  })
);
