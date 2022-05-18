import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text } from 'grommet';
import IndeterminateCheckbox from 'components/forms/IndeterminateCheckbox';
import PrintHide from 'components/styled/PrintHide';
import ButtonFlatIconOnly from 'components/buttons/ButtonFlatIconOnly';
import Icon from 'components/Icon';
import { SORT_ORDER_OPTIONS } from 'containers/App/constants';

const Checkbox = styled(IndeterminateCheckbox)`
  vertical-align: middle;
`;
const Select = styled(PrintHide)`
  width: 20px;
  text-align: center;
  padding-right: 6px;
  position: relative;
  top: -1px
`;

const SortButton = styled(ButtonFlatIconOnly)`
  color: inherit;
  padding: 0;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    padding: 0;
  }
`;


export function CellHeaderMain({ column, canEdit }) {
  const sortOrderOption = column.onSort && SORT_ORDER_OPTIONS.find((option) => column.sortOrder === option.value);
  return (
    <Box direction="row" align="center" justify="start">
      {canEdit && (
        <Box>
          <Select>
            <Checkbox
              id="select-all"
              checked={column.selectedState}
              onChange={column.onSelect}
            />
          </Select>
        </Box>
      )}
      <Box>
        {canEdit && (
          <Text as="label" htmlFor="select-all" weight={500} size="small">
            {column.title}
          </Text>
        )}
        {!canEdit && (
          <Text weight={500} size="small">
            {column.title}
          </Text>
        )}
      </Box>
      {column.onSort && (
        <Box pad={{ left: 'medium' }}>
          <SortButton
            onClick={() => {
              if (column.sortActive) {
                const nextSortOrderOption = SORT_ORDER_OPTIONS.find((option) => sortOrderOption.nextValue === option.value);
                column.onSort(column.id || column.type, nextSortOrderOption.value);
              } else {
                column.onSort(column.id || column.type, sortOrderOption.order);
              }
            }}
          >
            <Icon
              name={column.sortActive && sortOrderOption
                ? sortOrderOption.icon
                : 'sorting'
              }
              palette="dark"
              paletteIndex={column.sortActive ? 1 : 4}
              hidePrint={!column.sortActive}
              size="20px"
            />
          </SortButton>
        </Box>
      )}
    </Box>
  );
}

CellHeaderMain.propTypes = {
  column: PropTypes.object,
  canEdit: PropTypes.bool,
};

export default CellHeaderMain;
