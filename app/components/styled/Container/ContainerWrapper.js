import styled from 'styled-components';
import React from 'react';
import { usePrint } from 'containers/App/PrintContext';
const Styled = styled.div`
  position: ${({ isStatic, isPrint }) => (isPrint || isStatic) ? 'static' : 'absolute'};
  top: ${({ isOnMap, theme }) => {
    if (isOnMap) {
      // to fix: add dynamic navSecondary height
      return theme.sizes.navSecondary.heightMobile + 2;
    }
    return 0;
  }}px;
  bottom: ${({ isPrint }) => isPrint ? 'auto' : 0};
  left: 0;
  right: 0;
  overflow-x: hidden;
  overflow-y: ${({ noOverflow }) => noOverflow ? 'hidden' : 'auto'};
  z-index: 90;
  background-color: ${({ bg, isPrint }) => (bg && !isPrint) ? '#f0f0f0' : 'transparent'};
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    top: ${({ isOnMap, theme }) => {
    if (isOnMap) {
      // to fix: add dynamic navSecondary height
      return theme.sizes.navSecondary.height + 2;
    }
    return 0;
  }}px;
  }
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
