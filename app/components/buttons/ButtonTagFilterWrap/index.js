import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text } from 'grommet';
import { FormClose } from 'grommet-icons';

import Dot from 'components/styled/Dot';
import PrintHide from 'components/styled/PrintHide';
import { usePrint } from 'containers/App/PrintContext';
import ButtonTagFilterInverse from '../ButtonTagFilterInverse';


function ButtonTagFilterWrap({
  filter,
  label,
  labelLong,
  onClick,
  showConnectedAttributes = true,
  // level = 1,
}) {
  const isPrintView = usePrint();
  if (!filter) return null;
  let title = labelLong || label;
  const hasOnClick = onClick || filter.onClick;
  if (hasOnClick) {
    title = `Remove filter: ${title}`;
  }
  if (filter.connectedAttributes) {
    title = filter.connectedAttributes.reduce(
      (memo, att, i) => `${memo}${i !== 0 ? ',' : ''} "${att.label || att.value}"`,
      `${title} >`,
    );
  }
  return (
    <ButtonTagFilterInverse
      isPrint={isPrintView}
      onClick={onClick || filter.onClick}
      disabled={!hasOnClick}
      title={title}
    >
      <Box direction="row" gap="xsmall" align="center">
        {filter.dot && (
          <Dot color={filter.dot} />
        )}
        <Text size="small">
          {label}
        </Text>
        {showConnectedAttributes && filter.connectedAttributes && (
          <Box direction="row" gap="hair" align="center">
            {filter.connectedAttributes.map(
              (att) => (
                <Dot key={att.value} color={att.color} />
              )
            )}
          </Box>
        )}
        {hasOnClick && (
          <PrintHide>
            <FormClose size="xsmall" color="inherit" />
          </PrintHide>
        )}
      </Box>
    </ButtonTagFilterInverse>
  );
}

ButtonTagFilterWrap.propTypes = {
  onClick: PropTypes.func,
  filter: PropTypes.object,
  labelLong: PropTypes.string,
  label: PropTypes.string,
  showConnectedAttributes: PropTypes.bool,
  // level: PropTypes.number,
};

export default ButtonTagFilterWrap;
