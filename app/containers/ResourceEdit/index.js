/*
 *
 * ResourceEdit
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
  getResourcetypeFormFields,
  getConnectionUpdatesFromFormData,
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
} from 'containers/App/selectors';

import Content from 'components/Content';
import ContentHeader from 'containers/ContentHeader';
import EntityFormWrapper from 'containers/EntityForm/EntityFormWrapper';

import {
  selectDomainPage,
  selectViewEntity,
  selectActionsByActiontype,
  selectDomain,
} from './selectors';

import messages from './messages';
import { save } from './actions';
import { DEPENDENCIES, FORM_INITIAL } from './constants';

export class ResourceEdit extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
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
      this.props.initialiseForm('resourceEdit.form.data', this.getInitialFormData(nextProps));
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
      actionsByActiontype,
      isAdmin,
    } = props;
    return viewEntity
      ? Map({
        id: viewEntity.get('id'),
        attributes: viewEntity.get('attributes').mergeWith(
          (oldVal, newVal) => oldVal === null ? newVal : oldVal,
          FORM_INITIAL.get('attributes')
        ),
        associatedActionsByActiontype: actionsByActiontype
          ? actionsByActiontype.map((actions) => entityOptions({ entities: actions, showCode: isAdmin }))
          : Map(),
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
      connectedTaxonomies,
      actionsByActiontype,
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
    const typeId = viewEntity && viewEntity.getIn(['attributes', 'resourcetype_id']);

    const {
      saveSending, saveError, deleteSending,
    } = viewDomainPage.toJS();

    const typeLabel = intl.formatMessage(
      appMessages.entities[typeId ? `resources_${typeId}` : 'resources'].single
    );
    const isMine = viewEntity && qe(viewEntity.getIn(['attributes', 'created_by_id']), myId);

    // user can delete content
    // if they are admins or
    // if they are at least members and its their own content
    const canDelete = isAdmin
      || (isUserMember && viewEntity && qe(myId, viewEntity.getIn(['attributes', 'created_by_id'])));
    const formDataPath = 'resourceEdit.form.data';

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
                  actionsByActiontype,
                )}
                handleSubmitRemote={() => handleSubmitRemote(formDataPath)}
                handleSubmitFail={handleSubmitFail}
                handleCancel={handleCancel}
                handleUpdate={handleUpdate}
                handleDelete={canDelete ? () => handleDelete(typeId) : null}
                onErrorDismiss={onErrorDismiss}
                onServerErrorDismiss={onServerErrorDismiss}
                fieldsByStep={dataReady && getResourcetypeFormFields({
                  typeId,
                  isAdmin,
                  isMine,
                  connectedTaxonomies,
                  actionsByActiontype,
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

ResourceEdit.propTypes = {
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
  handleDelete: PropTypes.func,
  viewDomain: PropTypes.object,
  viewDomainPage: PropTypes.object,
  viewEntity: PropTypes.object,
  dataReady: PropTypes.bool,
  authReady: PropTypes.bool,
  isAdmin: PropTypes.bool,
  isUserMember: PropTypes.bool,
  params: PropTypes.object,
  actionsByActiontype: PropTypes.object,
  onCreateOption: PropTypes.func,
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  connectedTaxonomies: PropTypes.object,
  myId: PropTypes.string,
};

ResourceEdit.contextTypes = {
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
  actionsByActiontype: selectActionsByActiontype(state, props.params.id),
  connectedTaxonomies: selectTaxonomiesWithCategories(state),
  myId: selectSessionUserId(state),
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
      actionsByActiontype,
    ) => {
      let saveData = formData;
      if (actionsByActiontype) {
        saveData = saveData.set(
          'actionResources',
          actionsByActiontype
            .map((actions, actiontypeid) => getConnectionUpdatesFromFormData({
              formData,
              connections: actions,
              connectionAttribute: ['associatedActionsByActiontype', actiontypeid.toString()],
              createConnectionKey: 'measure_id',
              createKey: 'resource_id',
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
      // console.log(saveData.toJS());
      dispatch(save(saveData.toJS()));
    },
    handleCancel: () => {
      dispatch(updatePath(`${ROUTES.RESOURCE}/${props.params.id}`, { replace: true }));
    },
    handleUpdate: (formData) => {
      dispatch(updateEntityForm(formData));
    },
    handleDelete: (typeId) => {
      dispatch(deleteEntity({
        path: API.RESOURCES,
        id: props.params.id,
        redirect: `${ROUTES.RESOURCES}/${typeId}`,
      }));
    },
    onCreateOption: (args) => {
      dispatch(openNewEntityModal(args));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ResourceEdit);
