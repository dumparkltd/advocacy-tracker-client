import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { getSortOption } from 'utils/sort';

import { STATES as CHECKBOX_STATES } from 'components/forms/IndeterminateCheckbox';
import { SORT_ORDER_OPTIONS } from 'containers/App/constants';
import { COLUMN_WIDTHS } from 'themes/config';

import messages from 'components/EntityListMain/EntityListGroups/messages';

import ColumnSelect from './ColumnSelect';

const Styled = styled.div`
  width:100%;
  background-color: ${palette('light', 1)};
  display: table;
`;

class EntityListHeader extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  getListHeaderLabel = (intl, entityTitle, selectedTotal, pageTotal, entitiesTotal, allSelected, allSelectedOnPage) => {
    if (selectedTotal > 0) {
      if (allSelected) {
        // return `All ${selectedTotal} ${selectedTotal === 1 ? entityTitle.single : entityTitle.plural} selected. `;
        return intl && intl.formatMessage(messages.entityListHeader.allSelected, {
          total: selectedTotal,
          type: selectedTotal === 1 ? entityTitle.single : entityTitle.plural,
        });
      }
      if (allSelectedOnPage) {
        // return `All ${selectedTotal} ${selectedTotal === 1 ? entityTitle.single : entityTitle.plural} on this page are selected. `;
        return intl && intl.formatMessage(messages.entityListHeader.allSelectedOnPage, {
          total: selectedTotal,
          type: selectedTotal === 1 ? entityTitle.single : entityTitle.plural,
        });
      }
      // return `${selectedTotal} ${selectedTotal === 1 ? entityTitle.single : entityTitle.plural} selected. `;
      return intl && intl.formatMessage(messages.entityListHeader.selected, {
        total: selectedTotal,
        type: selectedTotal === 1 ? entityTitle.single : entityTitle.plural,
      });
    }
    if (pageTotal && (pageTotal < entitiesTotal)) {
      return intl && intl.formatMessage(messages.entityListHeader.noneSelected, {
        pageTotal,
        entitiesTotal,
        type: entityTitle.plural,
      });
    }
    return intl && intl.formatMessage(messages.entityListHeader.notPaged, {
      entitiesTotal,
      type: (entitiesTotal === 1) ? entityTitle.single : entityTitle.plural,
    });
  }

  getSelectedState = (selectedTotal, allSelected) => {
    if (selectedTotal === 0) {
      return CHECKBOX_STATES.UNCHECKED;
    }
    if (selectedTotal > 0 && allSelected) {
      return CHECKBOX_STATES.CHECKED;
    }
    return CHECKBOX_STATES.INDETERMINATE;
  }

  getFirstColumnWidth = () => COLUMN_WIDTHS.FULL;

  render() {
    const {
      selectedTotal,
      pageTotal,
      entitiesTotal,
      allSelected,
      allSelectedOnPage,
      entityTitle,
      isManager,
      onSelect,
      onSelectAll,
      sortOptions,
      intl,
    } = this.props;

    const firstColumnWidth = this.getFirstColumnWidth();

    const sortOption = getSortOption(sortOptions, this.props.sortBy);
    // const { intl } = this.context;
    return (
      <Styled>
        <ColumnSelect
          width={firstColumnWidth}
          isSelect={isManager}
          isSelected={this.getSelectedState(selectedTotal, allSelected || allSelectedOnPage)}
          label={this.getListHeaderLabel(intl, entityTitle, selectedTotal, pageTotal, entitiesTotal, allSelected, allSelectedOnPage)}
          onSelect={onSelect}
          hasSelectAll={allSelectedOnPage && !allSelected}
          onSelectAll={onSelectAll}
          entitiesTotal={entitiesTotal}
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
EntityListHeader.propTypes = {
  selectedTotal: PropTypes.number,
  pageTotal: PropTypes.number,
  entitiesTotal: PropTypes.number,
  allSelected: PropTypes.bool,
  allSelectedOnPage: PropTypes.bool,
  isManager: PropTypes.bool,
  entityTitle: PropTypes.object,
  sortOptions: PropTypes.array,
  sortOrder: PropTypes.string,
  sortBy: PropTypes.string,
  onSelect: PropTypes.func,
  onSelectAll: PropTypes.func,
  onSortBy: PropTypes.func,
  onSortOrder: PropTypes.func,
  intl: intlShape.isRequired,
};


export default injectIntl(EntityListHeader);
