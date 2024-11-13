import React, { useEffect } from 'react';
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
  getIndicatorPreviewHeader,
  getIndicatorPreviewFields,
  getIndicatorPreviewFooter,
  getResourcePreviewHeader,
  getResourcePreviewFields,
  getResourcePreviewFooter,
  getUserPreviewHeader,
  getUserPreviewFields,
  getUserPreviewFooter,
} from 'utils/fields';

import {
  setListPreview,
  updatePath,
  loadEntitiesIfNeeded,
} from 'containers/App/actions';

import {
  selectReady,
  selectTaxonomiesWithCategories,
  selectActorConnections,
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
  dataReady,
  onLoadEntitiesIfNeeded,
  content,
  taxonomies,
  actorConnections,
  onSetPreviewItemId,
  previewEntity,
  onUpdatePath,
  onEntityClick,
  intl,
}) {
  useEffect(() => {
    if (!dataReady) onLoadEntitiesIfNeeded();
  }, [dataReady]);

  let headerContent;
  let mainContent;
  let footerContent;
  if (previewEntity && qe(content.get('path'), ROUTES.ACTION)) {
    headerContent = getActionPreviewHeader(previewEntity, intl);
    mainContent = dataReady && getActionPreviewFields({
      action: previewEntity,
      indicators: previewEntity.get('indicators'),
      categories: previewEntity.get('categories'),
      actorsByType: previewEntity.get('actorsByType'),
      taxonomies,
      actorConnections,
      onEntityClick,
      intl,
    });
    footerContent = getActionPreviewFooter(previewEntity, intl);
  }
  if (previewEntity && qe(content.get('path'), ROUTES.ACTOR)) {
    headerContent = getActorPreviewHeader(previewEntity, intl);
    mainContent = dataReady && getActorPreviewFields({
      actor: previewEntity,
      associationsByType: previewEntity.get('associationsByType'),
      membersByType: previewEntity.get('membersByType'),
      taxonomiesWithCategoriesByType: previewEntity.get('taxonomiesByType'),
      onEntityClick,
      intl,
    });
    footerContent = previewEntity && getActorPreviewFooter(previewEntity, intl);
  }
  if (previewEntity && qe(content.get('path'), ROUTES.INDICATOR)) {
    headerContent = previewEntity && getIndicatorPreviewHeader(previewEntity, intl);
    mainContent = dataReady && getIndicatorPreviewFields({
      indicator: previewEntity,
      onEntityClick,
      intl,
    });
    footerContent = previewEntity && getIndicatorPreviewFooter(previewEntity, intl);
  }
  if (previewEntity && qe(content.get('path'), ROUTES.RESOURCE)) {
    headerContent = previewEntity && getResourcePreviewHeader(previewEntity, intl);
    mainContent = dataReady && getResourcePreviewFields({
      resource: previewEntity,
      onEntityClick,
      intl,
    });
    footerContent = previewEntity && getResourcePreviewFooter(previewEntity, intl);
  }
  if (previewEntity && qe(content.get('path'), ROUTES.USERS)) {
    headerContent = previewEntity && getUserPreviewHeader(previewEntity, intl);
    mainContent = dataReady && getUserPreviewFields({
      user: previewEntity,
      onEntityClick,
      intl,
    });
    footerContent = previewEntity && getUserPreviewFooter(previewEntity, intl);
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
                  field={{ ...field, onEntityClick }}
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
  onLoadEntitiesIfNeeded: PropTypes.func,
  content: PropTypes.object, // immutable Map
  previewEntity: PropTypes.object, // immutable Map
  taxonomies: PropTypes.object, // immutable Map
  actorConnections: PropTypes.object, // immutable Map
  onSetPreviewItemId: PropTypes.func,
  onUpdatePath: PropTypes.func,
  onEntityClick: PropTypes.func,
  dataReady: PropTypes.bool,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state, { content }) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  taxonomies: selectTaxonomiesWithCategories(state),
  actorConnections: selectActorConnections(state),
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
    onLoadEntitiesIfNeeded: () => {
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
