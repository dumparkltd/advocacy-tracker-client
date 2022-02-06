import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import Icon from 'components/Icon';
import Button from 'components/buttons/Button';

const Styled = styled(Button)`
  position: absolute;
  right:10px;
  top:10px;
  color: ${palette('link', 2)};
  &:hover {
    color: ${palette('linkHover', 2)};
  }
`;

const ButtonClose = (props) => (
  <Styled onClick={props.onClose}>
    <Icon name="close" size="2.2em" />
  </Styled>
);

ButtonClose.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default ButtonClose;
