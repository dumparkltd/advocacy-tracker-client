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
  getAmountFormField,
  getFormField,
  renderActionsByActiontypeControl,
  renderIndicatorControl,
  renderUserMultiControl,
} from 'utils/forms';
import { getInfoField } from 'utils/fields';

import { getCheckedValuesFromOptions } from 'components/forms/MultiSelectControl';

import { scrollToTop } from 'utils/scroll-to-component';
import { hasNewError } from 'utils/entity-form';
import { checkActionAttribute, checkActionRequired } from 'utils/entities';

import { CONTENT_SINGLE } from 'containers/App/constants';
import { USER_ROLES, ROUTES } from 'themes/config';

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
} from 'containers/App/selectors';

import Messages from 'components/Messages';
import Loading from 'components/Loading';
import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';
import EntityForm from 'containers/EntityForm';

import appMessages from 'containers/App/messages';

import {
  selectDomain,
  selectConnectedTaxonomies,
  selectActorsByActortype,
  selectTargetsByActortype,
  selectResourcesByResourcetype,
  selectIndicatorOptions,
  selectUserOptions,
  selectTopActionsByActiontype,
  selectSubActionsByActiontype,
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
    if (hasNewError(nextProps, this.props) && this.scrollContainer) {
      scrollToTop(this.scrollContainer.current);
    }
  }

  getInitialFormData = (nextProps) => {
    const props = nextProps || this.props;
    const { params } = props;
    return Map(FORM_INITIAL.setIn(
      ['attributes', 'actortype_id'],
      params.id
    ));
  }

  getHeaderMainFields = (type) => {
    const { intl } = this.context;
    const typeId = type.get('id');
    return ([ // fieldGroups
      { // fieldGroup
        fields: [
          getInfoField(
            'measuretype_id',
            intl.formatMessage(appMessages.actiontypes[typeId]),
            true // large
          ), // required
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

  getHeaderAsideFields = (taxonomies, onCreateOption) => {
    const { intl } = this.context;
    const groups = [];
    groups.push({
      fields: [
        getStatusField(intl.formatMessage),
      ],
    });
    groups.push({ // fieldGroup
      label: intl.formatMessage(appMessages.entities.taxonomies.plural),
      icon: 'categories',
      fields: renderTaxonomyControl(taxonomies, onCreateOption, intl),
    });

    return groups;
  }

  getBodyMainFields = (
    type,
    connectedTaxonomies,
    actorsByActortype,
    targetsByActortype,
    resourcesByResourcetype,
    topActionsByActiontype,
    subActionsByActiontype,
    indicatorOptions,
    userOptions,
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
      groups.push(
        {
          label: intl.formatMessage(appMessages.nav.indicators),
          fields: [
            renderIndicatorControl(indicatorOptions, null, intl),
          ],
        },
      );
    }
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
    if (topActionsByActiontype) {
      const actionConnections = renderActionsByActiontypeControl(
        topActionsByActiontype,
        connectedTaxonomies,
        onCreateOption,
        intl,
        'associatedTopActionsByActiontype',
      );
      if (actionConnections) {
        groups.push(
          {
            label: intl.formatMessage(appMessages.nav.topActions),
            fields: actionConnections,
          },
        );
      }
    }
    if (subActionsByActiontype) {
      const actionConnections = renderActionsByActiontypeControl(
        subActionsByActiontype,
        connectedTaxonomies,
        onCreateOption,
        intl,
        'associatedSubActionsByActiontype',
      );
      if (actionConnections) {
        groups.push(
          {
            label: intl.formatMessage(appMessages.nav.subActions),
            fields: actionConnections,
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

  getBodyAsideFields = (type) => {
    const { intl } = this.context;
    const typeId = type.get('id');
    return ([ // fieldGroups
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
      { // fieldGroup
        fields: [
          checkActionAttribute(typeId, 'url') && getLinkFormField(
            intl.formatMessage,
            checkActionRequired(typeId, 'url'),
            'url',
          ),
        ],
      },
      { // fieldGroup
        fields: [
          checkActionAttribute(typeId, 'amount') && getAmountFormField(
            intl.formatMessage,
            checkActionRequired(typeId, 'amount'),
            'amount',
          ),
          checkActionAttribute(typeId, 'amount_comment') && getFormField({
            formatMessage: intl.formatMessage,
            required: checkActionRequired(typeId, 'amount_comment'),
            attribute: 'amount_comment',
            controlType: 'input',
          }),
        ],
      },
    ]);
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
      params,
      topActionsByActiontype,
      subActionsByActiontype,
      indicatorOptions,
      userOptions,
    } = this.props;
    const typeId = params.id;
    const { saveSending, saveError, submitValid } = viewDomain.get('page').toJS();
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
                onClick: () => this.props.handleCancel(typeId),
              },
              {
                type: 'save',
                disabled: saveSending,
                onClick: () => this.props.handleSubmitRemote('actionNew.form.data'),
              }] : null
            }
          />
          {!submitValid
            && (
              <Messages
                type="error"
                messageKey="submitInvalid"
                onDismiss={this.props.onErrorDismiss}
              />
            )
          }
          {saveError
            && (
              <Messages
                type="error"
                messages={saveError.messages}
                onDismiss={this.props.onServerErrorDismiss}
              />
            )
          }
          {(saveSending || !dataReady)
            && <Loading />
          }
          {dataReady
            && (
              <EntityForm
                model="actionNew.form.data"
                formData={viewDomain.getIn(['form', 'data'])}
                saving={saveSending}
                handleSubmit={(formData) => this.props.handleSubmit(
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
                handleSubmitFail={this.props.handleSubmitFail}
                handleCancel={() => this.props.handleCancel(typeId)}
                handleUpdate={this.props.handleUpdate}
                fields={{
                  header: {
                    main: this.getHeaderMainFields(actiontype),
                    aside: this.getHeaderAsideFields(
                      taxonomies,
                      onCreateOption,
                    ),
                  },
                  body: {
                    main: this.getBodyMainFields(
                      actiontype,
                      connectedTaxonomies,
                      actorsByActortype,
                      targetsByActortype,
                      resourcesByResourcetype,
                      topActionsByActiontype,
                      subActionsByActiontype,
                      indicatorOptions,
                      userOptions,
                      onCreateOption,
                    ),
                    aside: this.getBodyAsideFields(
                      actiontype
                    ),
                  },
                }}
                scrollContainer={this.scrollContainer.current}
              />
            )
          }
          {saveSending
            && <Loading />
          }
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
  viewDomain: PropTypes.object,
  dataReady: PropTypes.bool,
  authReady: PropTypes.bool,
  actorsByActortype: PropTypes.object,
  targetsByActortype: PropTypes.object,
  resourcesByResourcetype: PropTypes.object,
  initialiseForm: PropTypes.func,
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  taxonomies: PropTypes.object,
  topActionsByActiontype: PropTypes.object,
  subActionsByActiontype: PropTypes.object,
  indicatorOptions: PropTypes.object,
  userOptions: PropTypes.object,
  onCreateOption: PropTypes.func,
  connectedTaxonomies: PropTypes.object,
  actiontype: PropTypes.instanceOf(Map),
  params: PropTypes.object,
};

ActionNew.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, { params }) => ({
  viewDomain: selectDomain(state),
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

      // indicators
      if (formData.get('associatedIndicators') && indicatorOptions) {
        saveData = saveData.set(
          'actionIndicators', // targets
          Map({
            delete: List(),
            create: getCheckedValuesFromOptions(formData.get('associatedIndicators'))
              .map((id) => Map({
                indicator_id: id,
              })),
          })
        );
      }
      // users
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
      // TODO: remove once have singleselect instead of multiselect
      // const formParentIds = getCheckedValuesFromOptions(formData.get('associatedParent'));
      // if (List.isList(formParentIds) && formParentIds.size) {
      //   saveData = saveData.setIn(['attributes', 'parent_id'], formParentIds.first());
      // } else {
      //   saveData = saveData.setIn(['attributes', 'parent_id'], null);
      // }
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
