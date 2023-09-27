import React from 'react';
import styled, { css } from 'styled-components';
import { palette } from 'styled-theme';
import { usePrint } from 'containers/App/PrintContext';

import A from 'components/styled/A';

const Styled = styled(A)`
  color: ${palette('link', 2)};
  font-weight: bold;
  font-size: 0.85em;
  color: ${({ theme }) => theme.global.colors.brand};
  ${({ isPrint }) => isPrint && css`pointer-events: none;`}
  @media print {
    font-size: ${(props) => props.theme.sizes.print.smaller};
  }
  &:hover {
    color: ${({ theme }) => theme.global.colors.highlight};
  }
`;

export function Url(props) {
  const isPrint = usePrint();
  return <Styled isPrint={isPrint} {...props} />;
}

export default Url;
