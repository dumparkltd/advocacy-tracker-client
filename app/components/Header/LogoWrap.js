import styled from 'styled-components';

const LogoWrap = styled.div`
  float:left;
  background: white;
  color: black;
  margin-left: ${({ theme, isPrint }) => isPrint ? 0 : (theme.sizes.header.paddingLeft.mobile || 6)}px;
  box-shadow:  ${({ isPrint }) => isPrint ? 'none' : 'rgb(0 0 0 / 20%) 0px 2px 4px'};
  height: 55px;
  width: 50px;
  @media print {
    padding-left: 0;
    height: 52px;
    width: 52px;
  }
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    margin-left: ${({ theme, isPrint }) => isPrint ? 0 : (theme.sizes.header.paddingLeft.small || 12)}px;
    height:  ${({ isPrint }) => isPrint ? '52px;' : '81px;'}
    width:  ${({ isPrint }) => isPrint ? '52px' : '72px;'}
  }
  @media (min-width: ${({ theme }) => theme.breakpointsMin.xlarge}) {
    margin-left: ${({ theme, isPrint }) => isPrint ? 0 : (theme.sizes.header.paddingLeft.large || 20)}px;
  }
`;

export default LogoWrap;
