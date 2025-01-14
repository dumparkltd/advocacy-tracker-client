/*
 *
 * EntityListSidebarFiltersClassic
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Box } from 'grommet';
import { fromJS, Map, List } from 'immutable';

import { injectIntl, intlShape } from 'react-intl';

import qe from 'utils/quasi-equals';

import { FILTER_FORM_MODEL, EDIT_FORM_MODEL } from 'containers/EntityListForm/constants';

import MapOption from 'containers/MapContainer/MapInfoOptions/MapOption';
import EntityListForm from 'containers/EntityListForm';
import appMessages from 'containers/App/messages';

import EntityListSidebarGroupLabel from './EntityListSidebarGroupLabel';
import FilterOptionList from './FilterOptionList';
import FilterOptionCheckboxes from './FilterOptionCheckboxes';
import FilterOptionCheckbox from './FilterOptionCheckbox';

import { makePanelFilterGroups } from './utilFilterGroups';
import { makeEditGroups } from './utilEditGroups';
import { makeActiveFilterOptions } from './utilFilterOptions';
import { makeActiveEditOptions } from './utilEditOptions';
import messages from './messages';

const Group = styled((p) => (
  <Box
    pad={{ vertical: 'small' }}
    {...p}
  />
))`
  border-top: 1px solid ${palette('light', 2)};
  &:last-child {
    border-bottom: 1px solid ${palette('light', 2)};
  }
`;
const Options = styled((p) => (
  <Box
    flex={{ shrink: 0 }}
    {...p}
  />
))`
  padding: 20px 8px;
`;


const makeFormOptions = ({
  showFilters,
  showEditOptions,
  allEntities,
  entitiesSelected,
  config,
  locationQuery,
  taxonomies,
  connections,
  connectedTaxonomies,
  activeOption,
  intl,
  // typeId,
  isAdmin,
  includeMembersWhenFiltering,
  includeActorMembers,
  includeActorChildren,
}) => {
  if (showFilters) {
    return makeActiveFilterOptions({
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
      // typeId,
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
  if (showEditOptions) {
    return makeActiveEditOptions({
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
  return null;
};
const getEditConnectionsMsg = (intl, type) => type
  && messages.editGroupLabel[`connections-${type}`]
  ? intl.formatMessage(messages.editGroupLabel[`connections-${type}`])
  : intl.formatMessage(messages.editGroupLabel.connections);

const getFilterConnectionsMsg = (intl, type) => type
  && messages.filterGroupLabel[`connections-${type}`]
  ? intl.formatMessage(messages.filterGroupLabel[`connections-${type}`])
  : intl.formatMessage(messages.filterGroupLabel.connections);

const STATE_INITIAL = {
  expandedGroups: {
    taxonomies: false,
    taxonomies_1: false,
    taxonomies_2: false,
    taxonomies_3: false,
    taxonomies_4: false,
    taxonomies_5: false,
    taxonomies_6: false,
    taxonomies_7: false,
    taxonomies_8: false,
    taxonomies_9: false,
    taxonomies_10: false,
    taxonomies_11: false,
    taxonomies_12: false,
    taxonomies_13: false,
    actors: false,
    actions: false,
    members: false,
    associations: false,
    indicators: false,
    users: false,
    resources: false,
    parents: false,
    attributes: false,
    activeOption: null,
  },
};
class EntityListSidebarFiltersClassic extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.state = STATE_INITIAL;
  }

  UNSAFE_componentWillMount() {
    this.setState(STATE_INITIAL);
  }

  onShowForm = (option) => this.onSetActiveOption(option.active ? null : option);

  onToggleGroup = (groupId, expanded) => {
    this.setState((prevState) => {
      const expandedGroups = { ...prevState.expandedGroups };
      expandedGroups[groupId] = expanded;
      return ({
        expandedGroups,
        activeOption: null,
      });
    });
  }

  onSetActiveOption = (option) => {
    this.setState({ activeOption: option });
  };

  onHideForm = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({ activeOption: null });
  };

  getFilterFormButtons = () => {
    const { intl } = this.props;
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

  getFormButtons = (activeOption) => {
    const { onCreateOption, intl } = this.props;
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


  render() {
    const {
      showFilters,
      onUpdateQuery,
      filteringOptions,
      intl,
      onUpdate,
      onUpdateFilters,
      showEditOptions,
      allEntities,
      entitiesSelected,
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
    } = this.props;
    const { activeOption } = this.state;
    const formModel = showFilters ? FILTER_FORM_MODEL : EDIT_FORM_MODEL;

    const formOptions = activeOption && makeFormOptions({
      showFilters,
      showEditOptions,
      allEntities,
      entitiesSelected,
      config,
      locationQuery,
      taxonomies,
      connections,
      connectedTaxonomies,
      activeOption,
      intl,
      // typeId,
      isAdmin,
      includeMembersWhenFiltering,
      includeActorMembers,
      includeActorChildren,
    });
    const groups = showFilters
      ? makePanelFilterGroups({
        config,
        taxonomies,
        connectedTaxonomies,
        hasUserRole,
        actortypes: filterActortypes || actortypes,
        resourcetypes,
        actiontypes,
        membertypes,
        filterAssociationtypes,
        associationtypes: filterAssociationtypes || associationtypes,
        activeOption,
        currentFilters,
        typeId,
        intl,
        locationQuery,
        includeMembersWhenFiltering,
        messages: {
          attributes: intl.formatMessage(messages.filterGroupLabel.attributes),
          taxonomyGroup: intl.formatMessage(messages.filterGroupLabel.taxonomies),
          connections: (type) => getFilterConnectionsMsg(intl, type),
          connectedTaxonomies: intl.formatMessage(messages.filterGroupLabel.connectedTaxonomies),
          taxonomies: (taxId) => intl.formatMessage(appMessages.entities.taxonomies[taxId].plural),
          titlePrefix: intl.formatMessage(messages.filterFormTitlePrefix),
          without: intl.formatMessage(messages.filterFormWithoutPrefix),
          any: intl.formatMessage(messages.filterFormAnyPrefix),
        },
      })
      : makeEditGroups({
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
          taxonomies: (taxId) => intl.formatMessage(appMessages.entities.taxonomies[taxId].plural),
          connections: (type) => getEditConnectionsMsg(intl, type),
        },
      });
    return (
      <>
        <div>
          {showFilters && filteringOptions && (
            <Options>
              {filteringOptions.map((option) => {
                const o = {
                  ...option,
                  onClick: () => {
                    this.onHideForm();
                    option.onClick();
                  },
                };
                return (
                  <Box margin={{ top: 'small' }} key={option.key}>
                    <MapOption option={o} type="members" />
                  </Box>
                );
              })}
            </Options>
          )}
          {groups && fromJS(groups).entrySeq().map(([groupId, group]) => {
            const groupOptions = group.get('options') && group.get('options').filter(
              (option) => option.get('id')
            ).sort(
              (a, b) => {
                if (a.get('memberType')) return 1;
                if (b.get('memberType')) return -1;
                return 0;
              }
            );
            const groupOptionsGeneral = group.get('optionsGeneral');
            if (
              (groupOptions && groupOptions.size > 0)
              || (groupOptionsGeneral && groupOptionsGeneral.size > 0)
            ) {
              return (
                <Group key={groupId} expanded={this.state.expandedGroups[groupId]}>
                  <EntityListSidebarGroupLabel
                    optionsActiveCount={group.get('optionsActiveCount')}
                    expanded={this.state.expandedGroups[groupId]}
                    onToggle={(evt) => {
                      if (evt !== undefined && evt.preventDefault) evt.preventDefault();
                      this.onToggleGroup(groupId, !this.state.expandedGroups[groupId]);
                    }}
                    label={group.get('label')}
                  />
                  {this.state.expandedGroups[groupId] && (
                    <Box margin={{ top: 'small', bottom: 'medium' }} gap="small">
                      {groupOptionsGeneral && (
                        <Box gap="xsmall">
                          {groupOptionsGeneral && groupOptionsGeneral.map(
                            (option, i) => (
                              <Box key={i}>
                                {option.get('filterUI') && qe(option.get('filterUI'), 'checkbox') && (
                                  <FilterOptionCheckbox
                                    option={option}
                                    onUpdateQuery={onUpdateQuery}
                                  />
                                )}
                              </Box>
                            )
                          )}
                        </Box>
                      )}
                      {groupOptions && (
                        <Box>
                          {groupOptions && groupOptions.map(
                            (option, i) => (
                              <Box key={i} margin={{ top: 'small' }}>
                                {option.get('filterUI') && qe(option.get('filterUI'), 'checkboxes') && (
                                  <FilterOptionCheckboxes
                                    option={option}
                                    onUpdateQuery={onUpdateQuery}
                                  />
                                )}
                                {(!option.get('filterUI') || qe(option.get('filterUI'), 'list')) && (
                                  <FilterOptionList
                                    option={option}
                                    group={group}
                                    onShowForm={this.onShowForm}
                                    onHideOptions={this.onHideForm}
                                    onUpdateQuery={onUpdateQuery}
                                  />
                                )}
                              </Box>
                            )
                          )}
                        </Box>
                      )}
                    </Box>
                  )}
                </Group>
              );
            }
            return null;
          })}
        </div>
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
      </>
    );
  }
}
EntityListSidebarFiltersClassic.propTypes = {
  allEntities: PropTypes.instanceOf(List),
  entitiesSelected: PropTypes.instanceOf(List),
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
  onUpdate: PropTypes.func,
  onUpdateFilters: PropTypes.func,
  onCreateOption: PropTypes.func,
  config: PropTypes.object,
  hasUserRole: PropTypes.object,
  filteringOptions: PropTypes.array,
  currentFilters: PropTypes.array,
  typeId: PropTypes.string,
  showFilters: PropTypes.bool,
  showEditOptions: PropTypes.bool,
  isAdmin: PropTypes.bool,
  includeMembersWhenFiltering: PropTypes.bool,
  includeActorMembers: PropTypes.bool,
  includeActorChildren: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(EntityListSidebarFiltersClassic);
