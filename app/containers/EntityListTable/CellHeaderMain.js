import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box } from 'grommet';

import IndeterminateCheckbox from 'components/forms/IndeterminateCheckbox';
import PrintHide from 'components/styled/PrintHide';
import BoxPrint from 'components/styled/BoxPrint';
import TextPrint from 'components/styled/TextPrint';
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
`;

const SortButton = styled(ButtonFlatIconOnly)`
  color: inherit;
  padding: 0;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    padding: 0;
  }
`;

const Label = styled.label``;


export function CellHeaderMain({ column, canEdit }) {
  const sortOrderOption = column.onSort && SORT_ORDER_OPTIONS.find(
    (option) => column.sortOrder === option.value
  );

  return (
    <Box direction="row" align="center" justify="start" flex={false}>
      {canEdit && (
        <BoxPrint printHide>
          <Select>
            <Checkbox
              id="select-all"
              checked={column.selectedState}
              onChange={column.onSelect}
            />
          </Select>
        </BoxPrint>
      )}
      {canEdit && (
        <Label htmlFor="select-all">
          <TextPrint weight={500} size="small" wordBreak="keep-all">
            {column.title}
          </TextPrint>
        </Label>
      )}
      {!canEdit && (
        <TextPrint weight={500} size="small">
          {column.title}
        </TextPrint>
      )}
      {column.onSort && (
        <PrintHide>
          <Box pad={{ left: 'xxsmall' }} flex={false}>
            <SortButton
              onClick={() => {
                if (column.sortActive) {
                  const nextSortOrderOption = SORT_ORDER_OPTIONS.find((option) => sortOrderOption.nextValue === option.value);
                  column.onSort(column.id || column.type, nextSortOrderOption.value);
                } else {
                  column.onSort(column.id || column.type, sortOrderOption.value);
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
        </PrintHide>
      )}
    </Box>
  );
}

CellHeaderMain.propTypes = {
  column: PropTypes.object,
  canEdit: PropTypes.bool,
};

export default CellHeaderMain;
