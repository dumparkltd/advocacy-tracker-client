import React from 'react';
import styled from 'styled-components';
import { Button } from 'grommet';

const ToggleButton = styled((p) => <Button plain as="a" {...p} />)`
  display: block;
  z-index: 300;
  background-color: black;
  color: white;
  &:hover {
    color: white;
    opacity: 0.9;
  }
`;

export default ToggleButton;
