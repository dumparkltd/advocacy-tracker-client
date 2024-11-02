import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  Box, ResponsiveContext, Drop,
} from 'grommet';
import ButtonFlatIconOnly from 'components/buttons/ButtonFlatIconOnly';
import BoxPrint from 'components/styled/BoxPrint';

import { isMinSize } from 'utils/responsive';
import asArray from 'utils/as-array';
import DropHeader from './DropHeader';
import DropBody from './DropBody';

const Styled = styled(
  React.forwardRef((p, ref) => <Box plain {...p} ref={ref} />)
)`
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
`;
const DropContent = styled.div`
  max-width: none;
  height: 300px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    height: 350px;
    width: 300px;
  }
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
  bottom: 0;
  overflow-y: auto;
`;
// const ColumnOptionsDropAnchor = styled.div`
//   position: absolute;
//   top: -${({ theme }) => theme.global.edgeSize.ms};
//   right: -${({ theme }) => theme.global.edgeSize.ms};
//   margin-top: ${({ theme }) => theme.global.edgeSize.xsmall};
//   width: 2px;
//   height: 2px;
//   background: red;
// `;
export function CellHeaderAuxColumns({
  columnOptions,
  onUpdate,
  // theme,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const size = React.useContext(ResponsiveContext);
  return (
    <Styled ref={ref}>
      <BoxPrint margin={{ right: 'ms', top: 'ms' }} printHide>
        <AuxButton onClick={() => setOpen(true)}>
          <Box gap="2px" direction="column" justify="center" align="center" fill>
            <Dot />
            <Dot />
            <Dot />
          </Box>
        </AuxButton>
      </BoxPrint>
      {ref && ref.current && open && isMinSize(size, 'medium') && (
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
          stretch={false}
        >
          <DropContent>
            <HeaderInDrop>
              <DropHeader onClose={() => setOpen(false)} />
            </HeaderInDrop>
            <BodyInDrop>
              <DropBody
                options={columnOptions}
                onUpdate={(columnIds, checked) => {
                  let changedToHidden = [];
                  let changedToVisible = [];
                  asArray(columnIds).forEach((columnId) => {
                    if (checked) {
                      changedToVisible = [...changedToVisible, columnId];
                    }
                    if (!checked) {
                      changedToHidden = [...changedToHidden, columnId];
                    }
                  });
                  const changedColumns = [...changedToVisible, ...changedToHidden];
                  const updatedColumnOptions = columnOptions.map((col) => {
                    const colChanged = changedColumns.indexOf(col.id) > -1;
                    return ({
                      ...col,
                      changed: colChanged,
                    });
                  });
                  onUpdate(updatedColumnOptions);
                }}
              />
            </BodyInDrop>
          </DropContent>
        </Drop>
      )}
    </Styled>
  );
}
// responsive support
// {open && !isMinSize(size, 'medium') && (
//   <Layer
//   full
//   responsive
//   onClickOutside={() => setOpen(false)}
//   onEsc={() => setOpen(false)}
//   animation={false}
//   style={{ overflowY: 'auto', borderRadius: '0' }}
//   >
//   <DropHeader
//   onClose={() => {
//     setOpen(false);
//     // onResetActiveColumns
//   }}
//   />
//   <DropBody
//   options={columnOptions && columnOptions.filter((col) => col.type !== 'main')}
//   onUpdate={(args) => console.log('onUpdate', args)}
//   />
//   <DropFooter
//   onConfirm={(args) => {
//     console.log('onConfirm', args);
//     onUpdateHiddenColumns('heyhey');
//   }}
//   onCancel={() => {
//     setOpen(false);
//     // onResetActiveColumns
//   }}
//   />
//   </Layer>
// )}

CellHeaderAuxColumns.propTypes = {
  columnOptions: PropTypes.array,
  onUpdate: PropTypes.func,
};

export default CellHeaderAuxColumns;
