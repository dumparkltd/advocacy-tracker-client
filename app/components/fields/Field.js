import styled from 'styled-components';
import React from 'react';
import { usePrint } from 'containers/App/PrintContext';

const Styled = styled.div`
  display: ${({ nested, printHide, isPrint }) => {
    if (isPrint && printHide) return 'none';
    return nested ? 'inline-block' : 'block';
  }};
  padding-bottom: ${({
    nested,
    noPadding,
    labelledGroup,
    isPrint,
  }) => {
    if (nested || noPadding || isPrint) {
      return 0;
    }
    if (labelledGroup) {
      return 7;
    }
    return 15;
  }}px;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    padding-bottom: ${({
    nested,
    noPadding,
    labelledGroup,
    isPrint,
  }) => {
    if (nested || noPadding || isPrint) {
      return 0;
    }
    if (labelledGroup) {
      return 15;
    }
    return 30;
  }}px;
  }
  @media print {
    display: ${({ nested, printHide }) => {
    if (printHide) return 'none !important';
    return nested ? 'inline-block' : 'block';
  }};
  }
`;
export function Field(props) {
  const isPrint = usePrint();
  return <Styled isPrint={isPrint} {...props} />;
}

export default Field;
