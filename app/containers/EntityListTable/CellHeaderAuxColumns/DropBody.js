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
    gap="small"
    flex={{ shrink: 0 }}
    {...p}
  />
))`
  border-bottom: 1px solid ${palette('light', 4)};
  &:first-child {
    border-top: 1px solid ${palette('light', 4)};
  }
`;

const OptionLabel = styled((p) => <Text as="label" size="small" {...p} />)``;
export function DropBody({ options, onUpdate }) {
  const optionCount = options.length;
  const selectedCount = options.filter((o) => o.checked).length;

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
        gap="small"
        flex={{ shrink: 0 }}
      >
        <IndeterminateCheckbox
          id="list-column-option-all"
          checked={selectAllState}
          onChange={(checked) => {
            if (checked === STATES.CHECKED) {
              // only consider previously unchecked
              const changedToChecked = options
                .filter((o) => !o.checked)
                .map((o) => o.id);
              onUpdate(changedToChecked, true);
            } else if (checked === STATES.UNCHECKED) {
              // only consider previously checked
              const changedToUnchecked = options
                .filter((o) => o.checked)
                .map((o) => o.id);
              onUpdate(changedToUnchecked, false);
            }
          }}
        />
        <OptionLabel htmlFor="list-column-option-all">
          Select All
        </OptionLabel>
      </Box>
      <Box flex={{ shrink: 0 }}>
        {options && options.map(
          (option, i) => option && (
            <ColumnOptionWrapper key={i}>
              <IndeterminateCheckbox
                id={`list-column-option-${i}`}
                checked={option.checked}
                onChange={(checked) => {
                  if (checked === STATES.CHECKED) {
                    onUpdate(option.id, true);
                  } else if (checked === STATES.UNCHECKED) {
                    onUpdate(option.id, false);
                  }
                }}
              />
              <OptionLabel htmlFor={`list-column-option-${i}`}>
                {option.title || option.label}
              </OptionLabel>
            </ColumnOptionWrapper>
          )
        )}
      </Box>
    </Box>
  );
}

DropBody.propTypes = {
  options: PropTypes.array,
  onUpdate: PropTypes.func,
};

export default DropBody;
