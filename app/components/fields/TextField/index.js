import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import FieldWrap from 'components/fields/FieldWrap';
import Label from 'components/fields/Label';
import EmptyHint from 'components/fields/EmptyHint';

class TextField extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { field } = this.props;
    return (
      <FieldWrap>
        {field.label && (
          <Label>
            <FormattedMessage {...field.label} />
          </Label>
        )}
        { !!field.value && (<p>{field.value}</p>)}
        { !field.value
          && field.showEmpty
          && (
            <EmptyHint>
              <FormattedMessage {...field.showEmpty} />
            </EmptyHint>
          )
        }
      </FieldWrap>
    );
  }
}

TextField.propTypes = {
  field: PropTypes.object.isRequired,
};

export default TextField;
