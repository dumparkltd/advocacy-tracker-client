import React from 'react';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Button } from 'grommet';

const SecondaryButton = styled((p) => (
  <Button plain {...p} />
))`
  font-family: ${({ theme }) => theme.fonts.title};
  color: ${palette('primary', 1)};
  text-transform: uppercase;
  border: none;
  padding-top: ${({ theme }) => theme.global.edgeSize.small};
  padding-bottom: ${({ theme }) => theme.global.edgeSize.small};
  padding-left: ${({ theme }) => theme.global.edgeSize.medium};
  padding-right: ${({ theme }) => theme.global.edgeSize.medium};
  &:hover {
    color: ${palette('primary', 0)};
  }
`;

export default SecondaryButton;
