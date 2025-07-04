import styled from 'styled-components';
import { palette } from 'styled-theme';

const Sidebar = styled.div`
  position: absolute;
  top:0;
  bottom:0;
  right: 0;
  width: 100%;
  background-color: ${palette('aside', 0)};
  z-index:100;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.2);
    width: ${(props) => props.responsiveSmall
    ? props.theme.sizes.aside.width.small
    : props.theme.sizes.aside.width.large
}px;
    left: auto;
  }
  @media (min-width: ${({ theme }) => theme.breakpointsMin.xlarge}) {
    width: ${(props) => props.theme.sizes.aside.width.large}px;
  }
`;
export default Sidebar;
