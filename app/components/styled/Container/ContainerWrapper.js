import styled from 'styled-components';

const ContainerWrapper = styled.div`
  position: ${({ isStatic }) => isStatic ? 'static' : 'absolute'};
  top: ${({ hasHeader, theme }) => hasHeader ? theme.sizes.headerList.banner.height : 0}px;
  bottom: 0;
  left: 0;
  right: 0;
  overflow-x: hidden;
  overflow-y: ${({ noOverflow }) => noOverflow ? 'hidden' : 'auto'};
  @media print {
    position: static;
  }
  z-index: 90;
`;
export default ContainerWrapper;
