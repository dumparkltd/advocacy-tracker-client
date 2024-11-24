import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Box, ResponsiveContext } from 'grommet';

import { setListPreview, updatePath } from 'containers/App/actions';

import { isMinSize } from 'utils/responsive';

import PreviewHeader from './PreviewHeader';
import PreviewEntity from './PreviewEntity';
import PreviewItem from './PreviewItem';
import PreviewFooter from './PreviewFooter';
import EntityFields from './EntityFields';

const Styled = styled((p) => <Box {...p} />)`
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    margin-left: 5px;
  }
`;
export function EntityPreview({
  content,
  onSetPreviewItemId,
  onUpdatePath,
}) {
  // PreviewEntity: using item path and id, includes header and footer
  // PreviewItem: using the main list item and its columns
  // console.log('content', content && content.toJS())
  const size = React.useContext(ResponsiveContext);
  return (
    <Styled
      background="white"
      fill="vertical"
      responsive={false}
      flex={{ shrink: 0 }}
      elevation="medium"
      pad={isMinSize(size, 'medium')
        ? { horizontal: 'large', vertical: 'small' }
        : { horizontal: 'small', vertical: 'small' }
      }
      gap="small"
      overflow="auto"
      style={{ position: 'relative', display: 'block' }}
    >
      {content && content.get('entity') && (
        <PreviewEntity
          content={content.get('entity')}
        />
      )}
      {content && content.get('header') && !content.get('entity') && (
        <PreviewHeader
          content={content && content.get('header') && content.get('header').toJS()}
          onSetPreviewItemId={onSetPreviewItemId}
          onUpdatePath={onUpdatePath}
        />
      )}
      {content
        && content.get('item')
        && content.get('fields')
        && !content.get('entity')
        && (
          <EntityFields
            fields={content.get('fields').toJS()}
            item={content.get('item')}
            itemContent={content.get('itemContent')}
            columns={content.get('columns')}
            onUpdatePath={onUpdatePath}
          />
        )}
      {content
        && content.get('item')
        && !content.get('fields')
        && !content.get('entity')
        && (
          <PreviewItem
            item={content.get('item')}
            itemContent={content.get('itemContent')}
            columns={content.get('columns')}
          />
        )}
      {content && content.get('footer') && !content.get('entity') && (
        <PreviewFooter
          content={content.get('footer').toJS()}
          onUpdatePath={onUpdatePath}
        />
      )}
    </Styled>
  );
}

EntityPreview.propTypes = {
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
export default connect(null, mapDispatchToProps)(EntityPreview);
