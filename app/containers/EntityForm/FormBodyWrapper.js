import React from 'react';
import PropTypes from 'prop-types';
import { Control, Errors } from 'react-redux-form/immutable';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { FormattedMessage } from 'react-intl';
import { omit } from 'lodash/object';

import asArray from 'utils/as-array';
import appMessage from 'utils/app-message';
import appMessages from 'containers/App/messages';

import Icon from 'components/Icon';
import Clear from 'components/styled/Clear';

import Button from 'components/buttons/Button';
import ButtonCancel from 'components/buttons/ButtonCancel';
import ButtonSubmit from 'components/buttons/ButtonSubmit';
import ButtonForm from 'components/buttons/ButtonForm';

import FormFooter from 'components/forms/FormFooter';
import FormFooterButtons from 'components/forms/FormFooterButtons';

import FieldFactory from 'components/fields/FieldFactory';
import FieldGroupWrapper from 'components/fields/FieldGroupWrapper';
import FieldGroupLabel from 'components/fields/FieldGroupLabel';
import FieldWrap from 'components/fields/FieldWrap';
import Field from 'components/fields/Field';
import GroupIcon from 'components/fields/GroupIcon';
import GroupLabel from 'components/fields/GroupLabel';
import ViewPanel from 'components/EntityView/ViewPanel';

import FieldLabel from 'components/forms/Label';
import ErrorWrapper from 'components/forms/ErrorWrapper';
import FormBody from 'components/forms/FormBody';
import Main from 'components/EntityView/Main';
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

import messages from './messages';

const Hint = styled.div`
  color: ${palette('text', 1)};
  font-size: ${(props) => props.theme.sizes.text.small};
  margin-top: -6px;
  @media print {
    font-size: ${(props) => props.theme.sizes.print.small};
  }
`;


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
const NON_CONTROL_PROPS = ['hint', 'label', 'component', 'controlType', 'children', 'errorMessages', 'hasrequired'];


class FormBodyWrapper extends React.Component { // eslint-disable-line react/prefer-stateless-function
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
      fields,
      footerFields,
      formData,
      scrollContainer,
      closeMultiselectOnClickOutside,
      handleUpdate,
      handleDelete,
      deleteConfirmed,
      handleCancel,
      isSaving,
    } = this.props;
    // console.log('fields', fields)

    // console.log('isNewEntityView', isNewEntityView)
    // // console.log('formData', formData && formData.toJS())
    // console.log('formDataTracked', formDataTracked)
    return (
      <>
        <FormBody>
          {fields && fields.length > 0 && (
            <ViewPanel>
              <Main>
                {
                  asArray(fields).map(
                    (fieldGroup, i) => {
                      // skip group if no group or fields are present
                      if (!fieldGroup.fields
                        || !fieldGroup.fields.reduce((memo, field) => memo || field, false)
                      ) {
                        return null;
                      }
                      return (
                        <div key={i}>
                          <FieldGroupWrapper>
                            {fieldGroup.label && (
                              <FieldGroupLabel>
                                <GroupLabel>
                                  {fieldGroup.label}
                                </GroupLabel>
                                {fieldGroup.icon && (
                                  <GroupIcon>
                                    <Icon name={fieldGroup.icon} />
                                  </GroupIcon>
                                )}
                              </FieldGroupLabel>
                            )}
                            {fieldGroup.fields.map(
                              (field, j) => field ? (
                                <Field labelledGroup={!!fieldGroup.label} key={j} printHide={field.printHide}>
                                  {this.renderFormField({
                                    field,
                                    nested: false,
                                    formData,
                                    closeMultiselectOnClickOutside,
                                    scrollContainer,
                                    handleUpdate,
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
                                </Field>
                              ) : null
                            )}
                          </FieldGroupWrapper>
                        </div>
                      );
                    }
                  )
                }
              </Main>
            </ViewPanel>
          )}
          {footerFields && (
            <ViewPanel>
              <Main>
              </Main>
            </ViewPanel>
          )}
        </FormBody>
        <FormFooter>
          {handleDelete && !deleteConfirmed && (
            <DeleteWrapper>
              <ButtonPreDelete type="button" onClick={this.preDelete}>
                <Icon name="trash" sizes={{ mobile: '1.8em' }} />
              </ButtonPreDelete>
            </DeleteWrapper>
          )}
          {handleDelete && deleteConfirmed && (
            <FormFooterButtons left>
              <DeleteConfirmText>
                <FormattedMessage {...messages.confirmDeleteQuestion} />
              </DeleteConfirmText>
              <ButtonCancel
                type="button"
                onClick={() => this.preDelete(false)}
              >
                <FormattedMessage {...messages.buttons.cancelDelete} />
              </ButtonCancel>
              <ButtonDelete type="button" onClick={handleDelete}>
                <FormattedMessage {...messages.buttons.confirmDelete} />
              </ButtonDelete>
            </FormFooterButtons>
          )}
          {!deleteConfirmed && (
            <FormFooterButtons>
              <ButtonCancel
                type="button"
                onClick={handleCancel}
              >
                <FormattedMessage {...appMessages.buttons.cancel} />
              </ButtonCancel>
              <ButtonSubmit type="submit" disabled={isSaving}>
                <FormattedMessage {...appMessages.buttons.save} />
              </ButtonSubmit>
            </FormFooterButtons>
          )}
          <Clear />
        </FormFooter>
      </>
    );
  }
}

FormBodyWrapper.propTypes = {
  formData: PropTypes.object,
  scrollContainer: PropTypes.object,
  fields: PropTypes.array,
  footerFields: PropTypes.array,
  model: PropTypes.string,
  deleteConfirmed: PropTypes.bool,
  isSaving: PropTypes.bool,
  closeMultiselectOnClickOutside: PropTypes.bool,
  handleUpdate: PropTypes.func,
  handleDelete: PropTypes.func,
  handleCancel: PropTypes.func,
};


FormBodyWrapper.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default FormBodyWrapper;