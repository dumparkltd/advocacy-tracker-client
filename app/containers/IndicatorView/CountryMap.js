/*
 *
 * CountryMap
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import styled from 'styled-components';
import { Box, Text, Button } from 'grommet';

import * as topojson from 'topojson-client';
import { injectIntl, intlShape } from 'react-intl';

import countriesTopo from 'data/ne_countries_10m_v5.topo.json';
import countryPointsJSON from 'data/country-points.json';

import {
  ROUTES,
  ACTION_INDICATOR_SUPPORTLEVELS,
} from 'themes/config';
import appMessages from 'containers/App/messages';
import qe from 'utils/quasi-equals';
// import { hasGroupActors } from 'utils/entities';
import MapWrapper from 'containers/MapContainer/MapWrapper';
import MapOption from 'containers/MapContainer/MapInfoOptions/MapOption';
import MapKeySimple from 'containers/MapContainer/MapKeySimple';

const Styled = styled((p) => <Box {...p} />)`
  z-index: 0;
`;
const MapOuterWrapper = styled((p) => <Box margin={{ horizontal: 'medium' }} {...p} />)`
  position: relative;
  height: 400px;
  background: #F9F9FA;
  @media print {
    page-break-inside: avoid;
    break-inside: avoid;
  }
`;
const MapTitle = styled((p) => <Box margin={{ vertical: 'xsmall' }} {...p} />)``;
const MapOptions = styled((p) => <Box margin={{ horizontal: 'medium' }} {...p} />)``;
const StatementButton = styled((p) => <Button {...p} />)`
  font-weight: 500;
  font-size: 13px;
  line-height: 16px;
  display: inline-block;
  stroke: ${({ theme }) => theme.global.colors.a};
  &:hover {
    stroke: ${({ theme }) => theme.global.colors.aHover};
  }
`;

const reduceCountryData = ({
  features,
  countries,
  onEntityClick,
  intl,
}) => features.reduce(
  (memo, feature) => {
    const country = countries.find(
      (c) => qe(c.getIn(['attributes', 'code']), feature.properties.ADM0_A3 || feature.properties.code),
    );
    if (country) {
      const countryPosition = country.get('position');
      const level = countryPosition && countryPosition.get('supportlevel_id');
      const position = level && ACTION_INDICATOR_SUPPORTLEVELS[parseInt(level, 10)];
      if (position) {
        const statement = countryPosition.get('measure');
        return [
          ...memo,
          {
            ...feature,
            id: country.get('id'),
            positionId: position.value,
            hasData: true,
            tooltip: {
              id: country.get('id'),
              title: country.getIn(['attributes', 'title']),
              content: (
                <Box gap="small" pad={{ top: 'small' }}>
                  <Text weight={600}>
                    {intl.formatMessage(appMessages.supportlevels[position.value])}
                  </Text>
                  <Box gap="xxsmall">
                    <Box direction="row" gap="xxsmall" align="center">
                      <Text size="xxxsmall" color="textSecondary">
                        Statement
                      </Text>
                      {statement.get('date_start') && (
                        <Text size="xxxsmall" color="textSecondary">
                          {`(${intl.formatDate(statement.get('date_start'))})`}
                        </Text>
                      )}
                    </Box>
                    <StatementButton
                      as="a"
                      plain
                      href={`${ROUTES.ACTION}/${statement.get('id')}`}
                      onClick={(evt) => {
                        if (evt && evt.preventDefault) evt.preventDefault();
                        if (evt && evt.stopPropagation) evt.stopPropagation();
                        onEntityClick(statement.get('id'), ROUTES.ACTION);
                      }}
                    >
                      {statement.get('title')}
                    </StatementButton>
                  </Box>
                </Box>
              ),
            },
            style: {
              fillColor: position.color,
            },
          },
        ];
      }
      return memo;
    }
    return memo;
  },
  [],
);

export function CountryMap({
  countries,
  indicatorId,
  onEntityClick,
  intl,
  onSetIncludeInofficial,
  includeInofficial,
  onSetIncludeActorMembers,
  includeActorMembers,
}) {
  // const { intl } = this.context;
  // let type;
  const countriesJSON = topojson.feature(
    countriesTopo,
    Object.values(countriesTopo.objects)[0],
  );
  const countryData = countries && reduceCountryData({
    features: countriesJSON.features,
    countries,
    onEntityClick,
    intl,
  });
  const countryPointData = countries && reduceCountryData({
    features: countryPointsJSON.features,
    countries,
    onEntityClick,
    intl,
  });
  const options = Object.values(
    ACTION_INDICATOR_SUPPORTLEVELS
  ).sort(
    (a, b) => a.order < b.order ? -1 : 1
  ).map(
    (option) => ({
      ...option,
      count: countryData
        && countryData.filter(
          (country) => qe(country.positionId, option.value)
        ).length,
      label: intl.formatMessage(appMessages.supportlevels[option.value]),
    })
  );
  return (
    <Styled hasHeader noOverflow>
      <MapOuterWrapper>
        <MapWrapper
          countryData={countryData}
          countryPointData={countryPointData}
          countryFeatures={countriesJSON.features}
          indicator={indicatorId}
          onCountryClick={(id) => onEntityClick(id)}
          fitBounds
          projection="gall-peters"
        />
      </MapOuterWrapper>
      <MapOptions>
        <MapTitle>
          <Text weight={600}>UN Member States’ level of support</Text>
        </MapTitle>
        <MapOption
          option={{
            active: includeActorMembers,
            onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
            label: 'Include statements of groups (countries belong to)',
          }}
          type="member"
        />
        <MapOption
          option={{
            active: !includeInofficial,
            onClick: () => onSetIncludeInofficial(includeInofficial ? '0' : '1'),
            label: 'Only show "official" statements (Level of Authority)',
          }}
          type="official"
        />
      </MapOptions>
      <MapOptions>
        <MapKeySimple
          options={options}
          title="States by level of support"
        />
      </MapOptions>
    </Styled>
  );
}

CountryMap.propTypes = {
  countries: PropTypes.instanceOf(Map),
  onEntityClick: PropTypes.func,
  indicatorId: PropTypes.string,
  intl: intlShape,
  onSetIncludeInofficial: PropTypes.func,
  includeInofficial: PropTypes.bool,
  onSetIncludeActorMembers: PropTypes.func,
  includeActorMembers: PropTypes.bool,
};

export default injectIntl(CountryMap);
