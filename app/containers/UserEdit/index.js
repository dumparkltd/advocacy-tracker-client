/*
 *
 * UserEdit
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { actions as formActions } from 'react-redux-form/immutable';
import { Map, List, fromJS } from 'immutable';

import {
  entityOptions,
  taxonomyOptions,
  getHighestUserRoleId,
  getConnectionUpdatesFromFormData,
  getEntityFormFields,
} from 'utils/forms';


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
  invalidateEntities,
  redirectIfNotSignedIn,
} from 'containers/App/actions';

import {
  selectReady,
  selectSessionUserHighestRoleId,
  selectIsUserMember,
  selectIsUserAdmin,
  selectTaxonomiesWithCategories,
  selectStepQuery,
} from 'containers/App/selectors';

import {
  ROUTES, USER_ROLES, ACTORTYPES, USER_CONFIG,
} from 'themes/config';

import Loading from 'components/Loading';
import Content from 'components/Content';
import ContentHeader from 'containers/ContentHeader';
import EntityFormWrapper from 'containers/EntityForm/EntityFormWrapper';

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
    this.props.onInvalidateEntities();
    this.props.redirectIfNotSignedIn();
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
      step,
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
      step,
    });
  };

  // only admins can assign any roles to any other user TODO check
  getEditableUserRoles = (roles, sessionUserHighestRoleId) => roles && (sessionUserHighestRoleId === USER_ROLES.ADMIN.value)
    ? roles
    : Map();

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
      handleCancel,
      handleSubmitRemote,
      handleSubmit,
      handleSubmitFail,
      handleUpdate,
      onErrorDismiss,
      onServerErrorDismiss,
      isMember,
      isAdmin,
      myId,
    } = this.props;
    const reference = this.props.params.id;
    const { saveSending } = viewDomain.get('page').toJS();
    const isMine = qe(myId, reference);
    const editableRoles = this.getEditableUserRoles(roles, sessionUserHighestRoleId);
    const formDataPath = 'userEdit.form.data';
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
          />
          {viewEntity && dataReady && (
            <EntityFormWrapper
              typeLabel="User"
              model={formDataPath}
              viewDomain={viewDomain}
              handleSubmit={(formData) => handleSubmit(
                formData,
                roles,
                actorsByActortype,
                actionsByActiontype,
              )}
              handleSubmitRemote={() => handleSubmitRemote(formDataPath)}
              saving={saveSending}
              handleSubmitFail={handleSubmitFail}
              handleCancel={() => handleCancel(reference)}
              handleUpdate={handleUpdate}
              onErrorDismiss={onErrorDismiss}
              onServerErrorDismiss={onServerErrorDismiss}
              scrollContainer={this.scrollContainer.current}
              fieldsByStep={dataReady && getEntityFormFields(
                {
                  isAdmin,
                  isMember,
                  isMine,
                  roleOptions: editableRoles,
                  actorsByActortype,
                  actionsByActiontype,
                  connectedTaxonomies,
                  onCreateOption,
                  intl,
                },
                USER_CONFIG.form, // shape
                USER_CONFIG.attributes, // attributes
              )}
            />
          )}
          {saveSending
            && <Loading />
          }
        </Content>
      </div>
    );
  }
}

UserEdit.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  onInvalidateEntities: PropTypes.func,
  redirectIfNotSignedIn: PropTypes.func,
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
  myId: PropTypes.string,
  dataReady: PropTypes.bool,
  sessionUserHighestRoleId: PropTypes.number,
  params: PropTypes.object,
  onCreateOption: PropTypes.func,
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  connectedTaxonomies: PropTypes.object,
  actorsByActortype: PropTypes.object,
  actionsByActiontype: PropTypes.object,
  step: PropTypes.object,
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
  step: selectStepQuery(state),
});

function mapDispatchToProps(dispatch) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onInvalidateEntities: () => {
      DEPENDENCIES.forEach((path) => {
        dispatch(invalidateEntities(path));
      });
    },
    redirectIfNotSignedIn: () => {
      dispatch(redirectIfNotSignedIn());
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
