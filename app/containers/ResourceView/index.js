/*
 *
 * ResourceView
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';

import {
  getTitleField,
  getStatusField,
  getStatusFieldIf,
  getMetaField,
  getMarkdownField,
  getLinkField,
  getActionConnectionField,
  getDateField,
} from 'utils/fields';
import { qe } from 'utils/quasi-equals';
import {
  getEntityTitleTruncated,
  checkResourceAttribute,
  getActiontypeColumns,
} from 'utils/entities';

import {
  loadEntitiesIfNeeded, updatePath, closeEntity, printView,
} from 'containers/App/actions';

import { ROUTES } from 'themes/config';
import { PRINT_TYPES } from 'containers/App/constants';

import { keydownHandlerPrint } from 'utils/print';

import Loading from 'components/Loading';
import Content from 'components/Content';
import EntityView from 'components/EntityView';

import {
  selectReady,
  selectIsUserMember,
  selectTaxonomiesWithCategories,
  selectActionConnections,
  selectIsUserAdmin,
  selectSessionUserId,
  // selectActiveResourcetypes,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';
import messages from './messages';

import {
  selectViewEntity,
  selectActionsByType,
} from './selectors';

import { DEPENDENCIES } from './constants';

const getHeaderMainFields = (entity) => {
  const typeId = entity.getIn(['attributes', 'resourcetype_id']);
  return ([ // fieldGroups
    { // fieldGroup
      fields: [
        checkResourceAttribute(typeId, 'title') && getTitleField(entity),
      ],
    },
  ]);
};

const getHeaderAsideFields = (entity, isAdmin, isMine) => {
  const fields = ([
    {
      fields: [
        getStatusField(entity),
        (isAdmin || isMine) && getStatusFieldIf({
          entity,
          attribute: 'private',
        }),
        isAdmin && getStatusFieldIf({
          entity,
          attribute: 'is_archive',
        }),
        getMetaField(entity),
      ],
    },
  ]);
  return fields;
};

const getBodyMainFields = (
  entity,
  actionsByActiontype,
  taxonomies,
  actionConnections,
  onEntityClick,
  isAdmin,
) => {
  const fields = [];
  const typeId = entity.getIn(['attributes', 'resourcetype_id']);

  // own attributes
  fields.push(
    {
      fields: [
        checkResourceAttribute(typeId, 'url') && getLinkField(entity),
        checkResourceAttribute(typeId, 'description')
        && getMarkdownField(entity, 'description', true),
        checkResourceAttribute(typeId, 'status')
        && getMarkdownField(entity, 'status', true),
      ],
    },
  );

  if (actionsByActiontype) {
    const actionConnectionsLocal = [];
    actionsByActiontype.forEach((actions, actiontypeid) => {
      actionConnectionsLocal.push(
        getActionConnectionField({
          actions,
          taxonomies,
          onEntityClick,
          connections: actionConnections,
          typeid: actiontypeid,
          columns: getActiontypeColumns({
            typeId: actiontypeid,
            isAdmin,
          }),
        }),
      );
    });
    fields.push({
      label: appMessages.nav.actions,
      fields: actionConnectionsLocal,
    });
  }
  return fields;
};

const getBodyAsideFields = (entity) => {
  const fields = [];
  const typeId = entity.getIn(['attributes', 'resourcetype_id']);
  fields.push(
    {
      fields: [
        checkResourceAttribute(typeId, 'publication_date') && getDateField(entity, 'publication_date'),
        checkResourceAttribute(typeId, 'access_date') && getDateField(entity, 'access_date'),
      ],
    },
  );
  return fields;
};
export function ResourceView({
  onLoadEntitiesIfNeeded,
  viewEntity,
  dataReady,
  isMember,
  taxonomies,
  actionsByActiontype,
  actionConnections,
  onEntityClick,
  handleTypeClick,
  handleEdit,
  handleClose,
  isAdmin,
  params,
  myId,
  onSetPrintView,
  intl,
}) {
  useEffect(() => {
    if (!dataReady) onLoadEntitiesIfNeeded();
  }, [dataReady]);

  const mySetPrintView = () => onSetPrintView({
    printType: PRINT_TYPES.SINGLE,
    printOrientation: 'portrait',
    printSize: 'A4',
  });

  const keydownHandler = (e) => {
    keydownHandlerPrint(e, mySetPrintView);
  };

  useEffect(() => {
    document.addEventListener('keydown', keydownHandler);
    return () => {
      document.removeEventListener('keydown', keydownHandler);
    };
  }, []);

  const typeId = viewEntity && viewEntity.getIn(['attributes', 'resourcetype_id']);
  let buttons = [];
  if (dataReady) {
    if (window.print) {
      buttons = [
        ...buttons,
        {
          type: 'icon',
          onClick: () => mySetPrintView(),
          title: 'Print',
          icon: 'print',
        },
      ];
    }
    if (isMember) {
      buttons = [
        ...buttons,
        {
          type: 'edit',
          onClick: handleEdit,
        },
      ];
    }
  }
  const pageTitle = typeId
    ? intl.formatMessage(appMessages.entities[`resources_${typeId}`].single)
    : intl.formatMessage(appMessages.entities.resources.single);

  const metaTitle = viewEntity
    ? `${pageTitle}: ${getEntityTitleTruncated(viewEntity)}`
    : `${pageTitle}: ${params.id}`;

  const isMine = viewEntity && qe(viewEntity.getIn(['attributes', 'created_by_id']), myId);
  return (
    <div>
      <Helmet
        title={metaTitle}
        meta={[
          { name: 'description', content: intl.formatMessage(messages.metaDescription) },
        ]}
      />
      <Content isSingle>
        {!dataReady
          && <Loading />
        }
        {!viewEntity && dataReady
          && (
            <div>
              <FormattedMessage {...messages.notFound} />
            </div>
          )
        }
        {viewEntity && dataReady
          && (
            <EntityView
              header={{
                title: typeId
                  ? intl.formatMessage(appMessages.resourcetypes[typeId])
                  : intl.formatMessage(appMessages.entities.resources.plural),
                onClose: () => handleClose(typeId),
                buttons,
                onTypeClick: () => handleTypeClick(typeId),
              }}
              fields={{
                header: {
                  main: getHeaderMainFields(viewEntity),
                  aside: isMember && getHeaderAsideFields(viewEntity, isAdmin, isMine),
                },
                body: {
                  main: getBodyMainFields(
                    viewEntity,
                    actionsByActiontype,
                    taxonomies,
                    actionConnections,
                    onEntityClick,
                    isAdmin,
                  ),
                  aside: getBodyAsideFields(viewEntity),
                },
              }}
            />
          )
        }
      </Content>
    </div>
  );
}

ResourceView.propTypes = {
  viewEntity: PropTypes.object,
  onLoadEntitiesIfNeeded: PropTypes.func,
  onSetPrintView: PropTypes.func,
  dataReady: PropTypes.bool,
  handleEdit: PropTypes.func,
  handleClose: PropTypes.func,
  handleTypeClick: PropTypes.func,
  onEntityClick: PropTypes.func,
  taxonomies: PropTypes.object,
  actionConnections: PropTypes.object,
  actionsByActiontype: PropTypes.object,
  params: PropTypes.object,
  isMember: PropTypes.bool,
  isAdmin: PropTypes.bool,
  myId: PropTypes.string,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state, props) => ({
  isMember: selectIsUserMember(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  viewEntity: selectViewEntity(state, props.params.id),
  taxonomies: selectTaxonomiesWithCategories(state),
  actionsByActiontype: selectActionsByType(state, props.params.id),
  actionConnections: selectActionConnections(state),
  isAdmin: selectIsUserAdmin(state),
  myId: selectSessionUserId(state),
});

function mapDispatchToProps(dispatch, props) {
  return {
    onLoadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    handleEdit: () => {
      dispatch(updatePath(`${ROUTES.RESOURCE}${ROUTES.EDIT}/${props.params.id}`, { replace: true }));
    },
    handleClose: (typeId) => {
      dispatch(closeEntity(`${ROUTES.RESOURCES}/${typeId}`));
    },
    handleTypeClick: (typeId) => {
      dispatch(updatePath(`${ROUTES.RESOURCES}/${typeId}`));
    },
    onEntityClick: (id, path) => {
      dispatch(updatePath(`${path}/${id}`));
    },
    onSetPrintView: (config) => {
      dispatch(printView(config));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ResourceView));
