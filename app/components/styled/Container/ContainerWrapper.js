import styled from 'styled-components';
import React from 'react';
import { usePrint } from 'containers/App/PrintContext';
const Styled = styled.div`
  position: ${({
    isStatic, isPrint, headerStyle, isOnMap,
  }) => {
    if (isPrint || isStatic) {
      return 'static';
    }
    if (headerStyle === 'types' && !isOnMap) {
      return 'relative';
    }
    return 'absolute';
  }};
  top: ${({ headerStyle, isOnMap, theme }) => {
    if (headerStyle === 'types' && isOnMap) {
      return theme.sizes.headerList.banner.height;
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
