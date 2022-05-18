import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { Box } from 'grommet';

import FieldWrap from 'components/fields/FieldWrap';
import Label from 'components/fields/Label';
import EmptyHint from 'components/fields/EmptyHint';
import InfoOverlay from 'components/InfoOverlay';
import isNumber from 'utils/is-number';
import { formatNumber } from 'utils/fields';

class NumberField extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { field, intl } = this.props;
    const label = field.label
      ? intl.formatMessage(field.label)
      : field.title;
    return (
      <FieldWrap>
        <Box direction="row" alignContent="start" justify="start" gap="xsmall" fill={false}>
          <Label>{label}</Label>
          {field.info && (
            <InfoOverlay
              title={label}
              content={field.info}
              padButton={{ horizontal: 'xsmall' }}
            />
          )}
        </Box>
        { !!field.value && (
          <p>
            {isNumber(field.value) && formatNumber(field.value, {
              intl,
              unit: field.unit,
              unitBefore: field.unitBefore,
              digits: field.digits,
            })}
            {!isNumber && field.value}
          </p>
        )}
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

NumberField.propTypes = {
  field: PropTypes.object.isRequired,
  intl: intlShape,
};

export default injectIntl(NumberField);
