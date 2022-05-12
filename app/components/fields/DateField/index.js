import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate } from 'react-intl';

import appMessages from 'containers/App/messages';

import FieldWrap from 'components/fields/FieldWrap';
import Label from 'components/fields/Label';
import EmptyHint from 'components/fields/EmptyHint';
import DateValue from 'components/fields/DateValue';

class DateField extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { field } = this.props;
    return (
      <FieldWrap>
        <Label>
          <FormattedMessage {...(field.label || appMessages.attributes.date)} />
        </Label>
        { field.value
          && (
            <DateValue>
              {(!field.specificity || field.specificity === 'd') && (
                <FormattedDate value={new Date(field.value)} year="numeric" month="long" day="numeric" />
              )}
              {field.specificity === 'm' && (
                <FormattedDate value={new Date(field.value)} year="numeric" month="long" />
              )}
              {field.specificity === 'y' && (
                <FormattedDate value={new Date(field.value)} year="numeric" />
              )}
            </DateValue>
          )
        }
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

DateField.propTypes = {
  field: PropTypes.object.isRequired,
};

export default DateField;
