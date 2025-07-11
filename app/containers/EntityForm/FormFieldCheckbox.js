import React from 'react';
import { injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { Box } from 'grommet';
import styled from 'styled-components';

import FieldLabel from 'components/forms/Label';
import InfoOverlay from 'components/InfoOverlay';

import appMessages from 'containers/App/messages';
import FieldLabelWrap from './FieldLabelWrap';

const CheckboxLabel = styled(FieldLabel)`
  font-size: ${({ theme }) => theme.text.medium.size};
  color: black;
  font-weight: 500;
`;

export function FormFieldCheckbox({
  field,
  fieldValue,
  formField,
  withoutTitle,
  intl,
}) {
  // console.log(field)
  // console.log(formField)
  const attributeTitle = field.att && appMessages.attributes[field.att]
    ? intl.formatMessage(appMessages.attributes[field.att])
    : field.label;

  let content;
  if (field.info && appMessages.attributeInfo[field.att]) {
    content = intl.formatMessage(appMessages.attributeInfo[field.att]);
  }
  if (typeof fieldValue !== 'undefined' && appMessages.attributeInfo[`${field.att}_${fieldValue}`]) {
    content = `${content} \n\n ${intl.formatMessage(appMessages.attributeInfo[`${field.att}_${fieldValue}`])}`;
  }
  // console.log(field, fieldValue)
  return (
    <Box>
      {!withoutTitle && (
        <FieldLabelWrap>
          <FieldLabel>
            {attributeTitle}
          </FieldLabel>
        </FieldLabelWrap>
      )}
      <Box
        direction="row"
        gap="xxsmall"
        align="center"
      >
        {field.label && (
          <CheckboxLabel>
            <Box direction="row" align="center">
              <Box>{formField}</Box>
              <Box>{field.label}</Box>
            </Box>
          </CheckboxLabel>
        )}
        {field.info && (
          <InfoOverlay
            title={attributeTitle}
            content={content}
            padButton={{ horizontal: 'xxsmall' }}
            markdown
            tooltip
            size="xsmall"
          />
        )}
      </Box>
    </Box>
  );
}

FormFieldCheckbox.propTypes = {
  field: PropTypes.object,
  formField: PropTypes.object,
  fieldValue: PropTypes.bool,
  withoutTitle: PropTypes.bool,
  intl: intlShape.isRequired,
};
export default injectIntl(FormFieldCheckbox);
