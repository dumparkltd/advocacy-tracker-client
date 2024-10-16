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
  fields,
  onServerErrorDismiss,
  onErrorDismiss,
  handleSubmitFail,
  handleCancel,
  handleUpdate,
  handleSubmit,
  scrollContainer,
  inModal,
}) {
  const { saveSending, saveError, submitValid } = viewDomain.get('page').toJS();
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
      {(saveSending || !fields) && <Loading />}
      {fields && (
        <EntityForm
          model={model}
          inModal={inModal}
          formData={viewDomain.getIn(['form', 'data'])}
          saving={saveSending}
          handleSubmit={handleSubmit}
          handleSubmitFail={handleSubmitFail}
          handleCancel={handleCancel}
          handleUpdate={handleUpdate}
          fields={fields}
          scrollContainer={scrollContainer}
        />
      )}
      {saveSending && <Loading />}
    </div>
  );
}

FormWrapper.propTypes = {
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  viewDomain: PropTypes.object,
  fields: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  scrollContainer: PropTypes.object,
  model: PropTypes.string,
  inModal: PropTypes.bool,
};

export default FormWrapper;
