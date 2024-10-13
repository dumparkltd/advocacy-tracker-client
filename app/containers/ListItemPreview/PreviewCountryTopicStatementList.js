import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Heading, Button } from 'grommet';
import Icon from 'components/Icon';

import ButtonClose from 'components/buttons/ButtonClose';

const Styled = styled((p) => <Box {...p} />)``;
const ButtonNext = styled((p) => <Button {...p} />)``;

export function PreviewCountryTopicStatementList({ content, onSetPreviewItemNo }) {
  const { prevPreviewItem, nextPreviewItem, title } = content;
  return (
    <Styled>
      <Box fill="horizontal" align="end">
        {onSetPreviewItemNo && (
          <ButtonClose onClose={() => onSetPreviewItemNo(null)} />
        )}
      </Box>
      <Box direction="row" justify="between" align="center">
        <Box>
          <Heading level="3" style={{ margin: 0 }}>
            {title}
          </Heading>
        </Box>
        {onSetPreviewItemNo && (nextPreviewItem || prevPreviewItem) && (
          <Box direction="row" flex={{ shrink: 0 }} width="120">
            {prevPreviewItem && (
              <ButtonNext
                plain
                onClick={() => onSetPreviewItemNo(prevPreviewItem)}
              >
                <Icon name="arrowLeft" text size="1.5em" sizes={{ mobile: '1em' }} />
              </ButtonNext>
            )}
            {nextPreviewItem && (
              <ButtonNext
                plain
                onClick={() => onSetPreviewItemNo(nextPreviewItem)}
              >
                <Icon name="arrowRight" text size="1.5em" sizes={{ mobile: '1em' }} />
              </ButtonNext>
            )}
          </Box>
        )}
      </Box>
    </Styled>
  );
}

PreviewCountryTopicStatementList.propTypes = {
  content: PropTypes.object,
  onSetPreviewItemNo: PropTypes.func,
};
export default PreviewCountryTopicStatementList;
