/*
 *
 * ResourceView
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';

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

export class ResourceView extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
  }

  getHeaderMainFields = (entity) => {
    const typeId = entity.getIn(['attributes', 'resourcetype_id']);
    return ([ // fieldGroups
      { // fieldGroup
        fields: [
          checkResourceAttribute(typeId, 'title') && getTitleField(entity),
        ],
      },
    ]);
  };

  getHeaderAsideFields = (entity, isAdmin, isMine) => {
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

  getBodyMainFields = (
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

  getBodyAsideFields = (entity) => {
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

  render() {
    const { intl } = this.context;
    const {
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
      myId,
      onSetPrintView,
    } = this.props;
    const typeId = viewEntity && viewEntity.getIn(['attributes', 'resourcetype_id']);
    let buttons = [];
    if (dataReady) {
      if (window.print) {
        buttons = [
          ...buttons,
          {
            type: 'icon',
            onClick: () => onSetPrintView({
              printType: PRINT_TYPES.SINGLE,
              printOrientation: 'portrait',
              printSize: 'A4',
            }),
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
      : `${pageTitle}: ${this.props.params.id}`;

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
                    main: this.getHeaderMainFields(viewEntity),
                    aside: isMember && this.getHeaderAsideFields(viewEntity, isAdmin, isMine),
                  },
                  body: {
                    main: this.getBodyMainFields(
                      viewEntity,
                      actionsByActiontype,
                      taxonomies,
                      actionConnections,
                      onEntityClick,
                      isAdmin,
                    ),
                    aside: this.getBodyAsideFields(viewEntity),
                  },
                }}
              />
            )
          }
        </Content>
      </div>
    );
  }
}

ResourceView.propTypes = {
  viewEntity: PropTypes.object,
  loadEntitiesIfNeeded: PropTypes.func,
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
};

ResourceView.contextTypes = {
  intl: PropTypes.object.isRequired,
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
    loadEntitiesIfNeeded: () => {
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

export default connect(mapStateToProps, mapDispatchToProps)(ResourceView);
