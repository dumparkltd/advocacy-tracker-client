import React from 'react';
import PropTypes from 'prop-types';
import { find } from 'lodash/collection';
import { FormattedMessage } from 'react-intl';

import appMessage from 'utils/app-message';
import appMessages from 'containers/App/messages';

import { ATTRIBUTE_STATUSES } from 'themes/config';

import Label from 'components/fields/Label';
import FieldWrapInline from 'components/fields/FieldWrapInline';
import Status from 'components/fields/Status';

class StatusField extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { intl } = this.context;
    const { field } = this.props;
    const { attribute, value } = field;

    const options = field.options || ATTRIBUTE_STATUSES[attribute] || [];
    const status = find(options, { value });

    return (
      <FieldWrapInline>
        <Label>
          <FormattedMessage {...(field.label || appMessages.attributes[attribute])} />
        </Label>
        <Status>
          { status && status.message
            ? appMessage(intl, status.message)
            : ((status && status.label) || field.value)
          }
        </Status>
      </FieldWrapInline>
    );
  }
}

StatusField.propTypes = {
  field: PropTypes.object.isRequired,
};
StatusField.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default StatusField;
