import styled from 'styled-components';

const Label = styled.div`
  color: ${({ theme }) => theme.global.colors.hint};
  font-size: ${(props) => props.theme.text.xxsmall.size};
  line-height: ${(props) => props.theme.text.small.height};
  margin-bottom: 5px;
  position: relative;
  @media print {
    font-size: ${(props) => props.theme.sizes.print.small};
  }
`;

export default Label;
