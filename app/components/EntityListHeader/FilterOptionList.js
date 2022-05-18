/*
 *
 * EntityListSidebarGroups
 *
 */

import React from 'react';
import { intlShape, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Box } from 'grommet';

import { getFilterLabel } from 'components/TagList';
import Icon from 'components/Icon';
import ButtonTagFilter from 'components/buttons/ButtonTagFilter';
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
          gap="hair"
        >
          {option.get('currentFilters').map(
            (f, j) => {
              const filter = f.toJS();
              return (
                <Box key={j} align="start">
                  <ButtonTagFilter
                    onClick={(arg) => {
                      onHideOptions();
                      filter.onClick(arg);
                    }}
                    palette={filter.type || 'attributes'}
                    paletteHover={`${filter.type || 'attributes'}Hover`}
                    pIndex={parseInt(filter.id, 10) || 0}
                    disabled={!filter.onClick}
                  >
                    {getFilterLabel(filter, intl, true)}
                    {filter.onClick && <Icon name="removeSmall" text textRight hidePrint />}
                  </ButtonTagFilter>
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
