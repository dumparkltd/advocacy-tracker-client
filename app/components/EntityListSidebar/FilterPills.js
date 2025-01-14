import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Box, Text } from 'grommet';


import Button from 'components/buttons/ButtonSimple';
import Dot from 'components/styled/Dot';

const TagButton = styled((p) => <Button {...p} />)`
  color: ${({ selected }) => selected ? 'white' : 'black'};
  background: ${({ selected }) => selected ? palette('primary', 1) : 'white'};
  border: 1px solid ${({ selected }) => selected ? palette('primary', 1) : palette('light', 4)};
  border-radius: 9999px;
  padding: 3px 8px 3px 5px;
  margin-bottom: 4px;
  margin-right: 4px;
  &:last-child {
    margin-right: 0;
  }
  &:hover {
    border: 1px solid ${({ selected }) => selected ? palette('primary', 0) : palette('dark', 3)};
  }
`;

const FilterPills = ({
  options,
}) => (
  <Box
    wrap
    direction="row"
    alignSelf="start"
    style={{ position: 'relative' }}
  >
    {options && options.map((tag) => (
      <TagButton
        key={tag.value}
        selected={tag.checked}
        onClick={() => tag.onClick ? tag.onClick() : null}
      >
        <Box direction="row" align="center" gap="xsmall">
          {tag.color && (
            <Dot size="11px" color={tag.color} />
          )}
          <Text size="xxxsmall">
            {tag.label}
          </Text>
        </Box>
      </TagButton>
    ))}
  </Box>
);

FilterPills.propTypes = {
  options: PropTypes.array,
};
export default FilterPills;
