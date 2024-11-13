/*
 *
 * Content Preview
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text, ResponsiveContext } from 'grommet';
import { FormattedMessage } from 'react-intl';

import { isMaxSize } from 'utils/responsive';

import ContentSimple from 'components/styled/ContentSimple';
import Container from 'components/styled/Container';


import messages from './messages';

import CardTeaser from './CardTeaser';

const Group = styled((p) => <Box margin={{ bottom: 'large', top: 'medium' }} fill="horizontal" {...p} />)``;
const GroupTitle = styled((p) => <Text size="large" {...p} />)`
  text-transform: uppercase;
  font-family: ${({ theme }) => theme.fonts.title};
`;
const StyledContainer = styled((p) => <Container {...p} />)`
  max-width: 100%;
`;
const SectionTitle = styled.h2`
  font-weight: 500;
  font-family: ${({ theme }) => theme.fonts.title};
`;
const ContentPreview = ({ dataReady, navItems, onUpdatePath }) => {
  const size = React.useContext(ResponsiveContext);
  return (
    <StyledContainer>
      <ContentSimple>
        <SectionTitle>
          <FormattedMessage {...messages.allContent} />
        </SectionTitle>
        {navItems.map((navItem) => {
          const basis = `${(1 / navItem.items.length) * 100}%`;
          // const basis = '1/4';
          return (
            <Group key={navItem.id}>
              <Box margin={{ bottom: 'small' }}>
                <GroupTitle>
                  {navItem.title}
                </GroupTitle>
              </Box>
              <Box direction={isMaxSize(size, 'medium') ? 'column' : 'row'} gap="small">
                {navItem.items.map((item, index) => {
                  const {
                    title, path, count, description,
                  } = item;
                  return (
                    <CardTeaser
                      key={path + index}
                      basis={basis}
                      isInverted={false}
                      path={path}
                      onClick={(evt) => {
                        if (evt && evt.preventDefault) evt.preventDefault();
                        if (dataReady) onUpdatePath(path);
                      }}
                      dataReady={dataReady}
                      count={count}
                      title={title}
                      description={description}
                    />
                  );
                })}
              </Box>
            </Group>
          );
        })}
      </ContentSimple>
    </StyledContainer>
  );
};
ContentPreview.propTypes = {
  dataReady: PropTypes.bool,
  navItems: PropTypes.array,
  onUpdatePath: PropTypes.func,
};

ContentPreview.contextTypes = {
  intl: PropTypes.object.isRequired,
};
export default ContentPreview;
