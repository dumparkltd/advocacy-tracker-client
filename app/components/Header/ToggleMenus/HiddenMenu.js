import React from 'react';
import styled from 'styled-components';
import { Box } from 'grommet';

const HiddenMenu = styled((p) => <Box {...p} printHide />)`
  position: absolute;
  left: auto;
  right: 0;
  width: 100%;
  top: ${({ theme }) => theme.sizes.header.banner.heightMobile}px;
  background: white;
  @media (min-width: ${({ theme }) => theme.breakpoints.large}) {
    top: ${({ theme }) => theme.sizes.header.banner.height}px;
    width: 300px;
  }
`;
export default HiddenMenu;
