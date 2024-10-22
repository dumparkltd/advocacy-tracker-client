import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Box, Text } from 'grommet';

const Checkbox = styled.input`
  accent-color: ${({ disabled }) => disabled ? palette('dark', 3) : 'black'};
`;
const ColumnOptionWrapper = styled((p) => (
  <Box
    pad={{ vertical: 'xsmall' }}
    direction="row"
    gap="small"
    flex={{ shrink: 0 }}
    {...p}
  />
))`
  border-bottom: 1px solid ${palette('light', 4)};
  &:first-child {
    border-top: 1px solid ${palette('light', 4)};
  }
`;
const ColumnTitle = styled((p) => <Text {...p} />)`
  color: ${({ isDisabled }) => isDisabled ? palette('dark', 3) : 'black'}
`;
export function DropBody({ options, onUpdate }) {
  return (
    <Box pad="ms" gap="none" flex={{ shrink: 0 }}>
      {options && options.map(
        (option, i) => option && (
          <ColumnOptionWrapper key={i}>
            <Checkbox
              type="checkbox"
              checked={!(option.hidden)}
              onChange={(evt) => {
                evt.stopPropagation();
                onUpdate();
              }}
            />
            <ColumnTitle>
              {option.title || option.label}
            </ColumnTitle>
          </ColumnOptionWrapper>
        )
      )}
    </Box>
  );
}

DropBody.propTypes = {
  options: PropTypes.array,
  onUpdate: PropTypes.func,
};

export default DropBody;
