import styled from 'styled-components';

import NormalImg from 'components/Img';

const Logo = styled(NormalImg)`
  float:left;
  padding-left: ${({ theme, isPrint }) => isPrint ? 0 : (theme.sizes.header.paddingLeft.mobile || 6)}px;
  height: ${({ theme }) => theme.sizes.header.banner.heightMobileTop}px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding-left: ${({ theme, isPrint }) => isPrint ? 0 : (theme.sizes.header.paddingLeft.small || 12)}px;
    height: ${({ theme }) => theme.sizes.header.banner.height}px;
  }
  @media (min-width: ${({ theme }) => theme.breakpointsMin.xlarge}) {
    padding-left: ${({ theme, isPrint }) => isPrint ? 0 : (theme.sizes.header.paddingLeft.large || 20)}px;
  }
  @media print {
    padding-left: 0;
  }
`;

export default Logo;
