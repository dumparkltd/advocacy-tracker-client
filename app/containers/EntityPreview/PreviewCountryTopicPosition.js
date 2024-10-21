import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import { Box, Text, Heading } from 'grommet';

import { ACTION_INDICATOR_SUPPORTLEVELS } from 'themes/config';

import Dot from 'components/styled/Dot';
import messages from './messages';
const SectionTitle = styled((p) => <Text size="xsmall" {...p} />)`
  text-transform: uppercase;
  font-weight: bold;
`;
const TopicTitle = styled((p) => <Heading level="4" {...p} />)`
  font-family: ${({ theme }) => theme.fonts.title};
  font-size: 34px;
  font-weight: normal;
  margin: 0px;
`;
const SupportLevelTitle = styled((p) => <Text size="xsmall" {...p} />)`
  text-transform: uppercase;
  text-align center;
  font-weight: bold;
`;
const LevelOfAuthorityLabel = styled((p) => <Text size="xsmall" {...p} />)`
  text-align center;
`;
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
          <SectionTitle>
            <FormattedMessage {...messages.countryTopicPosition.sectionTitle} />
          </SectionTitle>
        </Box>
        {topic && (
          <Box>
            <TopicTitle>{topic.title}</TopicTitle>
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
          <Box align="center" gap="xsmall" flex={{ shrink: 0 }}>
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
              <SupportLevelTitle>{position.supportlevelTitle}</SupportLevelTitle>
            </Box>
            <Box>
              {position.levelOfAuthority && (
                <LevelOfAuthorityLabel>{position.levelOfAuthority}</LevelOfAuthorityLabel>
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
