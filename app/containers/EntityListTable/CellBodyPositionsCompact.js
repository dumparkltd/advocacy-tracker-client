import React from 'react';
import PropTypes from 'prop-types';
import { Box } from 'grommet';
import CellBodyPositionsCompactSingle from './CellBodyPositionsCompactSingle';
// import Label from './LabelCellBody';

const GAP = 2.5;

export function CellBodyPositionsCompact({
  entity,
  column = {},
}) {
  const { positions } = entity;
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
      {positions && (
        <Box
          flex={{ shrink: 0 }}
          direction="row"
          gap={`${GAP}px`}
          align="middle"
          width={colWidth}
        >
          {positions.map((position) => (
            <CellBodyPositionsCompactSingle
              key={position.indicatorId}
              position={position}
              width={`${Math.floor((outerWidth - ((positions.length - 1) * GAP)) / positions.length)}px`}
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
