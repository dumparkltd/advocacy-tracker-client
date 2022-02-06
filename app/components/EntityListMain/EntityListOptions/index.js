/*
 *
 * EntityListOptions
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { List } from 'immutable';

import { isEqual } from 'lodash/lang';

import { PARAMS } from 'containers/App/constants';

import EntityListGroupBy from './EntityListGroupBy';

const Styled = styled.div`
  padding: 0.25em 0;
  position: relative;
  min-height: 2em;
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    min-height: 2.65em;
    padding: 0.5em 0;
  }
`;

export class EntityListOptions extends React.Component { // eslint-disable-line react/prefer-stateless-function
  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props, nextProps);
  }

  render() {
    // console.log('EntityListOptions.render')

    const {
      groupSelectValue,
      subgroupSelectValue,
      onGroupSelect,
      onSubgroupSelect,
      groupOptions,
      subgroupOptions,
    } = this.props;

    const hasOptions = (groupOptions && groupOptions.size > 0)
      || (subgroupOptions && subgroupOptions.size > 0);
    if (!hasOptions) return null;
    return (
      <Styled>
        { groupOptions.size > 0
          && (
            <EntityListGroupBy
              value={groupSelectValue}
              options={groupOptions
              && groupOptions.filter((option) => option.get('value') !== subgroupSelectValue).toJS()
              }
              onChange={onGroupSelect}
            />
          )
        }
        { groupSelectValue && groupSelectValue !== PARAMS.GROUP_RESET && subgroupOptions.size > 0
          && (
            <EntityListGroupBy
              value={subgroupSelectValue}
              options={subgroupOptions
              && subgroupOptions.filter((option) => option.get('value') !== groupSelectValue).toJS()
              }
              onChange={onSubgroupSelect}
              isSubgroup
            />
          )
        }
      </Styled>
    );
  }
}

EntityListOptions.propTypes = {
  groupSelectValue: PropTypes.string,
  subgroupSelectValue: PropTypes.string,
  groupOptions: PropTypes.instanceOf(List),
  subgroupOptions: PropTypes.instanceOf(List),
  onGroupSelect: PropTypes.func,
  onSubgroupSelect: PropTypes.func,
};

export default EntityListOptions;
