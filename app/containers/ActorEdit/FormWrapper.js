/*
 *
 * FormWrapper
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Messages from 'components/Messages';
import Loading from 'components/Loading';
import EntityForm from 'containers/EntityForm';

import {
  selectDomain,
} from './selectors';

export function FormWrapper({
  viewDomain,
  model,
  fieldsByStep,
  onServerErrorDismiss,
  onErrorDismiss,
  handleSubmitFail,
  handleCancel,
  handleUpdate,
  handleSubmit,
  handleSubmitRemote,
  handleDelete,
  scrollContainer,
  typeLabel,
}) {
  // console.log(fieldsByStep)
  // console.log('viewDomain', viewDomain && viewDomain.toJS())
  const {
    saveSending, saveError, deleteSending, deleteError, submitValid,
  } = viewDomain.get('page').toJS();
  return (
    <div>
      {!submitValid && (
        <Messages
          type="error"
          messageKey="submitInvalid"
          onDismiss={onErrorDismiss}
        />
      )}
      {saveError && (
        <Messages
          type="error"
          messages={saveError.messages}
          onDismiss={onServerErrorDismiss}
        />
      )}
      {deleteError && <Messages type="error" messages={deleteError} />}
      {(saveSending || deleteSending || !fieldsByStep) && <Loading />}
      {fieldsByStep && (
        <EntityForm
          model={model}
          formData={viewDomain.getIn(['form', 'data'])}
          formDataTracked={viewDomain.getIn(['form', 'forms', 'data'])}
          saving={saveSending}
          handleSubmit={handleSubmit}
          handleSubmitRemote={handleSubmitRemote}
          handleSubmitFail={handleSubmitFail}
          handleCancel={handleCancel}
          handleUpdate={handleUpdate}
          handleDelete={handleDelete}
          fieldsByStep={fieldsByStep}
          scrollContainer={scrollContainer}
          typeLabel={typeLabel}
        />
      )}
      {(saveSending || deleteSending) && <Loading />}
    </div>
  );
}

FormWrapper.propTypes = {
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  handleSubmitRemote: PropTypes.func,
  handleDelete: PropTypes.func,
  viewDomain: PropTypes.object,
  fieldsByStep: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  scrollContainer: PropTypes.object,
  model: PropTypes.string,
  typeLabel: PropTypes.string,
};

const mapStateToProps = (state) => ({
  viewDomain: selectDomain(state),
});

export default connect(mapStateToProps, null)(FormWrapper);
