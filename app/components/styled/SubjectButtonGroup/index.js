import React from 'react';
import styled from 'styled-components';
import { Box } from 'grommet';

const SubjectButtonGroup = styled((p) => (
  <Box
    direction="row"
    gap="small"
    margin={{ vertical: 'small', horizontal: 'medium' }}
    {...p}
  />
))`
  border-bottom: ${({ hasBorder = true }) => hasBorder ? 1 : 0}px solid;
  border-bottom-color: ${({ hasBorder = true, theme }) => hasBorder
    ? theme.global.colors.border.light
    : 'transparent'
};
  overflow-x: scroll;
  white-space: nowrap; 
`;

export default SubjectButtonGroup;
