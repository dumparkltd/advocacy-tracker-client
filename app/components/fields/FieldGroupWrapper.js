import React from 'react';
import styled from 'styled-components';
import { usePrint } from 'containers/App/PrintContext';

const Styled = styled.div`
  background-color: transparent;
  border-bottom: ${({ groupType }) => groupType === 'smartTaxonomy' ? '1px solid' : 0};
  border-bottom-color: ${({ theme }) => theme.global.colors.background};
  padding-top: ${({ theme }) => theme.global.edgeSize.small};
  padding-bottom: ${({ seamless, theme }) => seamless ? '10px' : theme.global.edgeSize.small};
  padding-right: ${({ theme, isPrint }) => isPrint ? 0 : theme.global.edgeSize.small};
  padding-left: ${({
    seamless,
    theme,
    isPrint,
    aside,
  }) => {
    if (isPrint && aside) {
      return '20px';
    }
    if (isPrint) {
      return 0;
    }
    return seamless ? 0 : theme.global.edgeSize.small;
  }};
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    padding-top: ${({ theme }) => theme.global.edgeSize.medium};
    padding-bottom: ${({ seamless, theme }) => seamless ? '20px' : theme.global.edgeSize.medium};
    padding-right: ${({ theme, isPrint, aside }) => (isPrint && aside) ? 0 : theme.global.edgeSize.medium};
    padding-left: ${({
    seamless,
    theme,
    isPrint,
    aside,
  }) => {
    if (isPrint && aside) {
      return '20px';
    }
    if (isPrint) {
      return 0;
    }
    return seamless ? 0 : theme.global.edgeSize.medium;
  }};
  }
  @media print {
    padding-top: 15px;
    padding-bottom: 10px;
    padding-right: ${({ aside }) => aside ? 0 : 20}px;
    padding-left: ${({ aside }) => aside ? 20 : 0}px;
    background-color: transparent;
  }
`;

export function FieldGroupWrapper(props) {
  const isPrint = usePrint();
  return <Styled isPrint={isPrint} {...props} />;
}

export default FieldGroupWrapper;
