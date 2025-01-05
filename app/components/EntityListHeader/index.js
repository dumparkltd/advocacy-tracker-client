/*
 *
 * EntityListHeader
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';
import { Map, List } from 'immutable';
import { palette } from 'styled-theme';
import {
  Box, Text, ResponsiveContext,
} from 'grommet';
import { Multiple } from 'grommet-icons';

import { isEqual } from 'lodash/lang';
import { isMinSize } from 'utils/responsive';

import ButtonFlat from 'components/buttons/ButtonFlat';
import Bookmarker from 'containers/Bookmarker';

import EntityListViewOptions from 'components/EntityListViewOptions';

import PrintHide from 'components/styled/PrintHide';
import Icon from 'components/Icon';

import EntityListSidebar from './EntityListSidebar';

import messages from './messages';

const Styled = styled(PrintHide)`
  display: ${({ isPrint }) => isPrint ? 'none' : 'block'};
`;

const TheHeader = styled((p) => <Box direction="row" {...p} />)`
  height: ${({ theme }) => theme.sizes.headerList.banner.height}px;
  position: relative;
  z-index: 96;
`;
const HeaderSection = styled((p) => <Box direction="row" {...p} />)`
  position: relative;
`;

const HeaderActionsWrapper = styled(
  (p) => (
    <Box
      direction="row"
      align="center"
      plain
      responsive={false}
      {...p}
    />
  )
)`
  background: white;
  box-shadow: ${({ isOnMap }) => isOnMap ? '0px 0px 5px 0px rgba(0,0,0,0.2)' : 'none'};
  border-radius: 999px;
  padding: 4px 13px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.ms}) {
    padding: 4px 16px;
  }
`;

const ButtonActions = styled((p) => <ButtonFlat {...p} />)`
  padding: 0;
  min-height: 33px;
  min-width: 33px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding: 0;
  }
`;

const FilterButton = styled((p) => <ButtonFlat {...p} />)`
  box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.2);
  padding: 4px 13px;
  border: none;
  border-radius: 999px;
  background: ${palette('primary', 1)};
  color: white;
  font-family: ${({ theme }) => theme.fonts.title};
  text-transform: uppercase;
  font-weight: 300;
  min-height: 33px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.ms}) {
    min-width: 33px;
    padding: 4px 16px;
  }
  &:hover {
    box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.2);
    background: ${palette('primary', 0)};
    color: white;
  }
`;

// const STATE_INITIAL = {
//   activeOption: null,
//   showTypes: false,
// };

export class EntityListHeader extends React.Component { // eslint-disable-line react/prefer-stateless-function
  // constructor() {
  //   super();
  //   this.state = STATE_INITIAL;
  //   // this.typeWrapperRef = React.createRef();
  //   // this.typeButtonRef = React.createRef();
  //   // this.handleClickOutside = this.handleClickOutside.bind(this);
  // }
  //
  // UNSAFE_componentWillMount() {
  //   this.setState(STATE_INITIAL);
  // }

  // componentDidMount() {
  //   window.addEventListener('resize', this.resize);
  //   window.addEventListener('mousedown', this.handleClickOutside);
  // }
  //
  // UNSAFE_componentWillReceiveProps(nextProps) {
  //   if (
  //     this.props.showFilters !== nextProps.showFilters
  //     || this.props.showEditOptions !== nextProps.showEditOptions
  //   ) {
  //     // close and reset option panel
  //     this.setState({ activeOption: null });
  //   }
  // }

  shouldComponentUpdate(nextProps, nextState) {
    // TODO consider targeting specific query params, eg where, without, cat, catx but also actors, etc
    if (nextProps.listUpdating && isEqual(this.state, nextState)) {
      return false;
    }
    if (this.props.listUpdating && !nextProps.listUpdating) {
      return true;
    }
    return this.props.locationQuery !== nextProps.locationQuery
      || this.props.entityIdsSelected !== nextProps.entityIdsSelected
      || this.props.showFilters !== nextProps.showFilters
      || this.props.showEditOptions !== nextProps.showEditOptions
      || this.props.taxonomies !== nextProps.taxonomies
      || this.props.connections !== nextProps.connections
      || !isEqual(this.state, nextState);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('mousedown', this.handleClickOutside);
  }

  // handleClickOutside = (evt) => {
  //   const wrapperContains = this.typeWrapperRef
  //     && this.typeWrapperRef.current
  //     && this.typeWrapperRef.current.contains(evt.target);
  //   const buttonContains = this.typeButtonRef
  //     && this.typeButtonRef.current
  //     && this.typeButtonRef.current.contains(evt.target);
  //   if (!wrapperContains && !buttonContains) {
  //     this.setState({ showTypes: false });
  //   }
  // };

  // getFormButtons = (activeOption, intl) => {
  //   const { onCreateOption } = this.props;
  //   return [
  //     activeOption.create
  //       ? {
  //         type: 'addFlat',
  //         position: 'left',
  //         onClick: () => onCreateOption(activeOption.create),
  //       }
  //       : null,
  //     {
  //       type: 'simple',
  //       title: intl.formatMessage(appMessages.buttons.cancel),
  //       onClick: this.onHideForm,
  //     },
  //     {
  //       type: 'primary',
  //       title: intl.formatMessage(appMessages.buttons.assign),
  //       submit: true,
  //     },
  //   ];
  // };
  //
  // getFilterFormButtons = () => {
  //   const { intl } = this.context;
  //   return [
  //     {
  //       type: 'simple',
  //       title: intl.formatMessage(appMessages.buttons.cancel),
  //       onClick: this.onHideForm,
  //     },
  //     {
  //       type: 'primary',
  //       title: intl.formatMessage(appMessages.buttons.updateFilter),
  //       submit: true,
  //     },
  //   ];
  // };

  // resize = () => {
  //   // reset
  //   this.setState(STATE_INITIAL);
  //   this.forceUpdate();
  // };

  render() {
    const {
      entities,
      allEntities,
      entityIdsSelected,
      onShowFilters,
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
      showFilters,
      showEditOptions,
      canEdit,
      dataReady,
      onUpdateQuery,
      onUpdate,
      onUpdateFilters,
      connections,
      includeActorMembers,
      includeActorChildren,
      includeMembersWhenFiltering,
      filteringOptions,
      headerActions,
      viewOptions,
      isPrintView,
      isOnMap,
      intl,
      onCreateOption,
    } = this.props;
    const hasSelected = dataReady && canEdit && entityIdsSelected && entityIdsSelected.size > 0;
    const entitiesSelected = hasSelected
      ? entities.filter((entity) => entityIdsSelected.includes(entity.get('id')))
      : null;

    const managerActions = canEdit && headerActions && headerActions.filter(
      (action) => action.isMember
    );
    const normalActions = headerActions && headerActions.filter(
      (action) => !action.isMember
    );

    return (
      <ResponsiveContext.Consumer>
        {(size) => (
          <Styled isPrint={isPrintView}>
            <TheHeader
              margin={{ bottom: 'xsmall' }}
              pad={{ top: 'ms' }}
              align="center"
              justify="between"
            >
              <HeaderSection>
                <PrintHide>
                  {viewOptions && viewOptions.length > 1
                    && (
                      <EntityListViewOptions
                        options={viewOptions}
                        isPrintView={isPrintView}
                        isOnMap={isOnMap}
                      />
                    )}
                </PrintHide>
              </HeaderSection>
              <Box direction="row" gap="small">
                {(normalActions || managerActions) && (
                  <HeaderSection>
                    <HeaderActionsWrapper
                      isOnMap={isOnMap}
                      gap={isMinSize(size, 'ms') ? 'xsmall' : 'xxsmall'}
                    >
                      {normalActions && normalActions.map(
                        (action, i) => {
                          if (action.type === 'bookmarker') {
                            return (
                              <Box key={i}>
                                <Bookmarker
                                  viewTitle={action.title}
                                  type={action.entityType}
                                />
                              </Box>
                            );
                          }
                          if (action.type === 'icon') {
                            return (
                              <Box key={i}>
                                <ButtonActions
                                  onClick={action.onClick && (() => action.onClick())}
                                  title={action.title}
                                  alt={action.title}
                                  subtle
                                >
                                  <Icon name={action.icon} title={action.title} />
                                </ButtonActions>
                              </Box>
                            );
                          }
                          return null;
                        }
                      )}
                      {managerActions && managerActions
                        .filter(
                          (action) => action.icon === 'import'
                        ).map(
                          (action, i) => (
                            <Box key={i + 1000}>
                              <ButtonActions
                                onClick={action.onClick && (() => action.onClick())}
                                title={action.title}
                                alt={action.title}
                                subtle
                              >
                                <Multiple size="small" style={{ stroke: 'currentColor' }} />
                              </ButtonActions>
                            </Box>
                          )
                        )}
                    </HeaderActionsWrapper>
                  </HeaderSection>
                )}
                {dataReady && isMinSize(size, 'small') && (
                  <HeaderSection align="center">
                    <FilterButton
                      onClick={onShowFilters}
                    >
                      <Box direction="row" gap="xsmall" align="center" responsive={false}>
                        {isMinSize(size, 'medium') && (
                          <Text style={{ marginTop: '-3px' }}>
                            {intl.formatMessage(messages.listOptions.showFilter)}
                          </Text>
                        )}
                        <Box style={{ marginTop: '2px' }}>
                          <Icon name="filter" size="30px" text />
                        </Box>
                      </Box>
                    </FilterButton>
                  </HeaderSection>
                )}
              </Box>
            </TheHeader>
            {dataReady && (showFilters || showEditOptions) && (
              <EntityListSidebar
                showFilters={showFilters}
                showEditOptions={showEditOptions}
                allEntities={allEntities}
                entitiesSelected={entitiesSelected}
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
                taxonomies={taxonomies}
                connectedTaxonomies={connectedTaxonomies}
                actortypes={actortypes}
                filterActortypes={filterActortypes}
                actiontypes={actiontypes}
                resourcetypes={resourcetypes}
                membertypes={membertypes}
                filterAssociationtypes={filterAssociationtypes}
                associationtypes={associationtypes}
                currentFilters={currentFilters}
                onHideFilters={onHideFilters}
                onHideEditOptions={onHideEditOptions}
                onCreateOption={onCreateOption}
              />
            )}
          </Styled>
        )}
      </ResponsiveContext.Consumer>
    );
  }
}
EntityListHeader.propTypes = {
  entities: PropTypes.instanceOf(List),
  allEntities: PropTypes.instanceOf(List),
  entityIdsSelected: PropTypes.instanceOf(List),
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
  hasUserRole: PropTypes.object,
  config: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
  onUpdateFilters: PropTypes.func.isRequired,
  onCreateOption: PropTypes.func.isRequired,
  listUpdating: PropTypes.bool,
  currentFilters: PropTypes.array,
  onUpdateQuery: PropTypes.func.isRequired,
  onShowFilters: PropTypes.func,
  onHideFilters: PropTypes.func,
  showFilters: PropTypes.bool,
  showEditOptions: PropTypes.bool,
  onHideEditOptions: PropTypes.func,
  canEdit: PropTypes.bool,
  dataReady: PropTypes.bool,
  isAdmin: PropTypes.bool,
  includeMembersWhenFiltering: PropTypes.bool,
  includeActorMembers: PropTypes.bool,
  includeActorChildren: PropTypes.bool,
  filteringOptions: PropTypes.array,
  isPrintView: PropTypes.bool,
  isOnMap: PropTypes.bool,
  typeId: PropTypes.string,
  headerActions: PropTypes.array,
  viewOptions: PropTypes.array,
  intl: intlShape.isRequired,
};

EntityListHeader.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default injectIntl(EntityListHeader);
