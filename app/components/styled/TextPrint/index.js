import React from 'react';
import styled from 'styled-components';
import { Text } from 'grommet';
import { usePrint } from 'containers/App/PrintContext';

const Styled = styled((p) => <Text {...p} />)`
  ${({ isPrint, padPrint }) => isPrint && padPrint && 'padding-right: 5px;'}
  font-size: ${({ isPrint, theme, size = 'medium' }) => isPrint ? theme.textPrint[size].size : theme.text[size].size}};
  line-height: ${({ isPrint, theme, size = 'medium' }) => isPrint ? theme.textPrint[size].height : theme.text[size].height}};
  @media print {
    font-size: ${({ theme, size = 'medium' }) => theme.textPrint[size].size};
    line-height: ${({ theme, size = 'medium' }) => theme.textPrint[size].height};
    ${({ padPrint }) => padPrint && 'padding-right: 5px;'}
  }
`;

export function TextPrint(props) {
  const isPrint = usePrint();
  return <Styled isPrint={isPrint} {...props} />;
}

export default TextPrint;
