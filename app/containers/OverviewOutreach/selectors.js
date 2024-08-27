import { createSelector } from 'reselect';
import { qe } from 'utils/quasi-equals';
import { selectActions, selectActiontypes } from 'containers/App/selectors';


export const selectActiontypesWithActionCount = createSelector(
  selectActions,
  selectActiontypes,
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
