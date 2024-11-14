import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import {
  Box, Heading,
} from 'grommet';
import Icon from 'components/Icon';

import appMessages from 'containers/App/messages';

import Reference from 'components/fields/Reference';
import ScreenReaderOnly from 'components/styled/ScreenReaderOnly';
import Button from 'components/buttons/ButtonSimple';
import A from 'components/styled/A';

const Title = styled((p) => <Heading level={3} {...p} />)`
  font-family: ${({ theme }) => theme.fonts.title};
  font-size: ${({ largeTitle }) => largeTitle ? 48 : 42}px;
  line-height: ${({ largeTitle }) => largeTitle ? 52 : 45}px;
  font-weight: normal;
  margin: 0px;
`;
const NavButton = styled((p) => <Button {...p} />)`
  border-radius: 999px;
  border: 1px solid ${palette('light', 1)};
  color: ${({ isDisabled }) => isDisabled ? palette('light', 3) : 'black'};
  background: ${({ isDisabled }) => isDisabled ? palette('light', 1) : 'white'};
  padding: ${({ isLeft }) => isLeft ? '4px 9px 4px 7px' : '4px 7px 4px 9px'};
  width: 34px;
  height: 34px;
  margin-top: 2px;
  path {
    stroke-width: 3px;
  }
  &:hover {
    color: ${({ isDisabled }) => isDisabled ? palette('light', 3) : palette('primary', 0)};
  }
`;
const CloseButton = styled((p) => <Button {...p} />)`
  background-color: ${palette('primary', 1)};
  color: white;
  border-radius: 999px;
  border: none;
  box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.2);
  padding: 12px;
  &:hover {
    background-color: ${palette('primary', 0)};
    box-shadow: none;
  }
`;

const StyledReference = styled(Reference)`
  text-transform: uppercase;
`;

const TitleLink = styled(A)`
  color: black;
  &:hover {
    text-decoration: underline;
  }
`;
const HeaderLink = styled(A)`
  color: #898989;
  text-transform: uppercase;
  font-family: ${({ theme }) => theme.fonts.title};
`;

export function PreviewHeader({
  content,
  onSetPreviewItemId,
  onUpdatePath,
}) {
  const contentClean = content || {};
  const {
    title,
    titlePath,
    aboveTitle,
    prevPreviewItem,
    nextPreviewItem,
    largeTitle,
    topActions,
  } = contentClean;
  return (
    <Box
      responsive={false}
      flex={{ shrink: 0 }}
      direction="column"
      pad={{ bottom: 'large' }}
    >
      <Box direction="row" fill="horizontal" align="center" justify="end" gap="medium">
        {topActions && topActions.length > 0 && (
          <Box direction="row" align="center" gap="medium">
            {topActions.map((action, i) => (
              <HeaderLink
                key={i}
                onClick={action.onClick}
                href={action.path}
              >
                {(!action.type || action.type !== 'create') && action.label}
                {action.type === 'create' && (
                  <Box direction="row" align="center" gap="xsmall">
                    <span>
                      {action.label}
                    </span>
                    <Icon name="add" size="14px" />
                  </Box>
                )}
              </HeaderLink>
            ))}
          </Box>
        )}
        {onSetPreviewItemId && (
          <CloseButton onClick={() => onSetPreviewItemId(null)}>
            <ScreenReaderOnly>
              <FormattedMessage {...appMessages.buttons.close} />
            </ScreenReaderOnly>
            <Icon name="close" size="39px" />
          </CloseButton>
        )}
      </Box>
      <Box
        direction="column"
        gap="xsmall"
        pad={{ top: 'medium' }}
      >
        {aboveTitle && (
          <StyledReference>
            {aboveTitle}
          </StyledReference>
        )}
        <Box direction="row" justify="between" align="start" gap="xsmall">
          {!titlePath && (
            <Title largeTitle={largeTitle}>
              {title}
            </Title>
          )}
          {titlePath && (
            <TitleLink
              href={titlePath}
              title={title}
              onClick={(e) => {
                if (e && e.preventDefault) e.preventDefault();
                onUpdatePath(titlePath);
              }}
            >
              <Title largeTitle={largeTitle}>
                {title}
              </Title>
            </TitleLink>
          )}
          {onSetPreviewItemId && (nextPreviewItem || prevPreviewItem) && (
            <Box
              direction="row"
              flex={{ shrink: 0, grow: 0 }}
              width="120"
              gap="xsmall"
              align="center"
              margin={{ top: largeTitle ? '12px' : '7px' }}
            >
              <NavButton
                onClick={() => onSetPreviewItemId(prevPreviewItem)}
                isDisabled={!prevPreviewItem}
                isLeft
              >
                <Icon name="arrowLeft" text hasStroke size="1em" sizes={{ mobile: '1em' }} />
              </NavButton>
              <NavButton
                onClick={() => onSetPreviewItemId(nextPreviewItem)}
                isDisabled={!nextPreviewItem}
              >
                <Icon name="arrowRight" text hasStroke size="1em" sizes={{ mobile: '1em' }} />
              </NavButton>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

PreviewHeader.propTypes = {
  content: PropTypes.object,
  onSetPreviewItemId: PropTypes.func,
  onUpdatePath: PropTypes.func,
};
export default PreviewHeader;
