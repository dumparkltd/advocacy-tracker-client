/*
 *
 * ActionView
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
  getMetaField,
  getMarkdownField,
  getDateField,
  getTextField,
  getInfoField,
  getLinkField,
  getAmountField,
  getTaxonomyFields,
  hasTaxonomyCategories,
  getActorConnectionField,
  getActionConnectionField,
  getResourceConnectionField,
  getIndicatorConnectionField,
  getUserConnectionField,
} from 'utils/fields';

// import { qe } from 'utils/quasi-equals';
import {
  getEntityTitleTruncated,
  checkActionAttribute,
} from 'utils/entities';

import { loadEntitiesIfNeeded, updatePath, closeEntity } from 'containers/App/actions';

import { CONTENT_SINGLE } from 'containers/App/constants';
import { ROUTES } from 'themes/config';

import Loading from 'components/Loading';
import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';
import EntityView from 'components/EntityView';

import {
  selectReady,
  selectIsUserManager,
  selectActorConnections,
  selectActionConnections,
  selectResourceConnections,
  selectIndicatorConnections,
  selectUserConnections,
  selectTaxonomiesWithCategories,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';
import messages from './messages';

import {
  selectViewEntity,
  selectViewTaxonomies,
  selectActorsByType,
  selectTargetsByType,
  selectResourcesByType,
  selectTopActionsByActiontype,
  selectSubActionsByActiontype,
  selectEntityIndicators,
  selectEntityUsers,
} from './selectors';

import { DEPENDENCIES } from './constants';

export class ActionView extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
  }

  getHeaderMainFields = (entity, isManager) => {
    const { intl } = this.context;
    const typeId = entity.getIn(['attributes', 'measuretype_id']);

    return ([ // fieldGroups
      { // fieldGroup
        fields: [
          getInfoField(
            'measuretype_id',
            intl.formatMessage(appMessages.actiontypes[typeId]),
            true // large
          ), // required
          checkActionAttribute(typeId, 'code', isManager) && getInfoField(
            'code',
            entity.getIn(['attributes', 'code']),
          ),
          checkActionAttribute(typeId, 'title') && getTitleField(entity),
        ],
      },
    ]);
  };

  getHeaderAsideFields = (entity, viewTaxonomies) => {
    const fields = ([
      {
        fields: [
          getStatusField(entity),
          getMetaField(entity),
        ],
      },
    ]);
    if (hasTaxonomyCategories(viewTaxonomies)) {
      fields.push({ // fieldGroup
        label: appMessages.entities.taxonomies.plural,
        icon: 'categories',
        fields: getTaxonomyFields(viewTaxonomies),
      });
    }
    return fields;
  };


  getBodyMainFields = (
    entity,
    actorsByActortype,
    targetsByActortype,
    resourcesByResourcetype,
    indicators,
    users,
    taxonomies,
    actorConnections,
    actionConnections,
    resourceConnections,
    indicatorConnections,
    userConnections,
    subActionsByType,
    topActionsByType,
    onEntityClick,
  ) => {
    const { intl } = this.context;
    const typeId = entity.getIn(['attributes', 'measuretype_id']);
    const fields = [];
    let hasLandbasedValue;
    if (checkActionAttribute(typeId, 'has_reference_landbased_ml')) {
      if (
        typeof entity.getIn(['attributes', 'has_reference_landbased_ml']) !== 'undefined'
        && entity.getIn(['attributes', 'has_reference_landbased_ml']) !== null
      ) {
        hasLandbasedValue = intl.formatMessage(
          appMessages.ui.checkAttributeStatuses[
            entity.getIn(['attributes', 'has_reference_landbased_ml']).toString()
          ],
        );
      }
    }
    // own attributes
    fields.push(
      {
        fields: [
          checkActionAttribute(typeId, 'description')
            && getMarkdownField(entity, 'description', true),
          checkActionAttribute(typeId, 'comment')
            && getMarkdownField(entity, 'comment', true),
        ],
      },
      {
        fields: [
          checkActionAttribute(typeId, 'reference_ml')
            && getMarkdownField(entity, 'reference_ml', true),
          checkActionAttribute(typeId, 'status_lbs_protocol')
            && getMarkdownField(entity, 'status_lbs_protocol', true),
          checkActionAttribute(typeId, 'has_reference_landbased_ml')
            && getInfoField(
              'has_reference_landbased_ml',
              hasLandbasedValue,
            ),
          checkActionAttribute(typeId, 'reference_landbased_ml')
            && getMarkdownField(entity, 'reference_landbased_ml', true),
        ],
      },
      {
        fields: [
          checkActionAttribute(typeId, 'target_comment')
            && getMarkdownField(entity, 'target_comment', true),
          checkActionAttribute(typeId, 'status_comment')
            && getMarkdownField(entity, 'status_comment', true),
        ],
      },
    );
    // indicators
    if (indicators) {
      const indicatorConnectionsLocal = [];
      indicatorConnectionsLocal.push(
        getIndicatorConnectionField({
          indicators,
          onEntityClick,
          connections: indicatorConnections,
          skipLabel: true,
        }),
      );
      fields.push({
        label: appMessages.nav.indicators,
        fields: indicatorConnectionsLocal,
      });
    }
    // users
    if (users) {
      const userConnectionsLocal = [];
      userConnectionsLocal.push(
        getUserConnectionField({
          users,
          onEntityClick,
          connections: userConnections,
          skipLabel: true,
        }),
      );
      fields.push({
        label: appMessages.nav.userActions,
        fields: userConnectionsLocal,
      });
    }
    // connected actions
    if (topActionsByType) {
      const actionConnectionsLocal = [];
      topActionsByType.forEach((actions, actiontypeid) => {
        actionConnectionsLocal.push(
          getActionConnectionField({
            actions,
            taxonomies,
            onEntityClick,
            connections: actionConnections,
            typeid: actiontypeid,
            // onCreateOption: () => onCreateOption({
            //   path: API.ACTIONS,
            //   attributes: {
            //     measuretype_id: actiontypeid,
            //   },
            //   connect: {
            //     type: 'actorActions',
            //     create: [{
            //       actor_id: entity.get('id'),
            //     }],
            //   },
            // }),
          }),
        );
      });
      fields.push({
        label: appMessages.entities.actions.topActions,
        fields: actionConnectionsLocal,
      });
    }
    if (subActionsByType) {
      const actionConnectionsLocal = [];
      subActionsByType.forEach((actions, actiontypeid) => {
        actionConnectionsLocal.push(
          getActionConnectionField({
            actions,
            taxonomies,
            onEntityClick,
            connections: actionConnections,
            typeid: actiontypeid,
            // onCreateOption: () => onCreateOption({
            //   path: API.ACTIONS,
            //   attributes: {
            //     measuretype_id: actiontypeid,
            //   },
            //   connect: {
            //     type: 'actorActions',
            //     create: [{
            //       actor_id: entity.get('id'),
            //     }],
            //   },
            // }),
          }),
        );
      });
      fields.push({
        label: appMessages.entities.actions.subActions,
        fields: actionConnectionsLocal,
      });
    }

    // actors
    if (actorsByActortype) {
      const actorConnectionsLocal = [];
      actorsByActortype.forEach((actors, actortypeid) => {
        actorConnectionsLocal.push(
          getActorConnectionField({
            actors,
            taxonomies,
            onEntityClick,
            connections: actorConnections,
            typeid: actortypeid,
          }),
        );
      });
      fields.push({
        label: appMessages.nav.actors,
        fields: actorConnectionsLocal,
      });
    }
    // // targets
    if (targetsByActortype) {
      const targetConnectionsLocal = [];
      targetsByActortype.forEach((targets, actortypeid) => {
        targetConnectionsLocal.push(
          getActorConnectionField({
            actors: targets,
            taxonomies,
            onEntityClick,
            connections: actorConnections,
            typeid: actortypeid,
          }),
        );
      });
      fields.push({
        label: appMessages.nav.targets,
        fields: targetConnectionsLocal,
      });
    }
    // // resurces
    if (resourcesByResourcetype) {
      const resourcesConnectionsLocal = [];
      resourcesByResourcetype.forEach((resources, resourcetypeid) => {
        resourcesConnectionsLocal.push(
          getResourceConnectionField({
            resources,
            onEntityClick,
            connections: resourceConnections,
            typeid: resourcetypeid,
          }),
        );
      });
      fields.push({
        label: appMessages.nav.resources,
        fields: resourcesConnectionsLocal,
      });
    }
    return fields;
  };

  getBodyAsideFields = (entity) => {
    const fields = [];
    const typeId = entity.getIn(['attributes', 'measuretype_id']);
    fields.push(
      {
        fields: [
          checkActionAttribute(typeId, 'url') && getLinkField(entity),
        ],
      },
      {
        type: 'dark',
        fields: [
          checkActionAttribute(typeId, 'amount') && getAmountField(entity, 'amount', true),
          checkActionAttribute(typeId, 'amount_comment') && getTextField(entity, 'amount_comment'),
        ],
      },
      {
        type: 'dark',
        fields: [
          checkActionAttribute(typeId, 'date_start') && getDateField(entity, 'date_start', true),
          checkActionAttribute(typeId, 'date_end') && getDateField(entity, 'date_end'),
          checkActionAttribute(typeId, 'date_comment') && getTextField(entity, 'date_comment'),
        ],
      }
    );
    return fields;
  };

  render() {
    const { intl } = this.context;
    const {
      viewEntity,
      dataReady,
      isManager,
      taxonomies,
      viewTaxonomies,
      actorsByActortype,
      targetsByActortype,
      resourcesByResourcetype,
      onEntityClick,
      actorConnections,
      actionConnections,
      resourceConnections,
      indicatorConnections,
      userConnections,
      indicators,
      users,
      subActionsByType,
      topActionsByType,
    } = this.props;
    const typeId = viewEntity && viewEntity.getIn(['attributes', 'measuretype_id']);
    let buttons = [];
    if (dataReady) {
      buttons.push({
        type: 'icon',
        onClick: () => window.print(),
        title: 'Print',
        icon: 'print',
      });
      buttons = isManager
        ? buttons.concat([
          {
            type: 'edit',
            onClick: this.props.handleEdit,
          },
          {
            type: 'close',
            onClick: () => this.props.handleClose(typeId),
          },
        ])
        : buttons.concat([{
          type: 'close',
          onClick: () => this.props.handleClose(typeId),
        }]);
    }
    const pageTitle = typeId
      ? intl.formatMessage(appMessages.entities[`actions_${typeId}`].single)
      : intl.formatMessage(appMessages.entities.actions.single);

    const metaTitle = viewEntity
      ? `${pageTitle}: ${getEntityTitleTruncated(viewEntity)}`
      : `${pageTitle}: ${this.props.params.id}`;

    return (
      <div>
        <Helmet
          title={metaTitle}
          meta={[
            { name: 'description', content: intl.formatMessage(messages.metaDescription) },
          ]}
        />
        <Content>
          <ContentHeader
            title={pageTitle}
            type={CONTENT_SINGLE}
            buttons={buttons}
          />
          { !dataReady
            && <Loading />
          }
          { !viewEntity && dataReady
            && (
              <div>
                <FormattedMessage {...messages.notFound} />
              </div>
            )
          }
          { viewEntity && dataReady
            && (
              <EntityView
                fields={{
                  header: {
                    main: this.getHeaderMainFields(viewEntity, isManager),
                    aside: this.getHeaderAsideFields(viewEntity, viewTaxonomies, isManager),
                  },
                  body: {
                    main: this.getBodyMainFields(
                      viewEntity,
                      actorsByActortype,
                      targetsByActortype,
                      resourcesByResourcetype,
                      indicators,
                      users,
                      taxonomies,
                      actorConnections,
                      actionConnections,
                      resourceConnections,
                      indicatorConnections,
                      userConnections,
                      subActionsByType,
                      topActionsByType,
                      onEntityClick,
                      isManager,
                    ),
                    aside: this.getBodyAsideFields(viewEntity, isManager),
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

ActionView.propTypes = {
  viewEntity: PropTypes.object,
  loadEntitiesIfNeeded: PropTypes.func,
  dataReady: PropTypes.bool,
  handleEdit: PropTypes.func,
  handleClose: PropTypes.func,
  onEntityClick: PropTypes.func,
  isManager: PropTypes.bool,
  viewTaxonomies: PropTypes.object,
  taxonomies: PropTypes.object,
  actorsByActortype: PropTypes.object,
  targetsByActortype: PropTypes.object,
  resourcesByResourcetype: PropTypes.object,
  actorConnections: PropTypes.object,
  actionConnections: PropTypes.object,
  resourceConnections: PropTypes.object,
  indicatorConnections: PropTypes.object,
  params: PropTypes.object,
  subActionsByType: PropTypes.object,
  topActionsByType: PropTypes.object,
  indicators: PropTypes.object,
  userConnections: PropTypes.object,
  users: PropTypes.object,
};

ActionView.contextTypes = {
  intl: PropTypes.object.isRequired,
};


const mapStateToProps = (state, props) => ({
  isManager: selectIsUserManager(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  viewEntity: selectViewEntity(state, props.params.id),
  viewTaxonomies: selectViewTaxonomies(state, props.params.id),
  taxonomies: selectTaxonomiesWithCategories(state),
  actorsByActortype: selectActorsByType(state, props.params.id),
  resourcesByResourcetype: selectResourcesByType(state, props.params.id),
  targetsByActortype: selectTargetsByType(state, props.params.id),
  indicators: selectEntityIndicators(state, props.params.id),
  actorConnections: selectActorConnections(state),
  actionConnections: selectActionConnections(state),
  resourceConnections: selectResourceConnections(state),
  indicatorConnections: selectIndicatorConnections(state),
  users: selectEntityUsers(state, props.params.id),
  userConnections: selectUserConnections(state),
  topActionsByType: selectTopActionsByActiontype(state, props.params.id),
  subActionsByType: selectSubActionsByActiontype(state, props.params.id),
});

function mapDispatchToProps(dispatch, props) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onEntityClick: (id, path) => {
      dispatch(updatePath(`${path}/${id}`));
    },
    handleEdit: () => {
      dispatch(updatePath(`${ROUTES.ACTION}${ROUTES.EDIT}/${props.params.id}`, { replace: true }));
    },
    handleClose: (typeId) => {
      dispatch(closeEntity(`${ROUTES.ACTIONS}/${typeId}`));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActionView);
