import React from 'react';
import PropTypes from 'prop-types';

import { Box, Text } from 'grommet';
import WarningDot from './WarningDot';

export function BlockedMessages({
  hasAnyEmptyRequired,
  hasAnyUnseenAutofill,
  hasAnyErrors,
  hasNoChanges,
}) {
  const hideNoChangesHint = hasAnyEmptyRequired || hasAnyUnseenAutofill || hasAnyErrors;
  return (
    <Box pad="small" gap="xsmall" style={{ maxWidth: '300px' }}>
      <Box>
        <Text size="xxsmall" weight={500}>
          Saving is blocked:
        </Text>
      </Box>
      {hasNoChanges && !hideNoChangesHint && (
        <Box direction="row" gap="xsmall" align="center">
          <Box flex={{ shrink: 0 }}>
            <WarningDot type="info" />
          </Box>
          <Text size="xxxsmall">
            There are no changes to save
          </Text>
        </Box>
      )}
      {hasAnyErrors && (
        <Box direction="row" gap="xsmall" align="center">
          <Box flex={{ shrink: 0 }}>
            <WarningDot type="error" />
          </Box>
          <Text size="xxxsmall">
            There are some validation errors
          </Text>
        </Box>
      )}
      {hasAnyEmptyRequired && (
        <Box direction="row" gap="xsmall" align="center">
          <Box flex={{ shrink: 0 }}>
            <WarningDot type="required" />
          </Box>
          <Text size="xxxsmall">
            There are required fields that are empty
          </Text>
        </Box>
      )}
      {hasAnyUnseenAutofill && (
        <Box direction="row" gap="xsmall" align="center">
          <Box flex={{ shrink: 0 }}>
            <WarningDot type="autofill" />
          </Box>
          <Text size="xxxsmall">
            There are pre-populated fields on form steps that have not been viewed
          </Text>
        </Box>
      )}
    </Box>
  );
}

BlockedMessages.propTypes = {
  hasAnyEmptyRequired: PropTypes.bool,
  hasAnyUnseenAutofill: PropTypes.bool,
  hasAnyErrors: PropTypes.bool,
  hasNoChanges: PropTypes.bool,
};

export default BlockedMessages;
