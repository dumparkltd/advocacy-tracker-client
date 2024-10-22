import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Box, Button } from 'grommet';

const ActionButton = styled((p) => <Button plain {...p} />)`
  padding: 5px 10px 6px 10px;
  border-radius: 10px;

  font-family: ${({ theme }) => theme.fonts.title};
  font-weight: normal;
  font-size: 18px;
  text-transform: uppercase;
`;
const ConfirmButton = styled((p) => <ActionButton {...p} />)`
  background: ${palette('primary', 1)};
  color: white;
`;
const CancelButton = styled((p) => <ActionButton {...p} />)`
  color: ${palette('light', 4)};
`;

export function DropFooter({ onCancel, onConfirm }) {
  return (
    <Box
      pad={{ horizontal: 'ms', bottom: 'ms', top: 'small' }}
      direction="row"
      justify="end"
      gap="small"
      flex={{ shrink: 0 }}
    >
      <CancelButton onClick={() => onCancel()}>
        Cancel
      </CancelButton>
      <ConfirmButton onClick={() => onConfirm()}>
        Confirm
      </ConfirmButton>
    </Box>
  );
}

DropFooter.propTypes = {
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
};

export default DropFooter;
