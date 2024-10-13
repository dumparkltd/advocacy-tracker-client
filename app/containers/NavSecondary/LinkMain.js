import React from 'react';
import styled from 'styled-components';
import { Button } from 'grommet';

export default styled((p) => <Button plain {...p} />)`
  vertical-align: bottom;
  text-align: center;
  color: black;
  font-family: ${({ theme }) => theme.fonts.title};
  font-size: ${({ theme }) => theme.text.large.size};
  line-height: ${({ theme }) => theme.text.large.size};
  background-color: ${({ active }) => active ? 'transparent' : 'transparent'};
  border-bottom: 4px solid ${({ active }) => active ? 'black' : 'transparent'};
  &:hover {
    color:${({ theme }) => theme.global.colors.highlight};
    border-bottom: 4px solid ${({ active }) => active ? 'black' : 'transparent'};
  }
  height: ${(props) => props.theme.sizes.navSecondary.nav.heightMobile}px;
  padding: 5px 0.5em 0;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    padding: 30px 0.5em 0;
    height: ${(props) => props.theme.sizes.navSecondary.nav.height}px;
    font-size: ${({ theme }) => theme.text.xlarge.size};
    line-height: ${({ theme }) => theme.text.xlarge.size};
  }
  @media print {
    font-size: ${({ theme }) => theme.sizes.header.print.title};
  }
`;
