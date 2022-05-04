import styled from 'styled-components';
import { palette } from 'styled-theme';

const DateValue = styled.div`
  color: ${palette('text', 0)};
  font-weight: bold;
  font-size: 1.2em;
  color: ${({ theme }) => theme.global.colors.brand};
  @media print {
    font-size: ${(props) => props.theme.sizes.print.large};
  }
`;


export default DateValue;
