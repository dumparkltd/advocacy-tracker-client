import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Box, Text, Button } from 'grommet';

import Icon from 'components/Icon';
import { SORT_ORDER_OPTIONS } from 'containers/App/constants';
import appMessages from 'containers/App/messages';

const ColumnOptionWrapper = styled((p) => <Box flex={{ shrink: 0 }} {...p} />)`
  border-bottom: 1px solid ${palette('light', 4)};
  &:first-child {
    border-top: 1px solid ${palette('light', 4)};
  }
`;

const OptionLabel = styled((p) => <Text size="small" {...p} />)``;

const Title = styled((p) => <Text size="xsmall" {...p} />)`
  font-weight: bold;
`;

const SortOptionButton = styled((p) => <Button plain {...p} />)`
  cursor: ${({ disabled }) => disabled ? 'default' : 'pointer'};
  width: 100%;
  opacity: 1;
  font-weight: ${({ isActive }) => isActive ? '700' : '400'};
  border: none;
  &:hover {
    color: ${({ isActive }) => isActive ? 'black' : palette('primary', 1)}
  }
`;

export function DropSort({ column }) {
  const { onSort, sortActive, sortOrder } = column;

  return (
    <Box pad="ms" gap="small" flex={{ shrink: 0 }}>
      <Title>Sort by value</Title>
      <Box flex={{ shrink: 0 }}>
        {SORT_ORDER_OPTIONS.map((option) => {
          const isActive = sortActive && option.value === sortOrder;
          return (
            <ColumnOptionWrapper key={option.value}>
              <SortOptionButton
                isActive={isActive}
                disabled={isActive}
                onClick={() => !isActive && onSort(column.id, option.value)}
              >
                <Box
                  direction="row"
                  gap="small"
                  align="center"
                  pad={{ vertical: 'xsmall' }}
                >
                  <Icon
                    name={option.icon}
                    palette="dark"
                    paletteIndex={isActive ? 1 : 4}
                    hidePrint={!column.isActive}
                    size="20px"
                  />
                  <OptionLabel>
                    <FormattedMessage {...appMessages.ui.sortOrderOptions[option.value]} />
                  </OptionLabel>
                </Box>
              </SortOptionButton>
            </ColumnOptionWrapper>
          );
        })}
      </Box>
    </Box>
  );
}

DropSort.propTypes = {
  column: PropTypes.object,
};

export default DropSort;
