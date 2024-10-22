import React from 'react';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Button } from 'grommet';

const DropButton = styled((p) => <Button plain {...p} />)`
  display: block;
  border-radius: 999px;
  z-index: 300;
  color: white;
  padding: 5px;
  background-color: ${({ menuType, inDrop }) => {
    if (menuType === 'add' || inDrop) {
      return palette('primary', 1);
    }
    return 'transparent';
  }};
  box-shadow: ${({ inDrop }) => {
    if (inDrop) {
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
    return 'transparent';
  }};
  }

  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    top: ${({ menuType }) => menuType === 'add' ? '33%' : '0'};
    right: ${({ offsetButtonRight }) => offsetButtonRight || '0'}px;
    padding: ${({ menuType }) => {
    if (menuType === 'add') {
      return '10px';
    }
    return '5px';
  }};
    height: ${({ theme, inDrop, menuType }) => (menuType !== 'add' && inDrop)
    ? theme.sizes.header.banner.heightMobile
    : theme.sizes.header.banner.height}px;
    width: ${({ theme, inDrop, menuType }) => (menuType !== 'add' && inDrop)
    ? theme.sizes.header.banner.heightMobile
    : theme.sizes.header.banner.height}px;
  }
`;
export default DropButton;
