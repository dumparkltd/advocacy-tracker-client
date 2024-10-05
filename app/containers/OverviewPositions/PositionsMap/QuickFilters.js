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

const MapOptionsWrapper = styled((p) => <Box {...p} />)``;
const TagWrapper = styled((p) => <Box {...p} />)``;
const SupportLevelTitleWrapper = styled((p) => <Box {...p} />)``;
const SupportLevelTitle = styled((p) => <Heading level="4" {...p} />)`
  color: black;
  font-weight: bold;
`;
const Hint = styled((p) => <Text {...p} />)`
  color: ${palette('dark', 4)};
  font-weight: 300;
  font-style: italic;
`;
const StyledTag = styled((p) => <Button {...p} />)`
  color: ${({ selected }) => selected ? 'white' : 'black'};
  background: ${({ selected }) => selected ? palette('primary', 1) : 'transparent'};
  border: 1px solid ${palette('light', 4)};
`;
const ResetLevelsButton = styled((p) => <Button plain {...p} />)`
  color: ${palette('primary', 1)};
  font-family: ${({ theme }) => theme.fonts.title};
  text-transform: uppercase;
  font-weight: 600;
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
  <Box direction="column">
    <SupportLevelTitleWrapper
      direction="row"
      gap="small"
      align="center"
      margin={{ vertical: 'small' }}
    >
      <SupportLevelTitle margin="none">
        <FormattedMessage {...messages.supportLevelTitle} />
      </SupportLevelTitle>
      <Hint>
        <FormattedMessage {...messages.supportLevelHint} />
      </Hint>
      {activeSupportLevels
        && (
          <ResetLevelsButton
            onClick={() => onUpdateQuery([{
              arg: 'support',
              value: null,
              replace: true,
            }])}
          >
            <FormattedMessage {...messages.reset} />
          </ResetLevelsButton>
        )}
    </SupportLevelTitleWrapper>
    <Box direction="row">
      <TagWrapper
        wrap
        direction="row"
        gap={{ row: 'small', column: 'xsmall' }}
      >
        {supportLevels && supportLevels.map((tag) => {
          const isSelected = activeSupportLevels
            && activeSupportLevels.find((level) => qe(level, tag.value));
          return (
            <StyledTag
              pad={{ horizontal: 'xsmall', vertical: 'xsmall' }}
              key={tag.value}
              label={tag.label}
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
      </TagWrapper>
      <MapOptionsWrapper direction="column">
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
      </MapOptionsWrapper>
    </Box>
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
