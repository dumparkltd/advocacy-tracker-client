import styled from 'styled-components';
import { palette } from 'styled-theme';

export default styled.h1`
  margin: 0;
  padding-left: 10px;
  /* text-transform: uppercase; */
  font-family: ${(props) => props.theme.fonts.title};
  font-size: ${(props) => props.theme.sizes.header.text.titleMobile};
  line-height: ${(props) => props.theme.sizes.header.banner.heightMobile}px;
  float: left;
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    padding: 4px 0 0 0;
    font-size: ${(props) => props.theme.sizes.header.text.title};
    line-height: ${(props) => props.theme.sizes.header.text.title};
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.header.print.title};
    color: ${palette('primary', 0)};
  }
`;
