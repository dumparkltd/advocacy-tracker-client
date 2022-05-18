import styled from 'styled-components';

const ContainerWrapper = styled.div`
  position: ${({ isStatic }) => isStatic ? 'static' : 'absolute'};
  top: ${({ headerStyle, theme }) => {
    if (headerStyle === 'types') {
      return theme.sizes.headerList.banner.height;
    }
    return 0;
  }}px;
  bottom: 0;
  left: 0;
  right: 0;
  overflow-x: hidden;
  overflow-y: ${({ noOverflow }) => noOverflow ? 'hidden' : 'auto'};
  @media print {
    position: static;
  }
  z-index: 90;
  background-color: ${({ bg, theme }) => bg ? theme.global.colors.background : 'transparent'};
`;
export default ContainerWrapper;
