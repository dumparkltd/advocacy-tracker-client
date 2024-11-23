import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import { TextInput as GrommetInput } from 'grommet';
const TextInput = forwardRef((p, ref) => <GrommetInput plain ref={ref} {...p} />);
export default styled(TextInput)`
  min-height: ${({ small }) => small ? 35 : 45}px;
  color: ${palette('dark', 1)};
  border: none;
  padding: ${({ theme }) => theme.global.edgeSize.xsmall};
  font-size: ${({ theme }) => theme.text.small.size};
  font-weight: 300;
  &:focus {
    outline: none;
    box-shadow: none;
  }
  &::placeholder {
    color: ${palette('dark', 1)};
    opacity: 0.5;
    font-weight: 300;
  }
`;
