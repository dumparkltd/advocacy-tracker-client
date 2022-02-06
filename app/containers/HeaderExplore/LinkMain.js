import styled from 'styled-components';
import { palette } from 'styled-theme';

import Link from 'components/Header/Link';

export default styled(Link)`
  display: inline-block;
  vertical-align: top;
  text-align: center;
  color: ${(props) => props.active ? palette('headerNavMainItem', 1) : palette('headerNavMainItem', 0)};
  &:hover {
    color:${palette('headerNavMainItemHover', 0)};
  }
  font-size: 0.8em;
  height: ${(props) => props.theme.sizes.headerExplore.nav.heightMobile - 1}px;
  border-bottom: 4px solid ${(props) => props.active ? palette('headerNavMainItem', 1) : 'transparent'};
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    font-size: 0.9em;
    height: ${(props) => props.theme.sizes.headerExplore.nav.height - 1}px;
  }
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
  }
  @media (min-width: ${(props) => props.theme.breakpoints.large}) {
    font-size: 1em;
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.print.default};
  }
`;
