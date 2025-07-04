import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import Icon from 'components/Icon';
import Button from 'components/buttons/Button';

const Styled = styled(Button)`
  padding: 0;
  color: ${palette('link', 3)};
  &:hover {
    color: ${palette('linkHover', 3)};
  }
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding: 0;
    font-size: ${(props) => props.small ? 0.9 : 1}em;
  }
`;

const Close = (props) => (
  <Styled onClick={props.onCancel}>
    <Icon name="close" sizes={{ mobile: '2em' }} />
  </Styled>
);

Close.propTypes = {
  onCancel: PropTypes.func.isRequired,
};

export default Close;
