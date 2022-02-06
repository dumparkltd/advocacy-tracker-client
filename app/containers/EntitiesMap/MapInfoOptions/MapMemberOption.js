import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Box, Text } from 'grommet';

const Styled = styled((p) => <Box direction="row" align="center" gap="small" {...p} />)`
  padding: 5px 0;
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    padding: 10px 0;
  }
`;

export function MapMemberOption({ option }) {
  const { active, onClick, label } = option;
  return (
    <Styled>
      <input
        id="map-member"
        type="checkbox"
        checked={active}
        onChange={onClick}
      />
      <Text as="label" htmlFor="map-member" size="small">{label}</Text>
    </Styled>
  );
}

MapMemberOption.propTypes = {
  option: PropTypes.object,
};

export default MapMemberOption;
