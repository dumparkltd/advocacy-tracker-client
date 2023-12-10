import styled from 'styled-components';
import { palette } from 'styled-theme';

import ButtonTagFilter from '../ButtonTagFilter';

const ButtonTagFilterInverse = styled(ButtonTagFilter)`
  stroke: ${({ theme }) => theme.global.colors.text.light};
  color: ${({ theme, isPrint }) => isPrint ? theme.global.colors.text.brand : theme.global.colors.text.light};
  fill: ${({ theme }) => theme.global.colors.text.light};
  stroke: ${({ theme }) => theme.global.colors.text.light};
  background-color: ${({ isPrint, theme }) => isPrint ? 'white' : theme.global.colors.light};
  border-radius: 3px;
  border: ${({ isPrint, theme }) => isPrint ? `1px solid ${theme.global.colors.text.brand}` : 'none'};
  font-size:${({ isPrint }) => isPrint ? '9pt' : '0.85em'};
  background-color: ${({ theme }) => theme.global.colors.white};
  padding:${({ isPrint }) => isPrint ? ' 1px 4px' : '2px 6px'};
  white-space: nowrap;
  &:hover {
    color: ${({ theme }) => theme.global.colors.highlight};
    stroke: ${({ theme }) => theme.global.colors.highlight};
    fill: ${({ theme }) => theme.global.colors.highlight};
    background-color: ${({ theme }) => theme.global.colors.white};
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    padding:${({ isPrint }) => isPrint ? ' 1px 4px' : '3px 6px'};
    font-size:${({ isPrint }) => isPrint ? '9pt' : '0.85em'};
  }
  @media print {
    &:hover {
      color: ${palette('text', 1)};
      background: transparent;
    }
  }
`;

export default ButtonTagFilterInverse;
