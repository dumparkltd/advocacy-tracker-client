import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Button } from 'grommet';

export default styled(forwardRef((props, ref) => (<Button plain {...props} ref={ref} />)))`
  border-bottom: 1px solid;
  border-top: 1px solid transparent;
  border-bottom-color:  ${({ last, theme }) => last ? 'transparent' : theme.global.colors.border.light};
  padding: 8px 12px;
  position: relative;
  background: transparent;
  width: 100%;
  &:last-child {
    border-bottom: 1px solid ${({ theme }) => theme.global.colors.border.light};
  }
  &:hover {
    color: ${({ theme }) => theme.global.colors.highlight};
  }
  &:focus-visible {
    color: ${({ theme }) => theme.global.colors.highlight};
    outline-offset: -2px;
    outline: 2px solid ${palette('primary', 0)};
    box-shadow: none;
  }
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding: 10px 16px;
  }
`;
