import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import Button from 'components/buttons/ButtonSimple';

const StyledButton = styled((p) => <Button {...p} />)`
  width: 100%;
  line-height: 1.3;
  font-size: ${({ theme }) => theme.text.xsmall.size};
  padding: 10px 20px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    border-bottom: 1px solid ${palette('light', 1)};
    font-size: ${({ theme }) => theme.text.small.size};
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.print.default};
  }
`;

const Label = styled.div``;

// <Label bold={props.bold} italic={props.isNew}>
function Option({ option, onSelect }) {
  return (
    <StyledButton onClick={() => onSelect(option)}>
      <Label>
        {option.title}
      </Label>
    </StyledButton>
  );
}

Option.propTypes = {
  option: PropTypes.object,
  onSelect: PropTypes.func,
};

export default Option;
