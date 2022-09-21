/*
 *
 * TagList
 *
 */
import React from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
import { palette } from 'styled-theme';
import { groupBy } from 'lodash/collection';
import { Box } from 'grommet';

import GroupFilters from './GroupFilters';

const Styled = styled((p) => (
  <Box
    direction="row"
    align="start"
    justify="start"
    {...p}
  />
))``;

const Tags = styled((p) => <Box direction="row" {...p} />)``;

const ConnectionGroupLabel = styled.span`
  color: ${palette('text', 1)};
  font-size: ${(props) => props.theme.sizes && props.theme.sizes.text.smaller};
  padding-top: 2px;
  white-space: nowrap;
  @media print {
    font-size: ${(props) => props.theme.sizes.print.smaller};
  }
`;

function TagList({
  filters,
  long,
  onClear,
  groupDropdownThreshold = 2,
}) {
  const hasFilters = filters.length > 0;
  const groupedFilters = groupBy(filters, 'group');
  return (
    <Styled hidePrint={!hasFilters}>
      {hasFilters && (
        <Tags gap="xsmall" align="end">
          {Object.keys(groupedFilters).map((group, i) => (
            <Box key={i} flex={{ shrink: 0 }}>
              <ConnectionGroupLabel>
                {group}
              </ConnectionGroupLabel>
              <GroupFilters
                group={group}
                lastGroup={Object.keys(groupedFilters).length === i + 1}
                long={long}
                groupDropdownThreshold={groupDropdownThreshold}
                groupFilters={groupedFilters[group]}
                onClear={onClear}
                hasMultiple={filters.length > 1}
              />
            </Box>
          ))}
        </Tags>
      )}
    </Styled>
  );
}

TagList.propTypes = {
  filters: PropTypes.array,
  onClear: PropTypes.func,
  long: PropTypes.bool,
  groupDropdownThreshold: PropTypes.number,
};

export default TagList;
