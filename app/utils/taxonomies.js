import { ROUTES } from 'themes/config';
import { qe } from 'utils/quasi-equals';
import { fromJS } from 'immutable';

export const getTaxonomyTagList = (taxonomy) => {
  const tags = [];
  if (taxonomy.getIn(['attributes', 'tags_actions'])) {
    tags.push({
      type: 'actions',
      icon: 'actions',
    });
  }
  if (taxonomy.getIn(['attributes', 'tags_actors'])) {
    tags.push({
      type: 'actors',
      icon: 'actors',
    });
  }
  return tags;
};

const mapTaxonomy = (tax, childTaxonomies, activeId, onLink) => {
  const children = childTaxonomies
    .filter((t) => qe(t.getIn(['attributes', 'parent_id']), tax.get('id')))
    .toList()
    .toJS();
  return fromJS({
    id: tax.get('id'),
    count: tax.count,
    onLink: (isActive = false) => onLink(isActive ? ROUTES.TAXONOMIES : `${ROUTES.TAXONOMIES}/${tax.get('id')}`),
    active: parseInt(activeId, 10) === parseInt(tax.get('id'), 10),
    children: children && children.map((child) => ({
      id: child.id,
      child: true,
      count: child.count,
      onLink: (isActive = false) => onLink(isActive ? ROUTES.TAXONOMIES : `${ROUTES.TAXONOMIES}/${child.id}`),
      active: parseInt(activeId, 10) === parseInt(child.id, 10),
    })),
  });
};

export const prepareTaxonomyGroups = (
  taxonomies, // OrderedMap
  activeId,
  onLink,
  types,
) => {
  const parentTaxonomies = taxonomies.filter((tax) => tax.getIn(['attributes', 'parent_id']) === ''
    || tax.getIn(['attributes', 'parent_id']) === null);
  const childTaxonomies = taxonomies.filter((tax) => !!tax.getIn(['attributes', 'parent_id']));
  const groups = [];
  //
  types.forEach((type) => {
    const typeTaxonomies = parentTaxonomies
      .filter((tax) => {
        const taxTypeIds = tax.get('actortypeIds').size > 0 ? tax.get('actortypeIds') : tax.get('actiontypeIds');
        return taxTypeIds.size === 1
          && taxTypeIds.find((typeid) => qe(typeid, type.get('id')));
      })
      .map((tax) => mapTaxonomy(tax, childTaxonomies, activeId, onLink))
      .toList()
      .toJS();

    if (typeTaxonomies && typeTaxonomies.length > 0) {
      groups.push({
        id: type.get('id'),
        typeId: type.get('id'),
        taxonomies: typeTaxonomies,
      });
    }
  });
  const commonTaxonomies = parentTaxonomies
    .filter(
      (tax) => ((tax.get('actortypeIds').size > 1 && tax.get('actiontypeIds').size === 0)
        || (tax.get('actiontypeIds').size > 1 && tax.get('actortypeIds').size === 0)
      )
    );
  // common actortypes
  if (commonTaxonomies && commonTaxonomies.size > 0) {
    groups.push({
      id: 'common',
      taxonomies: commonTaxonomies
        .map((tax) => mapTaxonomy(tax, childTaxonomies, activeId, onLink))
        .toList()
        .toJS(),
    });
  }
  return groups;
};

export const getDefaultTaxonomy = (taxonomies, actortypeId) => taxonomies
  .filter((tax) => qe(tax.getIn(['attributes', 'actortype_id']), actortypeId))
  .reduce((memo, tax) => {
    if (memo) {
      const priority = tax.getIn(['attributes', 'priority']);
      if (priority && priority < memo.getIn(['attributes', 'priority'])) {
        return tax;
      }
      return memo;
    }
    return tax;
  }, null);
