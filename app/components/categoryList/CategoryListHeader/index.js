import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { reduce } from 'lodash/collection';

import ButtonSort from 'components/buttons/ButtonSort';
import Icon from 'components/Icon';
import ColumnHeader from 'components/styled/ColumnHeader';
import CategoryListKey from 'components/categoryList/CategoryListKey';

const Styled = styled.div`
  width:100%;
  background-color: ${({ isPrint }) => isPrint ? 'transparent' : palette('light', 1)};
  display: table;
  table-layout: fixed;
  margin-bottom: ${({ keyCount }) => keyCount * 20}px;
  @media print {
    margin-bottom: ${({ keyCount }) => keyCount * 15}px;
    background-color: transparent;
  }
`;


const Column = styled((p) => <ColumnHeader {...p} />)`
  position: relative;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding-right: 30px;
  }
`;

const Title = styled.span``;

const Via = styled.span`
  font-style: italic;
`;


const SortWrapper = styled.div`
  float: right;
  background-color: ${palette('light', 1)};
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding: 4px 2px 0 0;
    position: absolute;
    right: 0;
    top: 0;
    float: none;
  }
  @media (min-width: ${({ theme }) => theme.breakpointsMin.large}) {
    padding: 6px 2px 0 0;
  }
  @media print {
    display: none;
  }
`;

function CategoryListHeader({ columns, isPrintView }) {
  const keyCount = columns.reduce(
    (maxKeys, col) => {
      if (col.keys) {
        const keyItemsMax = reduce(
          col.keys,
          (maxItems, key) => {
            if (key.items && key.items.length > maxItems) {
              return key.items.length;
            }
            return maxItems;
          },
          0,
        );
        if (keyItemsMax > maxKeys) return keyItemsMax;
      }
      return maxKeys;
    },
    0,
  );
  return (
    <Styled keyCount={keyCount} isPrint={isPrintView}>
      {
        columns.map((col, i) => (
          <Column key={i} colWidth={col.width} isPrint={isPrintView}>
            <Title>
              {col.header}
              {col.via && (
                <Via>{` ${col.via}`}</Via>
              )}
              {col.by && (
                <span>{col.by}</span>
              )}
            </Title>
            {col.onClick && !isPrintView && (
              <SortWrapper>
                <ButtonSort sortActive={col.active} onClick={col.onClick}>
                  <Icon name={col.sortIcon} printHide={!col.active} />
                </ButtonSort>
              </SortWrapper>
            )}
            {col.keys && (
              <CategoryListKey keys={col.keys} />
            )}
          </Column>
        ))
      }
    </Styled>
  );
}
CategoryListHeader.propTypes = {
  columns: PropTypes.array,
  isPrintView: PropTypes.bool,
};

export default CategoryListHeader;
