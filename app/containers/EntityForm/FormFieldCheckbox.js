import React from 'react';
import { injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { Box } from 'grommet';

import FieldLabel from 'components/forms/Label';
import InfoOverlay from 'components/InfoOverlay';

import appMessages from 'containers/App/messages';

export function FormFieldCheckbox({
  field,
  formField,
  withoutTitle,
  intl,
}) {
  // console.log(field)
  // console.log(formField)
  const attributeTitle = field.att && appMessages.attributes[field.att]
    ? intl.formatMessage(appMessages.attributes[field.att])
    : field.label;
  return (
    <Box>
      {!withoutTitle && (
        <FieldLabel>
          {attributeTitle}
        </FieldLabel>
      )}
      <Box
        direction="row"
        gap="small"
      >
        {field.label && (
          <FieldLabel>
            {formField}
            {field.label}
          </FieldLabel>
        )}
        {field.info && (
          <InfoOverlay
            title={attributeTitle}
            content={field.info}
            padButton={{ horizontal: 'xxsmall' }}
            tooltip
          />
        )}
      </Box>
    </Box>
  );
}

FormFieldCheckbox.propTypes = {
  field: PropTypes.object,
  formField: PropTypes.object,
  withoutTitle: PropTypes.bool,
  intl: intlShape.isRequired,
};
export default injectIntl(FormFieldCheckbox);
