import React from 'react';
import PropTypes from 'prop-types';
import { Box } from 'grommet';
import Dot from 'components/styled/Dot';

import Label from './LabelCellBody';

export function CellBodyPosition({
  entity,
  column = {},
}) {
  const { value, color } = entity;
  const { align = 'start', primary } = column;
  return (
    <Box flex={{ shrink: 0 }} align={align}>
      {color && (
        <Box flex={{ shrink: 0 }}>
          <Dot size="40px" color={color} title={value} />
        </Box>
      )}
      {!color && (
        <Label weight={primary ? 500 : 300} textAlign={align} title={value}>
          {value}
        </Label>
      )}
    </Box>
  );
}

CellBodyPosition.propTypes = {
  entity: PropTypes.object,
  column: PropTypes.object,
};

export default CellBodyPosition;
