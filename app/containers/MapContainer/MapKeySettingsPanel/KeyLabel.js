import React from 'react';
import styled from 'styled-components';
import { Text } from 'grommet';

const KeyLabel = styled((p) => <Text size="xxsmall" {...p} />)`
  white-space: nowrap;
  font-size: ${(props) => props.theme.text.xsmall.size};
`;
export default KeyLabel;
