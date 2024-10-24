import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, ResponsiveContext } from 'grommet';
import styled, { css, withTheme } from 'styled-components';
import { groupBy } from 'lodash/collection';

import qe from 'utils/quasi-equals';
import { isMinSize } from 'utils/responsive';
import { scaleColorCount } from 'containers/MapContainer/utils';
import { usePrint } from 'containers/App/PrintContext';

import { MAP_OPTIONS } from 'themes/config';
import { checkColumnFilterOptions } from './utils';

import CellBodyMain from './CellBodyMain';
import CellBodyPlain from './CellBodyPlain';
import CellBodyPosition from './CellBodyPosition';
import CellBodyPlainWithDate from './CellBodyPlainWithDate';
import CellBodyUsers from './CellBodyUsers';
import CellBodyActors from './CellBodyActors';
import CellBodyActions from './CellBodyActions';
import CellBodyIndicators from './CellBodyIndicators';
import CellBodyCategories from './CellBodyCategories';
import CellBodyHasResource from './CellBodyHasResource';
import CellBodyBarChart from './CellBodyBarChart';
import CellBodyStackedBarChart from './CellBodyStackedBarChart';
import CellHeaderMain from './CellHeaderMain';
import CellHeaderPlain from './CellHeaderPlain';
import CellHeaderSmart from './CellHeaderSmart';
import CellHeaderAuxColumns from './CellHeaderAuxColumns';

const Table = styled.table`
  border-spacing: 0;
  border-collapse: collapse;
  width: inherit;
  table-layout: fixed;
  width: 100%;
  ${({ isPrint }) => isPrint && css`pointer-events: none;`}
  @media print {
    display: block;
    page-break-inside: auto;
  }
`;
const TableHeader = styled(
  React.forwardRef((p, ref) => <thead {...p} ref={ref} />)
)``;

const TableBody = styled.tbody``;
const TableRow = styled.tr`
  height: 100%;
  @media print {
    height: auto;
    page-break-inside: avoid;
  }
`;
// background-color: ${({ utility, col }) => {
//   if (utility && col.type === 'options') return '#f9f9f9';
//   return 'transparent';
// }};
const TableCellHeader = styled.th`
  margin: 0;
  padding: 0;
  font-weight: inherit;
  text-align: inherit;
  height: 100%;
  text-align: start;
  vertical-align: bottom;
  border-bottom: solid 1px;
  border-bottom-color: ${({ utility, col }) => {
    if (utility && col.type === 'options') return 'rgba(0,0,0,0.05)';
    if (utility) return 'transparent';
    return 'rgba(0,0,0,0.33)';
  }};
  padding-left: ${({ col, first, plain }) => {
    if (plain) return 0;
    return (col.align !== 'end' && !first) ? 8 : 4;
  }}px;
  padding-right: ${({ col, last, plain }) => {
    if (plain) return 0;
    return (col.align === 'end' && !last) ? 8 : 4;
  }}px;
  padding-top: 6px;
  padding-bottom: 6px;
  width: ${({ col }) => col && col.colWidth}};
`;

const TableCellBody = styled.td`
  margin: 0;
  padding: 0;
  font-weight: inherit;
  text-align: inherit;
  height: 100%;
  text-align: start;
  border-bottom: solid 1px #DADADA;
  padding-left: ${({ col, first, plain }) => {
    if (plain) return 0;
    return (col.align !== 'end' && !first) ? 8 : 4;
  }}px;
  padding-right: ${({ col, last, plain }) => {
    if (plain) return 0;
    return (col.align === 'end' && !last) ? 8 : 4;
  }}px;
  padding-top: 6px;
  padding-bottom: 6px;
  word-wrap:break-word;
  overflow: hidden;
  width: ${({ col }) => col && col.colWidth}};
`;
const TableCellBodyInner = styled((p) => <Box {...p} />)`
  padding: 6px 0;
`;

const ColumnOptionsOuter = styled.div`
  position: absolute;
  right: -${({ theme }) => theme.global.edgeSize.ms};
`;
const ColumnOptionsInner = styled.div`
  transform: translateY(-100%);
  margin-top: -${({ theme }) => theme.global.edgeSize.xsmall};
`;

const MAX_VALUE_COUNTRIES = 100;

const getColorForColumn = (col, theme) => {
  if (!MAP_OPTIONS.GRADIENT[col.subject]) {
    return (theme
      && theme.global
      && theme.global.colors
      && theme.global.colors.primary)
      || 'black';
  }
  if (col.members) {
    return scaleColorCount(MAX_VALUE_COUNTRIES, MAP_OPTIONS.GRADIENT[col.subject], false)(70);
  }
  if (col.children) {
    return scaleColorCount(MAX_VALUE_COUNTRIES, MAP_OPTIONS.GRADIENT[col.subject], false)(40);
  }
  return scaleColorCount(MAX_VALUE_COUNTRIES, MAP_OPTIONS.GRADIENT[col.subject], false)(100);
};

const getColWidth = ({ col, count, topicPositionLength }) => {
  let result = 'auto';
  if (col.type === 'auxColumns') {
    result = '22px';
  } else if (col.type === 'topicPosition') {
    result = '33px';
  } else if (topicPositionLength > 0) {
    if (col.type === 'main') {
      result = '25%';
    }
  } else if (count > 2) {
    if (col.type === 'main') {
      result = '35%';
    } else if (col.isSingleActionColumn) {
      result = '25%';
    }
  }
  // if (count === 4) {
  //   return col.type === 'main' ? 30 : (70 / (count - 1)) * colSpan;
  // }
  // if (count > 4) {
  //   return col.type === 'main' ? 25 : (75 / (count - 1)) * colSpan;
  // }
  return result;
};

const ID = 'entities-table';
export function EntitiesTable({
  entities,
  canEdit,
  visibleHeaderColumns,
  availableHeaderColumns,
  visibleColumns,
  availableColumns,
  onEntityClick,
  onUpdateHiddenColumns,
  onUpdateColumnFilters,
  columnMaxValues,
  inSingleView,
  theme,
  previewItemId,
  reducePreviewItem,
  onSetPreviewContent,
  sortedEntities,
  searchedEntities,
}) {
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    setHeaderHeight(headerRef.current.clientHeight);
  });

  // console.log('sortedEntities', sortedEntities)
  // console.log('searchedEntities', searchedEntities && searchedEntities.toJS())
  useEffect(() => {
    if (!!reducePreviewItem && sortedEntities) {
      if (previewItemId) {
        const [componentId, path, itemId] = previewItemId.split('|');
        if (qe(componentId, ID)) {
          const mainItem = searchedEntities && itemId && searchedEntities.find(
            (item) => qe(item.get('id'), itemId)
          );
          if (mainItem) {
            const entityIds = sortedEntities.map((e) => e.id);
            const entityIndex = entityIds.indexOf(mainItem.get('id'));
            const nextIndex = entityIndex < entityIds.length ? entityIndex + 1 : 0;
            const prevIndex = entityIndex > 0 ? entityIndex - 1 : entityIds.length - 1;

            let content = reducePreviewItem({ item: mainItem, path });
            content = {
              ...content,
              header: {
                ...content.header,
                nextPreviewItem: nextIndex !== entityIndex && `${ID}|${path}|${entityIds[nextIndex]}`,
                prevPreviewItem: prevIndex !== entityIndex && `${ID}|${path}|${entityIds[prevIndex]}`,
              },
              item: mainItem,
              columns: availableColumns,
            };
            onSetPreviewContent(content);
          } else if (itemId && path) {
            onSetPreviewContent(reducePreviewItem({ id: itemId, path }));
          } else {
            onSetPreviewContent();
          }
        }
      } else {
        onSetPreviewContent();
      }
    }
  }, [previewItemId]);
  const size = React.useContext(ResponsiveContext);
  const isPrintView = usePrint();
  const hasColumnOptions = !inSingleView && isMinSize(size, 'medium');
  let headerColumnsAux = hasColumnOptions
    ? [
      ...visibleHeaderColumns,
      {
        id: 'auxColumns',
        type: 'auxColumns',
      },
    ]
    : visibleHeaderColumns;
  let columnsAux = hasColumnOptions
    ? [
      ...visibleColumns,
      {
        type: 'spacer',
        content: '',
      },
    ]
    : visibleColumns;
  const headerColumnsByType = headerColumnsAux && groupBy(headerColumnsAux, 'type');
  // console.log('headerColumnsAux', headerColumnsAux)

  const topicPositionLength = headerColumnsByType
    && headerColumnsByType.topicPosition
    && headerColumnsByType.topicPosition.length;

  headerColumnsAux = headerColumnsAux.map((col) => ({
    ...col,
    colWidth: getColWidth(
      { col, count: headerColumnsAux.length, topicPositionLength }
    ),
  }));
  columnsAux = columnsAux.map((col) => ({
    ...col,
    colWidth: getColWidth(
      { col, count: headerColumnsAux.length, topicPositionLength }
    ),
  }));
  return (
    <Box
      fill="horizontal"
      responsive={false}
      style={{ position: 'relative' }}
    >
      {hasColumnOptions && (
        <ColumnOptionsOuter style={{ top: headerHeight }}>
          <ColumnOptionsInner>
            <CellHeaderAuxColumns
              columnOptions={availableHeaderColumns
                  && availableHeaderColumns.filter((column) => column.type !== 'main')
              }
              onUpdate={(options) => onUpdateHiddenColumns({
                addToHidden: options.filter((o) => o.changed && !o.hidden).map((o) => o.id), // hide previously unhidden
                removeFromHidden: options.filter((o) => o.changed && o.hidden).map((o) => o.id), // show previously hidden
              })}
            />
          </ColumnOptionsInner>
        </ColumnOptionsOuter>
      )}
      <Table isPrint={isPrintView}>
        <TableHeader ref={headerRef}>
          <TableRow>
            {headerColumnsAux && headerColumnsAux.map(
              (col, i) => (
                <TableCellHeader
                  key={i}
                  scope="col"
                  col={col}
                  first={i === 0}
                  last={i === headerColumnsAux.length - 1}
                  plain={col.type === 'topicPosition' || col.type === 'auxColumns' || col.type === 'spacer'}
                >
                  <Box fill={false} flex={{ grow: 0 }} justify="start">
                    {col.type === 'main' && (
                      <CellHeaderMain
                        column={col}
                        canEdit={canEdit && !isPrintView}
                        isPrintView={isPrintView}
                      />
                    )}
                    {col.type === 'topicPosition' && (
                      <CellHeaderSmart
                        column={col}
                        filterOptions={col.filterOptions && checkColumnFilterOptions(
                          col,
                          searchedEntities,
                        )}
                        onUpdateFilterOptions={
                          (options) => onUpdateColumnFilters({
                            column: col,
                            addToFilters: options.filter((o) => o.changed && !o.active).map((o) => o.value), // hide previously unhidden
                            removeFromFilters: options.filter((o) => o.changed && o.active).map((o) => o.value), // show previously hidden
                          })
                        }
                      />
                    )}
                    {col.type !== 'main' && col.type !== 'topicPosition' && (
                      <CellHeaderPlain column={col} />
                    )}
                  </Box>
                </TableCellHeader>
              )
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {entities.length > 0 && entities.map((entity, key) => (
            <TableRow key={key}>
              {columnsAux.map((col, i) => (
                <TableCellBody
                  key={i}
                  scope="row"
                  col={col}
                  first={i === 0}
                  last={i === headerColumnsAux.length - 1}
                  plain={col.type === 'topicPosition' || col.type === 'auxColumns' || col.type === 'spacer'}
                >
                  {col.id && entity[col.id] && (
                    <TableCellBodyInner>
                      {col.type === 'main' && (
                        <CellBodyMain
                          entity={entity[col.id]}
                          canEdit={canEdit && !isPrintView}
                          column={col}
                          onEntityClick={(id, path) => onEntityClick(id, path, ID)}
                        />
                      )}
                      {(
                        col.type === 'plain'
                        || col.type === 'attribute'
                        || col.type === 'amount'
                        || col.type === 'userrole'
                        || col.type === 'date'
                        || col.type === 'supportlevel'
                        || col.type === 'topicPosition'
                      ) && (
                        <CellBodyPlain
                          entity={entity[col.id]}
                          column={col}
                          primary={col.type === 'userrole'}
                          onEntityClick={(id, path) => onEntityClick(id, path, ID)}
                        />
                      )}
                      {col.type === 'plainWithDate' && (
                        <CellBodyPlainWithDate
                          entity={entity[col.id]}
                          onEntityClick={(id, path) => onEntityClick(id, path, ID)}
                          column={col}
                        />
                      )}
                      {col.type === 'position' && (
                        <CellBodyPosition
                          entity={entity[col.id]}
                          column={col}
                        />
                      )}
                      {col.type === 'users' && (
                        <CellBodyUsers
                          entity={entity[col.id]}
                          onEntityClick={(id, path) => onEntityClick(id, path, ID)}
                          column={col}
                        />
                      )}
                      {col.type === 'indicators' && (
                        <CellBodyIndicators
                          entity={entity[col.id]}
                          onEntityClick={(id, path) => onEntityClick(id, path, ID)}
                          column={col}
                        />
                      )}
                      {(
                        col.type === 'actorsSimple'
                        || col.type === 'actors'
                        || col.type === 'actorsViaChildren'
                        || col.type === 'members'
                        || col.type === 'associations'
                        || col.type === 'userActors'
                        || col.type === 'viaGroups'
                      ) && (
                        <CellBodyActors
                          entity={entity[col.id]}
                          onEntityClick={(id, path) => onEntityClick(id, path, ID)}
                          column={col}
                        />
                      )}
                      {(
                        col.type === 'taxonomy'
                        || col.type === 'positionStatementAuthority'
                      ) && (
                        <CellBodyCategories
                          entity={entity[col.id]}
                          column={col}
                        />
                      )}
                      {col.type === 'hasResources' && (
                        <CellBodyHasResource
                          entity={entity[col.id]}
                          onEntityClick={(id, path) => onEntityClick(id, path, ID)}
                          column={col}
                        />
                      )}
                      {(
                        col.type === 'actionsSimple'
                        || col.type === 'resourceActions'
                        || col.type === 'indicatorActions'
                        || col.type === 'userActions'
                        || col.type === 'positionStatement'
                        || col.type === 'childActions'
                        || col.type === 'parentActions'
                        || (col.simple && (
                          col.type === 'actorActions'
                          || col.type === 'actiontype'
                        ))
                      ) && (
                        <CellBodyActions
                          entity={entity[col.id]}
                          column={col}
                          onEntityClick={(id, path) => onEntityClick(id, path, ID)}
                        />
                      )}
                      {(
                        col.type === 'actorActions'
                        || col.type === 'actiontype'
                      ) && !col.simple && (
                        <CellBodyBarChart
                          value={entity[col.id].value}
                          maxvalue={Object.values(columnMaxValues).reduce((memo, val) => Math.max(memo, val), 0)}
                          subject={col.subject}
                          column={col}
                          issecondary={col.type !== 'actiontype' && (col.members || col.children)}
                          color={getColorForColumn(col, theme)}
                          entityType="actions"
                          onEntityClick={(id, path) => onEntityClick(id, path, ID)}
                          rowConfig={entity[col.id]}
                        />
                      )}
                      {col.type === 'stackedBarActions' && (
                        <CellBodyStackedBarChart
                          values={entity[col.id] && entity[col.id].values
                            ? Object.values(entity[col.id].values)
                            : null
                          }
                          maxvalue={Object.values(columnMaxValues).reduce((memo, val) => Math.max(memo, val), 0)}
                          column={col}
                          entityType="actors"
                          onEntityClick={(id, path) => onEntityClick(id, path, ID)}
                        />
                      )}
                    </TableCellBodyInner>
                  )}
                </TableCellBody>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

EntitiesTable.propTypes = {
  entities: PropTypes.array.isRequired,
  sortedEntities: PropTypes.array,
  searchedEntities: PropTypes.object,
  columnMaxValues: PropTypes.object,
  theme: PropTypes.object,
  canEdit: PropTypes.bool,
  inSingleView: PropTypes.bool,
  onEntityClick: PropTypes.func,
  onUpdateHiddenColumns: PropTypes.func,
  onUpdateColumnFilters: PropTypes.func,
  previewItemId: PropTypes.string,
  reducePreviewItem: PropTypes.func,
  onSetPreviewContent: PropTypes.func,
  visibleHeaderColumns: PropTypes.array,
  availableHeaderColumns: PropTypes.array,
  visibleColumns: PropTypes.array,
  availableColumns: PropTypes.array,
};

export default withTheme(EntitiesTable);
