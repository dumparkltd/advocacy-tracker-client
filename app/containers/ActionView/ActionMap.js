/*
 *
 * ActionMap
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
import countryPointsJSON from 'data/country-points.json';

import { ACTORTYPES, MAP_OPTIONS } from 'themes/config';

import {
  selectActortypeActors,
  selectIncludeActorMembers,
  selectIncludeTargetMembers,
  selectIncludeTargetChildrenOnMap,
  selectIncludeTargetChildrenMembersOnMap,
} from 'containers/App/selectors';

import {
  setIncludeActorMembers,
  setIncludeTargetMembers,
  setIncludeTargetChildrenOnMap,
  setIncludeTargetChildrenMembersOnMap,
} from 'containers/App/actions';


// import appMessages from 'containers/App/messages';
import qe from 'utils/quasi-equals';

// import { hasGroupActors } from 'utils/entities';
import { scaleColorCount } from 'containers/MapContainer/utils';
import MapKeySimple from 'containers/MapContainer/MapKeySimple';
import MapContainer from 'containers/MapContainer/MapWrapper';
import MapOption from 'containers/MapContainer/MapInfoOptions/MapOption';

// import messages from './messages';

const Styled = styled((p) => <Box {...p} />)`
  z-index: 0;
`;
const MapTitle = styled((p) => <Box margin={{ vertical: 'xsmall' }} {...p} />)``;
const MapOptions = Box;
const MapWrapper = styled((p) => <Box {...p} />)`
  position: relative;
  height: 400px;
  background: #F9F9FA;
`;
const MAX_VALUE_COUNTRIES = 100;

const reduceCountryData = ({
  features,
  entities, // actors
  countriesVia,
  countriesChildTargets,
  hasDirectCountries,
  mapKeyOptionMap,
  mapSubject,
}) => features.reduce(
  (memo, feature) => {
    const countryDirect = hasDirectCountries
      && entities.get(parseInt(ACTORTYPES.COUNTRY, 10)).find(
        (e) => qe(e.getIn(['attributes', 'code']), feature.properties.ADM0_A3 || feature.properties.code)
      );
    const countryVia = !countryDirect
      && countriesVia
      && countriesVia.find(
        (e) => qe(e.getIn(['attributes', 'code']), feature.properties.ADM0_A3 || feature.properties.code)
      );
    const countryChildTarget = !countryDirect
      && !countryVia
      && countriesChildTargets
      && countriesChildTargets.find(
        (e) => qe(e.getIn(['attributes', 'code']), feature.properties.ADM0_A3 || feature.properties.code)
      );
    const country = countryDirect || countryVia || countryChildTarget;

    if (country) {
      let styleOption = mapKeyOptionMap.direct;
      let content = mapSubject === 'actors'
        ? 'As direct actor'
        : 'As direct target';
      if (countryVia) {
        styleOption = mapKeyOptionMap.via;
        content = mapSubject === 'actors'
          ? 'As member of group actor'
          : 'As member of target';
      } else if (countryChildTarget) {
        styleOption = mapKeyOptionMap.children;
        content = mapSubject === 'actors'
          ? 'As actor of child activity' //  should never happen
          : 'As target of child activity';
      }
      return [
        ...memo,
        {
          ...feature,
          id: country.get('id'),
          attributes: country.get('attributes').toJS(),
          tooltip: {
            id: country.get('id'),
            title: country.getIn(['attributes', 'title']),
            content: <Text size="small" style={{ fontStyle: 'italic' }}>{content}</Text>,
          },
          values: {
            actions: styleOption.colorValue,
          },
        },
      ];
    }
    return memo;
  },
  [],
);

export function ActionMap({
  entities,
  mapSubject,
  onSetIncludeActorMembers,
  onSetIncludeTargetMembers,
  includeActorMembers,
  includeTargetMembers,
  onActorClick,
  countries,
  hasMemberOption,
  hasChildTargetOption,
  includeTargetChildren,
  onSetIncludeTargetChildren,
  childActionsByActiontype,
  includeTargetChildrenMembers,
  onSetIncludeTargetChildrenMembers,
  // typeId,
  // intl,
}) {
  // const { intl } = this.context;
  // let type;
  const countriesJSON = topojson.feature(
    countriesTopo,
    Object.values(countriesTopo.objects)[0],
  );
  const hasDirectActors = entities && entities.size > 0;
  const hasDirectCountries = hasDirectActors
    && entities.get(parseInt(ACTORTYPES.COUNTRY, 10))
    && entities.get(parseInt(ACTORTYPES.COUNTRY, 10)).size > 0;

  let hasAssociations = false;
  if (hasDirectCountries) {
    hasAssociations = mapSubject === 'actors'
      ? !!entities.get(parseInt(ACTORTYPES.GROUP, 10))
      : !!(
        entities.get(parseInt(ACTORTYPES.GROUP, 10))
        || entities.get(parseInt(ACTORTYPES.REG, 10))
        || entities.get(parseInt(ACTORTYPES.CLASS, 10))
      );
  }
  // if (!hasCountries && !hasAssociations) return null;
  const includeMembers = mapSubject === 'actors'
    ? includeActorMembers
    : includeTargetMembers;

  const countriesVia = hasMemberOption
    && includeMembers
    && hasDirectActors
    && entities.reduce(
      (memo, typeActors, actortypeId) => {
        // skip non group types
        // TODO check actortypes db object
        if (qe(actortypeId, ACTORTYPES.COUNTRY) || qe(actortypeId, ACTORTYPES.ORG)) {
          return memo;
        }
        return memo.concat(typeActors.reduce(
          (memo2, association) => {
            if (association.getIn(['membersByType', ACTORTYPES.COUNTRY])) {
              return memo2.concat(association.getIn(['membersByType', ACTORTYPES.COUNTRY]).toList());
            }
            return memo2;
          },
          List(),
        ));
      },
      List(),
    ).toSet(
    ).map(
      (countryId) => countries.get(countryId.toString())
    );
  const countriesChildTargets = hasChildTargetOption
    && includeTargetChildren
    && childActionsByActiontype
    && childActionsByActiontype.reduce(
      (memo, typeActions) => memo.concat(typeActions.reduce(
        (memo2, childAction) => {
          let result = memo2;
          if (childAction.getIn(['targetsByType', ACTORTYPES.COUNTRY])) {
            result = result.concat(childAction.getIn(['targetsByType', ACTORTYPES.COUNTRY]).toList());
          }
          if (hasMemberOption && includeTargetChildrenMembers && childAction.getIn(['targetMembersByType', ACTORTYPES.COUNTRY])) {
            result = result.concat(childAction.getIn(['targetMembersByType', ACTORTYPES.COUNTRY]).toList());
          }
          return result;
        },
        List(),
      )),
      List(),
    ).toSet(
    ).map(
      (countryId) => countries.get(countryId.toString())
    );
  let mapKeyOptionMap = {};
  if (hasDirectActors) {
    mapKeyOptionMap = {
      ...mapKeyOptionMap,
      direct: {
        label: `Direct ${mapSubject === 'actors' ? 'actors' : 'targets'}`,
        colorValue: 100,
        color: scaleColorCount(MAX_VALUE_COUNTRIES, MAP_OPTIONS.GRADIENT[mapSubject], false)(100),
        order: 1,
      },
    };
  }
  if (hasMemberOption) {
    mapKeyOptionMap = {
      ...mapKeyOptionMap,
      via: {
        label: `Members of ${mapSubject === 'actors' ? 'group actors' : 'targeted regions and groups'}`,
        colorValue: mapSubject === 'actors' ? 50 : 70,
        color: scaleColorCount(MAX_VALUE_COUNTRIES, MAP_OPTIONS.GRADIENT[mapSubject], false)(mapSubject === 'actors' ? 50 : 70),
        order: 2,
      },
    };
  }
  if (hasChildTargetOption) {
    mapKeyOptionMap = {
      ...mapKeyOptionMap,
      children: {
        label: 'Targets of child activities',
        colorValue: 40,
        color: scaleColorCount(MAX_VALUE_COUNTRIES, MAP_OPTIONS.GRADIENT[mapSubject], false)(40),
        order: 3,
      },
    };
  }

  const countryData = entities && reduceCountryData({
    features: countriesJSON.features,
    entities, // actors
    countriesVia,
    countriesChildTargets,
    hasDirectCountries,
    mapKeyOptionMap,
    mapSubject,
  });
  const countryPointData = entities && ({
    features: countryPointsJSON.features,
    entities, // actors
    countriesVia,
    countriesChildTargets,
    hasDirectCountries,
    mapKeyOptionMap,
    mapSubject,
  });

  let memberOption;
  let mapTitle;
  if (mapSubject === 'targets') {
    mapTitle = `${countryData ? countryData.length : 'No'} countries targeted by activity`;
    // note this should be true unless no direct targets present
    if (hasMemberOption && hasAssociations) {
      memberOption = {
        active: includeTargetMembers,
        onClick: () => onSetIncludeTargetMembers(includeTargetMembers ? '0' : '1'),
        label: 'Include members of targeted regions and groups',
      };
    }
  }
  if (mapSubject === 'actors') {
    mapTitle = `${countryData ? countryData.length : 'No'} countries responsible by activity`;
    if (hasMemberOption && hasAssociations) {
      memberOption = {
        active: includeActorMembers,
        onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
        label: 'Include members of group actors',
      };
    }
  }
  const childrenOption = hasChildTargetOption && ({
    active: includeTargetChildren,
    onClick: () => onSetIncludeTargetChildren(includeTargetChildren ? '0' : '1'),
    label: 'Include targets of child activities',
  });
  const memberChildrenOption = hasChildTargetOption && hasMemberOption && includeTargetChildren && ({
    active: includeTargetChildrenMembers,
    onClick: () => onSetIncludeTargetChildrenMembers(includeTargetChildrenMembers ? '0' : '1'),
    label: 'Include members of targets of child activities',
  });
  return (
    <Styled hasHeader noOverflow>
      <MapWrapper>
        <MapContainer
          countryData={countryData}
          countryPointData={countryPointData}
          countryFeatures={countriesJSON.features}
          indicator="actions"
          onCountryClick={(id) => onActorClick(id)}
          maxValueCountries={MAX_VALUE_COUNTRIES}
          includeSecondaryMembers={
            includeActorMembers
            || includeTargetMembers
          }
          mapSubject={mapSubject}
          fitBounds
          projection="gall-peters"
          mapId="ll-action-map"
        />
      </MapWrapper>
      {mapTitle && (
        <Box>
          <MapTitle>
            <Text weight={600}>{mapTitle}</Text>
          </MapTitle>
        </Box>
      )}
      {(memberOption || childrenOption || memberChildrenOption) && (
        <MapOptions gap="xxsmall">
          {memberOption && (
            <MapOption option={memberOption} type="member" plain />
          )}
          {childrenOption && (
            <MapOption option={childrenOption} type="children" plain />
          )}
          {memberChildrenOption && (
            <Box margin={{ left: 'medium' }}>
              <MapOption option={memberChildrenOption} type="children-members" plain />
            </Box>
          )}
        </MapOptions>
      )}
      <Box>
        <MapKeySimple
          options={Object.values(mapKeyOptionMap)}
          title="Countries"
        />
      </Box>
    </Styled>
  );
}

ActionMap.propTypes = {
  entities: PropTypes.instanceOf(Map), // actors by actortype for current action
  countries: PropTypes.instanceOf(Map), // all countries needed for indirect connections
  childActionsByActiontype: PropTypes.instanceOf(Map), // all countries needed for indirect connections
  onSetIncludeActorMembers: PropTypes.func,
  onSetIncludeTargetMembers: PropTypes.func,
  onSetIncludeTargetChildren: PropTypes.func,
  onSetIncludeTargetChildrenMembers: PropTypes.func,
  includeActorMembers: PropTypes.bool,
  includeTargetMembers: PropTypes.bool,
  includeTargetChildren: PropTypes.bool,
  includeTargetChildrenMembers: PropTypes.bool,
  hasMemberOption: PropTypes.bool,
  hasChildTargetOption: PropTypes.bool,
  onActorClick: PropTypes.func,
  mapSubject: PropTypes.string,
};

const mapStateToProps = (state) => ({
  countries: selectActortypeActors(state, { type: ACTORTYPES.COUNTRY }),
  includeActorMembers: selectIncludeActorMembers(state),
  includeTargetMembers: selectIncludeTargetMembers(state),
  includeTargetChildren: selectIncludeTargetChildrenOnMap(state),
  includeTargetChildrenMembers: selectIncludeTargetChildrenMembersOnMap(state),
});
function mapDispatchToProps(dispatch) {
  return {
    onSetIncludeTargetMembers: (active) => {
      dispatch(setIncludeTargetMembers(active));
    },
    onSetIncludeTargetChildren: (active) => {
      dispatch(setIncludeTargetChildrenOnMap(active));
    },
    onSetIncludeTargetChildrenMembers: (active) => {
      dispatch(setIncludeTargetChildrenMembersOnMap(active));
    },
    onSetIncludeActorMembers: (active) => {
      dispatch(setIncludeActorMembers(active));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActionMap);
