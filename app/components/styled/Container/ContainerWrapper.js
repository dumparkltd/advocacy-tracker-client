import styled from 'styled-components';
import React from 'react';
import { usePrint } from 'containers/App/PrintContext';
const Styled = styled.div`
  position: ${({ isStatic, isPrint }) => (isPrint || isStatic) ? 'static' : 'absolute'};
  top: ${({ headerStyle, theme }) => {
    if (headerStyle === 'types') {
      // to fix: add dynamic headerexplore height
      return theme.sizes.headerList.banner.height + 60;
    }
    if (headerStyle === 'simple') {
      return 40;
    }
    return 0;
  }}px;
  bottom: ${({ isPrint }) => isPrint ? 'auto' : 0};
  left: 0;
  right: 0;
  overflow-x: hidden;
  overflow-y: ${({ noOverflow }) => noOverflow ? 'hidden' : 'auto'};
  z-index: 90;
  background-color: ${({ bg, isPrint }) => (bg && !isPrint) ? '#f1f0f1' : 'transparent'};
  @media print {
    box-shadow: none;
    position: ${({ printAbsolute }) => printAbsolute ? 'absolute' : 'static'};
    background-color: transparent;
    padding: 0;
  }
`;

const ContainerWrapper = React.forwardRef((props, ref) => {
  const isPrint = usePrint();
  return <Styled ref={ref} isPrint={isPrint} {...props} />;
});

export default ContainerWrapper;
