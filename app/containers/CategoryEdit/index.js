/*
 *
 * CategoryEdit
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { actions as formActions } from 'react-redux-form/immutable';

import { Map, List } from 'immutable';

import {
  userOptions,
  entityOptions,
  renderParentCategoryControl,
  getTitleFormField,
  getShortTitleFormField,
  getMarkdownFormField,
  getLinkFormField,
  getCheckboxFormField,
  getStatusFormField,
  parentCategoryOptions,
  // renderUserControl,
  // renderActionControl,
  // renderActorsByActortypeControl,
  // getConnectionUpdatesFromFormData,
} from 'utils/forms';

import {
  getMetaField,
} from 'utils/fields';

import { scrollToTop } from 'utils/scroll-to-component';
import { hasNewError } from 'utils/entity-form';
import qe from 'utils/quasi-equals';

import { getCheckedValuesFromOptions } from 'components/forms/MultiSelectControl';

import { CONTENT_SINGLE } from 'containers/App/constants';
import { ROUTES, USER_ROLES, API } from 'themes/config';
import appMessages from 'containers/App/messages';

import {
  loadEntitiesIfNeeded,
  redirectIfNotPermitted,
  updatePath,
  updateEntityForm,
  deleteEntity,
  submitInvalid,
  saveErrorDismiss,
  openNewEntityModal,
} from 'containers/App/actions';

import {
  selectReady,
  selectReadyForAuthCheck,
  selectIsUserAdmin,
  selectIsUserMember,
  selectSessionUserId,
} from 'containers/App/selectors';

import Content from 'components/Content';
import ContentHeader from 'containers/ContentHeader';

import { getEntityTitle } from 'utils/entities';

import FormWrapper from './FormWrapper';

import {
  selectDomainPage,
  selectViewEntity,
  selectParentOptions,
  selectParentTaxonomy,
} from './selectors';

import messages from './messages';
import { save } from './actions';
import { DEPENDENCIES, FORM_INITIAL } from './constants';

export class CategoryEdit extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.scrollContainer = React.createRef();
  }

  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();

    if (this.props.dataReady && this.props.viewEntity) {
      this.props.initialiseForm('categoryEdit.form.data', this.getInitialFormData());
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
    if (nextProps.dataReady && !this.props.dataReady && nextProps.viewEntity) {
      this.props.initialiseForm('categoryEdit.form.data', this.getInitialFormData(nextProps));
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
    const {
      viewEntity, users, actions, actorsByActortype, parentOptions,
    } = props;
    return viewEntity
      ? Map({
        id: viewEntity.get('id'),
        attributes: viewEntity.get('attributes').mergeWith(
          (oldVal, newVal) => oldVal === null ? newVal : oldVal,
          FORM_INITIAL.get('attributes')
        ),
        associatedActions: actions && entityOptions({ entities: actions }),
        associatedActorsByActortype: actorsByActortype
          ? actorsByActortype.map((actors) => entityOptions({ entities: actors }))
          : Map(),
        associatedUser: userOptions(users, viewEntity.getIn(['attributes', 'manager_id'])),
        associatedCategory: parentCategoryOptions(parentOptions, viewEntity.getIn(['attributes', 'parent_id'])),
        // TODO allow single value for singleSelect
      })
      : Map();
  };

  getHeaderMainFields = () => {
    const { intl } = this.context;
    const groups = [];
    groups.push({ // fieldGroup
      fields: [
        getTitleFormField({ formatMessage: intl.formatMessage }),
        getShortTitleFormField({ formatMessage: intl.formatMessage }),
      ],
    });
    return groups;
  };


  getHeaderAsideFields = (entity, isAdmin, isMine) => {
    const { intl } = this.context;
    const groups = []; // fieldGroups
    groups.push({
      fields: [
        getStatusFormField({ formatMessage: intl.formatMessage }),
        (isAdmin || isMine) && getStatusFormField({ formatMessage: intl.formatMessage, attribute: 'private' }),
        isAdmin && getStatusFormField({ formatMessage: intl.formatMessage, attribute: 'is_archive' }),
        getMetaField(entity),
      ],
    });
    if (entity.getIn(['taxonomy', 'attributes', 'tags_users'])) {
      groups.push({
        fields: [
          getCheckboxFormField({
            formatMessage: intl.formatMessage,
            attribute: 'user_only',
          }),
        ],
      });
    }
    return groups;
  };

  getBodyMainFields = (
    entity,
    parentOptions,
    parentTaxonomy,
    // connectedTaxonomies,
    // actorsByActortype,
    // actions,
    // onCreateOption,
    // userOnly,
  ) => {
    const { intl } = this.context;
    const groups = [];
    groups.push({
      fields: [getMarkdownFormField({ formatMessage: intl.formatMessage })],
    });
    if (parentOptions && parentTaxonomy) {
      groups.push({
        label: intl.formatMessage(appMessages.entities.taxonomies.parent),
        icon: 'categories',
        fields: [renderParentCategoryControl({
          entities: parentOptions,
          label: getEntityTitle(parentTaxonomy),
          activeParentId: entity.getIn(['attributes', 'parent_id']),
        })],
      });
    }
    return groups;
  };

  // getBodyAsideFields = (entity, users, isAdmin) => {
  getBodyAsideFields = () => {
    const { intl } = this.context;
    const fields = []; // fieldGroups
    fields.push({
      fields: [
        getLinkFormField({ formatMessage: intl.formatMessage }),
      ],
    });
    return fields;
  };

  getTaxTitle = (id) => this.context.intl.formatMessage(appMessages.entities.taxonomies[id].single);

  render() {
    const { intl } = this.context;
    const {
      viewEntity,
      dataReady,
      isAdmin,
      isUserMember,
      viewDomainPage,
      parentOptions,
      parentTaxonomy,
      myId,
      onErrorDismiss,
      onServerErrorDismiss,
      handleCancel,
      handleSubmitRemote,
      handleSubmit,
      handleSubmitFail,
      handleUpdate,
      handleDelete,
    } = this.props;
    const reference = this.props.params.id;
    const { saveSending, saveError, deleteSending } = viewDomainPage.toJS();

    let pageTitle = intl.formatMessage(messages.pageTitle);
    if (viewEntity && viewEntity.get('taxonomy')) {
      pageTitle = intl.formatMessage(messages.pageTitleTaxonomy, {
        taxonomy: this.getTaxTitle(viewEntity.getIn(['taxonomy', 'id'])),
      });
    }
    const isMine = viewEntity && qe(viewEntity.getIn(['attributes', 'created_by_id']), myId);

    // user can delete content
    // if they are admins or
    // if they are at least members and its their own content
    const canDelete = isAdmin
      || (isUserMember && viewEntity && qe(myId, viewEntity.getIn(['attributes', 'created_by_id'])));

    return (
      <div>
        <Helmet
          title={`${intl.formatMessage(messages.pageTitle)}: ${reference}`}
          meta={[
            { name: 'description', content: intl.formatMessage(messages.metaDescription) },
          ]}
        />
        <Content ref={this.scrollContainer}>
          <ContentHeader
            title={pageTitle}
            type={CONTENT_SINGLE}
            icon="categories"
            buttons={
              viewEntity && dataReady ? [{
                type: 'cancel',
                onClick: () => handleCancel(reference),
              },
              {
                type: 'save',
                disabled: saveSending,
                onClick: () => handleSubmitRemote('categoryEdit.form.data'),
              }] : null
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
                model="categoryEdit.form.data"
                saving={saveSending}
                handleSubmit={(formData) => handleSubmit(
                  formData,
                  // actions,
                  // actorsByActortype,
                  viewEntity.get('taxonomy'),
                )}
                handleSubmitFail={handleSubmitFail}
                handleCancel={() => handleCancel(reference)}
                handleUpdate={handleUpdate}
                handleDelete={() => canDelete
                  ? handleDelete(viewEntity.getIn(['attributes', 'taxonomy_id']))
                  : null
                }
                onErrorDismiss={onErrorDismiss}
                onServerErrorDismiss={onServerErrorDismiss}
                fields={dataReady && {
                  header: {
                    main: this.getHeaderMainFields(),
                    aside: this.getHeaderAsideFields(
                      viewEntity,
                      isAdmin,
                      isMine,
                    ),
                  },
                  body: {
                    main: this.getBodyMainFields(
                      viewEntity,
                      parentOptions,
                      parentTaxonomy,
                    ),
                    aside: this.getBodyAsideFields(),
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

CategoryEdit.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  redirectIfNotPermitted: PropTypes.func,
  initialiseForm: PropTypes.func,
  handleSubmitRemote: PropTypes.func.isRequired,
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  handleDelete: PropTypes.func,
  viewDomainPage: PropTypes.object,
  viewEntity: PropTypes.object,
  dataReady: PropTypes.bool,
  authReady: PropTypes.bool,
  isAdmin: PropTypes.bool,
  isUserMember: PropTypes.bool,
  params: PropTypes.object,
  parentOptions: PropTypes.object,
  parentTaxonomy: PropTypes.object,
  actions: PropTypes.object,
  actorsByActortype: PropTypes.object,
  connectedTaxonomies: PropTypes.object,
  users: PropTypes.object,
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  onCreateOption: PropTypes.func,
  myId: PropTypes.string,
};

CategoryEdit.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => ({
  isAdmin: selectIsUserAdmin(state),
  isUserMember: selectIsUserMember(state),
  viewDomainPage: selectDomainPage(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  authReady: selectReadyForAuthCheck(state),
  viewEntity: selectViewEntity(state, props.params.id),
  parentOptions: selectParentOptions(state, props.params.id),
  parentTaxonomy: selectParentTaxonomy(state, props.params.id),
  myId: selectSessionUserId(state),
  // users: selectUsers(state),
  // actions: selectActions(state, props.params.id),
  // actorsByActortype: selectActorsByActortype(state, props.params.id),
  // connectedTaxonomies: selectConnectedTaxonomies(state),
});

function mapDispatchToProps(dispatch, props) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    redirectIfNotPermitted: () => {
      dispatch(redirectIfNotPermitted(USER_ROLES.MEMBER.value));
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
      // actions,
      // actorsByActortype,
      // taxonomy,
    ) => {
      let saveData = formData;
      // if (taxonomy.getIn(['attributes', 'tags_actions'])) {
      //   saveData = saveData.set(
      //     'actionCategories',
      //     getConnectionUpdatesFromFormData({
      //       formData: !formData.getIn(['attributes', 'user_only']) ? formData : null,
      //       connections: actions,
      //       connectionAttribute: 'associatedActions',
      //       createConnectionKey: 'measure_id',
      //       createKey: 'category_id',
      //     })
      //   );
      // }
      // if (actorsByActortype && taxonomy.getIn(['attributes', 'tags_actors'])) {
      //   saveData = saveData.set(
      //     'actorCategories',
      //     actorsByActortype
      //       .map((actors, actortypeid) => getConnectionUpdatesFromFormData({
      //         formData: !formData.getIn(['attributes', 'user_only']) ? formData : null,
      //         connections: actors,
      //         connectionAttribute: ['associatedActorsByActortype', actortypeid.toString()],
      //         createConnectionKey: 'actor_id',
      //         createKey: 'category_id',
      //       }))
      //       .reduce(
      //         (memo, deleteCreateLists) => {
      //           const deletes = memo.get('delete').concat(deleteCreateLists.get('delete'));
      //           const creates = memo.get('create').concat(deleteCreateLists.get('create'));
      //           return memo
      //             .set('delete', deletes)
      //             .set('create', creates);
      //         },
      //         fromJS({
      //           delete: [],
      //           create: [],
      //         }),
      //       )
      //   );
      // }
      //
      // // TODO: remove once have singleselect instead of multiselect
      // const formUserIds = getCheckedValuesFromOptions(formData.get('associatedUser'));
      // if (List.isList(formUserIds) && formUserIds.size) {
      //   saveData = saveData.setIn(['attributes', 'manager_id'], formUserIds.first());
      // } else {
      //   saveData = saveData.setIn(['attributes', 'manager_id'], null);
      // }
      // TODO: remove once have singleselect instead of multiselect
      const formCategoryIds = getCheckedValuesFromOptions(formData.get('associatedCategory'));
      if (List.isList(formCategoryIds) && formCategoryIds.size) {
        saveData = saveData.setIn(['attributes', 'parent_id'], formCategoryIds.first());
      } else {
        saveData = saveData.setIn(['attributes', 'parent_id'], null);
      }
      dispatch(save(saveData.toJS()));
    },
    handleCancel: (reference) => {
      dispatch(updatePath(`${ROUTES.CATEGORY}/${reference}`, { replace: true }));
    },
    handleUpdate: (formData) => {
      dispatch(updateEntityForm(formData));
    },
    handleDelete: (taxonomyId) => {
      dispatch(deleteEntity({
        path: API.CATEGORIES,
        id: props.params.id,
        redirect: `${ROUTES.TAXONOMIES}/${taxonomyId}`,
      }));
    },
    onCreateOption: (args) => {
      dispatch(openNewEntityModal(args));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CategoryEdit);
