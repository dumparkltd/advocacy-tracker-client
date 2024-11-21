import React from 'react';
import PropTypes from 'prop-types';

import { Box } from 'grommet';

import { isMinSize } from 'utils/responsive';

import MapOption from 'containers/MapContainer/MapInfoOptions/MapOption';

// gap={{ row: 'small', column: 'xsmall' }}
// const actives = supportLevels
//   && supportLevels.filter((level) => level.active);
// console.log(actives)
const ComponentOptions = ({ options, size }) => (
  <Box
    gap={isMinSize(size, 'medium') ? 'medium' : 'none'}
    flex={{ shrink: 0 }}
  >
    {options && (
      <Box
        flex={{ grow: 1 }}
        fill={false}
        alignSelf="start"
      >
        {options.map((option) => (
          <MapOption
            key={option.id}
            option={option}
          />
        ))}
      </Box>
    )}
  </Box>
);

ComponentOptions.propTypes = {
  options: PropTypes.array,
  size: PropTypes.string,
};
export default ComponentOptions;
