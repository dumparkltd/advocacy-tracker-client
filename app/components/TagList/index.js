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

import { usePrint } from 'containers/App/PrintContext';
import GroupFilters from './GroupFilters';


const Styled = styled((p) => (
  <Box
    direction="row"
    align="start"
    justify="start"
    {...p}
  />
))``;

const Tags = styled((p) => <Box direction="row" {...p} />)`
flex-wrap:${({ isPrint }) => isPrint ? 'wrap' : 'none'};
`;

const ConnectionGroupLabel = styled.span`
  color: ${palette('text', 1)};
  font-size: ${({ theme }) => theme.sizes && theme.sizes.text.smaller};
  padding-top: 2px;
  white-space: nowrap;
  @media print {
    font-size: ${({ theme }) => theme.sizes.print.smaller};
  }
`;

function TagList({
  filters,
  long,
  onClear,
  groupDropdownThreshold = 2,
}) {
  const isPrintView = usePrint();
  const hasFilters = filters.length > 0;
  const groupedFilters = groupBy(filters, 'group');
  return (
    <Styled>
      {hasFilters && (
        <Tags gap="xsmall" align="end" isPrint={isPrintView}>
          {Object.keys(groupedFilters).map((group, i) => (
            <Box key={i} flex={{ shrink: 0 }}>
              <ConnectionGroupLabel>
                {group}
              </ConnectionGroupLabel>
              <GroupFilters
                isPrintView={isPrintView}
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
