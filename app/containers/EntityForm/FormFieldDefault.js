import React from 'react';
import { intlShape, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Box } from 'grommet';
import { lowerCase } from 'utils/string';

import FieldLabel from 'components/forms/Label';
import messages from 'components/forms/MultiSelectField/messages';

import InfoOverlay from 'components/InfoOverlay';

import appMessages from 'containers/App/messages';

import WarningDot from './WarningDot';
import FieldLabelWrap from './FieldLabelWrap';

const Hint = styled.div`
  color: ${palette('text', 1)};
  font-size: ${(props) => props.theme.text.xsmall.size};
  margin-top: -6px;
  @media print {
    font-size: ${(props) => props.theme.sizes.print.small};
  }
`;

const InfoText = styled.span`
  color: ${palette('primary', 1)};
  font-size: ${(props) => props.theme.text.xxsmall.size};
  font-weight: bold;
`;
const AutoFillWrap = styled(
  (p) => <Box direction="row" align="center" gap="xxsmall" {...p} />
)`
  color: ${palette('primary', 1)};
`;

const FormFieldWrap = styled(
  (p) => <Box {...p} />
)``;

export function FormFieldDefault({
  field,
  formField,
  inline,
  isEmpty,
  hasError,
  fieldRequired,
  fieldAutofilledUnseen,
  intl,
}) {
  let content = '';
  if (field.info && appMessages.attributeInfo[field.id]) {
    content = intl.formatMessage(appMessages.attributeInfo[field.id]);
  }
  return (
    <FormFieldWrap
      direction={inline ? 'row' : 'column'}
      gap={inline ? 'small' : 'none'}
    >
      {field.label && (
        <FieldLabelWrap>
          <FieldLabel htmlFor={field.id}>
            {field.controlType === 'multiselect'
              && intl.formatMessage(messages.update, { type: lowerCase(field.label) })
            }
            {field.controlType !== 'multiselect' && field.label }
          </FieldLabel>
          {field.info && (
            <InfoOverlay
              title={field.label}
              content={content}
              padButton={{ horizontal: 'xxsmall' }}
              tooltip
              markdown
              size="xsmall"
            />
          )}
          {!fieldRequired && hasError && (
            <AutoFillWrap>
              <WarningDot type="error" />
            </AutoFillWrap>
          )}
          {fieldRequired && (
            <AutoFillWrap>
              {hasError && (
                <WarningDot type="error" />
              )}
              {!hasError && isEmpty && (
                <WarningDot type="required" />
              )}
              <InfoText>(required)</InfoText>
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
      {field.hint && <Hint>{field.hint}</Hint>}
      {formField}
    </FormFieldWrap>
  );
}

FormFieldDefault.propTypes = {
  field: PropTypes.object,
  formField: PropTypes.object,
  inline: PropTypes.bool,
  isEmpty: PropTypes.bool,
  hasError: PropTypes.bool,
  fieldRequired: PropTypes.func,
  fieldAutofilledUnseen: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(FormFieldDefault);
