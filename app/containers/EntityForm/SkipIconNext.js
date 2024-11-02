import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Next, Previous } from 'grommet-icons';

const Styled = styled.div`
  border-radius: 99999px;
  background: white;
  border: 1px solid #B7BCBF;
  padding: 10px;
`;

export function SkipIconNext({ reverse }) {
  // console.log('isNewEntityView', isNewEntityView)
  // // console.log('formData', formData && formData.toJS())
  return (
    <Styled>
      {!reverse && <Next style={{ fill: 'inherit', stroke: 'inherit' }} />}
      {reverse && <Previous style={{ fill: 'inherit', stroke: 'inherit' }} />}
    </Styled>
  );
}

SkipIconNext.propTypes = {
  reverse: PropTypes.bool,
};

export default SkipIconNext;
