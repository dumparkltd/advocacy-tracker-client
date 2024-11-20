import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import { Box, Text, Heading } from 'grommet';

import { ACTION_INDICATOR_SUPPORTLEVELS } from 'themes/config';
import MapOption from 'containers/MapContainer/MapInfoOptions/MapOption';
import A from 'components/styled/A';
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
  font-weight: bold;
`;
const LevelOfAuthorityLabel = styled((p) => <Text size="xsmall" {...p} />)``;

const TitleLink = styled(A)`
  color: black;
  &:hover {
    text-decoration: underline;
  }
`;

export function PreviewCountryTopicPosition({ content, onUpdatePath }) {
  const { topic, position, options } = content.toJS();
  return (
    <Box
      align="start"
      gap="large"
      responsive={false}
      flex={{ shrink: 0 }}
      fill="horizontal"
    >
      <Box gap="small">
        <Box>
          <SectionTitle>
            <FormattedMessage {...messages.countryTopicPosition.sectionTitle} />
          </SectionTitle>
        </Box>
        <Box>
          {topic && !topic.titlePath && (
            <TopicTitle>{topic.title}</TopicTitle>
          )}
          {topic && topic.titlePath && (
            <TitleLink
              href={topic.titlePath}
              title={topic.title}
              onClick={(e) => {
                if (e && e.preventDefault) e.preventDefault();
                onUpdatePath(topic.titlePath);
              }}
            >
              <TopicTitle>{topic.title}</TopicTitle>
            </TitleLink>
          )}
        </Box>
      </Box>
      <Box direction="row" align="start" fill="horizontal">
        <Box basis="1/2">
          {position && (
            <Box direction="row" gap="small" align="center" pad={{ left: '20px' }}>
              <Box>
                <Dot
                  size="60px"
                  color={
                    ACTION_INDICATOR_SUPPORTLEVELS[position.supportlevelId || 0]
                    && ACTION_INDICATOR_SUPPORTLEVELS[position.supportlevelId || 0].color
                  }
                />
              </Box>
              <Box align="start">
                <Box>
                  <SupportLevelTitle>{position.supportlevelTitle}</SupportLevelTitle>
                </Box>
                {position.levelOfAuthority && (
                  <Box>
                    <LevelOfAuthorityLabel>{position.levelOfAuthority}</LevelOfAuthorityLabel>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>
        <Box basis="1/2">
          {options && options.map((option) => (
            <MapOption
              key={option.id}
              option={option}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

PreviewCountryTopicPosition.propTypes = {
  content: PropTypes.object,
  onUpdatePath: PropTypes.func,
};
export default PreviewCountryTopicPosition;
