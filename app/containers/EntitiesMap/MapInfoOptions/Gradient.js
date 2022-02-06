import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
// import { FormattedMessage, intlShape, injectIntl } from 'react-intl';

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
export function Gradient({
  config, // intl, dark,
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
            {config.range[0]}
          </KeyLabel>
        </KeyLabelWrap>
        <KeyLabelWrap offsetLeft="100%">
          <KeyLabel>
            {config.range[1]}
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
  // dark: PropTypes.bool,
  // intl: intlShape.isRequired,
};

export default Gradient;
