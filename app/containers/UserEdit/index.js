/*
 *
 * UserEdit
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { actions as formActions } from 'react-redux-form/immutable';
import { Map, List, fromJS } from 'immutable';

import {
  entityOptions,
  taxonomyOptions,
  getTitleFormField,
  getEmailField,
  getHighestUserRoleId,
  getRoleFormField,
  renderActorsByActortypeControl,
  renderActionsByActiontypeControl,
  getConnectionUpdatesFromFormData,
} from 'utils/forms';

import {
  getMetaField,
  getRoleField,
} from 'utils/fields';

import { scrollToTop } from 'utils/scroll-to-component';
import { hasNewError } from 'utils/entity-form';
import { qe } from 'utils/quasi-equals';

import {
  loadEntitiesIfNeeded,
  updatePath,
  updateEntityForm,
  submitInvalid,
  saveErrorDismiss,
  openNewEntityModal,
} from 'containers/App/actions';

import {
  selectReady,
  selectSessionUserHighestRoleId,
  selectIsUserMember,
  selectIsUserAdmin,
  selectTaxonomiesWithCategories,
} from 'containers/App/selectors';

import { CONTENT_SINGLE } from 'containers/App/constants';
import { ROUTES, USER_ROLES, ACTORTYPES } from 'themes/config';

import Messages from 'components/Messages';
import Loading from 'components/Loading';
import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';
import EntityForm from 'containers/EntityForm';

import appMessages from 'containers/App/messages';

import {
  selectDomain,
  selectViewEntity,
  selectRoles,
  selectActionsByActiontype,
  selectActorsByActortype,
} from './selectors';

import { save } from './actions';
import messages from './messages';
import { DEPENDENCIES, FORM_INITIAL } from './constants';

export class UserEdit extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.scrollContainer = React.createRef();
  }

  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
    if (this.props.dataReady && this.props.viewEntity) {
      this.props.initialiseForm('userEdit.form.data', this.getInitialFormData());
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
    if (nextProps.dataReady && !this.props.dataReady && nextProps.viewEntity) {
      this.props.initialiseForm('userEdit.form.data', this.getInitialFormData(nextProps));
    }
    if (hasNewError(nextProps, this.props) && this.scrollContainer) {
      scrollToTop(this.scrollContainer.current);
    }
  }

  getInitialFormData = (nextProps) => {
    const props = nextProps || this.props;
    const {
      taxonomies,
      roles,
      viewEntity,
      actorsByActortype,
      actionsByActiontype,
      isAdmin,
    } = props;

    return Map({
      id: viewEntity.get('id'),
      attributes: viewEntity.get('attributes').mergeWith(
        (oldVal, newVal) => oldVal === null ? newVal : oldVal,
        FORM_INITIAL.get('attributes')
      ),
      associatedTaxonomies: taxonomyOptions(taxonomies),
      associatedRole: getHighestUserRoleId(roles),
      associatedActorsByActortype: actorsByActortype
        ? actorsByActortype.map(
          (actors, typeId) => entityOptions({
            entities: actors,
            showCode: isAdmin || qe(typeId, ACTORTYPES.COUNTRY),
          })
        )
        : Map(),
      associatedActionsByActiontype: actionsByActiontype
        ? actionsByActiontype.map(
          (actions) => entityOptions({
            entities: actions,
            showCode: isAdmin,
          })
        )
        : Map(),
    });
  }

  getHeaderMainFields = () => {
    const { intl } = this.context;
    return ([{ // fieldGroup
      fields: [getTitleFormField(intl.formatMessage, 'title', 'name')],
    }, {
      fields: [getEmailField(intl.formatMessage)],
    }]);
  };

  getHeaderAsideFields = (entity, roles) => {
    const { intl } = this.context;
    return ([
      {
        fields: (roles && roles.size > 0) ? [
          getRoleFormField(intl.formatMessage, roles),
          getMetaField(entity, true),
        ]
          : [
            getRoleField(entity),
            getMetaField(entity, true),
          ],
      },
    ]);
  };

  getBodyMainFields = (
    actorsByActortype,
    actionsByActiontype,
    connectedTaxonomies,
    onCreateOption,
    isAdmin,
  ) => {
    const { intl } = this.context;
    const groups = [];
    if (actorsByActortype) {
      const actorConnections = renderActorsByActortypeControl({
        entitiesByActortype: actorsByActortype,
        taxonomies: connectedTaxonomies,
        onCreateOption,
        intl,
        isAdmin,
      });
      if (actorConnections) {
        groups.push(
          {
            label: intl.formatMessage(appMessages.nav.actorUsers),
            fields: actorConnections,
          },
        );
      }
    }
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
            label: intl.formatMessage(appMessages.nav.actionUsers),
            fields: actionConnections,
          },
        );
      }
    }
    return groups;
  };

  // only admins can assign any roles to any other user TODO check
  getEditableUserRoles = (roles, sessionUserHighestRoleId) => roles && (sessionUserHighestRoleId === USER_ROLES.ADMIN.value)
    ? roles
    : Map();
  //   if (roles) {
  //     // const userHighestRoleId = getHighestUserRoleId(roles);
  //     // const userHighestRole = Object.values(USER_ROLES).find((r) => qe(r.value, userHighestRoleId));
  //     // const sessionUserHighestRole = Object.values(USER_ROLES).find((r) => qe(r.value, sessionUserHighestRoleId));
  //
  //     // TODO check!!
  //     // roles are editable by the session user (logged on user) if
  //     // the session user is an ADMIN
  //     // the session user can only assign roles "lower" (that is higher id) than his/her own role
  //     // and when the session user has a "higher" (lower id) role than the user profile being edited
  //     // only admins can assign any roles to any other user
  //     // if (sessionUserHighestRoleId === USER_ROLES.ADMIN.value) {
  //     // }
  //     return sessionUserHighestRoleId === USER_ROLES.ADMIN.value ? roles : Map();
  //     // // other users can only assign roles to users that have a lower role / higher order
  //     // if (sessionUserHighestRole.order < userHighestRole.order) {
  //     //   return roles.filter(
  //     //     (role) => {
  //     //       // also can only assign roles than their own role
  //     //       const theRole = Object.values(USER_ROLES).find((r) => qe(r.value, parseInt(role.get('id'), 10)));
  //     //       return sessionUserHighestRole.order < theRole.order;
  //     //     }
  //     //   );
  //     // }
  //     // return Map();
  //   }
  //   return Map();
  // }

  render() {
    const { intl } = this.context;
    const {
      viewEntity,
      dataReady,
      viewDomain,
      roles,
      sessionUserHighestRoleId,
      actorsByActortype,
      actionsByActiontype,
      onCreateOption,
      connectedTaxonomies,
      isMember,
      isAdmin,
    } = this.props;
    const reference = this.props.params.id;
    const { saveSending, saveError, submitValid } = viewDomain.get('page').toJS();

    const editableRoles = this.getEditableUserRoles(roles, sessionUserHighestRoleId);

    return (
      <div>
        <Helmet
          title={`${intl.formatMessage(messages.pageTitle)}: ${reference}`}
          meta={[
            { name: 'description', content: intl.formatMessage(messages.metaDescription) },
          ]}
        />
        <Content ref={this.scrollContainer}>
          <ContentHeader
            title={intl.formatMessage(messages.pageTitle)}
            type={CONTENT_SINGLE}
            icon="users"
            buttons={
              viewEntity && [{
                type: 'cancel',
                onClick: () => this.props.handleCancel(this.props.params.id),
              },
              {
                type: 'save',
                disabled: saveSending,
                onClick: () => this.props.handleSubmitRemote('userEdit.form.data'),
              }]
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
          {(saveSending || !dataReady)
            && <Loading />
          }
          {!viewEntity && dataReady && !saveError
            && (
              <div>
                <FormattedMessage {...messages.notFound} />
              </div>
            )
          }
          {viewEntity && dataReady && (
            <EntityForm
              model="userEdit.form.data"
              formData={viewDomain.getIn(['form', 'data'])}
              saving={saveSending}
              handleSubmit={(formData) => this.props.handleSubmit(
                formData,
                roles,
                actorsByActortype,
                actionsByActiontype,
              )}
              handleSubmitFail={this.props.handleSubmitFail}
              handleCancel={() => this.props.handleCancel(reference)}
              handleUpdate={this.props.handleUpdate}
              fields={{
                header: {
                  main: this.getHeaderMainFields(),
                  aside: this.getHeaderAsideFields(viewEntity, editableRoles),
                },
                body: {
                  main: isMember && this.getBodyMainFields(
                    actorsByActortype,
                    actionsByActiontype,
                    connectedTaxonomies,
                    onCreateOption,
                    isAdmin,
                  ),
                  // aside: this.getBodyAsideFields(),
                },
              }}
              scrollContainer={this.scrollContainer.current}
            />
          )}
          { saveSending
            && <Loading />
          }
        </Content>
      </div>
    );
  }
}

UserEdit.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  initialiseForm: PropTypes.func,
  handleSubmitRemote: PropTypes.func.isRequired,
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  viewDomain: PropTypes.object,
  viewEntity: PropTypes.object,
  roles: PropTypes.object,
  isAdmin: PropTypes.bool,
  isMember: PropTypes.bool,
  dataReady: PropTypes.bool,
  sessionUserHighestRoleId: PropTypes.number,
  params: PropTypes.object,
  onCreateOption: PropTypes.func,
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  connectedTaxonomies: PropTypes.object,
  actorsByActortype: PropTypes.object,
  actionsByActiontype: PropTypes.object,
};

UserEdit.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => ({
  sessionUserHighestRoleId: selectSessionUserHighestRoleId(state),
  viewDomain: selectDomain(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  viewEntity: selectViewEntity(state, props.params.id),
  roles: selectRoles(state, props.params.id),
  actorsByActortype: selectActorsByActortype(state, props.params.id),
  actionsByActiontype: selectActionsByActiontype(state, props.params.id),
  connectedTaxonomies: selectTaxonomiesWithCategories(state),
  isMember: selectIsUserMember(state),
  isAdmin: selectIsUserAdmin(state),
});

function mapDispatchToProps(dispatch) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
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
    handleSubmit: (formData, roles, actorsByActortype, actionsByActiontype) => {
      let saveData = formData;
      // roles
      // higher is actually lower
      const newHighestRoleId = parseInt(formData.get('associatedRole'), 10);
      const newHighestRole = Object.values(USER_ROLES).find((role) => qe(role.value, newHighestRoleId));
      // store all higher roles (i.e. with lower order)
      const newRoleIds = newHighestRole.order === USER_ROLES.DEFAULT.order
        ? List()
        : roles.reduce(
          (memo, role) => {
            const theRole = Object.values(USER_ROLES).find((r) => qe(r.value, parseInt(role.get('id'), 10)));
            return newHighestRole.order <= theRole.order
              ? memo.push(role.get('id'))
              : memo;
          },
          List()
        );
      saveData = saveData.set('userRoles', Map({
        delete: roles.reduce((memo, role) => role.get('associated')
            && !newRoleIds.includes(role.get('id'))
            && !newRoleIds.includes(parseInt(role.get('id'), 10))
          ? memo.push(role.getIn(['associated', 'id']))
          : memo,
        List()),
        create: newRoleIds.reduce((memo, id) => roles.find((role) => role.get('id') === id && !role.get('associated'))
          ? memo.push(Map({ role_id: id, user_id: formData.get('id') }))
          : memo,
        List()),
      }));

      if (actionsByActiontype) {
        saveData = saveData.set(
          'userActions',
          actionsByActiontype
            .map((actions, actiontypeid) => getConnectionUpdatesFromFormData({
              formData,
              connections: actions,
              connectionAttribute: ['associatedActionsByActiontype', actiontypeid.toString()],
              createConnectionKey: 'measure_id',
              createKey: 'user_id',
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
      if (actorsByActortype) {
        saveData = saveData.set(
          'userActors',
          actorsByActortype
            .map((actors, actortypeid) => getConnectionUpdatesFromFormData({
              formData,
              connections: actors,
              connectionAttribute: ['associatedActorsByActortype', actortypeid.toString()],
              createConnectionKey: 'actor_id',
              createKey: 'user_id',
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

      dispatch(save(saveData.toJS()));
    },
    handleCancel: (reference) => {
      dispatch(updatePath(`${ROUTES.USERS}/${reference}`, { replace: true }));
    },
    handleUpdate: (formData) => {
      dispatch(updateEntityForm(formData));
    },
    onCreateOption: (args) => {
      dispatch(openNewEntityModal(args));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserEdit);
