import styled from 'styled-components';
import React from 'react';
import { usePrint } from 'containers/App/PrintContext';

const Styled = styled.div`
  display: ${({ isPrint, displayProp }) => isPrint ? 'none !important' : (displayProp || 'block')};
  @media print {
    display: none !important;
  }
`;

export function PrintHide(props) {
  const isPrint = usePrint();
  return <Styled isPrint={isPrint} {...props} />;
}

export default PrintHide;
