import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Box, Text } from 'grommet';

import IndeterminateCheckbox, { STATES } from 'components/forms/IndeterminateCheckbox';

const ColumnOptionWrapper = styled((p) => (
  <Box
    pad={{ vertical: 'xsmall' }}
    direction="row"
    justify="between"
    align="center"
    flex={{ shrink: 0 }}
    {...p}
  />
))`
  border-bottom: 1px solid ${palette('light', 4)};
  &:first-child {
    border-top: 1px solid ${palette('light', 4)};
  }
`;

const OptionLabelHeader = styled((p) => <Text as="label" size="xsmall" {...p} />)`
opacity: 0.66;
font-weight: 500;
`;
const OptionLabel = styled((p) => <Text as="label" size="small" {...p} />)``;

export function DropFilter({ options, onUpdate }) {
  const optionCount = options.length;
  const selectedCount = options.filter((o) => o.active).length;
  console.log('options', options)
  let selectAllState = STATES.UNCHECKED;
  if (selectedCount === optionCount) {
    selectAllState = STATES.CHECKED;
  } else if (selectedCount > 0) {
    selectAllState = STATES.INDETERMINATE;
  }

  return (
    <Box pad="ms" flex={{ shrink: 0 }}>
      <Box
        pad={{ vertical: 'xsmall' }}
        direction="row"
        justify="between"
        flex={{ shrink: 0 }}
        align="center"
      >
        <Box direction="row" gap="small" align="center">
          <IndeterminateCheckbox
            id="list-column-option-all"
            checked={selectAllState}
            onChange={(checked) => {
              if (checked === STATES.CHECKED) {
                // only consider previously unchecked
                const changedToChecked = options
                  .filter((o) => !o.active)
                  .map((o) => o.value);
                onUpdate(changedToChecked, true);
              } else if (checked === STATES.UNCHECKED) {
                // only consider previously checked
                const changedToUnchecked = options
                  .filter((o) => o.active)
                  .map((o) => o.value);
                onUpdate(changedToUnchecked, false);
              }
            }}
          />
          <OptionLabelHeader htmlFor="list-column-option-all">
            {selectAllState !== STATES.CHECKED && ('Select all values')}
            {selectAllState === STATES.CHECKED && ('Unselect all values')}
          </OptionLabelHeader>
        </Box>
      </Box>
      <Box flex={{ shrink: 0 }}>
        {options && options.map(
          (option, i) => option && (
            <ColumnOptionWrapper key={i}>
              <Box direction="row" gap="small" align="center">
                <IndeterminateCheckbox
                  id={`list-column-option-${i}`}
                  checked={option.active}
                  onChange={(checked) => {
                    if (checked === STATES.CHECKED) {
                      onUpdate(option.value, true);
                    } else if (checked === STATES.UNCHECKED) {
                      onUpdate(option.value, false);
                    }
                  }}
                />
                <OptionLabel htmlFor={`list-column-option-${i}`}>
                  {option.mainTitle || option.title || option.label}
                </OptionLabel>
              </Box>
            </ColumnOptionWrapper>
          )
        )}
      </Box>
    </Box>
  );
}

DropFilter.propTypes = {
  options: PropTypes.array,
  onUpdate: PropTypes.func,
};

export default DropFilter;
