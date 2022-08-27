/*
 *
 * ActionNew
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { actions as formActions } from 'react-redux-form/immutable';

import { Map, List, fromJS } from 'immutable';
// import { Map, List } from 'immutable';

import {
  getConnectionUpdatesFromFormData,
  getTitleFormField,
  getStatusField,
  getMarkdownFormField,
  getCodeFormField,
  renderActorsByActortypeControl,
  renderTargetsByActortypeControl,
  renderResourcesByResourcetypeControl,
  getDateField,
  getTextareaField,
  renderTaxonomyControl,
  getLinkFormField,
  renderActionsByActiontypeControl,
  renderIndicatorControl,
  renderUserMultiControl,
} from 'utils/forms';

import { getCheckedValuesFromOptions } from 'components/forms/MultiSelectControl';

import { scrollToTop } from 'utils/scroll-to-component';
import { hasNewErrorNEW } from 'utils/entity-form';
import { checkActionAttribute, checkActionRequired } from 'utils/entities';

import { CONTENT_SINGLE } from 'containers/App/constants';
import {
  USER_ROLES,
  ROUTES,
  ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS,
} from 'themes/config';

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
  selectActiontypeTaxonomiesWithCats,
  selectActiontype,
  selectSessionUser,
} from 'containers/App/selectors';

import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';

import appMessages from 'containers/App/messages';
import FormWrapper from './FormWrapper';

import {
  selectDomainPage,
  selectTopActionsByActiontype,
  selectSubActionsByActiontype,
  selectConnectedTaxonomies,
  selectActorsByActortype,
  selectTargetsByActortype,
  selectResourcesByResourcetype,
  selectIndicatorOptions,
  selectUserOptions,
} from './selectors';

import messages from './messages';
import { DEPENDENCIES, FORM_INITIAL } from './constants';
import { save } from './actions';

export class ActionNew extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.scrollContainer = React.createRef();
  }

  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
    this.props.initialiseForm('actionNew.form.data', this.getInitialFormData());
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
    if (nextProps.authReady && !this.props.authReady) {
      this.props.redirectIfNotPermitted();
    }
    // repopulate if new data becomes ready
    if (nextProps.dataReady && !this.props.dataReady && nextProps.sessionUser) {
      this.props.initialiseForm('actionNew.form.data', this.getInitialFormData(nextProps));
    }
    if (hasNewErrorNEW(nextProps, this.props) && this.scrollContainer) {
      scrollToTop(this.scrollContainer.current);
    }
  }

  getInitialFormData = (nextProps) => {
    const props = nextProps || this.props;
    const { params, sessionUser } = props;
    const dataWithType = FORM_INITIAL.setIn(['attributes', 'measuretype_id'], params.id);
    return sessionUser
      && sessionUser.getIn(['attributes', 'id'])
      ? dataWithType.set(
        'associatedUsers',
        fromJS([{
          value: sessionUser.getIn(['attributes', 'id']).toString(),
          checked: true,
          label: sessionUser.getIn(['attributes', 'name']),
          reference: sessionUser.getIn(['attributes', 'id']).toString(),
        }])
      )
      : dataWithType;
  }

  getHeaderMainFields = (type) => {
    const { intl } = this.context;
    const typeId = type.get('id');
    return ([ // fieldGroups
      { // fieldGroup
        fields: [
          checkActionAttribute(typeId, 'code') && getCodeFormField(
            intl.formatMessage,
            'code',
            checkActionRequired(typeId, 'code'),
          ),
          checkActionAttribute(typeId, 'title') && getTitleFormField(
            intl.formatMessage,
            'title',
            'title',
            checkActionRequired(typeId, 'title'),
          ),
        ],
      },
    ]);
  };

  getHeaderAsideFields = () => {
    const { intl } = this.context;
    const groups = [];
    groups.push({
      fields: [
        getStatusField(intl.formatMessage),
        getStatusField(intl.formatMessage, 'private'),
      ],
    });
    return groups;
  }

  getBodyMainFields = (
    type,
    connectedTaxonomies,
    actorsByActortype,
    targetsByActortype,
    resourcesByResourcetype,
    subActionsByActiontype,
    indicatorOptions,
    onCreateOption,
  ) => {
    const { intl } = this.context;
    const typeId = type.get('id');
    const groups = [];
    groups.push(
      {
        fields: [
          // description
          checkActionAttribute(typeId, 'description') && getMarkdownFormField(
            intl.formatMessage,
            checkActionRequired(typeId, 'description'),
            'description',
          ),
          checkActionAttribute(typeId, 'comment') && getMarkdownFormField(
            intl.formatMessage,
            checkActionRequired(typeId, 'comment'),
            'comment',
          ),
        ],
      },
      {
        fields: [
          checkActionAttribute(typeId, 'target_comment') && getMarkdownFormField(
            intl.formatMessage,
            checkActionRequired(typeId, 'target_comment'),
            'target_comment',
          ),
          checkActionAttribute(typeId, 'status_comment') && getMarkdownFormField(
            intl.formatMessage,
            checkActionRequired(typeId, 'status_comment'),
            'status_comment',
          ),
        ],
      },
    );
    if (indicatorOptions) {
      const indicatorConnections = renderIndicatorControl({
        entities: indicatorOptions,
        contextIntl: intl,
        connectionAttributes: [{
          attribute: 'supportlevel_id',
          type: 'select',
          options: ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS[typeId].map(
            (level) => ({
              label: intl.formatMessage(appMessages.supportlevels[level.value]),
              ...level,
            }),
          ),
        }],
      });
      if (indicatorConnections) {
        groups.push(
          {
            label: intl.formatMessage(appMessages.nav.indicators),
            fields: [indicatorConnections],
          },
        );
      }
    }

    if (actorsByActortype) {
      const actorConnections = renderActorsByActortypeControl(
        actorsByActortype,
        connectedTaxonomies,
        onCreateOption,
        intl,
      );
      if (actorConnections) {
        groups.push(
          {
            label: intl.formatMessage(appMessages.nav.actors),
            fields: actorConnections,
          },
        );
      }
    }
    if (targetsByActortype) {
      const targetConnections = renderTargetsByActortypeControl(
        targetsByActortype,
        connectedTaxonomies,
        onCreateOption,
        intl,
      );
      if (targetConnections) {
        groups.push(
          {
            label: intl.formatMessage(appMessages.nav.targets),
            fields: targetConnections,
          },
        );
      }
    }
    if (subActionsByActiontype) {
      const actionConnections = renderActionsByActiontypeControl({
        entitiesByActiontype: subActionsByActiontype,
        taxonomies: connectedTaxonomies,
        onCreateOption,
        contextIntl: intl,
        model: 'associatedSubActionsByActiontype',
      });
      if (actionConnections) {
        groups.push(
          {
            label: intl.formatMessage(appMessages.nav.subActions),
            fields: actionConnections,
          },
        );
      }
    }
    if (resourcesByResourcetype) {
      const resourceConnections = renderResourcesByResourcetypeControl(
        resourcesByResourcetype,
        onCreateOption,
        intl,
      );
      if (resourceConnections) {
        groups.push(
          {
            label: intl.formatMessage(appMessages.nav.resources),
            fields: resourceConnections,
          },
        );
      }
    }
    return groups;
  };

  getBodyAsideFields = (
    type,
    taxonomies,
    connectedTaxonomies,
    topActionsByActiontype,
    userOptions,
    onCreateOption,
  ) => {
    const { intl } = this.context;
    const typeId = type.get('id');
    const groups = [];
    if (userOptions) {
      groups.push(
        {
          label: intl.formatMessage(appMessages.nav.userActions),
          fields: [
            renderUserMultiControl(userOptions, null, intl),
          ],
        },
      );
    }
    groups.push( // fieldGroups
      { // fieldGroup
        fields: [
          checkActionAttribute(typeId, 'url') && getLinkFormField(
            intl.formatMessage,
            checkActionRequired(typeId, 'url'),
            'url',
          ),
        ],
      },
    );
    groups.push(
      { // fieldGroup
        fields: [
          checkActionAttribute(typeId, 'date_start') && getDateField(
            intl.formatMessage,
            'date_start',
            checkActionRequired(typeId, 'date_start'),
          ),
          checkActionAttribute(typeId, 'date_end') && getDateField(
            intl.formatMessage,
            'date_end',
            checkActionRequired(typeId, 'date_end'),
          ),
          checkActionAttribute(typeId, 'date_comment') && getTextareaField(
            intl.formatMessage,
            'date_comment',
            checkActionRequired(typeId, 'date_comment'),
          ),
        ],
      },
    );
    groups.push(
      { // fieldGroup
        label: intl.formatMessage(appMessages.entities.taxonomies.plural),
        icon: 'categories',
        fields: renderTaxonomyControl(taxonomies, onCreateOption, intl),
      },
    );
    if (topActionsByActiontype) {
      const actionConnections = renderActionsByActiontypeControl({
        entitiesByActiontype: topActionsByActiontype,
        taxonomies: connectedTaxonomies,
        onCreateOption,
        contextIntl: intl,
        model: 'associatedTopActionsByActiontype',
      });
      if (actionConnections) {
        groups.push(
          {
            label: intl.formatMessage(appMessages.nav.topActions),
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
      actorsByActortype,
      targetsByActortype,
      resourcesByResourcetype,
      connectedTaxonomies,
      taxonomies,
      onCreateOption,
      actiontype,
      params,
      topActionsByActiontype,
      subActionsByActiontype,
      indicatorOptions,
      userOptions,
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
    const type = intl.formatMessage(appMessages.entities[`actions_${typeId}`].single);
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
                onClick: () => handleSubmitRemote('actionNew.form.data'),
              }] : null
            }
          />
          <FormWrapper
            model="actionNew.form.data"
            handleSubmit={(formData) => handleSubmit(
              formData,
              actiontype,
              actorsByActortype,
              targetsByActortype,
              resourcesByResourcetype,
              topActionsByActiontype,
              subActionsByActiontype,
              indicatorOptions,
              userOptions,
            )}
            handleSubmitFail={handleSubmitFail}
            handleCancel={() => handleCancel(typeId)}
            handleUpdate={handleUpdate}
            onErrorDismiss={onErrorDismiss}
            onServerErrorDismiss={onServerErrorDismiss}
            scrollContainer={this.scrollContainer.current}
            fields={dataReady && {
              header: {
                main: this.getHeaderMainFields(actiontype),
                aside: this.getHeaderAsideFields(),
              },
              body: {
                main: this.getBodyMainFields(
                  actiontype,
                  connectedTaxonomies,
                  actorsByActortype,
                  targetsByActortype,
                  resourcesByResourcetype,
                  subActionsByActiontype,
                  indicatorOptions,
                  onCreateOption,
                ),
                aside: this.getBodyAsideFields(
                  actiontype,
                  taxonomies,
                  connectedTaxonomies,
                  topActionsByActiontype,
                  userOptions,
                  onCreateOption,
                ),
              },
            }}
          />
        </Content>
      </div>
    );
  }
}

ActionNew.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  redirectIfNotPermitted: PropTypes.func,
  handleSubmitRemote: PropTypes.func.isRequired,
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  dataReady: PropTypes.bool,
  authReady: PropTypes.bool,
  actorsByActortype: PropTypes.object,
  targetsByActortype: PropTypes.object,
  resourcesByResourcetype: PropTypes.object,
  initialiseForm: PropTypes.func,
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  viewDomainPage: PropTypes.object,
  taxonomies: PropTypes.object,
  indicatorOptions: PropTypes.object,
  userOptions: PropTypes.object,
  topActionsByActiontype: PropTypes.object,
  subActionsByActiontype: PropTypes.object,
  onCreateOption: PropTypes.func,
  connectedTaxonomies: PropTypes.object,
  actiontype: PropTypes.instanceOf(Map),
  params: PropTypes.object,
  // sessionUser: PropTypes.string,
};

ActionNew.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, { params }) => ({
  authReady: selectReadyForAuthCheck(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  taxonomies: selectActiontypeTaxonomiesWithCats(
    state,
    {
      type: params.id,
      includeParents: false,
    },
  ),
  connectedTaxonomies: selectConnectedTaxonomies(state),
  actiontype: selectActiontype(state, params.id),
  actorsByActortype: selectActorsByActortype(state, params.id),
  targetsByActortype: selectTargetsByActortype(state, params.id),
  resourcesByResourcetype: selectResourcesByResourcetype(state, params.id),
  topActionsByActiontype: selectTopActionsByActiontype(state, params.id),
  subActionsByActiontype: selectSubActionsByActiontype(state, params.id),
  indicatorOptions: selectIndicatorOptions(state, params.id),
  userOptions: selectUserOptions(state, params.id),
  viewDomainPage: selectDomainPage(state),
  sessionUser: selectSessionUser(state),
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
      actiontype,
      actorsByActortype,
      targetsByActortype,
      resourcesByResourcetype,
      topActionsByActiontype,
      subActionsByActiontype,
      indicatorOptions,
      userOptions,
    ) => {
      let saveData = formData.setIn(['attributes', 'measuretype_id'], actiontype.get('id'));
      // actionCategories
      if (formData.get('associatedTaxonomies')) {
        saveData = saveData.set(
          'actionCategories',
          formData.get('associatedTaxonomies')
            .map(getCheckedValuesFromOptions)
            .reduce((updates, formCategoryIds) => Map({
              delete: List(),
              create: updates.get('create').concat(formCategoryIds.map((id) => Map({
                category_id: id,
              }))),
            }), Map({ delete: List(), create: List() }))
        );
      }
      if (formData.get('associatedTopActionsByActiontype') && topActionsByActiontype) {
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
                const creates = memo.get('create').concat(deleteCreateLists.get('create'));
                return memo.set('create', creates);
              },
              fromJS({
                create: [],
              }),
            )
        );
      }
      if (formData.get('associatedSubActionsByActiontype') && subActionsByActiontype) {
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
                const creates = memo.get('create').concat(deleteCreateLists.get('create'));
                return memo.set('create', creates);
              },
              fromJS({
                create: [],
              }),
            )
        );
      }
      // indicators
      if (formData.get('associatedIndicators') && indicatorOptions) {
        saveData = saveData.set(
          'actionIndicators', // targets
          getConnectionUpdatesFromFormData({
            formData,
            connections: indicatorOptions,
            connectionAttribute: 'associatedIndicators',
            createConnectionKey: 'indicator_id',
            connectionAttributes: ['supportlevel_id'],
          })
        );
      }
      // actors
      if (formData.get('associatedActorsByActortype') && actorsByActortype) {
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
                const creates = memo.get('create').concat(deleteCreateLists.get('create'));
                return memo.set('create', creates);
              },
              fromJS({
                create: [],
              }),
            )
        );
      }
      // targets
      if (formData.get('associatedTargetsByActortype') && targetsByActortype) {
        saveData = saveData.set(
          'actionActors',
          targetsByActortype
            .map((targets, actortypeid) => getConnectionUpdatesFromFormData({
              formData,
              connections: targets,
              connectionAttribute: ['associatedTargetsByActortype', actortypeid.toString()],
              createConnectionKey: 'actor_id',
              createKey: 'measure_id',
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
      if (formData.get('associatedResourcesByResourcetype') && resourcesByResourcetype) {
        saveData = saveData.set(
          'actionResources',
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
                const creates = memo.get('create').concat(deleteCreateLists.get('create'));
                return memo.set('create', creates);
              },
              fromJS({
                create: [],
              }),
            )
        );
      }
      if (formData.get('associatedUsers') && userOptions) {
        saveData = saveData.set(
          'userActions',
          Map({
            delete: List(),
            create: getCheckedValuesFromOptions(formData.get('associatedUsers'))
              .map((id) => Map({
                user_id: id,
              })),
          })
        );
      }
      dispatch(save(saveData.toJS(), actiontype.get('id')));
    },
    handleCancel: (typeId) => {
      dispatch(updatePath(`${ROUTES.ACTIONS}/${typeId}`), { replace: true });
    },
    handleUpdate: (formData) => {
      dispatch(updateEntityForm(formData));
    },
    onCreateOption: (args) => {
      dispatch(openNewEntityModal(args));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActionNew);
