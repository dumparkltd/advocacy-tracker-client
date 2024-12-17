import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  Box, ResponsiveContext, Drop, Layer,
} from 'grommet';
import ButtonFlatIconOnly from 'components/buttons/ButtonFlatIconOnly';
import BoxPrint from 'components/styled/BoxPrint';

import { isMinSize } from 'utils/responsive';
import DropContent from './DropContent';

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
          <DropContent
            onClose={() => setOpen(false)}
            onUpdate={onUpdate}
            columnOptions={columnOptions}
          />
        </Drop>
      )}
      {open && !isMinSize(size, 'medium') && (
        <Layer
          full
          responsive
          onClickOutside={() => setOpen(false)}
          onEsc={() => setOpen(false)}
          animation={false}
          style={{ overflowY: 'auto', borderRadius: '0' }}
        >
          <DropContent
            onClose={() => setOpen(false)}
            onUpdate={onUpdate}
            columnOptions={columnOptions}
          />
        </Layer>
      )}
    </Styled>
  );
}
// responsive support


CellHeaderAuxColumns.propTypes = {
  columnOptions: PropTypes.array,
  onUpdate: PropTypes.func,
};

export default CellHeaderAuxColumns;
