import React from 'react';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import { usePrint } from 'containers/App/PrintContext';

import Section from './Section';

const Styled = styled(Section)`
  border-color: ${palette('light', 1)};
  border-width: 1px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    border-right-style: ${({ hasAside, isPrint }) => (hasAside && !isPrint) ? 'solid' : 'none'};
    display: table-cell;
    width: ${({ hasAside }) => hasAside ? '70%' : '100%'};
  }
  @media print {
    display: ${({ hasAside }) => hasAside ? 'table-cell' : 'block'};
    width: ${({ hasAside }) => hasAside ? '70%' : '100%'};
    border-right-style: none;
  }
`;

export function Main(props) {
  const isPrint = usePrint();
  return <Styled isPrint={isPrint} {...props} />;
}
export default Main;
