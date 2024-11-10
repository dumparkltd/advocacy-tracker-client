import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import {
  Box, Heading, Button,
} from 'grommet';
import Icon from 'components/Icon';

import appMessages from 'containers/App/messages';

import Reference from 'components/fields/Reference';
import ScreenReaderOnly from 'components/styled/ScreenReaderOnly';

const Title = styled((p) => <Heading level={3} {...p} />)`
  font-family: ${({ theme }) => theme.fonts.title};
  font-size: 34px;
  font-weight: normal;
  margin: 0px;
`;
const NavButton = styled((p) => <Button plain {...p} />)`
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
    color: ${palette('primary', 0)};
  }
`;
const CloseButton = styled((p) => <Button plain {...p} />)`
  background-color: ${palette('primary', 1)};
  color: white;
  border-radius: 999px;
  border: none;
  box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.2);
  padding: 17px;
  &:hover {
    background-color: ${palette('primary', 0)};
    box-shadow: none;
  }
`;

export function PreviewHeader({ content, onSetPreviewItemId }) {
  const contentClean = content || {};
  const {
    title,
    aboveTitle,
    prevPreviewItem,
    nextPreviewItem,
  } = contentClean;
  return (
    <Box
      responsive={false}
      flex={{ shrink: 0 }}
      direction="column"
      pad={{ vertical: 'medium' }}
    >
      <Box fill="horizontal" align="end">
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
          <Reference>
            {aboveTitle}
          </Reference>
        )}
        <Box direction="row" justify="between" align="start">
          <Title>
            {title}
          </Title>
          {onSetPreviewItemId && (nextPreviewItem || prevPreviewItem) && (
            <Box direction="row" flex={{ shrink: 0, grow: 0 }} width="120" gap="xsmall" align="center">
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
};
export default PreviewHeader;
