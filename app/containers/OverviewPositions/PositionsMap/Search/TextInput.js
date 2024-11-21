import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import { TextInput as GrommetInput } from 'grommet';
const TextInput = forwardRef((p, ref) => <GrommetInput plain ref={ref} {...p} />);
export default styled(TextInput)`
  height: ${({ theme }) => theme.sizes.mapSearchBar.height - 2}px;
  border: none;
  padding: ${({ theme }) => theme.global.edgeSize.small};
  padding-left: ${({ theme }) => theme.global.edgeSize.xsmall};
  background: ${palette('light', 1)};
  color: ${palette('dark', 1)};
  font-weight: 300;
  font-size: ${({ theme }) => theme.text.small.size};
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
