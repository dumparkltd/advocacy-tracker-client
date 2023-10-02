import React from 'react';
import styled from 'styled-components';
import { Box } from 'grommet';

import { usePrint } from 'containers/App/PrintContext';

const Styled = styled((p) => (
  <Box
    direction="row"
    gap="small"
    margin={{ vertical: 'small', horizontal: 'medium' }}
    {...p}
  />
))`
  border-bottom: ${({ hasBorder = true }) => hasBorder ? 1 : 0}px solid;
  border-bottom-color: ${({ hasBorder = true, theme }) => hasBorder
    ? theme.global.colors.border.light
    : 'transparent'
};
  margin-left: ${({ isPrint }) => isPrint ? 0 : 'medium'};
`;


export function SubjectButtonGroup(props) {
  const isPrint = usePrint();
  return <Styled isPrint={isPrint} {...props} />;
}

export default SubjectButtonGroup;
