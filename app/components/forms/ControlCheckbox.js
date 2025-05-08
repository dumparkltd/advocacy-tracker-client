import { Control } from 'react-redux-form/immutable';
import styled from 'styled-components';

const ControlCheckbox = styled(Control.checkbox)`
  margin-right: 8px;
  accent-color: ${({ theme }) => theme.global.colors.highlight};
  transform: scale(1.3);
  cursor: pointer;
`;

export default ControlCheckbox;
