import styled from 'styled-components';
import { palette } from 'styled-theme';

const ErrorWrapper = styled.div`
  color: ${palette('error', 0)};
  font-size: ${(props) => props.theme.text.xsmall.size};
  @media print {
    font-size: ${(props) => props.theme.sizes.print.small};
  }
`;
export default ErrorWrapper;
