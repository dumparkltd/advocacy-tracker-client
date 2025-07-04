import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Reference from 'components/fields/Reference';
import FieldWrapInline from 'components/fields/FieldWrapInline';
import Label from 'components/fields/Label';

class ReferenceField extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { field } = this.props;
    return (
      <FieldWrapInline>
        {field.label && (
          <Label>
            <FormattedMessage {...field.label} />
          </Label>
        )}
        <Reference>{field.value}</Reference>
      </FieldWrapInline>
    );
  }
}

ReferenceField.propTypes = {
  field: PropTypes.object.isRequired,
};

export default ReferenceField;
