import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import {
  Box,
  Text,
  ResponsiveContext,
} from 'grommet';

import { isMinSize } from 'utils/responsive';

import CheckboxOption from 'components/CheckboxOption';

import Button from 'components/buttons/ButtonSimple';
import Dot from 'components/styled/Dot';

import messages from './messages';

const SupportTagsTitle = styled((p) => <Text size="xsmall" {...p} />)`
  color: black;
  font-weight: 600;
`;
const Hint = styled((p) => <Text size="xxsmall" {...p} />)`
  color: ${palette('dark', 4)};
  font-weight: 300;
  font-style: italic;
`;
const TagButton = styled((p) => <Button {...p} />)`
  color: ${({ selected }) => selected ? 'white' : 'black'};
  background: ${({ selected }) => selected ? palette('primary', 1) : 'transparent'};
  border: 1px solid ${({ selected }) => selected ? palette('primary', 1) : palette('light', 4)};
  border-radius: 9999px;
  padding: 3px 8px 3px 5px;
  margin-bottom: 4px;
  margin-right: 4px;
  &:last-child {
    margin-right: 0;
  }
  &:hover {
    border: 1px solid ${({ selected, disabled }) => {
      if (disabled) return selected ? palette('primary', 1) : palette('light', 4);
      return selected ? palette('primary', 0) : palette('dark', 3)}};
  }
`;
const ResetSupportTagsButton = styled((p) => <Button {...p} />)`
  color: ${palette('primary', 1)};
  font-family: ${({ theme }) => theme.fonts.title};
  text-transform: uppercase;
  font-weight: 500;
  &:hover {
    color: ${palette('primary', 0)};
  }
`;
const ResetSupport = styled((p) => <Box margin={{ bottom: 'small' }} {...p} />)`
  position: absolute;
  right: 0;
  bottom: 100%;
`;
// gap={{ row: 'small', column: 'xsmall' }}
// const actives = supportLevels
//   && supportLevels.filter((level) => level.active);
// console.log(actives)
const ComponentOptions = ({
  onUpdateQuery,
  supportLevels,
  options,
}) => {
  const size = React.useContext(ResponsiveContext);
  return (
    <Box gap="small" margin={{ vertical: 'small' }} responsive={false}>
      <Box gap="9px" responsive={false}>
        <Box
          direction={isMinSize(size, 'medium') ? 'row' : 'column'}
          align={isMinSize(size, 'medium') ? 'center' : 'start'}
          justify="start"
          gap={isMinSize(size, 'medium') ? 'small' : 'xsmall'}
          responsive={false}
        >
          <SupportTagsTitle>
            <FormattedMessage {...messages.supportLevelTitle} />
          </SupportTagsTitle>
          <Hint>
            <FormattedMessage {...messages.supportLevelHint} />
          </Hint>
        </Box>
        <Box
          wrap
          direction="row"
          alignSelf="start"
          style={{ position: 'relative' }}
        >
          {supportLevels && supportLevels.map(
            ({ value, active, disabled, color, label }) => (
              <TagButton
                key={value}
                selected={active}
                disabled={disabled && !active}
                onClick={() => (disabled && !active) || onUpdateQuery([{
                  arg: 'support',
                  value: value,
                  add: !active ? value : false,
                  remove: active ? value : false,
                  replace: false,
                  multipleAttributeValues: true,
                }])}
              >
                <Box direction="row" align="center" gap="xsmall">
                  <Dot size="18px" color={color} />
                  <Text
                    size={isMinSize(size, 'medium') ? 'xsmall' : 'xxsmall'}
                    style={{ opacity: (disabled && !active) ? 0.66 : 1}}
                  >
                    {label}
                  </Text>
                </Box>
              </TagButton>
            )
          )}
          {supportLevels.find((level) => level.active) && (
            <ResetSupport>
              <ResetSupportTagsButton
                onClick={() => onUpdateQuery([{
                  arg: 'support',
                  value: null,
                  replace: true,
                }])}
              >
                <FormattedMessage {...messages.reset} />
              </ResetSupportTagsButton>
            </ResetSupport>
          )}
        </Box>
      </Box>
      {options && (
        <Box gap="xxsmall" responsive={false}>
          <SupportTagsTitle>
            Statement options
          </SupportTagsTitle>
          <Box
            direction={isMinSize(size, 'medium') ? 'row' : 'column'}
            gap={isMinSize(size, 'medium') ? 'medium' : 'none'}
            flex={{ grow: 0 }}
            fill={false}
            alignSelf="start"
          >
            {options.map((option) => (
              <CheckboxOption
                key={option.id}
                option={option}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

ComponentOptions.propTypes = {
  supportLevels: PropTypes.array,
  options: PropTypes.array,
  onUpdateQuery: PropTypes.func,
};
export default ComponentOptions;
