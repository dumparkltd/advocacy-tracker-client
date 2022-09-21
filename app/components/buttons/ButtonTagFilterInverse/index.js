import styled from 'styled-components';
import { palette } from 'styled-theme';

import ButtonTagFilter from '../ButtonTagFilter';

const ButtonTagFilterInverse = styled(ButtonTagFilter)`
  color: ${({ theme }) => theme.global.colors.text.light};
  stroke: ${({ theme }) => theme.global.colors.text.light};
  fill: ${({ theme }) => theme.global.colors.text.light};
  background-color: ${({ theme }) => theme.global.colors.white};
  padding: 2px 6px;
  &:hover {
    color: ${({ theme }) => theme.global.colors.highlight};
    stroke: ${({ theme }) => theme.global.colors.highlight};
    fill: ${({ theme }) => theme.global.colors.highlight};
    background-color: ${({ theme }) => theme.global.colors.white};
  }
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    padding: 3px 6px;
    font-size: 0.85em;
  }
  @media print {
    color: ${palette('text', 1)};
    background: transparent;
    border-radius: 3px;
    border-right: 1px solid;
    border-top: 1px solid;
    border-bottom: 1px solid;
    border-left: 7px solid;
    border-color: ${({ theme }) => theme.global.colors.text.brand};
    padding: 0 4px;
    font-size: ${(props) => props.theme.sizes.print.smallest};
    line-height: 10pt;
  }
`;

export default ButtonTagFilterInverse;
