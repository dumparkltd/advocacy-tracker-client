import React from 'react';
import PropTypes from 'prop-types';
import { Control, Errors } from 'react-redux-form/immutable';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { omit } from 'lodash/object';
import { Box } from 'grommet';
import appMessage from 'utils/app-message';
import { lowerCase } from 'utils/string';

import Button from 'components/buttons/Button';
import FieldFactory from 'components/fields/FieldFactory';
import FieldWrap from 'components/fields/FieldWrap';

import FieldLabel from 'components/forms/Label';
import ErrorWrapper from 'components/forms/ErrorWrapper';
import ControlTitle from 'components/forms/ControlTitle';
import ControlTitleText from 'components/forms/ControlTitleText';
import ControlShort from 'components/forms/ControlShort';
import ControlInput from 'components/forms/ControlInput';
import ControlCheckbox from 'components/forms/ControlCheckbox';
import ControlTextArea from 'components/forms/ControlTextArea';
import ControlSelect from 'components/forms/ControlSelect';
import MarkdownControl from 'components/forms/MarkdownControl';
import DateControl from 'components/forms/DateControl';
import RadioControl from 'components/forms/RadioControl';
import MultiSelectField from 'components/forms/MultiSelectField';
import messages from 'components/forms/MultiSelectField/messages';
import { FORM_NON_CONTROL_PROPS } from 'themes/config';

import WarningDot from './WarningDot';

const Hint = styled.div`
  color: ${palette('text', 1)};
  font-size: ${(props) => props.theme.sizes.text.small};
  margin-top: -6px;
  @media print {
    font-size: ${(props) => props.theme.sizes.print.small};
  }
`;

const InfoText = styled.span`
  color: ${palette('primary', 1)};
  font-size: ${(props) => props.theme.text.xxsmall.size};
`;
const AutoFillWrap = styled(
  (p) => <Box direction="row" align="center" gap="xxsmall" {...p} />
)`
  color: ${palette('primary', 1)};
`;
const FieldLabelWrap = styled(
  (p) => <Box direction="row" align="center" gap="xsmall" {...p} />
)`
  min-height: 32px;
`;

const Field = styled.div`
  @media print {
    display: ${({ printHide }) => (printHide) ? 'none !important' : 'block'};
  };
`;

const FieldInnerWrapper = styled.div`
  margin-top: 10px;
`;

const ShowButton = styled(
  (p) => <Button plain {...p} />
)`
  font-family: 'wwfregular', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  text-transform: uppercase;
  font-size: 18px;
  padding: 0;
  color: ${({ theme }) => theme.global.colors.highlight};
`;

const FormFieldWrap = styled(
  (p) => <Box {...p} />
)``;

const controls = {
  input: ControlInput,
  url: ControlInput,
  email: ControlInput,
  title: ControlTitle,
  titleText: ControlTitleText,
  short: ControlShort,
  textarea: ControlTextArea,
  markdown: MarkdownControl,
  date: DateControl,
  select: ControlSelect,
  radio: RadioControl,
  checkbox: ControlCheckbox,
  button: Control.button,
};

class FormField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.state = { hidden: true };
  }

  setHidden = (hidden = true) => this.setState({ hidden });

  getControlProps = (field) => {
    switch (field.controlType) {
      case 'select': // we will render select options as children, so don't pass options prop directly to the control
        return omit(field, FORM_NON_CONTROL_PROPS.concat(['options']));
      default:
        return omit(field, FORM_NON_CONTROL_PROPS);
    }
  }

  // REGULAR COMPONENT
  getFieldComponent = (field) => {
    if (field.component) {
      return field.component; // Don't use this unless you really have to
    } if (field.controlType in controls) {
      return controls[field.controlType];
    }
    return controls.input; // Default to input type if not specified
  }

  renderMultiSelect = (field, formData, closeMultiselectOnClickOutside, scrollContainer, handleUpdate) => (
    <MultiSelectField
      field={field}
      scrollContainer={scrollContainer}
      fieldData={formData.getIn(field.dataPath)}
      closeOnClickOutside={closeMultiselectOnClickOutside}
      handleUpdate={(fieldData) => handleUpdate(formData.setIn(field.dataPath, fieldData))}
    />
  )

  renderFieldChildren = (field) => {
    const { intl } = this.context;
    // handle known cases here
    switch (field.controlType) {
      case 'select':
        return field.options && field.options.map((option, i) => (
          <option key={i} value={option.value} {...option.props}>
            { option.message
              ? appMessage(intl, option.message)
              : (option.label || option.value)
            }
          </option>
        ));
      case 'info':
        return field.displayValue;
      default:
        return field.children || null; // enables passing children component, or null
    }
  }

  renderComponent = (field) => {
    const { id, model, ...props } = this.getControlProps(field);
    const FieldComponent = this.getFieldComponent(field);
    return (
      <FieldComponent
        id={id}
        model={model || `.${id}`}
        debounce={500}
        {...props}
      >
        {this.renderFieldChildren(field)}
      </FieldComponent>
    );
  }

  renderCombo = (field, formData, handleUpdate) => (
    <FieldWrap>
      {field && field.fields.map((comboField, i) => (
        <span key={i}>
          {this.renderFormField({
            field: comboField, nested: true, formData, handleUpdate,
          })}
        </span>
      ))}
    </FieldWrap>
  );

  renderFormField = ({
    field,
    fieldTracked,
    nested,
    formData,
    closeMultiselectOnClickOutside,
    scrollContainer,
    handleUpdate,
    inline,
    step,
    isEmpty,
  }) => {
    const { intl } = this.context;
    let formField;
    if (!field.controlType) {
      formField = this.renderComponent(field);
    } else {
      switch (field.controlType) {
        case 'info':
          formField = (<FieldFactory field={field} nested={nested} />);
          break;
        case 'combo':
          formField = this.renderCombo(field, formData, handleUpdate);
          break;
        case 'multiselect':
          formField = this.renderMultiSelect(
            field,
            formData,
            closeMultiselectOnClickOutside,
            scrollContainer,
            handleUpdate,
          );
          break;
        default:
          formField = this.renderComponent(field);
      }
    }
    let hasChanges = fieldTracked && (fieldTracked.touched || !fieldTracked.pristine);
    let isValid = hasChanges && fieldTracked && typeof fieldTracked.valid !== 'undefined' && fieldTracked.valid;
    if (field.controlType === 'multiselect' && fieldTracked && fieldTracked.$form) {
      hasChanges = (fieldTracked.$form.touched || !fieldTracked.$form.pristine);
      isValid = hasChanges
        && typeof fieldTracked.$form.valid !== 'undefined' && fieldTracked.$form.valid;
    }
    const hasError = hasChanges && !isValid;
    const fieldRequired = field.validators && field.validators.required;
    const stepSeen = step && step.previouslySeen;
    const fieldAutofilledUnseen = !stepSeen && field.autofill && !hasChanges;

    return (
      <FormFieldWrap
        direction={inline ? 'row' : 'column'}
        gap={inline ? 'small' : 'none'}
      >
        {field.label
          && field.controlType !== 'info'
          && field.controlType !== 'checkbox'
          && (
            <FieldLabelWrap>
              {field.controlType === 'multiselect' && (
                <FieldLabel htmlFor={field.id}>
                  {intl.formatMessage(messages.update, { type: lowerCase(field.label) })}
                </FieldLabel>
              )}
              {field.controlType !== 'multiselect' && (
                <FieldLabel htmlFor={field.id}>
                  { field.label }
                </FieldLabel>
              )}
              {fieldRequired && (
                <AutoFillWrap>
                  {!hasError && isEmpty && (
                    <WarningDot type="required" />
                  )}
                  {hasError && (
                    <WarningDot type="error" />
                  )}
                  <InfoText>(required)</InfoText>
                </AutoFillWrap>
              )}
              {hasError && !fieldRequired && (
                <AutoFillWrap>
                  <WarningDot type="error" />
                </AutoFillWrap>
              )}
              {fieldAutofilledUnseen && (
                <AutoFillWrap>
                  <WarningDot type="autofill" />
                  <InfoText>(pre-populated)</InfoText>
                </AutoFillWrap>
              )}
            </FieldLabelWrap>
          )}
        {field.label
          && field.controlType === 'checkbox'
          && (
            <FieldLabel>
              { field.controlType === 'checkbox' && formField }
              { field.label }
              {fieldAutofilledUnseen && (
                <AutoFillWrap>
                  <WarningDot type="autofill" />
                  <InfoText>(pre-populated)</InfoText>
                </AutoFillWrap>
              )}
            </FieldLabel>
          )}
        {field.hint && <Hint>{field.hint}</Hint>}
        {field.controlType !== 'checkbox' && formField}
      </FormFieldWrap>
    );
  }

  render() {
    const {
      field,
      fieldTracked,
      formData,
      scrollContainer,
      closeMultiselectOnClickOutside,
      handleUpdate,
      inline,
      step,
    } = this.props;
    const isEmpty = fieldTracked && fieldTracked.value ? fieldTracked.value === '' : true;
    let isHidden = field.hideByDefault && this.state.hidden;
    if (isHidden) {
      isHidden = isHidden && !!isEmpty;
    }

    return (
      <Field printHide={field.printHide}>
        {isHidden && (
          <ShowButton onClick={() => this.setHidden(false)}>
            {`Add ${field.label}`}
          </ShowButton>
        )}
        {!isHidden && (
          <FieldInnerWrapper>
            {this.renderFormField({
              field,
              formData,
              closeMultiselectOnClickOutside,
              scrollContainer,
              handleUpdate,
              inline,
              step,
              fieldTracked,
              isEmpty,
            })}
            {field.errorMessages && (
              <ErrorWrapper>
                <Errors
                  className="errors"
                  model={field.model}
                  show={(fieldValue) => fieldValue.touched || !fieldValue.pristine}
                  messages={field.errorMessages}
                />
              </ErrorWrapper>
            )}
          </FieldInnerWrapper>
        )}
      </Field>
    );
  }
}

FormField.propTypes = {
  step: PropTypes.object,
  formData: PropTypes.object,
  scrollContainer: PropTypes.object,
  field: PropTypes.object,
  fieldTracked: PropTypes.object,
  fieldGroup: PropTypes.object,
  closeMultiselectOnClickOutside: PropTypes.bool,
  handleUpdate: PropTypes.func,
  inline: PropTypes.bool,
};


FormField.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default FormField;
