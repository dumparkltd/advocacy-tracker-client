import styled from 'styled-components';
import { palette } from 'styled-theme';

const Label = styled.label`
  color: ${palette('text', 1)};
  font-size: ${(props) => props.theme.text.xsmall.size};
  position: relative;
  display: ${(props) => props.inline ? 'inline-block' : 'block'};
  @media print {
    font-size: ${(props) => props.theme.sizes.print.small};
  }
`;

export default Label;
