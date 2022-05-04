import React from 'react';
import styled from 'styled-components';
import Link from 'containers/Link';

const ListLink = styled((props) => <Link {...props} />)`
  color: ${({ theme }) => theme.global.colors.text.light};
  display: block;
  font-size: ${(props) => props.theme.text.small.size};
  line-height: ${(props) => props.theme.text.small.height};
  &:hover {
    color: ${({ theme }) => theme.global.colors.text.highlight};
  }
`;

export default ListLink;
