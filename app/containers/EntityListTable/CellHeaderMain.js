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
  max-width: 100%;
`;

export function CellHeaderMain({ column, canEdit }) {
  const sortOrderOption = column.onSort && SORT_ORDER_OPTIONS.find(
    (option) => column.sortOrder === option.value
  );
  const [title, info] = asArray(column.title);

  return (
    <Box
      direction="row"
      align="center"
      justify="start"
      style={{ width: '100%' }}
    >
      {canEdit && (
        <BoxPrint printHide flex={{ shrink: 0 }}>
          <Select>
            <Checkbox
              id="select-all"
              checked={column.selectedState}
              onChange={column.onSelect}
            />
          </Select>
        </BoxPrint>
      )}
      <Box
        direction="row"
        flex={{ shrink: 1 }}
      >
        {canEdit && (
          <Label
            htmlFor="select-all"
            title={title}
          >
            <TextPrint
              weight={500}
              size="xxsmall"
              color="textSecondary"
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
                display: 'inline-block',
              }}
            >
              {title}
            </TextPrint>
          </Label>
        )}
        {!canEdit && (
          <TextPrint
            weight={500}
            size="xxsmall"
            color="textSecondary"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={title}
          >
            {title}
          </TextPrint>
        )}
      </Box>
      {column.onSort && (
        <PrintHide>
          <Box
            style={{ position: 'relative', top: '-1px' }}
            pad={{ left: '2px' }}
            flex={{ shrink: 0 }}
          >
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
      {info && (
        <Box style={{ position: 'relative', top: '-1px' }}>
          <InfoOverlay
            tooltip
            icon="question"
            padButton={{ horizontal: 'xsmall' }}
            content={(
              <Box
                margin={{ horizontal: 'xsmall', vertical: 'xsmall' }}
                background="white"
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
