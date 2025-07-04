import React from 'react';
import styled from 'styled-components';

import { Box } from 'grommet';

const FieldLabelWrap = styled(
  (p) => <Box direction="row" align="center" gap="xsmall" {...p} />
)`
  min-height: 32px;
`;

export default FieldLabelWrap;
