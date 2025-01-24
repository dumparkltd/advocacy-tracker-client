/*
 *
 * EntityListSidebarFiltersQuick
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text } from 'grommet';
import { Map, List } from 'immutable';

import { injectIntl, intlShape } from 'react-intl';

// import qe from 'utils/quasi-equals';

import CheckboxOption from 'components/CheckboxOption';
// import appMessages from 'containers/App/messages';
import FilterDropdown from 'components/forms/FilterDropdown';

import FilterPills from './FilterPills';

import { makeQuickFilterGroups } from './utilFilterGroups';
import messages from './messages';

const Styled = styled((p) => (
  <Box
    flex={{ shrink: 0 }}
    {...p}
  />
))`
  padding: 1em 12px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.xlarge}) {
    padding: 1em 16px;
  })
`;

const PanelTitleWrap = styled((p) => (
  <Box
    flex={{ shrink: 0 }}
    margin={{ top: 'medium', bottom: 'small' }}
    {...p}
  />
))``;

const PanelTitle = styled((p) => <Text size="xsmall" weight={600} {...p} />)`
  text-transform: uppercase;
`;

const Groups = styled((p) => (
  <Box
    flex={{ shrink: 0 }}
    {...p}
  />
))``;

const Group = styled((p) => (
  <Box
    flex={{ shrink: 0 }}
    margin={{ bottom: 'large' }}
    {...p}
  />
))``;

const GroupTitle = styled((p) => <Text size="medium" weight={600} {...p} />)`
  text-transform: uppercase;
`;
const Filters = styled((p) => (
  <Box
    flex={{ shrink: 0 }}
    margin={{ vertical: 'small' }}
    {...p}
  />
))``;

const Filter = styled((p) => (
  <Box
    flex={{ shrink: 0 }}
    margin={{ bottom: 'ms' }}
    gap="xxsmall"
    {...p}
  />
))``;

const FilterTitle = styled((p) => <Text size="small" weight={600} {...p} />)``;

export const EntityListSidebarFiltersQuick = ({
  intl,
  onUpdateQuery,
  filteringOptions,
  onUpdateFilters,
  allEntities,
  config,
  locationQuery,
  taxonomies,
  connections,
  connectedTaxonomies,
  typeId,
  isAdmin,
  includeMembersWhenFiltering,
  includeActorMembers,
  includeActorChildren,
  // hasUserRole,
  filterActortypes,
  actortypes,
  resourcetypes,
  actiontypes,
  membertypes,
  filterAssociationtypes,
  associationtypes,
  currentFilters,
}) => {
  const groups = makeQuickFilterGroups({
    config,
    taxonomies,
    connectedTaxonomies,
    // hasUserRole,
    actortypes: filterActortypes || actortypes,
    resourcetypes,
    actiontypes,
    membertypes,
    associationtypes: filterAssociationtypes || associationtypes,
    currentFilters,
    typeId,
    intl,
    locationQuery,
    includeMembers: includeMembersWhenFiltering,
    entities: allEntities,
    connections,
    messages: {
      titlePrefix: intl.formatMessage(messages.filterFormTitlePrefix),
      without: intl.formatMessage(messages.filterFormWithoutPrefix),
      any: intl.formatMessage(messages.filterFormAnyPrefix),
    },
    isAdmin,
    includeActorMembers,
    includeActorChildren,
    onUpdateFilters,
    onUpdateQuery,
  });
  // console.log('config', config)
  // console.log('groups', groups)

  return (
    <Styled>
      <PanelTitleWrap>
        <PanelTitle>
          Filter items by
        </PanelTitle>
      </PanelTitleWrap>
      <Groups>
        {groups && groups.map((group) => {
          const groupFilteringOptions = group.filteringOptions
            ? group.filteringOptions.reduce((memo, option) => {
              const availableOption = filteringOptions.find((o) => o.key === option);
              return availableOption
                ? [...memo, availableOption]
                : memo;
            }, [])
            : null;

          return (
            <Group
              key={group.id}
            >
              <GroupTitle>
                {group.label}
              </GroupTitle>
              {groupFilteringOptions && groupFilteringOptions.length > 0 && (
                <Box flex={{ shrink: 0 }} margin={{ top: 'xsmall' }}>
                  {groupFilteringOptions.map((option) => {
                    const o = {
                      ...option,
                      onClick: () => {
                        option.onClick();
                      },
                    };
                    return (
                      <Box key={option.key}>
                        <CheckboxOption option={o} type="members" />
                      </Box>
                    );
                  })}
                </Box>
              )}
              <Filters>
                {group.filters && group.filters.map((filter) => (
                  <Filter key={filter.id}>
                    {filter.label && (
                      <FilterTitle>
                        {filter.label}
                      </FilterTitle>
                    )}
                    {filter.filterType === 'dropdownSelect' && (
                      <FilterDropdown
                        options={filter.options && Object.values(filter.options)}
                        onClear={(value, query) => filter.onClear(value, query)}
                        onSelect={(value, query) => filter.onSelect(value, query)}
                        buttonLabel={filter.dropdownLabel}
                        type="quickFilters"
                        hasSearch={typeof filter.search === 'undefined' || filter.search}
                      />
                    )}
                    {filter.connectionAttributeFilterOptions && (
                      <Box margin={{ top: 'small', bottom: 'medium' }} gap="xxsmall">
                        {filter.connectionAttributeFilterOptions.label && (
                          <Text color="hint" size="xxsmall">
                            {filter.connectionAttributeFilterOptions.label}
                          </Text>
                        )}
                        {filter.connectionAttributeFilterOptions.filterType === 'pills' && (
                          <FilterPills
                            options={filter.connectionAttributeFilterOptions.options}
                          />
                        )}
                      </Box>
                    )}
                  </Filter>
                ))}
              </Filters>
            </Group>
          );
        })}
      </Groups>
    </Styled>
  );
};
EntityListSidebarFiltersQuick.propTypes = {
  allEntities: PropTypes.instanceOf(List),
  taxonomies: PropTypes.instanceOf(Map),
  actortypes: PropTypes.instanceOf(Map),
  filterActortypes: PropTypes.instanceOf(Map),
  resourcetypes: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  membertypes: PropTypes.instanceOf(Map),
  filterAssociationtypes: PropTypes.instanceOf(Map),
  associationtypes: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  connectedTaxonomies: PropTypes.instanceOf(Map),
  locationQuery: PropTypes.instanceOf(Map),
  onUpdateQuery: PropTypes.func,
  onUpdateFilters: PropTypes.func,
  config: PropTypes.object,
  // hasUserRole: PropTypes.object,
  // filteringOptions: PropTypes.array,
  currentFilters: PropTypes.array,
  typeId: PropTypes.string,
  isAdmin: PropTypes.bool,
  includeMembersWhenFiltering: PropTypes.bool,
  includeActorMembers: PropTypes.bool,
  includeActorChildren: PropTypes.bool,
  intl: intlShape.isRequired,
};

EntityListSidebarFiltersQuick.contextTypes = {
};

export default injectIntl(EntityListSidebarFiltersQuick);
