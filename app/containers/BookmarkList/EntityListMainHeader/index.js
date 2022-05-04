import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { getSortOption } from 'utils/sort';

import { SORT_ORDER_OPTIONS } from 'containers/App/constants';

import ColumnSelect from './ColumnSelect';

const Styled = styled.div`
  width:100%;
  background-color: ${palette('light', 1)};
  display: table;
`;

class EntityListMainHeader extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const {
      entitiesTotal,
      entityTitle,
      sortOptions,
    } = this.props;

    const sortOption = getSortOption(sortOptions, this.props.sortBy);
    // const { intl } = this.context;
    return (
      <Styled>
        <ColumnSelect
          width={1}
          label={`${entitiesTotal} ${(entitiesTotal === 1) ? entityTitle.single : entityTitle.plural}`}
          sortBy={sortOption ? sortOption.attribute : null}
          sortOrder={this.props.sortOrder || (sortOption ? sortOption.order : null)}
          sortOptions={sortOptions}
          sortOrderOptions={SORT_ORDER_OPTIONS}
          onSortBy={this.props.onSortBy}
          onSortOrder={this.props.onSortOrder}
        />
      </Styled>
    );
  }
}
EntityListMainHeader.propTypes = {
  entitiesTotal: PropTypes.number,
  entityTitle: PropTypes.object,
  sortOptions: PropTypes.array,
  sortOrder: PropTypes.string,
  sortBy: PropTypes.string,
  onSortBy: PropTypes.func,
  onSortOrder: PropTypes.func,
};


export default EntityListMainHeader;
