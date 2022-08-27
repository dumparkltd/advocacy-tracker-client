import React from 'react';
import PropTypes from 'prop-types';
import { MAP_OPTIONS } from 'themes/config';
import { Box } from 'grommet';
import Gradient from './Gradient';
import Bins from './Bins';
import Categories from './Categories';
import Circles from './Circles';

export function MapKey({
  mapSubject,
  maxValue,
  minValue,
  maxBinValue = 0,
  isIndicator,
  unit,
  type = 'gradient',
  circleLayerConfig,
  config,
}) {
  const stops = maxValue && mapSubject && MAP_OPTIONS.GRADIENT[mapSubject];
  const noStops = stops && stops.length;
  const maxFactor = stops && maxValue && maxValue / (noStops - 1);
  const minVal = minValue || (isIndicator ? 0 : 1);
  return (
    <Box margin={{ horizontal: 'xsmall' }}>
      {type === 'gradient' && !!maxValue && maxValue > maxBinValue && (
        <Gradient
          unit={unit}
          isCount={!isIndicator}
          config={{
            range: [minVal, maxValue],
            stops: stops.map((color, i) => ({
              value: i * maxFactor,
              color,
            })),
          }}
        />
      )}
      {type === 'gradient' && !!maxValue && maxValue <= maxBinValue && maxValue > 0 && (
        <Bins config={{ range: [1, maxValue], maxValue, stops }} />
      )}
      {type === 'categories' && config.categories && config.categories.length > 1 && (
        <Categories config={config} />
      )}
      {type === 'circles' && (
        <Circles
          range={{
            min: minVal,
            max: maxValue,
          }}
          config={{
            ...circleLayerConfig,
            values: [maxValue / 2],
          }}
        />
      )}
    </Box>
  );
}

MapKey.propTypes = {
  mapSubject: PropTypes.string,
  unit: PropTypes.string,
  type: PropTypes.string,
  maxValue: PropTypes.number,
  minValue: PropTypes.number,
  maxBinValue: PropTypes.number,
  isIndicator: PropTypes.bool,
  config: PropTypes.object,
  circleLayerConfig: PropTypes.object,
};

export default MapKey;
