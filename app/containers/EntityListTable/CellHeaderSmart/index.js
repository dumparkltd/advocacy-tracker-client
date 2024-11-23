import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import {
  Box, Drop, ResponsiveContext, Layer,
} from 'grommet';

import { isMinSize } from 'utils/responsive';

import ButtonFlatIconOnly from 'components/buttons/ButtonFlatIconOnly';
import ButtonSort from 'components/buttons/ButtonSort';
import Icon from 'components/Icon';
import { SORT_ORDER_OPTIONS } from 'containers/App/constants';
import TextPrint from 'components/styled/TextPrint';
import PrintHide from 'components/styled/PrintHide';
import DropContent from './DropContent';

const ColumnButton = styled(ButtonFlatIconOnly)`
  color: ${({ isActive }) => isActive ? 'white' : 'inherit'};
  padding: 0;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding: 0;
  }
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background-color: ${({ theme, isActive }) => isActive ? theme.global.colors.highlight : 'transparent'};
  &:hover {
    color: ${({ isActive }) => isActive ? 'white' : 'inherit'};
    background-color: ${({ theme, isActive }) => isActive ? theme.global.colors.highlightHover : '#EDEFF0'};
  }
`;

const Line = styled.div`
  display: block;
  width: ${({ size }) => {
    if (size === 'L') return '16px';
    if (size === 'S') return '4px';
    return '10px';
  }};
  height: 2px;
  background-color: ${({ isActive }) => isActive ? 'white' : 'black'};
`;

const DropAnchor = styled.div`
  position: absolute;
  top: -${({ theme }) => theme.global.edgeSize.ms};
  right: -${({ theme }) => theme.global.edgeSize.ms};
`;

export function CellHeaderSmart({
  column,
  filterOptions,
  onUpdateFilterOptions,
  onDropChange,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const sortOrderOption = column.onSort && SORT_ORDER_OPTIONS.find(
    (option) => column.sortOrder === option.value
  );
  const { align = 'center' } = column;
  const activeFilterOptions = filterOptions && filterOptions.filter(
    (option) => !!option.active
  );
  // check if some options are disabled
  const hasFilters = filterOptions && activeFilterOptions.length > 0;
  const isActive = hasFilters || column.sortActive;
  // console.log('column', column, filterOptions, isActive, open)
  const size = React.useContext(ResponsiveContext);

  return (
    <Box direction="column" align="center" justify={align} flex={false}>
      <TextPrint
        weight={500}
        size="xxsmall"
        textAlign={align}
        wordBreak="keep-all"
        color="textSecondary"
      >
        {column.label || column.title}
      </TextPrint>
      {column.filterOptions && (
        <Box flex={false} style={{ position: 'relative' }}>
          <DropAnchor ref={ref} />
          <ColumnButton
            onClick={() => {
              if (onDropChange) onDropChange(true);
              setOpen(true);
            }}
            isActive={isActive}
          >
            <Box gap="2px" justify="center" align="center" fill>
              <Line size="L" isActive={isActive} />
              <Line size="M" isActive={isActive} />
              <Line size="S" isActive={isActive} />
            </Box>
          </ColumnButton>
        </Box>
      )}
      {column.filterOptions
        && ref
        && ref.current
        && open && isMinSize(size, 'ms')
        && (
          <Drop
            target={ref.current}
            align={{ top: 'top', right: 'right' }}
            onClickOutside={() => {
              setOpen(false);
              if (onDropChange) onDropChange(false);
            }}
            onEsc={() => {
              setOpen(false);
              if (onDropChange) onDropChange(false);
            }}
            style={{
              animation: 'none',
              opacity: '1',
              zIndex: '999999999',
            }}
            animate={false}
            overflow="hidden"
            stretch={false}
          >
            <DropContent
              column={column}
              onUpdate={onUpdateFilterOptions}
              onClose={() => {
                setOpen(false);
                if (onDropChange) onDropChange(false);
              }}
            />
          </Drop>
        )}
      {column.filterOptions
        && open
        && !isMinSize(size, 'ms')
        && (
          <Layer
            full
            responsive
            onClickOutside={() => setOpen(false)}
            onEsc={() => setOpen(false)}
            animation={false}
            style={{ overflowY: 'auto', borderRadius: '0' }}
          >
            <DropContent
              column={column}
              onUpdate={onUpdateFilterOptions}
              onClose={() => {
                setOpen(false);
                if (onDropChange) onDropChange(false);
              }}
            />
          </Layer>
        )}
      {!column.filterOptions && column.onSort && (
        <PrintHide>
          <Box pad={{ left: 'xxsmall' }} flex={false}>
            <ButtonSort
              sortActive={column.sortActive}
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

CellHeaderSmart.propTypes = {
  column: PropTypes.object,
  filterOptions: PropTypes.array,
  onDropChange: PropTypes.func,
  onUpdateFilterOptions: PropTypes.func,
};

export default CellHeaderSmart;
