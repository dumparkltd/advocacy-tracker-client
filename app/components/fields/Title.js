import styled from 'styled-components';
import React from 'react';
import { usePrint } from 'containers/App/PrintContext';

const Styled = styled.h3`
  margin: 0;
  color: ${({ theme, isPrint }) => isPrint
    ? theme.global.colors.light
    : theme.global.colors.brand
};
  @media print {
    color: ${({ theme }) => theme.global.colors.light};
  }
`;

export function Title(props) {
  const isPrint = usePrint();
  return <Styled isPrint={isPrint} {...props} />;
}

export default Title;
