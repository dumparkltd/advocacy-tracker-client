/*
 *
 * EntityListSidebarGroups
 *
 */

import React from 'react';
import { intlShape, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Box } from 'grommet';

import { getFilterLabel } from 'components/TagList/utils';
import ButtonTagFilterWrap from 'components/buttons/ButtonTagFilterWrap';
import EntityListSidebarOption from './EntityListSidebarOption';

export function FilterOptionList({
  group,
  option,
  onShowForm,
  onHideOptions,
  intl,
}) {
  return (
    <Box>
      <EntityListSidebarOption
        option={option}
        groupId={group.get('id')}
        groupType={group.get('type')}
        onShowForm={onShowForm}
      />
      {option.get('currentFilters') && option.get('currentFilters').size > 0 && (
        <Box
          pad={{
            top: 'xxsmall',
            bottom: 'xsmall',
            left: 'medium',
          }}
          align="start"
          gap="xxsmall"
        >
          {option.get('currentFilters').map(
            (f, j) => {
              const filter = f.toJS();
              return (
                <Box key={j} align="start">
                  <ButtonTagFilterWrap
                    onClick={(arg) => {
                      onHideOptions();
                      filter.onClick(arg);
                    }}
                    filter={filter}
                    label={getFilterLabel(filter, intl, true)}
                  />
                </Box>
              );
            }
          )}
        </Box>
      )}
    </Box>
  );
}

FilterOptionList.propTypes = {
  group: PropTypes.object,
  option: PropTypes.object,
  onShowForm: PropTypes.func.isRequired,
  onHideOptions: PropTypes.func,
  intl: intlShape.isRequired,
};

export default injectIntl(FilterOptionList);
