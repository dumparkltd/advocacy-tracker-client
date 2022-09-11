import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Box, Text } from 'grommet';

const Styled = styled((p) => <Box direction="row" align="center" gap="small" {...p} />)`
  padding: ${({ plain }) => plain ? 0 : 5}px 0;
`;

export function MapOption({
  option,
  type = 'option',
  plain,
}) {
  const {
    active, onClick, label, id = 0,
  } = option;
  const optionType = option.type || type;
  return (
    <Styled plain={plain}>
      <input
        id={`map-${optionType}-${id}`}
        type="checkbox"
        checked={active}
        onChange={onClick}
      />
      <Text as="label" htmlFor={`map-${optionType}-${id}`} size="xsmall">{label}</Text>
    </Styled>
  );
}

MapOption.propTypes = {
  option: PropTypes.object,
  type: PropTypes.string,
  plain: PropTypes.bool,
};

export default MapOption;
