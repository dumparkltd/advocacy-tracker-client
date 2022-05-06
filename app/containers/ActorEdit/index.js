/*
 *
 * ActorEdit
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { actions as formActions } from 'react-redux-form/immutable';
import { Map, fromJS } from 'immutable';

import {
  entityOptions,
  taxonomyOptions,
  getTitleFormField,
  getStatusField,
  getMarkdownFormField,
  getCodeFormField,
  renderTaxonomyControl,
  getLinkFormField,
  getAmountFormField,
  getNumberFormField,
  getCategoryUpdatesFromFormData,
  renderActionsByActiontypeControl,
  renderActionsAsTargetByActiontypeControl,
  renderAssociationsByActortypeControl,
  renderMembersByActortypeControl,
  getConnectionUpdatesFromFormData,
  getEmailField,
  getTextFormField,
  getTextareaField,
  renderUserMultiControl,
} from 'utils/forms';
import { getInfoField, getMetaField } from 'utils/fields';

import { scrollToTop } from 'utils/scroll-to-component';
import { hasNewError } from 'utils/entity-form';
import { checkActorAttribute, checkActorRequired } from 'utils/entities';

import { CONTENT_SINGLE } from 'containers/App/constants';
import { USER_ROLES, ROUTES, API } from 'themes/config';
import appMessages from 'containers/App/messages';

import {
  loadEntitiesIfNeeded,
  redirectIfNotPermitted,
  updatePath,
  updateEntityForm,
  deleteEntity,
  openNewEntityModal,
  submitInvalid,
  saveErrorDismiss,
} from 'containers/App/actions';

import {
  selectReady,
  selectReadyForAuthCheck,
  selectIsUserAdmin,
} from 'containers/App/selectors';

import Messages from 'components/Messages';
import Loading from 'components/Loading';
import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';
import EntityForm from 'containers/EntityForm';

import {
  selectDomain,
  selectViewEntity,
  selectTaxonomyOptions,
  selectActionsByActiontype,
  selectActionsAsTargetByActiontype,
  selectConnectedTaxonomies,
  selectMembersByActortype,
  selectAssociationsByActortype,
  selectUserOptions,
} from './selectors';

import messages from './messages';
import { save } from './actions';
import { DEPENDENCIES, FORM_INITIAL } from './constants';

export class ActorEdit extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.scrollContainer = React.createRef();
  }

  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
    if (this.props.dataReady && this.props.viewEntity) {
      this.props.initialiseForm('actorEdit.form.data', this.getInitialFormData());
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
    // repopulate if new data becomes ready
    if (nextProps.dataReady && !this.props.dataReady && nextProps.viewEntity) {
      this.props.initialiseForm('actorEdit.form.data', this.getInitialFormData(nextProps));
    }
    if (nextProps.authReady && !this.props.authReady) {
      this.props.redirectIfNotPermitted();
    }
    if (hasNewError(nextProps, this.props) && this.scrollContainer) {
      scrollToTop(this.scrollContainer.current);
    }
  }

  getInitialFormData = (nextProps) => {
    const props = nextProps || this.props;
    const {
      viewEntity,
      taxonomies,
      actionsByActiontype,
      actionsAsTargetByActiontype,
      membersByActortype,
      associationsByActortype,
      userOptions,
    } = props;
    return viewEntity
      ? Map({
        id: viewEntity.get('id'),
        attributes: viewEntity.get('attributes').mergeWith(
          (oldVal, newVal) => oldVal === null ? newVal : oldVal,
          FORM_INITIAL.get('attributes')
        ),
        associatedTaxonomies: taxonomyOptions(taxonomies),
        associatedActionsByActiontype: actionsByActiontype
          ? actionsByActiontype.map((actions) => entityOptions(actions, true))
          : Map(),
        associatedActionsAsTargetByActiontype: actionsAsTargetByActiontype
          ? actionsAsTargetByActiontype.map((actions) => entityOptions(actions, true))
          : Map(),
        associatedMembersByActortype: membersByActortype
          ? membersByActortype.map((actors) => entityOptions(actors, true))
          : Map(),
        associatedAssociationsByActortype: associationsByActortype
          ? associationsByActortype.map((actors) => entityOptions(actors, true))
          : Map(),
        associatedUsers: userOptions
          ? entityOptions(userOptions, true)
          : Map(),
      })
      : Map();
  };

  getHeaderMainFields = (entity) => {
    const { intl } = this.context;
    const typeId = entity.getIn(['attributes', 'actortype_id']);
    return (
      [ // fieldGroups
        { // fieldGroup
          fields: [
            getInfoField(
              'actortype_id',
              intl.formatMessage(appMessages.actortypes[typeId]),
              true // large
            ), // required
            checkActorAttribute(typeId, 'code') && getCodeFormField(
              intl.formatMessage,
              'code',
              checkActorRequired(typeId, 'code'),
            ),
            checkActorAttribute(typeId, 'prefix') && getCodeFormField(
              intl.formatMessage,
              'prefix',
              checkActorRequired(typeId, 'prefix'),
            ),
            checkActorAttribute(typeId, 'title') && getTitleFormField(
              intl.formatMessage,
              'title',
              'title',
              checkActorRequired(typeId, 'title'),
            ),
            checkActorAttribute(typeId, 'name') && getTitleFormField(
              intl.formatMessage,
              'title',
              'title',
              checkActorRequired(typeId, 'name'),
              'name' // label
            ),
          ],
        },
      ]
    );
  };

  getHeaderAsideFields = (entity, taxonomies, onCreateOption) => {
    const { intl } = this.context;
    return ([
      {
        fields: [
          getStatusField(intl.formatMessage),
          getMetaField(entity),
        ],
      },
      { // fieldGroup
        label: intl.formatMessage(appMessages.entities.taxonomies.plural),
        icon: 'categories',
        fields: renderTaxonomyControl(taxonomies, onCreateOption, intl),
      },
    ]);
  };

  getBodyMainFields = (
    entity,
    connectedTaxonomies,
    actionsByActiontype,
    actionsAsTargetByActiontype,
    membersByActortype,
    associationsByActortype,
    userOptions,
    onCreateOption,
  ) => {
    const { intl } = this.context;
    const typeId = entity.getIn(['attributes', 'actortype_id']);
    const groups = [];
    groups.push(
      {
        fields: [
          checkActorAttribute(typeId, 'description') && getMarkdownFormField(
            intl.formatMessage,
            checkActorRequired(typeId, 'description'),
            'description',
          ),
          checkActorAttribute(typeId, 'activity_summary') && getMarkdownFormField(
            intl.formatMessage,
            checkActorRequired(typeId, 'activity_summary'),
            'activity_summary',
          ),
        ],
      },
    );
    if (userOptions) {
      const userConnections = renderUserMultiControl(
        userOptions,
        null,
        intl,
      );
      if (userConnections) {
        groups.push(
          {
            label: intl.formatMessage(appMessages.nav.userActors),
            fields: [userConnections],
          },
        );
      }
    }
    if (actionsByActiontype) {
      const actionConnections = renderActionsByActiontypeControl(
        actionsByActiontype,
        connectedTaxonomies,
        onCreateOption,
        intl,
      );
      if (actionConnections) {
        groups.push(
          {
            label: intl.formatMessage(appMessages.nav.actions),
            fields: actionConnections,
          },
        );
      }
    }
    if (actionsAsTargetByActiontype) {
      const actionConnections = renderActionsAsTargetByActiontypeControl(
        actionsAsTargetByActiontype,
        connectedTaxonomies,
        onCreateOption,
        intl,
      );
      if (actionConnections) {
        groups.push(
          {
            label: intl.formatMessage(appMessages.nav.targetingActions),
            fields: actionConnections,
          },
        );
      }
    }
    if (membersByActortype) {
      const memberConnections = renderMembersByActortypeControl(
        membersByActortype,
        connectedTaxonomies,
        onCreateOption,
        intl,
      );
      if (memberConnections) {
        groups.push(
          {
            label: intl.formatMessage(appMessages.nav.members),
            fields: memberConnections,
          },
        );
      }
    }
    if (associationsByActortype) {
      const associationConnections = renderAssociationsByActortypeControl(
        associationsByActortype,
        connectedTaxonomies,
        onCreateOption,
        intl,
      );
      if (associationConnections) {
        groups.push(
          {
            label: intl.formatMessage(appMessages.nav.associations),
            fields: associationConnections,
          },
        );
      }
    }
    return groups;
  }

  getBodyAsideFields = (entity) => {
    const { intl } = this.context;
    const typeId = entity.getIn(['attributes', 'actortype_id']);

    return ([ // fieldGroups
      { // fieldGroup
        fields: [
          checkActorAttribute(typeId, 'address') && getTextareaField(intl.formatMessage, 'address', checkActorRequired(typeId, 'address')),
          checkActorAttribute(typeId, 'phone') && getTextFormField(intl.formatMessage, 'phone', checkActorRequired(typeId, 'phone')),
          checkActorAttribute(typeId, 'email') && getEmailField(intl.formatMessage, checkActorRequired(typeId, 'email')),
          checkActorAttribute(typeId, 'url') && getLinkFormField(
            intl.formatMessage,
            checkActorRequired(typeId, 'url'),
            'url',
          ),
        ],
      },
      { // fieldGroup
        fields: [
          checkActorAttribute(typeId, 'gdp') && getAmountFormField(
            intl.formatMessage,
            checkActorRequired(typeId, 'gdp'),
            'gdp',
          ),
          checkActorAttribute(typeId, 'population') && getNumberFormField(
            intl.formatMessage,
            checkActorRequired(typeId, 'population'),
            'population',
          ),
        ],
      },
    ]);
  };

  render() {
    const { intl } = this.context;
    const {
      viewEntity,
      dataReady,
      viewDomain,
      taxonomies,
      connectedTaxonomies,
      actionsByActiontype,
      actionsAsTargetByActiontype,
      membersByActortype,
      associationsByActortype,
      userOptions,
      onCreateOption,
    } = this.props;
    const typeId = viewEntity && viewEntity.getIn(['attributes', 'actortype_id']);

    const {
      saveSending, saveError, deleteSending, deleteError, submitValid,
    } = viewDomain.get('page').toJS();

    const type = intl.formatMessage(
      appMessages.entities[typeId ? `actors_${typeId}` : 'actors'].single
    );
    return (
      <div>
        <Helmet
          title={`${intl.formatMessage(messages.pageTitle, { type })}`}
          meta={[
            { name: 'description', content: intl.formatMessage(messages.metaDescription) },
          ]}
        />
        <Content ref={this.scrollContainer}>
          <ContentHeader
            title={intl.formatMessage(messages.pageTitle, { type })}
            type={CONTENT_SINGLE}
            buttons={
              viewEntity && dataReady ? [{
                type: 'cancel',
                onClick: this.props.handleCancel,
              },
              {
                type: 'save',
                disabled: saveSending,
                onClick: () => this.props.handleSubmitRemote('actorEdit.form.data'),
              }] : null
            }
          />
          {!submitValid
            && (
              <Messages
                type="error"
                messageKey="submitInvalid"
                onDismiss={this.props.onErrorDismiss}
              />
            )
          }
          {saveError
            && (
              <Messages
                type="error"
                messages={saveError.messages}
                onDismiss={this.props.onServerErrorDismiss}
              />
            )
          }
          {deleteError
            && <Messages type="error" messages={deleteError} />
          }
          {(saveSending || deleteSending || !dataReady)
            && <Loading />
          }
          {!viewEntity && dataReady && !saveError && !deleteSending
            && (
              <div>
                <FormattedMessage {...messages.notFound} />
              </div>
            )
          }
          {viewEntity && dataReady && !deleteSending
            && (
              <EntityForm
                model="actorEdit.form.data"
                formData={viewDomain.getIn(['form', 'data'])}
                saving={saveSending}
                handleSubmit={(formData) => this.props.handleSubmit(
                  formData,
                  taxonomies,
                  actionsByActiontype,
                  actionsAsTargetByActiontype,
                  membersByActortype,
                  associationsByActortype,
                  userOptions,
                )}
                handleSubmitFail={this.props.handleSubmitFail}
                handleCancel={this.props.handleCancel}
                handleUpdate={this.props.handleUpdate}
                handleDelete={this.props.isUserAdmin ? this.props.handleDelete : null}
                fields={{
                  header: {
                    main: this.getHeaderMainFields(viewEntity),
                    aside: this.getHeaderAsideFields(
                      viewEntity,
                      taxonomies,
                      onCreateOption,
                    ),
                  },
                  body: {
                    main: this.getBodyMainFields(
                      viewEntity,
                      connectedTaxonomies,
                      actionsByActiontype,
                      actionsAsTargetByActiontype,
                      membersByActortype,
                      associationsByActortype,
                      userOptions,
                      onCreateOption,
                    ),
                    aside: this.getBodyAsideFields(
                      viewEntity
                    ),
                  },
                }}
                scrollContainer={this.scrollContainer.current}
              />
            )
          }
          { (saveSending || deleteSending)
            && <Loading />
          }
        </Content>
      </div>
    );
  }
}

ActorEdit.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  redirectIfNotPermitted: PropTypes.func,
  initialiseForm: PropTypes.func,
  handleSubmitRemote: PropTypes.func.isRequired,
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  viewDomain: PropTypes.object,
  viewEntity: PropTypes.object,
  dataReady: PropTypes.bool,
  authReady: PropTypes.bool,
  isUserAdmin: PropTypes.bool,
  params: PropTypes.object,
  taxonomies: PropTypes.object,
  actionsByActiontype: PropTypes.object,
  actionsAsTargetByActiontype: PropTypes.object,
  membersByActortype: PropTypes.object,
  associationsByActortype: PropTypes.object,
  onCreateOption: PropTypes.func,
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  connectedTaxonomies: PropTypes.object,
  userOptions: PropTypes.object,
};

ActorEdit.contextTypes = {
  intl: PropTypes.object.isRequired,
};
const mapStateToProps = (state, props) => ({
  viewDomain: selectDomain(state),
  isUserAdmin: selectIsUserAdmin(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  authReady: selectReadyForAuthCheck(state),
  viewEntity: selectViewEntity(state, props.params.id),
  taxonomies: selectTaxonomyOptions(state, props.params.id),
  actionsByActiontype: selectActionsByActiontype(state, props.params.id),
  actionsAsTargetByActiontype: selectActionsAsTargetByActiontype(state, props.params.id),
  membersByActortype: selectMembersByActortype(state, props.params.id),
  associationsByActortype: selectAssociationsByActortype(state, props.params.id),
  connectedTaxonomies: selectConnectedTaxonomies(state),
  userOptions: selectUserOptions(state, props.params.id),
});

function mapDispatchToProps(dispatch, props) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    redirectIfNotPermitted: () => {
      dispatch(redirectIfNotPermitted(USER_ROLES.MANAGER.value));
    },
    initialiseForm: (model, formData) => {
      dispatch(formActions.reset(model));
      dispatch(formActions.change(model, formData, { silent: true }));
    },
    onErrorDismiss: () => {
      dispatch(submitInvalid(true));
    },
    onServerErrorDismiss: () => {
      dispatch(saveErrorDismiss());
    },
    handleSubmitFail: () => {
      dispatch(submitInvalid(false));
    },
    handleSubmitRemote: (model) => {
      dispatch(formActions.submit(model));
    },
    handleSubmit: (
      formData,
      taxonomies,
      actionsByActiontype,
      actionsAsTargetByActiontype,
      membersByActortype,
      associationsByActortype,
      userOptions,
    ) => {
      let saveData = formData
        .set(
          'actorCategories',
          getCategoryUpdatesFromFormData({
            formData,
            taxonomies,
            createKey: 'actor_id',
          })
        );
      if (actionsByActiontype) {
        saveData = saveData.set(
          'actorActions',
          actionsByActiontype
            .map((actions, actiontypeid) => getConnectionUpdatesFromFormData({
              formData,
              connections: actions,
              connectionAttribute: ['associatedActionsByActiontype', actiontypeid.toString()],
              createConnectionKey: 'measure_id',
              createKey: 'actor_id',
            }))
            .reduce(
              (memo, deleteCreateLists) => {
                const deletes = memo.get('delete').concat(deleteCreateLists.get('delete'));
                const creates = memo.get('create').concat(deleteCreateLists.get('create'));
                return memo
                  .set('delete', deletes)
                  .set('create', creates);
              },
              fromJS({
                delete: [],
                create: [],
              }),
            )
        );
      }
      if (actionsAsTargetByActiontype) {
        saveData = saveData.set(
          'actionActors',
          actionsAsTargetByActiontype
            .map((actions, actiontypeid) => getConnectionUpdatesFromFormData({
              formData,
              connections: actions,
              connectionAttribute: ['associatedActionsAsTargetByActiontype', actiontypeid.toString()],
              createConnectionKey: 'measure_id',
              createKey: 'actor_id',
            }))
            .reduce(
              (memo, deleteCreateLists) => {
                const deletes = memo.get('delete').concat(deleteCreateLists.get('delete'));
                const creates = memo.get('create').concat(deleteCreateLists.get('create'));
                return memo
                  .set('delete', deletes)
                  .set('create', creates);
              },
              fromJS({
                delete: [],
                create: [],
              }),
            )
        );
      }
      if (membersByActortype) {
        saveData = saveData.set(
          'memberships',
          membersByActortype
            .map((members, typeid) => getConnectionUpdatesFromFormData({
              formData,
              connections: members,
              connectionAttribute: ['associatedMembersByActortype', typeid.toString()],
              createConnectionKey: 'member_id',
              createKey: 'memberof_id',
            }))
            .reduce(
              (memo, deleteCreateLists) => {
                const deletes = memo.get('delete').concat(deleteCreateLists.get('delete'));
                const creates = memo.get('create').concat(deleteCreateLists.get('create'));
                return memo
                  .set('delete', deletes)
                  .set('create', creates);
              },
              fromJS({
                delete: [],
                create: [],
              }),
            )
        );
      }
      if (associationsByActortype) {
        saveData = saveData.set(
          'associations',
          associationsByActortype
            .map((associations, typeid) => getConnectionUpdatesFromFormData({
              formData,
              connections: associations,
              connectionAttribute: ['associatedAssociationsByActortype', typeid.toString()],
              createConnectionKey: 'memberof_id',
              createKey: 'member_id',
            }))
            .reduce(
              (memo, deleteCreateLists) => {
                const deletes = memo.get('delete').concat(deleteCreateLists.get('delete'));
                const creates = memo.get('create').concat(deleteCreateLists.get('create'));
                return memo
                  .set('delete', deletes)
                  .set('create', creates);
              },
              fromJS({
                delete: [],
                create: [],
              }),
            )
        );
      }
      if (userOptions) {
        saveData = saveData.set(
          'userActors',
          getConnectionUpdatesFromFormData({
            formData,
            connections: userOptions,
            connectionAttribute: 'associatedUsers',
            createConnectionKey: 'user_id',
            createKey: 'actor_id',
          })
        );
      }
      // console.log(saveData.toJS());
      dispatch(save(saveData.toJS()));
    },
    handleCancel: () => {
      dispatch(updatePath(`${ROUTES.ACTOR}/${props.params.id}`, { replace: true }));
    },
    handleUpdate: (formData) => {
      dispatch(updateEntityForm(formData));
    },
    handleDelete: () => {
      dispatch(deleteEntity({
        path: API.ACTORS,
        id: props.params.id,
        redirect: ROUTES.ACTORS,
      }));
    },
    onCreateOption: (args) => {
      dispatch(openNewEntityModal(args));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActorEdit);
