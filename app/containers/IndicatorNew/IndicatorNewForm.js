/*
*
* IndicatorNewForm
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { actions as formActions } from 'react-redux-form/immutable';

import { fromJS } from 'immutable';

import {
  getConnectionUpdatesFromFormData,
  getTitleFormField,
  getMarkdownFormField,
  renderActionsByActiontypeControl,
  getStatusField,
  getCodeFormField,
} from 'utils/forms';

// import { qe } from 'utils/quasi-equals';
import { scrollToTop } from 'utils/scroll-to-component';
import { hasNewErrorNEW } from 'utils/entity-form';
import {
  checkIndicatorAttribute,
  checkIndicatorRequired,
} from 'utils/entities';
// import { checkResourceAttribute, checkResourceRequired } from 'utils/entities';

import { CONTENT_SINGLE, CONTENT_MODAL } from 'containers/App/constants';
import {
  API,
  ROUTES,
  USER_ROLES,
  ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS,
} from 'themes/config';
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
  selectIsUserAdmin,
  selectTaxonomiesWithCategories,
} from 'containers/App/selectors';

import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';

import FormWrapper from './FormWrapper';
import {
  selectActionsByActiontype,
} from './selectors';

import messages from './messages';
import { DEPENDENCIES, FORM_INITIAL } from './constants';


export class IndicatorNewForm extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.scrollContainer = React.createRef();
  }

  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
    this.props.initialiseForm(FORM_INITIAL);
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

  getHeaderMainFields = (isAdmin) => {
    const { intl } = this.context;
    return ([ // fieldGroups
      { // fieldGroup
        fields: [
          checkIndicatorAttribute('code', isAdmin) && getCodeFormField(
            intl.formatMessage,
            'code',
            checkIndicatorRequired('code'),
          ),
          getTitleFormField(
            intl.formatMessage,
            'title',
            'title',
            true,
          ),
        ],
      },
    ]);
  };

  getHeaderAsideFields = () => {
    const { intl } = this.context;
    return ([
      {
        fields: [
          getStatusField(intl.formatMessage),
          getStatusField(intl.formatMessage, 'private'),
        ],
      },
    ]);
  }

  getBodyMainFields = (
    connectedTaxonomies,
    actionsByActiontype,
    onCreateOption,
    isAdmin,
  ) => {
    const { intl } = this.context;
    const groups = [];
    groups.push({
      fields: [
        getMarkdownFormField(
          intl.formatMessage,
          false,
          'description',
        ),
      ],
    });
    if (actionsByActiontype) {
      const actionConnections = renderActionsByActiontypeControl({
        entitiesByActiontype: actionsByActiontype,
        taxonomies: connectedTaxonomies,
        onCreateOption,
        intl,
        isAdmin,
        connectionAttributesForType: (actiontypeId) => ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS[actiontypeId]
          ? [
            {
              attribute: 'supportlevel_id',
              type: 'select',
              options: ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS[actiontypeId].map(
                (level) => ({
                  label: intl.formatMessage(appMessages.supportlevels[level.value]),
                  ...level,
                }),
              ),
            },
          ]
          : null,
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
  }

  render() {
    const { intl } = this.context;
    const {
      dataReady,
      viewDomain,
      connectedTaxonomies,
      actionsByActiontype,
      onCreateOption,
      onErrorDismiss,
      onServerErrorDismiss,
      handleCancel,
      handleSubmitRemote,
      handleSubmit,
      handleSubmitFail,
      handleUpdate,
      formDataPath,
      inModal,
      isAdmin,
    } = this.props;
    const { saveSending, isAnySending } = viewDomain.get('page').toJS();
    const saving = isAnySending || saveSending;
    const type = intl.formatMessage(appMessages.entities.indicators.single);
    return (
      <Content ref={this.scrollContainer} inModal={inModal}>
        <ContentHeader
          title={intl.formatMessage(messages.pageTitle, { type })}
          type={inModal ? CONTENT_MODAL : CONTENT_SINGLE}
          buttons={
            dataReady ? [{
              type: 'cancel',
              onClick: () => handleCancel(),
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
            actionsByActiontype,
          )}
          handleSubmitFail={handleSubmitFail}
          handleCancel={handleCancel}
          handleUpdate={handleUpdate}
          onErrorDismiss={onErrorDismiss}
          onServerErrorDismiss={onServerErrorDismiss}
          scrollContainer={this.scrollContainer.current}
          fields={{ // isManager, taxonomies,
            header: {
              main: this.getHeaderMainFields(isAdmin),
              aside: this.getHeaderAsideFields(),
            },
            body: {
              main: this.getBodyMainFields(
                connectedTaxonomies,
                actionsByActiontype,
                inModal ? null : onCreateOption,
                isAdmin,
              ),
            },
          }}
        />
      </Content>
    );
  }
}

IndicatorNewForm.propTypes = {
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
  formDataPath: PropTypes.string,
  inModal: PropTypes.bool,
  isAdmin: PropTypes.bool,
};

IndicatorNewForm.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  authReady: selectReadyForAuthCheck(state),
  connectedTaxonomies: selectTaxonomiesWithCategories(state),
  actionsByActiontype: selectActionsByActiontype(state),
  isAdmin: selectIsUserAdmin(state),
});

function mapDispatchToProps(
  dispatch,
  {
    formDataPath,
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
      dispatch(redirectIfNotPermitted(USER_ROLES.MANAGER.value));
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
      //
      // actions
      if (actionsByActiontype && formData.get('associatedActionsByActiontype')) {
        saveData = saveData.set(
          'actionIndicators',
          actionsByActiontype
            .map((actions, id) => getConnectionUpdatesFromFormData({
              formData,
              connections: actions,
              connectionAttribute: ['associatedActionsByActiontype', id.toString()],
              createConnectionKey: 'measure_id',
              createKey: 'indicator_id',
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
      dispatch(
        newEntity({
          path: API.INDICATORS,
          entity: saveData.toJS(),
          redirect: !inModal ? ROUTES.INDICATOR : null,
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
    handleCancel: () => {
      if (inModal && onCancel) {
        // cleanup
        dispatch(submitInvalid(true));
        dispatch(saveErrorDismiss());
        onCancel();
      } else {
        dispatch(updatePath(ROUTES.INDICATORS), { replace: true });
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


export default connect(mapStateToProps, mapDispatchToProps)(IndicatorNewForm);
