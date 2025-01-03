import React from 'react';
import PropTypes from 'prop-types';
import { Box } from 'grommet';
import CellBodyPositionsCompactSingle from './CellBodyPositionsCompactSingle';
// import Label from './LabelCellBody';


export function CellBodyPositionsCompact({
  entity,
  column = {},
  onEntityClick,
}) {
  const { positions, mainEntity } = entity;
  const { align = 'start', colWidth } = column;
  const refOuter = React.useRef(null);

  // figure out width
  let outerWidth = (refOuter && refOuter.current)
    // then calculate based on actual inner cell width
    ? outerWidth = refOuter.current.getBoundingClientRect().width
    // first estimate from specified col width (outer cell width incl padding of ~12)
    : parseInt(colWidth, 10) - 12;

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
          align="middle"
          width={colWidth}
        >
          {positions.map((position) => (
            <CellBodyPositionsCompactSingle
              key={position.indicatorId}
              position={position}
              width={`${Math.floor(outerWidth / positions.length)}px`}
              mainEntity={mainEntity}
              onEntityClick={onEntityClick}
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
  onEntityClick: PropTypes.func,
};

export default CellBodyPositionsCompact;
