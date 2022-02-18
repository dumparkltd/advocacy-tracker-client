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
import { Box, ResponsiveContext } from 'grommet';

import { isEqual } from 'lodash/lang';
import { truncateText } from 'utils/string';

import { TEXT_TRUNCATE } from 'themes/config';
import { FILTER_FORM_MODEL, EDIT_FORM_MODEL } from 'containers/EntityListForm/constants';

import Button from 'components/buttons/Button';
import ButtonFlatIconOnly from 'components/buttons/ButtonFlatIconOnly';
import ButtonFlatWithIcon from 'components/buttons/ButtonFlatWithIcon';

import EntityListForm from 'containers/EntityListForm';
import appMessages from 'containers/App/messages';
import PrintHide from 'components/styled/PrintHide';
import TagList from 'components/TagList';
import Icon from 'components/Icon';

import EntityListSidebar from './EntityListSidebar';

import { makeFilterGroups } from './filterGroupsFactory';
import { makeEditGroups } from './editGroupsFactory';
import { makeActiveFilterOptions } from './filterOptionsFactory';
import { makeActiveEditOptions } from './editOptionsFactory';

import messages from './messages';

const Styled = styled(PrintHide)``;

const TheHeader = styled((p) => <Box direction="row" {...p} />)`
  height: ${({ theme }) => theme.sizes.headerList.banner.height}px;
  padding: 0 15px;
  background-color: ${palette('primary', 3)};
  box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.2);
  position: relative;
  z-index: 96;
`;
const HeaderSection = styled((p) => <Box direction="row" {...p} />)`
  position: relative;
  border-right: 1px solid ${({ noBorder }) => noBorder ? 'transparent' : palette('light', 4)};
  padding: 2px 2px;
  height: 100%;
  flex: ${({ grow }) => grow ? '1' : '0'} ${({ shrink = '1' }) => shrink ? '1' : '0'} auto;
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
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
const SelectType = styled(Button)`
  display: none;
  text-align: left;
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    display: block;
    padding-left: 2px;
    padding-right: 2px;
    max-width: 100%;
  }
`;
const EntityListSearch = styled((p) => <Box direction="row" gap="medium" {...p} />)``;

const ButtonOptions = styled((p) => <ButtonFlatWithIcon iconRight iconSize="20px" small {...p} />)`
  position: relative;
  top: 3px;
  padding: 4px 8px;
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    padding: ${(props) => props.inForm ? '1em 1.2em' : '0.25em 1.25em'};
    padding: 5px 10px;
  }
`;

const Label = styled.div`
  font-size: ${(props) => props.theme.sizes.text.smallMobile};
  color: ${palette('text', 1)};
  padding-left: 2px;
  padding-right: 2px;
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    font-size: ${(props) => props.theme.sizes.text.smaller};
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.print.smaller};
  }
`;
const LinkTitle = styled.div`
  font-size: ${(props) => props.theme.sizes.text.small};
  font-weight: bold;
  color: ${(props) => props.active ? palette('headerNavMainItem', 1) : 'inherit'};
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    font-size: ${(props) => props.theme.sizes.text.default};
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.print.default};
  }
`;

const TypeOptions = styled(PrintHide)`
  display: none;
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    position: absolute;
    top: 100%;
    left: 0;
    display: block;
  }
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    min-width: 240px;
  }
  background: white;
  box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.2);
  margin-top: 3px;
  padding: 5px 0;
`;
const TypeOption = styled(Button)`
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
  }

  onSetActiveOption = (option) => {
    this.setState({ activeOption: option });
  };

  onShowForm = (option) => {
    this.setState({ activeOption: option.active ? null : option });
  };

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
          type: 'addFromMultiselect',
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

  resize = () => {
    // reset
    this.setState(STATE_INITIAL);
    this.forceUpdate();
  };

  render() {
    const {
      config,
      onUpdate,
      hasUserRole,
      entities,
      locationQuery,
      taxonomies,
      connectedTaxonomies,
      connections,
      entityIdsSelected,
      actortypes,
      actiontypes,
      resourcetypes,
      targettypes,
      actiontypesForTarget,
      membertypes,
      associationtypes,
      currentFilters,
      onClearFilters,
      onShowFilters,
      onHideFilters,
      showFilters,
      showEditOptions,
      onHideEditOptions,
      onShowEditOptions,
      canEdit,
      onSelectType,
      typeOptions,
      dataReady,
      typeId,
      isManager,
    } = this.props;

    const { intl } = this.context;
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
        actortypes,
        resourcetypes,
        actiontypes,
        targettypes,
        actiontypesForTarget,
        membertypes,
        associationtypes,
        activeFilterOption: activeOption,
        typeId,
        intl,
        messages: {
          attributes: intl.formatMessage(messages.filterGroupLabel.attributes),
          taxonomyGroup: intl.formatMessage(messages.filterGroupLabel.taxonomies),
          connections: (type) => getFilterConnectionsMsg(intl, type),
          // connectedTaxonomies: intl.formatMessage(messages.filterGroupLabel.connectedTaxonomies),
          taxonomies: (taxId) => this.context.intl.formatMessage(appMessages.entities.taxonomies[taxId].plural),
        },
      });
      if (activeOption) {
        formOptions = makeActiveFilterOptions({
          entities,
          config,
          locationQuery,
          taxonomies,
          connections,
          // actortypes,
          // actiontypes,
          connectedTaxonomies,
          activeFilterOption: activeOption,
          contextIntl: intl,
          typeId,
          isManager,
          messages: {
            titlePrefix: intl.formatMessage(messages.filterFormTitlePrefix),
            without: intl.formatMessage(messages.filterFormWithoutPrefix),
          },
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
          entities: entitiesSelected,
          config,
          taxonomies,
          connections,
          connectedTaxonomies,
          activeEditOption: activeOption,
          contextIntl: intl,
          messages: {
            title: `${intl.formatMessage(messages.editFormTitlePrefix)} ${entitiesSelected.size} ${intl.formatMessage(messages.editFormTitlePostfix)}`,
          },
        });
      }
    }
    const hasTypeOptions = typeOptions && typeOptions.length > 0;
    const currentTypeOption = hasTypeOptions && typeOptions.find((option) => option.active);

    return (
      <ResponsiveContext.Consumer>
        {(size) => (
          <Styled>
            <TheHeader align="center">
              {config.types && typeOptions && (
                <HeaderSection noBorder>
                  <ButtonFlatIconOnly onClick={() => onSelectType()}>
                    <Icon name="arrowLeft" size={size !== 'small' ? '2em' : '1.2em'} />
                  </ButtonFlatIconOnly>
                </HeaderSection>
              )}
              {config.types && typeOptions && size !== 'small' && (
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
                  {dataReady && (
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
                  )}
                </HeaderSectionType>
              )}
              <HeaderSection grow noBorder={!canEdit} align="center" gap="medium">
                <ButtonOptions
                  onClick={onShowFilters}
                  disabled={showFilters}
                  icon="filter"
                  title={intl.formatMessage(messages.listOptions.showFilter)}
                />
                {dataReady && (
                  <EntityListSearch>
                    <TagList
                      filters={currentFilters}
                      onClear={onClearFilters}
                    />
                  </EntityListSearch>
                )}
              </HeaderSection>
              {canEdit && size !== 'small' && (
                <HeaderSection noBorder>
                  <ButtonOptions
                    onClick={onShowEditOptions}
                    disabled={showEditOptions}
                    icon="edit"
                    title={intl.formatMessage(messages.listOptions.showEditOptions)}
                  />
                </HeaderSection>
              )}
            </TheHeader>
            {showFilters && (
              <EntityListSidebar
                hasEntities={entities && entities.size > 0}
                panelGroups={panelGroups}
                onHideSidebar={onHideFilters}
                setActiveOption={this.onSetActiveOption}
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
                  : null
                }
                onCancel={this.onHideForm}
                showCancelButton={showFilters}
                onSelect={() => {
                  if (showFilters) {
                    this.onHideForm();
                    onHideFilters();
                  }
                }}
                onSubmit={showEditOptions
                  ? (associations) => {
                  // close and reset option panel
                    this.setState({ activeOption: null });
                    onUpdate(associations, activeOption);
                  }
                  : null
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
  entityIdsSelected: PropTypes.instanceOf(List),
  taxonomies: PropTypes.instanceOf(Map),
  actortypes: PropTypes.instanceOf(Map),
  resourcetypes: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  targettypes: PropTypes.instanceOf(Map),
  membertypes: PropTypes.instanceOf(Map),
  associationtypes: PropTypes.instanceOf(Map),
  actiontypesForTarget: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  connectedTaxonomies: PropTypes.instanceOf(Map),
  locationQuery: PropTypes.instanceOf(Map),
  hasUserRole: PropTypes.object,
  config: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
  onCreateOption: PropTypes.func.isRequired,
  listUpdating: PropTypes.bool,
  theme: PropTypes.object,
  currentFilters: PropTypes.array,
  onClearFilters: PropTypes.func.isRequired,
  onShowFilters: PropTypes.func,
  onHideFilters: PropTypes.func,
  showFilters: PropTypes.bool,
  showEditOptions: PropTypes.bool,
  onHideEditOptions: PropTypes.func,
  onShowEditOptions: PropTypes.func,
  canEdit: PropTypes.bool,
  dataReady: PropTypes.bool,
  isManager: PropTypes.bool,
  typeOptions: PropTypes.array,
  onSelectType: PropTypes.func,
  typeId: PropTypes.string,
};

EntityListHeader.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default withTheme(EntityListHeader);
