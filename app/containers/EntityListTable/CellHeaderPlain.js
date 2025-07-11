import React from 'react';
import PropTypes from 'prop-types';
import { Box, ResponsiveContext } from 'grommet';

import { isMinSize } from 'utils/responsive';

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
  const size = React.useContext(ResponsiveContext);

  return (
    <Box
      direction="row"
      align="center"
      justify={align}
      flex={false}
    >
      <TextPrint
        weight={500}
        size={isMinSize(size, 'ms') ? 'xxsmall' : 'xxxsmall'}
        textAlign={align}
        color="textSecondary"
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={column.label || column.title}
      >
        {column.label || column.title}
      </TextPrint>
      {isMinSize(size, 'medium') && column.onSort && (
        <PrintHide>
          <Box
            style={{ position: 'relative', top: '-1px' }}
            pad={{ left: '2px' }}
            flex={false}
          >
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
      {column.info && (
        <Box>
          <InfoOverlay
            tooltip
            icon="question"
            padButton={{ horizontal: 'xsmall' }}
            content={<CellHeaderInfoOverlay info={column.info} />}
          />
        </Box>
      )}
    </Box>
  );
}

CellHeaderPlain.propTypes = {
  column: PropTypes.object,
};

export default CellHeaderPlain;
