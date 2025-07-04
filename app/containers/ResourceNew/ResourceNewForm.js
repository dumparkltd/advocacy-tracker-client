/*
*
* ResourceNew
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { actions as formActions } from 'react-redux-form/immutable';

import { Map, fromJS } from 'immutable';

import {
  getConnectionUpdatesFromFormData,
  getResourcetypeFormFields,
} from 'utils/forms';

// import { qe } from 'utils/quasi-equals';
import { scrollToTop } from 'utils/scroll-to-component';
import { hasNewErrorNEW } from 'utils/entity-form';

import { API, ROUTES, USER_ROLES } from 'themes/config';
import appMessages from 'containers/App/messages';

import {
  loadEntitiesIfNeeded,
  redirectIfNotPermitted,
  updatePath,
  updateEntityForm,
  openNewEntityModal,
  submitInvalid,
  saveErrorDismiss,
  newEntity,
  redirectIfNotSignedIn,
} from 'containers/App/actions';

import {
  selectReady,
  selectReadyForAuthCheck,
  selectResourcetype,
  selectIsUserAdmin,
  selectTaxonomiesWithCategories,
} from 'containers/App/selectors';

import Content from 'components/Content';
import ContentHeader from 'containers/ContentHeader';
import EntityFormWrapper from 'containers/EntityForm/EntityFormWrapper';

import {
  selectActionsByActiontype,
} from './selectors';

import messages from './messages';
import { DEPENDENCIES, FORM_INITIAL } from './constants';


export class ResourceNew extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.scrollContainer = React.createRef();
  }

  UNSAFE_componentWillMount() {
    this.props.redirectIfNotSignedIn();
    this.props.loadEntitiesIfNeeded();
    this.props.initialiseForm(this.getInitialFormData());
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
    if (nextProps.authReady && !this.props.authReady) {
      this.props.redirectIfNotPermitted();
    }
    if (hasNewErrorNEW(nextProps, this.props) && this.scrollContainer) {
      scrollToTop(this.scrollContainer.current);
    }
  }

  getInitialFormData = (nextProps) => {
    const props = nextProps || this.props;
    const { typeId } = props;
    return Map(FORM_INITIAL.setIn(
      ['attributes', 'resourcetype_id'],
      typeId,
    ));
  };

  render() {
    const { intl } = this.context;
    const {
      dataReady,
      viewDomain,
      connectedTaxonomies,
      actionsByActiontype,
      onCreateOption,
      resourcetype,
      typeId,
      onErrorDismiss,
      onServerErrorDismiss,
      handleCancel,
      handleSubmitRemote,
      handleSubmit,
      handleSubmitFail,
      handleUpdate,
      formDataPath,
      inModal,
      invalidateEntitiesOnSuccess,
      isAdmin,
    } = this.props;
    const { saveSending, isAnySending } = viewDomain.get('page').toJS();
    const saving = isAnySending || saveSending;
    const typeLabel = intl.formatMessage(appMessages.entities[`resources_${typeId}`].single);
    return (
      <Content ref={this.scrollContainer} inModal={inModal}>
        <ContentHeader
          title={intl.formatMessage(messages.pageTitle, { type: typeLabel })}
        />
        <EntityFormWrapper
          isNewEntityView
          typeLabel={typeLabel}
          model={formDataPath}
          inModal={inModal}
          viewDomain={viewDomain}
          saving={saving}
          handleSubmit={(formData) => handleSubmit(
            formData,
            resourcetype,
            actionsByActiontype,
            invalidateEntitiesOnSuccess,
          )}
          handleSubmitRemote={() => handleSubmitRemote(formDataPath)}
          handleSubmitFail={handleSubmitFail}
          handleCancel={() => handleCancel(typeId)}
          handleUpdate={handleUpdate}
          onErrorDismiss={onErrorDismiss}
          onServerErrorDismiss={onServerErrorDismiss}
          scrollContainer={this.scrollContainer.current}
          fieldsByStep={dataReady && getResourcetypeFormFields({
            typeId,
            isAdmin,
            isMine: true,
            connectedTaxonomies,
            actionsByActiontype,
            onCreateOption: inModal ? null : onCreateOption,
            intl,
            isNew: true,
          })}
        />
      </Content>
    );
  }
}

ResourceNew.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  redirectIfNotPermitted: PropTypes.func,
  redirectIfNotSignedIn: PropTypes.func,
  handleSubmitRemote: PropTypes.func.isRequired,
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  viewDomain: PropTypes.object,
  dataReady: PropTypes.bool,
  authReady: PropTypes.bool,
  onCreateOption: PropTypes.func,
  initialiseForm: PropTypes.func,
  actionsByActiontype: PropTypes.object,
  connectedTaxonomies: PropTypes.object,
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  resourcetype: PropTypes.instanceOf(Map),
  typeId: PropTypes.string,
  formDataPath: PropTypes.string,
  inModal: PropTypes.bool,
  isAdmin: PropTypes.bool,
  invalidateEntitiesOnSuccess: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
};

ResourceNew.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, { typeId }) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  authReady: selectReadyForAuthCheck(state),
  connectedTaxonomies: selectTaxonomiesWithCategories(state),
  resourcetype: selectResourcetype(state, typeId),
  actionsByActiontype: selectActionsByActiontype(state, typeId),
  isAdmin: selectIsUserAdmin(state),
});

function mapDispatchToProps(
  dispatch,
  {
    formDataPath,
    modalAttributes,
    modalConnect,
    inModal,
    onSaveSuccess,
    onCancel,
  }
) {
  return {
    initialiseForm: (formData) => {
      dispatch(formActions.reset(formDataPath));
      dispatch(formActions.change(formDataPath, formData, { silent: true }));
    },
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    redirectIfNotPermitted: () => {
      dispatch(redirectIfNotPermitted(USER_ROLES.MEMBER.value));
    },
    redirectIfNotSignedIn: () => {
      dispatch(redirectIfNotSignedIn());
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
      resourcetype,
      actionsByActiontype,
      invalidateEntitiesOnSuccess,
    ) => {
      let saveData = formData.setIn(
        ['attributes', 'resourcetype_id'],
        resourcetype.get('id'),
      );
      //
      // actions if allowed by resourcetype
      if (actionsByActiontype && formData.get('associatedActionsByActiontype')) {
        saveData = saveData.set(
          'actionResources',
          actionsByActiontype
            .map((resources, resourcetypeid) => getConnectionUpdatesFromFormData({
              formData,
              connections: resources,
              connectionAttribute: ['associatedActionsByActiontype', resourcetypeid.toString()],
              createConnectionKey: 'measure_id',
              createKey: 'resource_id',
            }))
            .reduce(
              (memo, deleteCreateLists) => {
                const creates = memo.get('create').concat(deleteCreateLists.get('create'));
                return memo.set('create', creates);
              },
              fromJS({
                create: [],
              }),
            )
        );
      }
      // additional connections when created from modal
      if (inModal) {
        if (modalAttributes) {
          saveData = saveData.mergeIn(['attributes'], modalAttributes);
        }
        if (modalConnect
          && (
            modalConnect.get('type') === 'actorActions'
            || modalConnect.get('type') === 'userActions'
            || modalConnect.get('type') === 'subActions'
          )
        ) {
          if (saveData.get('type')) {
            saveData = saveData.mergeIn(
              [modalConnect.get('type'), 'create'],
              modalConnect.get('create'),
            );
          } else {
            saveData = saveData.setIn(
              [modalConnect.get('type'), 'create'],
              modalConnect.get('create'),
            );
          }
        }
      }
      let redirect = null;
      let redirectQuery = null;
      if (!inModal) {
        if (formData.get('close')) {
          redirect = ROUTES.RESOURCE;
        } else {
          redirect = `${ROUTES.RESOURCE}${ROUTES.EDIT}`;
          redirectQuery = {
            arg: 'step',
            value: formData.get('step'),
          };
        }
      }
      dispatch(
        newEntity({
          path: API.RESOURCES,
          entity: saveData.toJS(),
          redirect,
          redirectQuery,
          invalidateEntitiesOnSuccess,
          onSuccess: inModal && onSaveSuccess
            ? () => {
              // cleanup
              dispatch(submitInvalid(true));
              dispatch(saveErrorDismiss());
              onSaveSuccess();
            }
            : null,
        })
      );
    },
    handleCancel: (typeId) => {
      if (inModal && onCancel) {
        // cleanup
        dispatch(submitInvalid(true));
        dispatch(saveErrorDismiss());
        onCancel();
      } else {
        dispatch(updatePath(`${ROUTES.RESOURCES}/${typeId}`), { replace: true });
      }
    },
    handleUpdate: (formData) => {
      dispatch(updateEntityForm(formData));
    },
    onCreateOption: (args) => {
      dispatch(openNewEntityModal(args));
    },
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(ResourceNew);
