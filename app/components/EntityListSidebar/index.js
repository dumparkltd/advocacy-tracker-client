/*
 *
 * EntityListSidebar
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { Map, List } from 'immutable';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Box } from 'grommet';

import Scrollable from 'components/styled/Scrollable';
import Icon from 'components/Icon';
import SupTitle from 'components/SupTitle';
import Button from 'components/buttons/ButtonSimple';

import Sidebar from 'components/styled/Sidebar';
import SidebarHeader from 'components/styled/SidebarHeader';

import EntityListSidebarFiltersClassic from './EntityListSidebarFiltersClassic';
import EntityListSidebarFiltersQuick from './EntityListSidebarFiltersQuick';

import messages from './messages';

const ScrollableWrapper = styled(Scrollable)`
  background-color: ${(
    { hasBackground }
  ) => hasBackground ? palette('asideHeader', 0) : palette('aside', 0)};
`;

const SidebarWrapper = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 110;
  width: 100%;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    z-index: 100;
    top: ${({ theme }) => theme.sizes.header.banner.height}px;
    width: auto;
  }
`;

const ButtonClose = styled(Button)`
  border-radius: 9999px;
  background-color: white;
  padding: 4px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding: 6px;
  }
  &:hover {
    color: ${({ theme }) => theme.global.colors.highlight};
  }
`;
const ButtonFilterType = styled(Button)`
  border-bottom: 3px solid ${({ active }) => active ? 'black' : 'transparent'};
  border-top: 3px solid transparent;
  color: ${({ active, theme }) => active ? 'black' : theme.global.colors.textSecondary};
  padding: 4px 8px;
  text-transform: uppercase;
  font-size: ${({ theme }) => theme.text.xxsmall.size};
  font-weight: 600;
  line-height: ${({ theme }) => theme.text.xsmall.size};
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    font-size: ${({ theme }) => theme.text.xsmall.size};
    padding: 6px 12px;
  }
  &:hover {
    color: ${({ active, theme }) => active ? 'black' : theme.global.colors.highlight};
    cursor: ${({ active }) => active ? 'default' : 'pointer'};
  }
`;


export const EntityListSidebar = ({
  showFilters,
  showEditOptions,
  allEntities,
  entitiesSelected,
  onUpdateQuery,
  filteringOptions,
  onUpdate,
  onUpdateFilters,
  connections,
  includeActorMembers,
  includeActorChildren,
  includeMembersWhenFiltering,
  typeId,
  config,
  isAdmin,
  hasUserRole,
  locationQuery,
  taxonomies,
  connectedTaxonomies,
  actortypes,
  filterActortypes,
  actiontypes,
  resourcetypes,
  membertypes,
  filterAssociationtypes,
  associationtypes,
  currentFilters,
  onHideFilters,
  onHideEditOptions,
  onCreateOption,
  intl,
}) => {
  const [filterType, setFilterType] = React.useState(null);
  const onHideSidebar = showFilters ? onHideFilters : onHideEditOptions;
  const hasEntities = allEntities && allEntities.size > 0;

  const hasFilterOptions = showFilters && !!config.quickFilterGroups;
  let filterTypeClean = filterType || 'classic';
  if (hasFilterOptions && !filterType) {
    filterTypeClean = 'quick';
  }

  const showEditPanel = !showFilters && hasEntities && !!entitiesSelected;

  return (
    <SidebarWrapper onClick={onHideSidebar}>
      <Sidebar onClick={(evt) => evt.stopPropagation()}>
        <ScrollableWrapper hasBackground={filterTypeClean === 'quick'}>
          <SidebarHeader
            hasFilterOptions={hasFilterOptions}
          >
            <Box direction="row" justify="between" align="center">
              {showFilters && hasFilterOptions && (
                <Icon name="filter" alt={intl.formatMessage(messages.header.filter)} />
              )}
              {showFilters && !hasFilterOptions && <SupTitle title={intl.formatMessage(messages.header.filter)} />}
              {!showFilters && <SupTitle title={intl.formatMessage(messages.header.edit)} />}
              <ButtonClose onClick={onHideSidebar}>
                <Icon name="close" size="30px" />
              </ButtonClose>
            </Box>
            {hasFilterOptions && (
              <Box direction="row" margin={{ top: 'ms' }}>
                <ButtonFilterType
                  onClick={() => setFilterType('quick')}
                  active={filterTypeClean === 'quick'}
                >
                  Quick filters
                </ButtonFilterType>
                <ButtonFilterType
                  onClick={() => setFilterType('classic')}
                  active={filterTypeClean === 'classic'}
                >
                  All filters
                </ButtonFilterType>
              </Box>
            )}
          </SidebarHeader>
          {(showFilters || showEditPanel) && (
            <div>
              {(showEditPanel || filterTypeClean === 'classic') && (
                <EntityListSidebarFiltersClassic
                  entitiesSelected={entitiesSelected}
                  allEntities={allEntities}
                  taxonomies={taxonomies}
                  actortypes={actortypes}
                  filterActortypes={filterActortypes}
                  actiontypes={actiontypes}
                  resourcetypes={resourcetypes}
                  membertypes={membertypes}
                  filterAssociationtypes={filterAssociationtypes}
                  associationtypes={associationtypes}
                  connectedTaxonomies={connectedTaxonomies}
                  showFilters={showFilters}
                  showEditOptions={showEditOptions}
                  onUpdateQuery={onUpdateQuery}
                  filteringOptions={filteringOptions}
                  onUpdate={onUpdate}
                  onUpdateFilters={onUpdateFilters}
                  connections={connections}
                  includeActorMembers={includeActorMembers}
                  includeActorChildren={includeActorChildren}
                  includeMembersWhenFiltering={includeMembersWhenFiltering}
                  typeId={typeId}
                  config={config}
                  isAdmin={isAdmin}
                  hasUserRole={hasUserRole}
                  locationQuery={locationQuery}
                  currentFilters={currentFilters}
                  onCreateOption={onCreateOption}
                />
              )}
              {showFilters && filterTypeClean === 'quick' && (
                <EntityListSidebarFiltersQuick
                  allEntities={allEntities}
                  taxonomies={taxonomies}
                  actortypes={actortypes}
                  filterActortypes={filterActortypes}
                  actiontypes={actiontypes}
                  resourcetypes={resourcetypes}
                  membertypes={membertypes}
                  filterAssociationtypes={filterAssociationtypes}
                  associationtypes={associationtypes}
                  connectedTaxonomies={connectedTaxonomies}
                  onUpdateQuery={onUpdateQuery}
                  filteringOptions={filteringOptions}
                  onUpdateFilters={onUpdateFilters}
                  connections={connections}
                  includeActorMembers={includeActorMembers}
                  includeActorChildren={includeActorChildren}
                  includeMembersWhenFiltering={includeMembersWhenFiltering}
                  typeId={typeId}
                  config={config}
                  isAdmin={isAdmin}
                  hasUserRole={hasUserRole}
                  locationQuery={locationQuery}
                  currentFilters={currentFilters}
                />
              )}
            </div>
          )}
        </ScrollableWrapper>
      </Sidebar>
    </SidebarWrapper>
  );
};

EntityListSidebar.propTypes = {
  entitiesSelected: PropTypes.instanceOf(List),
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
  onUpdate: PropTypes.func.isRequired,
  onUpdateFilters: PropTypes.func.isRequired,
  onCreateOption: PropTypes.func.isRequired,
  onUpdateQuery: PropTypes.func.isRequired,
  onHideFilters: PropTypes.func,
  onHideEditOptions: PropTypes.func,
  hasUserRole: PropTypes.object,
  config: PropTypes.object,
  currentFilters: PropTypes.array,
  filteringOptions: PropTypes.array,
  typeId: PropTypes.string,
  showFilters: PropTypes.bool,
  showEditOptions: PropTypes.bool,
  isAdmin: PropTypes.bool,
  includeMembersWhenFiltering: PropTypes.bool,
  includeActorMembers: PropTypes.bool,
  includeActorChildren: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(EntityListSidebar);
