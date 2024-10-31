/*
 *
 * FormWrapper
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

import Messages from 'components/Messages';
import Loading from 'components/Loading';
import EntityForm from 'containers/EntityForm';

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
  scrollContainer,
  inModal,
  typeLabel,
}) {
  const {
    isAnySending,
    saveSending,
    saveError,
    submitValid,
  } = viewDomain.get('page').toJS();
  const saving = isAnySending || saveSending;
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
      {(saving || !fieldsByStep) && <Loading />}
      {fieldsByStep && (
        <EntityForm
          model={model}
          inModal={inModal}
          formData={viewDomain.getIn(['form', 'data'])}
          formDataTracked={viewDomain.getIn(['form', 'forms', 'data'])}
          saving={saving}
          handleSubmit={handleSubmit}
          handleSubmitRemote={handleSubmitRemote}
          handleSubmitFail={handleSubmitFail}
          handleCancel={handleCancel}
          handleUpdate={handleUpdate}
          fieldsByStep={fieldsByStep}
          scrollContainer={scrollContainer}
          isNewEntityView
          typeLabel={typeLabel}
        />
      )}
      {saving && <Loading />}
    </div>
  );
}

FormWrapper.propTypes = {
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleSubmitRemote: PropTypes.func,
  handleCancel: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  viewDomain: PropTypes.object,
  fieldsByStep: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  scrollContainer: PropTypes.object,
  model: PropTypes.string,
  typeLabel: PropTypes.string,
  inModal: PropTypes.bool,
};

export default FormWrapper;
