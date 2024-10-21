import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box } from 'grommet';
import ButtonFlatIconOnly from 'components/buttons/ButtonFlatIconOnly';
import BoxPrint from 'components/styled/BoxPrint';

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

export function CellHeaderAuxColumns({ column, columnOptions }) {
  console.log('CellHeaderAuxColumns', column, columnOptions)
  const { align = 'start' } = column;
  return (
    <Box direction="row" align="center" justify={align}>
      <BoxPrint printHide>
        <AuxButton
          onClick={() => {
            console.log('click');
          }}
        >
          <Box gap="2px" justify="center" fill="horizontal">
            <Dot />
            <Dot />
            <Dot />
          </Box>
        </AuxButton>
      </BoxPrint>
    </Box>
  );
}

CellHeaderAuxColumns.propTypes = {
  column: PropTypes.object,
  columnOptions: PropTypes.array,
};

export default CellHeaderAuxColumns;
