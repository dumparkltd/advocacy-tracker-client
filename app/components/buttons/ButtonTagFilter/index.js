import styled from 'styled-components';
import { palette } from 'styled-theme';

import Button from '../Button';

const ButtonTagFilter = styled(Button)`
  color: ${({ theme, isPrint }) => isPrint ? theme.global.colors.text.brand : theme.global.colors.text.dark};
  fill: ${({ theme }) => theme.global.colors.text.dark};
  stroke: ${({ theme }) => theme.global.colors.text.dark};
  background-color: ${({ isPrint, theme }) => isPrint ? 'white' : theme.global.colors.highlight};
  padding:${({ isPrint }) => isPrint ? ' 1px 4px' : '1px 6px'};
  margin-right: 2px;
  border-radius: 3px;
  border: ${({ isPrint, theme }) => isPrint ? `1px solid ${theme.global.colors.text.brand}` : 'none'};
  font-size:${({ isPrint }) => isPrint ? '9pt' : '0.85em'};
  box-shadow:  ${({ isPrint }) => isPrint ? 'none' : '0px 0px 3px 0px rgba(0,0,0,0.3)'};
  white-space: nowrap;
  min-height: 25px;
  &:hover {
    color: ${({ theme, isPrint }) => isPrint ? theme.global.colors.text.brand : theme.global.colors.text.dark};
    stroke: ${({ theme }) => theme.global.colors.text.dark};
    fill: ${({ theme }) => theme.global.colors.text.dark};
    background-color: ${({ theme, isPrint }) => isPrint ? 'transparent' : theme.global.colors.highlightHover};
  }
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding:${({ isPrint }) => isPrint ? ' 1px 4px' : '1px 6px'};
    font-size:${({ isPrint }) => isPrint ? '9pt' : '0.85em'};
  }
  @media print {
    &:hover {
      color: ${palette('text', 1)};
      background: transparent;
    }
  }
`;

export default ButtonTagFilter;
