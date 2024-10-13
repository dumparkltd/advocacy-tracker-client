import React from 'react';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import { Button } from 'grommet';
const PrimaryButton = styled((p) => (
  <Button plain {...p} />
))`
  font-family: ${({ theme }) => theme.fonts.title};
  color: white;
  text-transform: uppercase;
  background: ${palette('primary', 1)};
  border-radius: 0;
  border: 1px solid transparent;
  padding-top: ${({ theme }) => theme.global.edgeSize.small};
  padding-bottom: ${({ theme }) => theme.global.edgeSize.small};
  padding-left: ${({ theme }) => theme.global.edgeSize.medium};
  padding-right: ${({ theme }) => theme.global.edgeSize.medium};
  &:hover {
    box-shadow: none;
    background: ${palette('primary', 0)};
  }
`;

export default PrimaryButton;
