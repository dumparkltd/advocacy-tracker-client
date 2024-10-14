import React from 'react';
import PropTypes from 'prop-types';

import {
  Box, Heading, Button,
} from 'grommet';
import Icon from 'components/Icon';

import Reference from 'components/fields/Reference';
import ButtonClose from 'components/buttons/ButtonClose';

export function PreviewHeader({ content, onSetPreviewItemNo }) {
  const {
    title,
    aboveTitle,
    prevPreviewItem,
    nextPreviewItem,
  } = content;
  return (
    <Box
      responsive={false}
      flex={{ shrink: 0 }}
    >
      <Box fill="horizontal" align="end">
        {onSetPreviewItemNo && (
          <ButtonClose onClose={() => onSetPreviewItemNo(null)} />
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
        {onSetPreviewItemNo && (nextPreviewItem || prevPreviewItem) && (
          <Box direction="row" flex={{ shrink: 0 }} width="120">
            {prevPreviewItem && (
              <Button
                plain
                onClick={() => onSetPreviewItemNo(prevPreviewItem)}
              >
                <Icon name="arrowLeft" text size="1.5em" sizes={{ mobile: '1em' }} />
              </Button>
            )}
            {nextPreviewItem && (
              <Button
                plain
                onClick={() => onSetPreviewItemNo(nextPreviewItem)}
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
  onSetPreviewItemNo: PropTypes.func,
};
export default PreviewHeader;
