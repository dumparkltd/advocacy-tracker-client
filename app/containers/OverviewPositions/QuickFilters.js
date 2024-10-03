import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

import styled from 'styled-components';
import { palette } from 'styled-theme';
import {
  Box, Button, Text, Heading,
} from 'grommet';

import {
  OFFICIAL_STATEMENT_CATEGORY_ID,
} from 'themes/config';

import MapOption from 'containers/MapContainer/MapInfoOptions/MapOption';

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
  color: black;
  background: transparent;
  border: 1px solid ${palette('light', 4)};
`;
const StyledTagCircle = styled(({ color }) => (
  <svg width="20" height="20">
    <circle cx="10" cy="10" r="10" fill={color} />
  </svg>
))``;

const QuickFilters = ({
  intl,
  onSetIncludeActorMembers,
  onUpdateQuery,
  includeActorMembers,
  supportLevels,
  isOfficialFiltered,
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
    </SupportLevelTitleWrapper>
    <Box direction="row">
      <TagWrapper
        wrap
        direction="row"
        gap={{ row: 'small', column: 'small' }}
      >
        {supportLevels.map((tag) => (
          <StyledTag
            pad="xsmall"
            key={tag.value}
            label={tag.label}
            icon={<StyledTagCircle color={tag.color} />}
          />
        ))}
      </TagWrapper>
      <MapOptionsWrapper direction="column">
        <MapOption
          option={{
            active: includeActorMembers,
            onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
            label: intl.formatMessage(messages.includeActorMembers),
          }}
        />
        <MapOption
          option={{
            active: isOfficialFiltered,
            label: intl.formatMessage(messages.isOfficialFiltered),
            onClick: () => onUpdateQuery([{
              arg: 'cat',
              value: OFFICIAL_STATEMENT_CATEGORY_ID,
              add: !isOfficialFiltered,
              remove: isOfficialFiltered,
              replace: false,
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
  onSetIncludeActorMembers: PropTypes.func,
  onUpdateQuery: PropTypes.func,
  isPositionIndicator: PropTypes.bool,
  includeActorMembers: PropTypes.bool,
  isOfficialFiltered: PropTypes.bool,
};
export default injectIntl(QuickFilters);
