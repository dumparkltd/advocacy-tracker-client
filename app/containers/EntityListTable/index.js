import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import styled from 'styled-components';
import isNumber from 'utils/is-number';

import { Map, List, fromJS } from 'immutable';

import {
  selectSortByQuery,
  selectSortOrderQuery,
  selectPageItemsQuery,
  selectPageNoQuery,
  selectSearchQuery,
  selectActortypes,
  selectCategories,
  selectResources,
  selectIsPrintView,
  selectPrintConfig,
} from 'containers/App/selectors';
import { updateQuery } from 'containers/EntityList/actions';

import ToggleAllItems from 'components/fields/ToggleAllItems';
import appMessages from 'containers/App/messages';

import Messages from 'components/Messages';
import { filterEntitiesByKeywords } from 'utils/entities';
import { prepSortTarget } from 'utils/sort';
import qe from 'utils/quasi-equals';

import EntitiesTable from './EntitiesTable';
import EntitiesTableOptions from './EntitiesTableOptions';

import EntityListFooter from './EntityListFooter';

import { getPager } from './pagination';
import {
  prepareEntityRows,
  prepareHeader,
  getListHeaderLabel,
  getSelectedState,
  getColumnMaxValues,
} from './utils';
import messages from './messages';

import {
  updatePage,
  updatePageItems,
  updateSort,
} from './actions';

const ListEntitiesMain = styled.div`
  padding-top: 0.5em;
`;
const ListEntitiesEmpty = styled.div``;

const CONNECTIONMAX = 5;
const PAGE_SIZE = 20;
const PAGE_SIZE_MAX = 100;

const transformMessage = (msg, entityId, intl) => intl
  ? intl.formatMessage(messages.entityNoLongerPresent, { entityId })
  : msg;

export function EntityListTable({
  entityIdsSelected,
  config,
  columns,
  onEntityClick,
  canEdit,
  onEntitySelect,
  entityTitle,
  onEntitySelectAll,
  entities = List(),
  errors,
  connections,
  entityPath,
  url,
  moreLess,
  onSort,
  onDismissError,
  sortBy,
  sortOrder,
  pageItems,
  pageNo,
  intl,
  hasFilters = false,
  searchQuery = '',
  onSearch,
  inSingleView,
  label,
  taxonomies,
  resources,
  options = {},
  onPageItemsSelect,
  onPageSelect,
  printConfig,
  isPrintView,
  // allEntityCount,
  isByOption,
}) {
  if (!columns) return null;

  // list options
  const {
    hasSearch,
    paginate,
    includeMembers,
    includeChildren,
  } = options;

  // list sorting
  const sortColumn = columns.find((c) => !!c.sortDefault);
  const sortDefault = {
    sort: sortColumn ? sortColumn.sort : 'main',
    order: sortColumn ? sortColumn.sortOrder : 'asc',
  };
  const [showAllConnections, setShowAllConnections] = useState(false);
  const [localSort, setLocalSort] = useState(sortDefault);
  const cleanSortOrder = inSingleView ? localSort.order : (sortOrder || sortDefault.order);
  const cleanSortBy = inSingleView ? localSort.sort : (sortBy || sortDefault.sort);
  const cleanOnSort = inSingleView
    ? (sort, order) => setLocalSort({
      sort: sort || cleanSortBy,
      order: order || cleanSortOrder,
    })
    : onSort;

  // filter entitities by keyword
  const searchAttributes = (
    config.views
    && config.views.list
    && config.views.list.search
  ) || ['title'];

  let searchedEntities = entities;

  if (hasSearch && searchQuery.length > 2) {
    searchedEntities = filterEntitiesByKeywords(
      searchedEntities,
      searchQuery,
      searchAttributes,
    );
  }
  const activeColumns = columns.filter((col) => !(isPrintView && col.printHideOnSingle));
  // warning converting List to Array
  const entityRows = prepareEntityRows({
    entities: searchedEntities,
    columns: activeColumns,
    entityIdsSelected,
    config,
    url,
    entityPath,
    onEntityClick,
    onEntitySelect,
    connections,
    taxonomies,
    resources,
    intl,
    includeMembers,
    includeChildren,
  });
  const columnMaxValues = getColumnMaxValues(
    entityRows,
    activeColumns,
  );
  const errorsWithoutEntities = errors && errors.filter(
    (error, id) => !searchedEntities.find((entity) => qe(entity.get('id'), id))
  );
  // sort entities
  const sortedEntities = entityRows && entityRows.sort(
    (a, b) => {
      const aSortValue = a[cleanSortBy]
        && (a[cleanSortBy].sortValue || a[cleanSortBy].order || a[cleanSortBy].value);
      const bSortValue = b[cleanSortBy]
        && (b[cleanSortBy].sortValue || b[cleanSortBy].order || b[cleanSortBy].value);
      const aHasSortValue = aSortValue || isNumber(aSortValue);
      const bHasSortValue = bSortValue || isNumber(bSortValue);
      // always prefer values over none, regardless of order
      if (aHasSortValue && !bHasSortValue) {
        return -1;
      }
      if (bHasSortValue && !aHasSortValue) {
        return 1;
      }
      let result;
      if (aHasSortValue && bHasSortValue) {
        if (isNumber(aSortValue) && !isNumber(bSortValue)) {
          result = -1;
        } else if (isNumber(bSortValue) && !isNumber(aSortValue)) {
          result = 1;
        } else if (
          isNumber(bSortValue) && isNumber(aSortValue)
        ) {
          if (
            a[cleanSortBy].type === 'amount'
            || a[cleanSortBy].type === 'actorActions'
          ) {
            result = aSortValue > bSortValue ? 1 : -1;
          } else {
            result = aSortValue < bSortValue ? 1 : -1;
          }
        } else {
          const aClean = prepSortTarget(aSortValue);
          const bClean = prepSortTarget(bSortValue);
          result = aClean > bClean ? 1 : -1;
        }
      }
      return cleanSortOrder === 'desc' ? result * -1 : result;
    }
  );

  let pageSize = PAGE_SIZE_MAX;
  let entitiesOnPage = sortedEntities;
  let pager;
  const isSortedOrPaged = !!pageNo || !!pageItems || !!cleanSortBy || !!cleanSortOrder;
  if (paginate) {
    if (pageItems === 'all' || (isPrintView && printConfig && printConfig.printItems === 'all')) {
      pageSize = sortedEntities.length;
    } else {
      pageSize = pageItems
        ? Math.min(
          (pageItems && parseInt(pageItems, 10)),
          PAGE_SIZE_MAX
        ) : Math.min(PAGE_SIZE, PAGE_SIZE_MAX);
    }

    // grouping and paging
    // if grouping required
    if (sortedEntities.length > pageSize) {
      // get new pager object for specified page
      pager = getPager(
        sortedEntities.length,
        pageNo && parseInt(pageNo, 10),
        pageSize
      );
      entitiesOnPage = sortedEntities.slice(pager.startIndex, pager.endIndex + 1);
    }
  } else if (moreLess) {
    entitiesOnPage = showAllConnections
      ? sortedEntities
      : (sortedEntities.slice(0, CONNECTIONMAX));
  }
  const entityIdsOnPage = entitiesOnPage.map((entity) => entity.id);
  const headerColumns = prepareHeader({
    columns: activeColumns,
    // config,
    sortBy: cleanSortBy,
    sortOrder: cleanSortOrder,
    onSort: cleanOnSort,
    onSelectAll: (checked) => canEdit
      && onEntitySelectAll(checked ? entityIdsOnPage : []),
    selectedState: canEdit && getSelectedState(
      entityIdsSelected.size,
      entityIdsOnPage.length === entityIdsSelected.size,
    ),
    title: label || getListHeaderLabel({
      intl,
      entityTitle,
      pageTotal: entityIdsOnPage.length,
      entitiesTotal: sortedEntities.length,
      selectedTotal: canEdit && entityIdsSelected && entityIdsSelected.size,
      allSelectedOnPage: canEdit && entityIdsOnPage.length === entityIdsSelected.size,
      messages,
      hasFilters: (searchQuery.length > 0 || hasFilters),
    }),
    intl,
  });

  const listEmpty = searchedEntities.size === 0;
  const listEmptyAfterQuery = listEmpty
    && (searchQuery.length > 0 || hasFilters);
  const listEmptyAfterQueryAndErrors = listEmptyAfterQuery
    && (errors && errors.size > 0);

  return (
    <div>
      {options && (
        <EntitiesTableOptions
          options={{
            ...options,
            hasPageSelect: !isPrintView && entitiesOnPage && entitiesOnPage.length > 0 && paginate,
          }}
          onPageItemsSelect={onPageItemsSelect}
          onSearch={onSearch}
          searchQuery={searchQuery}
          pageSelectValue={pageItems === 'all' ? pageItems : pageSize.toString()}
        />
      )}
      <EntitiesTable
        entities={entitiesOnPage}
        canEdit={canEdit}
        columns={activeColumns}
        headerColumns={headerColumns || []}
        onEntityClick={onEntityClick}
        columnMaxValues={columnMaxValues}
        inSingleView={inSingleView}
      />
      <ListEntitiesMain>
        {listEmpty && (
          <ListEntitiesEmpty>
            {!listEmptyAfterQuery && (
              <FormattedMessage
                {...messages[isByOption ? 'listEmptyByOption' : 'listEmpty']}
                values={{ title: entityTitle.plural }}
              />
            )}
            {listEmptyAfterQuery && !listEmptyAfterQueryAndErrors && (
              <FormattedMessage
                {...messages.listEmptyAfterQuery}
                values={{ title: entityTitle.plural }}
              />
            )}
            {listEmptyAfterQuery && listEmptyAfterQueryAndErrors && (
              <FormattedMessage
                {...messages.listEmptyAfterQueryAndErrors}
                values={{ title: entityTitle.plural }}
              />
            )}
          </ListEntitiesEmpty>
        )}
        {errorsWithoutEntities
          && errorsWithoutEntities.size > 0
          && !isSortedOrPaged
          && errorsWithoutEntities.map((entityErrors, entityId) => (
            entityErrors.map((updateError, i) => (
              <Messages
                key={i}
                type="error"
                messages={updateError
                  .getIn(['error', 'messages'])
                  .map((msg) => transformMessage(msg, entityId, intl))
                  .valueSeq()
                  .toArray()
                }
                onDismiss={() => onDismissError(updateError.get('key'))}
                preMessage={false}
              />
            ))
          )).toList()
        }
      </ListEntitiesMain>
      {entitiesOnPage.length > 0 && paginate && (
        <EntityListFooter
          pager={pager}
          isPrintView={isPrintView}
          pageSize={(pageItems === 'all' || (isPrintView && printConfig.printItems === 'all')) ? 'all' : pageSize}
          onPageSelect={onPageSelect}
        />
      )}
      {moreLess && searchedEntities.size > CONNECTIONMAX && (
        <ToggleAllItems
          onClick={() => setShowAllConnections(!showAllConnections)}
        >
          {showAllConnections && (
            <FormattedMessage {...appMessages.entities.showLess} />
          )}
          {!showAllConnections && (
            <FormattedMessage {...appMessages.entities.showAll} />
          )}
        </ToggleAllItems>
      )}
    </div>
  );
}

EntityListTable.propTypes = {
  entities: PropTypes.instanceOf(List),
  resources: PropTypes.instanceOf(Map),
  taxonomies: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  entityIdsSelected: PropTypes.instanceOf(List),
  // locationQuery: PropTypes.instanceOf(Map),
  errors: PropTypes.instanceOf(Map),
  // showValueForAction: PropTypes.instanceOf(Map),
  entityTitle: PropTypes.object,
  config: PropTypes.object,
  columns: PropTypes.array,
  headerColumnsUtility: PropTypes.array,
  canEdit: PropTypes.bool,
  onPageSelect: PropTypes.func,
  onPageItemsSelect: PropTypes.func,
  onEntityClick: PropTypes.func.isRequired,
  onEntitySelect: PropTypes.func,
  onEntitySelectAll: PropTypes.func,
  onSort: PropTypes.func,
  onDismissError: PropTypes.func,
  showCode: PropTypes.bool,
  inSingleView: PropTypes.bool,
  moreLess: PropTypes.bool,
  entityPath: PropTypes.string,
  url: PropTypes.string,
  intl: intlShape,
  sortBy: PropTypes.string,
  sortOrder: PropTypes.string,
  pageItems: PropTypes.string,
  pageNo: PropTypes.string,
  searchQuery: PropTypes.string,
  hasFilters: PropTypes.bool,
  onSearch: PropTypes.func,
  label: PropTypes.string,
  options: PropTypes.object,
  includeMembers: PropTypes.bool,
  includeChildren: PropTypes.bool,
  isByOption: PropTypes.bool,
  isPrintView: PropTypes.bool,
  printConfig: PropTypes.object,
  pageItemSelectConfig: PropTypes.object,
  // allEntityCount: PropTypes.number,
};

const mapStateToProps = (state) => ({
  sortBy: selectSortByQuery(state),
  sortOrder: selectSortOrderQuery(state),
  pageItems: selectPageItemsQuery(state),
  pageNo: selectPageNoQuery(state),
  searchQuery: selectSearchQuery(state),
  actortypes: selectActortypes(state),
  categories: selectCategories(state),
  resources: selectResources(state),
  isPrintView: selectIsPrintView(state),
  printConfig: selectPrintConfig(state),
});
function mapDispatchToProps(dispatch) {
  return {
    onPageSelect: (page) => {
      dispatch(updatePage(page));
    },
    onPageItemsSelect: (no) => {
      dispatch(updatePageItems(no));
    },
    onSort: (sort, order) => {
      dispatch(updateSort({ sort, order }));
    },
    onSearch: (value) => {
      dispatch(updateQuery(fromJS([
        {
          query: 'search',
          value,
          replace: true,
          checked: value !== '',
        },
      ])));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(EntityListTable));
