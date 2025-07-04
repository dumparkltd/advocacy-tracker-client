import React from 'react';
import styled from 'styled-components';
import Button from 'components/buttons/ButtonSimple';

export default styled((p) => <Button {...p} />)`
  vertical-align: bottom;
  text-align: center;
  color: black;
  font-family: ${({ theme }) => theme.fonts.title};
  font-size: ${({ theme }) => theme.text.large.size};
  line-height: ${({ theme }) => theme.text.large.size};
  background-color: ${({ active }) => active ? 'transparent' : 'transparent'};
  border-bottom: 4px solid ${({ active }) => active ? 'black' : 'transparent'};
  cursor: ${({ active }) => active ? 'default' : 'pointer'};
  &:hover {
    color: ${({ theme, active }) => active ? 'black' : theme.global.colors.highlight};
    border-bottom: 4px solid ${({ active }) => active ? 'black' : 'transparent'};
  }
  padding: 5px 0.5em 5px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    font-size: ${({ theme }) => theme.text.xlarge.size};
    line-height: ${({ theme }) => theme.text.xlarge.size};
  }
  @media print {
    font-size: ${({ theme }) => theme.sizes.header.print.title};
  }
`;
