/*
 *
 * ActionEdit
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
  taxonomyOptions,
  getTitleFormField,
  getStatusField,
  getMarkdownFormField,
  getDateField,
  getTextareaField,
  renderTaxonomyControl,
  getCodeFormField,
  getLinkFormField,
  getCategoryUpdatesFromFormData,
  getConnectionUpdatesFromFormData,
  renderActorsByActortypeControl,
  renderTargetsByActortypeControl,
  renderResourcesByResourcetypeControl,
  renderIndicatorControl,
  renderActionsByActiontypeControl,
  renderUserMultiControl,
} from 'utils/forms';

import {
  getMetaField,
} from 'utils/fields';

import { checkActionAttribute, checkActionRequired } from 'utils/entities';

import { scrollToTop } from 'utils/scroll-to-component';
import { hasNewError } from 'utils/entity-form';
import qe from 'utils/quasi-equals';


import { CONTENT_SINGLE } from 'containers/App/constants';
import {
  USER_ROLES,
  API,
  ROUTES,
  ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS,
} from 'themes/config';

import {
  loadEntitiesIfNeeded,
  redirectIfNotPermitted,
  updatePath,
  updateEntityForm,
  deleteEntity,
  openNewEntityModal,
  submitInvalid,
  saveErrorDismiss,
} from 'containers/App/actions';

import {
  selectReady,
  selectReadyForAuthCheck,
  selectIsUserAdmin,
  selectSessionUserId,
  selectActionIndicatorsForAction,
} from 'containers/App/selectors';

import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';

import appMessages from 'containers/App/messages';
import FormWrapper from './FormWrapper';

import {
  selectDomainPage,
  selectViewEntity,
  selectTopActionsByActiontype,
  selectSubActionsByActiontype,
  selectTaxonomyOptions,
  selectActorsByActortype,
  selectTargetsByActortype,
  selectResourcesByResourcetype,
  selectConnectedTaxonomies,
  selectIndicatorOptions,
  selectUserOptions,
} from './selectors';

import messages from './messages';
import { save } from './actions';
import { DEPENDENCIES, FORM_INITIAL } from './constants';

export class ActionEdit extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.scrollContainer = React.createRef();
  }

  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
    if (this.props.dataReady && this.props.viewEntity) {
      this.props.initialiseForm('actionEdit.form.data', this.getInitialFormData());
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
    // repopulate if new data becomes ready
    if (nextProps.dataReady && !this.props.dataReady && nextProps.viewEntity) {
      this.props.initialiseForm('actionEdit.form.data', this.getInitialFormData(nextProps));
    }
    //
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
      taxonomies,
      actorsByActortype,
      targetsByActortype,
      resourcesByResourcetype,
      topActionsByActiontype,
      subActionsByActiontype,
      indicatorOptions,
      userOptions,
    } = props;
    return viewEntity
      ? Map({
        id: viewEntity.get('id'),
        attributes: viewEntity.get('attributes').mergeWith(
          (oldVal, newVal) => oldVal === null ? newVal : oldVal,
          FORM_INITIAL.get('attributes')
        ),
        associatedTaxonomies: taxonomyOptions(taxonomies),
        associatedActorsByActortype: actorsByActortype
          ? actorsByActortype.map((actors) => entityOptions(actors, true))
          : Map(),
        associatedTargetsByActortype: targetsByActortype
          ? targetsByActortype.map((targets) => entityOptions(targets, true))
          : Map(),
        associatedResourcesByResourcetype: resourcesByResourcetype
          ? resourcesByResourcetype.map((resources) => entityOptions(resources, true))
          : Map(),
        associatedIndicators: indicatorOptions
          ? entityOptions(indicatorOptions, true)
          : Map(),
        associatedTopActionsByActiontype: topActionsByActiontype
          ? topActionsByActiontype.map((actions) => entityOptions(actions, true))
          : Map(),
        associatedSubActionsByActiontype: subActionsByActiontype
          ? subActionsByActiontype.map((actions) => entityOptions(actions, true))
          : Map(),
        associatedUsers: userOptions
          ? entityOptions(userOptions, true)
          : Map(),
      })
      : Map();
  }

  getHeaderMainFields = (entity) => {
    const { intl } = this.context;
    const typeId = entity.getIn(['attributes', 'measuretype_id']);
    return (
      [ // fieldGroups
        { // fieldGroup
          fields: [
            checkActionAttribute(typeId, 'code', true) && getCodeFormField(
              intl.formatMessage,
              'code',
              checkActionRequired(typeId, 'code'),
            ),
            checkActionAttribute(typeId, 'title', true) && getTitleFormField(
              intl.formatMessage,
              'title',
              'title',
              checkActionRequired(typeId, 'title'),
            ),
          ],
        },
      ]
    );
  };

  getHeaderAsideFields = (entity, isAdmin, isMine) => {
    const { intl } = this.context;
    const groups = []; // fieldGroups

    groups.push({
      fields: [
        getStatusField(intl.formatMessage),
        (isAdmin || isMine) && getStatusField(intl.formatMessage, 'private'),
        isAdmin && getStatusField(intl.formatMessage, 'is_archive'),
        getStatusField(intl.formatMessage, 'notifications'),
        getMetaField(entity),
      ],
    });
    return groups;
  };

  getBodyMainFields = ({
    entity,
    connectedTaxonomies,
    actorsByActortype,
    targetsByActortype,
    resourcesByResourcetype,
    subActionsByActiontype,
    indicatorOptions,
    onCreateOption,
    entityIndicatorConnections,
  }) => {
    const { intl } = this.context;
    const typeId = entity.getIn(['attributes', 'measuretype_id']);

    const groups = [];
    groups.push(
      {
        fields: [
          checkActionAttribute(typeId, 'description', true) && getMarkdownFormField(
            intl.formatMessage,
            checkActionRequired(typeId, 'description'),
            'description',
          ),
          checkActionAttribute(typeId, 'comment', true) && getMarkdownFormField(
            intl.formatMessage,
            checkActionRequired(typeId, 'comment'),
            'comment',
          ),
        ],
      },
      {
        fields: [
          checkActionAttribute(typeId, 'target_comment', true) && getMarkdownFormField(
            intl.formatMessage,
            checkActionRequired(typeId, 'target_comment'),
            'target_comment',
          ),
          checkActionAttribute(typeId, 'status_comment', true) && getMarkdownFormField(
            intl.formatMessage,
            checkActionRequired(typeId, 'status_comment'),
            'status_comment',
          ),
        ],
      },
    );
    if (indicatorOptions) {
      let connectionAttributes = [];
      if (ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS[typeId]) {
        connectionAttributes = [
          ...connectionAttributes,
          {
            attribute: 'supportlevel_id',
            type: 'select',
            options: ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS[typeId].map(
              (level) => ({
                label: intl.formatMessage(appMessages.supportlevels[level.value]),
                ...level,
              }),
            ),
          },
        ];
      }
      const indicatorConnections = renderIndicatorControl({
        entities: indicatorOptions,
        contextIntl: intl,
        connections: entityIndicatorConnections,
        connectionAttributes,
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
    entity,
    taxonomies,
    connectedTaxonomies,
    topActionsByActiontype,
    userOptions,
    onCreateOption,
  ) => {
    const { intl } = this.context;
    const typeId = entity.getIn(['attributes', 'measuretype_id']);
    const groups = [];
    if (userOptions) {
      const userConnections = renderUserMultiControl(
        userOptions,
        null,
        intl,
      );
      if (userConnections) {
        groups.push(
          {
            label: intl.formatMessage(appMessages.nav.userActions),
            fields: [userConnections],
          },
        );
      }
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
  };

  render() {
    const {
      viewEntity,
      dataReady,
      viewDomainPage,
      taxonomies,
      connectedTaxonomies,
      actorsByActortype,
      targetsByActortype,
      resourcesByResourcetype,
      onCreateOption,
      topActionsByActiontype,
      subActionsByActiontype,
      indicatorOptions,
      userOptions,
      isAdmin,
      myId,
      onErrorDismiss,
      onServerErrorDismiss,
      handleCancel,
      handleSubmitRemote,
      handleSubmit,
      handleSubmitFail,
      handleUpdate,
      handleDelete,
      entityIndicatorConnections,
    } = this.props;
    const { intl } = this.context;
    // const reference = this.props.params.id;
    const typeId = viewEntity && viewEntity.getIn(['attributes', 'measuretype_id']);

    const { saveSending, saveError, deleteSending } = viewDomainPage.toJS();

    const type = typeId
      ? intl.formatMessage(appMessages.entities[`actions_${typeId}`].single)
      : intl.formatMessage(appMessages.entities.actions.single);
    const isMine = viewEntity && qe(viewEntity.getIn(['attributes', 'created_by_id']), myId);

    return (
      <div>
        <Helmet
          title={`${intl.formatMessage(messages.pageTitle, { type })}`}
          meta={[
            { name: 'description', content: intl.formatMessage(messages.metaDescription) },
          ]}
        />
        <Content ref={this.scrollContainer}>
          <ContentHeader
            title={intl.formatMessage(messages.pageTitle, { type })}
            type={CONTENT_SINGLE}
            buttons={
              viewEntity && dataReady
                ? [{
                  type: 'cancel',
                  onClick: handleCancel,
                },
                {
                  type: 'save',
                  disabled: saveSending,
                  onClick: () => handleSubmitRemote('actionEdit.form.data'),
                }]
                : null
            }
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
              <FormWrapper
                model="actionEdit.form.data"
                saving={saveSending}
                handleSubmit={(formData) => handleSubmit(
                  formData,
                  taxonomies,
                  actorsByActortype,
                  targetsByActortype,
                  resourcesByResourcetype,
                  topActionsByActiontype,
                  subActionsByActiontype,
                  indicatorOptions,
                  userOptions,
                )}
                handleSubmitFail={handleSubmitFail}
                handleCancel={handleCancel}
                handleUpdate={handleUpdate}
                handleDelete={isAdmin ? handleDelete : null}
                onErrorDismiss={onErrorDismiss}
                onServerErrorDismiss={onServerErrorDismiss}
                fields={dataReady && {
                  header: {
                    main: this.getHeaderMainFields(viewEntity),
                    aside: this.getHeaderAsideFields(viewEntity, isAdmin, isMine),
                  },
                  body: {
                    main: this.getBodyMainFields({
                      entity: viewEntity,
                      connectedTaxonomies,
                      actorsByActortype,
                      targetsByActortype,
                      resourcesByResourcetype,
                      subActionsByActiontype,
                      indicatorOptions,
                      onCreateOption,
                      entityIndicatorConnections,
                    }),
                    aside: this.getBodyAsideFields(
                      viewEntity,
                      taxonomies,
                      connectedTaxonomies,
                      topActionsByActiontype,
                      userOptions,
                      onCreateOption,
                    ),
                  },
                }}
                scrollContainer={this.scrollContainer.current}
              />
            )
          }
        </Content>
      </div>
    );
  }
}

ActionEdit.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  redirectIfNotPermitted: PropTypes.func,
  initialiseForm: PropTypes.func,
  handleSubmitRemote: PropTypes.func.isRequired,
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  viewDomainPage: PropTypes.object,
  viewEntity: PropTypes.object,
  dataReady: PropTypes.bool,
  authReady: PropTypes.bool,
  isAdmin: PropTypes.bool,
  params: PropTypes.object,
  taxonomies: PropTypes.object,
  topActionsByActiontype: PropTypes.object,
  subActionsByActiontype: PropTypes.object,
  indicatorOptions: PropTypes.object,
  userOptions: PropTypes.object,
  connectedTaxonomies: PropTypes.object,
  actorsByActortype: PropTypes.object,
  targetsByActortype: PropTypes.object,
  resourcesByResourcetype: PropTypes.object,
  onCreateOption: PropTypes.func,
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  myId: PropTypes.string,
  entityIndicatorConnections: PropTypes.object,
};

ActionEdit.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, { params }) => ({
  viewDomainPage: selectDomainPage(state),
  isAdmin: selectIsUserAdmin(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  authReady: selectReadyForAuthCheck(state),
  viewEntity: selectViewEntity(state, params.id),
  taxonomies: selectTaxonomyOptions(state, params.id),
  connectedTaxonomies: selectConnectedTaxonomies(state),
  actorsByActortype: selectActorsByActortype(state, params.id),
  targetsByActortype: selectTargetsByActortype(state, params.id),
  resourcesByResourcetype: selectResourcesByResourcetype(state, params.id),
  topActionsByActiontype: selectTopActionsByActiontype(state, params.id),
  subActionsByActiontype: selectSubActionsByActiontype(state, params.id),
  indicatorOptions: selectIndicatorOptions(state, params.id),
  userOptions: selectUserOptions(state, params.id),
  myId: selectSessionUserId(state),
  entityIndicatorConnections: selectActionIndicatorsForAction(state, params.id),
});

function mapDispatchToProps(dispatch, props) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    redirectIfNotPermitted: () => {
      dispatch(redirectIfNotPermitted(USER_ROLES.MANAGER.value));
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
      taxonomies,
      actorsByActortype,
      targetsByActortype,
      resourcesByResourcetype,
      topActionsByActiontype,
      subActionsByActiontype,
      indicatorOptions,
      userOptions,
    ) => {
      let saveData = formData.set(
        'actionCategories',
        getCategoryUpdatesFromFormData({
          formData,
          taxonomies,
          createKey: 'measure_id',
        })
      );
      if (topActionsByActiontype) {
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
      if (subActionsByActiontype) {
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
      if (actorsByActortype) {
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
      if (targetsByActortype) {
        saveData = saveData.set(
          'actionActors', // targets
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
      if (resourcesByResourcetype) {
        saveData = saveData.set(
          'actionResources', // targets
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
      if (indicatorOptions) {
        saveData = saveData.set(
          'actionIndicators', // targets
          getConnectionUpdatesFromFormData({
            formData,
            connections: indicatorOptions,
            connectionAttribute: 'associatedIndicators',
            createConnectionKey: 'indicator_id',
            createKey: 'measure_id',
            connectionAttributes: ['supportlevel_id'],
          })
        );
      }
      if (userOptions) {
        saveData = saveData.set(
          'userActions',
          getConnectionUpdatesFromFormData({
            formData,
            connections: userOptions,
            connectionAttribute: 'associatedUsers',
            createConnectionKey: 'user_id',
            createKey: 'measure_id',
          })
        );
      }
      dispatch(save(saveData.toJS()));
    },
    handleCancel: () => {
      dispatch(updatePath(`${ROUTES.ACTION}/${props.params.id}`, { replace: true }));
    },
    handleUpdate: (formData) => {
      dispatch(updateEntityForm(formData));
    },
    handleDelete: () => {
      dispatch(deleteEntity({
        path: API.ACTIONS,
        id: props.params.id,
        redirect: ROUTES.ACTIONS,
      }));
    },
    onCreateOption: (args) => {
      dispatch(openNewEntityModal(args));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActionEdit);
