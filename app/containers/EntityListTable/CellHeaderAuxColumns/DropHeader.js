import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Box, Text } from 'grommet';
import Icon from 'components/Icon';

import Button from 'components/buttons/ButtonSimple';

const DropLayerTitle = styled((p) => <Text size="small" {...p} />)`
  text-transform: uppercase;
  font-weight: bold;
`;
const CloseButton = styled((p) => <Button {...p} />)`
  border-radius: 999px;
  color: white;
  height: 25px;
  width: 25px;
  background-color: ${palette('primary', 1)};
  &:hover {
    opacity: 0.9;
  };
`;
export function DropHeader({ onClose }) {
  return (
    <Box
      pad={{ horizontal: 'ms', top: 'ms' }}
      direction="row"
      justify="between"
      align="center"
      responsive={false}
      flex={{ shrink: 0 }}
    >
      <DropLayerTitle>Configure columns</DropLayerTitle>
      <CloseButton onClick={() => onClose()}>
        <Icon name="close" size="25px" />
      </CloseButton>
    </Box>
  );
}

DropHeader.propTypes = {
  onClose: PropTypes.func,
};

export default DropHeader;
