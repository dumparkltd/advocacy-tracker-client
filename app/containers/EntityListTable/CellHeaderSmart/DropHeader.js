import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import {
  Box, Text, Button,
} from 'grommet';
import Icon from 'components/Icon';

const DropLayerTitle = styled((p) => <Text size="small" {...p} />)`
  text-transform: uppercase;
  font-weight: bold;
`;
const CloseButton = styled((p) => <Button plain {...p} />)`
  border-radius: 999px;
  color: white;
  height: 25px;
  width: 25px;
  background-color: ${palette('primary', 1)};
  &:hover {
    opacity: 0.9;
  };
`;
export function DropHeader({ onClose, title }) {
  return (
    <Box
      pad={{ horizontal: 'ms', top: 'ms' }}
      direction="row"
      justify={title ? 'between' : 'end'}
      align="center"
      responsive={false}
      flex={{ shrink: 0 }}
    >
      {title && (
        <DropLayerTitle>{title}</DropLayerTitle>
      )}
      {onClose && (
        <CloseButton onClick={() => onClose()}>
          <Icon name="close" size="25px" />
        </CloseButton>
      )}
    </Box>
  );
}

DropHeader.propTypes = {
  title: PropTypes.string,
  onClose: PropTypes.func,
};

export default DropHeader;