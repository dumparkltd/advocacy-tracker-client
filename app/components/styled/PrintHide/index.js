import React from 'react';
import styled from 'styled-components';
import { usePrint } from 'containers/App/PrintContext';

const Styled = styled.div`
  display: ${({ isPrint, displayProp }) => isPrint ? (displayProp || 'block') : 'none'};
  @media print {
    display: ${({ displayProp }) => displayProp || 'block'};
  }
`;

export function PrintOnly(props) {
  const isPrint = usePrint();
  return <Styled isPrint={isPrint} {...props} />;
}

export default PrintOnly;
