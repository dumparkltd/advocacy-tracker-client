import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { Box, Button, Text } from 'grommet';
import { FormNext } from 'grommet-icons';
import styled from 'styled-components';

import FieldWrap from 'components/fields/FieldWrap';
import Label from 'components/fields/Label';
import EmptyHint from 'components/fields/EmptyHint';
import InfoOverlay from 'components/InfoOverlay';
import isNumber from 'utils/is-number';
import { formatNumber } from 'utils/fields';

const TitleButton = styled((p) => <Button {...p} />)`
  font-weight: 500;
  font-size: 13px;
  stroke: ${({ theme }) => theme.global.colors.a};
  &:hover {
    stroke: ${({ theme }) => theme.global.colors.aHover};
  }
`;

class NumberField extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { field, intl } = this.props;
    const label = field.label
      ? intl.formatMessage(field.label)
      : field.title;
    const { isCount } = field;
    return (
      <FieldWrap>
        {!isCount && (
          <Box>
            {!!label && (
              <Box direction="row" alignContent="start" justify="start" gap="xsmall" fill={false}>
                {!field.titleLink && (
                  <Label>{label}</Label>
                )}
                {field.titleLink && (
                  <TitleButton
                    as="a"
                    plain
                    href={field.titleLink.href}
                    onClick={field.titleLink.onClick}
                  >
                    <Box direction="row" align="center">
                      <Text size="small">{label}</Text>
                      <FormNext size="xsmall" style={{ stroke: 'inherit' }} />
                    </Box>
                  </TitleButton>
                )}
                {field.info && (
                  <InfoOverlay
                    title={label}
                    content={field.info}
                    padButton={{ horizontal: 'xxsmall' }}
                    tooltip
                  />
                )}
              </Box>
            )}
            {(typeof field.value !== 'undefined' && field.value !== null) && (
              <Box margin={{ vertical: 'xsmall' }}>
                {isNumber(field.value) && formatNumber(field.value, {
                  intl,
                  unit: field.unit,
                  unitBefore: field.unitBefore,
                })}
                {!isNumber(field.value) && field.value}
              </Box>
            )}
            {!field.value && field.showEmpty && (
              <EmptyHint>
                <FormattedMessage {...field.showEmpty} />
              </EmptyHint>
            )}
          </Box>
        )}
        {isCount && (
          <Label>
            {`${label}: ${formatNumber(field.value, {
              intl,
              unit: field.unit,
              unitBefore: field.unitBefore,
            })}`}
          </Label>
        )}
      </FieldWrap>
    );
  }
}

NumberField.propTypes = {
  field: PropTypes.object.isRequired,
  intl: intlShape,
};

export default injectIntl(NumberField);
