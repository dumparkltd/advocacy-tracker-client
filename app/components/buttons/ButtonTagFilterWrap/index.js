import React from 'react';
import PropTypes from 'prop-types';
import { Box } from 'grommet';
import { FormClose } from 'grommet-icons';

import Dot from 'components/styled/Dot';
import PrintHide from 'components/styled/PrintHide';
import TextPrint from 'components/styled/TextPrint';
import { usePrint } from 'containers/App/PrintContext';
import ButtonTagFilter from '../ButtonTagFilter';
import ButtonTagFilterInverse from '../ButtonTagFilterInverse';


function ButtonTagFilterWrap({
  filter,
  label,
  labelLong,
  onClick,
  isInverse,
  showConnectedAttributes = true,
  // level = 1,
}) {
  const isPrintView = usePrint();
  let title = labelLong || label;
  const myOnClick = isPrintView
    ? null
    : onClick || (filter && filter.onClick);
  if (myOnClick) {
    title = `Remove filter: ${title}`;
  }
  if (filter && filter.connectedAttributes) {
    title = filter.connectedAttributes.reduce(
      (memo, att, i) => `${memo}${i !== 0 ? ',' : ''} "${att.label || att.value}"`,
      `${title} >`,
    );
  }

  const ButtonTag = isPrintView || isInverse ? ButtonTagFilterInverse : ButtonTagFilter;
  return (
    <ButtonTag
      isPrint={isPrintView}
      onClick={myOnClick}
      disabled={!myOnClick}
      title={title}
    >
      <Box direction="row" gap="xsmall" align="center">
        {filter && filter.dot && (
          <Dot color={filter.dot} />
        )}
        <TextPrint size="xsmall">
          {label}
        </TextPrint>
        {showConnectedAttributes && filter && filter.connectedAttributes && (
          <Box direction="row" gap="hair" align="center">
            {filter.connectedAttributes.map(
              (att) => (
                <Dot key={att.value} color={att.color} />
              )
            )}
          </Box>
        )}
        {myOnClick && (
          <PrintHide>
            <FormClose size="xsmall" color="inherit" />
          </PrintHide>
        )}
      </Box>
    </ButtonTag>
  );
}

ButtonTagFilterWrap.propTypes = {
  onClick: PropTypes.func,
  filter: PropTypes.object,
  labelLong: PropTypes.string,
  label: PropTypes.string,
  showConnectedAttributes: PropTypes.bool,
  isInverse: PropTypes.bool,
  // level: PropTypes.number,
};

export default ButtonTagFilterWrap;
