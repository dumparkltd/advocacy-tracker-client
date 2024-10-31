import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import { Form } from 'react-redux-form/immutable';
import styled from 'styled-components';
import { get } from 'lodash/object';
import { Box, Button } from 'grommet';
import { palette } from 'styled-theme';

import { selectNewEntityModal } from 'containers/App/selectors';

import ButtonForm from 'components/buttons/ButtonForm';
import ButtonCancel from 'components/buttons/ButtonCancel';

import Icon from 'components/Icon';

import FormWrapper from 'components/forms/FormWrapper';

import FormContentWrapper from './FormContentWrapper';
import FormFooter from './FormFooter';
import SkipIconNext from './SkipIconNext';

import messages from './messages';

const DeleteConfirmText = styled.span`
  padding-left: 1em;
  padding-right: 1em;
`;
const DeleteWrapper = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
`;

const ButtonDelete = styled(ButtonForm)`
  color: ${palette('buttonFlat', 0)};
  &:hover {
    color: ${palette('buttonFlatHover', 0)};
  }
`;

const ButtonPreDelete = styled(Button)`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  color: ${palette('text', 1)};
  &:hover {
    color: ${palette('linkHover', 2)};
  }
`;
const StyledForm = styled(Form)`
  width: 100%;
`;

const FilterSteps = styled(
  (p) => <Box direction="row" fill="horizontal" responsive={false} {...p} />
)``;

const SkipButton = styled(
  (p) => <Button plain {...p} />
)`
  opacity: 1;
  color: ${({ theme, disabled }) => disabled ? '#B7BCBF' : theme.global.colors.highlight};
  stroke: ${({ theme, disabled }) => disabled ? '#B7BCBF' : theme.global.colors.highlight};
  fill: ${({ theme, disabled }) => disabled ? '#B7BCBF' : theme.global.colors.highlight};
  &:hover {
    color: ${({ theme, disabled }) => disabled ? '#B7BCBF' : theme.global.colors.highlightHover};
    stroke: ${({ theme, disabled }) => disabled ? '#B7BCBF' : theme.global.colors.highlightHover};
    fill: ${({ theme, disabled }) => disabled ? '#B7BCBF' : theme.global.colors.highlightHover};
  }
`;

const ButtonStep = styled(
  (p) => <Button plain {...p} />
)`
  position: relative;
  height: 52px;
  text-align: left;
  background-color: ${({ theme, highlight }) => highlight ? theme.global.colors.highlight : '#DADDE0'};
  color: ${({ highlight }) => highlight ? 'white' : '#777E7E'};
  border-right: 1px solid ${({ lastItem }) => lastItem ? 'transparent' : 'white'};
  border-left: 1px solid transparent;
  padding: 4px 8px;
  opacity: 1;
`;
const ButtonStepLabel = styled.span`
  font-family: 'wwfregular', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 20px;
  position: relative;
  top: -1px;
`;

const ButtonStepLabelUpper = styled(ButtonStepLabel)`
  text-transform: uppercase;
  color: ${({ theme, disabled }) => disabled ? '' : theme.global.colors.highlight};
`;

const SkipButtonInner = styled(
  (p) => <Box direction="row" gap="small" align="center" {...p} />
)``;

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
    const footerFields = footerStep && footerStep.fields && footerStep.fields.filter((f) => !!f);
    byStep = byStep.filter((step) => step.id !== 'footer');
    // the active step id
    const cleanStepActive = stepActive || (byStep && byStep[0] && byStep[0].id);
    // the active step
    const activeStep = byStep && byStep.find(
      (step) => step.id === cleanStepActive,
    );
    // the order of the active step
    const activeStepIndex = byStep.map((step) => step.id).indexOf(cleanStepActive);
    const nextStepIndex = activeStepIndex + 1 < byStep.length ? activeStepIndex + 1 : null;
    const prevStepIndex = activeStepIndex > 0 ? activeStepIndex - 1 : null;
    // console.log('activeStepIndex, byStep[activeStepIndex]', activeStepIndex, byStep[activeStepIndex])
    // console.log('prevStepIndex, byStep[prevStepIndex]', prevStepIndex, byStep[prevStepIndex])
    // console.log('nextStepIndex, byStep[nextStepIndex]', nextStepIndex, byStep[nextStepIndex], activeStepIndex + 1 <= byStep.length)
    return (
      <>
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
                  const currentStepActive = idx <= activeStepIndex;
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
                    <Box key={step.id} basis={`1/${byStep.length}`}>
                      <ButtonStep
                        highlight={currentStepActive}
                        onClick={(evt) => {
                          if (evt !== undefined && evt.preventDefault) evt.preventDefault();
                          if (step.id !== cleanStepActive) {
                            this.setStepActive(step.id);
                            this.addStepSeen(step.id);
                          }
                        }}
                        lastItem={idx + 1 === byStep.length}
                      >
                        <Box direction="row" align="center">
                          <ButtonStepLabel>
                            {`${idx + 1}. ${step.title || step.id}`}
                          </ButtonStepLabel>
                          {(hasEmptyRequired || hasAutofill) && (
                            <Icon name="warning" />
                          )}
                          {!hasEmptyRequired && !hasAutofill && (
                            <span style={{ color: 'transparent' }}>
                              <Icon name="warning" />
                            </span>
                          )}
                        </Box>
                      </ButtonStep>
                    </Box>
                  );
                })}
              </FilterSteps>
            )}
            <FormContentWrapper
              fields={activeStep && activeStep.fields}
              sections={activeStep && activeStep.sections}
              formData={formData}
              formDataTracked={formDataTracked}
              closeMultiselectOnClickOutside={closeMultiselectOnClickOutside}
              scrollContainer={scrollContainer}
              handleUpdate={handleUpdate}
            />
            <Box
              direction="row"
              justify="between"
              margin={{ vertical: 'medium', horizontal: 'medium' }}
            >
              <SkipButton
                disabled={prevStepIndex === null}
                plain
                onClick={(evt) => {
                  if (evt && evt.preventDefault) evt.preventDefault();
                  if (byStep[prevStepIndex]) {
                    this.setStepActive(byStep[prevStepIndex].id);
                    this.addStepSeen(byStep[prevStepIndex].id);
                  }
                }}
              >
                <SkipButtonInner disabled={prevStepIndex === null}>
                  <SkipIconNext reverse />
                  <ButtonStepLabelUpper
                    disabled={prevStepIndex === null}
                  >
                    Previous
                  </ButtonStepLabelUpper>
                </SkipButtonInner>
              </SkipButton>
              <SkipButton
                disabled={nextStepIndex === null}
                plain
                onClick={(evt) => {
                  if (evt && evt.preventDefault) evt.preventDefault();
                  if (byStep[nextStepIndex]) {
                    this.setStepActive(byStep[nextStepIndex].id);
                    this.addStepSeen(byStep[nextStepIndex].id);
                  }
                }}
              >
                <SkipButtonInner disabled={nextStepIndex === null}>
                  <ButtonStepLabelUpper
                    disabled={nextStepIndex === null}
                  >
                    Next
                  </ButtonStepLabelUpper>
                  <SkipIconNext disabled={nextStepIndex === null} />
                </SkipButtonInner>
              </SkipButton>
            </Box>
            <FormFooter
              fields={footerFields}
              formData={formData}
              formDataTracked={formDataTracked}
              handleDelete={handleDelete}
              handleCancel={handleCancel}
              deleteConfirmed={deleteConfirmed}
              onSetDeleteConfirmed={this.setDeleteConfirmed}
              isSaving={saving}
            />
          </StyledForm>
        </FormWrapper>
        {handleDelete && !deleteConfirmed && (
          <DeleteWrapper>
            <ButtonPreDelete type="button" onClick={this.setDeleteConfirmed}>
              <Icon name="trash" sizes={{ mobile: '1.8em' }} />
            </ButtonPreDelete>
          </DeleteWrapper>
        )}
        {handleDelete && deleteConfirmed && (
          <Box direction="row">
            <DeleteConfirmText>
              <FormattedMessage {...messages.confirmDeleteQuestion} />
            </DeleteConfirmText>
            <ButtonCancel
              type="button"
              onClick={() => this.setDeleteConfirmed(false)}
            >
              <FormattedMessage {...messages.buttons.cancelDelete} />
            </ButtonCancel>
            <ButtonDelete type="button" onClick={handleDelete}>
              <FormattedMessage {...messages.buttons.confirmDelete} />
            </ButtonDelete>
          </Box>
        )}
      </>
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
