import { createSelector } from 'reselect';
import { Map } from 'immutable';

import {
  ACTORTYPES,
  ACTIONTYPES,
  API,
  OFFICIAL_STATEMENT_CATEGORY_ID,
} from 'themes/config';
import {
  selectReady,
  selectActorsWithPositions,
  selectActions,
  selectActorActionsGroupedByActor,
  selectMembershipsGroupedByParent,
  selectMembershipsGroupedByMember,
  selectActionCategoriesGroupedByAction,
  selectCategories,
  selectIncludeInofficialStatements,
  selectAssociationTypeQuery,
  selectLocationQuery,
} from 'containers/App/selectors';
import { getValueFromPositions } from 'containers/EntityListTable/utils';

import qe from 'utils/quasi-equals';
import asList from 'utils/as-list';
import {
  getEntityCategories,
  filterEntitiesByConnection,
  actionsByType,
  actorsByType,
} from 'utils/entities';

import { DEPENDENCIES } from './constants';

export const selectConnections = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActions,
  selectActionCategoriesGroupedByAction,
  selectCategories,
  selectIncludeInofficialStatements,
  (
    ready,
    actions,
    actionAssociationsGrouped,
    categories,
    includeInofficial,
  ) => {
    if (ready) {
      const result = new Map().set(
        API.ACTIONS,
        includeInofficial ? actions : actions.filter(
          (entity) => {
            if (qe(entity.getIn(['attributes', 'measuretype_id']), ACTIONTYPES.EXPRESS)) {
              const entityCategories = getEntityCategories(
                parseInt(entity.get('id'), 10),
                actionAssociationsGrouped,
                categories,
              );
              return entityCategories && entityCategories.toList().includes(OFFICIAL_STATEMENT_CATEGORY_ID);
            }
            return true;
          }
        )
      );
      return result;
    }
    return new Map();
  }
);

const selectCountriesWithAssociations = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  (state) => selectActorsWithPositions(state, { type: ACTORTYPES.COUNTRY }),
  selectConnections,
  selectMembershipsGroupedByMember,
  (
    ready,
    actors,
    connections,
    associationConnectionsGrouped,
  ) => {
    if (ready) {
      return actors.map(
        (actor) => {
          const actorId = parseInt(actor.get('id'), 10);
          // memberships
          const actorAssociations = associationConnectionsGrouped.get(actorId);
          const actorAssociationsByType = actorsByType(actorAssociations, connections.get(API.ACTORS));
          return actor
            .set('associations', actorAssociations)
            .set('associationsByType', actorAssociationsByType);
        }
      );
    }
    return actors;
  }
);

const selectCountriesByRegion = createSelector(
  selectCountriesWithAssociations,
  (state) => selectAssociationTypeQuery(state, { typeId: ACTORTYPES.REG }),
  (countries, queryRegion) => {
    if (queryRegion) {
      return filterEntitiesByConnection(countries, queryRegion, 'associations');
    }
    return countries;
  }
);
const selectCountriesByGroup = createSelector(
  selectCountriesByRegion,
  (state) => selectAssociationTypeQuery(state, { typeId: ACTORTYPES.GROUP }),
  (countries, queryGroup) => {
    if (queryGroup) {
      return filterEntitiesByConnection(countries, queryGroup, 'associations');
    }
    return countries;
  }
);

const selectCountriesByTopicPosition = createSelector(
  selectCountriesByGroup,
  selectLocationQuery,
  (countries, locationQuery) => {
    if (locationQuery.get('indicators')) {
      const locationQueryValue = locationQuery.get('indicators');
      // console.log('locationQueryValue', locationQueryValue)
      return countries.filter((country) => {
        const countryPositions = country.get('indicatorPositions');
        // countries pass when they pass all queried indicators
        const pass = asList(locationQueryValue).reduce(
          (memo, queryValue) => {
            if (!memo) return memo;
            const indicatorId = queryValue.split('>')[0];
            let countrySupportLevel = 99;
            if (countryPositions) {
              countrySupportLevel = getValueFromPositions(countryPositions.get(indicatorId));
            }
            const levels = queryValue.indexOf('=') > -1
              && queryValue.split('=')[1].split('|');
            if (!levels) return memo;
            return levels.indexOf(`${countrySupportLevel}`) > -1;
          },
          true,
        );
        return pass;
      });
    }
    return countries;
  }
);

export const selectCountries = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectCountriesByTopicPosition,
  selectConnections,
  selectActorActionsGroupedByActor,
  selectMembershipsGroupedByParent,
  selectMembershipsGroupedByMember,
  (
    ready,
    countries,
    connections,
    actionsAsActorGrouped,
    memberConnectionsGrouped,
    associationConnectionsGrouped,
  ) => {
    const actions = ready && connections.get(API.ACTIONS);
    const result = ready && countries.map(
      (actor) => {
        const actorId = parseInt(actor.get('id'), 10);
        // actors
        const actorActions = actionsAsActorGrouped.get(actorId) || Map();
        const actorActionsByType = actionsByType(actorActions, actions);
        // actions as member of group
        const actorAssociations = associationConnectionsGrouped.get(actorId);
        const actorActionsAsMember = actorAssociations && actorAssociations.size > 0 && actorAssociations.reduce((memo, associationId) => {
          const associationActions = actionsAsActorGrouped.get(parseInt(associationId, 10));
          if (associationActions) {
            return memo.concat(associationActions);
          }
          return memo;
        }, Map());
        const actorActionsAsMemberByType = actorActionsAsMember && actionsByType(actorActionsAsMember, actions);
        // actions as parent of actor
        const actorMembers = memberConnectionsGrouped.get(actorId);
        const actorActionsAsParent = actorMembers && actorMembers.size > 0 && actorMembers.reduce((memo, memberId) => {
          const memberActions = actionsAsActorGrouped.get(parseInt(memberId, 10));
          if (memberActions) {
            return memo.concat(memberActions);
          }
          return memo;
        }, Map());
        const actorActionsAsParentByType = actorActionsAsParent && actionsByType(actorActionsAsParent, actions);

        return actor
          .set('actionsByType', actorActionsByType)
          .set('actionsAsMemberByType', actorActionsAsMemberByType)
          .set('actionsAsParentByType', actorActionsAsParentByType);
      }
    );
    return result || null;
  },
);
