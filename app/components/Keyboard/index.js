import React from 'react';
import PropTypes from 'prop-types';
import { Keyboard as KeyboardListener } from 'grommet';

import styled from 'styled-components';

const StyledSpan = styled.span``;

const Keyboard = ({ children, spanStyle, ...props }) => (
  <KeyboardListener {...props}>
    <StyledSpan style={spanStyle}>
      {children}
    </StyledSpan>
  </KeyboardListener>
);

Keyboard.propTypes = {
  children: PropTypes.node,
  onBackspace: PropTypes.func,
  onComma: PropTypes.func,
  onDown: PropTypes.func,
  onTab: PropTypes.func,
  onEnter: PropTypes.func,
  onEsc: PropTypes.func,
  onKeyDown: PropTypes.func,
  onLeft: PropTypes.func,
  onRight: PropTypes.func,
  onShift: PropTypes.func,
  onSpace: PropTypes.func,
  onUp: PropTypes.func,
  spanStyle: PropTypes.object,
};

export default Keyboard;
