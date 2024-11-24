import React from 'react';
import { Text } from 'grommet';
import styled from 'styled-components';

const Label = styled((p) => <Text size="xxsmall" wordBreak="keep-all" {...p} />)`
  text-align: ${({ align }) => align === 'end' ? 'right' : 'left'};
  position: relative;
  top: 1px;
`;

export default Label;
