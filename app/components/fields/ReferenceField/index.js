import React from 'react';
import PropTypes from 'prop-types';
import Reference from 'components/fields/Reference';
import FieldWrapInline from 'components/fields/FieldWrapInline';

class ReferenceField extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { field } = this.props;
    return (
      <FieldWrapInline>
        <Reference>{field.value}</Reference>
      </FieldWrapInline>
    );
  }
}

ReferenceField.propTypes = {
  field: PropTypes.object.isRequired,
};

export default ReferenceField;
