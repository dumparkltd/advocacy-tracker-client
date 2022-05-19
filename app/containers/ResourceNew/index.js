/*
*
* ResourceNew
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
  getLinkFormField,
  getStatusField,
  getDateField,
} from 'utils/forms';
import { getInfoField } from 'utils/fields';

// import { qe } from 'utils/quasi-equals';
import { scrollToTop } from 'utils/scroll-to-component';
import { hasNewErrorNEW } from 'utils/entity-form';
import { checkResourceAttribute, checkResourceRequired } from 'utils/entities';

import { CONTENT_SINGLE } from 'containers/App/constants';
import { ROUTES, USER_ROLES } from 'themes/config';
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
  selectResourcetype,
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


export class ResourceNew extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
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

  getInitialFormData = (nextProps) => {
    const props = nextProps || this.props;
    const { params } = props;
    return Map(FORM_INITIAL.setIn(
      ['attributes', 'resourcetype_id'],
      params.id,
    ));
  }

  getHeaderMainFields = (type) => {
    const { intl } = this.context;
    const typeId = type.get('id');
    return ([ // fieldGroups
      { // fieldGroup
        fields: [
          getInfoField(
            'resourcetype_id',
            intl.formatMessage(appMessages.resourcetypes[typeId]),
            true // large
          ), // required
          checkResourceAttribute(typeId, 'title') && getTitleFormField(
            intl.formatMessage,
            'title',
            'title',
            checkResourceRequired(typeId, 'title'),
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
    type,
    connectedTaxonomies,
    actionsByActiontype,
    onCreateOption,
  ) => {
    const { intl } = this.context;
    const typeId = type.get('id');
    const groups = [];
    groups.push({ // fieldGroup
      fields: [
        checkResourceAttribute(typeId, 'url') && getLinkFormField(
          intl.formatMessage,
          checkResourceRequired(typeId, 'url'),
          'url',
        ),
      ],
    });
    groups.push({
      fields: [
        checkResourceAttribute(typeId, 'description') && getMarkdownFormField(
          intl.formatMessage,
          checkResourceRequired(typeId, 'description'),
          'description',
        ),
        checkResourceAttribute(typeId, 'status') && getMarkdownFormField(
          intl.formatMessage,
          checkResourceRequired(typeId, 'status'),
          'status',
        ),
      ],
    });
    if (actionsByActiontype) {
      const actionConnections = renderActionsByActiontypeControl(
        actionsByActiontype,
        connectedTaxonomies,
        onCreateOption,
        intl,
      );
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

  getBodyAsideFields = (type) => {
    const { intl } = this.context;
    const typeId = type.get('id');
    return ([ // fieldGroups
      { // fieldGroup
        fields: [
          checkResourceAttribute(typeId, 'publication_date') && getDateField(
            intl.formatMessage,
            'publication_date',
            checkResourceRequired(typeId, 'publication_date'),
          ),
          checkResourceAttribute(typeId, 'access_date') && getDateField(
            intl.formatMessage,
            'access_date',
            checkResourceRequired(typeId, 'access_date'),
          ),
        ],
      },
    ]);
  };

  render() {
    const { intl } = this.context;
    const {
      dataReady,
      viewDomainPage,
      connectedTaxonomies,
      actionsByActiontype,
      onCreateOption,
      resourcetype,
      params,
      onErrorDismiss,
      onServerErrorDismiss,
      handleCancel,
      handleSubmitRemote,
      handleSubmit,
      handleSubmitFail,
      handleUpdate,
    } = this.props;
    const typeId = params.id;
    const { saveSending } = viewDomainPage.toJS();

    const type = intl.formatMessage(appMessages.entities[`resources_${typeId}`].single);
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
                onClick: () => handleCancel(typeId),
              },
              {
                type: 'save',
                disabled: saveSending,
                onClick: () => handleSubmitRemote('resourceNew.form.data'),
              }] : null
            }
          />
          <FormWrapper
            model="resourceNew.form.data"
            handleSubmit={(formData) => handleSubmit(
              formData,
              resourcetype,
              actionsByActiontype,
              // resourcetypeTaxonomies,
            )}
            handleSubmitFail={handleSubmitFail}
            handleCancel={() => handleCancel(typeId)}
            handleUpdate={handleUpdate}
            onErrorDismiss={onErrorDismiss}
            onServerErrorDismiss={onServerErrorDismiss}
            fields={dataReady && { // isManager, taxonomies,
              header: {
                main: this.getHeaderMainFields(resourcetype),
                aside: this.getHeaderAsideFields(),
              },
              body: {
                main: this.getBodyMainFields(
                  resourcetype,
                  connectedTaxonomies,
                  actionsByActiontype,
                  onCreateOption,
                ),
                aside: this.getBodyAsideFields(
                  resourcetype,
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

ResourceNew.propTypes = {
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
  resourcetype: PropTypes.instanceOf(Map),
  params: PropTypes.object,
};

ResourceNew.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, { params }) => ({
  viewDomainPage: selectDomainPage(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  authReady: selectReadyForAuthCheck(state),
  connectedTaxonomies: selectConnectedTaxonomies(state),
  resourcetype: selectResourcetype(state, params.id),
  actionsByActiontype: selectActionsByActiontype(state, params.id),
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
      resourcetype,
      actionsByActiontype,
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
      dispatch(save(saveData.toJS(), resourcetype.get('id')));
    },
    handleCancel: (typeId) => {
      dispatch(updatePath(`${ROUTES.RESOURCES}/${typeId}`), { replace: true });
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
