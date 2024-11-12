/*
 *
 * EntityListSidebarGroups
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Box } from 'grommet';

import qe from 'utils/quasi-equals';

import EntityListSidebarGroupLabel from './EntityListSidebarGroupLabel';
import FilterOptionList from './FilterOptionList';
import FilterOptionCheckboxes from './FilterOptionCheckboxes';
import FilterOptionCheckbox from './FilterOptionCheckbox';

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

class EntityListSidebarGroups extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const {
      groups,
      onHideOptions,
      onUpdateQuery,
      onShowForm,
    } = this.props;
    return (
      <div>
        {groups && groups.entrySeq().map(([groupId, group]) => {
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
              <Group key={groupId} expanded={this.props.expanded[groupId]}>
                <EntityListSidebarGroupLabel
                  optionsActiveCount={group.get('optionsActiveCount')}
                  expanded={this.props.expanded[groupId]}
                  onToggle={(evt) => {
                    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
                    this.props.onToggleGroup(groupId, !this.props.expanded[groupId]);
                  }}
                >
                  {group.get('label')}
                </EntityListSidebarGroupLabel>
                {this.props.expanded[groupId] && (
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
                                  onShowForm={onShowForm}
                                  onHideOptions={onHideOptions}
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
    );
  }
}
EntityListSidebarGroups.propTypes = {
  groups: PropTypes.object,
  expanded: PropTypes.object,
  onShowForm: PropTypes.func.isRequired,
  onToggleGroup: PropTypes.func.isRequired,
  onHideOptions: PropTypes.func,
  onUpdateQuery: PropTypes.func,
};

EntityListSidebarGroups.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default EntityListSidebarGroups;
