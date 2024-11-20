import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text } from 'grommet';
// import styled from 'styled-components';
import Dot from 'components/styled/Dot';

// const LabelWrap = styled((p) => (
//   <Box
//     direction="column"
//     gap="xsmall"
//     align="start"
//     {...p}
//   />
// ))``;

export function CellBodyPosition({
  entity,
  column = {},
}) {
  const { value, color } = entity;
  const { align = 'start', primary } = column;
  return (
    <Box flex={{ shrink: 0 }} align={align}>
      {color && (
        <Dot size="40px" color={color} title={value} />
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
