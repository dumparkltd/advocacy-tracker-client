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
import {
  ROUTES,
  ACTION_INDICATOR_SUPPORTLEVELS,
} from 'themes/config';
import appMessages from 'containers/App/messages';
import qe from 'utils/quasi-equals';
// import { hasGroupActors } from 'utils/entities';
import MapContainer from 'containers/MapContainer/MapWrapper';
import MapOption from 'containers/MapContainer/MapInfoOptions/MapOption';

// import messages from './messages';
import Dot from 'components/styled/Dot';

const LabelWrap = styled((p) => <Box direction="row" gap="xsmall" align="center" {...p} />)``;

const Styled = styled((p) => <Box {...p} />)`
  z-index: 0;
`;
const MapWrapper = styled((p) => <Box margin={{ horizontal: 'medium' }} {...p} />)`
  position: relative;
  height: 400px;
  background: #F9F9FA;
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
export function CountryMap({
  countries,
  indicatorId,
  onEntityClick,
  intl,
  onSetIncludeInofficial,
  includeInofficial,
}) {
  // const { intl } = this.context;
  // let type;
  const countriesJSON = topojson.feature(
    countriesTopo,
    Object.values(countriesTopo.objects)[0],
  );
  const countryData = countries && countriesJSON.features.reduce(
    (memo, feature) => {
      const country = countries.find(
        (c) => qe(c.getIn(['attributes', 'code']), feature.properties.ADM0_A3),
      );
      if (country) {
        const countryPositions = country.getIn(['indicatorPositions', indicatorId]);
        const countryPosition = countryPositions && countryPositions.first();
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
    })
  );
  return (
    <Styled hasHeader noOverflow>
      <MapOptions>
        <MapTitle>
          <Text weight={600}>UN Member States’ level of support</Text>
        </MapTitle>
      </MapOptions>
      <MapWrapper>
        <MapContainer
          countryData={countryData}
          countryFeatures={countriesJSON.features}
          indicator={indicatorId}
          onCountryClick={(id) => onEntityClick(id)}
          fitBounds
          projection="gall-peters"
        />
      </MapWrapper>
      <MapOptions>
        <MapOption
          option={{
            active: !includeInofficial,
            onClick: () => onSetIncludeInofficial(includeInofficial ? '0' : '1'),
            label: 'Only show "official" statements (Level of Authority)',
          }}
        />
        <Box pad={{ vertical: 'small' }} gap="xsmall">
          <Text weight={600} size="small">Number of UN Member States by level of support</Text>
          <Box style={{ maxWidth: '300px' }}>
            {options.map(
              (option) => (
                <LabelWrap key={option.value} direction="row" fill="horizontal">
                  <Dot color={option.color} />
                  <Box direction="row" justify="between" gap="xsmall" fill="horizontal">
                    <Text size="small">
                      {`${intl.formatMessage(appMessages.supportlevels[option.value])}: `}
                    </Text>
                    <Text size="small" weight={600}>
                      {option.count || 0}
                    </Text>
                  </Box>
                </LabelWrap>
              )
            )}
          </Box>
        </Box>
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
};

export default injectIntl(CountryMap);
