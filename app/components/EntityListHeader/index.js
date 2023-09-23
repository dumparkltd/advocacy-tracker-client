/*
 *
 * EntityListHeader
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled, { withTheme } from 'styled-components';
import { Map, List } from 'immutable';
import { palette } from 'styled-theme';
import {
  Box, Text, Button, ResponsiveContext,
} from 'grommet';
import { Add, Multiple } from 'grommet-icons';

import { isEqual } from 'lodash/lang';
import { truncateText } from 'utils/string';
import { isMinSize } from 'utils/responsive';

import { TEXT_TRUNCATE } from 'themes/config';
import { FILTER_FORM_MODEL, EDIT_FORM_MODEL } from 'containers/EntityListForm/constants';

import ButtonFlatIconOnly from 'components/buttons/ButtonFlatIconOnly';
import Bookmarker from 'containers/Bookmarker';

import EntityListForm from 'containers/EntityListForm';
import appMessages from 'containers/App/messages';
import PrintHide from 'components/styled/PrintHide';
import TagList from 'components/TagList';
import Icon from 'components/Icon';
import ButtonOld from 'components/buttons/Button';

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
  height: ${({ theme, headerStyle }) => {
    if (headerStyle === 'simple') {
      return 40;
    }
    return theme.sizes.headerList.banner.height;
  }}px;
  padding: 0 3px;
  background-color: ${palette('primary', 3)};
  box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.2);
  position: relative;
  z-index: 96;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    padding: 0 15px 0 75px;
  }
`;
const HeaderSection = styled((p) => <Box direction="row" {...p} />)`
  position: relative;
  border-right: 1px solid ${({ noBorder }) => noBorder ? 'transparent' : palette('light', 4)};
  height: 100%;
  padding: 2px 5px;
  flex: ${({ grow }) => grow ? '1' : '0'} ${({ shrink = '1' }) => shrink ? '1' : '0'} auto;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    padding: 2px 10px;
  }
`;
const HeaderSectionType = styled((p) => <Box direction="column" {...p} />)`
  position: relative;
  border-right: 1px solid ${({ noBorder }) => noBorder ? 'transparent' : palette('light', 4)};
  width: 240px;
  padding: 18px 5px 2px;
  height: 100%;
`;
const SelectType = styled(ButtonOld)`
  display: none;
  text-align: left;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    display: block;
    padding-left: 2px;
    padding-right: 2px;
    max-width: 100%;
  }
`;

const ButtonOptions = styled((p) => <Button plain {...p} />)`
  color: ${palette('buttonFlat', 1)};
`;

const Label = styled.div`
  font-size: ${({ theme }) => theme.sizes.text.smallMobile};
  color: ${palette('text', 1)};
  padding-left: 2px;
  padding-right: 2px;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    font-size: ${({ theme }) => theme.sizes.text.smaller};
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.print.smaller};
  }
`;
const LinkTitle = styled.div`
  font-size: ${({ theme }) => theme.sizes.text.small};
  font-weight: bold;
  color: ${(props) => props.active ? palette('headerNavMainItem', 1) : 'inherit'};
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    font-size: ${({ theme }) => theme.sizes.text.default};
  }
  @media print {
    font-size: ${({ theme }) => theme.sizes.print.default};
  }
`;

const TypeOptions = styled.div`
  display: none;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    position: absolute;
    top: 100%;
    left: 0;
    display: block;
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.large}) {
    min-width: 240px;
  }
  background: white;
  box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.2);
  margin-top: 3px;
  padding: 5px 0;
`;
const TypeOption = styled(ButtonOld)`
  display: block;
  width: 100%;
  text-align: left;
  &:hover {
    color:${palette('headerNavMainItemHover', 0)};
  }
  color: ${(props) => props.active ? palette('headerNavMainItem', 1) : 'inherit'};
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
      || this.props.typeOptions !== nextProps.typeOptions
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

  getFormButtons = (activeOption) => {
    const { intl } = this.context;
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
      parentActortypes,
      actiontypes,
      resourcetypes,
      targettypes,
      actiontypesForTarget,
      membertypes,
      parentAssociationtypes,
      associationtypes,
      currentFilters,
      onShowFilters,
      onHideFilters,
      showFilters,
      showEditOptions,
      onHideEditOptions,
      canEdit,
      onSelectType,
      typeOptions,
      dataReady,
      typeId,
      onUpdateQuery,
      includeMembers,
      onSetFilterMemberOption,
      headerActions,
      isAdmin,
      onClearFilters,
      isPrintView,
      headerStyle,
    } = this.props;
    const { intl } = this.context;
    const { activeOption } = this.state;
    const hasSelected = dataReady && canEdit && entityIdsSelected && entityIdsSelected.size > 0;
    const entitiesSelected = hasSelected
      && entities.filter((entity) => entityIdsSelected.includes(entity.get('id')));
    const formModel = showFilters ? FILTER_FORM_MODEL : EDIT_FORM_MODEL;

    let panelGroups = null;

    let formOptions = null;
    const hasMemberOption = (config.hasMemberOption && config.hasMemberOption.indexOf(typeId) > -1);

    if (dataReady && showFilters) {
      panelGroups = makeFilterGroups({
        config,
        taxonomies,
        connectedTaxonomies,
        hasUserRole,
        actortypes: (hasMemberOption && actortypes && parentActortypes)
          ? actortypes.merge(parentActortypes)
          : actortypes,
        resourcetypes,
        actiontypes,
        targettypes,
        actiontypesForTarget,
        membertypes,
        associationtypes: (hasMemberOption && associationtypes && parentAssociationtypes)
          ? associationtypes.merge(parentAssociationtypes)
          : associationtypes,
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
        includeMembers,
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
          includeMembers,
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
        targettypes,
        resourcetypes,
        actiontypesForTarget,
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
    const hasTypeOptions = typeOptions && typeOptions.length > 0;
    const currentTypeOption = hasTypeOptions && typeOptions.find((option) => option.active);

    const managerActions = canEdit && headerActions && headerActions.filter(
      (action) => action.isMember
    );
    const normalActions = headerActions && headerActions.filter(
      (action) => !action.isMember
    );
    return (
      <ResponsiveContext.Consumer>
        {(size) => {
          const iconSize = isMinSize(size, 'medium') ? 'xxsmall' : 'small';
          return (
            <Styled isPrint={isPrintView}>
              <TheHeader align="center" headerStyle={headerStyle}>
                {config.types && hasTypeOptions && (
                  <HeaderSection noBorder>
                    <ButtonFlatIconOnly onClick={() => onSelectType()}>
                      <Icon name="arrowLeft" size="2em" />
                    </ButtonFlatIconOnly>
                  </HeaderSection>
                )}
                {currentTypeOption && !isMinSize(size, 'large') && (
                  <Text>
                    {truncateText(
                      currentTypeOption.label,
                      TEXT_TRUNCATE.TYPE_SELECT,
                      false,
                    )}
                  </Text>
                )}
                {config.types && hasTypeOptions && isMinSize(size, 'large') && (
                  <HeaderSectionType justify="start">
                    {config.types && (
                      <Label>
                        <FormattedMessage
                          {...messages.selectType}
                          values={{
                            types: intl.formatMessage(appMessages[config.types].single),
                          }}
                        />
                      </Label>
                    )}
                    {currentTypeOption && (
                      <SelectType
                        as="button"
                        ref={this.typeButtonRef}
                        onClick={(evt) => this.state.showTypes
                          ? this.onHideTypes(evt)
                          : this.onShowTypes(evt)
                        }
                      >
                        <LinkTitle active>
                          {truncateText(
                            currentTypeOption.label,
                            TEXT_TRUNCATE.TYPE_SELECT,
                            false,
                          )}
                          {!this.state.showTypes && (
                            <Icon name="dropdownOpen" text textRight size="1em" />
                          )}
                          {this.state.showTypes && (
                            <Icon name="dropdownClose" text textRight size="1em" />
                          )}
                        </LinkTitle>
                      </SelectType>
                    )}
                    {this.state.showTypes && typeOptions && (
                      <PrintHide>
                        <TypeOptions ref={this.typeWrapperRef}>
                          {typeOptions.map((option) => (
                            <TypeOption
                              key={option.value}
                              active={option.active}
                              onClick={() => {
                                this.onHideTypes();
                                onSelectType(option.value);
                              }}
                            >
                              {option.label}
                            </TypeOption>
                          ))}
                        </TypeOptions>
                      </PrintHide>
                    )}
                  </HeaderSectionType>
                )}
                <HeaderSection
                  grow
                  align="center"
                  gap="medium"
                  justify="start"
                  overflow={{ horizontal: 'auto' }}
                >
                  {dataReady && isMinSize(size, 'large') && (
                    <TagList
                      filters={currentFilters}
                      onClear={onClearFilters}
                      groupDropdownThreshold={isMinSize(size, 'xlarge') ? 3 : 2}
                    />
                  )}
                </HeaderSection>
                {dataReady && isMinSize(size, 'small') && (
                  <HeaderSection align="center">
                    <ButtonOptions
                      onClick={onShowFilters}
                      label={(
                        <Box direction="row" gap="small" align="center">
                          <Box>{<Icon name="filter" text />}</Box>
                          {isMinSize(size, 'medium') && (
                            <Text>{intl.formatMessage(messages.listOptions.showFilter)}</Text>
                          )}
                        </Box>
                      )}
                    />
                  </HeaderSection>
                )}
                {normalActions && (
                  <HeaderSection noBorder={!canEdit}>
                    <Box
                      fill="vertical"
                      direction="row"
                      align="center"
                      pad={{ vertical: 'xsmall' }}
                    >
                      {normalActions.map(
                        (action, i) => {
                          if (action.type === 'bookmarker') {
                            return (
                              <Box key={i}>
                                <Bookmarker viewTitle={action.title} type={action.entityType} />
                              </Box>
                            );
                          }
                          if (action.type === 'icon') {
                            return (
                              <Box key={i}>
                                <ButtonFlatIconOnly
                                  onClick={action.onClick && (() => action.onClick())}
                                  title={action.title}
                                  subtle
                                >
                                  <Icon name={action.icon} />
                                </ButtonFlatIconOnly>
                              </Box>
                            );
                          }
                          return null;
                        }
                      )}
                    </Box>
                  </HeaderSection>
                )}
                {isMinSize(size, 'small') && canEdit && managerActions && managerActions.length > 0 && (
                  <HeaderSection noBorder>
                    <Box
                      fill="vertical"
                      pad={{ top: 'xsmall', bottom: 'xxsmall' }}
                      align={isMinSize(size, 'medium') ? 'start' : 'center'}
                      justify="center"
                      gap={isMinSize(size, 'medium') ? 'xsmall' : 'small'}
                      direction={isMinSize(size, 'medium') ? 'column' : 'row'}
                    >
                      {managerActions && managerActions.map(
                        (action, i) => {
                          if (action.icon === 'add') {
                            return (
                              <ButtonOptions
                                key={i}
                                onClick={action.onClick}
                                label={(
                                  <Box direction="row" gap="small" align="center">
                                    <Box>
                                      <Add color="dark-3" size={iconSize} />
                                    </Box>
                                    {isMinSize(size, 'medium') && (
                                      <Text color="dark-3" size="small">{action.title}</Text>
                                    )}
                                  </Box>
                                )}
                              />
                            );
                          }
                          if (isMinSize(size, 'medium')) {
                            if (action.icon === 'import' && isMinSize(size, 'medium')) {
                              return (
                                <ButtonOptions
                                  key={i}
                                  onClick={action.onClick}
                                  label={(
                                    <Box direction="row" gap="small" align="center">
                                      <Box>
                                        <Multiple color="dark-3" size={iconSize} />
                                      </Box>
                                      <Text color="dark-3" size="small">{action.title}</Text>
                                    </Box>
                                  )}
                                />
                              );
                            }
                            return (
                              <ButtonOptions
                                key={i}
                                onClick={action.onClick}
                                label={(
                                  <Box direction="row" gap="small">
                                    <Text color="dark-3" size="small">{action.title}</Text>
                                  </Box>
                                )}
                              />
                            );
                          }
                          return null;
                        }
                      )}
                    </Box>
                  </HeaderSection>
                )}
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
                  memberOption={hasMemberOption
                    ? {
                      key: 'filter-member-option',
                      active: !!includeMembers,
                      label: 'Also consider members when filtering by region or group',
                      info: 'When enabled and when filtering by region or group, the list will also include activities associated with any members of those regions or groups',
                      onClick: () => {
                        this.onHideForm();
                        onSetFilterMemberOption(!includeMembers);
                      },
                    }
                    : null
                  }
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
                    ? this.getFormButtons(activeOption)
                    : this.getFilterFormButtons()
                  }
                  onCancel={this.onHideForm}
                  showNew={showEditOptions}
                  showCancelButton={showFilters}
                  onSubmit={showEditOptions
                    ? (associations) => {
                      // close and reset option panel
                      this.setState({ activeOption: null });
                      onUpdate(associations, activeOption);
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
          );
        }}
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
  parentActortypes: PropTypes.instanceOf(Map),
  resourcetypes: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  targettypes: PropTypes.instanceOf(Map),
  membertypes: PropTypes.instanceOf(Map),
  parentAssociationtypes: PropTypes.instanceOf(Map),
  associationtypes: PropTypes.instanceOf(Map),
  actiontypesForTarget: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  connectedTaxonomies: PropTypes.instanceOf(Map),
  locationQuery: PropTypes.instanceOf(Map),
  hasUserRole: PropTypes.object,
  config: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
  onUpdateFilters: PropTypes.func.isRequired,
  onCreateOption: PropTypes.func.isRequired,
  listUpdating: PropTypes.bool,
  theme: PropTypes.object,
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
  includeMembers: PropTypes.bool,
  isPrintView: PropTypes.bool,
  typeOptions: PropTypes.array,
  onSelectType: PropTypes.func,
  onSetFilterMemberOption: PropTypes.func,
  onClearFilters: PropTypes.func,
  typeId: PropTypes.string,
  headerStyle: PropTypes.string,
  headerActions: PropTypes.array,
};

EntityListHeader.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default withTheme(EntityListHeader);
