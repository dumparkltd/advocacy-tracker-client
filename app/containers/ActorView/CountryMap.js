/*
 *
 * CountryMap
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import styled from 'styled-components';
import { Box } from 'grommet';

import * as topojson from 'topojson-client';
// import { FormattedMessage } from 'react-intl';

import countriesTopo from 'data/ne_countries_10m_v5.topo.json';

// import appMessages from 'containers/App/messages';
import qe from 'utils/quasi-equals';
// import { hasGroupActors } from 'utils/entities';
import MapContainerOLD from 'containers/MapContainerOLD';
// import messages from './messages';

const Styled = styled((p) => <Box margin={{ horizontal: 'small' }} {...p} />)`
  z-index: 0;
`;
const MapWrapper = styled((p) => <Box {...p} />)`
  position: relative;
  height: 300px;
  background: #F9F9FA;
`;

export function CountryMap({
  actor,
  // intl,
}) {
  const countriesJSON = topojson.feature(
    countriesTopo,
    Object.values(countriesTopo.objects)[0],
  );

  const countryData = countriesJSON.features.filter(
    (feature) => qe(actor.getIn(['attributes', 'code']), feature.properties.ADM0_A3)
  ).map(
    (feature) => ({
      ...feature,
      id: actor.get('id'),
      attributes: actor.get('attributes').toJS(),
      style: {
        interactive: false,
      },
    })
  );
  return (
    <Styled hasHeader noOverflow>
      <MapWrapper>
        <MapContainerOLD
          mapId="ll-map-country"
          countryData={countryData}
          countryFeatures={countriesJSON.features}
          styleType="country"
          fitBounds
          projection="gall-peters"
        />
      </MapWrapper>
    </Styled>
  );
}

CountryMap.propTypes = {
  actor: PropTypes.instanceOf(Map), // the current actor (ie country)
};


export default CountryMap;
