import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { qe } from 'utils/quasi-equals';

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

const QuickFilters = ({
  intl,
  onSetisActorMembers,
  onUpdateQuery,
  isActorMembers,
  supportLevels,
  includeInofficialStatements,
  activeSupportLevels,
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
        {activeSupportLevels
        && (
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
        gap={{ row: 'small', column: 'xsmall' }}
      >
        {supportLevels && supportLevels.map((tag) => {
          const isSelected = activeSupportLevels
            && activeSupportLevels.find((level) => qe(level, tag.value));
          return (
            <StyledTag
              key={tag.value}
              label={tag.label}
              size="small"
              selected={isSelected}
              onClick={() => onUpdateQuery([{
                arg: 'support',
                value: tag.value,
                add: !isSelected ? tag.value : false,
                remove: isSelected ? tag.value : false,
                replace: false,
                multipleAttributeValues: true,
              }])}
              icon={(<Dot size="18px" color={tag.color} />)}
            />
          );
        })}
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
  activeSupportLevels: PropTypes.object,
  onSetisActorMembers: PropTypes.func,
  onUpdateQuery: PropTypes.func,
  isPositionIndicator: PropTypes.bool,
  isActorMembers: PropTypes.bool,
  includeInofficialStatements: PropTypes.bool,
};
export default injectIntl(QuickFilters);
