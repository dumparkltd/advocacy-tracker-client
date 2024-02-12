import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import appMessages from 'containers/App/messages';
import { usePrint } from 'containers/App/PrintContext';
import FieldWrap from 'components/fields/FieldWrap';
import Label from 'components/fields/Label';
import ShortTitleTag from 'components/fields/ShortTitleTag';

function TitleShortField({ field }) {
  const isPrint = usePrint();
  return (
    <FieldWrap>
      <Label>
        <FormattedMessage {...(field.label || appMessages.attributes.short_title)} />
      </Label>
      <ShortTitleTag inverse={isPrint || field.inverse} pIndex={field.taxonomyId}>{field.value}</ShortTitleTag>
    </FieldWrap>
  );
}

TitleShortField.propTypes = {
  field: PropTypes.object.isRequired,
};
export default TitleShortField;
