import React from 'react';
import styled from 'styled-components';

const StyledInput = styled.input`
  accent-color: ${({ theme }) => theme.global.colors.highlight};
  transform: scale(1.1);
  cursor: pointer;
`;

const Checkbox = React.forwardRef((props, ref) => (
  <StyledInput ref={ref} type="checkbox" {...props} />
));

export default Checkbox;
