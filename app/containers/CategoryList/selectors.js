import { createSelector } from 'reselect';
import { Map } from 'immutable';

import {
  selectCategories,
  selectSortByQuery,
  selectSortOrderQuery,
  selectTaxonomies,
  selectActors,
  selectActions,
  selectActionCategoriesGroupedByCategory,
  selectActorCategoriesGroupedByCategory,
} from 'containers/App/selectors';

import { qe } from 'utils/quasi-equals';
import { sortEntities } from 'utils/sort';
import { NO_PARENT_KEY } from 'themes/config';
import { TAXONOMY_DEFAULT, SORT_OPTION_DEFAULT } from './constants';

export const selectTaxonomy = createSelector(
  (state, { id }) => id,
  selectTaxonomies,
  (taxonomyId, taxonomies) => {
    if (!taxonomies || taxonomies.size === 0) return null;
    const id = typeof taxonomyId !== 'undefined' ? taxonomyId : TAXONOMY_DEFAULT;
    const taxonomy = taxonomies.get(id);
    return taxonomy && taxonomy.set(
      'children',
      taxonomies.filter(
        (tax) => qe(
          id,
          tax.getIn(['attributes', 'parent_id'])
        )
      )
    ).set(
      'parent',
      taxonomies.find(
        (tax) => qe(
          taxonomy.getIn(['attributes', 'parent_id']),
          tax.get('id')
        )
      )
    );
  }
);

const getCategoryCounts = (
  taxonomyCategories,
  taxonomy,
  actions,
  actors,
  categories,
  categoryActions,
  categoryActors,
) => taxonomyCategories.map(
  (cat, catId) => {
    const catIdNo = parseInt(catId, 10);
    let counts = Map();
    let catActions;
    let catActors;
    if (taxonomy.get('children') && taxonomy.get('children').size > 0) {
      const childCats = categories.filter(
        (c) => qe(catId, c.getIn(['attributes', 'parent_id']))
      );
      catActions = childCats.reduce(
        (memo, c) => categoryActions.get(parseInt(c.get('id'), 10))
          ? memo.concat(categoryActions.get(parseInt(c.get('id'), 10)).map(((id) => actions.get(id.toString()))))
          : memo, Map()
      );
      catActors = childCats.reduce(
        (memo, c) => categoryActors.get(parseInt(c.get('id'), 10))
          ? memo.concat(categoryActors.get(parseInt(c.get('id'), 10)).map(((id) => actors.get(id.toString()))))
          : memo, Map()
      );
    } else {
      catActions = categoryActions.get(catIdNo)
        && categoryActions.get(catIdNo).map(((id) => actions.get(id.toString())));
      catActors = categoryActors.get(catIdNo)
        && categoryActors.get(catIdNo).map(((id) => actors.get(id.toString())));
    }
    if (catActions && catActions.size > 0) {
      catActions.groupBy(
        (action) => action && action.getIn(['attributes', 'measuretype_id'])
      ).forEach(
        (g, gid) => {
          counts = counts.set(`actions_${gid}`, g.size);
        }
      );
      // counts = category.set('actionCounts', counts);
    }
    if (catActors && catActors.size > 0) {
      catActors.groupBy(
        (actor) => actor && actor.getIn(['attributes', 'actortype_id'])
      ).forEach(
        (g, gid) => {
          counts = counts.set(`actors_${gid}`, g.size);
        }
      );
    }
    return counts.size > 0 ? cat.set('counts', counts) : cat;
  }
);


const selectCategoryCountGroups = createSelector(
  selectTaxonomy,
  selectActions,
  selectActors,
  selectCategories,
  selectActionCategoriesGroupedByCategory,
  selectActorCategoriesGroupedByCategory,
  (
    taxonomy,
    actions,
    actors,
    categories,
    categoryActions,
    categoryActors,
  ) => {
    if (taxonomy && actors && actions && categories && categoryActions && categoryActors) {
      const taxonomyCategories = taxonomy && categories && categories.filter(
        (cat) => qe(
          cat.getIn(['attributes', 'taxonomy_id']),
          taxonomy.get('id')
        )
      );
      if (!taxonomy.get('parent')) {
        const catCounts = getCategoryCounts(
          taxonomyCategories,
          taxonomy,
          actions,
          actors,
          categories,
          categoryActions,
          categoryActors,
        );

        return catCounts
          ? Map().set(
            taxonomy.get('id'),
            taxonomy.set('categories', catCounts)
          )
          : Map();
      }
      if (taxonomy.get('parent')) {
        const taxParentCategories = categories.filter(
          (cat) => qe(
            cat.getIn(['attributes', 'taxonomy_id']),
            taxonomy.get('parent').get('id')
          )
        );
        const taxParentCats = taxParentCategories.map(
          (parentCat) => {
            const taxChildCategories = taxonomyCategories.filter(
              (cat) => qe(
                cat.getIn(['attributes', 'parent_id']),
                parentCat.get('id')
              )
            );
            const catCounts = getCategoryCounts(
              taxChildCategories,
              taxonomy,
              actions,
              actors,
              categories,
              categoryActions,
              categoryActors,
            );
            return parentCat.set('categories', catCounts);
          }
        );
        const withoutParentCats = taxonomyCategories.filter(
          (cat) => !cat.getIn(['attributes', 'parent_id'])
        );
        if (withoutParentCats && withoutParentCats.size > 0) {
          const withoutParentCatCounts = getCategoryCounts(
            withoutParentCats,
            taxonomy,
            actions,
            actors,
            categories,
            categoryActions,
            categoryActors,
          );
          return taxParentCats.set(
            NO_PARENT_KEY,
            Map()
              .set(
                'id',
                NO_PARENT_KEY
              )
              .set(
                'type',
                'categories'
              )
              .set(
                'categories',
                withoutParentCatCounts
              )
          );
        }
        return taxParentCats;
      }
    }
    return null;
  }
);

const mapCategoryGroups = (
  categoryGroups,
  sort,
  order,
  userOnly = false,
) => {
  const sortOption = (!sort || sort === 'title') && SORT_OPTION_DEFAULT;
  const groups = categoryGroups && categoryGroups.map(
    (group) => {
      const filtered = group.get('categories').filter(
        (cat) => userOnly
          ? cat.getIn(['attributes', 'user_only'])
          : !cat.getIn(['attributes', 'user_only'])
      );
      return group.set(
        'categories',
        sortEntities(
          filtered,
          order || (sortOption ? sortOption.order : 'desc'),
          sortOption ? sortOption.field : sort, // sort by
          sortOption ? sortOption.type : 'count',
        ),
      );
    }
  );
  return sortEntities(
    groups,
    order || (sortOption ? sortOption.order : 'asc'),
    sortOption ? sortOption.field : 'title',
    sortOption ? sortOption.type : 'string',
  );
};

export const selectCategoryGroups = createSelector(
  selectCategoryCountGroups,
  selectSortByQuery,
  selectSortOrderQuery,
  (categoryGroups, sort, order) => categoryGroups
    ? mapCategoryGroups(
      categoryGroups,
      sort,
      order
    )
    : Map()
);

export const selectUserOnlyCategoryGroups = createSelector(
  selectCategoryCountGroups,
  selectSortByQuery,
  selectSortOrderQuery,
  (categoryGroups, sort, order) => categoryGroups
    ? mapCategoryGroups(
      categoryGroups,
      sort,
      order,
      true, // userOnly
    )
    : Map()
);
