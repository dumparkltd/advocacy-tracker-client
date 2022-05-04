/*
 *
 * IndicatorMap
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import styled from 'styled-components';
import { Box, Text } from 'grommet';

import * as topojson from 'topojson-client';
// import { FormattedMessage } from 'react-intl';

import countriesTopo from 'data/ne_countries_10m_v5.topo.json';

import { ACTORTYPES } from 'themes/config';

// import appMessages from 'containers/App/messages';
import qe from 'utils/quasi-equals';
// import { hasGroupActors } from 'utils/entities';
import MapContainer from 'containers/MapContainer';
import TooltipContent from 'containers/MapContainer/TooltipContent';
import MapKey from 'containers/MapContainer/MapInfoOptions/MapKey';
const MapKeyWrapper = styled((p) => <Box margin={{ horizontal: 'medium', vertical: 'xsmall' }} {...p} />)`
  max-width: 400px;
`;
// import messages from './messages';

const Styled = styled((p) => <Box {...p} />)`
  z-index: 0;
`;
const MapTitle = styled((p) => <Box margin={{ horizontal: 'medium', vertical: 'xsmall' }} {...p} />)``;
const MapWrapper = styled((p) => <Box margin={{ horizontal: 'medium' }} {...p} />)`
  position: relative;
  height: 500px;
`;

export function IndicatorMap({
  entities,
  mapSubject,
  onEntityClick,
  indicator,
  // intl,
}) {
  // const { intl } = this.context;
  // let type;
  const countriesJSON = topojson.feature(
    countriesTopo,
    Object.values(countriesTopo.objects)[0],
  );
  const indicatorCountries = entities.get(parseInt(ACTORTYPES.COUNTRY, 10));

  const countryData = countriesJSON.features.reduce(
    (memo, feature) => {
      const country = indicatorCountries.find(
        (c) => qe(c.getIn(['attributes', 'code']), feature.properties.ADM0_A3)
      );
      if (country) {
        const value = country.getIn(['actionValues', indicator.get('id')]);
        const stats = [
          {
            values: [
              {
                label: indicator.getIn(['attributes', 'title']),
                unit: indicator.getIn(['attributes', 'comment']),
                value,
              },
            ],
          },
        ];
        return [
          ...memo,
          {
            ...feature,
            id: country.get('id'),
            attributes: country.get('attributes').toJS(),
            tooltip: {
              title: country.getIn(['attributes', 'title']),
              content: (
                <TooltipContent
                  stats={stats}
                />
              ),
            },
            values: {
              indicator: parseFloat(value, 10),
            },
          },
        ];
      }
      return memo;
    },
    [],
  );

  // comment stores unit
  const keyTitle = indicator.getIn(['attributes', 'comment'])
    ? `${indicator.getIn(['attributes', 'title'])} (${indicator.getIn(['attributes', 'comment'])})`
    : indicator.getIn(['attributes', 'title']);
  const maxValue = countryData && countryData.reduce(
    (max, feature) => Math.max(max, feature.values.indicator),
    0,
  );
  return (
    <Styled hasHeader noOverflow>
      <MapTitle>
        <Text weight={600}>{indicator.getIn(['attributes', 'title'])}</Text>
      </MapTitle>
      <MapWrapper>
        <MapContainer
          countryData={countryData}
          countryFeatures={countriesJSON.features}
          indicator="indicator"
          onCountryClick={(id) => onEntityClick(id)}
          maxValue={maxValue}
          mapSubject={mapSubject}
          fitBounds
          projection="robinson"
        />
      </MapWrapper>
      <MapKeyWrapper>
        <Box margin={{ bottom: 'xsmall' }}>
          <Text size="small">{keyTitle}</Text>
        </Box>
        <MapKey
          mapSubject={mapSubject}
          maxValue={maxValue}
          maxBinValue={0}
          isIndicator
          unit={indicator.getIn(['attributes', 'comment'])}
        />
      </MapKeyWrapper>
    </Styled>
  );
}

IndicatorMap.propTypes = {
  indicator: PropTypes.instanceOf(Map), // the action
  entities: PropTypes.instanceOf(Map), // actors by actortype for current action
  onEntityClick: PropTypes.func,
  mapSubject: PropTypes.string,
};

// const mapStateToProps = (state) => ({
//   countries: selectActortypeActors(state, { type: ACTORTYPES.COUNTRY }),
// });

export default IndicatorMap;
