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
  fields,
  onServerErrorDismiss,
  onErrorDismiss,
  handleSubmitFail,
  handleCancel,
  handleUpdate,
  handleSubmit,
  handleDelete,
  scrollContainer,
}) {
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
      {(saveSending || deleteSending || !fields) && <Loading />}
      {fields && (
        <EntityForm
          model={model}
          formData={viewDomain.getIn(['form', 'data'])}
          saving={saveSending}
          handleSubmit={handleSubmit}
          handleSubmitFail={handleSubmitFail}
          handleCancel={handleCancel}
          handleUpdate={handleUpdate}
          handleDelete={handleDelete}
          fields={fields}
          scrollContainer={scrollContainer}
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
  handleDelete: PropTypes.func.isRequired,
  viewDomain: PropTypes.object,
  fields: PropTypes.object,
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  scrollContainer: PropTypes.object,
  model: PropTypes.string,
};

const mapStateToProps = (state) => ({
  viewDomain: selectDomain(state),
});

export default connect(mapStateToProps, null)(FormWrapper);
