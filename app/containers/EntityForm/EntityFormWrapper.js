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
  const formData = viewDomain.getIn(['form', 'data']);
  const formDataTracked = viewDomain && viewDomain.getIn(['form', 'forms', 'data']);

  const hasFormChanges = fieldsByStep && fieldsByStep.some(
    (step) => {
      if (step.id === 'footer' && step.fields) {
        const footerFields = step.fields && step.fields.filter((f) => !!f);
        return footerFields.some(
          (field) => {
            if (!field) return false;
            const modelPath = field.model && field.model.split('.').filter((val) => val !== '');
            const fieldTracked = get(formDataTracked, modelPath);
            if (!fieldTracked) return false;
            return !fieldTracked.pristine;
          },
        );
      }
      if (step.sections) {
        return step.sections.some(
          (section) => {
            if (!section.rows) return false;
            return section.rows.some(
              (row) => {
                if (!row.fields) return false;
                return row.fields.some(
                  (field) => {
                    if (!field) return false;
                    const modelPath = field.model && field.model.split('.').filter((val) => val !== '');
                    const fieldTracked = get(formDataTracked, modelPath);
                    if (!fieldTracked) return false;
                    let hasFieldChanges = (fieldTracked.touched || !fieldTracked.pristine);
                    if (fieldTracked.$form && field.controlType === 'multiselect') {
                      hasFieldChanges = (fieldTracked.touched || !fieldTracked.$form.pristine);
                      if (!hasFieldChanges) {
                        const fieldData = get(formData.toJS(), modelPath);
                        if (fieldData) {
                          hasFieldChanges = Object.keys(fieldData).some(
                            (key) => fieldTracked[key] && fieldData[key].checked !== fieldTracked[key].checked.initialValue
                          );
                        }
                      }
                    }
                    return hasFieldChanges;
                  },
                );
              },
            );
          },
        );
      }
      // not footer and no sections
      return false;
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
          handleUpdate={(d) => {
            handleUpdate(d);
          }}
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
