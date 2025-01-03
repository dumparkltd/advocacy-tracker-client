import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import {
  Text,
  Box,
  Drop,
} from 'grommet';
import Button from 'components/buttons/ButtonSimple';

import { TEXT_TRUNCATE } from 'themes/config';
import Icon from 'components/Icon';

import { truncateText } from 'utils/string';

const SelectButton = styled(
  React.forwardRef((p, ref) => (<Button ref={ref} {...p} />))
)`
  padding: 0px 2px;
  border-bottom: 1px solid;
  height: 30px;
  width: 100%
`;

const OptionButton = styled((p) => <Button {...p} />)`
  display: block;
  width: 100%;
  padding: 4px 8px;
  text-align: left;
  background: white;
  &:hover {
    color:${palette('headerNavMainItemHover', 0)};
  }
  color: ${({ active }) => active ? palette('headerNavMainItem', 1) : 'inherit'};
`;

const SelectText = styled((p) => <Text {...p} />)`
  font-size: 16px;
  line-height: 24px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    font-size: 18px;
  }
`;

export function SelectIndicators({ config }) {
  const {
    onIndicatorSelect,
    indicatorOptions,
    dropAlign,
  } = config;
  const [showOptions, setShowOptions] = useState(false);
  const buttonRef = useRef();
  const activeOption = indicatorOptions.find(
    (o) => o.active
  );
  if (!activeOption) return null;
  return (
    <Box fill="horizontal" direction="row" align="center">
      <SelectButton
        ref={buttonRef}
        onClick={() => setShowOptions(!showOptions)}
      >
        <Box direction="row" justify="between" align="center">
          <SelectText>
            {truncateText(
              activeOption.label,
              TEXT_TRUNCATE.INDICATOR_SELECT,
              false
            )}
          </SelectText>
          <Box>
            {!showOptions && (
              <Icon name="dropdownOpen" text textRight size="1em" />
            )}
            {showOptions && (
              <Icon name="dropdownClose" text textRight size="1em" />
            )}
          </Box>
        </Box>
      </SelectButton>
      {showOptions && (
        <Drop
          target={buttonRef.current}
          stretch
          align={dropAlign || { bottom: 'top', left: 'left' }}
          onClickOutside={() => setShowOptions(false)}
        >
          <Box pad={{ vertical: 'xsmall' }}>
            {indicatorOptions && indicatorOptions.map(
              (o) => (
                <Box key={o.value} flex={{ shrink: 0 }}>
                  <OptionButton
                    active={o.active}
                    isDefaultOption={o.id === 'all'}
                    onClick={() => {
                      setShowOptions(false);
                      if (o.id === 'all') {
                        onIndicatorSelect();
                      } else {
                        onIndicatorSelect(o.value);
                      }
                    }}
                  >
                    <Text>
                      {truncateText(
                        o.label,
                        TEXT_TRUNCATE.INDICATOR_SELECT_OPTION,
                        false
                      )}
                    </Text>
                  </OptionButton>
                </Box>
              )
            )}
          </Box>
        </Drop>
      )}
    </Box>
  );
}


SelectIndicators.propTypes = {
  config: PropTypes.object,
};

export default SelectIndicators;
