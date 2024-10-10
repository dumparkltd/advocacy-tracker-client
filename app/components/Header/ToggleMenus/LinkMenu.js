import React from 'react';
import styled from 'styled-components';
import { Button } from 'grommet';

const LinkMenu = styled((p) => <Button plain as="a" justify="center" fill="vertical" {...p} />)`
  color: ${({ active }) => active ? 'black' : 'white'};
  background-color: ${({ active }) => active ? 'white' : 'transparent'};
  text-transform: uppercase;
  font-family: ${({ theme }) => theme.fonts.title};
  font-size: ${({ theme }) => theme.text.large.size};
  line-height: ${({ theme }) => theme.text.large.size};

  padding-right: 12px;
  padding-left: 12px;
  padding-top: 22px;
  padding-bottom: 0px;
  text-align: center;
  font-size: ${({ theme }) => theme.text.small.size};
  line-height: ${({ theme }) => theme.text.small.height};
  font-weight: 300;
  height:${({ theme }) => theme.sizes.header.banner.height}px;
  &:hover {
    color: ${({ active }) => active ? 'black' : 'white'};
    background-color: ${({ active }) => active ? '#f0f0f0' : '#282a2c'};
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    font-size: ${({ theme }) => theme.text.xlarge.size};
    line-height: ${({ theme }) => theme.text.xlarge.size};
  }
  @media print {
    font-size: ${({ theme }) => theme.sizes.header.print.title};
  }
`;

export default LinkMenu;
