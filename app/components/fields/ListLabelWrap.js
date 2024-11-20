import React from 'react';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Box } from 'grommet';

const ListLabelWrap = styled((p) => (
  <Box
    direction="row"
    align="center"
    gap="small"
    {...p}
  />
))`
  padding-bottom: 5px;
  border-bottom: 1px solid ${palette('light', 0)};
  width: 100%;
`;

export default ListLabelWrap;
