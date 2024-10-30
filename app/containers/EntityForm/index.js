import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Form } from 'react-redux-form/immutable';
import styled from 'styled-components';
import { get } from 'lodash/object';

import { selectNewEntityModal } from 'containers/App/selectors';

import Button from 'components/buttons/Button';

import FormWrapper from 'components/forms/FormWrapper';

import FormBodyWrapper from './FormBodyWrapper';

const StyledForm = styled(Form)`
  display: table;
  width: 100%;
`;

const FilterSteps = styled.div``;

class EntityForm extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.state = {
      deleteConfirmed: false,
      stepActive: null,
      stepsSeen: [],
    };
  }

  // dont update when saving
  shouldComponentUpdate(nextProps) {
    if (this.props.saving || nextProps.saving) {
      return false;
    }
    return true;
  }

  setDeleteConfirmed = (confirm = true) => {
    this.setState({ deleteConfirmed: confirm });
  }

  setStepActive = (stepActive) => {
    this.setState({ stepActive });
  }

  addStepSeen = (stepSeen) => {
    this.setState((prevState) => ({ stepsSeen: [...prevState.stepsSeen, stepSeen] }));
  }

  handleSubmit = (formData) => !this.props.saving && this.props.handleSubmit(formData);

  render() {
    const {
      fields,
      fieldsByStep,
      model,
      handleCancel,
      handleSubmitFail,
      inModal,
      validators,
      newEntityModal, // is any new entity modal active
      scrollContainer,
      formData,
      formDataTracked,
      handleUpdate,
      handleDelete,
      isNewEntityView,
      saving,
    } = this.props;
    const { deleteConfirmed, stepActive, stepsSeen } = this.state;
    const closeMultiselectOnClickOutside = !newEntityModal || inModal;
    let byStep = fieldsByStep;
    if (!byStep) {
      // fields: { header: { main: fields[], aside: fields[] }, body: { main: ... }}
      byStep = Object.keys(fields).reduce(
        (memo, fieldSectionKey) => {
          // eg "header"
          const fieldSection = fields[fieldSectionKey];
          if (fieldSection) {
            return Object.keys(fieldSection).reduce(
              (memo2, fieldGroupKey) => {
                const fieldGroup = fieldSection[fieldGroupKey];
                return [
                  ...memo2,
                  {
                    id: `${fieldSectionKey}-${fieldGroupKey}`,
                    fields: fieldGroup,
                  },
                ];
              },
              memo,
            );
          }
          return memo;
        },
        [],
      );
    }
    const footerStep = byStep.find((step) => step.id === 'footer');
    const footerFields = footerStep && footerStep.fields;
    byStep = byStep.filter((step) => step.id !== 'footer');
    const cleanStepActive = stepActive || (byStep && byStep[0] && byStep[0].id);
    const activeStep = byStep && byStep.find(
      (step) => step.id === cleanStepActive,
    );
    return (
      <FormWrapper withoutShadow={inModal} hasMarginBottom={!inModal}>
        <StyledForm
          model={model}
          onSubmit={this.handleSubmit}
          onSubmitFailed={handleSubmitFail}
          validators={validators}
        >
          {byStep && byStep.length > 1 && (
            <FilterSteps>
              {byStep.map((step, idx) => {
                const currentStepActive = step.id === cleanStepActive;
                const stepSeen = stepsSeen.indexOf(step.id) > -1 || currentStepActive;
                const hasEmptyRequired = step.sections && step.sections.some(
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
                            return field && fieldTracked && field.hasrequired && fieldTracked.value === '';
                          },
                        );
                      }
                    );
                  },
                  false,
                );
                const hasAutofill = isNewEntityView
                  && idx !== 0
                  && !stepSeen
                  && step.sections
                  && step.sections.some(
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
                              if (
                                fieldTracked
                                && field
                                && (field.controlType === 'select' || field.controlType === 'multiselect' || !!field.options)
                              ) {
                                return !!Object.values(fieldTracked).some((options) => !!options.autofill);
                              }
                              return field.autofill;
                            }
                          );
                        }
                      );
                    },
                    false,
                  );

                return (
                  <Button
                    key={step.id}
                    active={currentStepActive}
                    onClick={(evt) => {
                      if (evt !== undefined && evt.preventDefault) evt.preventDefault();
                      if (!currentStepActive) {
                        this.setStepActive(step.id);
                        this.addStepSeen(step.id);
                      }
                    }}
                  >
                    {`${step.title || step.id}${hasEmptyRequired ? ' *' : ''}${hasAutofill ? ' !!' : ''}`}
                  </Button>
                );
              })}
            </FilterSteps>
          )}
          <FormBodyWrapper
            fields={activeStep && activeStep.fields}
            sections={activeStep && activeStep.sections}
            footerFields={footerFields}
            closeMultiselectOnClickOutside={closeMultiselectOnClickOutside}
            scrollContainer={scrollContainer}
            formData={formData}
            formDataTracked={formDataTracked}
            handleUpdate={handleUpdate}
            handleDelete={handleDelete}
            handleCancel={handleCancel}
            deleteConfirmed={deleteConfirmed}
            onSetDeleteConfirmed={this.setDeleteConfirmed}
            isSaving={saving}
          />
        </StyledForm>
      </FormWrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  newEntityModal: selectNewEntityModal(state),
});

EntityForm.propTypes = {
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleDelete: PropTypes.func,
  handleUpdate: PropTypes.func,
  model: PropTypes.string,
  fields: PropTypes.object,
  fieldsByStep: PropTypes.array,
  formData: PropTypes.object,
  formDataTracked: PropTypes.object,
  inModal: PropTypes.bool,
  saving: PropTypes.bool,
  isNewEntityView: PropTypes.bool,
  newEntityModal: PropTypes.object,
  validators: PropTypes.object,
  scrollContainer: PropTypes.object,
};
EntityForm.defaultProps = {
  saving: false,
};

export default connect(mapStateToProps)(EntityForm);
