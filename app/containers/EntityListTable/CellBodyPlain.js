import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text } from 'grommet';
import styled from 'styled-components';

const LabelWrap = styled((p) => <Box direction="row" gap="xsmall" align="center" {...p} />)``;
const Dot = styled.div`
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 99999px;
  background: ${({ color }) => color || 'red'};
`;


export function CellBodyPlain({
  entity,
  column = {},
}) {
  const { value, color } = entity;
  const { align = 'start', primary } = column;
  return (
    <Box>
      {color && (
        <LabelWrap>
          <Dot color={color} />
          <Text size="small" weight={500} wordBreak="keep-all">
            {value}
          </Text>
        </LabelWrap>
      )}
      {!color && (
        <Text size="xsmall" weight={primary ? 500 : 300} wordBreak="keep-all" textAlign={align}>
          {value}
        </Text>
      )}
    </Box>
  );
}

CellBodyPlain.propTypes = {
  entity: PropTypes.object,
  column: PropTypes.object,
};

export default CellBodyPlain;
