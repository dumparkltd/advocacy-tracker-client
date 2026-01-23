/*
 *
 * PageNew
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
  API, ROUTES, USER_ROLES, PAGE_CONFIG,
} from 'themes/config';

import {
  loadEntitiesIfNeeded,
  redirectIfNotPermitted,
  updatePath,
  updateEntityForm,
  submitInvalid,
  saveErrorDismiss,
  newEntity,
  redirectIfNotSignedIn,
} from 'containers/App/actions';
import {
  selectReady,
  selectReadyForAuthCheck,
} from 'containers/App/selectors';

import Content from 'components/Content';
import ContentHeader from 'containers/ContentHeader';
import EntityFormWrapper from 'containers/EntityForm/EntityFormWrapper';

import messages from './messages';
import { DEPENDENCIES, FORM_INITIAL } from './constants';

export class PageNew extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
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

  render() {
    const { intl } = this.context;
    const {
      viewDomain,
      dataReady,
      onErrorDismiss,
      onServerErrorDismiss,
      handleCancel,
      handleSubmitRemote,
      handleSubmit,
      handleSubmitFail,
      handleUpdate,
      formDataPath,
      formId,
      inModal,
    } = this.props;
    const { saveSending } = viewDomain.get('page').toJS();
    const pageTitle = intl.formatMessage(messages.pageTitle);
    const typeLabel = 'Page';
    return (
      <Content ref={this.scrollContainer} inModal={inModal}>
        <ContentHeader title={pageTitle} />
        <EntityFormWrapper
          isNewEntityView
          typeLabel={typeLabel}
          model={formDataPath}
          inModal={inModal}
          viewDomain={viewDomain}
          handleSubmit={(formData) => handleSubmit(formData)}
          handleSubmitRemote={() => handleSubmitRemote(formDataPath)}
          saving={saveSending}
          handleSubmitFail={handleSubmitFail}
          handleCancel={handleCancel}
          handleUpdate={(data) => handleUpdate(data, formId)}
          onErrorDismiss={onErrorDismiss}
          onServerErrorDismiss={onServerErrorDismiss}
          scrollContainer={this.scrollContainer.current}
          fieldsByStep={dataReady && getEntityFormFields(
            {
              isAdmin: true,
              isMine: true,
              isNew: true,
              intl,
            },
            PAGE_CONFIG.form, // shape
            PAGE_CONFIG.attributes, // attributes
          )}
        />
      </Content>
    );
  }
}

PageNew.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func.isRequired,
  redirectIfNotPermitted: PropTypes.func,
  redirectIfNotSignedIn: PropTypes.func,
  handleSubmitRemote: PropTypes.func.isRequired,
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  viewDomain: PropTypes.object,
  dataReady: PropTypes.bool,
  authReady: PropTypes.bool,
  initialiseForm: PropTypes.func,
  formDataPath: PropTypes.string,
  formId: PropTypes.string,
  inModal: PropTypes.bool,
};

PageNew.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  authReady: selectReadyForAuthCheck(state),
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
      dispatch(formActions.change(formDataPath, formData, { silent: true }));
    },
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    redirectIfNotPermitted: () => {
      dispatch(redirectIfNotPermitted(USER_ROLES.ADMIN.value));
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
    handleSubmit: (formData) => {
      let redirect = null;
      let redirectQuery = null;
      if (!inModal) {
        if (formData.get('close')) {
          redirect = ROUTES.PAGES;
        } else {
          redirect = `${ROUTES.PAGES}${ROUTES.EDIT}`;
          redirectQuery = {
            arg: 'step',
            value: formData.get('step'),
          };
        }
      }
      dispatch(
        newEntity({
          path: API.PAGES,
          entity: formData.toJS(),
          redirect,
          redirectQuery,
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
    handleCancel: () => {
      if (inModal && onCancel) {
        // cleanup
        dispatch(submitInvalid(true));
        dispatch(saveErrorDismiss());
        onCancel();
      } else {
        dispatch(updatePath(ROUTES.PAGES, { replace: true }));
      }
    },
    handleUpdate: (formData, formId) => {
      dispatch(updateEntityForm(formData, formId));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PageNew);
