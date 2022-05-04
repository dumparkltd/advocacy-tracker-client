import styled from 'styled-components';
import { palette } from 'styled-theme';

export default styled.div`
  min-height: ${(props) => (props.taxonomies || props.hasButtons) ? 0 : props.theme.sizes.aside.header.height}px;
  background-repeat: repeat;
  padding: 1em 12px;
  background-color: ${palette('asideHeader', 0)};

  @media (min-width: ${(props) => props.theme.breakpoints.xlarge}) {
    min-height:${(props) => props.taxonomies ? 0 : props.theme.sizes.aside.header.height}px;
    padding: 1em 16px;
`;
