/*
 *
 * EntityFormWrapper
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Text } from 'grommet';
import { get } from 'lodash/object';

import Messages from 'components/Messages';
import Loading from 'components/Loading';
import EntityForm from 'containers/EntityForm';


const HintP = styled.p`
  margin-top: 40px;
  max-width: 666px;
`;

const Hint = styled((p) => <Text size="small" {...p} />)`
  color: ${palette('dark', 3)};
`;

export function EntityFormWrapper({
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
  inModal,
  isNewEntityView,
}) {
  const {
    saveSending, saveError, deleteSending, deleteError, submitValid,
  } = viewDomain ? viewDomain.get('page').toJS() : {};
  const formDataTracked = viewDomain && viewDomain.getIn(['form', 'forms', 'data']);
  const hasFormChanges = fieldsByStep && fieldsByStep.some(
    (step) => {
      if (!step.sections) return false;
      const hasChanges = step.sections.reduce(
        (memo, section) => {
          if (!section.rows) return memo;
          const resultSection = section.rows.reduce(
            (memo2, row) => {
              if (!row.fields) return memo2;
              const resultRow = row.fields.reduce(
                (memo3, field) => {
                  if (!field) return memo3;
                  const modelPath = field.model && field.model.split('.').filter((val) => val !== '');
                  const fieldTracked = get(formDataTracked, modelPath);
                  if (!fieldTracked) return memo3;
                  let hasFieldChanges = (fieldTracked.touched || !fieldTracked.pristine);
                  if (fieldTracked.$form && field.controlType === 'multiselect') {
                    hasFieldChanges = (fieldTracked.$form.touched || !fieldTracked.$form.pristine);
                  }
                  return memo3 || hasFieldChanges;
                },
                memo2,
              );
              return resultRow;
            },
            memo,
          );
          return resultSection;
        },
        false,
      );
      return hasChanges;
    }
  );
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
      {saveError && (
        <HintP>
          <Hint>
            To prevent losing your form data, it is recommended to load the Advocacy Tracker in a separate tab/window and renew your login. Once logged in, you should be able to proceed with saving your data
          </Hint>
        </HintP>
      )}
      {deleteError && <Messages type="error" messages={deleteError} />}
      {(saveSending || deleteSending || !fieldsByStep) && <Loading />}
      {fieldsByStep && (
        <EntityForm
          model={model}
          formData={viewDomain.getIn(['form', 'data'])}
          formDataTracked={formDataTracked}
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
          inModal={inModal}
          isNewEntityView={isNewEntityView}
          hasFormChanges={hasFormChanges}
        />
      )}
      {(saveSending || deleteSending) && <Loading />}
    </div>
  );
}

EntityFormWrapper.propTypes = {
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleSubmitRemote: PropTypes.func,
  handleCancel: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  handleDelete: PropTypes.func,
  viewDomain: PropTypes.object,
  fieldsByStep: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  scrollContainer: PropTypes.object,
  model: PropTypes.string,
  typeLabel: PropTypes.string,
  inModal: PropTypes.bool,
  isNewEntityView: PropTypes.bool,
};
export default EntityFormWrapper;
