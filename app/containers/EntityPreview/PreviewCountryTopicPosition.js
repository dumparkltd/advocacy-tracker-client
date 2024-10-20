import React from 'react';
import PropTypes from 'prop-types';
// import styled from 'styled-components';
import { Box, Text, Heading } from 'grommet';

import { ACTION_INDICATOR_SUPPORTLEVELS } from 'themes/config';

import Dot from 'components/styled/Dot';

export function PreviewCountryTopicPosition({ content }) {
  const { topic, position } = content;
  return (
    <Box
      direction="row"
      justify="between"
      align="start"
      gap="medium"
      responsive={false}
      flex={{ shrink: 0 }}
    >
      <Box gap="small">
        <Box>
          <Text>Country position for</Text>
        </Box>
        {topic && (
          <Box>
            <Heading level="5" style={{ margin: 0 }}>{topic.title}</Heading>
          </Box>
        )}
        <Box>
          {topic && topic.viaGroup && (
            <Text>{`From group: ${topic.viaGroup}`}</Text>
          )}
          {topic && !topic.viaGroup && (
            <Text>&nbsp;</Text>
          )}
        </Box>
      </Box>
      <Box>
        {position && (
          <Box align="center" gap="small" flex={{ shrink: 0 }}>
            <Box>
              <Dot
                size="60px"
                color={
                  ACTION_INDICATOR_SUPPORTLEVELS[position.supportlevelId || 0]
                  && ACTION_INDICATOR_SUPPORTLEVELS[position.supportlevelId || 0].color
                }
              />
            </Box>
            <Box>
              <Text textAlign="center">{position.supportlevelTitle}</Text>
            </Box>
            <Box>
              {position.levelOfAuthority && (
                <Text textAlign="center">{position.levelOfAuthority}</Text>
              )}
              {!position.levelOfAuthority && (
                <Text textAlign="center">&nbsp;</Text>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

PreviewCountryTopicPosition.propTypes = {
  content: PropTypes.object,
};
export default PreviewCountryTopicPosition;
