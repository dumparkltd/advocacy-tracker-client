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
  getCategoryUpdatesFromFormData,
  getConnectionUpdatesFromFormData,
  getActortypeFormFields,
} from 'utils/forms';

import { scrollToTop } from 'utils/scroll-to-component';
import { hasNewError } from 'utils/entity-form';
import qe from 'utils/quasi-equals';

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
  invalidateEntities,
  redirectIfNotSignedIn,
} from 'containers/App/actions';

import {
  selectReady,
  selectReadyForAuthCheck,
  selectIsUserAdmin,
  selectIsUserMember,
  selectSessionUserId,
  selectTaxonomiesWithCategories,
  selectStepQuery,
} from 'containers/App/selectors';

import Content from 'components/Content';
import ContentHeader from 'containers/ContentHeader';
import EntityFormWrapper from 'containers/EntityForm/EntityFormWrapper';

import {
  selectDomainPage,
  selectViewEntity,
  selectTaxonomyOptions,
  selectActionsByActiontype,
  selectMembersByActortype,
  selectAssociationsByActortype,
  selectUserOptions,
  selectDomain,
} from './selectors';

import messages from './messages';
import { save } from './actions';
import { DEPENDENCIES, FORM_INITIAL, REDUCER_NAME } from './constants';

export class ActorEdit extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
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
      membersByActortype,
      associationsByActortype,
      userOptions,
      step,
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
        associatedMembersByActortype: membersByActortype
          ? membersByActortype.map((actors) => entityOptions({ entities: actors }))
          : Map(),
        associatedAssociationsByActortype: associationsByActortype
          ? associationsByActortype.map((actors) => entityOptions({ entities: actors }))
          : Map(),
        associatedUsers: userOptions
          ? entityOptions({ entities: userOptions })
          : Map(),
        step,
      })
      : Map();
  };

  render() {
    const { intl } = this.context;
    const {
      viewEntity,
      dataReady,
      viewDomain,
      viewDomainPage,
      taxonomies,
      connectedTaxonomies,
      actionsByActiontype,
      membersByActortype,
      associationsByActortype,
      userOptions,
      onCreateOption,
      isAdmin,
      isUserMember,
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
    const canDelete = isAdmin || (isUserMember && isMine);
    const formDataPath = `${REDUCER_NAME}.form.data`;
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
              <EntityFormWrapper
                viewDomain={viewDomain}
                typeLabel={typeLabel}
                model={formDataPath}
                saving={saveSending}
                handleSubmit={(formData) => handleSubmit(
                  formData,
                  taxonomies,
                  actionsByActiontype,
                  membersByActortype,
                  associationsByActortype,
                  userOptions,
                )}
                handleSubmitRemote={() => handleSubmitRemote(formDataPath)}
                handleSubmitFail={handleSubmitFail}
                handleCancel={handleCancel}
                handleUpdate={(data) => handleUpdate(data, REDUCER_NAME)}
                handleDelete={canDelete ? () => handleDelete(typeId) : null}
                onErrorDismiss={onErrorDismiss}
                onServerErrorDismiss={onServerErrorDismiss}
                fieldsByStep={dataReady && getActortypeFormFields({
                  typeId,
                  isAdmin,
                  isMine,
                  taxonomies,
                  userOptions,
                  connectedTaxonomies,
                  actionsByActiontype,
                  membersByActortype,
                  associationsByActortype,
                  onCreateOption,
                  intl,
                })}
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
  onInvalidateEntities: PropTypes.func,
  redirectIfNotSignedIn: PropTypes.func,
  redirectIfNotPermitted: PropTypes.func,
  initialiseForm: PropTypes.func,
  handleSubmitRemote: PropTypes.func.isRequired,
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  viewDomain: PropTypes.object,
  viewDomainPage: PropTypes.object,
  viewEntity: PropTypes.object,
  dataReady: PropTypes.bool,
  authReady: PropTypes.bool,
  isAdmin: PropTypes.bool,
  isUserMember: PropTypes.bool,
  params: PropTypes.object,
  taxonomies: PropTypes.object,
  actionsByActiontype: PropTypes.object,
  membersByActortype: PropTypes.object,
  associationsByActortype: PropTypes.object,
  onCreateOption: PropTypes.func,
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  connectedTaxonomies: PropTypes.object,
  userOptions: PropTypes.object,
  myId: PropTypes.string,
  step: PropTypes.string,
};

ActorEdit.contextTypes = {
  intl: PropTypes.object.isRequired,
};
const mapStateToProps = (state, props) => ({
  viewDomain: selectDomain(state),
  viewDomainPage: selectDomainPage(state),
  isAdmin: selectIsUserAdmin(state),
  isUserMember: selectIsUserMember(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  authReady: selectReadyForAuthCheck(state),
  viewEntity: selectViewEntity(state, props.params.id),
  taxonomies: selectTaxonomyOptions(state, props.params.id),
  actionsByActiontype: selectActionsByActiontype(state, props.params.id),
  membersByActortype: selectMembersByActortype(state, props.params.id),
  associationsByActortype: selectAssociationsByActortype(state, props.params.id),
  connectedTaxonomies: selectTaxonomiesWithCategories(state),
  userOptions: selectUserOptions(state, props.params.id),
  myId: selectSessionUserId(state),
  step: selectStepQuery(state),
});

function mapDispatchToProps(dispatch, props) {
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
      membersByActortype,
      associationsByActortype,
      userOptions,
    ) => {
      // console.log('formData', formData.toJS())
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
    handleUpdate: (formData, formId) => {
      dispatch(updateEntityForm(formData, formId));
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
