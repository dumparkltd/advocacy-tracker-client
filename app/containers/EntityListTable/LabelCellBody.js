import React from 'react';
import { Text } from 'grommet';
import styled from 'styled-components';

const LabelCellBody = styled((p) => <Text size="xxsmall" wordBreak="keep-all" {...p} />)`
  line-height: 16px;
  text-align: ${({ align }) => align === 'end' ? 'right' : 'left'};
  position: relative;
  top: 1px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export default LabelCellBody;
