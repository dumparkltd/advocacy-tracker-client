/*
*
* IndicatorNew
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { actions as formActions } from 'react-redux-form/immutable';

import { Map, fromJS } from 'immutable';

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
// import { checkResourceAttribute, checkResourceRequired } from 'utils/entities';

import { CONTENT_SINGLE } from 'containers/App/constants';
import {
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
} from 'containers/App/actions';

import {
  selectReady,
  selectReadyForAuthCheck,
} from 'containers/App/selectors';

import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';

import FormWrapper from './FormWrapper';
import {
  selectDomainPage,
  selectConnectedTaxonomies,
  selectActionsByActiontype,
} from './selectors';

import messages from './messages';
import { save } from './actions';
import { DEPENDENCIES, FORM_INITIAL } from './constants';


export class IndicatorNew extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.scrollContainer = React.createRef();
  }

  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
    this.props.initialiseForm('resourceNew.form.data', this.getInitialFormData());
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

  getInitialFormData = () => Map(FORM_INITIAL);

  getHeaderMainFields = () => {
    const { intl } = this.context;
    return ([ // fieldGroups
      { // fieldGroup
        fields: [
          getCodeFormField(
            intl.formatMessage,
            'code',
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
        contextIntl: intl,
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
      viewDomainPage,
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
    } = this.props;
    const { saveSending } = viewDomainPage.toJS();

    const type = intl.formatMessage(appMessages.entities.indicators.single);
    return (
      <div>
        <Helmet
          title={`${intl.formatMessage(messages.pageTitle, { type })}`}
          meta={[
            {
              name: 'description',
              content: intl.formatMessage(messages.metaDescription),
            },
          ]}
        />
        <Content ref={this.scrollContainer}>
          <ContentHeader
            title={intl.formatMessage(messages.pageTitle, { type })}
            type={CONTENT_SINGLE}
            buttons={
              dataReady ? [{
                type: 'cancel',
                onClick: () => handleCancel(),
              },
              {
                type: 'save',
                disabled: saveSending,
                onClick: () => handleSubmitRemote('indicatorNew.form.data'),
              }] : null
            }
          />
          <FormWrapper
            model="indicatorNew.form.data"
            handleSubmit={(formData) => handleSubmit(
              formData,
              actionsByActiontype,
            )}
            handleSubmitFail={handleSubmitFail}
            handleCancel={handleCancel}
            handleUpdate={handleUpdate}
            onErrorDismiss={onErrorDismiss}
            onServerErrorDismiss={onServerErrorDismiss}
            fields={dataReady && { // isManager, taxonomies,
              header: {
                main: this.getHeaderMainFields(),
                aside: this.getHeaderAsideFields(),
              },
              body: {
                main: this.getBodyMainFields(
                  connectedTaxonomies,
                  actionsByActiontype,
                  onCreateOption,
                ),
              },
            }}
            scrollContainer={this.scrollContainer.current}
          />
        </Content>
      </div>
    );
  }
}

IndicatorNew.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  redirectIfNotPermitted: PropTypes.func,
  handleSubmitRemote: PropTypes.func.isRequired,
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  viewDomainPage: PropTypes.object,
  dataReady: PropTypes.bool,
  authReady: PropTypes.bool,
  onCreateOption: PropTypes.func,
  initialiseForm: PropTypes.func,
  actionsByActiontype: PropTypes.object,
  connectedTaxonomies: PropTypes.object,
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
};

IndicatorNew.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  viewDomainPage: selectDomainPage(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  authReady: selectReadyForAuthCheck(state),
  connectedTaxonomies: selectConnectedTaxonomies(state),
  actionsByActiontype: selectActionsByActiontype(state),
});

function mapDispatchToProps(dispatch) {
  return {
    initialiseForm: (model, formData) => {
      dispatch(formActions.reset(model));
      dispatch(formActions.change(model, formData, { silent: true }));
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
      dispatch(save(saveData.toJS()));
    },
    handleCancel: () => {
      dispatch(updatePath(ROUTES.INDICATORS), { replace: true });
    },
    handleUpdate: (formData) => {
      dispatch(updateEntityForm(formData));
    },
    onCreateOption: (args) => {
      dispatch(openNewEntityModal(args));
    },
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(IndicatorNew);
