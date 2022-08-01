import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

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
  left: ${({ left }) => left ? '0' : 'auto'};
  right: ${({ left }) => left ? 'auto' : '0'};
`;
const KeyLabel = styled.div`
  white-space: nowrap;
  font-size: ${(props) => props.theme.sizes.text.small};
`;
export function Bins({
  config, // intl, dark,
}) {
  const { categories } = config;
  const binWidth = 100 / categories.length;
  return (
    <Styled>
      <BinWrap>
        {categories && categories.map((bin, i) => {
          const offsetPerc = i * binWidth;
          return (
            <KeyBin
              key={bin.value}
              offsetPerc={offsetPerc}
              binWidth={binWidth}
              binColor={bin.color}
            />
          );
        })}
      </BinWrap>
      <RangeLabels>
        <KeyLabelWrap left>
          <KeyLabel>
            {categories[0].label}
          </KeyLabel>
        </KeyLabelWrap>
        <KeyLabelWrap right>
          <KeyLabel>
            {categories[categories.length - 1].label}
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
