import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import styled from 'styled-components';
import { palette } from 'styled-theme';

import {
  Box,
  Button,
  Text,
  Heading,
  ResponsiveContext,
} from 'grommet';

import { isMinSize } from 'utils/responsive';

import MapOption from 'containers/MapContainer/MapInfoOptions/MapOption';

import Dot from 'components/styled/Dot';

import messages from './messages';

const SupportTagsTitle = styled((p) => <Heading level="5" {...p} />)`
  margin: 0;
  color: black;
  font-weight: 600;
`;
const Hint = styled((p) => <Text {...p} />)`
  color: ${palette('dark', 4)};
  font-weight: 300;
  font-style: italic;
`;
const TagButton = styled((p) => <Button plain {...p} />)`
  color: ${({ selected }) => selected ? 'white' : 'black'};
  background: ${({ selected }) => selected ? palette('primary', 1) : 'transparent'};
  border: 1px solid ${({ selected }) => selected ? palette('primary', 1) : palette('light', 4)};
  border-radius: 9999px;
  padding: 3px 8px 3px 5px;
  &:hover {
    border: 1px solid ${({ selected }) => selected ? palette('primary', 0) : palette('dark', 3)};
  }
`;
const ResetSupportTagsButton = styled((p) => <Button plain {...p} />)`
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
    <Box gap="medium" margin={{ vertical: 'small' }}>
      <Box gap="small">
        <Box
          direction={isMinSize(size, 'medium') ? 'row' : 'column'}
          align={isMinSize(size, 'medium') ? 'center' : 'start'}
          justify="start"
          gap="small"
        >
          <SupportTagsTitle margin="none">
            <FormattedMessage {...messages.supportLevelTitle} />
          </SupportTagsTitle>
          <Hint>
            <FormattedMessage {...messages.supportLevelHint} />
          </Hint>
        </Box>
        <Box
          wrap
          direction="row"
          gap="xsmall"
          alignSelf="start"
          style={{ position: 'relative' }}
        >
          {supportLevels && supportLevels.map((tag) => (
            <TagButton
              key={tag.value}
              selected={tag.active}
              onClick={() => onUpdateQuery([{
                arg: 'support',
                value: tag.value,
                add: !tag.active ? tag.value : false,
                remove: tag.active ? tag.value : false,
                replace: false,
                multipleAttributeValues: true,
              }])}
            >
              <Box direction="row" align="center" gap="xsmall">
                <Dot size="18px" color={tag.color} />
                <Text size="small">{tag.label}</Text>
              </Box>
            </TagButton>
          ))}
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
        <Box
          direction={isMinSize(size, 'medium') ? 'row' : 'column'}
          gap={isMinSize(size, 'medium') ? 'medium' : 'xsmall'}
          flex={{ grow: 0 }}
          fill={false}
          alignSelf="start"
        >
          {options.map((option) => (
            <MapOption
              key={option.id}
              option={option}
            />
          ))}
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
