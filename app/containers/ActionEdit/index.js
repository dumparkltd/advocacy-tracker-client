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
import { Map, List, fromJS } from 'immutable';

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
  getCheckboxField,
  getLinkFormField,
  getFormField,
  getAmountFormField,
  getCategoryUpdatesFromFormData,
  getConnectionUpdatesFromFormData,
  renderActorsByActortypeControl,
  renderTargetsByActortypeControl,
  renderResourcesByResourcetypeControl,
  renderParentActionControl,
  parentActionOptions,
} from 'utils/forms';

import {
  getMetaField,
  getInfoField,
} from 'utils/fields';

import { checkActionAttribute, checkActionRequired } from 'utils/entities';

import { scrollToTop } from 'utils/scroll-to-component';
import { hasNewError } from 'utils/entity-form';

import { getCheckedValuesFromOptions } from 'components/forms/MultiSelectControl';

import { CONTENT_SINGLE } from 'containers/App/constants';
import { USER_ROLES, API, ROUTES } from 'themes/config';

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
} from 'containers/App/selectors';

import Messages from 'components/Messages';
import Loading from 'components/Loading';
import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';
import EntityForm from 'containers/EntityForm';

import appMessages from 'containers/App/messages';

import {
  selectDomain,
  selectViewEntity,
  selectParentOptions,
  selectTaxonomyOptions,
  selectActorsByActortype,
  selectTargetsByActortype,
  selectResourcesByResourcetype,
  selectConnectedTaxonomies,
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
      parentOptions,
    } = props;
    // console.log(FORM_INITIAL.get('attributes') && FORM_INITIAL.get('attributes').toJS())
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
        associatedParent: parentActionOptions(
          parentOptions,
          viewEntity.getIn(['attributes', 'parent_id']),
        ),

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
            getInfoField(
              'measuretype_id',
              intl.formatMessage(appMessages.actiontypes[typeId]),
              true // large
            ), // required
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

  getHeaderAsideFields = (entity, taxonomies, onCreateOption) => {
    const { intl } = this.context;
    const groups = []; // fieldGroups

    groups.push({
      fields: [
        getStatusField(intl.formatMessage),
        getMetaField(entity),
      ],
    });
    groups.push({ // fieldGroup
      label: intl.formatMessage(appMessages.entities.taxonomies.plural),
      icon: 'categories',
      fields: renderTaxonomyControl(taxonomies, onCreateOption, intl),
    });
    return groups;
  };

  getBodyMainFields = (
    entity,
    connectedTaxonomies,
    actorsByActortype,
    targetsByActortype,
    resourcesByResourcetype,
    parentOptions,
    onCreateOption,
  ) => {
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
          checkActionAttribute(typeId, 'reference_ml', true) && getMarkdownFormField(
            intl.formatMessage,
            checkActionRequired(typeId, 'reference_ml'),
            'reference_ml',
          ),
          checkActionAttribute(typeId, 'status_lbs_protocol', true) && getMarkdownFormField(
            intl.formatMessage,
            checkActionRequired(typeId, 'status_lbs_protocol'),
            'status_lbs_protocol',
          ),
          checkActionAttribute(typeId, 'has_reference_landbased_ml', true) && getCheckboxField(
            intl.formatMessage,
            'has_reference_landbased_ml',
          ),
          checkActionAttribute(typeId, 'reference_landbased_ml', true) && getMarkdownFormField(
            intl.formatMessage,
            checkActionRequired(typeId, 'reference_landbased_ml'),
            'reference_landbased_ml',
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
    if (parentOptions) {
      groups.push({
        label: intl.formatMessage(appMessages.entities.actions.parent),
        fields: [renderParentActionControl(
          parentOptions,
          intl.formatMessage(appMessages.entities.actions.single),
          entity.getIn(['attributes', 'parent_id']),
        )],
      });
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

  getBodyAsideFields = (entity) => {
    const { intl } = this.context;
    const typeId = entity.getIn(['attributes', 'measuretype_id']);

    return ([ // fieldGroups
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
    ]);
  };

  render() {
    const {
      viewEntity,
      dataReady,
      viewDomain,
      taxonomies,
      connectedTaxonomies,
      actorsByActortype,
      targetsByActortype,
      resourcesByResourcetype,
      onCreateOption,
      parentOptions,
    } = this.props;
    const { intl } = this.context;
    // const reference = this.props.params.id;
    const typeId = viewEntity && viewEntity.getIn(['attributes', 'measuretype_id']);

    const {
      saveSending, saveError, deleteSending, deleteError, submitValid,
    } = viewDomain.get('page').toJS();

    const type = typeId
      ? intl.formatMessage(appMessages.entities[`actions_${typeId}`].single)
      : intl.formatMessage(appMessages.entities.actions.single);

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
                  onClick: this.props.handleCancel,
                },
                {
                  type: 'save',
                  disabled: saveSending,
                  onClick: () => this.props.handleSubmitRemote('actionEdit.form.data'),
                }]
                : null
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
          {deleteError
            && <Messages type="error" messages={deleteError} />
          }
          {(saveSending || deleteSending || !dataReady)
            && <Loading />
          }
          {!viewEntity && dataReady && !saveError && !deleteSending
            && (
              <div>
                <FormattedMessage {...messages.notFound} />
              </div>
            )
          }
          {viewEntity && dataReady && !deleteSending
            && (
              <EntityForm
                model="actionEdit.form.data"
                formData={viewDomain.getIn(['form', 'data'])}
                saving={saveSending}
                handleSubmit={(formData) => this.props.handleSubmit(
                  formData,
                  taxonomies,
                  actorsByActortype,
                  targetsByActortype,
                  resourcesByResourcetype,
                )}
                handleSubmitFail={this.props.handleSubmitFail}
                handleCancel={this.props.handleCancel}
                handleUpdate={this.props.handleUpdate}
                handleDelete={this.props.isUserAdmin ? this.props.handleDelete : null}
                fields={{
                  header: {
                    main: this.getHeaderMainFields(viewEntity),
                    aside: this.getHeaderAsideFields(
                      viewEntity,
                      taxonomies,
                      onCreateOption,
                    ),
                  },
                  body: {
                    main: this.getBodyMainFields(
                      viewEntity,
                      connectedTaxonomies,
                      actorsByActortype,
                      targetsByActortype,
                      resourcesByResourcetype,
                      parentOptions,
                      onCreateOption,
                    ),
                    aside: this.getBodyAsideFields(viewEntity),
                  },
                }}
                scrollContainer={this.scrollContainer.current}
              />
            )
          }
          {(saveSending || deleteSending)
            && <Loading />
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
  viewDomain: PropTypes.object,
  viewEntity: PropTypes.object,
  dataReady: PropTypes.bool,
  authReady: PropTypes.bool,
  isUserAdmin: PropTypes.bool,
  params: PropTypes.object,
  taxonomies: PropTypes.object,
  parentOptions: PropTypes.object,
  connectedTaxonomies: PropTypes.object,
  actorsByActortype: PropTypes.object,
  targetsByActortype: PropTypes.object,
  resourcesByResourcetype: PropTypes.object,
  onCreateOption: PropTypes.func,
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
};

ActionEdit.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => ({
  viewDomain: selectDomain(state),
  isUserAdmin: selectIsUserAdmin(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  authReady: selectReadyForAuthCheck(state),
  viewEntity: selectViewEntity(state, props.params.id),
  taxonomies: selectTaxonomyOptions(state, props.params.id),
  connectedTaxonomies: selectConnectedTaxonomies(state),
  actorsByActortype: selectActorsByActortype(state, props.params.id),
  targetsByActortype: selectTargetsByActortype(state, props.params.id),
  resourcesByResourcetype: selectResourcesByResourcetype(state, props.params.id),
  parentOptions: selectParentOptions(state, props.params.id),
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
    handleSubmit: (formData, taxonomies, actorsByActortype, targetsByActortype, resourcesByResourcetype) => {
      let saveData = formData.set(
        'actionCategories',
        getCategoryUpdatesFromFormData({
          formData,
          taxonomies,
          createKey: 'measure_id',
        })
      );
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
      // TODO: remove once have singleselect instead of multiselect
      const formParentIds = getCheckedValuesFromOptions(formData.get('associatedParent'));
      if (List.isList(formParentIds) && formParentIds.size) {
        saveData = saveData.setIn(['attributes', 'parent_id'], formParentIds.first());
      } else {
        saveData = saveData.setIn(['attributes', 'parent_id'], null);
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
