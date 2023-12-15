import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { Box, Button, Text } from 'grommet';
import { FormNext } from 'grommet-icons';
import styled, { css } from 'styled-components';
import { palette } from 'styled-theme';

import { usePrint } from 'containers/App/PrintContext';

import FieldWrap from 'components/fields/FieldWrap';
import Label from 'components/fields/Label';
import EmptyHint from 'components/fields/EmptyHint';
import PrintHide from 'components/styled/PrintHide';
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
  ${({ isPrint }) => isPrint && css`color: #1c2121;`}
  @media print {
    color: color: #1c2121;
  }
`;

const TextPrint = styled((p) => <Text {...p} />)`
  color: ${({ secondary }) => secondary ? palette('text', 1) : palette('text', 0)};
  @media print {
    font-size: 12pt;
  }
`;

export function NumberField({ field, intl, secondary }) {
  const label = field.label
    ? intl.formatMessage(field.label)
    : field.title;
  const { isCount } = field;
  const isPrint = usePrint();
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
                  isPrint={isPrint}
                >
                  <Box direction="row" align="center">
                    <Text size="small">{label}</Text>
                    <PrintHide>
                      <FormNext size="xsmall" style={{ stroke: 'inherit' }} />
                    </PrintHide>
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
              <TextPrint size="large" secondary={secondary}>
                {isNumber(field.value) && formatNumber(field.value, {
                  intl,
                  unit: field.unit,
                  unitBefore: field.unitBefore,
                })}
                {!isNumber(field.value) && field.value}
              </TextPrint>
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

NumberField.propTypes = {
  field: PropTypes.object.isRequired,
  secondary: PropTypes.bool,
  intl: intlShape,
};

export default injectIntl(NumberField);
