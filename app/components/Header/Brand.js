import styled from 'styled-components';

export default styled.a`
  text-decoration: none;
  text-transform: uppercase;
  color: white;

  &:hover {
    color: white;
  }

  z-index: 110;

  height: ${(props) => props.theme.sizes.header.banner.heightMobile}px;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    height: ${(props) => props.theme.sizes.header.banner.height}px;
    font-size: 20px;
  }
`;
