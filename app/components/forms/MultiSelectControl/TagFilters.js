import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { fromJS } from 'immutable';

import Icon from 'components/Icon';
import Button from 'components/buttons/Button';
import OptionList from './OptionList';

import { sortOptions } from './utils';

const Styled = styled.div`
  background-color: ${palette('light', 0)};
  padding: 0 0.25em 0.5em;
  position: relative;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding: 0 0.5em 0.5em;
  }
`;

// padding: 0.75em 2em;
const Group = styled(Button)`
  min-height: 28px;
  padding: 0 0.5em;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding: 0 0.5em;
  }
`;

const GroupWrapper = styled.span`
  display: inline-block;
`;
const Dropdown = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 2;
  background-color: ${palette('background', 0)};
  box-shadow: 0 8px 8px 0 rgba(0,0,0,0.2);
  overflow-y: auto;
  max-height: 200px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    max-height: 320px;
  }
`;
// box-shadow: 0px 0px 8px 0px rgba(0,0,0,0.2);

const Label = styled.div`
  display: inline-block;
  vertical-align: middle;
  position: relative;
  top: -2px;
  font-size: 0.9em;
  font-weight: 500;
  @media print {
    font-size: ${(props) => props.theme.sizes.print.small};
  }
`;

class TagFilters extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      active: null,
    };
  }

  toggleGroup = (groupId) => {
    this.setState(
      (prevState) => ({
        active: prevState.active === groupId
          ? null
          : groupId,
      })
    );
  };

  prepareOptions = (options, queryTags) => sortOptions(
    fromJS(options).map((option) => option.withMutations((o) => o.set('checked', queryTags.includes(option.get('value')))))
  );

  render() {
    return this.props.tagFilterGroups.length === 0
      ? null
      : (
        <Styled>
          { this.props.tagFilterGroups.map((group, key) => group.options && group.options.length > 0
            ? (
              <GroupWrapper key={key}>
                <Group
                  onClick={(evt) => {
                    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
                    this.toggleGroup(key);
                  }}
                  active={key === this.state.active}
                >
                  <Label>
                    {group.title}
                  </Label>
                  <Icon name={this.state.active === key ? 'dropdownClose' : 'dropdownOpen'} text textRight />
                </Group>
                { key === this.state.active
                && (
                  <Dropdown>
                    <OptionList
                      secondary
                      options={this.prepareOptions(group.options, this.props.queryTags)}
                      onCheckboxChange={(active, tagOption) => {
                        this.setState({ active: null });
                        this.props.onTagSelected(active, tagOption);
                      }}
                    />
                  </Dropdown>
                )
                }
              </GroupWrapper>
            )
            : null)}
        </Styled>
      );
  }
}

TagFilters.propTypes = {
  tagFilterGroups: PropTypes.array,
  queryTags: PropTypes.array,
  onTagSelected: PropTypes.func,
};

export default TagFilters;
