import React from 'react';
import PropTypes from 'prop-types';
import { Box } from 'grommet';
import Dot from 'components/styled/Dot';

// import Label from './LabelCellBody';

const GAP = 2.5;

export function CellBodyPositionsCompact({
  entity,
  column = {},
}) {
  const { levels } = entity;
  const { align = 'start', colWidth } = column;
  const refOuter = React.useRef(null);

  // estimate from specified col width (outer cell width incl padding of ~12)
  let outerWidth = parseInt(colWidth, 10) - 12;
  // calculate based on actual inner cell width
  if (refOuter && refOuter.current) {
    outerWidth = refOuter.current.getBoundingClientRect().width;
  }
  return (
    <Box
      ref={refOuter}
      flex={{ shrink: 0 }}
      align={align}
    >
      {levels && (
        <Box
          flex={{ shrink: 0 }}
          direction="row"
          gap={`${GAP}px`}
          align="middle"
          width={colWidth}
        >
          {levels.map((level, key) => (
            <Dot
              key={key}
              size="32px"
              width={`${Math.floor((outerWidth - ((levels.length - 1) * GAP)) / levels.length)}px`}
              color={level.color}
              title={level.value}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

CellBodyPositionsCompact.propTypes = {
  entity: PropTypes.object,
  column: PropTypes.object,
};

export default CellBodyPositionsCompact;
