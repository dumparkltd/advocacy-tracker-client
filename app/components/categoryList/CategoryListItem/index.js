import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import ItemStatus from 'components/ItemStatus';
import Clear from 'components/styled/Clear';
import { ROUTES } from 'themes/config';

const Styled = styled.button`
  width: 100%;
  cursor: pointer;
  text-align: left;
  color: ${palette('mainListItem', 0)};
  background-color: ${palette('mainListItem', 1)};
  margin: 0;
  padding: 5px 0;
  display: block;
  margin-bottom: 2px;
  line-height: 1.428571429;
  border-top: ${({ isPrint }) => isPrint ? 1 : 0}px solid ${palette('light', 1)};
  &:hover {
    color: ${palette('mainListItemHover', 0)};
    background-color: ${palette('mainListItemHover', 1)};
  }
  @media print {
    padding: 1em 0;
    border-top: 1px solid ${palette('light', 1)};
  }
`;
const TableWrap = styled.div`
  width:100%;
  display: table;
  table-layout: fixed;
`;

const Column = styled.div`
  width: ${(props) => props.colWidth}%;
  display: table-cell;
  vertical-align: middle;
`;
const BarWrap = styled.div`
  width:100%;
  vertical-align: middle;
  font-size: 0px;
  padding: 4px 6px;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    padding-right: ${({ secondary }) => secondary ? 36 : 18}px;
    padding-left: 40px;
  }
  @media print {
    padding-top: 4px;
    padding-right: ${({ secondary }) => secondary ? 24 : 14}px;
    padding-bottom: 4px;
    padding-left: 24px;
  }
`;
const Bar = styled.div`
  width: ${({ length }) => length}%;
  background-color: ${(props) => palette(props.palette, props.pIndex || 0)};
  vertical-align: middle;
  display: inline-block;
  position: relative;
  border-right: ${({ secondary }) => secondary ? '1px solid' : 0};
  border-right-color: ${palette('mainListItem', 1)};
  height: ${({ multiple }) => multiple ? 8 : 16}px;
  @media (min-width: ${({ theme }) => theme.breakpoints.xlarge}) {
    height: ${({ multiple }) => multiple ? 12 : 24}px;
  }
  @media print {
    z-index: 0;
    &:before {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      z-index: -1;
      border-bottom: ${(props) => (props.multiple ? 8 : 16)}px solid ${(props) => palette(props.palette, props.pIndex || 0)};
    }
  }
`;
const Count = styled.div`
  display: none;
  position: absolute;
  line-height: ${({ multiple }) => multiple ? 8 : 16}px;
  left: 0;
  bottom: 100%;
  padding: 2px 0;
  color: ${(props) => palette(props.palette, 0)};
  white-space: nowrap;
  @media print, (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    display: block;
    font-size: ${({ theme, multiple }) => multiple ? theme.sizes.text.default : theme.sizes.text.aaLargeBold};
    font-weight: bold;
    text-align: right;
    padding: 0 5px 0 0;
    right: 100%;
    bottom: auto;
    left: auto;
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.xlarge}) {
    line-height: ${({ multiple }) => multiple ? 12 : 24}px;
  }
  @media print {
    font-size: ${({ theme }) => theme.sizes.print.default};
    font-weight: regular;
  }
`;
const CountSecondary = styled(Count)`
  right: 0;
  top: 100%;
  color: ${(props) => palette(props.palette, 1)};
  @media print, (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    text-align: left;
    padding: 0 0 0 5px;
    left: 100%;
    right: auto;
    bottom: auto;
    top: auto;
  }
`;
const Title = styled.div`
  display: inline-block;
  padding: ${({ isPrint }) => isPrint ? 0 : '0px 4px'};
  width: 100%;
  font-size: ${({ theme }) => theme.sizes.text.smaller};
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    padding: ${({ isPrint }) => isPrint ? 0 : '4px 8px'};
    font-size: ${({ theme }) => theme.sizes.text.default};
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.xlarge}) {
    padding: ${({ isPrint }) => isPrint ? 0 : '8px 18px'};
    font-size: ${({ theme }) => theme.sizes.text.aaLargeBold};
  }
  @media print {
    font-size: ${({ theme }) => theme.sizes.print.default};
    padding: 0;
  }
`;
const StatusWrap = styled.div`
  padding: 0 18px;
`;
const WrapAcceptedBars = styled.span`
  height: ${({ multiple }) => multiple ? 10 : 15}px;
  @media (min-width: ${({ theme }) => theme.breakpoints.xlarge}) {
    height: ${({ multiple }) => multiple ? 15 : 25}px;
  }
`;

class CategoryListItem extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  renderSimpleBar = (col, total, multiple) => (
    <Bar
      length={(total / col.maxCount) * 100}
      palette={col.attribute.entity}
      multiple={multiple}
    >
      <Count palette={col.attribute.entity} multiple={multiple}>
        {total}
      </Count>
    </Bar>
  );

  renderAcceptedBar = (col, total, accepted, multiple) => {
    const noted = total - accepted;
    return (
      <WrapAcceptedBars multiple={multiple}>
        <Bar
          length={(accepted / col.maxCount) * 100}
          palette={col.attribute.entity}
          secondary
          multiple={multiple}
        >
          <Count palette={col.attribute.entity} multiple={multiple}>
            {accepted}
          </Count>
        </Bar>
        {noted > 0
          && (
            <Bar
              length={(noted / col.maxCount) * 100}
              palette={col.attribute.entity}
              pIndex={1}
              multiple={multiple}
            >
              <CountSecondary palette={col.attribute.entity} multiple={multiple}>
                {noted}
              </CountSecondary>
            </Bar>
          )
        }
      </WrapAcceptedBars>
    );
  };

  renderCountColumn = (col, category) => {
    if (!col.attribute) {
      return null;
    }
    if (!category.counts) {
      return (
        <BarWrap>
          {this.renderSimpleBar(col, 0)}
        </BarWrap>
      );
    }
    const total = category.counts[col.attribute.total] || 0;
    return (
      <BarWrap>
        {this.renderSimpleBar(col, total)}
      </BarWrap>
    );
    // return null;
  };

  render() {
    const {
      category, columns, onPageLink, isPrintView,
    } = this.props;
    // return null;
    const catItem = {
      id: category.get('id'),
      title: category.getIn(['attributes', 'title']),
      draft: category.getIn(['attributes', 'draft']),
    };

    return (
      <Styled
        isPrint={isPrintView}
        onClick={() => onPageLink(`${ROUTES.CATEGORY}/${catItem.id}`)}
      >
        <TableWrap>
          {
            columns.map((col, i) => (
              <Column
                key={i}
                colWidth={col.width}
                multiple={
                  col.attribute
                  && col.attribute.actortypeIds
                  && col.attribute.actortypeIds.length > 1
                }
              >
                {col.type === 'title' && catItem.draft && (
                  <StatusWrap>
                    <ItemStatus draft />
                    <Clear />
                  </StatusWrap>
                )}
                {col.type === 'title' && (
                  <Title isPrint={isPrintView}>
                    {catItem.title}
                  </Title>
                )}
                {col.type === 'count'
                  && this.renderCountColumn(col, category.toJS())
                }
              </Column>
            ))
          }
        </TableWrap>
      </Styled>
    );
  }
}

CategoryListItem.propTypes = {
  category: PropTypes.object,
  columns: PropTypes.array,
  onPageLink: PropTypes.func,
  isPrintView: PropTypes.bool,
};

CategoryListItem.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default CategoryListItem;
