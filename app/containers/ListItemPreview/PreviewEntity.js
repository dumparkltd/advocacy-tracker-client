import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import FieldFactory from 'components/fields/FieldFactory';
// import styled from 'styled-components';
import { Box } from 'grommet';

import { ROUTES, API, API_FOR_ROUTE } from 'themes/config';

import qe from 'utils/quasi-equals';

import {
  getActionPreviewHeader,
  getActionPreviewFields,
  getActionPreviewFooter,
  getActorPreviewHeader,
  getActorPreviewFields,
  getActorPreviewFooter,
} from 'utils/fields';

import {
  setListPreview,
  updatePath,
  loadEntitiesIfNeeded,
} from 'containers/App/actions';

import {
  selectReady,
} from 'containers/App/selectors';

import PreviewHeader from './PreviewHeader';
import PreviewFooter from './PreviewFooter';
import { selectPreviewEntity } from './selectors';

export const DEPENDENCIES = [
  API.USERS,
  API.USER_ROLES,
  API.CATEGORIES,
  API.ACTORS,
  API.ACTIONS,
  API.ACTOR_ACTIONS,
  API.MEMBERSHIPS,
  API.ACTION_CATEGORIES,
  API.INDICATORS,
  API.ACTION_INDICATORS,
];

export function PreviewEntity({
  content,
  onSetPreviewItemId,
  previewEntity,
  onUpdatePath,
  onEntityClick,
  intl,
  dataReady,
}) {
  let headerContent;
  let mainContent;
  let footerContent;
  if (previewEntity && qe(content.get('path'), ROUTES.ACTION)) {
    headerContent = previewEntity && getActionPreviewHeader(previewEntity, intl);
    mainContent = dataReady && getActionPreviewFields({
      action: previewEntity,
      indicators: previewEntity && previewEntity.get('indicators'),
      onEntityClick,
      intl,
    });
    footerContent = previewEntity && getActionPreviewFooter(previewEntity, intl);
  }
  if (previewEntity && qe(content.get('path'), ROUTES.ACTOR)) {
    headerContent = previewEntity && getActorPreviewHeader(previewEntity, intl);
    mainContent = dataReady && getActorPreviewFields({
      actor: previewEntity,
      onEntityClick,
      intl,
    });
    footerContent = previewEntity && getActorPreviewFooter(previewEntity, intl);
  }
  return (
    <>
      {headerContent && (
        <PreviewHeader
          content={headerContent}
          onSetPreviewItemId={onSetPreviewItemId}
        />
      )}
      {mainContent && (
        <Box margin={{ vertical: 'medium' }}>
          {mainContent.map(
            (field, i) => field
              ? (
                <FieldFactory
                  key={i}
                  field={{ ...field }}
                />
              )
              : null
          )}
        </Box>
      )}
      {footerContent && (
        <PreviewFooter
          content={footerContent}
          onUpdatePath={onUpdatePath}
        />
      )}
    </>
  );
}

PreviewEntity.propTypes = {
  content: PropTypes.object, // immutable Map
  previewEntity: PropTypes.object, // immutable Map
  onSetPreviewItemId: PropTypes.func,
  onUpdatePath: PropTypes.func,
  onEntityClick: PropTypes.func,
  dataReady: PropTypes.bool,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state, { content }) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  previewEntity: selectPreviewEntity(
    state,
    {
      id: content.get('id'),
      path: API_FOR_ROUTE[content.get('path')],
    },
  ),
});
export function mapDispatchToProps(dispatch) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onSetPreviewItemId: (val) => {
      dispatch(setListPreview(val));
    },
    onUpdatePath: (path) => {
      dispatch(updatePath(path));
    },
    onEntityClick: (id, path) => {
      dispatch(updatePath(`${path}/${id}`));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(PreviewEntity));