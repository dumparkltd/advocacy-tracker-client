import styled from 'styled-components';

import ContainerWrapper from './ContainerWrapper';

const ContainerWithSidebar = styled(ContainerWrapper)`
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    right: ${(props) => {
    if (props.noSidebar) return 0;
    // narrow sidebar
    if (props.sidebarResponsiveSmall) {
      return props.theme.sizes.aside.width.small;
    }
    // standard size
    if (props.sidebarResponsiveLarge) {
      return props.theme.sizes.aside.width.large;
    }
    return 0;
  }}px;
  }
  @media (min-width: ${({ theme }) => theme.breakpointsMin.large}) {
    right: ${(props) => {
    if (props.noSidebar) return 0;
    if (props.sidebarAbsolute) return props.theme.sizes.aside.width.large;
    if (props.sidebarResponsiveSmall) {
      return props.theme.sizes.aside.width.small;
    }
    // standard size
    if (props.sidebarResponsiveLarge) {
      return props.theme.sizes.aside.width.large;
    }
    return 0;
  }}px;
  }
  @media (min-width: ${({ theme }) => theme.breakpointsMin.xlarge}) {
    right: ${(props) => props.noSidebar ? 0 : props.theme.sizes.aside.width.large}px;
  }
`;
export default ContainerWithSidebar;
