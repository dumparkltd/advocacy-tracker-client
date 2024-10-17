import React from 'react';
import styled from 'styled-components';
import { Text } from 'grommet';

const BrandTitle = styled((p) => <Text {...p} />)`
  margin: 0;
  padding: 0;
  font-family: ${({ theme }) => theme.fonts.title};
  font-weight: 500;
  max-width: 110px;
  word-break: break-word;
  text-transform: uppercase;
  @media (min-width: ${({ theme }) => theme.breakpoints.large}) {
    max-width: 120px;
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.xlarge}) {
    max-width: 150px;
  }
`;

export default BrandTitle;
