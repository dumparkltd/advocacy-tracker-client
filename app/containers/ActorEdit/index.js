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
import { getMetaField } from 'utils/fields';

import { scrollToTop } from 'utils/scroll-to-component';
import { hasNewError } from 'utils/entity-form';
import { checkActorAttribute, checkActorRequired } from 'utils/entities';
import qe from 'utils/quasi-equals';

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
  selectSessionUserId,
  selectTaxonomiesWithCategories,
} from 'containers/App/selectors';

import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';
import FormWrapper from './FormWrapper';

import {
  selectDomainPage,
  selectViewEntity,
  selectTaxonomyOptions,
  selectActionsByActiontype,
  selectActionsAsTargetByActiontype,
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
          ? actionsByActiontype.map((actions) => entityOptions({ entities: actions }))
          : Map(),
        associatedActionsAsTargetByActiontype: actionsAsTargetByActiontype
          ? actionsAsTargetByActiontype.map((actions) => entityOptions({ entities: actions }))
          : Map(),
        associatedMembersByActortype: membersByActortype
          ? membersByActortype.map((actors) => entityOptions({ entities: actors }))
          : Map(),
        associatedAssociationsByActortype: associationsByActortype
          ? associationsByActortype.map((actors) => entityOptions({ entities: actors }))
          : Map(),
        associatedUsers: userOptions
          ? entityOptions({ entities: userOptions })
          : Map(),
      })
      : Map();
  };

  getHeaderMainFields = (entity, isAdmin) => {
    const { intl } = this.context;
    const typeId = entity.getIn(['attributes', 'actortype_id']);
    return (
      [ // fieldGroups
        { // fieldGroup
          fields: [
            checkActorAttribute(typeId, 'code', isAdmin) && getCodeFormField(
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

  getHeaderAsideFields = (entity, isAdmin, isMine) => {
    const { intl } = this.context;
    return ([
      {
        fields: [
          getStatusField(intl.formatMessage),
          (isAdmin || isMine) && getStatusField(intl.formatMessage, 'private'),
          isAdmin && getStatusField(intl.formatMessage, 'is_archive'),
          getMetaField(entity, true),
        ],
      },
    ]);
  };

  getBodyMainFields = (
    entity,
    connectedTaxonomies,
    actionsByActiontype,
    actionsAsTargetByActiontype,
    membersByActortype,
    onCreateOption,
    isAdmin,
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
    if (actionsByActiontype) {
      const actionConnections = renderActionsByActiontypeControl({
        entitiesByActiontype: actionsByActiontype,
        taxonomies: connectedTaxonomies,
        onCreateOption,
        intl,
        isAdmin,
      });
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
      const actionConnections = renderActionsAsTargetByActiontypeControl({
        entitiesByActiontype: actionsAsTargetByActiontype,
        taxonomies: connectedTaxonomies,
        onCreateOption,
        intl,
        isAdmin,
      });
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
      const memberConnections = renderMembersByActortypeControl({
        entitiesByActortype: membersByActortype,
        taxonomies: connectedTaxonomies,
        onCreateOption,
        intl,
        isAdmin,
      });
      if (memberConnections) {
        groups.push(
          {
            label: intl.formatMessage(appMessages.nav.members),
            fields: memberConnections,
          },
        );
      }
    }
    return groups;
  }

  getBodyAsideFields = (
    entity,
    taxonomies,
    connectedTaxonomies,
    associationsByActortype,
    userOptions,
    onCreateOption,
    isAdmin,
  ) => {
    const { intl } = this.context;
    const typeId = entity.getIn(['attributes', 'actortype_id']);

    const groups = [];// fieldGroups
    if (userOptions) {
      groups.push(
        {
          label: intl.formatMessage(appMessages.nav.userActors),
          fields: [
            renderUserMultiControl(userOptions, null, intl),
          ],
        },
      );
    }
    groups.push(
      { // fieldGroup
        fields: [
          checkActorAttribute(typeId, 'email') && getEmailField(intl.formatMessage, checkActorRequired(typeId, 'email')),
          checkActorAttribute(typeId, 'phone') && getTextFormField(intl.formatMessage, 'phone', checkActorRequired(typeId, 'phone')),
          checkActorAttribute(typeId, 'address') && getTextareaField(intl.formatMessage, 'address', checkActorRequired(typeId, 'address')),
          checkActorAttribute(typeId, 'url') && getLinkFormField(
            intl.formatMessage,
            checkActorRequired(typeId, 'url'),
            'url',
          ),
        ],
      },
    );
    groups.push(
      { // fieldGroup
        label: intl.formatMessage(appMessages.entities.taxonomies.plural),
        icon: 'categories',
        fields: renderTaxonomyControl({
          taxonomies, onCreateOption, intl,
        }),
      },
    );
    if (associationsByActortype) {
      const associationConnections = renderAssociationsByActortypeControl({
        entitiesByActortype: associationsByActortype,
        taxonomies: connectedTaxonomies,
        onCreateOption,
        intl,
        isAdmin,
      });
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
  };

  render() {
    const { intl } = this.context;
    const {
      viewEntity,
      dataReady,
      viewDomainPage,
      taxonomies,
      connectedTaxonomies,
      actionsByActiontype,
      actionsAsTargetByActiontype,
      membersByActortype,
      associationsByActortype,
      userOptions,
      onCreateOption,
      isAdmin,
      myId,
      onErrorDismiss,
      onServerErrorDismiss,
      handleCancel,
      handleSubmitRemote,
      handleSubmit,
      handleSubmitFail,
      handleUpdate,
      handleDelete,
    } = this.props;
    const typeId = viewEntity && viewEntity.getIn(['attributes', 'actortype_id']);

    const {
      saveSending, saveError, deleteSending,
    } = viewDomainPage.toJS();

    const typeLabel = intl.formatMessage(
      appMessages.entities[typeId ? `actors_${typeId}` : 'actors'].single
    );
    const isMine = viewEntity && qe(viewEntity.getIn(['attributes', 'created_by_id']), myId);

    return (
      <div>
        <Helmet
          title={`${intl.formatMessage(messages.pageTitle, { type: typeLabel })}`}
          meta={[
            { name: 'description', content: intl.formatMessage(messages.metaDescription) },
          ]}
        />
        <Content ref={this.scrollContainer}>
          <ContentHeader
            title={intl.formatMessage(messages.pageTitle, { type: typeLabel })}
            type={CONTENT_SINGLE}
            buttons={
              viewEntity && dataReady ? [{
                type: 'cancel',
                onClick: handleCancel,
              },
              {
                type: 'save',
                disabled: saveSending,
                onClick: () => handleSubmitRemote('actorEdit.form.data'),
              }] : null
            }
          />
          {!viewEntity && dataReady && !saveError && !deleteSending
            && (
              <div>
                <FormattedMessage {...messages.notFound} />
              </div>
            )
          }
          {viewEntity && !deleteSending
            && (
              <FormWrapper
                model="actorEdit.form.data"
                saving={saveSending}
                handleSubmit={(formData) => handleSubmit(
                  formData,
                  taxonomies,
                  actionsByActiontype,
                  actionsAsTargetByActiontype,
                  membersByActortype,
                  associationsByActortype,
                  userOptions,
                )}
                handleSubmitFail={handleSubmitFail}
                handleCancel={handleCancel}
                handleUpdate={handleUpdate}
                handleDelete={isAdmin ? () => handleDelete(typeId) : null}
                onErrorDismiss={onErrorDismiss}
                onServerErrorDismiss={onServerErrorDismiss}
                fields={dataReady && {
                  header: {
                    main: this.getHeaderMainFields(viewEntity, isAdmin),
                    aside: this.getHeaderAsideFields(viewEntity, isAdmin, isMine),
                  },
                  body: {
                    main: this.getBodyMainFields(
                      viewEntity,
                      connectedTaxonomies,
                      actionsByActiontype,
                      actionsAsTargetByActiontype,
                      membersByActortype,
                      onCreateOption,
                      isAdmin,
                    ),
                    aside: this.getBodyAsideFields(
                      viewEntity,
                      taxonomies,
                      connectedTaxonomies,
                      associationsByActortype,
                      userOptions,
                      onCreateOption,
                      isAdmin,
                    ),
                  },
                }}
                scrollContainer={this.scrollContainer.current}
              />
            )
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
  viewDomainPage: PropTypes.object,
  viewEntity: PropTypes.object,
  dataReady: PropTypes.bool,
  authReady: PropTypes.bool,
  isAdmin: PropTypes.bool,
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
  myId: PropTypes.string,
};

ActorEdit.contextTypes = {
  intl: PropTypes.object.isRequired,
};
const mapStateToProps = (state, props) => ({
  viewDomainPage: selectDomainPage(state),
  isAdmin: selectIsUserAdmin(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  authReady: selectReadyForAuthCheck(state),
  viewEntity: selectViewEntity(state, props.params.id),
  taxonomies: selectTaxonomyOptions(state, props.params.id),
  actionsByActiontype: selectActionsByActiontype(state, props.params.id),
  actionsAsTargetByActiontype: selectActionsAsTargetByActiontype(state, props.params.id),
  membersByActortype: selectMembersByActortype(state, props.params.id),
  associationsByActortype: selectAssociationsByActortype(state, props.params.id),
  connectedTaxonomies: selectTaxonomiesWithCategories(state),
  userOptions: selectUserOptions(state, props.params.id),
  myId: selectSessionUserId(state),
});

function mapDispatchToProps(dispatch, props) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    redirectIfNotPermitted: () => {
      dispatch(redirectIfNotPermitted(USER_ROLES.MEMBER.value));
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
    handleDelete: (typeId) => {
      dispatch(deleteEntity({
        path: API.ACTORS,
        id: props.params.id,
        redirect: `${ROUTES.ACTORS}/${typeId}`,
      }));
    },
    onCreateOption: (args) => {
      dispatch(openNewEntityModal(args));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActorEdit);
