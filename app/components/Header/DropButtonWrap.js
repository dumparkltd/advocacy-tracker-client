import styled from 'styled-components';

const DropButtonWrap = styled.div`
  z-index: 111;
  text-align: center;
  padding: 10px 0 0;
  position: ${({ inDrop }) => inDrop ? 'fixed' : 'relative'};
  top:  ${({ inDrop }) => inDrop ? '5px' : 'auto'};
  right:  ${({ inDrop }) => inDrop ? '5px' : 'auto'};
  height: ${({ theme }) => theme.sizes.header.banner.heightMobileTop}px;
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
    height: ${({ theme, menuType }) => menuType === 'add'
    ? theme.sizes.header.banner.height - 2
    : theme.sizes.header.banner.height
}px;
    width: ${({ theme }) => theme.sizes.header.banner.height - 2}px;
  }
  @media (min-width: ${({ theme }) => theme.breakpointsMin.large}) {
    width: ${({ theme }) => theme.sizes.header.banner.height}px;
  }
`;
export default DropButtonWrap;
