import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import { TextInput } from 'grommet';

export default styled(forwardRef((p, ref) => <TextInput {...p} ref={ref} />))`
  font-weight: 600;
  font-size: ${({ theme }) => theme.text.small.size};
  background-color: white;
  color: ${palette('dark', 2)};
  border-top-left-radius: 999px;
  border-bottom-left-radius: 999px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border: solid 1px ${palette('light', 3)};
  border-right: 0px;
  height: ${({ theme }) => theme.sizes.mapSearchBar.height}px;
  &:focus {
    outline: none;
    box-shadow: none;
  }
  &::placeholder {
    color: ${palette('dark', 2)};
    font-weight: 400;
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    font-size: ${({ theme }) => theme.text.medium.size};
    padding-right: 16px;
    padding-left: 16px;
  }
`;
