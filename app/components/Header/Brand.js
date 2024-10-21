import styled from 'styled-components';

export default styled.a`
  text-decoration: none;
  text-transform: uppercase;
  color: white;
  z-index: 110;

  &:hover {
    color: white;
    opacity: ${({ isPrint }) => isPrint ? 1 : 0.9};
  }


  height: ${({ theme }) => theme.sizes.header.banner.heightMobile}px;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    height: ${({ theme }) => theme.sizes.header.banner.height}px;
    font-size: 20px;
  }
  @media print {
    color: ${({ theme }) => theme.global.colors.text.brand} !important;
  }
`;
