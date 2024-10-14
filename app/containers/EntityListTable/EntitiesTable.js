import React from 'react';
import PropTypes from 'prop-types';
import { Box, ResponsiveContext } from 'grommet';
import styled, { css } from 'styled-components';
import { isMinSize } from 'utils/responsive';
import { scaleColorCount } from 'containers/MapContainer/utils';
import { usePrint } from 'containers/App/PrintContext';

import { MAP_OPTIONS } from 'themes/config';

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
const TableHeader = styled.thead``;
const TableBody = styled.tbody``;
const TableRow = styled.tr`
  height: 100%;
  @media print {
    height: auto;
    page-break-inside: avoid;
  }
`;
const getColWidth = ({
  col, count, colSpan = 1, inSingleView,
}) => {
  if (inSingleView) {
    return (100 / count) * colSpan;
  }
  if (count === 1) {
    return 100;
  }
  if (count === 2) {
    return col.type === 'main' ? 50 : 50;
  }
  if (count > 2) {
    if (col.type === 'main') {
      return 35;
    }
    if (col.isSingleActionColumn) {
      return 25;
    }
    if (col.hasSingleActionColumn) {
      return (40 / (count - 2)) * colSpan;
    }
    return (65 / (count - 1)) * colSpan;
  }
  // if (count === 4) {
  //   return col.type === 'main' ? 30 : (70 / (count - 1)) * colSpan;
  // }
  // if (count > 4) {
  //   return col.type === 'main' ? 25 : (75 / (count - 1)) * colSpan;
  // }
  return 0;
};
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
  border-bottom: solid 1px;
  border-bottom-color: ${({ utility, col }) => {
    if (utility && col.type === 'options') return 'rgba(0,0,0,0.05)';
    if (utility) return 'transparent';
    return 'rgba(0,0,0,0.33)';
  }};
  padding-left: ${({ col, first }) => (col.align !== 'end' && !first) ? 16 : 8}px;
  padding-right: ${({ col, last }) => (col.align === 'end' && !last) ? 16 : 8}px;
  padding-top: 6px;
  padding-bottom: 6px;
  width: 100%;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    width: ${getColWidth}%;
  }
`;
const TableCellHeaderInner = styled((p) => <Box {...p} />)`
`;
const TableCellBody = styled.td`
  margin: 0;
  padding: 0;
  font-weight: inherit;
  text-align: inherit;
  height: 100%;
  text-align: start;
  border-bottom: solid 1px #DADADA;
  padding-left: ${({ col, first }) => (col.align !== 'end' && !first) ? 20 : 8}px;
  padding-right: ${({ col, last }) => (col.align === 'end' && !last) ? 20 : 8}px;
  padding-top: 6px;
  padding-bottom: 6px;
  word-wrap:break-word;
  width: 100%;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    width: ${getColWidth}%;
  }
`;
const TableCellBodyInner = styled((p) => <Box {...p} />)`
  padding: 6px 0;
`;

const MAX_VALUE_COUNTRIES = 100;

const getColorForColumn = (col) => {
  if (!MAP_OPTIONS.GRADIENT[col.subject]) {
    return 'black';
  }
  if (col.members) {
    return scaleColorCount(MAX_VALUE_COUNTRIES, MAP_OPTIONS.GRADIENT[col.subject], false)(70);
  }
  if (col.children) {
    return scaleColorCount(MAX_VALUE_COUNTRIES, MAP_OPTIONS.GRADIENT[col.subject], false)(40);
  }
  return scaleColorCount(MAX_VALUE_COUNTRIES, MAP_OPTIONS.GRADIENT[col.subject], false)(100);
};

export function EntitiesTable({
  entities,
  canEdit,
  columns,
  headerColumns,
  onEntityClick,
  columnMaxValues,
  inSingleView,
}) {
  const size = React.useContext(ResponsiveContext);
  const isPrintView = usePrint();
  return (
    <Box fill="horizontal">
      <Table isPrint={isPrintView}>
        {headerColumns && (
          <TableHeader>
            <TableRow>
              {headerColumns.map(
                (col, i) => (isMinSize(size, 'large') || isPrintView || col.type === 'main') && (
                  <TableCellHeader
                    key={i}
                    scope="col"
                    col={col}
                    count={headerColumns.length}
                    first={i === 0}
                    last={i === headerColumns.length - 1}
                    inSingleView={inSingleView}
                  >
                    <TableCellHeaderInner fill={false} flex={{ grow: 0 }} justify="start">
                      {col.type === 'main' && (
                        <CellHeaderMain
                          column={col}
                          canEdit={canEdit && !isPrintView}
                          isPrintView={isPrintView}
                        />
                      )}
                      {(isMinSize(size, 'large') || isPrintView) && col.type !== 'main' && (
                        <CellHeaderPlain column={col} isPrintView={isPrintView} />
                      )}
                    </TableCellHeaderInner>
                  </TableCellHeader>
                )
              )}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {entities.length > 0 && entities.map((entity, key) => (
            <TableRow key={key}>
              {columns.map((col, i) => (isMinSize(size, 'large') || isPrintView || col.type === 'main') && (
                <TableCellBody
                  key={i}
                  scope="row"
                  col={col}
                  count={headerColumns.length}
                  first={i === 0}
                  last={i === headerColumns.length - 1}
                  inSingleView={inSingleView}
                >
                  <TableCellBodyInner>
                    {col.type === 'main' && (
                      <CellBodyMain
                        entity={entity[col.id]}
                        canEdit={canEdit && !isPrintView}
                        column={col}
                      />
                    )}
                    {(
                      col.type === 'plain'
                      || col.type === 'attribute'
                      || col.type === 'amount'
                      || col.type === 'userrole'
                      || col.type === 'date'
                      || col.type === 'supportlevel'
                    ) && (
                      <CellBodyPlain
                        entity={entity[col.id]}
                        column={col}
                        primary={col.type === 'userrole'}
                      />
                    )}
                    {col.type === 'plainWithDate' && (
                      <CellBodyPlainWithDate
                        entity={entity[col.id]}
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
                        onEntityClick={onEntityClick}
                        column={col}
                      />
                    )}
                    {col.type === 'indicators' && (
                      <CellBodyIndicators
                        entity={entity[col.id]}
                        onEntityClick={onEntityClick}
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
                        onEntityClick={onEntityClick}
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
                        onEntityClick={onEntityClick}
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
                    ) && (
                      <CellBodyActions
                        entity={entity[col.id]}
                        column={col}
                        onEntityClick={onEntityClick}
                      />
                    )}
                    {(
                      col.type === 'actorActions'
                      || col.type === 'actiontype'
                    ) && (
                      <CellBodyBarChart
                        value={entity[col.id].value}
                        maxvalue={Object.values(columnMaxValues).reduce((memo, val) => Math.max(memo, val), 0)}
                        subject={col.subject}
                        column={col}
                        issecondary={col.type !== 'actiontype' && (col.members || col.children)}
                        color={getColorForColumn(col)}
                        entityType="actions"
                        onEntityClick={onEntityClick}
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
                        onEntityClick={onEntityClick}
                      />
                    )}
                  </TableCellBodyInner>
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
  columns: PropTypes.array,
  columnMaxValues: PropTypes.object,
  headerColumns: PropTypes.array,
  canEdit: PropTypes.bool,
  inSingleView: PropTypes.bool,
  onEntityClick: PropTypes.func,
};

export default EntitiesTable;
