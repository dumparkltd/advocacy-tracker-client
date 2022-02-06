/*
 *
 * CategoryNew
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { actions as formActions } from 'react-redux-form/immutable';

import { List } from 'immutable';

import {
  renderParentCategoryControl,
  getTitleFormField,
  getMarkdownFormField,
  getFormField,
  getCheckboxField,
  getStatusField,
  getShortTitleFormField,
  // renderUserControl,
  // renderActionControl,
  // renderActorsByActortypeControl,
  // getReferenceFormField,
  // getConnectionUpdatesFromFormData,
  // getDateField,
} from 'utils/forms';

import { scrollToTop } from 'utils/scroll-to-component';
import { hasNewError } from 'utils/entity-form';

import { getCheckedValuesFromOptions } from 'components/forms/MultiSelectControl';

import { CONTENT_SINGLE } from 'containers/App/constants';
import { ROUTES, USER_ROLES } from 'themes/config';

import appMessages from 'containers/App/messages';

import {
  loadEntitiesIfNeeded,
  redirectIfNotPermitted,
  updatePath,
  updateEntityForm,
  submitInvalid,
  saveErrorDismiss,
  openNewEntityModal,
} from 'containers/App/actions';

import {
  selectReady,
  selectReadyForAuthCheck,
  selectIsUserAdmin,
  selectTaxonomy,
} from 'containers/App/selectors';

import Messages from 'components/Messages';
import Loading from 'components/Loading';
import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';
import EntityForm from 'containers/EntityForm';

import { getEntityTitle } from 'utils/entities';

import {
  selectDomain,
  selectParentOptions,
  selectParentTaxonomy,
  // selectActorsByActortype,
  // selectActions,
  // selectUsers,
  // selectConnectedTaxonomies,
} from './selectors';

import messages from './messages';
import { save } from './actions';
import { DEPENDENCIES, FORM_INITIAL } from './constants';


export class CategoryNew extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.scrollContainer = React.createRef();
  }

  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
    this.props.initialiseForm('categoryNew.form.data', FORM_INITIAL);
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

  getHeaderMainFields = () => {
    const { intl } = this.context;
    const groups = [];
    groups.push({ // fieldGroup
      fields: [
        getTitleFormField(intl.formatMessage),
        getShortTitleFormField(intl.formatMessage),
      ],
    });
    return groups;
  };

  getHeaderAsideFields = (taxonomy, parentOptions, parentTaxonomy) => {
    const { intl } = this.context;
    const groups = []; // fieldGroups
    groups.push({
      fields: [
        getStatusField(intl.formatMessage),
      ],
    });
    if (taxonomy.getIn(['attributes', 'tags_users'])) {
      groups.push({
        fields: [
          getCheckboxField(
            intl.formatMessage,
            'user_only',
          ),
        ],
      });
    }
    if (parentOptions && parentTaxonomy) {
      groups.push({
        label: intl.formatMessage(appMessages.entities.taxonomies.parent),
        icon: 'categories',
        fields: [renderParentCategoryControl(
          parentOptions,
          getEntityTitle(parentTaxonomy),
        )],
      });
    }
    return groups;
  }

  getBodyMainFields = (
    // taxonomy,
    // connectedTaxonomies,
    // actorsByActortype,
    // actions,
    // onCreateOption,
    // userOnly,
  ) => {
    const { intl } = this.context;
    const groups = [];
    groups.push({
      fields: [getMarkdownFormField(intl.formatMessage)],
    });
    // if (!userOnly) {
    //   // if (taxonomy.getIn(['attributes', 'tags_actions']) && actions) {
    //   //   groups.push({
    //   //     label: intl.formatMessage(appMessages.nav.actionsSuper),
    //   //     icon: 'actions',
    //   //     fields: [
    //   //       renderActionControl(actions, connectedTaxonomies, onCreateOption, intl),
    //   //     ],
    //   //   });
    //   // }
    //   // if (
    //   //   taxonomy.getIn(['attributes', 'tags_actors'])
    //   //   && actorsByActortype
    //   // ) {
    //   //   const actorConnections = renderActorsByActortypeControl(
    //   //     actorsByActortype,
    //   //     connectedTaxonomies,
    //   //     onCreateOption,
    //   //     intl,
    //   //   );
    //   //   if (actorConnections) {
    //   //     groups.push(
    //   //       {
    //   //         label: intl.formatMessage(appMessages.nav.actorsSuper),
    //   //         icon: 'actors',
    //   //         fields: actorConnections,
    //   //       },
    //   //     );
    //   //   }
    //   // }
    // }
    return groups;
  };

  getBodyAsideFields = () => {
    const { intl } = this.context;
    const fields = []; // fieldGroups
    fields.push({
      fields: [
        getFormField({
          formatMessage: intl.formatMessage,
          controlType: 'url',
          attribute: 'url',
        }),
      ],
    });
    // if (isAdmin && !!taxonomy.getIn(['attributes', 'has_manager'])) {
    //   fields.push({
    //     fields: [
    //       renderUserControl(
    //         users,
    //         intl.formatMessage(appMessages.attributes.manager_id.categories)
    //       ),
    //     ],
    //   });
    // }
    return fields;
  }

  /* eslint-disable react/destructuring-assignment */
  getTaxTitle = (id) => this.context.intl.formatMessage(appMessages.entities.taxonomies[id].single);
  /* eslint-enable react/destructuring-assignment */

  render() {
    const { intl } = this.context;
    const {
      taxonomy,
      dataReady,
      viewDomain,
      parentOptions,
      parentTaxonomy,
      // actorsByActortype,
      // actions,
      // isAdmin,
      // users,
      // connectedTaxonomies,
      // onCreateOption,
    } = this.props;
    const { saveSending, saveError, submitValid } = viewDomain.get('page').toJS();
    const taxonomyReference = this.props.params.id;

    let pageTitle = intl.formatMessage(messages.pageTitle);
    if (taxonomy && taxonomy.get('attributes')) {
      pageTitle = intl.formatMessage(messages.pageTitleTaxonomy, {
        taxonomy: this.getTaxTitle(taxonomy.get('id')),
      });
    }

    return (
      <div>
        <Helmet
          title={intl.formatMessage(messages.pageTitle)}
          meta={[
            {
              name: 'description',
              content: intl.formatMessage(messages.metaDescription),
            },
          ]}
        />
        <Content ref={this.scrollContainer}>
          <ContentHeader
            title={pageTitle}
            type={CONTENT_SINGLE}
            icon="categories"
            buttons={
              dataReady ? [{
                type: 'cancel',
                onClick: () => this.props.handleCancel(taxonomyReference),
              },
              {
                type: 'save',
                disabled: saveSending,
                onClick: () => this.props.handleSubmitRemote('categoryNew.form.data'),
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
                model="categoryNew.form.data"
                formData={viewDomain.getIn(['form', 'data'])}
                saving={saveSending}
                handleSubmit={(formData) => this.props.handleSubmit(
                  formData,
                  // actions,
                  // actorsByActortype,
                  taxonomy
                )}
                handleSubmitFail={this.props.handleSubmitFail}
                handleCancel={() => this.props.handleCancel(taxonomyReference)}
                handleUpdate={this.props.handleUpdate}
                fields={{ // isManager, taxonomies,
                  header: {
                    main: this.getHeaderMainFields(),
                    aside: this.getHeaderAsideFields(taxonomy, parentOptions, parentTaxonomy),
                  },
                  body: {
                    main: this.getBodyMainFields(
                      // taxonomy,
                      // connectedTaxonomies,
                      // actorsByActortype,
                      // actions,
                      // onCreateOption,
                      // viewDomain.getIn(['form', 'data', 'attributes', 'user_only'])
                    ),
                    aside: this.getBodyAsideFields(
                      // users, isAdmin, taxonomy
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

CategoryNew.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  redirectIfNotPermitted: PropTypes.func,
  handleSubmitRemote: PropTypes.func.isRequired,
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  dataReady: PropTypes.bool,
  authReady: PropTypes.bool,
  viewDomain: PropTypes.object,
  taxonomy: PropTypes.object,
  params: PropTypes.object,
  parentOptions: PropTypes.object,
  parentTaxonomy: PropTypes.object,
  initialiseForm: PropTypes.func,
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  // actions: PropTypes.object,
  // actorsByActortype: PropTypes.object,
  // isAdmin: PropTypes.bool,
  // users: PropTypes.object,
  // connectedTaxonomies: PropTypes.object,
  // onCreateOption: PropTypes.func,
};

CategoryNew.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => ({
  isAdmin: selectIsUserAdmin(state),
  viewDomain: selectDomain(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  authReady: selectReadyForAuthCheck(state),
  taxonomy: selectTaxonomy(state, props.params.id),
  parentOptions: selectParentOptions(state, props.params.id),
  parentTaxonomy: selectParentTaxonomy(state, props.params.id),
  // actions: selectActions(state),
  // actorsByActortype: selectActorsByActortype(state, props.params.id),
  // users: selectUsers(state),
  // connectedTaxonomies: selectConnectedTaxonomies(state),
});

function mapDispatchToProps(dispatch) {
  return {
    initialiseForm: (model, formData) => {
      dispatch(formActions.reset(model));
      dispatch(formActions.change(model, formData));
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
    // handleSubmit: (formData, actions, actorsByActortype, taxonomy) => {
    handleSubmit: (formData, taxonomy) => {
      let saveData = formData.setIn(['attributes', 'taxonomy_id'], taxonomy.get('id'));
      // if (!formData.getIn(['attributes', 'user_only'])) {
      //   if (taxonomy.getIn(['attributes', 'tags_actions'])) {
      //     saveData = saveData.set(
      //       'actionCategories',
      //       getConnectionUpdatesFromFormData({
      //         formData,
      //         connections: actions,
      //         connectionAttribute: 'associatedActions',
      //         createConnectionKey: 'measure_id',
      //         createKey: 'category_id',
      //       })
      //     );
      //   }
      //   if (actorsByActortype && taxonomy.getIn(['attributes', 'tags_actors'])) {
      //     saveData = saveData.set(
      //       'actorCategories',
      //       actorsByActortype
      //         .map((actors, actortypeid) => getConnectionUpdatesFromFormData({
      //           formData: !formData.getIn(['attributes', 'user_only']) ? formData : null,
      //           connections: actors,
      //           connectionAttribute: ['associatedActorsByActortype', actortypeid.toString()],
      //           createConnectionKey: 'actor_id',
      //           createKey: 'category_id',
      //         }))
      //         .reduce(
      //           (memo, deleteCreateLists) => {
      //             const creates = memo.get('create').concat(deleteCreateLists.get('create'));
      //             return memo.set('create', creates);
      //           },
      //           fromJS({
      //             delete: [],
      //             create: [],
      //           }),
      //         )
      //     );
      //   }
      // }


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
    handleCancel: (taxonomyReference) => {
      dispatch(updatePath(`${ROUTES.TAXONOMIES}/${taxonomyReference}`, { replace: true }));
    },
    handleUpdate: (formData) => {
      dispatch(updateEntityForm(formData));
    },
    onCreateOption: (args) => {
      dispatch(openNewEntityModal(args));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CategoryNew);
