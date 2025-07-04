import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text } from 'grommet';

import { isMinSize } from 'utils/responsive';

import CheckboxOption from 'components/CheckboxOption';

const SupportTagsTitle = styled((p) => <Text size="xsmall" {...p} />)`
  color: black;
  font-weight: 600;
`;

// gap={{ row: 'small', column: 'xsmall' }}
// const actives = supportLevels
//   && supportLevels.filter((level) => level.active);
// console.log(actives)
const ComponentOptions = ({ options, size }) => (
  <Box
    gap="xxsmall"
    responsive={false}
    style={{ minWidth: '250px' }}
    flex={{ shrink: 0 }}
  >
    <SupportTagsTitle>
      Statement options
    </SupportTagsTitle>
    <Box
      gap={isMinSize(size, 'medium') ? 'medium' : 'none'}
      flex={{ shrink: 0 }}
    >
      {options && (
        <Box
          flex={{ grow: 1, shrink: 0 }}
          fill={false}
          alignSelf="start"
        >
          {options.map((option) => (
            <CheckboxOption
              key={option.id}
              option={option}
            />
          ))}
        </Box>
      )}
    </Box>
  </Box>
);

ComponentOptions.propTypes = {
  options: PropTypes.array,
  size: PropTypes.string,
};
export default ComponentOptions;
