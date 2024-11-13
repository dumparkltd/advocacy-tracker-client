import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text } from 'grommet';
import styled from 'styled-components';
import Dot from 'components/styled/Dot';

const LabelWrap = styled((p) => (
  <Box
    direction="column"
    gap="xsmall"
    align="center"
    {...p}
  />
))``;

export function CellBodyPosition({
  entity,
  column = {},
}) {
  const { value, color } = entity;
  const { align = 'start', primary } = column;
  return (
    <Box>
      {color && (
        <LabelWrap>
          <Box flex={{ shrink: 0 }}>
            <Dot size="40px" color={color} />
          </Box>
          <Text size="xxsmall" textAlign="center" weight={primary ? 500 : 300} wordBreak="keep-all">
            {value}
          </Text>
        </LabelWrap>
      )}
      {!color && (
        <Text size="xxsmall" weight={primary ? 500 : 300} wordBreak="keep-all" textAlign={align}>
          {value}
        </Text>
      )}
    </Box>
  );
}

CellBodyPosition.propTypes = {
  entity: PropTypes.object,
  column: PropTypes.object,
};

export default CellBodyPosition;
