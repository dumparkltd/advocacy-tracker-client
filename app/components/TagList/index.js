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

import ButtonTagFilterWrap from 'components/buttons//ButtonTagFilterWrap';

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
  font-size: ${({ theme }) => theme.sizes && theme.text.xsmall.sizeer};
  padding-top: 2px;
  white-space: nowrap;
  @media print {
    font-size: ${({ theme }) => theme.sizes.print.smaller};
  }
`;

function TagList({
  filters,
  searchQuery,
  long,
  onClear,
  groupDropdownThreshold = 2,
}) {
  const isPrintView = usePrint();
  const hasFilters = filters.length > 0;
  const groupedFilters = groupBy(filters, 'groupId');
  return (
    <Styled>
      {(hasFilters || (!!searchQuery && isPrintView)) && (
        <Tags gap="xsmall" align="end" isPrint={isPrintView}>
          {hasFilters && Object.keys(groupedFilters).map(
            (groupId, i) => {
              const group = groupedFilters[groupId];
              const groupLabel = group.length > 0 ? group[0].groupLabel : 'something went wrong';
              return (
                <Box key={i} flex={{ shrink: 0 }}>
                  <ConnectionGroupLabel>
                    {groupLabel}
                  </ConnectionGroupLabel>
                  <GroupFilters
                    lastGroup={Object.keys(groupedFilters).length === i + 1}
                    long={long}
                    groupDropdownThreshold={groupDropdownThreshold}
                    groupFilters={group}
                    onClear={onClear}
                    hasMultiple={filters.length > 1}
                  />
                </Box>
              );
            }
          )}
          {!!searchQuery && isPrintView && (
            <Box flex={{ shrink: 0 }}>
              {hasFilters && (
                <ConnectionGroupLabel>
                  Keyword
                </ConnectionGroupLabel>
              )}
              <Box direction="row" overflow="hidden" flex={{ shrink: 0 }}>
                <Box direction="row" align="center" flex={{ shrink: 0 }}>
                  <ButtonTagFilterWrap
                    label={searchQuery}
                  />
                </Box>
              </Box>
            </Box>
          )}
        </Tags>
      )}
    </Styled>
  );
}

TagList.propTypes = {
  filters: PropTypes.array,
  searchQuery: PropTypes.string,
  onClear: PropTypes.func,
  long: PropTypes.bool,
  groupDropdownThreshold: PropTypes.number,
};

export default TagList;
