import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import { Form } from 'react-redux-form/immutable';
import styled from 'styled-components';
import { get } from 'lodash/object';
import { Box, ResponsiveContext } from 'grommet';
import { palette } from 'styled-theme';

import { isMinSize } from 'utils/responsive';

import { blockNavigation } from 'containers/App/actions';
import { selectNewEntityModal } from 'containers/App/selectors';

import ButtonForm from 'components/buttons/ButtonForm';
import ButtonCancel from 'components/buttons/ButtonCancel';

import Button from 'components/buttons/ButtonSimple';

import Icon from 'components/Icon';

import FormWrapper from 'components/forms/FormWrapper';

import FormContentWrapper from './FormContentWrapper';
import FormHeader from './FormHeader';
import FormFooter from './FormFooter';

import SkipIconNext from './SkipIconNext';
import WarningDot from './WarningDot';
import messages from './messages';

const DeleteConfirmText = styled.span`
  padding-left: 1em;
  padding-right: 1em;
`;
const Styled = styled.div`
  margin-bottom: ${({ inModal }) => inModal ? 0 : 300}px;
`;
const DeleteWrapper = styled(
  (p) => <Box direction="row" align="center" pad={{ vertical: 'medium' }} {...p} />
)``;

const ButtonDelete = styled(ButtonForm)`
  color: ${palette('buttonFlat', 0)};
  &:hover {
    color: ${palette('buttonFlatHover', 0)};
  }
`;

const ButtonPreDelete = styled(ButtonForm)`
  color: ${palette('text', 1)};
  &:hover {
    color: ${palette('linkHover', 2)};
  }
`;
const StyledForm = styled(Form)`
  width: 100%;
`;

const FormSteps = styled(
  (p) => <Box direction="row" fill="horizontal" responsive={false} {...p} />
)`
  background: #DADDE0;
  overflow: hidden;
`;
const FormStepWrapper = styled(
  (p) => <Box {...p} />
)`
  position: relative;
`;
const SkipButton = styled(
  (p) => <Button {...p} />
)`
  opacity: 1;
  color: ${({ theme, disabled }) => disabled ? '#B7BCBF' : theme.global.colors.highlight};
  stroke: ${({ theme, disabled }) => disabled ? '#B7BCBF' : theme.global.colors.highlight};
  fill: ${({ theme, disabled }) => disabled ? '#B7BCBF' : theme.global.colors.highlight};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  &:hover {
    color: ${({ theme, disabled }) => disabled ? '#B7BCBF' : theme.global.colors.highlightHover};
    stroke: ${({ theme, disabled }) => disabled ? '#B7BCBF' : theme.global.colors.highlightHover};
    fill: ${({ theme, disabled }) => disabled ? '#B7BCBF' : theme.global.colors.highlightHover};
  }
`;
const HighlightBackground = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: ${({ lastItem }) => lastItem ? 0 : 13}px;
  left: 0;
  background-color: ${({ theme }) => theme.global.colors.highlight};
`;

const ButtonStep = styled(
  (p) => <Button {...p} />
)`
  position: relative;
  height: 52px;
  text-align: left;
  color: ${({ highlight }) => highlight ? 'white' : '#777E7E'};
  padding: 4px 8px;
  opacity: 1;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  &:hover {
    color: ${({ theme, highlight, disabled }) => {
    if (disabled) return highlight ? 'white' : '#777E7E';
    return highlight ? 'white' : theme.global.colors.highlightHover;
  }};
  }
  &:focus {
    outline: 0;
    color: ${({ theme, highlight, disabled }) => {
    if (disabled) return highlight ? 'white' : '#777E7E';
    return highlight ? 'white' : theme.global.colors.highlightHover;
  }};
  }
`;
const ButtonStepArrow = styled.div`
  display: ${({ lastItem }) => lastItem ? 'none' : 'block'};
  content: '';
  width: 0;
  height: 0;
  position: absolute;
  right: 0;
  top: -4px;
  z-index: 1;
  border-top: 30px solid ${({ theme, prevHighlighted }) => prevHighlighted ? theme.global.colors.highlight : 'transparent'};
  border-bottom: 30px solid ${({ theme, prevHighlighted }) => prevHighlighted ? theme.global.colors.highlight : 'transparent'};
  border-left: 15px solid white;
  &:before {
    content: '';
    width: 0;
    height: 0;
    border-top: 30px solid transparent;
    border-bottom: 30px solid transparent;
    border-left: 15px solid ${({ theme, highlight }) => highlight ? theme.global.colors.highlight : '#DADDE0'};
    position: absolute;
    top: -30px;
    right: 1.5px;
}
`;
const ButtonStepLabel = styled.span`
  font-family: 'wwfregular', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 20px;
  position: relative;
  top: -1px;
`;

const ButtonStepLabelUpper = styled(ButtonStepLabel)`
  text-transform: uppercase;
  font-size: ${({ theme }) => theme.text.medium.size};
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
      stepsSeen: [],
    };
    this.saveOptionsButtonRef = React.createRef();
  }

  // dont update when saving
  shouldComponentUpdate(nextProps) {
    if (this.props.saving || nextProps.saving) {
      return false;
    }
    return true;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { hasFormChanges } = nextProps;
    if (hasFormChanges) this.props.onBlockNavigation(true);
    if (hasFormChanges && !this.props.hasFormChanges) {
      window.addEventListener('beforeunload', this.handleBeforeUnload);
    } else if (!hasFormChanges && this.props.hasFormChanges) {
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }
  }

  componentWillUnmount() {
    this.props.onBlockNavigation(false);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }

  handleBeforeUnload = (e) => {
    if (this.props.hasFormChanges) {
      e.preventDefault();
      e.returnValue = ''; // Modern browsers require this to show the confirmation dialog
    }
  };

  setDeleteConfirmed = (confirm = true) => {
    this.setState({ deleteConfirmed: confirm });
  }

  setStepActive = (stepActive, formData) => {
    // this.setState({ stepActive });
    this.props.handleUpdate(formData.set('step', stepActive));
  }

  addStepSeen = (stepSeen) => {
    this.setState((prevState) => ({ stepsSeen: [...prevState.stepsSeen, stepSeen] }));
  }

  handleSubmit = (formData) => !this.props.saving && this.props.handleSubmit(formData);

  render() {
    const {
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
      handleSubmitRemote,
      typeLabel,
      hasFormChanges,
      // onBlockNavigation,
    } = this.props;
    const {
      deleteConfirmed,
      stepsSeen,
    } = this.state;
    const stepActive = formData.get('step');
    const closeMultiselectOnClickOutside = !newEntityModal || inModal;
    let byStep = fieldsByStep;
    const footerStep = byStep.find((step) => step.id === 'footer');
    const footerFields = footerStep && footerStep.fields && footerStep.fields.filter((f) => !!f);
    const headerFields = footerFields && footerFields.filter(
      (f) => f.model === '.attributes.draft' || f.model === '.attributes.private'
    );
    const hasFooterChanges = footerFields && footerFields.some(
      (field) => {
        if (!field) return false;
        const modelPath = field.model && field.model.split('.').filter((val) => val !== '');
        const fieldTracked = get(formDataTracked, modelPath);
        if (!fieldTracked) return false;
        return (fieldTracked.touched || !fieldTracked.pristine);
      },
    );
    byStep = byStep.filter((step) => step.id !== 'footer');
    // the active step id
    const cleanStepActive = stepActive || (byStep && byStep[0] && byStep[0].id);
    // the active step
    // the order of the active step
    const activeStepIndex = byStep.map((step) => step.id).indexOf(cleanStepActive);
    const nextStepIndex = activeStepIndex + 1 < byStep.length ? activeStepIndex + 1 : null;
    const prevStepIndex = activeStepIndex > 0 ? activeStepIndex - 1 : null;
    const stepsWithStatus = byStep && byStep.map(
      (step, idx) => {
        if (!step.sections) return step;
        const currentStepBeforeActive = idx <= activeStepIndex;
        const currentStepPreviouslySeen = stepsSeen.indexOf(step.id) > -1;
        const stepSeen = currentStepPreviouslySeen || currentStepBeforeActive;
        const [
          hasEmptyRequired,
          hasAutofill,
          hasErrors,
          hasChanges,
        ] = step.sections.reduce(
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
                    const isRequiredEmpty = fieldTracked
                      && field.hasrequired
                      && fieldTracked.value === '';
                    let hasFieldAutofill = isNewEntityView && field.autofill;
                    if (
                      isNewEntityView
                      && (field.controlType === 'select' || field.controlType === 'multiselect' || !!field.options)
                    ) {
                      hasFieldAutofill = !!Object.values(fieldTracked).some((options) => !!options.autofill);
                    }
                    let hasFieldChanges = (fieldTracked.touched || !fieldTracked.pristine);
                    let isValid = hasFieldChanges && typeof fieldTracked.valid !== 'undefined' && fieldTracked.valid;
                    if (fieldTracked.$form && field.controlType === 'multiselect') {
                      hasFieldChanges = (fieldTracked.$form.touched || !fieldTracked.$form.pristine);
                      isValid = hasFieldChanges
                        && typeof fieldTracked.$form.valid !== 'undefined' && fieldTracked.$form.valid;
                    }
                    // WARNING: validity/errors are reset when field component unmount (on step change)
                    const hasError = hasFieldChanges && !isValid;
                    const resultField = [
                      memo3[0] || isRequiredEmpty,
                      memo3[1] || hasFieldAutofill,
                      memo3[2] || hasError,
                      memo3[3] || hasFieldChanges,
                    ];
                    return resultField;
                  },
                  memo2,
                );
                return resultRow;
              },
              memo,
            );
            return resultSection;
          },
          [false, false, false, false],
        );
        return ({
          ...step,
          hasEmptyRequired,
          hasUnseenAutofill: isNewEntityView && !stepSeen && hasAutofill,
          seen: stepSeen,
          highlighted: currentStepBeforeActive,
          previouslySeen: currentStepPreviouslySeen,
          isActive: step.id === cleanStepActive,
          hasErrors,
          hasChanges,
        });
      }
    );
    const hasAnyEmptyRequired = stepsWithStatus && stepsWithStatus.some((step) => step.hasEmptyRequired);
    const hasAnyUnseenAutofill = stepsWithStatus && stepsWithStatus.some((step) => step.hasUnseenAutofill);
    const hasAnyErrors = stepsWithStatus && stepsWithStatus.some((step) => step.hasErrors);
    // saving is blocked if
    // 1. no changes were made
    // OR
    // 2. we have any steps with errors, unseen autofill or empty required fields
    const isBlocked = !(hasFormChanges || hasFooterChanges)
    || (stepsWithStatus && (hasAnyEmptyRequired || hasAnyUnseenAutofill || hasAnyErrors));

    const activeStep = stepsWithStatus && stepsWithStatus.find((step) => step.isActive);

    const activeStepHasErrors = activeStep.hasErrors;

    return (
      <ResponsiveContext.Consumer>
        {(size) => (
          <Styled inModal={inModal}>
            <StyledForm
              model={model}
              onSubmit={this.handleSubmit}
              onSubmitFailed={handleSubmitFail}
              validators={validators}
            >
              {!inModal && (
                <FormHeader
                  fields={headerFields}
                  formData={formData}
                  formDataTracked={formDataTracked}
                  handleCancel={handleCancel}
                  handleUpdate={handleUpdate}
                  handleSubmitRemote={handleSubmitRemote}
                  isBlocked={isBlocked || saving}
                  hasAnyEmptyRequired={hasAnyEmptyRequired}
                  hasAnyUnseenAutofill={hasAnyUnseenAutofill}
                  hasAnyErrors={hasAnyErrors}
                />
              )}
              <FormWrapper hasMarginBottom={false}>
                {stepsWithStatus && (
                  <FormSteps>
                    {stepsWithStatus.map((step, idx) => {
                      const {
                        hasEmptyRequired,
                        hasUnseenAutofill,
                        highlighted,
                        isActive,
                        hasErrors,
                      } = step;
                      let title = step.title || step.id;
                      if (!isMinSize(size, 'medium')) {
                        if (!isActive) {
                          title = '';
                        } else if (isActive && step.titleSmall) {
                          title = step.titleSmall;
                        }
                      }
                      if (byStep.length > 1) {
                        title = `${idx + 1}.${title ? ' ' : ''}${title}`;
                      }
                      return (
                        <FormStepWrapper
                          key={step.id}
                          basis={(isMinSize(size, 'medium') && byStep.length > 1)
                            ? `1/${byStep.length}`
                            : 'auto'}
                          flex={((!isMinSize(size, 'medium') && isActive) || byStep.length === 1) ? { grow: 1 } : false}
                          direction="row"
                        >
                          <ButtonStepArrow highlight={highlighted} lastItem={idx + 1 === byStep.length} prevHighlighted={activeStepIndex > idx} />
                          {highlighted && (
                            <HighlightBackground lastItem={idx + 1 === byStep.length} />
                          )}
                          <Box basis="full" style={{ position: 'relative', zIndex: 1 }}>
                            <ButtonStep
                              highlight={highlighted}
                              disabled={activeStepHasErrors}
                              onClick={(evt) => {
                                if (evt !== undefined && evt.preventDefault) evt.preventDefault();
                                if (!isActive) {
                                  this.setStepActive(step.id, formData);
                                  this.addStepSeen(cleanStepActive);
                                }
                              }}
                              lastItem={idx + 1 === byStep.length}
                            >
                              <Box direction="row" align="center" gap="small">
                                <ButtonStepLabel>
                                  {title}
                                </ButtonStepLabel>
                                <Box direction="row" align="center" gap="xxsmall">
                                  {hasErrors && (
                                    <WarningDot type="error" />
                                  )}
                                  {!hasErrors && hasEmptyRequired && (
                                    <WarningDot type="required" />
                                  )}
                                  {hasUnseenAutofill && (
                                    <WarningDot type="autofill" />
                                  )}
                                </Box>
                              </Box>
                            </ButtonStep>
                          </Box>
                        </FormStepWrapper>
                      );
                    })}
                  </FormSteps>
                )}
                <FormContentWrapper
                  step={activeStep}
                  fields={activeStep && activeStep.fields}
                  sections={activeStep && activeStep.sections}
                  formData={formData}
                  formDataTracked={formDataTracked}
                  closeMultiselectOnClickOutside={closeMultiselectOnClickOutside}
                  scrollContainer={scrollContainer}
                  handleUpdate={handleUpdate}
                  isNewEntityView={isNewEntityView}
                />
                {stepsWithStatus && stepsWithStatus.length > 1 && (
                  <Box
                    direction="row"
                    justify="between"
                    pad={{ vertical: 'medium', horizontal: 'medium' }}
                    style={{
                      borderTop: '1px solid #B7BCBF',
                    }}
                  >
                    <SkipButton
                      disabled={activeStepHasErrors || prevStepIndex === null}
                      onClick={(evt) => {
                        if (evt && evt.preventDefault) evt.preventDefault();
                        if (byStep[prevStepIndex]) {
                          this.setStepActive(byStep[prevStepIndex].id, formData);
                          this.addStepSeen(activeStep.id);
                        }
                      }}
                    >
                      <SkipButtonInner>
                        <SkipIconNext reverse />
                        <ButtonStepLabelUpper
                          disabled={activeStepHasErrors || prevStepIndex === null}
                        >
                          Previous
                        </ButtonStepLabelUpper>
                      </SkipButtonInner>
                    </SkipButton>
                    <SkipButton
                      disabled={activeStepHasErrors || nextStepIndex === null}
                      plain
                      onClick={(evt) => {
                        if (evt && evt.preventDefault) evt.preventDefault();
                        if (byStep[nextStepIndex]) {
                          this.setStepActive(byStep[nextStepIndex].id, formData);
                          this.addStepSeen(byStep[nextStepIndex].id);
                        }
                      }}
                    >
                      <SkipButtonInner>
                        <ButtonStepLabelUpper
                          disabled={activeStepHasErrors || nextStepIndex === null}
                        >
                          Next
                        </ButtonStepLabelUpper>
                        <SkipIconNext disabled={activeStepHasErrors || nextStepIndex === null} />
                      </SkipButtonInner>
                    </SkipButton>
                  </Box>
                )}
                <FormFooter
                  fields={footerFields}
                  formData={formData}
                  formDataTracked={formDataTracked}
                  handleCancel={handleCancel}
                  handleUpdate={handleUpdate}
                  handleSubmitRemote={handleSubmitRemote}
                  isBlocked={isBlocked || saving}
                  hasAnyEmptyRequired={hasAnyEmptyRequired}
                  hasAnyUnseenAutofill={hasAnyUnseenAutofill}
                  hasAnyErrors={hasAnyErrors}
                />
              </FormWrapper>
            </StyledForm>
            {handleDelete && !deleteConfirmed && (
              <DeleteWrapper>
                <ButtonPreDelete type="button" onClick={this.setDeleteConfirmed}>
                  <Box direction="row" gap="small" align="center">
                    <Icon name="trash" sizes={{ mobile: '1.8em' }} />
                    <span>{`Delete ${typeLabel}`}</span>
                  </Box>
                </ButtonPreDelete>
              </DeleteWrapper>
            )}
            {handleDelete && deleteConfirmed && (
              <DeleteWrapper>
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
              </DeleteWrapper>
            )}
          </Styled>
        )}
      </ResponsiveContext.Consumer>
    );
  }
}


EntityForm.propTypes = {
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleSubmitRemote: PropTypes.func,
  handleDelete: PropTypes.func,
  handleUpdate: PropTypes.func,
  onBlockNavigation: PropTypes.func,
  model: PropTypes.string,
  fieldsByStep: PropTypes.array,
  formData: PropTypes.object,
  formDataTracked: PropTypes.object,
  inModal: PropTypes.bool,
  saving: PropTypes.bool,
  isNewEntityView: PropTypes.bool,
  isMine: PropTypes.bool,
  newEntityModal: PropTypes.object,
  validators: PropTypes.object,
  scrollContainer: PropTypes.object,
  hasFormChanges: PropTypes.bool,
  typeLabel: PropTypes.string,
};
EntityForm.defaultProps = {
  saving: false,
  hasFormChanges: false,
};

const mapStateToProps = (state) => ({
  newEntityModal: selectNewEntityModal(state),
});

export function mapDispatchToProps(dispatch) {
  return {
    onBlockNavigation: (value) => dispatch(blockNavigation(value)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EntityForm);
