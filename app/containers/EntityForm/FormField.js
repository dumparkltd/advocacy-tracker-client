import React from 'react';
import PropTypes from 'prop-types';
import { Errors } from 'react-redux-form/immutable';
import styled from 'styled-components';

import Button from 'components/buttons/Button';

import ErrorWrapper from 'components/forms/ErrorWrapper';
import FormFieldInner from './FormFieldInner';

const Field = styled.div`
  @media print {
    display: ${({ printHide }) => (printHide) ? 'none !important' : 'block'};
  };
`;

const FieldInnerWrapper = styled.div`
  margin-top: ${({ hideByDefault }) => hideByDefault ? 10 : 0}px;
  margin-bottom: ${({ isFooter }) => isFooter ? 0 : 5}px;
`;

const ShowButton = styled(Button)`
  font-family: 'wwfregular', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  text-transform: uppercase;
  font-size: ${({ theme }) => theme.text.medium.size};
  padding: 0;
  color: ${({ theme }) => theme.global.colors.highlight};
`;

class FormField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.state = { hidden: true };
  }

  setHidden = (hidden = true) => this.setState({ hidden });

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
      isNewEntityView,
      isFooter,
      fieldInfo,
    } = this.props;
    const isEmpty = (fieldTracked && fieldTracked.value) ? fieldTracked.value === '' : true;
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
          <FieldInnerWrapper hideByDefault={field.hideByDefault} isFooter={isFooter}>
            <FormFieldInner
              field={field}
              formData={formData}
              closeMultiselectOnClickOutside={closeMultiselectOnClickOutside}
              scrollContainer={scrollContainer}
              handleUpdate={handleUpdate}
              inline={inline}
              step={step}
              fieldInfo={fieldInfo}
              fieldTracked={fieldTracked}
              isEmpty={isEmpty}
              isNewEntityView={isNewEntityView}
              isFooter={isFooter}
            />
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
  fieldInfo: PropTypes.object,
  formData: PropTypes.object,
  scrollContainer: PropTypes.object,
  field: PropTypes.object,
  fieldTracked: PropTypes.object,
  closeMultiselectOnClickOutside: PropTypes.bool,
  handleUpdate: PropTypes.func,
  inline: PropTypes.bool,
  isNewEntityView: PropTypes.bool,
  isFooter: PropTypes.bool,
};


FormField.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default FormField;
