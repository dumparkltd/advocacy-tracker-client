/*
 *
 * ActorView
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
  getTextField,
  getInfoField,
  getLinkField,
  getAmountField,
  getTaxonomyFields,
  hasTaxonomyCategories,
  getActionConnectionField,
  getActorConnectionField,
  getEmailField,
} from 'utils/fields';
// import { qe } from 'utils/quasi-equals';
import { getEntityTitleTruncated, checkActorAttribute } from 'utils/entities';

import {
  loadEntitiesIfNeeded,
  updatePath,
  closeEntity,
  openNewEntityModal,
} from 'containers/App/actions';

import { CONTENT_SINGLE } from 'containers/App/constants';
import { ROUTES, API } from 'themes/config';

import Loading from 'components/Loading';
import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';
import EntityView from 'components/EntityView';

import {
  selectReady,
  selectIsUserManager,
  selectTaxonomiesWithCategories,
  selectActionConnections,
  // selectActiveActortypes,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';
import messages from './messages';

import {
  selectViewEntity,
  selectViewTaxonomies,
  selectActionsByType,
  selectActionsAsTargetByType,
  selectMembersByType,
  selectAssociationsByType,
} from './selectors';

import { DEPENDENCIES } from './constants';

export class ActorView extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
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
    const typeId = entity.getIn(['attributes', 'actortype_id']);
    return ([ // fieldGroups
      { // fieldGroup
        fields: [
          getInfoField(
            'actortype_id',
            intl.formatMessage(appMessages.actortypes[typeId]),
            true // large
          ), // required
          checkActorAttribute(typeId, 'code', isManager) && getInfoField(
            'code',
            entity.getIn(['attributes', 'code']),
          ),
          checkActorAttribute(typeId, 'title') && getTitleField(entity),
          checkActorAttribute(typeId, 'prefix', isManager) && getInfoField(
            'prefix',
            entity.getIn(['attributes', 'prefix']),
          ),
          checkActorAttribute(typeId, 'name') && getTitleField(entity),
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
    actionsByActiontype,
    actionsAsTargetByActiontype,
    membersByType,
    associationsByType,
    taxonomies,
    actionConnections,
    onEntityClick,
    onCreateOption,
  ) => {
    const fields = [];
    const typeId = entity.getIn(['attributes', 'actortype_id']);

    // own attributes
    fields.push(
      {
        fields: [
          checkActorAttribute(typeId, 'description')
            && getMarkdownField(entity, 'description', true),
          checkActorAttribute(typeId, 'activity_summary')
            && getMarkdownField(entity, 'activity_summary', true),
        ],
      },
    );
    // connected actions
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
            onCreateOption: () => onCreateOption({
              path: API.ACTIONS,
              attributes: {
                measuretype_id: actiontypeid,
              },
              connect: {
                type: 'actorActions',
                create: [{
                  actor_id: entity.get('id'),
                }],
              },
            }),
          }),
        );
      });
      fields.push({
        label: appMessages.nav.actions,
        fields: actionConnectionsLocal,
      });
    }
    // connected targets (actions)
    if (actionsAsTargetByActiontype) {
      const actionAsTargetConnectionsLocal = [];
      actionsAsTargetByActiontype.forEach((actions, actiontypeid) => {
        actionAsTargetConnectionsLocal.push(
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
        label: appMessages.nav.targetingActions,
        fields: actionAsTargetConnectionsLocal,
      });
    }
    // // connected members (actors)
    if (membersByType) {
      const memberConnectionsLocal = [];
      membersByType.forEach((actors, typeid) => {
        memberConnectionsLocal.push(
          getActorConnectionField({
            actors,
            taxonomies,
            onEntityClick,
            connections: actionConnections,
            typeid,
          }),
        );
      });
      fields.push({
        label: appMessages.nav.members,
        fields: memberConnectionsLocal,
      });
    }
    // // connected associations (actors)
    if (associationsByType) {
      const associationConnectionsLocal = [];
      associationsByType.forEach((actors, typeid) => {
        associationConnectionsLocal.push(
          getActorConnectionField({
            actors,
            taxonomies,
            onEntityClick,
            connections: actionConnections,
            typeid,
          }),
        );
      });
      fields.push({
        label: appMessages.nav.associations,
        fields: associationConnectionsLocal,
      });
    }
    return fields;
  };

  getBodyAsideFields = (entity) => {
    const fields = [];
    const typeId = entity.getIn(['attributes', 'actortype_id']);
    fields.push(
      {
        fields: [
          checkActorAttribute(typeId, 'address') && getTextField(entity, 'address'),
          checkActorAttribute(typeId, 'phone') && getTextField(entity, 'phone'),
          checkActorAttribute(typeId, 'email') && getEmailField(entity, 'email'),
          checkActorAttribute(typeId, 'url') && getLinkField(entity),
        ],
      },
      {
        type: 'dark',
        fields: [
          checkActorAttribute(typeId, 'gdp') && getAmountField(entity, 'gdp', true),
          checkActorAttribute(typeId, 'population') && getTextField(entity, 'population'),
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
      isManager,
      taxonomies,
      viewTaxonomies,
      actionsByActiontype,
      actionsAsTargetByActiontype,
      membersByType,
      associationsByType,
      actionConnections,
      onEntityClick,
      onCreateOption,
    } = this.props;
    const typeId = viewEntity && viewEntity.getIn(['attributes', 'actortype_id']);
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
            onClick: () => this.props.handleEdit(this.props.params.id),
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
      ? intl.formatMessage(appMessages.entities[`actors_${typeId}`].single)
      : intl.formatMessage(appMessages.entities.actors.single);

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
                      actionsByActiontype,
                      actionsAsTargetByActiontype,
                      membersByType,
                      associationsByType,
                      taxonomies,
                      actionConnections,
                      onEntityClick,
                      onCreateOption,
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

ActorView.propTypes = {
  viewEntity: PropTypes.object,
  loadEntitiesIfNeeded: PropTypes.func,
  dataReady: PropTypes.bool,
  handleEdit: PropTypes.func,
  handleClose: PropTypes.func,
  onEntityClick: PropTypes.func,
  viewTaxonomies: PropTypes.object,
  taxonomies: PropTypes.object,
  actionConnections: PropTypes.object,
  actionsByActiontype: PropTypes.object,
  actionsAsTargetByActiontype: PropTypes.object,
  membersByType: PropTypes.object,
  associationsByType: PropTypes.object,
  params: PropTypes.object,
  isManager: PropTypes.bool,
  onCreateOption: PropTypes.func,
};

ActorView.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => ({
  isManager: selectIsUserManager(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  viewEntity: selectViewEntity(state, props.params.id),
  viewTaxonomies: selectViewTaxonomies(state, props.params.id),
  taxonomies: selectTaxonomiesWithCategories(state),
  actionsByActiontype: selectActionsByType(state, props.params.id),
  actionsAsTargetByActiontype: selectActionsAsTargetByType(state, props.params.id),
  actionConnections: selectActionConnections(state),
  membersByType: selectMembersByType(state, props.params.id),
  associationsByType: selectAssociationsByType(state, props.params.id),
});

function mapDispatchToProps(dispatch, props) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    handleEdit: () => {
      dispatch(updatePath(`${ROUTES.ACTOR}${ROUTES.EDIT}/${props.params.id}`, { replace: true }));
    },
    handleClose: (typeId) => {
      dispatch(closeEntity(`${ROUTES.ACTORS}/${typeId}`));
    },
    onEntityClick: (id, path) => {
      dispatch(updatePath(`${path}/${id}`));
    },
    onCreateOption: (args) => {
      dispatch(openNewEntityModal(args));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActorView);
