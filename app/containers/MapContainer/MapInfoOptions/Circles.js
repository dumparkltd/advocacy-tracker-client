import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box } from 'grommet';
import { intlShape, injectIntl } from 'react-intl';

// import { scaleCircle, valueOfCircle } from 'containers/MapContainer/utils';
import { scaleCircle } from 'containers/MapContainer/utils';
import { formatNumber } from 'utils/fields';

import KeyCircle from './KeyCircle';
import KeyLabel from './KeyLabel';

const Styled = styled((p) => (
  <Box direction="row" gap="xsmall" justify="between" {...p} />
))`
  margin-right: 10px;
  margin-left: 10px;
  max-width: 300px;
`;

// const WrapCircle = styled(p => <Box pad="xxsmall" {...p} />)`
//   position: relative;
//   background: white;
//   border-radius: 9999px;
// `;
const WrapCircle = styled((p) => <Box {...p} />)`
  position: relative;
`;
const CircleLabel = styled((p) => <Box direction="row" gap="xsmall" {...p} />)`
  position: relative;
`;

export function Circles({ config, range, intl }) {
  const {
    values,
    render,
    style,
  } = config;
  const maxRadius = parseFloat(render.max);

  return (
    <Styled
      exceeds={range && render && render.min}
      align="end"
    >
      <CircleLabel
        basis="auto"
        align="end"
        justify="start"
      >
        <WrapCircle>
          <KeyCircle
            circleStyle={style}
            radius={
              scaleCircle(range.min, range, render)
            }
          />
        </WrapCircle>
        {range && render && (
          <Box justify="center">
            <KeyLabel>
              {range && formatNumber(
                range.min,
                { intl, digits: 0 },
              )}
            </KeyLabel>
          </Box>
        )}
      </CircleLabel>
      {range && values && values.map((val) => (
        <CircleLabel key={val} basis="auto" align="end">
          <WrapCircle>
            <KeyCircle
              circleStyle={style}
              radius={scaleCircle(val, range, render)}
            />
          </WrapCircle>
          <KeyLabel>
            {formatNumber(val, { intl })}
          </KeyLabel>
        </CircleLabel>
      ))}
      <CircleLabel
        basis="auto"
        align="end"
        justify="start"
      >
        <WrapCircle>
          <KeyCircle relative circleStyle={style} radius={maxRadius} />
        </WrapCircle>
        <KeyLabel>
          {range && formatNumber(range.max, { intl })}
        </KeyLabel>
      </CircleLabel>
    </Styled>
  );
}

Circles.propTypes = {
  range: PropTypes.object,
  config: PropTypes.object,
  intl: intlShape.isRequired,
};

export default injectIntl(Circles);
