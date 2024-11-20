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

import { isMinSize } from 'utils/responsive';

import ContentSimple from 'components/styled/ContentSimple';
import Container from 'components/styled/Container';

import messages from './messages';

import CardTeaser from './CardTeaser';

const Group = styled(
  (p) => (
    <Box
      margin={{ bottom: 'large', top: 'medium' }}
      fill="horizontal"
      {...p}
    />
  )
)``;
const GroupTitle = styled((p) => <Text size="large" {...p} />)`
  text-transform: uppercase;
  font-family: ${({ theme }) => theme.fonts.title};
`;
const StyledContainer = styled((p) => <Container {...p} />)``;
const SectionTitle = styled.h2`
  margin-top: 50px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fonts.title};
`;
const ContentPreview = ({ dataReady, navGroups, onUpdatePath }) => {
  const size = React.useContext(ResponsiveContext);
  return (
    <StyledContainer>
      <ContentSimple>
        <SectionTitle>
          <FormattedMessage {...messages.allContent} />
        </SectionTitle>
        {navGroups.map((navGroup) => {
          let noPerRow = 1;
          if (navGroup.items && navGroup.items.length > 1) {
            if (isMinSize(size, 'large')) {
              noPerRow = 5;
            } else if (isMinSize(size, 'medium')) {
              noPerRow = 3;
            } else if (isMinSize(size, 'ms')) {
              noPerRow = 2;
            }
          }
          let rows = [];
          for (let i = 0; i < navGroup.items.length; i += noPerRow) {
            rows = [
              ...rows,
              navGroup.items.slice(i, i + noPerRow),
            ];
          }
          const maxRowLength = rows.reduce(
            (max, row) => Math.max(max, row.length),
            0,
          );
          const basis = maxRowLength > 1 ? `${Math.floor((1 / maxRowLength) * 100)}%` : 'full';
          return (
            <Group key={navGroup.id}>
              <Box margin={{ bottom: 'small' }}>
                <GroupTitle>
                  {navGroup.title}
                </GroupTitle>
              </Box>
              {rows.length > 0 && rows.map((row, i) => (
                <Box
                  key={i}
                  gap="small"
                  margin={{ bottom: 'medium' }}
                  direction="row"
                >
                  {row.length > 0 && row.map((item, index) => {
                    const {
                      title, path, count, description,
                    } = item;
                    return (
                      <CardTeaser
                        key={path + index}
                        basis={basis}
                        // isInverted={false}
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
              ))}
            </Group>
          );
        })}
      </ContentSimple>
    </StyledContainer>
  );
};
ContentPreview.propTypes = {
  dataReady: PropTypes.bool,
  navGroups: PropTypes.array,
  onUpdatePath: PropTypes.func,
};

ContentPreview.contextTypes = {
  intl: PropTypes.object.isRequired,
};
export default ContentPreview;
