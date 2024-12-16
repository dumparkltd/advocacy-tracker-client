/**
 * A button
 */

import styled from 'styled-components';
import Button from '../Button';

const ButtonTableCell = styled(Button)`
  padding: 0;
  text-align: left;
  color: black;
  &:hover {
    color: ${({ theme }) => theme.global.colors.highlight};
  }
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding: 0;
  }
`;

export default ButtonTableCell;
