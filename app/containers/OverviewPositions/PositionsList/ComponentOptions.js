import React from 'react';
import PropTypes from 'prop-types';

import { Box } from 'grommet';

import MapOption from 'containers/MapContainer/MapInfoOptions/MapOption';

// gap={{ row: 'small', column: 'xsmall' }}
// const actives = supportLevels
//   && supportLevels.filter((level) => level.active);
// console.log(actives)
const ComponentOptions = ({ options }) => (
  <Box gap="medium">
    {options && (
      <Box
        flex={{ grow: 0 }}
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
};
export default ComponentOptions;
