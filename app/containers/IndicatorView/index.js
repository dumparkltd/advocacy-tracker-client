/*
 *
 * IndicatorView
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
  getActionConnectionField,
} from 'utils/fields';
// import { qe } from 'utils/quasi-equals';
import { getEntityTitleTruncated } from 'utils/entities';
import qe from 'utils/quasi-equals';

import { loadEntitiesIfNeeded, updatePath, closeEntity } from 'containers/App/actions';

import { ROUTES, ACTIONTYPES_CONFIG } from 'themes/config';

import Loading from 'components/Loading';
import Content from 'components/Content';
import ViewHeader from 'components/EntityView/ViewHeader';
import Main from 'components/EntityView/Main';
import Aside from 'components/EntityView/Aside';
import ViewWrapper from 'components/EntityView/ViewWrapper';
import ViewPanel from 'components/EntityView/ViewPanel';
import ViewPanelInside from 'components/EntityView/ViewPanelInside';
import FieldGroup from 'components/fields/FieldGroup';

import {
  selectReady,
  selectIsUserManager,
  selectIsUserAdmin,
  selectTaxonomiesWithCategories,
  selectActionConnections,
  selectSessionUserId,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';
import messages from './messages';

import {
  selectViewEntity,
  selectActionsByType,
} from './selectors';

import { DEPENDENCIES } from './constants';

const getActiontypeColumns = (typeid) => {
  if (
    ACTIONTYPES_CONFIG[parseInt(typeid, 10)]
    && ACTIONTYPES_CONFIG[parseInt(typeid, 10)].columns
  ) {
    return ACTIONTYPES_CONFIG[parseInt(typeid, 10)].columns.filter(
      (col) => {
        if (typeof col.showOnSingle !== 'undefined') {
          return col.showOnSingle;
        }
        return true;
      }
    );
  }
  return [{
    id: 'main',
    type: 'main',
    sort: 'title',
    attributes: ['title'],
  }];
};

export class IndicatorView extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
  }

  getBodyMainFields = (
    entity,
    actionsByActiontype,
    taxonomies,
    actionConnections,
    onEntityClick,
  ) => {
    const fields = [];

    // own attributes
    fields.push(
      {
        fields: [
          getMarkdownField(entity, 'description', true),
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

  // getBodyAsideFields = (entity) => {
  //   const fields = [];
  //   const typeId = entity.getIn(['attributes', 'resourcetype_id']);
  //   fields.push(
  //     {
  //       fields: [
  //         checkResourceAttribute(typeId, 'publication_date') && getDateField(entity, 'publication_date'),
  //         checkResourceAttribute(typeId, 'access_date') && getDateField(entity, 'access_date'),
  //       ],
  //     },
  //   );
  //   return fields;
  // };

  render() {
    const { intl } = this.context;
    const {
      viewEntity,
      dataReady,
      isManager,
      isAdmin,
      myId,
      taxonomies,
      actionsByActiontype,
      actionConnections,
      onEntityClick,
      handleEdit,
      handleClose,
    } = this.props;
    let buttons = [];
    if (dataReady) {
      buttons = [
        ...buttons,
        {
          type: 'icon',
          onClick: () => window.print(),
          title: 'Print',
          icon: 'print',
        },
      ];
      if (isManager) {
        buttons = [
          ...buttons,
          {
            type: 'edit',
            onClick: handleEdit,
          },
        ];
      }
    }
    const pageTitle = intl.formatMessage(appMessages.entities.indicators.single);

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
          { !dataReady && <Loading /> }
          { !viewEntity && dataReady && (
            <div>
              <FormattedMessage {...messages.notFound} />
            </div>
          )}
          { viewEntity && dataReady && (
            <ViewWrapper>
              <ViewHeader
                title={pageTitle}
                buttons={buttons}
                onClose={() => handleClose()}
                onTypeClick={() => handleClose()}
              />
              <ViewPanel>
                <ViewPanelInside>
                  <Main hasAside={isManager}>
                    <FieldGroup
                      group={{ // fieldGroup
                        fields: [
                          getTitleField(viewEntity),
                        ],
                      }}
                    />
                  </Main>
                  {isManager && (
                    <Aside>
                      <FieldGroup
                        group={{
                          fields: [
                            getStatusField(viewEntity),
                            (isAdmin || isMine) && getStatusFieldIf({
                              entity: viewEntity,
                              attribute: 'private',
                            }),
                            isAdmin && getStatusFieldIf({
                              entity: viewEntity,
                              attribute: 'is_archive',
                            }),
                            getMetaField(viewEntity),
                          ],
                        }}
                        aside
                      />
                    </Aside>
                  )}
                </ViewPanelInside>
              </ViewPanel>
              <ViewPanel>
                <ViewPanelInside>
                  <Main bottom>
                    <FieldGroup
                      group={{
                        fields: [
                          getMarkdownField(viewEntity, 'description', true),
                        ],
                      }}
                    />
                    {actionsByActiontype && (
                      <FieldGroup
                        group={{
                          label: appMessages.nav.actions,
                          fields: actionsByActiontype.reduce(
                            (memo, actions, actiontypeid) => ([
                              ...memo,
                              getActionConnectionField({
                                actions,
                                taxonomies,
                                onEntityClick,
                                connections: actionConnections,
                                typeid: actiontypeid,
                                columns: getActiontypeColumns(actiontypeid),
                              }),
                            ]),
                            [],
                          ),
                        }}
                      />
                    )}
                  </Main>
                </ViewPanelInside>
              </ViewPanel>
            </ViewWrapper>
          )}
        </Content>
      </div>
    );
  }
}

IndicatorView.propTypes = {
  viewEntity: PropTypes.object,
  loadEntitiesIfNeeded: PropTypes.func,
  dataReady: PropTypes.bool,
  handleEdit: PropTypes.func,
  handleClose: PropTypes.func,
  onEntityClick: PropTypes.func,
  taxonomies: PropTypes.object,
  actionConnections: PropTypes.object,
  actionsByActiontype: PropTypes.object,
  params: PropTypes.object,
  myId: PropTypes.string,
  isManager: PropTypes.bool,
  isAdmin: PropTypes.bool,
};

IndicatorView.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => ({
  isManager: selectIsUserManager(state),
  isAdmin: selectIsUserAdmin(state),
  myId: selectSessionUserId(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  viewEntity: selectViewEntity(state, props.params.id),
  taxonomies: selectTaxonomiesWithCategories(state),
  actionsByActiontype: selectActionsByType(state, props.params.id),
  actionConnections: selectActionConnections(state),
});

function mapDispatchToProps(dispatch, props) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    handleEdit: () => {
      dispatch(updatePath(`${ROUTES.INDICATOR}${ROUTES.EDIT}/${props.params.id}`, { replace: true }));
    },
    handleClose: () => {
      dispatch(closeEntity(ROUTES.INDICATORS));
    },
    onEntityClick: (id, path) => {
      dispatch(updatePath(`${path}/${id}`));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(IndicatorView);
