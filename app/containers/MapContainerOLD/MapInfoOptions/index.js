import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
// import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { Box, Text } from 'grommet';

import MapKey from './MapKey';
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
  z-index: 50;
  bottom: 10px;
  width: 100%;
  left: 0;
  max-width: 350px;
  padding: 5px 10px 5px;
  @media (min-width: 370px) {
    left: 10px;
    bottom: 50px;
  }
`;

export function MapInfoOptions({
  config, mapSubject,
}) {
  const {
    title, maxValue, subjectOptions, memberOption, subTitle,
  } = config;
  return (
    <Styled>
      {subjectOptions && (
        <MapSubjectOptions options={subjectOptions} />
      )}
      <Box gap="xsmall" margin={{ bottom: 'small' }}>
        {title && (
          <Title>{title}</Title>
        )}
        {subTitle && (
          <SubTitle>{subTitle}</SubTitle>
        )}
      </Box>
      {maxValue && <MapKey maxValue={maxValue} mapSubject={mapSubject} />}
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
