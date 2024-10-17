import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import { TextInput } from 'grommet';
const TextInputBase = forwardRef((p, ref) => <TextInput plain ref={ref} {...p} />);
export default styled(TextInputBase)`
  font-weight: normal;
  font-size: ${({ theme }) => theme.text.small.size};
  background: ${palette('light', 1)};
  color: ${palette('dark', 1)};
  border: none;
  height: ${({ theme }) => theme.sizes.mapSearchBar.height - 2}px;
  padding: ${({ theme }) => theme.global.edgeSize.small};
  padding-left: ${({ theme }) => theme.global.edgeSize.xsmall};
  &:focus {
    outline: none;
    box-shadow: none;
  }
  &::placeholder {
    color: ${palette('dark', 1)};
    font-weight: 300;
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    font-size: ${({ theme }) => theme.text.medium.size};
  }
`;
