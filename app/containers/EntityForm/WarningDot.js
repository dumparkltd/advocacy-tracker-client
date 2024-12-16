import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';

const Inner = styled.div`
  border-radius: 99999px;
  background-color: ${({ palleteName, paletteIndex }) => palette(palleteName, paletteIndex)};
  width: 14px;
  height: 14px;
  border: 1px solid white;
`;

export function WarningDot({ type }) {
  // console.log('isNewEntityView', isNewEntityView)
  // // console.log('formData', formData && formData.toJS())
  let palleteName;
  let paletteIndex;
  if (type === 'error') {
    palleteName = 'error';
    paletteIndex = 2;
  }
  if (type === 'required') {
    palleteName = 'alert';
    paletteIndex = 0;
  }
  if (type === 'autofill') {
    palleteName = 'alert';
    paletteIndex = 3;
  }
  return (
    <Inner palleteName={palleteName} paletteIndex={paletteIndex} />
  );
}

WarningDot.propTypes = {
  type: PropTypes.string,
};

export default WarningDot;
