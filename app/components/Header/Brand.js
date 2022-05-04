import styled from 'styled-components';

export default styled.a`
  text-decoration: none;
  color: white;

  &:hover {
    color: white;
    opacity: 0.9;
  }

  z-index: 110;
  overflow: hidden;

  height: ${(props) => props.theme.sizes.header.banner.heightMobile}px;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    height: ${(props) => props.theme.sizes.header.banner.height}px;
  }
`;
