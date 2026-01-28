import { API } from 'themes/config';
// required for selectActorsWithPositionsData
import { ACTORS_WITH_POSITIONS_DEPENDENCIES } from 'containers/App/selectors';

export const DEPENDENCIES = [
  ...new Set([
    ...ACTORS_WITH_POSITIONS_DEPENDENCIES,
    API.USERS,
    API.ACTORS,
    API.ACTIONS,
    API.CATEGORIES,
    API.TAXONOMIES,
    API.INDICATORS,
    API.USER_ACTORS,
    API.USER_ACTIONS,
    API.MEMBERSHIPS,
    API.ACTORTYPES,
    API.ACTOR_ACTIONS,
    API.ACTOR_CATEGORIES,
    API.ACTION_INDICATORS,
    API.ACTION_ACTORS,
    API.ACTION_CATEGORIES,
  ]),
];
