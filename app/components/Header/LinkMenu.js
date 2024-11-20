import React from 'react';
import styled from 'styled-components';
import Button from 'components/buttons/ButtonSimple';

const LinkMenu = styled((p) => <Button as="a" {...p} />)`
  padding-right: 5px;
  padding-left: 5px;
  padding-top: 5px;
  padding-bottom: 5px;

  color: ${({ active }) => active ? 'black' : 'white'};
  background-color: ${({ active }) => active ? 'white' : 'transparent'};

  font-family: ${({ theme }) => theme.fonts.title};
  font-size: 15px;
  line-height: 16px;
  font-weight: 300;
  text-transform: uppercase;
  text-align: center;

  &:hover {
    color: ${({ active }) => active ? 'black' : 'white'};
    background-color: ${({ active }) => active ? '#f0f0f0' : '#282a2c'};
  }
  @media (min-width: ${({ theme }) => theme.breakpointsMin.ms}) {
    font-size: 17px;
    line-height: 20px;
    padding-right: 10px;
    padding-left: 10px;
  }
  @media (min-width: ${({ theme }) => theme.breakpointsMin.large}) {
    height: ${({ theme }) => theme.sizes.header.banner.height}px;
    padding-right: 14px;
    padding-left: 14px;
    font-size: 20px;
    line-height: 24px;
  }
`;

export default LinkMenu;
