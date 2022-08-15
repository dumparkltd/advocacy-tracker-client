import styled from 'styled-components';
import { palette } from 'styled-theme';

import Button from '../Button';

const ButtonTagFilter = styled(Button)`
  color: ${({ theme }) => theme.global.colors.text.dark};
  stroke: ${({ theme }) => theme.global.colors.text.dark};
  fill: ${({ theme }) => theme.global.colors.text.dark};
  background-color: ${({ theme }) => theme.global.colors.highlight};
  padding: 1px 6px;
  margin-right: 2px;
  border-radius: 3px;
  font-size: 0.85em;
  box-shadow: 0px 0px 3px 0px rgba(0,0,0,0.3);
  &:hover {
    color: ${({ theme }) => theme.global.colors.text.dark};
    stroke: ${({ theme }) => theme.global.colors.text.dark};
    fill: ${({ theme }) => theme.global.colors.text.dark};
    background-color: ${({ theme }) => theme.global.colors.highlightHover};
  }
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    padding: 1px 6px;
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

export default ButtonTagFilter;
