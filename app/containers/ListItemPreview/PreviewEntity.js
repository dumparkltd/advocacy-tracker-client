import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
// import styled from 'styled-components';
// import { Box } from 'grommet';

import { ROUTES, API, API_FOR_ROUTE } from 'themes/config';

import qe from 'utils/quasi-equals';

import {
  getActionPreviewHeader,
  getActionPreviewFields,
  getActionPreviewFooter,
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
  API.TAXONOMIES,
  API.ACTIONTYPES,
  API.ACTORTYPES,
  API.ACTIONTYPE_TAXONOMIES,
  API.ACTORS,
  API.ACTIONS,
  API.RESOURCES,
  API.ACTOR_ACTIONS,
  API.ACTION_ACTORS,
  API.ACTION_RESOURCES,
  API.MEMBERSHIPS,
  API.ACTOR_CATEGORIES,
  API.ACTION_CATEGORIES,
  API.INDICATORS,
  API.ACTION_INDICATORS,
  API.USER_ACTORS,
  API.USER_ACTIONS,
];

export function PreviewEntity({
  content,
  onSetPreviewItemId,
  previewEntity,
  onUpdatePath,
  onEntityClick,
  intl,
}) {
  let headerContent;
  let mainContent;
  let footerContent;
  if (previewEntity && qe(content.get('path'), ROUTES.ACTION)) {
    headerContent = previewEntity && getActionPreviewHeader(previewEntity, intl);
    mainContent = getActionPreviewFields({
      action: previewEntity,
      indicators: previewEntity && previewEntity.get('indicators'),
      onEntityClick,
      intl,
    });
    footerContent = previewEntity && getActionPreviewFooter(previewEntity, intl);
  }
  return (
    <>
      {headerContent && (
        <PreviewHeader
          content={headerContent}
          onSetPreviewItemId={onSetPreviewItemId}
        />
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
  previewEntity: selectPreviewEntity(
    state,
    {
      id: content.get('id'),
      path: API_FOR_ROUTE[content.get('path')],
    },
  ),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
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
