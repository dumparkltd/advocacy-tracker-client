/*
 *
 * ActorActivitiesMap
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Box, Text } from 'grommet';

import * as topojson from 'topojson-client';
// import { FormattedMessage } from 'react-intl';

import countriesTopo from 'data/ne_countries_10m_v5.topo.json';

import { ACTORTYPES, ACTIONTYPES } from 'themes/config';

import {
  selectActortypeActors,
  selectIncludeActorMembers,
  selectIncludeTargetMembers,
  selectMembershipsGroupedByAssociation,
} from 'containers/App/selectors';

import {
  setIncludeActorMembers,
  setIncludeTargetMembers,
} from 'containers/App/actions';


// import appMessages from 'containers/App/messages';
import qe from 'utils/quasi-equals';
// import { hasGroupActors } from 'utils/entities';
import MapContainerOLD from 'containers/MapContainerOLD';
import MapMemberOption from 'containers/MapContainerOLD/MapInfoOptions/MapMemberOption';
import MapKey from 'containers/MapContainerOLD/MapInfoOptions/MapKey';
// import messages from './messages';

const Styled = styled((p) => <Box {...p} />)`
  z-index: 0;
`;
const MapTitle = styled((p) => <Box margin={{ horizontal: 'medium', vertical: 'xsmall' }} {...p} />)``;
const MapKeyWrapper = styled((p) => <Box margin={{ horizontal: 'medium', vertical: 'xsmall' }} {...p} />)`
  max-width: 400px;
`;
const MapOptions = styled((p) => <Box margin={{ horizontal: 'medium' }} {...p} />)``;
const MapWrapper = styled((p) => <Box margin={{ horizontal: 'medium' }} {...p} />)`
  position: relative;
  height: 400px;
  background: #F9F9FA;
`;

const addToList = (list, countryId, actionId) => {
  // if already present, add action id to country key
  if (list.get(countryId)) {
    return !list.get(countryId).includes(actionId)
      ? list.set(countryId, list.get(countryId).push(actionId))
      : list;
  }
  // else add country with action id as first entry
  return list.set(countryId, List([actionId]));
};
const addCountryActionIdsToList = (
  countryList, actorsByType, actionId,
) => actorsByType.reduce(
  (memo, countryId) => addToList(memo, countryId, actionId),
  countryList,
);
const addMemberCountryActionIdsToList = (
  countryList, actorsByType, actionId, memberships, countries,
) => actorsByType.reduce(
  (countryListMemo, groupId) => memberships.get(groupId)
    ? memberships.get(groupId).reduce(
      // only add if country exists
      (memo, memberId) => countries.get(memberId.toString())
        ? addToList(memo, memberId, actionId)
        : memo,
      countryListMemo,
    )
    : countryListMemo,
  countryList,
);

const addAllCountryActionIdsToList = (
  countryList,
  actionId,
  actorsByType,
  memberships,
  countries,
  includeMembers,
) => actorsByType.reduce(
  (memo, actortypeActors, actortypeId) => {
    if (qe(actortypeId, ACTORTYPES.COUNTRY)) {
      return addCountryActionIdsToList(memo, actortypeActors, actionId);
    }
    // TODO check actortype if it can have members
    if (includeMembers && !qe(actortypeId, ACTORTYPES.ORG)) {
      return addMemberCountryActionIdsToList(
        memo,
        actortypeActors,
        actionId,
        memberships,
        countries,
      );
    }
    return memo;
  },
  countryList,
);

export function ActorActivitiesMap({
  actor,
  actions,
  actionsAsMember,
  mapSubject,
  onSetIncludeActorMembers,
  onSetIncludeTargetMembers,
  includeActorMembers,
  includeTargetMembers,
  onEntityClick,
  countries,
  hasMemberOption,
  actiontypeId,
  actiontypeHasTarget,
  memberships,
  actorCanBeMember,
  // intl,
}) {
  // console.log('actions', actions && actions.toJS())
  // console.log('actionsAsMember', actionsAsMember && actionsAsMember.toJS())
  // console.log('actiontypeHasTarget', actiontypeHasTarget)
  // console.log('hasMemberOption', hasMemberOption)
  // const { intl } = this.context;
  // let type;
  const countriesJSON = topojson.feature(
    countriesTopo,
    Object.values(countriesTopo.objects)[0],
  );
  let countryActionIds;
  const actorName = actor.getIn(['attributes', 'title']);
  let memberOption;
  let memberTargetOption;
  let mapTitle;
  let keyTitle;
  // show targets for actor's activities (real targets)
  // > donations / initiatives / regional seas conventions
  if (mapSubject === 'targets' && actiontypeHasTarget) {
    if (actions) {
      countryActionIds = actions.reduce(
        (memo, action) => {
          if (action.get('targetsByType')) {
            return addAllCountryActionIdsToList(
              memo,
              action.get('id'),
              action.get('targetsByType'),
              memberships,
              countries,
              includeTargetMembers,
            );
          }
          return memo;
        },
        countryActionIds || Map(),
      );
    }
    if (includeActorMembers && actionsAsMember) {
      countryActionIds = actionsAsMember.flatten(1).reduce(
        (memo, groupActor) => {
          if (groupActor.getIn(['actionsByType', actiontypeId])) {
            return memo.concat(groupActor.getIn(['actionsByType', actiontypeId]).toList());
          }
          return memo;
        },
        List()
      ).reduce(
        (memo, action) => {
          if (action.get('targetsByType')) {
            return addAllCountryActionIdsToList(
              memo,
              action.get('id'),
              action.get('targetsByType'),
              memberships,
              countries,
              includeTargetMembers,
            );
          }
          return memo;
        },
        countryActionIds || Map(),
      );
    }
  }

  // show targets for actor's activities (targets are actually actors)
  // > intl frameworks / regional strategies / national strategies
  if (mapSubject === 'targets' && !actiontypeHasTarget) {
    if (actions) {
      countryActionIds = actions.reduce(
        (memo, action) => {
          if (action.get('actorsByType')) {
            return addAllCountryActionIdsToList(
              memo,
              action.get('id'),
              action.get('actorsByType'),
              memberships,
              countries,
              includeActorMembers,
            );
          }
          return memo;
        },
        countryActionIds || Map(),
      );
    }
    if (includeActorMembers && actionsAsMember) {
      countryActionIds = actionsAsMember.flatten(1).reduce(
        (memo, groupActor) => {
          if (groupActor.getIn(['actionsByType', actiontypeId])) {
            return memo.concat(groupActor.getIn(['actionsByType', actiontypeId]).toList());
          }
          return memo;
        },
        List()
      ).reduce(
        (memo, action) => {
          if (action.get('actorsByType')) {
            return addAllCountryActionIdsToList(
              memo,
              action.get('id'),
              action.get('actorsByType'),
              memberships,
              countries,
              includeActorMembers, // always true
            );
          }
          return memo;
        },
        countryActionIds || Map(),
      );
    }
  }

  // show actors for activities targeting actor
  // > donations / reg strategies / initiatives
  if (mapSubject === 'actors') {
    if (actions) {
      countryActionIds = actions && actions.reduce(
        (memo, action) => {
          if (action.get('actorsByType')) {
            return addAllCountryActionIdsToList(
              memo,
              action.get('id'),
              action.get('actorsByType'),
              memberships,
              countries,
              includeActorMembers,
            );
          }
          return memo;
        },
        countryActionIds || Map(),
      );
    }
    if (includeTargetMembers && actionsAsMember) {
      countryActionIds = actionsAsMember.flatten(1).reduce(
        (memo, groupActor) => {
          if (groupActor.getIn(['targetingActionsByType', actiontypeId])) {
            return memo.concat(groupActor.getIn(['targetingActionsByType', actiontypeId]).toList());
          }
          return memo;
        },
        List()
      ).reduce(
        (memo, action) => {
          if (action.get('actorsByType')) {
            return addAllCountryActionIdsToList(
              memo,
              action.get('id'),
              action.get('actorsByType'),
              memberships,
              countries,
              includeActorMembers,
            );
          }
          return memo;
        },
        countryActionIds || Map(),
      );
    }
  }
  const countryCount = countryActionIds ? countryActionIds.size : 0;
  const hasRelated = countryCount > 0;
  // also figure out map options
  if (mapSubject === 'targets' && actiontypeHasTarget) {
    mapTitle = `${countryCount} ${countryCount === 1 ? 'country' : 'countries'} targeted by activities of '${actorName}'`;
    keyTitle = 'No of activities targeting each country';
    if (hasMemberOption) {
      if (actorCanBeMember) {
        memberOption = {
          active: includeActorMembers,
          onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
          label: `Include activities of groups '${actorName}' belongs to`,
          key: 'am',
        };
      }
      memberTargetOption = {
        active: includeTargetMembers,
        onClick: () => onSetIncludeTargetMembers(includeTargetMembers ? '0' : '1'),
        label: `Include regions, groups, classes targeted by activities of '${actorName}'`,
        key: 'tm',
      };
    }
  }

  // show targets for actor's activities (targets are actually actors)
  // > intl frameworks / regional strategies / national strategies
  if (mapSubject === 'targets' && !actiontypeHasTarget) {
    mapTitle = `${countryCount} ${countryCount === 1 ? 'country' : 'countries'} targeted by activities of '${actorName}'`; // '${actorName}`; // regional strategies, intl frameworks
    keyTitle = 'No of activities targeting each country';
    if (hasMemberOption && !qe(actiontypeId, ACTIONTYPES.NATL) && actorCanBeMember) {
      memberOption = {
        active: includeActorMembers,
        onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
        label: `Include activities of groups '${actorName}' belongs to`,
      };
    }
  }
  // show actors for activities targeting actor
  // > donations / reg strategies / initiatives
  if (mapSubject === 'actors') {
    mapTitle = `${countryCount} ${countryCount === 1 ? 'country' : 'countries'} with activities targeting '${actorName}'`;
    keyTitle = 'No of activities per country';
    if (hasMemberOption) {
      memberOption = {
        active: includeActorMembers,
        onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
        label: `Include member countries of groups targeting '${actorName}'`,
        key: 'am',
      };
      if (actorCanBeMember) {
        memberTargetOption = {
          active: includeTargetMembers,
          onClick: () => onSetIncludeTargetMembers(includeTargetMembers ? '0' : '1'),
          label: `Include countries with activities targeting '${actorName}' indirectly via a region, group or class`,
          key: 'tm',
        };
      }
    }
  }

  const countryData = !hasRelated
    ? countriesJSON.features
    : countriesJSON.features.reduce(
      (memo, feature) => {
        const country = countries && countries.find(
          (e) => qe(e.getIn(['attributes', 'code']), feature.properties.ADM0_A3)
        );
        if (country) {
          const isActive = qe(country.get('id'), actor.get('id'));
          const actionCount = countryActionIds
            && countryActionIds.get(parseInt(country.get('id'), 10))
            && countryActionIds.get(parseInt(country.get('id'), 10)).size;
          if (actionCount) {
            return [
              ...memo,
              {
                ...feature,
                id: country.get('id'),
                attributes: country.get('attributes').toJS(),
                tooltip: {
                  title: country.getIn(['attributes', 'title']),
                },
                isActive,
                values: {
                  actions: actionCount || 0,
                },
              },
            ];
          }
          if (isActive) {
            return [
              ...memo,
              {
                ...feature,
                id: country.get('id'),
                attributes: country.get('attributes').toJS(),
                isActive,
              },
            ];
          }
        }
        return memo;
      },
      [],
    ).sort(
      (a, b) => {
        if (a.isActive) return 1;
        if (b.isActive) return -1;
        return -1;
      },
    );
  const maxValue = countryActionIds && countryActionIds.reduce(
    (max, actionList) => Math.max(max, actionList.size),
    0,
  );
  return (
    <Styled hasHeader noOverflow>
      <MapWrapper>
        <MapContainerOLD
          countryData={countryData}
          countryFeatures={countriesJSON.features}
          indicator="actions"
          onCountryClick={(id) => onEntityClick(id)}
          maxValue={maxValue}
          includeActorMembers={includeActorMembers}
          includeTargetMembers={includeTargetMembers}
          mapSubject={mapSubject}
          fitBounds
          projection="gall-peters"
        />
      </MapWrapper>
      {mapTitle && (
        <MapTitle>
          <Text weight={600}>{mapTitle}</Text>
        </MapTitle>
      )}
      {maxValue > 1 && (
        <MapKeyWrapper>
          <Text size="small">{keyTitle}</Text>
          <MapKey mapSubject={mapSubject} maxValue={maxValue} maxBinValue={0} />
        </MapKeyWrapper>
      )}
      {(memberOption || memberTargetOption) && (
        <MapOptions>
          {memberTargetOption && (
            <MapMemberOption option={memberTargetOption} />
          )}
          {memberOption && (
            <MapMemberOption option={memberOption} />
          )}
        </MapOptions>
      )}
    </Styled>
  );
}

ActorActivitiesMap.propTypes = {
  actor: PropTypes.instanceOf(Map), // the current actor (ie country)
  actions: PropTypes.instanceOf(Map), // the current actor (ie country)
  actionsAsMember: PropTypes.instanceOf(Map), // the current actor (ie country)
  countries: PropTypes.instanceOf(Map), // all countries needed for indirect connections
  memberships: PropTypes.instanceOf(Map), // all countries needed for indirect connections
  onSetIncludeActorMembers: PropTypes.func,
  onSetIncludeTargetMembers: PropTypes.func,
  includeActorMembers: PropTypes.bool,
  includeTargetMembers: PropTypes.bool,
  hasMemberOption: PropTypes.bool,
  actiontypeHasTarget: PropTypes.bool,
  actorCanBeMember: PropTypes.bool,
  onEntityClick: PropTypes.func,
  mapSubject: PropTypes.string,
  actiontypeId: PropTypes.string,
};

const mapStateToProps = (state) => ({
  countries: selectActortypeActors(state, { type: ACTORTYPES.COUNTRY }),
  includeActorMembers: selectIncludeActorMembers(state),
  includeTargetMembers: selectIncludeTargetMembers(state),
  memberships: selectMembershipsGroupedByAssociation(state),
});
function mapDispatchToProps(dispatch) {
  return {
    onSetIncludeTargetMembers: (active) => {
      dispatch(setIncludeTargetMembers(active));
    },
    onSetIncludeActorMembers: (active) => {
      dispatch(setIncludeActorMembers(active));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActorActivitiesMap);
