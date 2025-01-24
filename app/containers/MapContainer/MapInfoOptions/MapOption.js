import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Box, Text, ResponsiveContext } from 'grommet';

import { isMinSize } from 'utils/responsive';

import InfoOverlay from 'components/InfoOverlay';

import { usePrint } from 'containers/App/PrintContext';

const Styled = styled((p) => <Box direction="row" align="center" {...p} />)`
  padding: ${({ plain }) => plain ? '0' : '5px 0 5px 5px'};
  display: ${({ isPrint, active, printHide }) => (isPrint && (!active || printHide)) ? 'none' : 'flex'};
  pointer-events: ${({ isPrint }) => isPrint ? 'none' : 'all'};
  @media print {
    display: ${({ active, printHide }) => (active && !printHide) ? 'flex' : 'none'};
  }
`;

const StyledInput = styled.input`
  margin-right: 10px;
  accent-color: black;
  transform: scale(1.3);
  cursor: pointer;
  &:hover {
    &:checked {
      opacity: 0.666;
    }
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
  const size = React.useContext(ResponsiveContext);
  return (
    <Styled plain={plain} isPrint={isPrint} printHide={printHide} flex={{ shrink: 0 }}>
      <StyledInput
        id={`map-${optionType}-${id}`}
        type="checkbox"
        checked={active}
        onChange={onClick}
      />
      <Text
        as="label"
        color="textSecondary"
        htmlFor={`map-${optionType}-${id}`}
        size={isMinSize(size, 'medium') ? 'xsmall' : 'xxsmall'}
      >
        {label}
      </Text>
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
    </Styled>
  );
}

MapOption.propTypes = {
  option: PropTypes.object,
  type: PropTypes.string,
  plain: PropTypes.bool,
};

export default MapOption;
