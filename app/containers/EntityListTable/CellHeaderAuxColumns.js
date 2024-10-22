import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import {
  Box, ResponsiveContext, Drop, Text, Button,
} from 'grommet';
import ButtonFlatIconOnly from 'components/buttons/ButtonFlatIconOnly';
import BoxPrint from 'components/styled/BoxPrint';
import Icon from 'components/Icon';

import { isMinSize } from 'utils/responsive';

const AuxButton = styled(ButtonFlatIconOnly)`
  color: inherit;
  padding: 0;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    padding: 0;
  }
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.global.colors.highlight};
  &:hover {
    background-color: ${({ theme }) => theme.global.colors.highlightHover};
  }
`;

const Dot = styled.div`
  display: block;
  border-radius: 999px;
  width: 3px;
  height: 3px;
  background-color: white;
  margin: 0 auto;
`;
const DropContent = styled((p) => (
  <Box
    flex={{ shrink: 0 }}
    responsive={false}
    {...p}
  />
))`
  max-width: none;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    width: 300px;
  }
`;
const Checkbox = styled.input`
  accent-color: ${({ disabled }) => disabled ? palette('dark', 3) : 'black'};
`;
const DropLayerTitle = styled((p) => <Text size="small" {...p} />)`
  text-transform: uppercase;
  font-weight: bold;
`;
const CloseButton = styled((p) => <Button plain {...p} />)`
  border-radius: 999px;
  color: white;
  height: 25px;
  width: 25px;
  padding: 0px 4px 4px 0px;
  background-color: ${palette('primary', 1)};
  &:hover {
    opacity: 0.9;
  };
`;
const ColumnOptionWrapper = styled((p) => <Box {...p} />)`
  border-bottom: 1px solid ${palette('light', 4)};
`;
const ColumnTitle = styled((p) => <Text {...p} />)`
  color: ${({ isDisabled }) => isDisabled ? palette('dark', 3) : 'black'}
`;
const ActionButton = styled((p) => <Button plain {...p} />)`
  padding: 5px 10px 6px 10px;
  border-radius: 10px;

  font-family: ${({ theme }) => theme.fonts.title};
  font-weight: normal;
  font-size: 18px;
  text-transform: uppercase;
`;
const ConfirmButton = styled((p) => <ActionButton {...p} />)`
  background: ${palette('primary', 1)};
  color: white;
`;
const CancelButton = styled((p) => <ActionButton {...p} />)`
  color: ${palette('light', 4)};
`;
export function CellHeaderAuxColumns({ column, columnOptions, onUpdateHiddenColumns }) {
  const [updatedColumnOptions, setUpdatedColumnOptions] = useState([...columnOptions]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const size = React.useContext(ResponsiveContext);

  useEffect(() => {
    // reset column options on drop open
    if (open) {
      setUpdatedColumnOptions([...columnOptions]);
    }
  }, [open]);

  // console.log('CellHeaderAuxColumns', column, columnOptions);
  const areAllColumnsSelected = updatedColumnOptions.filter((option) => option.hidden).length === 0;
  const { align = 'start' } = column;
  return (
    <Box direction="row" align="center" justify={align}>
      <BoxPrint printHide>
        <AuxButton onClick={() => setOpen(!open)} ref={ref}>
          <Box gap="2px" justify="center" fill="horizontal">
            <Dot />
            <Dot />
            <Dot />
          </Box>
        </AuxButton>
        {open && isMinSize(size, 'medium') && (
          <Drop
            target={ref.current}
            responsive={false}
            align={{ top: 'top', right: 'right' }}
            onClickOutside={() => setOpen(false)}
            onEsc={() => setOpen(false)}
            style={{
              animation: 'none',
              opacity: '1',
              marginTop: '-2',
              marginRight: '-2',
            }}
            animate={false}
            overflow={{
              vertical: 'auto',
              horizontal: 'hidden',
            }}
          >
            <DropContent direction="column" pad="medium">
              <Box direction="row" justify="between" align="center">
                <DropLayerTitle>Configure columns</DropLayerTitle>
                <CloseButton onClick={() => setOpen(false)}>
                  <Icon name="close" size="25px" />
                </CloseButton>
              </Box>
              <Box direction="column" gap="none">
                <ColumnOptionWrapper pad={{ vertical: 'xsmall' }} direction="row" gap="small">
                  <Checkbox
                    type="checkbox"
                    checked={areAllColumnsSelected}
                    disabled={areAllColumnsSelected}
                  // onChange={(evt) => {
                  // select all
                  // }}
                  />
                  <ColumnTitle isDisabled={areAllColumnsSelected}>
                    Select All
                  </ColumnTitle>
                </ColumnOptionWrapper>
                {updatedColumnOptions && updatedColumnOptions.map((option, i) => (
                  option && (
                    <ColumnOptionWrapper pad={{ vertical: 'xsmall' }} direction="row" gap="small" key={i}>
                      <Checkbox
                        type="checkbox"
                        checked={!(option.hidden)}
                        onChange={(evt) => {
                          evt.stopPropagation();
                          const updatedOptions = [...updatedColumnOptions];
                          updatedOptions[i] = { ...updatedOptions[i], hidden: !evt.target.checked };
                          setUpdatedColumnOptions([...updatedOptions]);
                        }}
                      />
                      <ColumnTitle>
                        {option.title}
                      </ColumnTitle>
                    </ColumnOptionWrapper>
                  )
                ))}
              </Box>
              <Box direction="row" justify="end" gap="small" margin={{ top: 'small' }}>
                <CancelButton onClick={() => setOpen(false)}>Cancel</CancelButton>
                <ConfirmButton
                  onClick={() => {
                    onUpdateHiddenColumns(updatedColumnOptions);
                    setOpen(false);
                  }}
                >
                  Confirm
                </ConfirmButton>
              </Box>
            </DropContent>
          </Drop>
        )}
      </BoxPrint>
    </Box>
  );
}

CellHeaderAuxColumns.propTypes = {
  column: PropTypes.object,
  columnOptions: PropTypes.array,
  onUpdateHiddenColumns: PropTypes.func,
};

export default CellHeaderAuxColumns;
