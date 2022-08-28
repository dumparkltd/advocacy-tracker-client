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

import { ACTORTYPES } from 'themes/config';

import {
  selectActortypeActors,
  selectIncludeActorMembers,
  selectIncludeTargetMembers,
} from 'containers/App/selectors';

import {
  setIncludeActorMembers,
  setIncludeTargetMembers,
} from 'containers/App/actions';


// import appMessages from 'containers/App/messages';
import qe from 'utils/quasi-equals';
// import { hasGroupActors } from 'utils/entities';
import MapContainer from 'containers/MapContainer/MapWrapper';
import MapOption from 'containers/MapContainer/MapInfoOptions/MapOption';

// import messages from './messages';

const Styled = styled((p) => <Box {...p} />)`
  z-index: 0;
`;
const MapTitle = styled((p) => <Box margin={{ vertical: 'xsmall' }} {...p} />)``;
const MapOptions = styled((p) => <Box margin={{ horizontal: 'medium' }} {...p} />)``;
const MapWrapper = styled((p) => <Box margin={{ horizontal: 'medium' }} {...p} />)`
  position: relative;
  height: 400px;
  background: #F9F9FA;
`;

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
  // typeId,
  // intl,
}) {
  // const { intl } = this.context;
  // let type;
  const countriesJSON = topojson.feature(
    countriesTopo,
    Object.values(countriesTopo.objects)[0],
  );
  const hasCountries = entities.get(parseInt(ACTORTYPES.COUNTRY, 10));
  const hasAssociations = mapSubject === 'actors'
    ? !!entities.get(parseInt(ACTORTYPES.GROUP, 10))
    : !!(entities.get(parseInt(ACTORTYPES.GROUP, 10)) || entities.get(parseInt(ACTORTYPES.REG, 10)) || entities.get(parseInt(ACTORTYPES.CLASS, 10)));
  if (!hasCountries && !hasAssociations) return null;
  const includeMembers = mapSubject === 'actors'
    ? includeActorMembers
    : includeTargetMembers;

  const countriesVia = hasMemberOption && includeMembers && hasAssociations && entities.reduce(
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
  const countryData = countriesJSON.features.reduce(
    (memo, feature) => {
      const countryDirect = hasCountries && entities.get(parseInt(ACTORTYPES.COUNTRY, 10)).find(
        (e) => qe(e.getIn(['attributes', 'code']), feature.properties.ADM0_A3)
      );
      const countryVia = !countryDirect && hasAssociations && countriesVia && countriesVia.find(
        (e) => qe(e.getIn(['attributes', 'code']), feature.properties.ADM0_A3)
      );
      const country = countryDirect || countryVia;

      if (country) {
        return [
          ...memo,
          {
            ...feature,
            id: country.get('id'),
            attributes: country.get('attributes').toJS(),
            tooltip: {
              id: country.get('id'),
              title: country.getIn(['attributes', 'title']),
            },
            values: {
              actions: 1,
            },
            style: {
              fillOpacity: countryDirect ? 1 : 0.6,
            },
          },
        ];
      }
      return memo;
    },
    [],
  );

  let memberOption;
  let mapTitle;
  if (mapSubject === 'targets') {
    mapTitle = `${countryData ? countryData.length : 'No'} countries targeted by activity`;
    // note this should always be true!
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

  return (
    <Styled hasHeader noOverflow>
      <MapWrapper>
        <MapContainer
          countryData={countryData}
          countryFeatures={countriesJSON.features}
          indicator="actions"
          onActorClick={(id) => onActorClick(id)}
          maxValueCountries={1}
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
      {(memberOption || mapTitle) && (
        <MapOptions>
          {mapTitle && (
            <MapTitle>
              <Text weight={600}>{mapTitle}</Text>
            </MapTitle>
          )}
          {memberOption && (
            <MapOption option={memberOption} type="member" />
          )}
        </MapOptions>
      )}
    </Styled>
  );
}

ActionMap.propTypes = {
  entities: PropTypes.instanceOf(Map), // actors by actortype for current action
  countries: PropTypes.instanceOf(Map), // all countries needed for indirect connections
  onSetIncludeActorMembers: PropTypes.func,
  onSetIncludeTargetMembers: PropTypes.func,
  includeActorMembers: PropTypes.bool,
  includeTargetMembers: PropTypes.bool,
  hasMemberOption: PropTypes.bool,
  onActorClick: PropTypes.func,
  mapSubject: PropTypes.string,
  // typeId: PropTypes.oneOfType([
  //   PropTypes.string,
  //   PropTypes.number,
  // ]),
};

const mapStateToProps = (state) => ({
  countries: selectActortypeActors(state, { type: ACTORTYPES.COUNTRY }),
  includeActorMembers: selectIncludeActorMembers(state),
  includeTargetMembers: selectIncludeTargetMembers(state),
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

export default connect(mapStateToProps, mapDispatchToProps)(ActionMap);
