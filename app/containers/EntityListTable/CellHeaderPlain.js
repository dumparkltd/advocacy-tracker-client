import React from 'react';
import PropTypes from 'prop-types';
import { Box } from 'grommet';
import ButtonSort from 'components/buttons/ButtonSort';
import Icon from 'components/Icon';
import { SORT_ORDER_OPTIONS } from 'containers/App/constants';
import InfoOverlay from 'components/InfoOverlay';
import TextPrint from 'components/styled/TextPrint';
import PrintHide from 'components/styled/PrintHide';
import CellHeaderInfoOverlay from './CellHeaderInfoOverlay';

export function CellHeaderPlain({ column }) {
  const sortOrderOption = column.onSort && SORT_ORDER_OPTIONS.find(
    (option) => column.sortOrder === option.value
  );
  const { align = 'start' } = column;
  return (
    <Box direction="row" align="center" justify={align} flex={false}>
      <TextPrint
        weight={500}
        size="xxsmall"
        textAlign={align}
        wordBreak="keep-all"
        color="textSecondary"
      >
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
      {column.onSort && (
        <PrintHide>
          <Box pad={{ left: 'xxsmall' }} flex={false}>
            <ButtonSort
              sortActive={column.sortActive}
              onClick={() => {
                if (column.sortActive) {
                  column.onSort(column.id || column.type, sortOrderOption.nextValue);
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

CellHeaderPlain.propTypes = {
  column: PropTypes.object,
};

export default CellHeaderPlain;
