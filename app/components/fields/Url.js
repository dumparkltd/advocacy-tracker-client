import styled from 'styled-components';
import { palette } from 'styled-theme';

import A from 'components/styled/A';

const Url = styled(A)`
  color: ${palette('link', 2)};
  font-weight: bold;
  font-size: 0.85em;
  color: ${({ theme }) => theme.global.colors.brand};
  @media print {
    font-size: ${(props) => props.theme.sizes.print.smaller};
  }
  &:hover {
    color: ${({ theme }) => theme.global.colors.highlight};
  }
`;

export default Url;
