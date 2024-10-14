import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Box } from 'grommet';

import { setListPreview, updatePath } from 'containers/App/actions';

import PreviewHeader from './PreviewHeader';
import PreviewFooter from './PreviewFooter';
import PreviewCountryTopicPosition from './PreviewCountryTopicPosition';
import PreviewCountryTopicStatementList from './PreviewCountryTopicStatementList';

const Styled = styled((p) => <Box {...p} />)`
  margin-left: 5px;
`;
export function ListItemPreview({
  content,
  onSetPreviewItemId,
  onUpdatePath,
}) {
  // console.log('content', content)
  return (
    <Styled
      background="white"
      fill="vertical"
      responsive={false}
      flex={{ shrink: 0 }}
      elevation="medium"
      pad={{ horizontal: 'large', vertical: 'small' }}
      gap="large"
      overflow="auto"
      style={{ position: 'relative' }}
    >
      {content && content.header && (
        <PreviewHeader
          content={content.header}
          onSetPreviewItemId={onSetPreviewItemId}
        />
      )}
      {content && content.topicPosition && (
        <PreviewCountryTopicPosition
          content={content.topicPosition}
        />
      )}
      {content && content.topicStatements && (
        <PreviewCountryTopicStatementList
          content={content.topicStatements}
        />
      )}
      {content && content.footer && (
        <PreviewFooter
          content={content.footer}
          onUpdatePath={onUpdatePath}
        />
      )}
    </Styled>
  );
}

ListItemPreview.propTypes = {
  content: PropTypes.object,
  onSetPreviewItemId: PropTypes.func,
  onUpdatePath: PropTypes.func,
};


export function mapDispatchToProps(dispatch) {
  return {
    onSetPreviewItemId: (val) => {
      dispatch(setListPreview(val));
    },
    onUpdatePath: (path) => {
      dispatch(updatePath(path));
    },
  };
}
export default connect(null, mapDispatchToProps)(ListItemPreview);
