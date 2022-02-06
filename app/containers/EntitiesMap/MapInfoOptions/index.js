import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
// import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { Box, Text } from 'grommet';
import { MAP_OPTIONS } from 'themes/config';

import Gradient from './Gradient';
import Bins from './Bins';
import MapSubjectOptions from './MapSubjectOptions';
import MapMemberOption from './MapMemberOption';

const Title = styled((p) => <Text weight={600} {...p} />)``;
const SubTitle = styled((p) => <Text size="small" {...p} />)``;

const Styled = styled((p) => (
  <Box
    elevation="small"
    background="white"
    pad={{
      horizontal: 'small',
      bottom: 'large',
    }}
    {...p}
  />
))`
  position: absolute;
  left: 10px;
  bottom: 50px;
  width: 350px;
  z-index: 50;
  padding: 15px 20px 5px;
`;

export function MapInfoOptions({
  config, mapSubject,
}) {
  const {
    title, maxValue, subjectOptions, memberOption, subTitle,
  } = config;
  const stops = MAP_OPTIONS.GRADIENT[mapSubject];
  const noStops = stops.length;
  const maxFactor = maxValue / (noStops - 1);
  return (
    <Styled>
      <Box gap="xsmall" margin={{ bottom: 'small' }}>
        {title && (
          <Title>{title}</Title>
        )}
        {subTitle && (
          <SubTitle>{subTitle}</SubTitle>
        )}
      </Box>
      {!!maxValue && maxValue > 16 && (
        <Gradient
          config={{
            range: [1, maxValue],
            stops: stops.map((color, i) => ({
              value: i * maxFactor,
              color,
            })),
          }}
        />
      )}
      {!!maxValue && maxValue <= 16 && maxValue > 0 && (
        <Bins config={{ range: [1, maxValue], maxValue, stops }} />
      )}
      {subjectOptions && (
        <MapSubjectOptions options={subjectOptions} />
      )}
      {memberOption && (
        <MapMemberOption option={memberOption} />
      )}
    </Styled>
  );
}

MapInfoOptions.propTypes = {
  config: PropTypes.object,
  mapSubject: PropTypes.string,
};

export default MapInfoOptions;
