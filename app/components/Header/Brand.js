import styled from 'styled-components';

export default styled.a`
  text-decoration: none;
  text-transform: uppercase;
  color: white;

  &:hover {
    color: white;
    opacity: ${({ isPrint }) => isPrint ? 1 : 0.9};
  }
  @media print {
    color: ${({ theme }) => theme.global.colors.text.brand} !important;
  }

  z-index: 110;

  height: ${({ theme }) => theme.sizes.header.banner.heightMobile}px;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    height: ${({ theme }) => theme.sizes.header.banner.height}px;
    font-size: 20px;
  }
`;
