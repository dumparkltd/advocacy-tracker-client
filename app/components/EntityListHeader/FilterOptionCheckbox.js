/*
 *
 * EntityListSidebarGroups
 *
 */

import React from 'react';
import { intlShape, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Box, Text } from 'grommet';
import { lowerCase } from 'utils/string';
import appMessage from 'utils/app-message';

export function FilterOptionCheckbox({
  option,
  onUpdateQuery,
  intl,
}) {
  const checkboxId = `${option.get('query')}-${option.get('value')}`;
  let label = option.get('label') || checkboxId;
  if (option.get('message')) {
    label = appMessage(intl, option.get('message'));
  }
  if (option.get('messagePrefix')) {
    label = `${option.get('messagePrefix')} ${lowerCase(label)}`;
  }
  return (
    <Box
      pad={{ horizontal: 'xsmall' }}
      align="center"
      gap="xsmall"
      direction="row"
      key={option.get('value')}
    >
      <input
        id={checkboxId}
        type="checkbox"
        checked={option.get('checked')}
        onChange={() => onUpdateQuery([
          {
            arg: option.get('query'),
            value: option.get('value'),
            add: !option.get('checked'),
            remove: option.get('checked'),
            replace: false,
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
        {label}
      </Text>
    </Box>
  );
}

FilterOptionCheckbox.propTypes = {
  option: PropTypes.object,
  onUpdateQuery: PropTypes.func,
  intl: intlShape.isRequired,
};

export default injectIntl(FilterOptionCheckbox);
