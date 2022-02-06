import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';

const Styled = styled.span`
  text-transform: uppercase;
  color: ${palette('text', 1)};
  font-weight: bold;
  font-size: 0.85em;
  letter-spacing: 0.5px;
  display: inline-block;
  @media print {
    font-size: ${(props) => props.theme.sizes.print.smaller};
  }
`;

class SupTitle extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { title } = this.props;

    return (
      <Styled>{ title }</Styled>
    );
  }
}

SupTitle.propTypes = {
  title: PropTypes.string.isRequired,
};

export default SupTitle;
