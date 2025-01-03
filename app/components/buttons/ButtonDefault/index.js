import styled from 'styled-components';
import { palette } from 'styled-theme';

import Button from '../Button';

const getInactiveHoverBackground = (disabled) => disabled
  ? palette('buttonToggleInactive', 1)
  : palette('buttonToggleInactiveHover', 1);

const getActiveHoverBackground = (disabled) => disabled
  ? palette('buttonDefault', 1)
  : palette('buttonDefaultHover', 1);

// eslint-disable no-nested-ternary
// letter-spacing: 1px;
const ButtonDefault = styled(Button)`
  color: ${(props) => props.inactive
    ? palette('buttonToggleInactive', 0)
    : palette('buttonDefault', 0)
};
  background-color: ${(props) => props.inactive
    ? palette('buttonToggleInactive', 1)
    : palette('buttonDefault', 1)
};
  box-shadow: ${(props) => {
    if (props.outline) {
      const color = props.inactive
        ? props.theme.palette.buttonToggleInactive[1]
        : props.theme.palette.buttonDefault[1];
      return `0 0 0 2px ${color}`;
    }
    return 'none';
  }};
  border-radius: 999px;
  border: 1px solid ${({ theme, inactive }) => !inactive ? palette('buttonDefault', 1) : theme.global.colors['light-4']};
  padding: 0.3em 1em;
  cursor: ${(props) => props.disabled ? 'default' : 'pointer'};
  box-shadow: ${(props) => props.flat ? 'none' : '0px 2px 4px 0px rgba(0,0,0,0.1)'};
  &:hover {
    color: ${(props) => props.inactive
    ? palette('buttonToggleInactiveHover', 0)
    : palette('buttonDefaultHover', 0)
};
    background-color: ${(props) => props.inactive
    ? getInactiveHoverBackground(props.disabled)
    : getActiveHoverBackground(props.disabled)
};
    box-shadow: ${(props) => {
    if (props.outline) {
      const color = props.inactive
        ? props.theme.palette.buttonToggleInactiveHover[1]
        : props.theme.palette.buttonDefaultHover[1];
      return `0 0 0 2px ${color}`;
    }
    return props.flat ? 'none' : '0px 2px 4px 0px rgba(0,0,0,0.2)';
  }};
  }
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding: 0.3em 1.2em;
  }
`;

export default ButtonDefault;
