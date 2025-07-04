import styled from 'styled-components';
import { palette } from 'styled-theme';

export default styled.div`
  min-height: ${(props) => (props.taxonomies || props.hasButtons) ? 0 : props.theme.sizes.aside.header.height}px;
  padding: ${({ hasFilterOptions }) => hasFilterOptions ? '1em 12px 0' : '1em 12px'};
  background-color: ${palette('asideHeader', 0)};
  box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.2);
  @media (min-width: ${({ theme }) => theme.breakpointsMin.xlarge}) {
    min-height:${(props) => props.taxonomies ? 0 : props.theme.sizes.aside.header.height}px;
    padding: ${({ hasFilterOptions }) => hasFilterOptions ? '1em 16px 0' : '1em 16px'};
  }
`;
