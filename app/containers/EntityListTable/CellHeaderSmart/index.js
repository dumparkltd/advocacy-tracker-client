import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box } from 'grommet';
import ButtonFlatIconOnly from 'components/buttons/ButtonFlatIconOnly';
import Icon from 'components/Icon';
import { SORT_ORDER_OPTIONS } from 'containers/App/constants';
import InfoOverlay from 'components/InfoOverlay';
import TextPrint from 'components/styled/TextPrint';
import PrintHide from 'components/styled/PrintHide';
import CellHeaderInfoOverlay from '../CellHeaderInfoOverlay';

const SortButton = styled(ButtonFlatIconOnly)`
  color: inherit;
  padding: 0;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding: 0;
  }
`;

export function CellHeaderSmart ({ column }) {
  const sortOrderOption = column.onSort && SORT_ORDER_OPTIONS.find(
    (option) => column.sortOrder === option.value
  );
  const { align = 'start' } = column;
  console.log('column', column)
  return (
    <Box direction="row" align="center" justify={align} flex={false} wrap>
      <TextPrint weight={500} size="small" textAlign={align} wordBreak="keep-all">
        {column.label || column.title}
      </TextPrint>
      {column.info && (
        <InfoOverlay
          tooltip
          icon="question"
          padButton={{ horizontal: 'xsmall' }}
          content={<CellHeaderInfoOverlay info={column.info} />}
        />
      )}
      {!column.filterOptions && (
        <Box pad={{ left: 'xxsmall' }} flex={false}>
        </Box>
      )}
      {column.filterOptions && column.onSort && (
        <PrintHide>
          <Box pad={{ left: 'xxsmall' }} flex={false}>
            <SortButton
              onClick={() => {
                if (column.sortActive) {
                  const nextSortOrderOption = SORT_ORDER_OPTIONS.find(
                    (option) => sortOrderOption.nextValue === option.value
                  );
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

CellHeaderSmart.propTypes = {
  column: PropTypes.object,
};

export default CellHeaderSmart;
