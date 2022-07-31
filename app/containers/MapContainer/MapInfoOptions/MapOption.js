import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Box, Text } from 'grommet';

const Styled = styled((p) => <Box direction="row" align="center" gap="small" {...p} />)`
  padding: 5px 0;
`;

export function MapOption({ option, type = 'option' }) {
  const {
    active, onClick, label, key = 0,
  } = option;
  return (
    <Styled>
      <input
        id={`map-${type}-${key}`}
        type="checkbox"
        checked={active}
        onChange={onClick}
      />
      <Text as="label" htmlFor={`map-${type}-${key}`} size="xsmall">{label}</Text>
    </Styled>
  );
}

MapOption.propTypes = {
  option: PropTypes.object,
  type: PropTypes.string,
};

export default MapOption;
