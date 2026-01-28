/*
 *
 * CategoryNewForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { actions as formActions } from 'react-redux-form/immutable';

import { getEntityFormFields } from 'utils/forms';

import { scrollToTop } from 'utils/scroll-to-component';
import { hasNewErrorNEW } from 'utils/entity-form';

import {
  API, ROUTES, USER_ROLES, CATEGORY_CONFIG,
} from 'themes/config';

import appMessages from 'containers/App/messages';

import {
  loadEntitiesIfNeeded,
  redirectIfNotPermitted,
  updatePath,
  updateEntityForm,
  submitInvalid,
  saveErrorDismiss,
  openNewEntityModal,
  newEntity,
  redirectIfNotSignedIn,
} from 'containers/App/actions';

import {
  selectReady,
  selectReadyForAuthCheck,
  selectIsUserAdmin,
  selectTaxonomy,
} from 'containers/App/selectors';

import Content from 'components/Content';
import ContentHeader from 'containers/ContentHeader';

import EntityFormWrapper from 'containers/EntityForm/EntityFormWrapper';

import messages from './messages';
import { DEPENDENCIES, FORM_INITIAL } from './constants';


export class CategoryNewForm extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.scrollContainer = React.createRef();
  }

  UNSAFE_componentWillMount() {
    this.props.redirectIfNotSignedIn();
    this.props.loadEntitiesIfNeeded();
    this.props.initialiseForm(FORM_INITIAL);
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

  /* eslint-disable react/destructuring-assignment */
  getTaxTitle = (id) => this.context.intl.formatMessage(appMessages.entities.taxonomies[id].single);
  /* eslint-enable react/destructuring-assignment */

  render() {
    const { intl } = this.context;
    const {
      taxonomy,
      dataReady,
      viewDomain,
      onErrorDismiss,
      onServerErrorDismiss,
      handleCancel,
      handleSubmitRemote,
      handleSubmit,
      handleSubmitFail,
      handleUpdate,
      typeId,
      formDataPath,
      formId,
      inModal,
      invalidateEntitiesOnSuccess,
    } = this.props;
    const { saveSending, isAnySending } = viewDomain.get('page').toJS();
    const saving = isAnySending || saveSending;
    let typeLabel = 'Category';
    let pageTitle = intl.formatMessage(messages.pageTitle);
    if (taxonomy && taxonomy.get('attributes')) {
      typeLabel = this.getTaxTitle(taxonomy.get('id'));
      pageTitle = intl.formatMessage(messages.pageTitleTaxonomy, {
        taxonomy: typeLabel,
      });
    }

    return (
      <Content ref={this.scrollContainer} inModal={inModal}>
        <ContentHeader
          title={pageTitle}
        />
        <EntityFormWrapper
          isNewEntityView
          typeLabel={typeLabel}
          model={formDataPath}
          inModal={inModal}
          viewDomain={viewDomain}
          handleSubmit={(formData) => handleSubmit(
            formData,
            taxonomy,
            invalidateEntitiesOnSuccess,
          )}
          handleSubmitFail={handleSubmitFail}
          handleSubmitRemote={() => handleSubmitRemote(formDataPath)}
          handleCancel={() => handleCancel(typeId)}
          handleUpdate={(data) => handleUpdate(data, formId)}
          onErrorDismiss={onErrorDismiss}
          onServerErrorDismiss={onServerErrorDismiss}
          scrollContainer={this.scrollContainer.current}
          fieldsByStep={dataReady && getEntityFormFields(
            {
              isMine: true,
              taxonomy,
              intl,
              isNew: true,
              entityType: API.CATEGORIES,
            },
            CATEGORY_CONFIG.form,
            CATEGORY_CONFIG.attributes,
          )}
          saving={saving}
        />
      </Content>
    );
  }
}

CategoryNewForm.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  redirectIfNotPermitted: PropTypes.func,
  redirectIfNotSignedIn: PropTypes.func,
  handleSubmitRemote: PropTypes.func.isRequired,
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  dataReady: PropTypes.bool,
  authReady: PropTypes.bool,
  viewDomain: PropTypes.object,
  taxonomy: PropTypes.object,
  initialiseForm: PropTypes.func,
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  typeId: PropTypes.string,
  formDataPath: PropTypes.string,
  formId: PropTypes.string,
  inModal: PropTypes.bool,
  invalidateEntitiesOnSuccess: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
};

CategoryNewForm.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, { typeId }) => ({
  isAdmin: selectIsUserAdmin(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  authReady: selectReadyForAuthCheck(state),
  taxonomy: selectTaxonomy(state, typeId),
});

function mapDispatchToProps(
  dispatch,
  {
    formDataPath,
    inModal,
    onSaveSuccess,
    onCancel,
  }
) {
  return {
    initialiseForm: (formData) => {
      dispatch(formActions.reset(formDataPath));
      dispatch(formActions.change(formDataPath, formData));
    },
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    redirectIfNotPermitted: () => {
      dispatch(redirectIfNotPermitted(USER_ROLES.MEMBER.value));
    },
    redirectIfNotSignedIn: () => {
      dispatch(redirectIfNotSignedIn());
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
    handleSubmit: (formData, taxonomy, invalidateEntitiesOnSuccess) => {
      const saveData = formData.setIn(['attributes', 'taxonomy_id'], taxonomy.get('id'));
      let redirect = null;
      let redirectQuery = null;
      if (!inModal) {
        if (formData.get('close')) {
          redirect = ROUTES.CATEGORY;
        } else {
          redirect = `${ROUTES.CATEGORY}${ROUTES.EDIT}`;
          redirectQuery = {
            arg: 'step',
            value: formData.get('step'),
          };
        }
      }
      dispatch(
        newEntity({
          path: API.CATEGORIES,
          entity: saveData.toJS(),
          redirect,
          redirectQuery,
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
        dispatch(updatePath(`${ROUTES.TAXONOMIES}/${typeId}`, { replace: true }));
      }
    },
    handleUpdate: (formData, formId) => {
      dispatch(updateEntityForm(formData, formId));
    },
    onCreateOption: (args) => {
      dispatch(openNewEntityModal(args));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CategoryNewForm);
