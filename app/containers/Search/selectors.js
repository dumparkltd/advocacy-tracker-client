import { createSelector } from 'reselect';
import { Map, List, fromJS } from 'immutable';
// import { reduce } from 'lodash/collection';

import {
  selectActortypeEntitiesAll,
  selectSearchQuery,
  selectSortByQuery,
  selectSortOrderQuery,
  selectActortypeTaxonomies,
  selectActortypes,
} from 'containers/App/selectors';

import { filterEntitiesByKeywords } from 'utils/entities';
import { qe } from 'utils/quasi-equals';

import { sortEntities, getSortOption } from 'utils/sort';

import { CONFIG } from './constants';


const selectPathQuery = createSelector(
  (state, locationQuery) => locationQuery,
  (locationQuery) => locationQuery && locationQuery.get('path')
);

// kicks off series of cascading selectors
export const selectEntitiesByQuery = createSelector(
  selectSearchQuery,
  selectActortypeEntitiesAll,
  selectActortypeTaxonomies,
  selectActortypes,
  selectPathQuery,
  selectSortByQuery,
  selectSortOrderQuery,
  (searchQuery, allEntities, taxonomies, actortypes, path, sort, order) => {
    let active = false;// || CONFIG.search[0].targets[0].path;
    return fromJS(CONFIG.search).map((group) => {
      if (group.get('group') === 'taxonomies') {
        return group.set('targets', taxonomies.map((tax) => {
          const categories = allEntities
            .get('categories')
            .filter((cat) => qe(tax.get('id'), cat.getIn(['attributes', 'taxonomy_id'])))
            .map((cat) => group.get('search').reduce((memo, attribute) => memo.setIn(['attributes', attribute.get('as')], tax.getIn(['attributes', attribute.get('attribute')])),
              cat));

          const filteredCategories = searchQuery
            ? filterEntitiesByKeywords(
              categories,
              searchQuery,
              group.get('categorySearch').valueSeq().toArray()
            )
            : categories;
          if (path === `taxonomies-${tax.get('id')}` || (!path && !active && filteredCategories.size > 0)) {
            active = true;
            const sortOption = getSortOption(group.get('sorting') && group.get('sorting').toJS(), sort);
            return Map()
              .set('path', `taxonomies-${tax.get('id')}`)
              // .set('icon', `taxonomy_${tax.get('id')}`)
              .set('clientPath', 'category')
              .set('taxId', tax.get('id'))
              .set('active', searchQuery && true)
              .set('sorting', group.get('sorting'))
              .set('results', sortEntities(filteredCategories,
                order || (sortOption ? sortOption.order : 'desc'),
                sort || (sortOption ? sortOption.attribute : 'id'),
                sortOption ? sortOption.type : 'number'));
          }
          return Map()
            .set('path', `taxonomies-${tax.get('id')}`)
            .set('clientPath', 'category')
            .set('taxId', tax.get('id'))
            .set('results', filteredCategories);
        }));
      }
      return group.set(
        'targets',
        group.get('targets')
          .filter((target) => !!target)
          .reduce(
            (memo, target) => {
              const targetEntties = allEntities.get(target.get('path'));
              // target by actortype
              if (actortypes && target.get('groupByType')) {
                return actortypes.reduce((innerMemo, actortype) => {
                  const actortypeEntities = targetEntties
                    .filter(
                      (entity) => qe(
                        entity.getIn(['attributes', 'actortype_id']),
                        actortype.get('id'),
                      )
                    );
                  const filteredEntities = searchQuery
                    ? filterEntitiesByKeywords(
                      actortypeEntities,
                      searchQuery,
                      target.get('search').valueSeq().toArray()
                    )
                    : actortypeEntities;
                  const actortypeTargetPath = `${target.get('path')}_${actortype.get('id')}`;
                  const actortypeTarget = target
                    .set('clientPath', target.get('path'))
                    .set('path', actortypeTargetPath);

                  // if filtered by path
                  if (
                    path === actortypeTargetPath
                  || (
                    !path
                    && !active
                    && filteredEntities.size > 0
                  )
                  ) {
                    active = true;
                    // only sort the active entities that will be displayed
                    const sortOption = getSortOption(actortypeTarget.get('sorting') && actortypeTarget.get('sorting').toJS(), sort);
                    return innerMemo.push(
                      actortypeTarget
                        .set('active', searchQuery && true)
                        .set('results', sortEntities(
                          filteredEntities,
                          order || (sortOption ? sortOption.order : 'desc'),
                          sort || (sortOption ? sortOption.attribute : 'id'),
                          sortOption ? sortOption.type : 'number'
                        ))
                    );
                  }
                  return innerMemo.push(actortypeTarget.set('results', filteredEntities));
                }, memo);
              }
              // regular target
              const filteredEntities = searchQuery
                ? filterEntitiesByKeywords(
                  targetEntties,
                  searchQuery,
                  target.get('search').valueSeq().toArray()
                )
                : allEntities.get(target.get('path'));

              // if filtered by path
              if (
                path === target.get('path')
              || (
                !path
                && !active
                && filteredEntities.size > 0
              )
              ) {
                active = true;
                // only sort the active entities that will be displayed
                const sortOption = getSortOption(target.get('sorting') && target.get('sorting').toJS(), sort);
                return memo.push(
                  target
                    .set('active', searchQuery && true)
                    .set('results', sortEntities(
                      filteredEntities,
                      order || (sortOption ? sortOption.order : 'desc'),
                      sort || (sortOption ? sortOption.attribute : 'id'),
                      sortOption ? sortOption.type : 'number'
                    ))
                );
              }
              return memo.push(target.set('results', filteredEntities));
            },
            List(),
          )
      );
    });
  }
);
