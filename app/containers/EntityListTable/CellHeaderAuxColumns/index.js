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
export function CellHeaderAuxColumns({ column, columnOptions, onUpdate }) {
  const [changedToHidden, setChangedToHidden] = useState([]);
  const [changedToVisible, setChangedToVisible] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const size = React.useContext(ResponsiveContext);
  // console.log(columnOptions && columnOptions.toJS())
  // console.log('CellHeaderAuxColumns', column, columnOptions);
  // const areAllColumnsSelected = updatedColumnOptions.filter((option) => option.hidden).length === 0;
  const changedColumns = [...changedToVisible, ...changedToHidden];
  const updatedColumnOptions = columnOptions.map((col) => {
    const checkedInitially = !col.hidden;
    const changed = changedColumns.indexOf(col.id) > -1;
    const checked = ((checkedInitially && !changed) || (!checkedInitially && changed));
    return ({
      ...col,
      changed,
      checked,
    });
  });
  const { align = 'start' } = column;
  const hasChanges = changedColumns.length > 0;
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
                    setChangedToVisible([]);
                    setChangedToHidden([]);
                  }}
                />
              </HeaderInDrop>
              <BodyInDrop>
                <DropBody
                  options={updatedColumnOptions}
                  onUpdate={(columnIds, checked) => {
                    let hidden = [...changedToHidden];
                    let visible = [...changedToVisible];
                    asArray(columnIds).forEach((columnId) => {
                      if (checked) {
                        // remove from unchecked list if checking again enabled (back to original)
                        if (hidden.indexOf(columnId) > -1) {
                          hidden = hidden.filter((id) => id !== columnId);
                        // add to checked list if not previously unchecked
                        } else {
                          visible = [...visible, columnId];
                        }
                      }
                      if (!checked) {
                        if (visible.indexOf(columnId) > -1) {
                          visible = visible.filter((id) => id !== columnId);
                        } else {
                          hidden = [...hidden, columnId];
                        }
                      }
                    });
                    setChangedToHidden(hidden);
                    setChangedToVisible(visible);
                  }}
                />
              </BodyInDrop>
              <FooterInDrop>
                <DropFooter
                  onCancel={() => {
                    setOpen(false);
                    setChangedToVisible([]);
                    setChangedToHidden([]);
                  }}
                  onConfirm={hasChanges
                    ? () => {
                      setOpen(false);
                      onUpdate(updatedColumnOptions);
                    }
                    : null
                  }
                />
              </FooterInDrop>
            </DropContent>
          </Drop>
        )}
      </BoxPrint>
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
  column: PropTypes.object,
  columnOptions: PropTypes.array,
  onUpdate: PropTypes.func,
};

export default CellHeaderAuxColumns;
