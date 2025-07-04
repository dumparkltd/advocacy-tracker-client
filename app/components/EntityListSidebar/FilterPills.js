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
  padding: ${({ primary, hasDot }) => {
    if (hasDot) {
      return primary ? '4px 10px 4px 7px' : '3px 8px 3px 5px';
    }
    return primary ? '4px 10px' : '3px 8px';
  }};
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
  onClick,
  primary,
  showCount,
}) => (
  <Box
    wrap
    direction="row"
    alignSelf="start"
    style={{ position: 'relative' }}
  >
    {options && options.map((tag, i) => {
      let label = tag.label;
      if (showCount && tag.count) {
        label = `${label} (${tag.count})`;
      }
      return (
        <TagButton
          key={tag.value}
          selected={tag.checked}
          primary={primary}
          hasDot={!!tag.color}
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
          <Box direction="row" align="center" gap="xsmall">
            {tag.color && (
              <Dot size="11px" color={tag.color} />
            )}
            <Text size={primary ? 'xsmall' : 'xxxsmall'}>{label}</Text>
          </Box>
        </TagButton>
      );
    })}
  </Box>
);

FilterPills.propTypes = {
  options: PropTypes.array,
  onClick: PropTypes.func,
  primary: PropTypes.bool,
  showCount: PropTypes.bool,
};
export default FilterPills;
