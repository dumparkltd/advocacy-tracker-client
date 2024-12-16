import React from 'react';
import Link from 'containers/Link';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import styled, { css } from 'styled-components';
import { palette } from 'styled-theme';
import { FormattedMessage } from 'react-intl';
import { getSortOption } from 'utils/sort';
import { getCategoryTitle } from 'utils/entities';
import { qe } from 'utils/quasi-equals';

import EmptyHint from 'components/fields/EmptyHint';
import CategoryListHeader from 'components/categoryList/CategoryListHeader';
import CategoryListItem from 'components/categoryList/CategoryListItem';
import { ROUTES, NO_PARENT_KEY } from 'themes/config';
import { SORT_ORDER_OPTIONS } from 'containers/App/constants';
import appMessages from 'containers/App/messages';

const Styled = styled.div`
  position: relative;
  ${({ isPrint }) => isPrint && css`pointer-events: none;`}
`;
const CategoryListBody = styled.div`
  padding-top: 5px;
`;
const GroupHeaderLink = styled(Link)`
  color: ${palette('link', 2)};
  &:hover {
    color: ${palette('linkHover', 2)};
  }
`;

const GroupHeader = styled.h6`
  font-weight: normal;
  font-style: ${({ empty }) => (empty ? 'italic' : 'normal')};
  margin-top: 6px;
  margin-bottom: 3px;
  @media (min-width: ${({ theme }) => theme && theme.breakpointsMin ? theme.breakpointsMin.medium : '769px'}) {
    margin-top: 20px;
    margin-bottom: 10px;
  }
  @media print {
    margin-top: 30px;
    margin-bottom: 6px;
    padding-bottom: 2px;
    font-weight: bold;
    font-size: ${(props) => props.theme.sizes.print.smaller};
    color: ${palette('text', 1)};
  }
`;

const TITLE_COL_RATIO = 0.4;

class CategoryListItems extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  getTagsTax = (taxonomy, tagsAttribute) => taxonomy.getIn(['attributes', tagsAttribute])
    || (
      taxonomy.get('children')
      && taxonomy.get('children').some(
        (childTax) => childTax.getIn(['attributes', tagsAttribute]),
      )
    );

  getHeaderAttributes = (taxonomy) => {
    const { intl } = this.context;
    // const actortypeSet = actortypeId && actortypeId !== 'all';
    const attributes = [];
    // directly associated objectives/actors
    if (taxonomy.get('actiontypeIds') && taxonomy.get('actiontypeIds').size > 0) {
      taxonomy.get('actiontypeIds').forEach((id) => {
        attributes.push({
          query: `actions_${id}`,
          label: intl.formatMessage(appMessages.entities[`actions_${id}`].plural),
          order: 'desc',
          type: 'count',
        });
      });
    }
    if (taxonomy.get('actortypeIds') && taxonomy.get('actortypeIds').size > 0) {
      taxonomy.get('actortypeIds').forEach((id) => {
        attributes.push({
          query: `actors_${id}`,
          label: intl.formatMessage(appMessages.entities[`actors_${id}`].plural),
          order: 'desc',
          type: 'count',
        });
      });
    }
    return attributes;
  };

  getListHeaderColumns = ({
    taxonomy,
    sortOptions,
    sortBy,
    sortOrder,
    onSort,
    userOnly,
    isGrouped,
  }) => {
    const { intl } = this.context;
    const headerAttributes = this.getHeaderAttributes(taxonomy);
    const allSortOptions = sortOptions.concat(headerAttributes);
    const sortOptionActive = getSortOption(allSortOptions, sortBy, 'query');
    const titleColumnSortOption = sortOptions.find((option) => option.query === 'title');
    const titleColumnActive = titleColumnSortOption.query === sortOptionActive.query;
    const titleColumnSortOrderOption = SORT_ORDER_OPTIONS.find((option) => (sortOrder || titleColumnSortOption.order) === option.value);
    // const headerAttributes = [];
    // category title column
    const columns = [
      {
        type: 'title',
        header: intl.formatMessage(appMessages.entities.taxonomies[taxonomy.get('id')].single),
        by: isGrouped && intl.formatMessage(
          appMessages.labels.groupedByTaxonomy,
          {
            tax: intl.formatMessage(
              appMessages.entities.taxonomies[taxonomy.getIn(['parent', 'id'])].single
            ),
          }
        ),
        width: (userOnly || headerAttributes.length === 0) ? 100 : TITLE_COL_RATIO * 100,
        active: titleColumnActive,
        sortIcon: titleColumnActive && titleColumnSortOrderOption
          ? titleColumnSortOrderOption.icon
          : 'sorting',
        onClick: () => {
          if (titleColumnActive) {
            const nextSortOrderOption = SORT_ORDER_OPTIONS.find((option) => titleColumnSortOrderOption.nextValue === option.value);
            onSort(titleColumnSortOption.query, nextSortOrderOption.value);
          } else {
            onSort(titleColumnSortOption.query, titleColumnSortOption.order);
          }
        },
      },
    ];
    // add columns for associated actors and actions
    return userOnly
      ? columns
      : columns.concat(headerAttributes.map((attribute) => {
        const columnSortOption = attribute;
        const columnActive = columnSortOption.query === sortOptionActive.query;
        const columnSortOrderOption = SORT_ORDER_OPTIONS.find((option) => (sortOrder || columnSortOption.order) === option.value);
        return {
          type: attribute.query,
          isAssociated: true,
          header: attribute.label,
          via: attribute.via,
          active: columnActive,
          width: ((1 - TITLE_COL_RATIO) / headerAttributes.length) * 100,
          sortIcon: columnActive && columnSortOrderOption
            ? columnSortOrderOption.icon
            : 'sorting',
          onClick: () => {
            if (columnActive) {
              const nextSortOrderOption = SORT_ORDER_OPTIONS.find((option) => columnSortOrderOption.nextValue === option.value);
              onSort(columnSortOption.query, nextSortOrderOption.value);
            } else {
              onSort(columnSortOption.query, columnSortOption.order);
            }
          },
        };
      }));
  };

  getCategoryMaxCount = (categoryGroups, attribute) => {
    const allCategories = categoryGroups.reduce((memo, group) => memo.concat(group.get('categories')),
      List(),);
    return allCategories.reduce(
      (countsMemo, cat) => cat.getIn(['counts', attribute.total])
        ? Math.max(cat.getIn(['counts', attribute.total]), countsMemo)
        : countsMemo,
      0,
    );
  };

  getCountAttributes = (taxonomy, headerColumns) => {
    const attributes = [];
    headerColumns.forEach((column) => {
      if (column.isAssociated) {
        attributes.push({
          total: column.type,
          entity: 'actors',
          width: column.width,
        });
      }
    });
    return attributes;
  };

  getListColumns = ({
    taxonomy,
    categoryGroups,
    userOnly,
    headerColumns,
  }) => {
    const countAttributes = this.getCountAttributes(taxonomy, headerColumns);
    // category title column
    const columns = [
      {
        type: 'title',
        width: (userOnly || !taxonomy || countAttributes.length === 0) ? 100 : TITLE_COL_RATIO * 100,
      },
    ];
    // add columns for associated actors and actions
    return (userOnly || !taxonomy)
      ? columns
      : columns.concat(
        countAttributes.map((attribute) => ({
          type: 'count',
          width: attribute.width,
          maxCount: this.getCategoryMaxCount(categoryGroups, attribute),
          attribute,
        }))
      );
  };

  render() {
    const {
      taxonomy,
      categoryGroups,
      onPageLink,
      sortOptions,
      sortBy,
      sortOrder,
      onSort,
      userOnly,
      isPrintView,
    } = this.props;
    const headerColumns = this.getListHeaderColumns({
      taxonomy,
      sortOptions,
      sortBy,
      sortOrder,
      onSort,
      userOnly,
      isGrouped: categoryGroups.size > 0 && !!taxonomy.get('parent'),
    });

    const columns = this.getListColumns({
      taxonomy,
      categoryGroups,
      userOnly,
      headerColumns,
    });
    return (
      <Styled isPrint={isPrintView}>
        <CategoryListHeader columns={headerColumns} isPrintView={isPrintView} />
        <CategoryListBody>
          {categoryGroups && categoryGroups.size > 0 && categoryGroups.valueSeq().toArray().map((group) => {
            if (group.get('categories') && group.get('type') === 'categories') {
              return (
                <span key={group.get('id')}>
                  {!qe(group.get('id'), NO_PARENT_KEY) && (
                    <GroupHeaderLink to={`${ROUTES.CATEGORY}/${group.get('id')}`}>
                      <GroupHeader>
                        {getCategoryTitle(group)}
                      </GroupHeader>
                    </GroupHeaderLink>
                  )}
                  {qe(group.get('id'), NO_PARENT_KEY) && (
                    <GroupHeader empty>
                      <FormattedMessage {...appMessages.entities.categories.noParentsAssociated} />
                    </GroupHeader>
                  )}
                  {group.get('categories').map((cat) => (
                    <CategoryListItem
                      key={cat.get('id')}
                      category={cat}
                      columns={columns}
                      onPageLink={onPageLink}
                    />
                  ))}
                  {group.get('categories').size === 0 && (
                    <EmptyHint>
                      <FormattedMessage {...appMessages.entities.categories.noChildrenAssociated} />
                    </EmptyHint>
                  )}
                </span>
              );
            }
            if (group.get('categories') && group.get('type') !== 'categories') {
              return (
                <span key={group.get('id')}>
                  {group.get('categories').map((cat) => (
                    <CategoryListItem
                      key={cat.get('id')}
                      category={cat}
                      columns={columns}
                      onPageLink={onPageLink}
                      isPrintView={isPrintView}
                    />
                  ))}
                  {group.get('categories').size === 0 && (
                    <EmptyHint>
                      <FormattedMessage {...appMessages.entities.categories.empty} />
                    </EmptyHint>
                  )}
                </span>
              );
            }
            return null;
          })}
          {(!categoryGroups || categoryGroups.size === 0) && (
            <EmptyHint>
              <FormattedMessage {...appMessages.entities.categories.empty} />
            </EmptyHint>
          )}
        </CategoryListBody>
      </Styled>
    );
  }
}

CategoryListItems.propTypes = {
  categoryGroups: PropTypes.object,
  taxonomy: PropTypes.object,
  onPageLink: PropTypes.func,
  onSort: PropTypes.func,
  sortOptions: PropTypes.array,
  sortBy: PropTypes.string,
  sortOrder: PropTypes.string,
  userOnly: PropTypes.bool,
  isPrintView: PropTypes.bool,
};

CategoryListItems.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default CategoryListItems;
