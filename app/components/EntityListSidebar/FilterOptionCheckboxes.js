/*
 *
 * FilterOptionCheckboxes
 *
 */

import React from 'react';
import { intlShape, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Box, Text } from 'grommet';
import Checkbox from 'components/styled/Checkbox';

import appMessage from 'utils/app-message';

export function FilterOptionCheckboxes({
  option,
  onUpdateQuery,
  intl,
}) {
  return (
    <Box pad={{ horizontal: 'xsmall' }}>
      <Text weight={500}>
        {option.get('message') && appMessage(intl, option.get('message'))}
      </Text>
      <Box
        align="center"
        gap="medium"
        direction="row"
      >
        {option.get('options') && option.get('options').map(
          (attributeOption) => {
            const checkboxId = `option-${option.get('id')}-${attributeOption.get('value')}`;
            return (
              <Box
                align="center"
                gap="xsmall"
                direction="row"
                key={attributeOption.get('value')}
              >
                <Checkbox
                  id={checkboxId}
                  checked={attributeOption.get('checked')}
                  onChange={() => onUpdateQuery([
                    {
                      arg: attributeOption.get('query'),
                      value: attributeOption.get('value'),
                      add: !attributeOption.get('checked'),
                      remove: attributeOption.get('checked'),
                      replace: false,
                      multipleAttributeValues: false,
                    },
                    {
                      arg: 'page',
                      value: '',
                      replace: true,
                      remove: true,
                    },
                  ])}
                />
                <Text as="label" htmlFor={checkboxId} size="small">
                  {attributeOption.get('message') && appMessage(intl, attributeOption.get('message'))}
                </Text>
              </Box>
            );
          }
        )}
      </Box>
    </Box>
  );
}

FilterOptionCheckboxes.propTypes = {
  option: PropTypes.object,
  onUpdateQuery: PropTypes.func,
  intl: intlShape.isRequired,
};

export default injectIntl(FilterOptionCheckboxes);
