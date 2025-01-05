/*
 *
 * EntityListSidebar
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
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

import messages from './messages';

// const Main = styled.div``;
const ScrollableWrapper = styled(Scrollable)`
  background-color: ${palette('aside', 0)};
`;

const ListEntitiesEmpty = styled.div`
  font-size: 1.2em;
  padding: 1.5em;
  color: ${palette('text', 1)};
  @media print {
    font-size: ${(props) => props.theme.sizes.print.large};
  }
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

export class EntityListSidebar extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    const {
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
    } = this.props;
    const onHideSidebar = showFilters ? onHideFilters : onHideEditOptions;
    const isEditPanel = !showFilters;
    const hasEntities = allEntities && allEntities.size > 0;
    return (
      <SidebarWrapper onClick={onHideSidebar}>
        <Sidebar onClick={(evt) => evt.stopPropagation()}>
          <ScrollableWrapper>
            <SidebarHeader>
              <Box direction="row" justify="between" align="center">
                {showFilters && <SupTitle title={intl.formatMessage(messages.header.filter)} />}
                {!showFilters && <SupTitle title={intl.formatMessage(messages.header.edit)} />}
                <Button onClick={onHideSidebar}>
                  <Icon name="close" />
                </Button>
              </Box>
            </SidebarHeader>
            <div>
              {(!isEditPanel || (isEditPanel && !!entitiesSelected && hasEntities)) && (
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
              {isEditPanel && hasEntities && !entitiesSelected && (
                <ListEntitiesEmpty>
                  <FormattedMessage {...messages.entitiesNotSelected} />
                </ListEntitiesEmpty>
              )}
            </div>
          </ScrollableWrapper>
        </Sidebar>
      </SidebarWrapper>
    );
  }
}
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
