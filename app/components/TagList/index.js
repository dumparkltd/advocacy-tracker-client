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
// import PrintOnly from 'components/styled/PrintOnly';

// import messages from './messages';

const Styled = styled((p) => <Box direction="row" align="end" justify="end" {...p} />)``;

const Tags = styled((p) => <Box direction="row" {...p} />)``;

const Clear = styled(Button)`
  background-color: ${palette('background', 4)};
  padding: 1px 6px;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    padding: 1px 6px;
  }
  @media print {
    display: none;
  }
`;

// const LabelPrint = styled(PrintOnly)`
//   margin-top: 10px;
//   font-size: ${(props) => props.theme.sizes.print.smaller};
// `;

const ConnectionGroupLabel = styled.span`
  color: ${palette('text', 1)};
  font-size: ${(props) => props.theme.sizes && props.theme.sizes.text.smaller};
  padding-top: 2px;
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
        <Tags gap="xsmall">
          {Object.keys(groupedFilters).map((group, i) => (
            <Box key={i}>
              <ConnectionGroupLabel>
                {group}
              </ConnectionGroupLabel>
              <Box direction="row">
                {groupedFilters[group].map((filter, j) => (
                  <ButtonTagFilterWrap
                    key={j}
                    filter={filter}
                    label={getFilterLabel(filter, intl, long)}
                    labelLong={getFilterLabel(filter, intl, true)}
                    long={long}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Tags>
      )}
      {hasFilters && filters.length > 1 && (
        <Clear
          onClick={onClear}
        >
          <FormClose size="xsmall" />
        </Clear>
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
