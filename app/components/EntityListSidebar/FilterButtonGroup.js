import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Box, Text } from 'grommet';


import Button from 'components/buttons/ButtonSimple';
import Dot from 'components/styled/Dot';

const TagButton = styled((p) => <Button {...p} />)`
  position: relative;
  z-index: ${({ selected }) => selected ? 1 : 0};
  color: ${({ selected }) => selected ? 'white' : 'black'};
  background: ${({ selected }) => selected ? palette('primary', 1) : 'white'};
  border-top: 1px solid ${({ selected }) => selected ? palette('primary', 1) : palette('light', 4)};
  border-bottom: 1px solid ${({ selected }) => selected ? palette('primary', 1) : palette('light', 4)};
  border-right: 1px solid ${({ selected }) => selected ? 'transparent' : palette('light', 4)};
  border-left: 1px solid ${({ selected }) => selected ? 'transparent' : palette('light', 4)};
  border-top-left-radius: ${({ first }) => first ? 9999 : 0}px;
  border-bottom-left-radius: ${({ first }) => first ? 9999 : 0}px;
  border-top-right-radius: ${({ last }) => last ? 9999 : 0}px;
  border-bottom-right-radius: ${({ last }) => last ? 9999 : 0}px;
  padding-left: ${({ first }) => first ? 16 : 12}px;
  padding-right: ${({ last }) => last ? 16 : 12}px;
  padding-top: 2px;
  padding-bottom: 5px;
  margin-right: -1px;
  &:hover {
    border: 1px solid ${({ selected }) => selected ? palette('primary', 0) : palette('dark', 3)};
    z-index: 2;
  }
`;

const FilterButtonGroup = ({
  options,
  onClick,
  showCount,
}) => (
  <Box
    direction="row"
    alignSelf="start"
    style={{ position: 'relative' }}
  >
    {options && options.map((tag, i) => (
      <TagButton
        key={tag.value}
        first={i === 0}
        last={i === options.length - 1}
        selected={tag.checked}
        onClick={() => {
          if (tag.onClick) {
            tag.onClick();
          } else if (onClick) {
            onClick({
              value: tag.value,
              query: tag.query,
              checked: !tag.checked,
            });
          }
        }}
      >
        <Text size="xxsmall">
          {showCount && tag.count ? `${tag.label} (${tag.count})` : tag.label}
        </Text>
      </TagButton>
    ))}
  </Box>
);

FilterButtonGroup.propTypes = {
  options: PropTypes.array,
  onClick: PropTypes.func,
  showCount: PropTypes.bool,
};
export default FilterButtonGroup;
