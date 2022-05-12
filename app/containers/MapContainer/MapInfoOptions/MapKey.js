import React from 'react';
import PropTypes from 'prop-types';
import { MAP_OPTIONS } from 'themes/config';
import { Box } from 'grommet';
import Gradient from './Gradient';
import Bins from './Bins';

export function MapKey({
  mapSubject,
  maxValue,
  maxBinValue = 0,
  isIndicator,
  unit,
}) {
  const stops = maxValue && MAP_OPTIONS.GRADIENT[mapSubject];
  const noStops = maxValue && stops.length;
  const maxFactor = maxValue && maxValue / (noStops - 1);
  const minValue = isIndicator ? 0 : 1;
  return (
    <Box margin={{ horizontal: 'xsmall' }}>
      {!!maxValue && maxValue > maxBinValue && (
        <Gradient
          unit={unit}
          isCount={!isIndicator}
          config={{
            range: [minValue, maxValue],
            stops: stops.map((color, i) => ({
              value: i * maxFactor,
              color,
            })),
          }}
        />
      )}
      {!!maxValue && maxValue <= maxBinValue && maxValue > 0 && (
        <Bins config={{ range: [1, maxValue], maxValue, stops }} />
      )}
    </Box>
  );
}

MapKey.propTypes = {
  mapSubject: PropTypes.string,
  unit: PropTypes.string,
  maxValue: PropTypes.number,
  maxBinValue: PropTypes.number,
  isIndicator: PropTypes.bool,
};

export default MapKey;
