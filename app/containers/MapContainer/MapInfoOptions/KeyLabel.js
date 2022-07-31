import React from 'react';
import styled from 'styled-components';
import { Text } from 'grommet';

const KeyLabel = styled((p) => <Text size="xxsmall" {...p} />)`
  white-space: nowrap;
  font-size: ${(props) => props.theme.sizes.text.small};
`;
export default KeyLabel;
