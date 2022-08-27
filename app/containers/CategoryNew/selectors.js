import { createSelector } from 'reselect';
import { List } from 'immutable';

import {
  selectEntity,
  selectEntities,
  selectActortypeTaxonomies,
  selectTaxonomy,
  selectTaxonomies,
  selectCategories,
  selectActorsCategorised,
  selectActionsCategorised,
} from 'containers/App/selectors';

import { USER_ROLES, API } from 'themes/config';

import {
  usersByRole,
  prepareTaxonomiesMultipleTags,
} from 'utils/entities';
import { qe } from 'utils/quasi-equals';

export const selectDomain = createSelector(
  (state) => state.get('categoryNew'),
  (substate) => substate
);

export const selectParentOptions = createSelector(
  selectTaxonomy,
  selectCategories,
  selectTaxonomies,
  (taxonomy, categories, taxonomies) => {
    if (taxonomy && taxonomies && categories) {
      const taxonomyParentId = taxonomy.getIn(['attributes', 'parent_id']);
      return taxonomyParentId
        ? categories.filter(
          (otherCategory) => {
            const otherTaxonomy = taxonomies.find(
              (tax) => qe(
                otherCategory.getIn(['attributes', 'taxonomy_id']),
                tax.get('id')
              )
            );
            return otherTaxonomy
              ? qe(taxonomyParentId, otherTaxonomy.get('id'))
              : null;
          }
        )
        : null;
    }
    return null;
  }
);

export const selectParentTaxonomy = createSelector(
  (state, id) => selectEntity(state, { path: API.TAXONOMIES, id }),
  selectTaxonomies,
  (taxonomy, taxonomies) => {
    if (taxonomy && taxonomies) {
      return taxonomies.find(
        (tax) => qe(
          taxonomy.getIn(['attributes', 'parent_id']),
          tax.get('id')
        )
      );
    }
    return null;
  }
);


// all users of role manager
export const selectUsers = createSelector(
  (state) => selectEntities(state, API.USERS),
  (state) => selectEntities(state, API.USER_ROLES),
  (entities, associations) => usersByRole(
    entities,
    associations,
    USER_ROLES.MANAGER.value,
  )
);

export const selectConnectedTaxonomies = createSelector(
  (state) => selectActortypeTaxonomies(state),
  selectCategories,
  (taxonomies, categories) => prepareTaxonomiesMultipleTags(
    taxonomies,
    categories,
    ['tags_actions', 'tags_actors'],
  )
);
const selectIsParentTaxonomy = createSelector(
  (state, id) => selectEntity(state, { path: API.TAXONOMIES, id }),
  selectTaxonomies,
  (taxonomy, taxonomies) => {
    if (taxonomy && taxonomies) {
      // has any child taxonomies?
      return taxonomies.some(
        (tax) => qe(
          tax.getIn(['attributes', 'parent_id']),
          taxonomy.get('id'),
        ),
      );
    }
    return false;
  }
);

export const selectActorsByActortype = createSelector(
  (state, id) => id, // taxonomy id
  (state) => selectEntities(state, API.ACTORTYPE_TAXONOMIES),
  (state) => selectActorsCategorised(state),
  selectIsParentTaxonomy,
  (id, actortypeTaxonomies, entities, isParent) => {
    if (isParent || !actortypeTaxonomies || !entities) {
      return null;
    }
    // actortype id for category
    const actortypeIds = actortypeTaxonomies.reduce(
      (memo, actortypet) => qe(
        id,
        actortypet.getIn(['attributes', 'taxonomy_id'])
      )
        ? memo.push(actortypet.getIn(['attributes', 'actortype_id']))
        : memo,
      List(),
    );
    return entities.filter(
      (r) => actortypeIds.find(
        (actortypeid) => qe(
          actortypeid,
          r.getIn(['attributes', 'actortype_id'])
        )
      )
    ).groupBy(
      (r) => r.getIn(['attributes', 'actortype_id']).toString()
    );
  }
);

export const selectActions = createSelector(
  (state) => selectActionsCategorised(state),
  selectIsParentTaxonomy,
  (entities, isParent) => isParent
    ? null
    : entities
);
