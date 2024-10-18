import React from 'react';
import PropTypes from 'prop-types';

import {
  Box, Heading, Button,
} from 'grommet';
import Icon from 'components/Icon';

import Reference from 'components/fields/Reference';
import ButtonClose from 'components/buttons/ButtonClose';

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
    >
      <Box fill="horizontal" align="end">
        {onSetPreviewItemId && (
          <ButtonClose onClose={() => onSetPreviewItemId(null)} />
        )}
      </Box>
      <Box direction="row" justify="between" align="center">
        <Box>
          {aboveTitle && (
            <Reference>{aboveTitle}</Reference>
          )}
          <Heading level="3" style={{ margin: 0 }}>
            {title}
          </Heading>
        </Box>
        {onSetPreviewItemId && (nextPreviewItem || prevPreviewItem) && (
          <Box direction="row" flex={{ shrink: 0 }} width="120">
            {prevPreviewItem && (
              <Button
                plain
                onClick={() => onSetPreviewItemId(prevPreviewItem)}
              >
                <Icon name="arrowLeft" text size="1.5em" sizes={{ mobile: '1em' }} />
              </Button>
            )}
            {nextPreviewItem && (
              <Button
                plain
                onClick={() => onSetPreviewItemId(nextPreviewItem)}
              >
                <Icon name="arrowRight" text size="1.5em" sizes={{ mobile: '1em' }} />
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

PreviewHeader.propTypes = {
  content: PropTypes.object,
  onSetPreviewItemId: PropTypes.func,
};
export default PreviewHeader;
