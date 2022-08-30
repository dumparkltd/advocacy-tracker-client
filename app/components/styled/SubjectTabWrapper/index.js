import React from 'react';
import styled from 'styled-components';
import { Box } from 'grommet';

const SubjectTabWrapper = styled((p) => (
  <Box
    margin={{ bottom: 'large', horizontal: 'medium' }}
    {...p}
  />
))`
  border-bottom: ${({ hasBorder = true }) => hasBorder ? 5 : 0}px solid;
  border-bottom-color: ${({ hasBorder = true, theme }) => hasBorder
    ? theme.global.colors.border.lighter
    : 'transparent'
};
`;

export default SubjectTabWrapper;
