import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  Box, ResponsiveContext, Drop, Layer
} from 'grommet';
import ButtonFlatIconOnly from 'components/buttons/ButtonFlatIconOnly';
import BoxPrint from 'components/styled/BoxPrint';

import { isMinSize } from 'utils/responsive';
import DropHeader from './DropHeader';
import DropBody from './DropBody';
import DropFooter from './DropFooter';

const Styled = styled((p) => <Box {...p} />)`
  position: relative;
`;

const AuxButton = styled(ButtonFlatIconOnly)`
  color: inherit;
  padding: 0;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
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
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    height: 400px;
    width: 300px;
  }
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
        {open && !isMinSize(size, 'medium') && (
          <Layer
            full
            responsive
            onClickOutside={() => setOpen(false)}
            onEsc={() => setOpen(false)}
            animation={false}
            style={{ overflowY: 'auto', borderRadius: '0' }}
          >
            <DropHeader
              onClose={() => {
                setOpen(false);
                // onResetActiveColumns
              }}
            />
            <DropBody
              options={updatedColumnOptions}
              onUpdate={(args) => console.log('onUpdate', args)}
            />
            <DropFooter
              onConfirm={(args) => {
                console.log('onConfirm', args);
                onUpdateHiddenColumns('heyhey');
              }}
              onCancel={() => {
                setOpen(false);
                // onResetActiveColumns
              }}
            />
          </Layer>
        )}
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
              zIndex: '999999999',
            }}
            animate={false}
            overflow="hidden"
            inline
          >
            <DropContent>
              <HeaderInDrop>
                <DropHeader
                  onClose={() => {
                    setOpen(false);
                    // onResetActiveColumns
                  }}
                />
              </HeaderInDrop>
              <BodyInDrop>
                <DropBody
                  options={updatedColumnOptions}
                  onUpdate={(args) => console.log('onUpdate', args)}
                />
              </BodyInDrop>
              <FooterInDrop>
                <DropFooter
                  onConfirm={(args) => {
                    console.log('onConfirm', args);
                    onUpdateHiddenColumns('heyhey');
                  }}
                  onCancel={() => {
                    setOpen(false);
                    // onResetActiveColumns
                  }}
                />
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
