import styled from 'styled-components';

const ListLabel = styled.span`
  display: table-cell;
  vertical-align: middle;
  color: ${({ theme }) => theme.global.colors.hint};
  margin: 0;
  font-size: ${(props) => props.theme.text.xxsmall.size};
  line-height: ${(props) => props.theme.text.xxsmall.height};
  @media print {
    font-size: ${(props) => props.theme.sizes.print.small};
  }
`;

export default ListLabel;
