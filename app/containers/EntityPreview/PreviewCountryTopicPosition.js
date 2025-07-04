import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import {
  Box,
  Text,
  Heading,
  ResponsiveContext,
} from 'grommet';

import { isMinSize } from 'utils/responsive';

import { ACTION_INDICATOR_SUPPORTLEVELS } from 'themes/config';
import CheckboxOption from 'components/CheckboxOption';
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
  const size = React.useContext(ResponsiveContext);

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
      <Box
        direction={isMinSize(size, 'ms') ? 'row' : 'column'}
        gap={isMinSize(size, 'ms') ? 'xsmall' : 'medium'}
        align="start"
        fill="horizontal"
      >
        <Box basis={isMinSize(size, 'ms') ? '1/2' : 'auto'}>
          {position && (
            <Box
              direction="row"
              gap="small"
              align="center"
              pad={isMinSize(size, 'ms') ? { left: '20px' } : {}}
            >
              <Box>
                <Dot
                  size={isMinSize(size, 'ms') ? '60px' : '44px'}
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
            <CheckboxOption
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
