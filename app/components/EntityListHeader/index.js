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
  Box, Text, Button, ResponsiveContext,
} from 'grommet';
import { Multiple } from 'grommet-icons';

import { isEqual } from 'lodash/lang';
import { isMinSize } from 'utils/responsive';

import { FILTER_FORM_MODEL, EDIT_FORM_MODEL } from 'containers/EntityListForm/constants';

import ButtonFlatIconOnly from 'components/buttons/ButtonFlatIconOnly';
import Bookmarker from 'containers/Bookmarker';

import EntityListViewOptions from 'components/EntityListViewOptions';
import EntityListForm from 'containers/EntityListForm';
import appMessages from 'containers/App/messages';
import PrintHide from 'components/styled/PrintHide';
import Icon from 'components/Icon';

import EntityListSidebar from './EntityListSidebar';

import { makeFilterGroups } from './utilFilterGroups';
import { makeEditGroups } from './utilEditGroups';
import {
  makeActiveFilterOptions,
  makeAnyWithoutFilterOptions,
} from './utilFilterOptions';
import { makeActiveEditOptions } from './utilEditOptions';

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
  flex: ${({ grow }) => grow ? '1' : '0'} ${({ shrink = '1' }) => shrink ? '1' : '0'} auto;
`;
const FilterButton = styled((p) => <Button {...p} />)`
  color: ${palette('buttonFlat', 1)};
  background: ${palette('primary', 1)};
  color: white;
  border-radius: 999px;
  box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.2);
  border: none;
  font-family: ${({ theme }) => theme.fonts.title};
  text-transform: uppercase;
  &:hover {
    box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.2);
    background: ${palette('primary', 0)};
  }
`;
const HeaderActionsWrapper = styled((p) => <Box {...p} />)`
  background: white;
  border-radius: 999px;
  box-shadow: ${({ isOnMap }) => isOnMap ? '0px 0px 5px 0px rgba(0,0,0,0.2)' : 'none'};
`;
const STATE_INITIAL = {
  activeOption: null,
  showTypes: false,
};

const getFilterConnectionsMsg = (intl, type) => type
  && messages.filterGroupLabel[`connections-${type}`]
  ? intl.formatMessage(messages.filterGroupLabel[`connections-${type}`])
  : intl.formatMessage(messages.filterGroupLabel.connections);

const getEditConnectionsMsg = (intl, type) => type
  && messages.editGroupLabel[`connections-${type}`]
  ? intl.formatMessage(messages.editGroupLabel[`connections-${type}`])
  : intl.formatMessage(messages.editGroupLabel.connections);


export class EntityListHeader extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.state = STATE_INITIAL;
    this.typeWrapperRef = React.createRef();
    this.typeButtonRef = React.createRef();
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  UNSAFE_componentWillMount() {
    this.setState(STATE_INITIAL);
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize);
    window.addEventListener('mousedown', this.handleClickOutside);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      this.props.showFilters !== nextProps.showFilters
      || this.props.showEditOptions !== nextProps.showEditOptions
    ) {
      // close and reset option panel
      this.setState({ activeOption: null });
    }
  }

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

  handleClickOutside = (evt) => {
    const wrapperContains = this.typeWrapperRef
      && this.typeWrapperRef.current
      && this.typeWrapperRef.current.contains(evt.target);
    const buttonContains = this.typeButtonRef
      && this.typeButtonRef.current
      && this.typeButtonRef.current.contains(evt.target);
    if (!wrapperContains && !buttonContains) {
      this.setState({ showTypes: false });
    }
  };

  onSetActiveOption = (option) => {
    this.setState({ activeOption: option });
  };

  // onShowForm = (option) => {
  //   this.setState({ activeOption: option.active ? null : option });
  // };

  onHideForm = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({ activeOption: null });
  };

  onShowTypes = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({ showTypes: true });
  };

  onHideTypes = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({ showTypes: false });
  };

  getFormButtons = (activeOption, intl) => {
    const { onCreateOption } = this.props;
    return [
      activeOption.create
        ? {
          type: 'addFlat',
          position: 'left',
          onClick: () => onCreateOption(activeOption.create),
        }
        : null,
      {
        type: 'simple',
        title: intl.formatMessage(appMessages.buttons.cancel),
        onClick: this.onHideForm,
      },
      {
        type: 'primary',
        title: intl.formatMessage(appMessages.buttons.assign),
        submit: true,
      },
    ];
  };

  getFilterFormButtons = () => {
    const { intl } = this.context;
    return [
      {
        type: 'simple',
        title: intl.formatMessage(appMessages.buttons.cancel),
        onClick: this.onHideForm,
      },
      {
        type: 'primary',
        title: intl.formatMessage(appMessages.buttons.updateFilter),
        submit: true,
      },
    ];
  };

  resize = () => {
    // reset
    this.setState(STATE_INITIAL);
    this.forceUpdate();
  };

  render() {
    const {
      config,
      onUpdate,
      onUpdateFilters,
      hasUserRole,
      entities,
      allEntities,
      locationQuery,
      taxonomies,
      connectedTaxonomies,
      connections,
      entityIdsSelected,
      actortypes,
      filterActortypes,
      actiontypes,
      resourcetypes,
      membertypes,
      filterAssociationtypes,
      associationtypes,
      currentFilters,
      onShowFilters,
      onHideFilters,
      showFilters,
      showEditOptions,
      onHideEditOptions,
      canEdit,
      dataReady,
      typeId,
      onUpdateQuery,
      includeMembersWhenFiltering,
      includeActorMembers,
      includeActorChildren,
      filteringOptions,
      headerActions,
      viewOptions,
      isAdmin,
      isPrintView,
      isOnMap,
      intl,
    } = this.props;
    const { activeOption } = this.state;
    const hasSelected = dataReady && canEdit && entityIdsSelected && entityIdsSelected.size > 0;
    const entitiesSelected = hasSelected
      && entities.filter((entity) => entityIdsSelected.includes(entity.get('id')));
    const formModel = showFilters ? FILTER_FORM_MODEL : EDIT_FORM_MODEL;

    let panelGroups = null;
    let formOptions = null;
    if (dataReady && showFilters) {
      panelGroups = makeFilterGroups({
        config,
        taxonomies,
        connectedTaxonomies,
        hasUserRole,
        actortypes: filterActortypes || actortypes,
        resourcetypes,
        actiontypes,
        membertypes,
        associationtypes: filterAssociationtypes || associationtypes,
        activeFilterOption: activeOption,
        currentFilters,
        typeId,
        intl,
        locationQuery,
        messages: {
          attributes: intl.formatMessage(messages.filterGroupLabel.attributes),
          taxonomyGroup: intl.formatMessage(messages.filterGroupLabel.taxonomies),
          connections: (type) => getFilterConnectionsMsg(intl, type),
          connectedTaxonomies: intl.formatMessage(messages.filterGroupLabel.connectedTaxonomies),
          taxonomies: (taxId) => this.context.intl.formatMessage(appMessages.entities.taxonomies[taxId].plural),
        },
        includeMembers: includeMembersWhenFiltering,
      });
      panelGroups = Object.keys(panelGroups).reduce(
        (memo, groupId) => {
          const group = panelGroups[groupId];
          if (group.includeAnyWithout && group.options && group.options.length > 0) {
            const allAnyOptions = makeAnyWithoutFilterOptions({
              config,
              locationQuery,
              activeFilterOption: {
                group: groupId,
              },
              intl,
              messages: {
                titlePrefix: intl.formatMessage(messages.filterFormTitlePrefix),
                without: intl.formatMessage(messages.filterFormWithoutPrefix),
                any: intl.formatMessage(messages.filterFormAnyPrefix),
                connections: (type) => getFilterConnectionsMsg(intl, type),
              },
            });
            return {
              ...memo,
              [groupId]: {
                ...group,
                optionsGeneral: allAnyOptions,
              },
            };
          }
          return {
            ...memo,
            [groupId]: group,
          };
        },
        {},
      );
      if (activeOption) {
        formOptions = makeActiveFilterOptions({
          entities: allEntities,
          config,
          locationQuery,
          taxonomies,
          connections,
          // actortypes,
          // actiontypes,
          connectedTaxonomies,
          activeFilterOption: activeOption,
          intl,
          typeId,
          isAdmin,
          messages: {
            titlePrefix: intl.formatMessage(messages.filterFormTitlePrefix),
            without: intl.formatMessage(messages.filterFormWithoutPrefix),
            any: intl.formatMessage(messages.filterFormAnyPrefix),
          },
          includeMembers: includeMembersWhenFiltering,
          includeActorMembers,
          includeActorChildren,
        });
      }
    } else if (dataReady && showEditOptions && hasSelected) {
      panelGroups = makeEditGroups({
        config,
        taxonomies,
        connectedTaxonomies,
        activeEditOption: activeOption,
        hasUserRole,
        actortypes,
        actiontypes,
        resourcetypes,
        membertypes,
        associationtypes,
        typeId,
        isAdmin,
        messages: {
          attributes: intl.formatMessage(messages.editGroupLabel.attributes),
          taxonomyGroup: intl.formatMessage(messages.editGroupLabel.taxonomies),
          connections: (type) => getEditConnectionsMsg(intl, type),
          taxonomies: (taxId) => this.context.intl.formatMessage(appMessages.entities.taxonomies[taxId].plural),
        },
        // selectedActortypeIds: entitiesSelected.groupBy((e) => e.getIn(['attributes', 'actortype_id'])).keySeq(),
        // selectedActiontypeIds: entitiesSelected.groupBy((e) => e.getIn(['attributes', 'measuretype_id'])).keySeq(),
      });
      if (activeOption && connections) {
        formOptions = makeActiveEditOptions({
          isAdmin,
          entities: entitiesSelected,
          config,
          taxonomies,
          connections,
          connectedTaxonomies,
          activeEditOption: activeOption,
          intl,
          messages: {
            title: `${intl.formatMessage(messages.editFormTitlePrefix)} ${entitiesSelected.size} ${intl.formatMessage(messages.editFormTitlePostfix)}`,
          },
        });
      }
    }
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
              margin={{ top: 'xsmall', bottom: 'xsmall' }}
              pad={{ top: 'small' }}
              align="center"
              justify="between"
            >
              <HeaderSection align="start" justify="start">
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
                      fill="vertical"
                      direction="row"
                      align="center"
                      pad={{ vertical: 'xsmall', horizontal: 'small' }}
                      isOnMap={isOnMap}
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
                                <ButtonFlatIconOnly
                                  onClick={action.onClick && (() => action.onClick())}
                                  title={action.title}
                                  alt={action.title}
                                  subtle
                                >
                                  <Icon name={action.icon} title={action.title} />
                                </ButtonFlatIconOnly>
                              </Box>
                            );
                          }
                          return null;
                        }
                      )}
                      {managerActions && managerActions.map(
                        (action, i) => {
                          if (action.icon === 'import') {
                            return (
                              <Box key={i}>
                                <ButtonFlatIconOnly
                                  onClick={action.onClick && (() => action.onClick())}
                                  title={action.title}
                                  alt={action.title}
                                  subtle
                                >
                                  <Multiple size="small" color={palette('dark', 3)} />
                                </ButtonFlatIconOnly>
                              </Box>
                            );
                          }
                          return null;
                        }
                      )}
                    </HeaderActionsWrapper>
                  </HeaderSection>
                )}
                {dataReady && isMinSize(size, 'small') && (
                  <HeaderSection align="center">
                    <FilterButton
                      onClick={onShowFilters}
                      pad={{ vertical: 'xsmall', horizontal: 'medium' }}
                      label={(
                        <Box direction="row" gap="small" align="center">
                          {isMinSize(size, 'medium')
                            && (
                              <Text>
                                {intl.formatMessage(messages.listOptions.showFilter)}
                              </Text>
                            )}
                          <Box>
                            <Icon name="filter" text />
                          </Box>
                        </Box>
                      )}
                    />
                  </HeaderSection>
                )}
              </Box>
            </TheHeader>
            {showFilters && (
              <EntityListSidebar
                hasEntities={allEntities && allEntities.size > 0}
                panelGroups={panelGroups}
                onHideSidebar={onHideFilters}
                onHideOptions={this.onHideForm}
                setActiveOption={this.onSetActiveOption}
                onUpdateQuery={(args) => {
                  this.onHideForm();
                  onUpdateQuery(args);
                }}
                filteringOptions={filteringOptions}
              />
            )}
            {showEditOptions && (
              <EntityListSidebar
                isEditPanel
                hasEntities={entities && entities.size > 0}
                hasSelected={hasSelected}
                panelGroups={panelGroups}
                onHideSidebar={onHideEditOptions}
                setActiveOption={this.onSetActiveOption}
              />
            )}
            {activeOption && formOptions && (
              <EntityListForm
                model={formModel}
                activeOptionId={`${activeOption.group}-${activeOption.optionId}`}
                formOptions={formOptions}
                buttons={showEditOptions
                  ? this.getFormButtons(activeOption, intl)
                  : this.getFilterFormButtons()
                }
                onCancel={this.onHideForm}
                showNew={showEditOptions}
                showCancelButton={showFilters}
                onSubmit={showEditOptions
                  ? (associations) => {
                    // close and reset option panel
                    const connectPath = formOptions.path;
                    this.setState({ activeOption: null });
                    onUpdate(associations, { ...activeOption, path: connectPath });
                  }
                  : (filterOptions) => {
                    // close and reset option panel
                    this.setState({ activeOption: null });
                    onUpdateFilters(filterOptions && filterOptions.get('values'), activeOption);
                  }
                }
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
