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

const Styled = styled((p) => <Box {...p} />)`
  position: relative;
`;

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
const DropContent = styled.div`
  max-width: none;
  height: 400px;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    height: 400px;
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
const ColumnOptionWrapper = styled((p) => (
  <Box
    pad={{ vertical: 'xsmall' }}
    direction="row"
    gap="small"
    flex={{ shrink: 0 }}
    {...p}
  />
))`
  border-bottom: 1px solid ${palette('light', 4)};
  &:first-child {
    border-top: 1px solid ${palette('light', 4)};
  }
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

const DropAnchor = styled.div`
  position: absolute;
  top: -${({ theme }) => theme.global.edgeSize.ms};
  right: -${({ theme }) => theme.global.edgeSize.ms};
`;

const HeaderInDrop = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 50px;
  background: white;
`;
const BodyInDrop = styled.div`
  position: absolute;
  top: 50px;
  right: 0;
  left: 0;
  bottom: 50px;
  overflow-y: auto;
`;
const FooterInDrop = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  height: 50px;
  background: white;
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
  // const areAllColumnsSelected = updatedColumnOptions.filter((option) => option.hidden).length === 0;
  const { align = 'start' } = column;
  return (
    <Styled direction="row" align="center" justify={align}>
      <DropAnchor ref={ref} />
      <BoxPrint printHide>
        <AuxButton onClick={() => setOpen(!open)}>
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
            }}
            animate={false}
            overflow="hidden"
          >
            <DropContent>
              <HeaderInDrop>
                <Box
                  pad={{ horizontal: 'ms', top: 'ms' }}
                  direction="row"
                  justify="between"
                  align="center"
                  flex={{ shrink: 0 }}
                >
                  <DropLayerTitle>Configure columns</DropLayerTitle>
                  <CloseButton onClick={() => setOpen(false)}>
                    <Icon name="close" size="25px" />
                  </CloseButton>
                </Box>
              </HeaderInDrop>
              <BodyInDrop>
                <Box pad="ms" gap="none" flex={{ shrink: 0 }}>
                  {updatedColumnOptions && updatedColumnOptions.map(
                    (option, i) => option && (
                      <ColumnOptionWrapper key={i}>
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
                  )}
                </Box>
              </BodyInDrop>
              <FooterInDrop>
                <Box
                  pad={{ horizontal: 'ms', bottom: 'ms', top: 'small' }}
                  direction="row"
                  justify="end"
                  gap="small"
                  flex={{ shrink: 0 }}
                >
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
              </FooterInDrop>
            </DropContent>
          </Drop>
        )}
      </BoxPrint>
    </Styled>
  );
}

CellHeaderAuxColumns.propTypes = {
  column: PropTypes.object,
  columnOptions: PropTypes.array,
  onUpdateHiddenColumns: PropTypes.func,
};

export default CellHeaderAuxColumns;
