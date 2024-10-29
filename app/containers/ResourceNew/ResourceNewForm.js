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
  getTitleFormField,
  getMarkdownFormField,
  getLinkFormField,
  getStatusFormField,
  getDateFormField,
  renderActionsByActiontypeControl,
} from 'utils/forms';
import { getInfoField } from 'utils/fields';

// import { qe } from 'utils/quasi-equals';
import { scrollToTop } from 'utils/scroll-to-component';
import { hasNewErrorNEW } from 'utils/entity-form';
import { checkResourceAttribute, checkResourceRequired } from 'utils/entities';

import { CONTENT_SINGLE, CONTENT_MODAL } from 'containers/App/constants';
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
import FormWrapper from './FormWrapper';

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

  getHeaderMainFields = (typeId) => {
    const { intl } = this.context;
    return ([ // fieldGroups
      { // fieldGroup
        fields: [
          getInfoField(
            'resourcetype_id',
            intl.formatMessage(appMessages.resourcetypes[typeId]),
            true // large
          ), // required
          checkResourceAttribute(typeId, 'title') && getTitleFormField({
            formatMessage: intl.formatMessage,
            required: checkResourceRequired(typeId, 'title'),
          }),
        ],
      },
    ]);
  };

  getHeaderAsideFields = () => {
    const { intl } = this.context;
    return ([
      {
        fields: [
          getStatusFormField({ formatMessage: intl.formatMessage }),
          getStatusFormField({ formatMessage: intl.formatMessage, attribute: 'private' }),
        ],
      },
    ]);
  };

  getBodyMainFields = (
    typeId,
    connectedTaxonomies,
    actionsByActiontype,
    onCreateOption,
    isAdmin,
  ) => {
    const { intl } = this.context;
    const groups = [];
    groups.push({ // fieldGroup
      fields: [
        checkResourceAttribute(typeId, 'url') && getLinkFormField({
          formatMessage: intl.formatMessage,
          required: checkResourceRequired(typeId, 'url'),
        }),
      ],
    });
    groups.push({
      fields: [
        checkResourceAttribute(typeId, 'description') && getMarkdownFormField({
          formatMessage: intl.formatMessage,
          required: checkResourceRequired(typeId, 'description'),
        }),
        checkResourceAttribute(typeId, 'status') && getMarkdownFormField({
          formatMessage: intl.formatMessage,
          required: checkResourceRequired(typeId, 'status'),
          attribute: 'status',
        }),
      ],
    });
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
    return groups;
  };

  getBodyAsideFields = (typeId) => {
    const { intl } = this.context;
    return ([ // fieldGroups
      { // fieldGroup
        fields: [
          checkResourceAttribute(typeId, 'publication_date') && getDateFormField({
            formatMessage: intl.formatMessage,
            required: checkResourceRequired(typeId, 'publication_date'),
            attribute: 'publication_date',
          }),
          checkResourceAttribute(typeId, 'access_date') && getDateFormField({
            formatMessage: intl.formatMessage,
            required: checkResourceRequired(typeId, 'access_date'),
            attribute: 'access_date',
          }),
        ],
      },
    ]);
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
    const type = intl.formatMessage(appMessages.entities[`resources_${typeId}`].single);
    return (
      <Content ref={this.scrollContainer} inModal={inModal}>
        <ContentHeader
          title={intl.formatMessage(messages.pageTitle, { type })}
          type={inModal ? CONTENT_MODAL : CONTENT_SINGLE}
          buttons={
            dataReady ? [{
              type: 'cancel',
              onClick: () => handleCancel(typeId),
            },
            {
              type: 'save',
              disabled: saving,
              onClick: () => handleSubmitRemote(formDataPath),
            }] : null
          }
        />
        <FormWrapper
          model={formDataPath}
          inModal={inModal}
          viewDomain={viewDomain}
          handleSubmit={(formData) => handleSubmit(
            formData,
            resourcetype,
            actionsByActiontype,
            invalidateEntitiesOnSuccess,
            // resourcetypeTaxonomies,
          )}
          handleSubmitFail={handleSubmitFail}
          handleCancel={() => handleCancel(typeId)}
          handleUpdate={handleUpdate}
          onErrorDismiss={onErrorDismiss}
          onServerErrorDismiss={onServerErrorDismiss}
          scrollContainer={this.scrollContainer.current}
          fields={{ // isMember, taxonomies,
            header: {
              main: this.getHeaderMainFields(typeId),
              aside: this.getHeaderAsideFields(),
            },
            body: {
              main: this.getBodyMainFields(
                typeId,
                connectedTaxonomies,
                actionsByActiontype,
                inModal ? null : onCreateOption,
                isAdmin,
              ),
              aside: this.getBodyAsideFields(
                typeId,
              ),
            },
          }}
        />
      </Content>
    );
  }
}

ResourceNew.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  redirectIfNotPermitted: PropTypes.func,
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
      dispatch(
        newEntity({
          path: API.RESOURCES,
          entity: saveData.toJS(),
          redirect: !inModal ? ROUTES.RESOURCE : null,
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
