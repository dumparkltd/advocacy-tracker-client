/**
 *
 * FilterDropdown
 *
 */

import React, { useState, forwardRef, useRef } from 'react';
import PropTypes from 'prop-types';
import { palette } from 'styled-theme';
import styled from 'styled-components';
import PrintHide from 'components/styled/PrintHide';
import { injectIntl, intlShape } from 'react-intl';

import {
  Box, Drop, Text, ResponsiveContext, Layer,
} from 'grommet';

import { isMinSize } from 'utils/responsive';

import Icon from 'components/Icon';

import Button from 'components/buttons/ButtonSimple';

import { truncateText } from 'utils/string';
import DropdownSelect from './DropdownSelect';
import { getOptionLabel } from './Option';

const Styled = styled((p) => <Box {...p} />)`
  position: relative;
`;

// eslint-disable-next-line react/no-multi-comp
const DropButton = styled(forwardRef(
  (p, ref) => <Button {...p} ref={ref} />
))`
  background-color:  ${({ type }) => {
    if (type === 'quickFilters') {
      return 'white';
    }
    return palette('light', 1);
  }};
  color: ${palette('dark', 2)};
  border: 1px solid ${palette('light', 3)};
  height: ${({ small }) => small ? 35 : 45}px;
  border-radius: ${({ type }) => {
    if (type === 'quickFilters') {
      return '10px';
    }
    return '999px';
  }};
  position: relative;
`;
const ActiveButton = styled((p) => <Button {...p} />)`
  background-color: ${({ theme }) => theme.global.colors.highlight};
  color: white;
  border: 1px solid ${palette('light', 3)};
  min-height: 45px;
  min-width: 200px;
  border-radius: ${({ type }) => {
    if (type === 'quickFilters') {
      return '10px';
    }
    return '999px';
  }};
  position: relative;
  &:hover {
    background-color: ${({ theme }) => theme.global.colors.highlightHover};
  }
`;

const Label = styled(
  (p) => <Text {...p} color="textSecondary" size="xxsmall" />
)`
  line-height: 24px
`;
const ButtonLabel = styled.span`
  color: ${palette('dark', 1)};
  opacity: 0.5;
  font-size: ${({ theme }) => theme.text.small.size};
`;
const ButtonLabelActive = styled.span`
  color: white;
  font-size: ${({ theme }) => theme.text.small.size};
`;
// const DropDown = styled.div`
//   display: none;
//   background: white;
//   box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.2);
//   z-index: 999;
//   margin-top: 6px;
//   @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
//     position: absolute;
//     left: 3px;
//     top: 100%;
//     display: block;
//   }
// `;

export function FilterDropdown({
  options,
  onSelect,
  label,
  buttonLabel,
  onClear,
  type,
  hasSearch = true,
  intl,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropButtonRef = useRef(null);

  const activeOption = options.find((o) => o.checked);
  const size = React.useContext(ResponsiveContext);

  const activeOptionLabel = activeOption && getOptionLabel(activeOption, intl);
  return (
    <Styled>
      <Label>{label}</Label>
      {!activeOption && (
        <DropButton
          onClick={() => setDropdownOpen(!dropdownOpen)}
          ref={dropButtonRef}
          type={type}
        >
          <Box
            direction="row"
            gap="medium"
            align="center"
            justify="between"
            pad={{ left: 'small', right: 'xsmall' }}
          >
            <Box
              direction="row"
              gap="small"
              align="center"
              justify="between"
            >
              {type !== 'quickFilters' && (
                <Icon
                  size="24px"
                  name="filter"
                  palette="dark"
                  paletteIndex={3}
                />
              )}
              <ButtonLabel>{buttonLabel}</ButtonLabel>
            </Box>
            {!dropdownOpen && (
              <Icon
                size="24px"
                name="dropdownOpen"
                palette="dark"
                paletteIndex={3}
                align="center"
              />
            )}
            {dropdownOpen && (
              <Icon
                size="24px"
                name="dropdownClose"
                palette="dark"
                paletteIndex={3}
                align="center"
              />
            )}
          </Box>
        </DropButton>
      )}
      {activeOption && (
        <ActiveButton
          type={type}
          onClick={() => {
            if (onClear) {
              console.log(activeOption)
              onClear(activeOption.value, activeOption.query);
            } else {
              onSelect(null);
            }
          }}
        >
          <Box
            direction="row"
            gap="small"
            align="center"
            justify="between"
            pad={{ left: 'small', right: 'xsmall' }}
          >
            <ButtonLabelActive>
              {activeOptionLabel ? truncateText(activeOptionLabel, 20) : 'undefined'}
            </ButtonLabelActive>
            <Icon
              size="24px"
              name="close"
              align="center"
            />
          </Box>
        </ActiveButton>
      )}
      {!activeOption && dropdownOpen && dropButtonRef && isMinSize(size, 'ms') && (
        <PrintHide>
          <Drop
            align={{ top: 'bottom', left: 'left' }}
            target={dropButtonRef.current}
            onClickOutside={() => setDropdownOpen(false)}
            plain
            margin={{ top: 'xxsmall' }}
          >
            <DropdownSelect
              options={options}
              hasSearch={hasSearch}
              onSelect={({ value, query }) => {
                setDropdownOpen(false);
                onSelect(value, query);
              }}
            />
          </Drop>
        </PrintHide>
      )}
      {!activeOption && dropdownOpen && dropButtonRef && !isMinSize(size, 'ms') && (
        <PrintHide>
          <Layer
            full
            responsive
            onClickOutside={() => setDropdownOpen(false)}
            onEsc={() => setDropdownOpen(false)}
            animation={false}
            style={{ overflowY: 'auto', borderRadius: '0' }}
          >
            <DropdownSelect
              full
              hasSearch={hasSearch}
              options={options}
              onSelect={({ value, query }) => {
                setDropdownOpen(false);
                onSelect(value, query);
              }}
            />
          </Layer>
        </PrintHide>
      )}
    </Styled>
  );
}

FilterDropdown.propTypes = {
  label: PropTypes.string,
  buttonLabel: PropTypes.string,
  type: PropTypes.string,
  options: PropTypes.array,
  onSelect: PropTypes.func,
  onClear: PropTypes.func,
  hasSearch: PropTypes.bool,
  intl: intlShape,
};

export default injectIntl(FilterDropdown);
