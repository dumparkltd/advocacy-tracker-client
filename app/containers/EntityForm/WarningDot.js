import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';

const Outer = styled.div`
  border-radius: 99999px;
  background: white;
  width: 16px;
  height: 16px;
`;
const Inner = styled.div`
  border-radius: 99999px;
  background-color: ${({ palleteName, paletteIndex }) => palette(palleteName, paletteIndex)};
  width: 12px;
  height: 12px;
  transform: translate(2px, 2px);
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
    paletteIndex = 4;
  }
  return (
    <Outer>
      <Inner palleteName={palleteName} paletteIndex={paletteIndex} />
    </Outer>
  );
}

WarningDot.propTypes = {
  type: PropTypes.string,
};

export default WarningDot;
