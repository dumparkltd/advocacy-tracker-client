import styled from 'styled-components';
import { palette } from 'styled-theme';
import ButtonFlatIconOnly from 'components/buttons/ButtonFlatIconOnly';


const ButtonSort = styled(ButtonFlatIconOnly)`
  padding: 0;
  fill: ${({ sortActive }) => palette('dark', sortActive ? 1 : 4)};
  color: ${({ sortActive }) => palette('dark', sortActive ? 1 : 4)};
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding: 0;
  }
  &:hover {
    fill: ${palette('dark', 1)};
    color: ${palette('dark', 1)};
  }
`;

export default ButtonSort;
