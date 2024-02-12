import React from 'react';
import styled, { css } from 'styled-components';
import { Box } from 'grommet';

import { usePrint } from 'containers/App/PrintContext';

const complexMixin = css`
  padding-left: 0 !important;
  padding-right: 0 !important;
`;

const Styled = styled((p) => <Box {...p} />)`
  ${({ isPrint, printHide, printOnly }) => {
    if (isPrint) {
      if (printHide) return 'display: none !important;';
      if (printOnly) return 'display: flex !important;';
    }
    if (printOnly) return 'display: none !important;';
    return 'display: flex;';
  }}
  ${({ isPrint, padPrintHorizontal }) => isPrint
        && padPrintHorizontal === 'none'
        && complexMixin
}
  @media print {
    ${({ printHide }) => printHide && 'display: none !important;'}
    ${({ padPrintHorizontal }) => padPrintHorizontal === 'none' && complexMixin}
  }
`;

export function BoxPrint(props) {
  const isPrint = usePrint();
  return <Styled isPrint={isPrint} {...props} />;
}


export default BoxPrint;
