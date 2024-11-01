/*
 *
 * ActionEdit
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
  getActiontypeFormFields,
} from 'utils/forms';

import { scrollToTop } from 'utils/scroll-to-component';
import { hasNewError } from 'utils/entity-form';
import qe from 'utils/quasi-equals';


import { CONTENT_SINGLE } from 'containers/App/constants';
import {
  USER_ROLES,
  API,
  ROUTES,
} from 'themes/config';

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
  selectIsUserMember,
  selectSessionUserId,
  selectActionIndicatorsForAction,
  selectTaxonomiesWithCategories,
} from 'containers/App/selectors';

import Content from 'components/Content';
import ContentHeader from 'containers/ContentHeader';

import appMessages from 'containers/App/messages';
import EntityFormWrapper from 'containers/EntityForm/EntityFormWrapper';

import {
  selectDomain,
  selectDomainPage,
  selectViewEntity,
  selectTopActionsByActiontype,
  selectSubActionsByActiontype,
  selectTaxonomyOptions,
  selectActorsByActortype,
  selectResourcesByResourcetype,
  selectIndicatorOptions,
  selectUserOptions,
} from './selectors';

import messages from './messages';
import { save } from './actions';
import { DEPENDENCIES, FORM_INITIAL } from './constants';

export class ActionEdit extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.scrollContainer = React.createRef();
  }

  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
    if (this.props.dataReady && this.props.viewEntity) {
      this.props.initialiseForm('actionEdit.form.data', this.getInitialFormData());
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
    // repopulate if new data becomes ready
    if (nextProps.dataReady && !this.props.dataReady && nextProps.viewEntity) {
      this.props.initialiseForm('actionEdit.form.data', this.getInitialFormData(nextProps));
    }
    //
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
      actorsByActortype,
      resourcesByResourcetype,
      topActionsByActiontype,
      subActionsByActiontype,
      indicatorOptions,
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
        associatedActorsByActortype: actorsByActortype
          ? actorsByActortype.map((actors) => entityOptions({ entities: actors }))
          : Map(),
        associatedResourcesByResourcetype: resourcesByResourcetype
          ? resourcesByResourcetype.map((resources) => entityOptions({ entities: resources }))
          : Map(),
        associatedIndicators: indicatorOptions
          ? entityOptions({ entities: indicatorOptions })
          : Map(),
        associatedTopActionsByActiontype: topActionsByActiontype
          ? topActionsByActiontype.map((actions) => entityOptions({ entities: actions }))
          : Map(),
        associatedSubActionsByActiontype: subActionsByActiontype
          ? subActionsByActiontype.map((actions) => entityOptions({ entities: actions }))
          : Map(),
        associatedUsers: userOptions
          ? entityOptions({ entities: userOptions })
          : Map(),
      })
      : Map();
  };

  render() {
    const {
      viewEntity,
      dataReady,
      viewDomain,
      viewDomainPage,
      taxonomies,
      connectedTaxonomies,
      actorsByActortype,
      resourcesByResourcetype,
      onCreateOption,
      topActionsByActiontype,
      subActionsByActiontype,
      indicatorOptions,
      userOptions,
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
      entityIndicatorConnections,
    } = this.props;
    const { intl } = this.context;
    // const reference = this.props.params.id;
    const typeId = viewEntity && viewEntity.getIn(['attributes', 'measuretype_id']);

    const { saveSending, saveError, deleteSending } = viewDomainPage.toJS();

    const typeLabel = typeId
      ? intl.formatMessage(appMessages.entities[`actions_${typeId}`].single)
      : intl.formatMessage(appMessages.entities.actions.single);
    const isMine = viewEntity && qe(viewEntity.getIn(['attributes', 'created_by_id']), myId);

    // user can delete content
    // if they are admins or
    // if they are at least members and its their own content
    const canDelete = isAdmin
      || (isUserMember && viewEntity && qe(myId, viewEntity.getIn(['attributes', 'created_by_id'])));
    const formDataPath = 'actionEdit.form.data';

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
                  actorsByActortype,
                  resourcesByResourcetype,
                  topActionsByActiontype,
                  subActionsByActiontype,
                  indicatorOptions,
                  userOptions,
                )}
                handleSubmitRemote={() => handleSubmitRemote(formDataPath)}
                handleSubmitFail={handleSubmitFail}
                handleCancel={handleCancel}
                handleUpdate={handleUpdate}
                handleDelete={canDelete ? () => handleDelete(typeId) : null}
                onErrorDismiss={onErrorDismiss}
                onServerErrorDismiss={onServerErrorDismiss}
                scrollContainer={this.scrollContainer.current}
                fieldsByStep={getActiontypeFormFields({
                  isAdmin,
                  isMine,
                  typeId,
                  taxonomies,
                  connectedTaxonomies,
                  userOptions,
                  indicatorOptions,
                  actorsByActortype,
                  topActionsByActiontype,
                  subActionsByActiontype,
                  resourcesByResourcetype,
                  entityIndicatorConnections,
                  onCreateOption,
                  intl,
                })}
              />
            )
          }
        </Content>
      </div>
    );
  }
}

ActionEdit.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  redirectIfNotPermitted: PropTypes.func,
  initialiseForm: PropTypes.func,
  handleSubmitRemote: PropTypes.func.isRequired,
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  viewDomain: PropTypes.object, // Map
  viewDomainPage: PropTypes.object, // Map
  viewEntity: PropTypes.object, // Map
  dataReady: PropTypes.bool,
  authReady: PropTypes.bool,
  isAdmin: PropTypes.bool,
  isUserMember: PropTypes.bool,
  params: PropTypes.object,
  taxonomies: PropTypes.object,
  topActionsByActiontype: PropTypes.object,
  subActionsByActiontype: PropTypes.object,
  indicatorOptions: PropTypes.object,
  userOptions: PropTypes.object,
  connectedTaxonomies: PropTypes.object,
  actorsByActortype: PropTypes.object,
  resourcesByResourcetype: PropTypes.object,
  onCreateOption: PropTypes.func,
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  myId: PropTypes.string,
  entityIndicatorConnections: PropTypes.object,
};

ActionEdit.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, { params }) => ({
  viewDomain: selectDomain(state),
  viewDomainPage: selectDomainPage(state),
  isAdmin: selectIsUserAdmin(state),
  isUserMember: selectIsUserMember(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  authReady: selectReadyForAuthCheck(state),
  viewEntity: selectViewEntity(state, params.id),
  taxonomies: selectTaxonomyOptions(state, params.id),
  connectedTaxonomies: selectTaxonomiesWithCategories(state),
  actorsByActortype: selectActorsByActortype(state, params.id),
  resourcesByResourcetype: selectResourcesByResourcetype(state, params.id),
  topActionsByActiontype: selectTopActionsByActiontype(state, params.id),
  subActionsByActiontype: selectSubActionsByActiontype(state, params.id),
  indicatorOptions: selectIndicatorOptions(state, params.id),
  userOptions: selectUserOptions(state, params.id),
  myId: selectSessionUserId(state),
  entityIndicatorConnections: selectActionIndicatorsForAction(state, params.id),
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
      actorsByActortype,
      resourcesByResourcetype,
      topActionsByActiontype,
      subActionsByActiontype,
      indicatorOptions,
      userOptions,
    ) => {
      let saveData = formData.set(
        'actionCategories',
        getCategoryUpdatesFromFormData({
          formData,
          taxonomies,
          createKey: 'measure_id',
        })
      );
      if (topActionsByActiontype) {
        saveData = saveData.set(
          'topActions',
          topActionsByActiontype
            .map((actions, actiontypeid) => getConnectionUpdatesFromFormData({
              formData,
              connections: actions,
              connectionAttribute: ['associatedTopActionsByActiontype', actiontypeid.toString()],
              createConnectionKey: 'other_measure_id',
              createKey: 'measure_id',
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
      if (subActionsByActiontype) {
        saveData = saveData.set(
          'subActions',
          subActionsByActiontype
            .map((actions, actiontypeid) => getConnectionUpdatesFromFormData({
              formData,
              connections: actions,
              connectionAttribute: ['associatedSubActionsByActiontype', actiontypeid.toString()],
              createConnectionKey: 'measure_id',
              createKey: 'other_measure_id',
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
          'actorActions',
          actorsByActortype
            .map((actors, actortypeid) => getConnectionUpdatesFromFormData({
              formData,
              connections: actors,
              connectionAttribute: ['associatedActorsByActortype', actortypeid.toString()],
              createConnectionKey: 'actor_id',
              createKey: 'measure_id',
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
      if (resourcesByResourcetype) {
        saveData = saveData.set(
          'actionResources', // resources
          resourcesByResourcetype
            .map((resources, resourcetypeid) => getConnectionUpdatesFromFormData({
              formData,
              connections: resources,
              connectionAttribute: ['associatedResourcesByResourcetype', resourcetypeid.toString()],
              createConnectionKey: 'resource_id',
              createKey: 'measure_id',
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
      if (indicatorOptions) {
        saveData = saveData.set(
          'actionIndicators', // indicators
          getConnectionUpdatesFromFormData({
            formData,
            connections: indicatorOptions,
            connectionAttribute: 'associatedIndicators',
            createConnectionKey: 'indicator_id',
            createKey: 'measure_id',
            connectionAttributes: ['supportlevel_id'],
          })
        );
      }
      if (userOptions) {
        saveData = saveData.set(
          'userActions',
          getConnectionUpdatesFromFormData({
            formData,
            connections: userOptions,
            connectionAttribute: 'associatedUsers',
            createConnectionKey: 'user_id',
            createKey: 'measure_id',
          })
        );
      }
      dispatch(save(saveData.toJS()));
    },
    handleCancel: () => {
      dispatch(updatePath(`${ROUTES.ACTION}/${props.params.id}`, { replace: true }));
    },
    handleUpdate: (formData) => {
      dispatch(updateEntityForm(formData));
    },
    handleDelete: (typeId) => {
      dispatch(deleteEntity({
        path: API.ACTIONS,
        id: props.params.id,
        redirect: `${ROUTES.ACTIONS}/${typeId}`,
      }));
    },
    onCreateOption: (args) => {
      dispatch(openNewEntityModal(args));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActionEdit);
