import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

import styled from 'styled-components';
import { palette } from 'styled-theme';

import {
  Box, Button, Text, Heading,
} from 'grommet';

import MapOption from 'containers/MapContainer/MapInfoOptions/MapOption';

import Dot from 'components/styled/Dot';

import messages from './messages';

const InputSelectWrapper = styled((p) => <Box {...p} />)``;
const SupportTagsWrapper = styled((p) => <Box {...p} />)``;
const SupportTagsSubHeaderWrapper = styled((p) => <Box {...p} />)``;
const SupportTagsTitle = styled((p) => <Heading level="5" {...p} />)`
  color: black;
  font-weight: bold;
`;
const Hint = styled((p) => <Text {...p} />)`
  color: ${palette('dark', 4)};
  font-weight: 300;
  font-style: italic;
`;
const StyledTag = styled((p) => <Button {...p} gap="5px" />)`
  color: ${({ selected }) => selected ? 'white' : 'black'};
  background: ${({ selected }) => selected ? palette('primary', 1) : 'transparent'};
  border: 1px solid ${({ selected }) => selected ? palette('primary', 1) : palette('light', 4)};
  padding: 3px 5px;
  &:hover {
    box-shadow: none;
    border: 1px solid ${({ selected }) => selected ? palette('primary', 0) : palette('dark', 3)};
  }
`;
const ResetSuportTagsButton = styled((p) => <Button plain {...p} />)`
  color: ${palette('primary', 1)};
  font-family: ${({ theme }) => theme.fonts.title};
  text-transform: uppercase;
  font-weight: 600;
  &:hover {
    color: ${palette('primary', 0)};
  }
`;
// gap={{ row: 'small', column: 'xsmall' }}
// const actives = supportLevels
//   && supportLevels.filter((level) => level.active);
// console.log(actives)
const QuickFilters = ({
  intl,
  onSetisActorMembers,
  onUpdateQuery,
  isActorMembers,
  supportLevels,
  includeInofficialStatements,
}) => (
  <Box direction="row" gap="small">
    <Box direction="column">
      <SupportTagsSubHeaderWrapper
        height="xxsmall"
        direction="row"
        gap="xsmall"
        align="center"
        justify="between"
        margin={{ vertical: 'small' }}
      >
        <Box direction="row" justify="start" gap="small">
          <SupportTagsTitle margin="none">
            <FormattedMessage {...messages.supportLevelTitle} />
          </SupportTagsTitle>
          <Hint>
            <FormattedMessage {...messages.supportLevelHint} />
          </Hint>
        </Box>
        {supportLevels.find((level) => level.active) && (
          <ResetSuportTagsButton
            onClick={() => onUpdateQuery([{
              arg: 'support',
              value: null,
              replace: true,
            }])}
          >
            <FormattedMessage {...messages.reset} />
          </ResetSuportTagsButton>
        )}
      </SupportTagsSubHeaderWrapper>
      <SupportTagsWrapper
        wrap
        direction="row"
      >
        {supportLevels && supportLevels.map((tag) => (
          <StyledTag
            key={tag.value}
            label={tag.label}
            size="small"
            selected={tag.active}
            onClick={() => onUpdateQuery([{
              arg: 'support',
              value: tag.value,
              add: !tag.active ? tag.value : false,
              remove: tag.active ? tag.value : false,
              replace: false,
              multipleAttributeValues: true,
            }])}
            icon={(<Dot size="18px" color={tag.color} />)}
          />
        ))}
      </SupportTagsWrapper>
    </Box>
    <InputSelectWrapper direction="column">
      <Box height="xxsmall" />
      <MapOption
        option={{
          id: '0',
          active: isActorMembers,
          onClick: () => onSetisActorMembers(isActorMembers ? '0' : '1'),
          label: intl.formatMessage(messages.isActorMembers),
        }}
      />
      <MapOption
        option={{
          id: '1',
          active: !includeInofficialStatements,
          label: intl.formatMessage(messages.isOfficialFiltered),
          onClick: () => onUpdateQuery([{
            arg: 'inofficial',
            value: includeInofficialStatements ? 'false' : null,
            replace: true,
            multipleAttributeValues: false,
          }]),
        }}
      />
    </InputSelectWrapper>
  </Box>
);

QuickFilters.propTypes = {
  intl: intlShape.isRequired,
  supportLevels: PropTypes.array,
  onSetisActorMembers: PropTypes.func,
  onUpdateQuery: PropTypes.func,
  isPositionIndicator: PropTypes.bool,
  isActorMembers: PropTypes.bool,
  includeInofficialStatements: PropTypes.bool,
};
export default injectIntl(QuickFilters);
