import styled from 'styled-components';

const DropButtonWrap = styled.div`
  z-index: 111;
  text-align: center;
  padding: 5px 0;
  position: ${({ inDrop }) => inDrop ? 'fixed' : 'relative'};
  top:  ${({ inDrop }) => inDrop ? '5px' : 'auto'};
  right:  ${({ inDrop }) => inDrop ? '5px' : 'auto'};
  height: ${({ theme }) => theme.sizes.header.banner.heightMobile}px;
  width: ${({ theme }) => theme.sizes.header.banner.heightMobile - 10}px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding: 0;
    position: ${({ inDrop }) => inDrop ? 'absolute' : 'relative'};
    top:  ${({ inDrop, menuType }) => {
    if (inDrop && menuType === 'add') return '0';
    if (inDrop && menuType !== 'add') return '5px';
    return 'auto';
  }};
    right:  ${({ inDrop, menuType }) => {
    if (inDrop && menuType === 'add') return '0';
    if (inDrop && menuType !== 'add') return '5px';
    return 'auto';
  }};
    height: ${({ theme, inDrop, menuType }) => (menuType !== 'add' && inDrop)
    ? theme.sizes.header.banner.heightMobile
    : theme.sizes.header.banner.height}px;
    width: ${({ theme, inDrop, menuType }) => (menuType !== 'add' && inDrop)
    ? theme.sizes.header.banner.heightMobile
    : theme.sizes.header.banner.height}px;
  }
`;
export default DropButtonWrap;
