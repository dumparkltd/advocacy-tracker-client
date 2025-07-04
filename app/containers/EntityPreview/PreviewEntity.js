import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
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
  openNewEntityModal,
} from 'containers/App/actions';

import {
  selectReady,
  selectTaxonomiesWithCategories,
  selectActorConnections,
  selectIsUserMember,
} from 'containers/App/selectors';

import EntityFields from './EntityFields';

import PreviewHeader from './PreviewHeader';
import PreviewFooter from './PreviewFooter';
import { selectPreviewEntityWithConnections } from './selectors';

export const DEPENDENCIES = [
  API.ROLES,
  API.USERS,
  API.USER_ROLES,
  API.USER_ACTIONS,
  API.USER_ACTORS,
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
  onCreateOption,
  isMember,
}) {
  useEffect(() => {
    if (!dataReady) onLoadEntitiesIfNeeded();
  }, [dataReady]);
  if (!dataReady) return null;

  let headerContent;
  let fields = {};
  let footerContent;
  if (previewEntity && qe(content.get('path'), ROUTES.ACTION)) {
    headerContent = getActionPreviewHeader(previewEntity, intl, onUpdatePath);
    fields = {
      fields: getActionPreviewFields({
        action: previewEntity,
        indicators: previewEntity.get('indicators'),
        categories: previewEntity.get('categories'),
        actorsByType: previewEntity.get('actorsByType'),
        taxonomies,
        actorConnections,
        onEntityClick,
        intl,
      }),
    };
    footerContent = getActionPreviewFooter(previewEntity, intl);
  }
  if (previewEntity && qe(content.get('path'), ROUTES.ACTOR)) {
    headerContent = getActorPreviewHeader(
      previewEntity,
      intl,
      onUpdatePath,
      onCreateOption,
    );
    fields = {
      actorIndicators: {
        withOptions: true,
      },
      fields: getActorPreviewFields({
        actor: previewEntity,
        associationsByType: previewEntity.get('associationsByType'),
        membersByType: previewEntity.get('membersByType'),
        taxonomiesWithCategoriesByType: previewEntity.get('taxonomiesByType'),
        onEntityClick,
        intl,
      }),
    };
    footerContent = previewEntity && getActorPreviewFooter(previewEntity, intl);
  }
  if (previewEntity && qe(content.get('path'), ROUTES.INDICATOR)) {
    headerContent = previewEntity && getIndicatorPreviewHeader(previewEntity, intl, onUpdatePath);
    fields = {
      fields: getIndicatorPreviewFields({
        indicator: previewEntity,
        onEntityClick,
        intl,
      }),
    };
    footerContent = previewEntity && getIndicatorPreviewFooter(previewEntity, intl);
  }
  if (previewEntity && qe(content.get('path'), ROUTES.RESOURCE)) {
    headerContent = previewEntity && getResourcePreviewHeader(previewEntity, intl, onUpdatePath);
    fields = {
      fields: getResourcePreviewFields({
        resource: previewEntity,
        onEntityClick,
        intl,
      }),
    };
    footerContent = previewEntity && getResourcePreviewFooter(previewEntity, intl);
  }
  if (previewEntity && qe(content.get('path'), ROUTES.USERS)) {
    headerContent = previewEntity && getUserPreviewHeader(
      previewEntity,
      intl,
      onUpdatePath,
      onCreateOption,
    );
    fields = {
      fields: getUserPreviewFields({
        user: previewEntity,
        actionsByType: previewEntity.get('actionsByType'),
        onEntityClick,
        intl,
        isMember,
      }),
    };
    footerContent = previewEntity && getUserPreviewFooter(previewEntity, intl);
  }
  // console.log(previewEntity && previewEntity.toJS())
  return (
    <>
      {headerContent && (
        <PreviewHeader
          content={headerContent}
          onSetPreviewItemId={onSetPreviewItemId}
          onUpdatePath={onUpdatePath}
        />
      )}
      {fields && (
        <EntityFields
          fields={fields}
          item={previewEntity}
          onUpdatePath={onUpdatePath}
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
  onLoadEntitiesIfNeeded: PropTypes.func,
  content: PropTypes.object, // immutable Map
  previewEntity: PropTypes.object, // immutable Map
  taxonomies: PropTypes.object, // immutable Map
  actorConnections: PropTypes.object, // immutable Map
  isMember: PropTypes.bool,
  onSetPreviewItemId: PropTypes.func,
  onUpdatePath: PropTypes.func,
  onEntityClick: PropTypes.func,
  onCreateOption: PropTypes.func,
  dataReady: PropTypes.bool,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state, { content }) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  taxonomies: selectTaxonomiesWithCategories(state),
  actorConnections: selectActorConnections(state),
  isMember: selectIsUserMember(state),
  previewEntity: selectPreviewEntityWithConnections(
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
    onCreateOption: (args) => dispatch(openNewEntityModal(args)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(PreviewEntity));
