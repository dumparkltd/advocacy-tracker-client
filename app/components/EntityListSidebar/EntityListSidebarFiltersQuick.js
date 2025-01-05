/*
 *
 * EntityListSidebarFiltersQuick
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Box } from 'grommet';
import { fromJS, Map, List } from 'immutable';

import { injectIntl, intlShape } from 'react-intl';

// import qe from 'utils/quasi-equals';

import MapOption from 'containers/MapContainer/MapInfoOptions/MapOption';
// import appMessages from 'containers/App/messages';

import { makeQuickFilterGroups } from './utilFilterGroups';
// import { makeActiveFilterOptions } from './utilFilterOptions';
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


// const makeFormOptions = ({
//   allEntities,
//   config,
//   locationQuery,
//   taxonomies,
//   connections,
//   connectedTaxonomies,
//   activeOption,
//   intl,
//   typeId,
//   isAdmin,
//   includeMembersWhenFiltering,
//   includeActorMembers,
//   includeActorChildren,
// }) => makeActiveFilterOptions({
//   entities: allEntities,
//   config,
//   locationQuery,
//   taxonomies,
//   connections,
//   // actortypes,
//   // actiontypes,
//   connectedTaxonomies,
//   activeFilterOption: activeOption,
//   intl,
//   typeId,
//   isAdmin,
//   messages: {
//     titlePrefix: intl.formatMessage(messages.filterFormTitlePrefix),
//     without: intl.formatMessage(messages.filterFormWithoutPrefix),
//     any: intl.formatMessage(messages.filterFormAnyPrefix),
//   },
//   includeMembers: includeMembersWhenFiltering,
//   includeActorMembers,
//   includeActorChildren,
// });
//
// const getFilterConnectionsMsg = (intl, type) => type
//   && messages.filterGroupLabel[`connections-${type}`]
//   ? intl.formatMessage(messages.filterGroupLabel[`connections-${type}`])
//   : intl.formatMessage(messages.filterGroupLabel.connections);

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
  hasUserRole,
  filterActortypes,
  actortypes,
  resourcetypes,
  actiontypes,
  membertypes,
  filterAssociationtypes,
  associationtypes,
  currentFilters,
}) => {
  // const formOptions = activeOption && makeFormOptions({
  //   allEntities,
  //   config,
  //   locationQuery,
  //   taxonomies,
  //   connections,
  //   connectedTaxonomies,
  //   activeOption,
  //   intl,
  //   typeId,
  //   isAdmin,
  //   includeMembersWhenFiltering,
  //   includeActorMembers,
  //   includeActorChildren,
  // });
  // const groups = makeQuickFilterGroups({
  //   config,
  //   taxonomies,
  //   connectedTaxonomies,
  //   hasUserRole,
  //   actortypes: filterActortypes || actortypes,
  //   resourcetypes,
  //   actiontypes,
  //   membertypes,
  //   filterAssociationtypes,
  //   associationtypes: filterAssociationtypes || associationtypes,
  //   activeOption,
  //   currentFilters,
  //   typeId,
  //   intl,
  //   locationQuery,
  //   includeMembersWhenFiltering,
  // });
  return (
    <Styled>
      Hello quick
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
  hasUserRole: PropTypes.object,
  filteringOptions: PropTypes.array,
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
