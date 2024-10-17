import React from 'react';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import ToggleButton from './ToggleButton';

const ToggleButtonCreate = styled((p) => <ToggleButton plain {...p} />)`
  background-color: ${palette('primary', 1)};
  border-radius: 999px;
  border: none;
  position: absolute;
  box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.2);
  padding: 20px;
  top: 16px;
  right: ${({ showMenu, theme }) => showMenu ? theme.global.edgeSize.medium : '129px'};
  &:hover {
    opacity: 1;
    background-color: ${palette('primary', 0)};
    color: white;
    box-shadow: none;
  }
`;

export default ToggleButtonCreate;
