import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Box, Text } from 'grommet';
import InfoOverlay from 'components/InfoOverlay';

import { usePrint } from 'containers/App/PrintContext';

const Styled = styled((p) => <Box direction="row" align="center" gap="small" {...p} />)`
  padding: ${({ plain }) => plain ? 0 : 5}px 0;
  display: ${({ isPrint, active, printHide }) => (isPrint && (!active || printHide)) ? 'none' : 'flex'};
  pointer-events: ${({ isPrint }) => isPrint ? 'none' : 'all'};
  @media print {
    display: ${({ active, printHide }) => (active && !printHide) ? 'flex' : 'none'};
  }
`;

export function MapOption({
  option,
  type = 'option',
  plain,
}) {
  const {
    active, onClick, label, id = 0, info, printHide,
  } = option;
  const optionType = option.type || type;
  const isPrint = usePrint();
  return (
    <Styled plain={plain} isPrint={isPrint} printHide={printHide}>
      <input
        id={`map-${optionType}-${id}`}
        type="checkbox"
        checked={active}
        onChange={onClick}
      />
      <Text as="label" htmlFor={`map-${optionType}-${id}`} size="xsmall">
        {label}
        {info && (
          <InfoOverlay
            content={(
              <Box
                pad="small"
                margin="xsmall"
                background="white"
                elevation="small"
                overflow={{
                  vertical: 'auto',
                  horizontal: 'hidden',
                }}
              >
                <Text size="small">{info}</Text>
              </Box>
            )}
            inline
            padButton={{ horizontal: 'xsmall' }}
            tooltip
            icon="question"
          />
        )}
      </Text>
    </Styled>
  );
}

MapOption.propTypes = {
  option: PropTypes.object,
  type: PropTypes.string,
  plain: PropTypes.bool,
};

export default MapOption;
