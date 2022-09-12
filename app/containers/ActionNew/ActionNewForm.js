/*
 *
 * ActionNewForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { actions as formActions } from 'react-redux-form/immutable';

import { Map, List, fromJS } from 'immutable';

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
import { checkActionAttribute, checkActionRequired, getEntityTitle } from 'utils/entities';
import { lowerCase } from 'utils/string';

import { CONTENT_SINGLE, CONTENT_MODAL } from 'containers/App/constants';
import {
  API,
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
  newEntity,
} from 'containers/App/actions';

import {
  selectReady,
  selectReadyForAuthCheck,
  selectActiontypeTaxonomiesWithCats,
  selectActiontype,
  selectSessionUser,
  selectIsUserAdmin,
  selectTaxonomiesWithCategories,
} from 'containers/App/selectors';

import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';

import appMessages from 'containers/App/messages';
import FormWrapper from './FormWrapper';

import {
  selectTopActionsByActiontype,
  selectSubActionsByActiontype,
  selectActorsByActortype,
  selectTargetsByActortype,
  selectResourcesByResourcetype,
  selectIndicatorOptions,
  selectUserOptions,
} from './selectors';

import messages from './messages';
import { DEPENDENCIES, FORM_INITIAL } from './constants';

export class ActionNewForm extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
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
    // repopulate if new data becomes ready
    if (nextProps.dataReady && !this.props.dataReady && nextProps.sessionUser) {
      this.props.initialiseForm(this.getInitialFormData(nextProps));
    }
    if (hasNewErrorNEW(nextProps, this.props) && this.scrollContainer) {
      scrollToTop(this.scrollContainer.current);
    }
  }

  getInitialFormData = (nextProps) => {
    const props = nextProps || this.props;
    const { typeId, sessionUser } = props;
    const dataWithType = FORM_INITIAL.setIn(['attributes', 'measuretype_id'], typeId);
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

  getHeaderMainFields = (typeId, isAdmin) => {
    const { intl } = this.context;
    return ([ // fieldGroups
      { // fieldGroup
        fields: [
          checkActionAttribute(typeId, 'code', isAdmin) && getCodeFormField(
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
        getStatusField(intl.formatMessage, 'notifications'),
      ],
    });
    return groups;
  }

  getBodyMainFields = (
    typeId,
    connectedTaxonomies,
    actorsByActortype,
    targetsByActortype,
    resourcesByResourcetype,
    subActionsByActiontype,
    indicatorOptions,
    onCreateOption,
    isAdmin,
  ) => {
    const { intl } = this.context;
    // if (!type) return [];
    // const typeId = type.get('id');
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
        intl,
        connectionAttributes: [{
          attribute: 'supportlevel_id',
          type: 'select',
          showCode: isAdmin,
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
      const actorConnections = renderActorsByActortypeControl({
        entitiesByActortype: actorsByActortype,
        taxonomies: connectedTaxonomies,
        onCreateOption,
        intl,
        isAdmin,
      });
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
      const targetConnections = renderTargetsByActortypeControl({
        entitiesByActortype: targetsByActortype,
        taxonomies: connectedTaxonomies,
        onCreateOption,
        intl,
        isAdmin,
      });
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
        intl,
        model: 'associatedSubActionsByActiontype',
        isAdmin,
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
      const resourceConnections = renderResourcesByResourcetypeControl({
        entitiesByResourcetype: resourcesByResourcetype,
        onCreateOption,
        intl,
        isAdmin,
      });
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
    typeId,
    taxonomies,
    connectedTaxonomies,
    topActionsByActiontype,
    userOptions,
    onCreateOption,
    isAdmin,
  ) => {
    const { intl } = this.context;
    // const typeId = type.get('id');
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
        fields: renderTaxonomyControl({
          taxonomies, onCreateOption, intl,
        }),
      },
    );
    if (topActionsByActiontype) {
      const actionConnections = renderActionsByActiontypeControl({
        entitiesByActiontype: topActionsByActiontype,
        taxonomies: connectedTaxonomies,
        onCreateOption,
        intl,
        model: 'associatedTopActionsByActiontype',
        isAdmin,
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
      viewDomain,
      actorsByActortype,
      targetsByActortype,
      resourcesByResourcetype,
      connectedTaxonomies,
      taxonomies,
      onCreateOption,
      actiontype,
      typeId,
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
      formDataPath,
      inModal,
      modalConnect,
      invalidateEntitiesOnSuccess,
      isAdmin,
    } = this.props;
    const { saveSending, isAnySending } = viewDomain.get('page').toJS();
    const saving = isAnySending || saveSending;
    const type = intl.formatMessage(appMessages.entities[`actions_${typeId}`].single);
    let subTitle;
    if (inModal && modalConnect && modalConnect.get('create')) {
      // connect action to actor
      if (
        modalConnect.get('type') === 'actorActions'
        || modalConnect.get('type') === 'actionActors'
      ) {
        const actorId = modalConnect
          .get('create')
          .find((item) => item.keySeq().includes('actor_id'))
          .get('actor_id');
        // console.log(actorId)
        let actor;
        if (modalConnect.get('type') === 'actorActions') {
          actor = actorId && actorsByActortype.flatten(true).get(actorId);
        } else if (modalConnect.get('type') === 'actionActors') {
          actor = actorId && targetsByActortype.flatten(true).get(actorId);
        }
        const actorType = actor && intl.formatMessage(appMessages.entities[`actors_${actor.getIn(['attributes', 'actortype_id'])}`].single);
        subTitle = actor && `For ${lowerCase(actorType)}: ${getEntityTitle(actor)}`;
      }
      // connect action with top action
      if (modalConnect.get('type') === 'subActions') {
        const actionId = modalConnect
          .get('create')
          .find((item) => item.keySeq().includes('other_measure_id'))
          .get('other_measure_id');
        // console.log(actorId)
        const action = actionId && topActionsByActiontype.flatten(true).get(actionId);
        const actionType = action && intl.formatMessage(appMessages.entities[`actions_${action.getIn(['attributes', 'measuretype_id'])}`].single);
        subTitle = action && `For ${lowerCase(actionType)}: ${getEntityTitle(action)}`;
      }
      // connect action with user
      if (modalConnect.get('type') === 'userActions') {
        const userId = modalConnect
          .get('create')
          .find((item) => item.keySeq().includes('user_id'))
          .get('user_id');
        const user = userId && userOptions && userOptions.get(userId);
        subTitle = user && `For ${lowerCase(intl.formatMessage(appMessages.entities.users.single))}: ${getEntityTitle(user)}`;
      }
    }
    return (
      <Content ref={this.scrollContainer} inModal={inModal}>
        <ContentHeader
          title={intl.formatMessage(messages.pageTitle, { type })}
          subTitle={subTitle}
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
            actiontype,
            actorsByActortype,
            targetsByActortype,
            resourcesByResourcetype,
            topActionsByActiontype,
            subActionsByActiontype,
            indicatorOptions,
            userOptions,
            invalidateEntitiesOnSuccess,
          )}
          handleSubmitFail={handleSubmitFail}
          handleCancel={() => handleCancel(typeId)}
          handleUpdate={handleUpdate}
          onErrorDismiss={onErrorDismiss}
          onServerErrorDismiss={onServerErrorDismiss}
          scrollContainer={this.scrollContainer.current}
          fields={{
            header: {
              main: this.getHeaderMainFields(typeId, isAdmin),
              aside: this.getHeaderAsideFields(),
            },
            body: {
              main: this.getBodyMainFields(
                typeId,
                connectedTaxonomies,
                actorsByActortype,
                targetsByActortype,
                resourcesByResourcetype,
                subActionsByActiontype,
                indicatorOptions,
                inModal ? null : onCreateOption,
                isAdmin
              ),
              aside: this.getBodyAsideFields(
                typeId,
                taxonomies,
                connectedTaxonomies,
                topActionsByActiontype,
                userOptions,
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

ActionNewForm.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  redirectIfNotPermitted: PropTypes.func,
  handleSubmitRemote: PropTypes.func.isRequired,
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  dataReady: PropTypes.bool,
  authReady: PropTypes.bool,
  actorsByActortype: PropTypes.instanceOf(Map),
  targetsByActortype: PropTypes.instanceOf(Map),
  resourcesByResourcetype: PropTypes.instanceOf(Map),
  initialiseForm: PropTypes.func,
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  viewDomain: PropTypes.instanceOf(Map),
  taxonomies: PropTypes.instanceOf(Map),
  indicatorOptions: PropTypes.instanceOf(Map),
  userOptions: PropTypes.instanceOf(Map),
  topActionsByActiontype: PropTypes.instanceOf(Map),
  subActionsByActiontype: PropTypes.instanceOf(Map),
  onCreateOption: PropTypes.func,
  connectedTaxonomies: PropTypes.instanceOf(Map),
  actiontype: PropTypes.instanceOf(Map),
  modalConnect: PropTypes.instanceOf(Map),
  typeId: PropTypes.string,
  formDataPath: PropTypes.string,
  invalidateEntitiesOnSuccess: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
  inModal: PropTypes.bool,
  isAdmin: PropTypes.bool,
  // autoUser: PropTypes.bool,
};

ActionNewForm.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, { typeId, autoUser }) => ({
  isAdmin: selectIsUserAdmin(state),
  authReady: selectReadyForAuthCheck(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  taxonomies: selectActiontypeTaxonomiesWithCats(
    state,
    {
      type: typeId,
      includeParents: false,
    },
  ),
  connectedTaxonomies: selectTaxonomiesWithCategories(state),
  actiontype: selectActiontype(state, typeId),
  actorsByActortype: selectActorsByActortype(state, typeId),
  targetsByActortype: selectTargetsByActortype(state, typeId),
  resourcesByResourcetype: selectResourcesByResourcetype(state, typeId),
  topActionsByActiontype: selectTopActionsByActiontype(state, typeId),
  subActionsByActiontype: selectSubActionsByActiontype(state, typeId),
  indicatorOptions: selectIndicatorOptions(state, typeId),
  userOptions: selectUserOptions(state, typeId),
  sessionUser: autoUser && selectSessionUser(state),
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
      invalidateEntitiesOnSuccess,
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
      // additional connections when created from modal
      if (inModal) {
        if (modalAttributes) {
          saveData = saveData.mergeIn(['attributes'], modalAttributes);
        }
        if (modalConnect
          && (
            modalConnect.get('type') === 'actorActions'
            || modalConnect.get('type') === 'actionActors'
            || modalConnect.get('type') === 'userActions'
            || modalConnect.get('type') === 'subActions'
          )
        ) {
          saveData = saveData.mergeIn(
            [modalConnect.get('type'), 'create'],
            modalConnect.get('create'),
          );
        }
      }
      dispatch(
        newEntity({
          path: API.ACTIONS,
          entity: saveData.toJS(),
          redirect: !inModal ? ROUTES.ACTION : null,
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
        dispatch(updatePath(`${ROUTES.ACTIONS}/${typeId}`), { replace: true });
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

export default connect(mapStateToProps, mapDispatchToProps)(ActionNewForm);
