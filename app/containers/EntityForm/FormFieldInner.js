import React from 'react';
import { intlShape, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Control } from 'react-redux-form/immutable';
import { omit } from 'lodash/object';
import appMessage from 'utils/app-message';
import asArray from 'utils/as-array';

import FieldFactory from 'components/fields/FieldFactory';

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

import { FORM_NON_CONTROL_PROPS } from 'themes/config';
import FormFieldCheckbox from './FormFieldCheckbox';
import FormFieldDefault from './FormFieldDefault';

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

const getControlProps = (field) => {
  switch (field.controlType) {
    case 'select': // we will render select options as children, so don't pass options prop directly to the control
      return omit(field, FORM_NON_CONTROL_PROPS.concat(['options']));
    default:
      return omit(field, FORM_NON_CONTROL_PROPS);
  }
};

// REGULAR COMPONENT
const getFieldComponent = (field) => {
  if (field.component) {
    return field.component; // Don't use this unless you really have to
  }
  if (field.controlType in controls) {
    return controls[field.controlType];
  }
  return controls.input; // Default to input type if not specified
};

const renderFieldChildren = (intl, field) => {
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
};

export function FormFieldInner({
  field,
  fieldTracked,
  formData,
  closeMultiselectOnClickOutside,
  scrollContainer,
  handleUpdate,
  inline,
  step,
  isEmpty,
  isNewEntityView,
  intl,
  isFooter,
}) {
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
  const fieldData = field.dataPath && formData.getIn(field.dataPath) ? formData.getIn(field.dataPath).toJS() : null;
  // console.log('field, fieldTracked, formData', field, fieldTracked, formData.toJS(), fieldData)
  // if (field.controlType === 'multiselect') console.log('isNewEntityView, stepSeen, !hasChanges', isNewEntityView, stepSeen, !hasChanges)
  let isAutofill = field.autofill;
  // in case dynamic prepopulation
  if (fieldData) {
    isAutofill = asArray(fieldData).some((d) => d.autofill);
  }
  const fieldAutofilledUnseen = isNewEntityView && !stepSeen && isAutofill && !hasChanges;
  // console.log('fieldRequired, hasChanges, isEmpty', fieldRequired, hasChanges, isEmpty)
  // console.log('fieldAutofilledUnseen, hasChanges, isEmpty', fieldRequired, hasChanges, isEmpty)

  let formField;
  if (field.controlType && field.controlType === 'multiselect') {
    formField = (
      <MultiSelectField
        field={field}
        scrollContainer={scrollContainer}
        fieldData={formData.getIn(field.dataPath)}
        closeOnClickOutside={closeMultiselectOnClickOutside}
        handleUpdate={(data) => handleUpdate(formData.setIn(field.dataPath, data))}
      />
    );
  } else {
    const { id, model, ...props } = getControlProps(field);
    const FieldComponent = getFieldComponent(field);
    formField = (
      <FieldComponent
        id={id}
        model={model || `.${id}`}
        debounce={500}
        {...props}
      >
        {renderFieldChildren(intl, field)}
      </FieldComponent>
    );
  }
  return (
    <>
      {field.controlType === 'info' && (
        <FieldFactory field={field} />
      )}
      {field.controlType === 'checkbox' && (
        <FormFieldCheckbox
          field={field}
          formField={formField}
          withoutTitle={isFooter}
        />
      )}
      {field.controlType !== 'checkbox' && field.controlType !== 'info' && (
        <FormFieldDefault
          field={field}
          formField={formField}
          inline={inline}
          isEmpty={isEmpty}
          hasError={hasError}
          fieldRequired={fieldRequired}
          fieldAutofilledUnseen={fieldAutofilledUnseen}
        />
      )}
    </>
  );
}

FormFieldInner.propTypes = {
  field: PropTypes.object,
  formData: PropTypes.object, // Map
  closeMultiselectOnClickOutside: PropTypes.bool,
  scrollContainer: PropTypes.object,
  handleUpdate: PropTypes.func,
  inline: PropTypes.bool,
  step: PropTypes.object,
  fieldTracked: PropTypes.object,
  isEmpty: PropTypes.bool,
  isNewEntityView: PropTypes.bool,
  isFooter: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(FormFieldInner);
