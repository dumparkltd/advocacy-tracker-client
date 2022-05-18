import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
// import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { scaleColorCount } from '../utils';
// import { formatNumber } from 'utils/numbers';

const Styled = styled.div`
  margin-right: 0px;
  margin-left: 0px;
`;
const BinWrap = styled.div`
  position: relative;
  height: 20px;
  width: 100%;
`;
const KeyBin = styled.div`
  position: absolute;
  height: 20px;
  width: ${({ binWidth }) => binWidth}%;
  left: ${({ offsetPerc }) => offsetPerc}%;
  background: ${({ binColor }) => binColor};
  top: 0;
`;

const RangeLabels = styled.div`
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
export function Bins({
  config, // intl, dark,
}) {
  const bins = [];
  /* eslint-disable no-plusplus */
  for (let i = 1; i <= config.maxValue; i++) {
    bins.push(i);
  }
  const binWidth = 100 / bins.length;
  const scale = scaleColorCount(config.maxValue, config.stops);
  return (
    <Styled>
      <BinWrap>
        {bins && bins.map((bin) => {
          const offsetPerc = (bin - 1) * binWidth;
          return (
            <KeyBin
              key={bin}
              offsetPerc={offsetPerc}
              binWidth={binWidth}
              binColor={scale(bin)}
            />
          );
        })}
      </BinWrap>
      <RangeLabels>
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
      </RangeLabels>
    </Styled>
  );
}
// {simple && (
// )}

Bins.propTypes = {
  config: PropTypes.object,
  // dark: PropTypes.bool,
  // intl: intlShape.isRequired,
};

export default Bins;
