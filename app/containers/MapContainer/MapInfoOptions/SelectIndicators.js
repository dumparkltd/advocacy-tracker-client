import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import {
  Text,
  Box,
  Button,
  Drop,
} from 'grommet';

import { TEXT_TRUNCATE } from 'themes/config';
import Icon from 'components/Icon';
import qe from 'utils/quasi-equals';

import { truncateText } from 'utils/string';

const SelectButton = styled(
  React.forwardRef((p, ref) => (
    <Button
      plain
      ref={ref}
      fill="horizontal"
      {...p}
    />
  ))
)`
  padding: 0px 2px;
  border-bottom: 1px solid;
  height: 30px;
`;

const OptionButton = styled((p) => <Button plain {...p} />)`
  display: block;
  width: 100%;
  padding: 4px 8px;
  text-align: left;
  background: white;
  &:hover {
    color:${palette('headerNavMainItemHover', 0)};
  }
  opacity: ${({ noneOption }) => noneOption ? 0.6 : 1};
  color: ${({ active }) => active ? palette('headerNavMainItem', 1) : 'inherit'};
`;

const SelectText = styled((p) => <Text {...p} />)`
  opacity: ${({ noneOption }) => noneOption ? 0.5 : 1}
`;
const Reset = styled((p) => <Button plain {...p} />)`
  text-align: center;
  width: 25px;
`;
const ResetPlaceholder = styled((p) => <Box {...p} />)`
  width: 25px;
`;

export function SelectIndicators({ config }) {
  const {
    onUpdateFFIndicator,
    ffActiveOptionId,
    ffOptions,
  } = config;
  const [showOptions, setShowOptions] = useState(false);
  const buttonRef = useRef();
  const activeOption = ffOptions.find(
    (o) => qe(o.value, ffActiveOptionId || '0')
  );
  if (!activeOption) return null;
  const isNoneOption = qe(ffActiveOptionId, '0');
  return (
    <Box fill="horizontal" direction="row" align="center">
      <Box flex={{ grow: 1 }}>
        <SelectButton
          ref={buttonRef}
          plain
          fill="horizontal"
          onClick={() => setShowOptions(!showOptions)}
        >
          <Box direction="row" justify="between" align="center">
            <SelectText size="large" noneOption={qe(activeOption.value, '0')}>
              {truncateText(
                activeOption.label,
                TEXT_TRUNCATE.FF_SELECT,
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
      </Box>
      <Box flex={{ shrink: 0 }} pad={{ left: 'ms' }}>
        {!isNoneOption && (
          <Reset onClick={() => onUpdateFFIndicator()}>
            <Icon name="removeSmall" text hidePrint />
          </Reset>
        )}
        {isNoneOption && (
          <ResetPlaceholder />
        )}
      </Box>
      {showOptions && (
        <Drop
          target={buttonRef.current}
          stretch
          align={{ bottom: 'top', left: 'left' }}
          onClickOutside={() => setShowOptions(false)}
        >
          <Box pad={{ vertical: 'xsmall' }}>
            {ffOptions
              && ffOptions.filter(
                (o) => !qe(o.value, '0')
              ).map(
                (o) => (
                  <Box key={o.value} flex={{ shrink: 0 }}>
                    <OptionButton
                      active={qe(o.value, ffActiveOptionId)}
                      onClick={() => {
                        setShowOptions(false);
                        onUpdateFFIndicator(o.value);
                      }}
                    >
                      <Text>
                        {truncateText(
                          o.label,
                          TEXT_TRUNCATE.FF_SELECT_OPTION,
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
