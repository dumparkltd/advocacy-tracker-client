import React from 'react';
import styled from 'styled-components';
import { Text } from 'grommet';

const LabelTooltip = styled((p) => <Text size="xsmall" wordBreak="keep-all" {...p} />)`
  text-align: ${({ align }) => align === 'end' ? 'right' : 'left'};
  line-height: 12px;
`;
export default LabelTooltip;
