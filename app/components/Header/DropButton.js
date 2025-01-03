import React from 'react';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import Button from 'components/buttons/ButtonSimple';

const DropButton = styled((p) => <Button {...p} />)`
  display: block;
  border-radius: ${({ menuType, inDrop }) => menuType === 'add' || inDrop ? '999px' : '0'};
  z-index: 300;
  color: white;
  padding: 5px;
  text-align: center;
  background-color: ${({ menuType, inDrop }) => {
    if (menuType === 'add' || inDrop) {
      return palette('primary', 1);
    }
    return 'transparent';
  }};
  box-shadow: ${({ menuType, inDrop }) => {
    if (menuType === 'add' || inDrop) {
      return '0px 2px 4px 0px rgba(0,0,0,0.2)';
    }
    return 'none';
  }};
  position: ${({ inDrop }) => inDrop ? 'absolute' : 'relative'};
  top: 0;
  right: 0;

  &:hover {
    opacity: ${({ menuType, inDrop }) => {
    if (menuType === 'add' || inDrop) {
      return 1;
    }
    return 0.9;
  }};
    background-color: ${({ menuType, inDrop }) => {
    if (menuType === 'add' || inDrop) {
      return palette('primary', 0);
    }
    return '#282a2c';
  }};
  }

  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    top: ${({ menuType }) => menuType === 'add' ? '25%' : '0'};
    right: ${({ offsetButtonRight }) => offsetButtonRight || '0'}px;
    padding: ${({ menuType }) => {
    if (menuType === 'add') {
      return '10px';
    }
    return '5px';
  }};
    height: ${({ theme, menuType }) => menuType === 'add'
    ? theme.sizes.header.banner.height - 2
    : theme.sizes.header.banner.height
}px;
    width: ${({ theme }) => theme.sizes.header.banner.height - 2}px;
  }
  @media (min-width: ${({ theme }) => theme.breakpointsMin.large}) {
    width: ${({ theme }) => theme.sizes.header.banner.height}px;
  }
`;
export default DropButton;
