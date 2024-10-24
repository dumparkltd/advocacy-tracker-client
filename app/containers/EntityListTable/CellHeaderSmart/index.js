import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Drop, ResponsiveContext } from 'grommet';

import { isMinSize } from 'utils/responsive';
import asArray from 'utils/as-array';

import ButtonFlatIconOnly from 'components/buttons/ButtonFlatIconOnly';
import Icon from 'components/Icon';
import { SORT_ORDER_OPTIONS } from 'containers/App/constants';
import TextPrint from 'components/styled/TextPrint';
import PrintHide from 'components/styled/PrintHide';
import DropHeader from './DropHeader';
import DropFilter from './DropFilter';

const SortButton = styled(ButtonFlatIconOnly)`
  color: inherit;
  padding: 0;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding: 0;
  }
`;

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
    background-color: ${({ theme, isActive }) => isActive ? theme.global.colors.highlightHover : 'transparent'};
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

const DropContent = styled.div`
  max-width: none;
  height: 300px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    height: 350px;
    width: 300px;
  }
`;


export function CellHeaderSmart({ column, filterOptions, onUpdateFilterOptions }) {
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
  const hasFilters = filterOptions && activeFilterOptions.length < filterOptions.length;
  const isActive = hasFilters || column.sortActive;
  // console.log('column', column, filterOptions, isActive, open)
  const size = React.useContext(ResponsiveContext);

  return (
    <Box direction="row" align="center" justify={align} flex={false} wrap>
      <TextPrint weight={500} size="xsmall" textAlign={align} wordBreak="keep-all">
        {column.label || column.title}
      </TextPrint>
      {column.filterOptions && (
        <Box flex={false} style={{ position: 'relative' }}>
          <DropAnchor ref={ref} />
          <ColumnButton onClick={() => setOpen(true)} isActive={isActive}>
            <Box gap="3px" justify="center" align="center" fill>
              <Line size="L" isActive={isActive} />
              <Line size="M" isActive={isActive} />
              <Line size="S" isActive={isActive} />
            </Box>
          </ColumnButton>
        </Box>
      )}
      {column.filterOptions && ref && ref.current && open && isMinSize(size, 'medium') && (
        <Drop
          target={ref.current}
          responsive={false}
          align={{ top: 'top', right: 'right' }}
          onClickOutside={() => setOpen(false)}
          onEsc={() => setOpen(false)}
          style={{
            animation: 'none',
            opacity: '1',
            zIndex: '999999999',
          }}
          animate={false}
          overflow="hidden"
          inline
          stretch={false}
        >
          <DropContent>
            <DropHeader
              onClose={() => setOpen(false)}
              title="Filter by value"
            />
            <DropFilter
              options={column.filterOptions}
              onUpdate={(filterIds, checked) => {
                let changedToChecked = [];
                let changedToUnchecked = [];
                asArray(filterIds).forEach((filterId) => {
                  if (checked) {
                    changedToChecked = [...changedToChecked, filterId];
                  }
                  if (!checked) {
                    changedToUnchecked = [...changedToUnchecked, filterId];
                  }
                });
                const changedFilters = [...changedToChecked, ...changedToUnchecked];
                const updatedFilterOptions = column.filterOptions.map((option) => {
                  const optionChanged = changedFilters.indexOf(option.value) > -1;
                  return ({
                    ...option,
                    changed: optionChanged,
                  });
                });
                onUpdateFilterOptions(updatedFilterOptions);
              }}
            />
          </DropContent>
        </Drop>
      )}
      {!column.filterOptions && column.onSort && (
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
  filterOptions: PropTypes.array,
  onUpdateFilterOptions: PropTypes.func,
};

export default CellHeaderSmart;
