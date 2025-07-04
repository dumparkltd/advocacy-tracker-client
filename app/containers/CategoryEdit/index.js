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

import { Map } from 'immutable';

import { getEntityFormFields } from 'utils/forms';


import { scrollToTop } from 'utils/scroll-to-component';
import { hasNewError } from 'utils/entity-form';
import qe from 'utils/quasi-equals';

import {
  ROUTES, USER_ROLES, API, CATEGORY_CONFIG,
} from 'themes/config';
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
  invalidateEntities,
  redirectIfNotSignedIn,
} from 'containers/App/actions';

import {
  selectReady,
  selectReadyForAuthCheck,
  selectIsUserAdmin,
  selectIsUserMember,
  selectSessionUserId,
  selectStepQuery,
} from 'containers/App/selectors';

import Content from 'components/Content';
import ContentHeader from 'containers/ContentHeader';

import EntityFormWrapper from 'containers/EntityForm/EntityFormWrapper';

import {
  selectDomain,
  selectDomainPage,
  selectViewEntity,
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
    this.props.onInvalidateEntities();
    this.props.redirectIfNotSignedIn();
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
    const { viewEntity, step } = props;
    return viewEntity
      ? Map({
        id: viewEntity.get('id'),
        attributes: viewEntity.get('attributes').mergeWith(
          (oldVal, newVal) => oldVal === null ? newVal : oldVal,
          FORM_INITIAL.get('attributes')
        ),
        step,
      })
      : Map();
  };

  getTaxTitle = (id) => this.context.intl.formatMessage(appMessages.entities.taxonomies[id].single);

  render() {
    const { intl } = this.context;
    const {
      viewEntity,
      dataReady,
      isAdmin,
      isUserMember,
      viewDomain,
      viewDomainPage,
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
    let typeLabel = 'Category';
    let pageTitle = intl.formatMessage(messages.pageTitle);
    if (viewEntity && viewEntity.get('taxonomy')) {
      typeLabel = this.getTaxTitle(viewEntity.getIn(['taxonomy', 'id']));
      pageTitle = intl.formatMessage(messages.pageTitleTaxonomy, {
        taxonomy: typeLabel,
      });
    }
    const isMine = viewEntity && qe(viewEntity.getIn(['attributes', 'created_by_id']), myId);
    const formDataPath = 'categoryEdit.form.data';

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
            icon="categories"
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
              <EntityFormWrapper
                typeLabel="Category"
                model={formDataPath}
                saving={saveSending}
                viewDomain={viewDomain}
                handleSubmit={handleSubmit}
                handleSubmitRemote={() => handleSubmitRemote(formDataPath)}
                handleSubmitFail={handleSubmitFail}
                handleCancel={() => handleCancel(reference)}
                handleUpdate={handleUpdate}
                handleDelete={() => canDelete
                  ? handleDelete(viewEntity.getIn(['attributes', 'taxonomy_id']))
                  : null
                }
                onErrorDismiss={onErrorDismiss}
                onServerErrorDismiss={onServerErrorDismiss}
                fieldsByStep={dataReady && getEntityFormFields(
                  {
                    isAdmin,
                    isMine,
                    intl,
                  },
                  CATEGORY_CONFIG.form,
                  CATEGORY_CONFIG.attributes,
                )}
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
  onInvalidateEntities: PropTypes.func,
  redirectIfNotSignedIn: PropTypes.func,
  redirectIfNotPermitted: PropTypes.func,
  initialiseForm: PropTypes.func,
  handleSubmitRemote: PropTypes.func.isRequired,
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  handleDelete: PropTypes.func,
  viewDomain: PropTypes.object,
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
  step: PropTypes.string,
};

CategoryEdit.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => ({
  isAdmin: selectIsUserAdmin(state),
  isUserMember: selectIsUserMember(state),
  viewDomain: selectDomain(state),
  viewDomainPage: selectDomainPage(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  authReady: selectReadyForAuthCheck(state),
  viewEntity: selectViewEntity(state, props.params.id),
  myId: selectSessionUserId(state),
  step: selectStepQuery(state),
});

function mapDispatchToProps(dispatch, props) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onInvalidateEntities: () => {
      DEPENDENCIES.forEach((path) => {
        dispatch(invalidateEntities(path));
      });
    },
    redirectIfNotSignedIn: () => {
      dispatch(redirectIfNotSignedIn());
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
    handleSubmit: (formData) => {
      dispatch(save(formData.toJS()));
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
