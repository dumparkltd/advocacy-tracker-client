import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import styled from 'styled-components';
import isNumber from 'utils/is-number';
import { ResponsiveContext } from 'grommet';
import { Map, List, fromJS } from 'immutable';
import { isMinSize } from 'utils/responsive';

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
  selectPreviewQuery,
  selectHiddenColumns,
  selectLocationQuery,
} from 'containers/App/selectors';
import {
  setPreviewContent,
  setListPreview,
  updateRouteQuery,
} from 'containers/App/actions';
import {
  updateQuery,
} from 'containers/EntityList/actions';

import ToggleAllItems from 'components/fields/ToggleAllItems';
import appMessages from 'containers/App/messages';

import Messages from 'components/Messages';
import { filterEntitiesByKeywords } from 'utils/entities';
import { prepSortTarget } from 'utils/sort';
import qe from 'utils/quasi-equals';

import EntitiesTable from './EntitiesTable';
import EntityListTableOptions from './EntityListTableOptions';

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
  onResetScroll,
  previewItemId,
  onSetPreviewItemId,
  onSetPreviewContent,
  reducePreviewItem,
  hiddenColumns,
  onUpdateHiddenColumns,
  onUpdateColumnFilters,
  onEntityClick,
  locationQuery,
  skipPreviews,
}) {
  if (!columns) return null;
  const size = React.useContext(ResponsiveContext);
  // list options
  const {
    hasSearch,
    search,
    paginate,
    paginateOptions,
    pageSize,
    includeMembers,
    includeChildren,
    searchPlaceholder,
  } = options;

  // list sorting
  const sortColumn = columns.find((c) => !!c.sortDefault);
  const sortDefault = {
    sort: sortColumn ? sortColumn.sort : 'main',
    order: sortColumn ? sortColumn.sortOrder : 'asc',
  };
  const [showAllConnections, setShowAllConnections] = useState(false);
  const [localSort, setLocalSort] = useState(sortDefault);

  // filter entitities by keyword
  const searchAttributes = (
    config
    && config.views
    && config.views.list
    && config.views.list.search
  ) || ['title'];

  let searchedEntities = entities;
  const searchQueryClean = search || searchQuery;
  if (!inSingleView && searchQueryClean && searchQueryClean.length > 2) {
    searchedEntities = filterEntitiesByKeywords(
      searchedEntities,
      searchQueryClean,
      searchAttributes,
    );
  }
  const availableColumns = columns
    .filter((col) => {
      if (col.minSize && col.type !== 'main') {
        return isMinSize(size, col.minSize);
      }
      // only show main when smaller than medium
      if ((!isMinSize(size, 'medium') || isPrintView) && col.type !== 'main') {
        return false;
      }
      if (col.printHideOnSingle && isPrintView) {
        return false;
      }
      return true;
    })
    .map((col) => ({
      ...col,
      hidden: hiddenColumns && hiddenColumns.includes(col.id),
    }));
  const visibleColumns = inSingleView
    ? availableColumns
    : availableColumns.filter((col) => !col.hidden);

  // warning converting List to Array
  const entityRows = prepareEntityRows({
    entities: searchedEntities,
    columns: availableColumns,
    entityIdsSelected,
    config,
    url,
    entityPath,
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
    visibleColumns,
  );
  const errorsWithoutEntities = errors && errors.filter(
    (error, id) => !searchedEntities.find((entity) => qe(entity.get('id'), id))
  );
  // sort entities
  const cleanSortBy = inSingleView ? localSort.sort : (sortBy || sortDefault.sort);
  const cleanSortOrder = inSingleView ? localSort.order : (sortOrder || sortDefault.order);
  const cleanOnSort = inSingleView
    ? (sort, order) => setLocalSort({
      sort: sort || cleanSortBy,
      order: order || cleanSortOrder,
    })
    : onSort;
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
          result = 1;
        } else if (isNumber(bSortValue) && !isNumber(aSortValue)) {
          result = -1;
        } else if (
          isNumber(bSortValue) && isNumber(aSortValue)
        ) {
          if (a[cleanSortBy].type === 'topicPosition') {
            result = aSortValue > bSortValue ? -1 : 1;
          } else {
            result = aSortValue < bSortValue ? -1 : 1;
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

  let pageSizeClean = PAGE_SIZE_MAX;
  let entitiesOnPage = sortedEntities;
  let pager;
  const isSortedOrPaged = !!pageNo || !!pageItems || !!cleanSortBy || !!cleanSortOrder;
  if (paginate) {
    if (pageSize) {
      pageSizeClean = 10;
    } else if (pageItems === 'all' || (isPrintView && printConfig && printConfig.printItems === 'all')) {
      pageSizeClean = sortedEntities.length;
    } else {
      pageSizeClean = pageItems
        ? Math.min(
          (pageItems && parseInt(pageItems, 10)),
          PAGE_SIZE_MAX
        ) : Math.min(PAGE_SIZE, PAGE_SIZE_MAX);
    }

    // grouping and paging
    // if grouping required
    if (sortedEntities.length > pageSizeClean) {
      // get new pager object for specified page
      pager = getPager(
        sortedEntities.length,
        pageNo && parseInt(pageNo, 10),
        pageSizeClean
      );
      entitiesOnPage = sortedEntities.slice(pager.startIndex, pager.endIndex + 1);
    }
  } else if (moreLess) {
    entitiesOnPage = showAllConnections
      ? sortedEntities
      : (sortedEntities.slice(0, CONNECTIONMAX));
  }
  const entityIdsOnPage = entitiesOnPage.map((entity) => entity.id);
  const availableHeaderColumns = prepareHeader({
    columns: availableColumns,
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
      hasFilters: (searchQueryClean.length > 0 || hasFilters),
    }),
    intl,
  });

  const listEmpty = searchedEntities.size === 0;
  const listEmptyAfterQuery = listEmpty
    && (searchQueryClean.length > 0 || hasFilters);
  const listEmptyAfterQueryAndErrors = listEmptyAfterQuery
    && (errors && errors.size > 0);
  const visibleHeaderColumns = inSingleView
    ? availableHeaderColumns
    : availableHeaderColumns.filter((c) => !c.hidden);
  return (
    <div>
      {options && Object.keys(options).length > 0 && (
        <EntityListTableOptions
          options={{
            ...options,
            hasPageSelect: paginateOptions && !isPrintView && entitiesOnPage && entitiesOnPage.length > 0 && paginate,
            searchPlaceholder,
          }}
          onPageItemsSelect={onPageItemsSelect}
          onSearch={hasSearch && onSearch}
          searchQuery={searchQueryClean}
          pageSelectValue={pageItems === 'all' ? pageItems : pageSizeClean.toString()}
        />
      )}
      <EntitiesTable
        entities={entitiesOnPage}
        sortedEntities={sortedEntities}
        searchedEntities={searchedEntities}
        canEdit={canEdit}
        visibleHeaderColumns={visibleHeaderColumns || []}
        availableHeaderColumns={availableHeaderColumns || []}
        visibleColumns={visibleColumns || []}
        availableColumns={availableColumns || []}
        onEntityClick={(idOrPath, path, componentId) => {
          if ((skipPreviews || inSingleView) && onEntityClick) {
            onEntityClick(idOrPath, path);
          }
          if (!skipPreviews && !inSingleView && onSetPreviewItemId && componentId) {
            onSetPreviewItemId(`${componentId}|${path}|${idOrPath}`);
          }
        }}
        onUpdateHiddenColumns={onUpdateHiddenColumns}
        onUpdateColumnFilters={onUpdateColumnFilters}
        columnMaxValues={columnMaxValues}
        inSingleView={inSingleView}
        previewItemId={previewItemId}
        reducePreviewItem={reducePreviewItem}
        onSetPreviewContent={onSetPreviewContent}
        locationQuery={locationQuery}
      />
      <ListEntitiesMain>
        {entityTitle && listEmpty && (
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
          onPageSelect={(val) => {
            if (onResetScroll) onResetScroll();
            onPageSelect(val);
          }}
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
  errors: PropTypes.instanceOf(Map),
  // showValueForAction: PropTypes.instanceOf(Map),
  entityTitle: PropTypes.object,
  config: PropTypes.object,
  columns: PropTypes.array,
  headerColumnsUtility: PropTypes.array,
  canEdit: PropTypes.bool,
  onPageSelect: PropTypes.func,
  onEntityClick: PropTypes.func,
  onPageItemsSelect: PropTypes.func,
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
  isByOption: PropTypes.bool,
  skipPreviews: PropTypes.bool,
  isPrintView: PropTypes.bool,
  printConfig: PropTypes.object,
  pageItemSelectConfig: PropTypes.object,
  onResetScroll: PropTypes.func,
  previewItemId: PropTypes.string,
  reducePreviewItem: PropTypes.func,
  onSetPreviewContent: PropTypes.func,
  onSetPreviewItemId: PropTypes.func,
  onUpdateHiddenColumns: PropTypes.func,
  onUpdateColumnFilters: PropTypes.func,
  hiddenColumns: PropTypes.object, // immutable List
  locationQuery: PropTypes.object, // immutable Map
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
  previewItemId: selectPreviewQuery(state),
  hiddenColumns: selectHiddenColumns(state),
  locationQuery: selectLocationQuery(state),
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
    onSetPreviewContent: (value) => dispatch(setPreviewContent(value)),
    onSetPreviewItemId: (value) => dispatch(setListPreview(value)),
    onUpdateHiddenColumns: ({ addToHidden, removeFromHidden }) => {
      let query = [];
      if (addToHidden && addToHidden.length > 0) {
        query = addToHidden.reduce(
          (memo, value) => ([
            ...memo,
            { arg: 'xcol', add: true, value },
          ]),
          query,
        );
      }
      if (removeFromHidden && removeFromHidden.length > 0) {
        query = removeFromHidden.reduce(
          (memo, value) => ([
            ...memo,
            { arg: 'xcol', remove: true, value },
          ]),
          query,
        );
      }
      dispatch(updateRouteQuery(query, true));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(EntityListTable));
