import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ButtonSort from 'components/buttons/ButtonSort';

import { Box, Text } from 'grommet';

import InfoOverlay from 'components/InfoOverlay';
import IndeterminateCheckbox from 'components/forms/IndeterminateCheckbox';
import PrintHide from 'components/styled/PrintHide';
import BoxPrint from 'components/styled/BoxPrint';
import TextPrint from 'components/styled/TextPrint';
import Icon from 'components/Icon';
import asArray from 'utils/as-array';

import { SORT_ORDER_OPTIONS } from 'containers/App/constants';

const Checkbox = styled(IndeterminateCheckbox)`
  vertical-align: middle;
`;
const Select = styled(PrintHide)`
  width: 20px;
  text-align: center;
  padding-right: 6px;
  position: relative;
  top: -2px;
`;

const Label = styled.label`
  position: relative;
  top: -2px;
`;


export function CellHeaderMain({ column, canEdit }) {
  const sortOrderOption = column.onSort && SORT_ORDER_OPTIONS.find(
    (option) => column.sortOrder === option.value
  );
  const [title, info] = asArray(column.title);

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
          <TextPrint
            weight={500}
            size="xxsmall"
            wordBreak="keep-all"
            color="textSecondary"
          >
            {title}
          </TextPrint>
        </Label>
      )}
      {!canEdit && (
        <TextPrint weight={500} size="xxsmall" color="textSecondary">
          {title}
        </TextPrint>
      )}
      {info && (
        <InfoOverlay
          tooltip
          icon="question"
          padButton={{ horizontal: 'xsmall' }}
          content={(
            <Box
              pad="small"
              margin={{ horizontal: 'xsmall', vertical: 'xsmall' }}
              background="white"
              elevation="small"
              overflow={{
                vertical: 'auto',
                horizontal: 'hidden',
              }}
            >
              <Text size="small">
                {info}
              </Text>
            </Box>
          )}
        />
      )}
      {column.onSort && (
        <PrintHide>
          <Box pad={{ left: 'xxsmall' }} flex={false}>
            <ButtonSort
              sortActive={column.sortActive}
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
                hidePrint={!column.sortActive}
                size="20px"
              />
            </ButtonSort>
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
