/*
 *
 * TagList
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';

import styled from 'styled-components';
import { palette } from 'styled-theme';
import { groupBy } from 'lodash/collection';
import { Box } from 'grommet';
import { FormClose } from 'grommet-icons';

import Button from 'components/buttons/Button';
import ButtonTagFilterWrap from 'components/buttons/ButtonTagFilterWrap';
import { getFilterLabel } from './utils';

const Styled = styled((p) => (
  <Box
    direction="row"
    align="start"
    justify="start"
    {...p}
  />
))``;

const Tags = styled((p) => <Box direction="row" {...p} />)``;

const Clear = styled(Button)`
  background-color: ${palette('background', 4)};
  padding: 0;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    padding: 0;
  }
  @media print {
    display: none;
  }
`;

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
  intl,
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
              <Box direction="row" overflow="hidden" flex={{ shrink: 0 }}>
                {groupedFilters[group].map((filter, j) => (
                  <Box key={j} direction="row" align="center" flex={{ shrink: 0 }}>
                    <ButtonTagFilterWrap
                      filter={filter}
                      label={getFilterLabel(filter, intl, long)}
                      labelLong={getFilterLabel(filter, intl, true)}
                      long={long}
                    />
                    {filters.length > 1 && groupedFilters[group].length === (j + 1)
                      && Object.keys(groupedFilters).length === i + 1
                      && (
                        <Box>
                          <Clear onClick={onClear}><FormClose size="small" /></Clear>
                        </Box>
                      )
                    }
                  </Box>
                ))}
              </Box>
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
  intl: intlShape,
};

export default injectIntl(TagList);
