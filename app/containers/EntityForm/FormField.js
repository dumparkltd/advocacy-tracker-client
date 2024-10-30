import React from 'react';
import PropTypes from 'prop-types';
import { Control, Errors } from 'react-redux-form/immutable';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { omit } from 'lodash/object';

import appMessage from 'utils/app-message';

import Button from 'components/buttons/Button';
import FieldFactory from 'components/fields/FieldFactory';
import FieldWrap from 'components/fields/FieldWrap';
import Field from 'components/fields/Field';

import FieldLabel from 'components/forms/Label';
import ErrorWrapper from 'components/forms/ErrorWrapper';
import FormFieldWrap from 'components/forms/FormFieldWrap';
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
import Required from 'components/forms/Required';
import MultiSelectField from 'components/forms/MultiSelectField';

const Hint = styled.div`
  color: ${palette('text', 1)};
  font-size: ${(props) => props.theme.sizes.text.small};
  margin-top: -6px;
  @media print {
    font-size: ${(props) => props.theme.sizes.print.small};
  }
`;

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

// These props will be omitted before being passed to the Control component
const NON_CONTROL_PROPS = [
  'hint', 'label', 'component', 'controlType', 'children', 'errorMessages', 'hasrequired', 'hideByDefault', 'prepopulate', 'autofill',
];


class FormField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.state = { hidden: true };
  }

  setHidden = (hidden = true) => this.setState({ hidden });

  getControlProps = (field) => {
    switch (field.controlType) {
      case 'select': // we will render select options as children, so don't pass options prop directly to the control
        return omit(field, NON_CONTROL_PROPS.concat(['options']));
      default:
        return omit(field, NON_CONTROL_PROPS);
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
    field, nested, formData, closeMultiselectOnClickOutside, scrollContainer, handleUpdate,
  }) => {
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
    return (
      <FormFieldWrap nested={nested}>
        {field.label
          && field.controlType !== 'multiselect'
          && field.controlType !== 'info'
          && (
            <FieldLabel htmlFor={field.id} inline={field.controlType === 'checkbox' || field.controlType === 'markdown'}>
              { field.controlType === 'checkbox' && formField }
              { field.label }
              { field.validators && field.validators.required
              && <Required>*</Required>
              }
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
      fieldGroup,
      formData,
      scrollContainer,
      closeMultiselectOnClickOutside,
      handleUpdate,
    } = this.props;
    let isHidden = field.hideByDefault && this.state.hidden;
    if (isHidden) {
      const isEmpty = fieldTracked && fieldTracked.value ? fieldTracked.value === '' : true;
      isHidden = isHidden && !!isEmpty;
    }

    return (
      <Field
        labelledGroup={fieldGroup && !!fieldGroup.label}
        printHide={field.printHide}
      >
        {!isHidden && this.renderFormField({
          field,
          nested: false,
          formData,
          closeMultiselectOnClickOutside,
          scrollContainer,
          handleUpdate,
        })}
        {isHidden && (
          <Button onClick={() => this.setHidden(false)}>
            {`Add ${field.label}`}
          </Button>
        )}
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
      </Field>
    );
  }
}

FormField.propTypes = {
  formData: PropTypes.object,
  scrollContainer: PropTypes.object,
  field: PropTypes.object,
  fieldTracked: PropTypes.object,
  fieldGroup: PropTypes.object,
  closeMultiselectOnClickOutside: PropTypes.bool,
  handleUpdate: PropTypes.func,
};


FormField.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default FormField;
