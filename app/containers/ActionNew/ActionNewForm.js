/*
 *
 * ActionNewForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { actions as formActions } from 'react-redux-form/immutable';
import { format } from 'date-fns';
import { Map, List, fromJS } from 'immutable';

import {
  getConnectionUpdatesFromFormData,
  getActiontypeFormFields,
} from 'utils/forms';

import { getCheckedValuesFromOptions } from 'components/forms/MultiSelectControl';

import { scrollToTop } from 'utils/scroll-to-component';
import { hasNewErrorNEW } from 'utils/entity-form';
import { getEntityTitle } from 'utils/entities';
import { lowerCase } from 'utils/string';
import asList from 'utils/as-list';

import {
  API,
  USER_ROLES,
  ROUTES,
  API_DATE_FORMAT,
  ACTIONTYPES_CONFIG,
} from 'themes/config';
import { CONTENT_MODAL } from 'containers/App/constants';

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
import ContentHeader from 'containers/ContentHeader';

import appMessages from 'containers/App/messages';
import EntityFormWrapper from 'containers/EntityForm/EntityFormWrapper';

import {
  selectTopActionsByActiontype,
  selectSubActionsByActiontype,
  selectActorsByActortype,
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
    const {
      typeId,
      sessionUser,
      inModal,
      modalConnect,
      actorsByActortype,
      topActionsByActiontype,
      userOptions,
      indicatorOptions,
    } = props;
    const shape = ACTIONTYPES_CONFIG[parseInt(typeId, 10)]
      && ACTIONTYPES_CONFIG[parseInt(typeId, 10)].form;
    const dataWithType = FORM_INITIAL.setIn(['attributes', 'measuretype_id'], typeId);
    const nowFormatted = format(new Date(), API_DATE_FORMAT);
    let result = dataWithType;
    if (
      sessionUser
      && sessionUser.getIn(['attributes', 'id'])
      && (!modalConnect || modalConnect.get('type') !== 'userActions')
    ) {
      result = result
        .set(
          'associatedUsers',
          fromJS([{
            value: sessionUser.getIn(['attributes', 'id']).toString(),
            checked: true,
            label: sessionUser.getIn(['attributes', 'name']),
            autofill: true,
          }])
        );
    }
    const hasAutoFillDate = shape.find(
      (step) => step.sections && step.sections.find(
        (section) => section.rows && section.rows.find(
          (row) => row.length > 0 && row.find(
            (att) => att.attribute === 'date_start' && att.prepopulate
          )
        )
      )
    );

    if (hasAutoFillDate) {
      result = result.setIn(
        ['attributes', 'date_start'],
        nowFormatted,
      );
    }
    if (inModal && modalConnect) {
      result = asList(modalConnect).reduce(
        (memo, modalConnectItem) => {
          if (modalConnectItem.get('create')) {
            // connect action to actor
            if (modalConnectItem.get('type') === 'actorActions') {
              const actorId = modalConnectItem
                .get('create')
                .find((item) => item.keySeq().includes('actor_id'))
                .get('actor_id');
              // console.log(actorId)
              const actor = actorId && actorsByActortype.flatten(true).get(actorId);
              return memo
                .set(
                  'associatedActorsByActortype',
                  fromJS({
                    [actor.getIn(['attributes', 'actortype_id'])]: [{
                      value: actor.get('id').toString(),
                      checked: true,
                      label: actor.getIn(['attributes', 'title']),
                      autofill: true,
                    }],
                  })
                );
            }
            // connect action with top action
            if (modalConnectItem.get('type') === 'subActions') {
              const actionId = modalConnectItem
                .get('create')
                .find((item) => item.keySeq().includes('other_measure_id'))
                .get('other_measure_id');
              // console.log(actorId)
              const action = actionId && topActionsByActiontype.flatten(true).get(actionId);
              return memo
                .set(
                  'associatedTopActionsByActiontype',
                  fromJS({
                    [action.getIn(['attributes', 'measuretype_id'])]: [{
                      value: action.get('id').toString(),
                      checked: true,
                      label: action.getIn(['attributes', 'title']),
                      autofill: true,
                    }],
                  })
                );
            }
            // connect action with user
            if (modalConnectItem.get('type') === 'userActions') {
              const userId = modalConnectItem
                .get('create')
                .find((item) => item.keySeq().includes('user_id'))
                .get('user_id');
              const user = userId && userOptions && userOptions.get(userId);
              return memo
                .set(
                  'associatedUsers',
                  fromJS([{
                    value: user.get('id').toString(),
                    checked: true,
                    label: user.getIn(['attributes', 'name']),
                    autofill: true,
                  }])
                );
            }
            // connect action with topic
            if (modalConnectItem.get('type') === 'actorIndicators') {
              const indicatorId = modalConnectItem
                .get('create')
                .find((item) => item.keySeq().includes('indicator_id'))
                .get('indicator_id');
              const indicator = indicatorId && indicatorOptions && indicatorOptions.get(indicatorId);
              return memo
                .set(
                  'associatedIndicators',
                  fromJS([{
                    value: indicator.get('id').toString(),
                    checked: true,
                    label: indicator.getIn(['attributes', 'title']),
                    autofill: true,
                  }])
                );
            }
          }
          return memo;
        },
        result,
      );
    }
    return result;
  };

  render() {
    const { intl } = this.context;
    const {
      viewDomain,
      actorsByActortype,
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
      dataReady,
    } = this.props;
    const typeLabel = intl.formatMessage(appMessages.entities[`actions_${typeId}`].single);
    let subTitle;
    if (inModal && modalConnect && modalConnect.get('create')) {
      // connect action to actor
      if (modalConnect.get('type') === 'actorActions') {
        const actorId = modalConnect
          .get('create')
          .find((item) => item.keySeq().includes('actor_id'))
          .get('actor_id');
        // console.log(actorId)
        const actor = actorId && actorsByActortype.flatten(true).get(actorId);
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
          title={intl.formatMessage(messages.pageTitle, { type: typeLabel })}
          subTitle={subTitle}
          type={CONTENT_MODAL}
          buttons={[{
            type: 'cancel',
            onClick: () => handleCancel(typeId),
          }]}
        />
        <EntityFormWrapper
          isNewEntityView
          typeLabel={typeLabel}
          model={formDataPath}
          inModal={inModal}
          viewDomain={viewDomain}
          handleSubmit={(formData) => handleSubmit(
            formData,
            actiontype,
            actorsByActortype,
            resourcesByResourcetype,
            topActionsByActiontype,
            subActionsByActiontype,
            indicatorOptions,
            userOptions,
            invalidateEntitiesOnSuccess,
          )}
          handleSubmitRemote={() => handleSubmitRemote(formDataPath)}
          handleSubmitFail={handleSubmitFail}
          handleCancel={() => handleCancel(typeId)}
          handleUpdate={handleUpdate}
          onErrorDismiss={onErrorDismiss}
          onServerErrorDismiss={onServerErrorDismiss}
          scrollContainer={this.scrollContainer.current}
          fieldsByStep={dataReady && getActiontypeFormFields({
            isAdmin,
            isMine: true,
            typeId,
            taxonomies,
            connectedTaxonomies,
            userOptions,
            indicatorOptions,
            actorsByActortype,
            topActionsByActiontype,
            subActionsByActiontype,
            resourcesByResourcetype,
            onCreateOption: inModal ? null : onCreateOption,
            intl,
          })}
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
  modalConnect: PropTypes.oneOfType([
    PropTypes.instanceOf(Map),
    PropTypes.instanceOf(List),
  ]),
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
      actiontype,
      actorsByActortype,
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
          'actionIndicators', // indicators
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
