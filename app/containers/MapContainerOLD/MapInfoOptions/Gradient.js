import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
// import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import isNumber from 'utils/is-number';
import { formatNumber } from 'utils/fields';

import KeyGradient from './KeyGradient';

// import { formatNumber } from 'utils/numbers';

const Styled = styled.div`
  margin-right: 0px;
  margin-left: 0px;
`;
const GradientWrap = styled.div`
  position: relative;
  height: 20px;
`;

const GradientLabels = styled.div`
  position: relative;
  color: ${({ dark }) => (dark ? 'white' : 'black')};
  height: ${({ exceeds }) => (exceeds ? 40 : 20)}px;
`;

const KeyLabelWrap = styled.div`
  position: absolute;
  top: 0;
  left: ${({ offsetLeft }) => offsetLeft || '0'};
  transform: translate(-50%, 0);
`;
const KeyLabel = styled.div`
  white-space: nowrap;
  font-size: ${(props) => props.theme.sizes.text.small};
`;
const formatKeyLabel = (value, isCount) => {
  if (isNumber(value)) {
    const vN = parseFloat(value, 10);
    return formatNumber(vN, { digits: isCount ? 0 : 1 });
  }
  return value;
};
export function Gradient({
  config, // intl, dark,
  isCount,
  // unit,
}) {
  // let stops;
  return (
    <Styled>
      <GradientWrap>
        <KeyGradient
          stops={config.stops}
        />
      </GradientWrap>
      <GradientLabels>
        <KeyLabelWrap offsetLeft="0%">
          <KeyLabel>
            {formatKeyLabel(config.range[0], isCount)}
          </KeyLabel>
        </KeyLabelWrap>
        <KeyLabelWrap offsetLeft="100%">
          <KeyLabel>
            {formatKeyLabel(config.range[1], isCount)}
          </KeyLabel>
        </KeyLabelWrap>
      </GradientLabels>
    </Styled>
  );
}
// {simple && (
// )}

Gradient.propTypes = {
  config: PropTypes.object,
  isCount: PropTypes.bool,
  // unit: PropTypes.string,
  // intl: intlShape.isRequired,
};

export default Gradient;
