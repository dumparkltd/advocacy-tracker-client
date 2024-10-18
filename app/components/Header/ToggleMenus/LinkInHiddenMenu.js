import React from 'react';
import styled from 'styled-components';
import { Button } from 'grommet';

const LinkInHiddenMenu = styled((p) => <Button plain as="a" {...p} />)`
  color: black;
  background-color: ${({ active }) => active ? '#f0f0f0' : 'transparent'};
  padding: 12px;
  width: 100%;
  font-size: ${({ theme }) => theme.text.small.size};
  line-height: ${({ theme }) => theme.text.small.height};
  font-weight: ${({ active }) => active ? 500 : 300};
  &:hover {
    color: black;
    background-color: #dddddd;
  }
`;

export default LinkInHiddenMenu;
