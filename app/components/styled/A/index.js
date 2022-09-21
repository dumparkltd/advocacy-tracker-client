/**
 * A link to a certain page, an anchor tag
 */

import styled from 'styled-components';
import { palette } from 'styled-theme';

const A = styled.a`
  color: ${({ isOnLightBackground }) => isOnLightBackground ? palette('link', 1) : palette('link', 0)};
  font-weight: ${({ weight }) => weight || 'normal'};
  text-decoration: ${({ underline }) => underline ? 'underline' : 'none'};
  &:hover {
    color: ${({ isOnLightBackground }) => isOnLightBackground ? palette('linkHover', 1) : palette('linkHover', 0)};
  }
`;

export default A;
