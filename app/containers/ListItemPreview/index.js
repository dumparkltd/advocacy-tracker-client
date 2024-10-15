import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Box } from 'grommet';

import { setListPreview, updatePath } from 'containers/App/actions';

import PreviewHeader from './PreviewHeader';
import PreviewEntity from './PreviewEntity';
import PreviewFooter from './PreviewFooter';
import PreviewCountryTopicPosition from './PreviewCountryTopicPosition';
import PreviewCountryTopicStatementList from './PreviewCountryTopicStatementList';
import PreviewCountryPositionsList from './PreviewCountryPositionsList';

const Styled = styled((p) => <Box {...p} />)`
  margin-left: 5px;
`;
export function ListItemPreview({
  content,
  onSetPreviewItemId,
  onUpdatePath,
}) {
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
      {content && content.get('entity') && (
        <PreviewEntity content={content.get('entity')} />
      )}
      {content && content.get('header') && !content.get('entity') && (
        <PreviewHeader
          content={content && content.get('header') && content.get('header').toJS()}
          onSetPreviewItemId={onSetPreviewItemId}
        />
      )}
      {content && content.get('topicPosition') && (
        <PreviewCountryTopicPosition
          content={content.get('topicPosition').toJS()}
        />
      )}
      {content && content.get('topicStatements') && (
        <PreviewCountryTopicStatementList
          content={content.get('topicStatements').toJS()}
        />
      )}
      {content && content.get('countryPositions') && (
        <PreviewCountryPositionsList
          content={content.get('countryPositions')}
        />
      )}
      {content && content.get('footer') && (
        <PreviewFooter
          content={content.get('footer').toJS()}
          onUpdatePath={onUpdatePath}
        />
      )}
    </Styled>
  );
}

ListItemPreview.propTypes = {
  content: PropTypes.object, // immutable Map
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
