import styled from 'styled-components';

import NormalImg from 'components/Img';

const Logo = styled(NormalImg)`
  float:left;
  padding-left: ${({ theme, isPrint }) => isPrint ? 0 : (theme.sizes.header.paddingLeft.mobile || 6)}px;
  height: ${({ theme }) => theme.sizes.header.banner.heightMobile}px;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    padding-left: ${({ theme, isPrint }) => isPrint ? 0 : (theme.sizes.header.paddingLeft.small || 12)}px;
    height: ${({ theme }) => theme.sizes.header.banner.height}px;
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.xlarge}) {
    padding-left: ${({ theme, isPrint }) => isPrint ? 0 : (theme.sizes.header.paddingLeft.large || 20)}px;
  }
  @media print {
    padding-left: 0;
  }
`;

export default Logo;
