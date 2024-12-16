import React from 'react';
import PropTypes from 'prop-types';
// import { Box } from 'grommet';
import Dot from 'components/styled/Dot';
// import LinkTooltip from './LinkTooltip';
// import Label from './LabelCellBody';

export function CellBodyPositionsCompactSingle({ position, width }) {
  // const [showContent, setShowContent] = React.useState(false);
  // console.log(position)
  return (
    <Dot
      size="32px"
      width={width}
      color={position.color}
      title={position.supportlevelId}
    />
  );
}

CellBodyPositionsCompactSingle.propTypes = {
  position: PropTypes.object,
  width: PropTypes.string, // eg 12px
  // column: PropTypes.object,
};

export default CellBodyPositionsCompactSingle;
