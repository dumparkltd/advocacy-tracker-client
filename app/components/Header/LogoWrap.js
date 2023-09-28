import styled from 'styled-components';

const LogoWrap = styled.div`
  float:left;
  background: white;
  color: black;
  margin-left: ${(props) => props.theme.sizes.header.paddingLeft.mobile || 6}px;
  box-shadow: rgb(0 0 0 / 20%) 0px 2px 4px;
  height: 67px;
  width: 60px;
  @media print {
    padding-left: 0;
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    margin-left: ${({ theme }) => theme.sizes.header.paddingLeft.small || 12}px;
    height:  ${({ isPrint }) => isPrint ? '72;' : '81px;'}
    width:  ${({ isPrint }) => isPrint ? '62' : '72px;'}
  }
  @media (min-width: ${(props) => props.theme.breakpoints.xlarge}) {
    margin-left: ${(props) => props.theme.sizes.header.paddingLeft.large || 20}px;
  }
`;

export default LogoWrap;
