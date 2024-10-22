/*
 *
 * GroupFilters
 *
 */
import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';

import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Box, Text, Drop } from 'grommet';
import { FormClose, FormDown, FormUp } from 'grommet-icons';

import Button from 'components/buttons/Button';
import ButtonTagFilterWrap from 'components/buttons//ButtonTagFilterWrap';
import ButtonTagFilter from 'components/buttons/ButtonTagFilter';
import PrintHide from 'components/styled/PrintHide';

import { usePrint } from 'containers/App/PrintContext';

import { getFilterLabel } from './utils';

const Clear = styled(Button)`
  background-color: ${palette('background', 4)};
  padding: 0;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding: 0;
  }
  @media print {
    display: none;
  }
`;

function GroupFilters({
  groupFilters,
  onClear,
  long,
  groupDropdownThreshold,
  lastGroup,
  hasMultiple,
  intl,
}) {
  const isPrintView = usePrint();
  const dropdown = useRef();
  const [showMultiple, setShowMultiple] = useState(false);
  return (
    <Box direction="row" overflow="hidden" flex={{ shrink: 0 }}>
      {groupFilters.length < groupDropdownThreshold && groupFilters.map(
        (filter, j) => (
          <Box key={j} direction="row" align="center" flex={{ shrink: 0 }}>
            <ButtonTagFilterWrap
              filter={filter}
              label={getFilterLabel(filter, intl, long)}
              labelLong={getFilterLabel(filter, intl, true)}
              long={long}
            />
            {hasMultiple
              && lastGroup
              && groupFilters.length === (j + 1)
              && (
                <PrintHide>
                  <Box>
                    <Clear onClick={onClear}><FormClose size="small" /></Clear>
                  </Box>
                </PrintHide>
              )
            }
          </Box>
        )
      )}
      {groupFilters.length >= groupDropdownThreshold && (
        <Box
          direction="row"
          align="center"
          flex={{ shrink: 0 }}
          styled={{ position: 'relative' }}
          ref={dropdown}
        >
          <ButtonTagFilter
            isPrint={isPrintView}
            onClick={() => setShowMultiple(!showMultiple)}
            title={`${groupFilters.length} filters`}
          >
            <Box direction="row" gap="xsmall" align="center">
              <Text size="small" style={{ fontStyle: 'italic' }}>
                {`${groupFilters.length} filters`}
              </Text>
              <PrintHide>
                {showMultiple && <FormUp size="xsmall" color="inherit" />}
                {!showMultiple && <FormDown size="xsmall" color="inherit" />}
              </PrintHide>
            </Box>
          </ButtonTagFilter>
          {hasMultiple
            && lastGroup
            && (
              <PrintHide>
                <Box>
                  <Clear onClick={onClear}><FormClose size="small" /></Clear>
                </Box>
              </PrintHide>
            )
          }
          {showMultiple && dropdown && dropdown.current && (
            <Drop
              target={dropdown.current}
              onClickOutside={() => setShowMultiple(false)}
              align={{
                top: 'bottom',
                left: 'left',
              }}
              margin={{ vertical: 'xsmall' }}
              plain
            >
              <Box gap="xsmall" margin="hair" flex={false} fill={false} justify="start" align="start">
                {groupFilters.map(
                  (filter, j) => (
                    <Box key={j} flex={false} fill={false} justify="start" align="start">
                      <ButtonTagFilterWrap
                        filter={filter}
                        label={getFilterLabel(filter, intl, long)}
                        labelLong={getFilterLabel(filter, intl, true)}
                        long={long}
                      />
                    </Box>
                  )
                )}
              </Box>
            </Drop>
          )}
        </Box>
      )}
    </Box>
  );
}

GroupFilters.propTypes = {
  groupDropdownThreshold: PropTypes.number,
  groupFilters: PropTypes.array,
  onClear: PropTypes.func,
  long: PropTypes.bool,
  lastGroup: PropTypes.bool,
  hasMultiple: PropTypes.bool,
  intl: intlShape,
};

export default injectIntl(GroupFilters);
