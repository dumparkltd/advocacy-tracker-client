import { STATES as CHECKBOX_STATES } from 'components/forms/IndeterminateCheckbox';
import { Map } from 'immutable';

import appMessage from 'utils/app-message';
import isNumber from 'utils/is-number';
import qe from 'utils/quasi-equals';
import asList from 'utils/as-list';
import { formatNumber, checkEmpty } from 'utils/fields';
import { lowerCase } from 'utils/string';

import {
  getEntityTitle,
  getEntityPath,
  getIndicatorMainTitle,
} from 'utils/entities';

import appMessages from 'containers/App/messages';
import {
  API,
  USER_ROLES,
  ACTION_INDICATOR_SUPPORTLEVELS,
} from 'themes/config';

export const prepareHeader = ({
  columns,
  // config,
  sortBy,
  sortOrder,
  onSort,
  onSelectAll,
  selectedState,
  title,
  intl,
}) => columns.map(
  (col) => {
    let label = col.label || col.title || null;
    const sortActive = sortBy === col.id;
    switch (col.type) {
      case 'main':
        return ({
          ...col,
          title,
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
          onSelect: onSelectAll,
          selectedState,
        });
      case 'amount':
        return ({
          ...col,
          title: col.unit
            ? `${intl.formatMessage(appMessages.attributes[col.attribute])} (${col.unit})`
            : intl.formatMessage(appMessages.attributes[col.attribute]),
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'date':
        return ({
          ...col,
          title: 'Date',
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'desc',
          onSort,
        });
      case 'attribute':
        return ({
          ...col,
          title: intl.formatMessage(appMessages.attributes[col.attribute]),
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'userrole':
        return ({
          ...col,
          title: 'User role',
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'actorsViaChildren':
        return ({
          ...col,
          title: 'Indirect stakeholders',
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
          info: {
            type: 'text',
            title: 'Indirect stakeholders',
            text: 'From sub-activities, e.g tasks',
          },
        });
      case 'actors':
      case 'userActors':
        return ({
          ...col,
          title: 'Stakeholders',
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'viaGroups':
        return ({
          ...col,
          title: 'As member of',
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'positionStatement':
        return ({
          ...col,
          title: 'Statement',
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'positionStatementAuthority':
        return ({
          ...col,
          title: 'Level of authority',
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'users':
        return ({
          ...col,
          title: 'WWF staff',
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'indicators':
        return ({
          ...col,
          title: 'Topics',
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
          info: {
            type: 'key-categorical',
            attribute: 'supportlevel_id',
            options: Object.values(ACTION_INDICATOR_SUPPORTLEVELS)
              .sort((a, b) => a.order < b.order ? -1 : 1)
              .map((level) => ({
                ...level,
                label: intl.formatMessage(appMessages.supportlevels[level.value]),
              })),
          },
        });
      case 'associations':
        return ({
          ...col,
          title: col.title || 'Member of',
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'members':
        return ({
          ...col,
          title: col.title || 'Members',
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'childActions':
        return ({
          ...col,
          title: col.title || 'Sub-activities',
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'parentActions':
        return ({
          ...col,
          title: col.title || 'Activities',
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'actiontype':
        return ({
          ...col,
          title: appMessages.entities[`actions_${col.actiontype_id}`]
            ? intl.formatMessage(appMessages.entities[`actions_${col.actiontype_id}`].pluralShort)
            : 'Activities',
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'taxonomy':
        return ({
          ...col,
          title: appMessages.entities.taxonomies[col.taxonomy_id]
            ? intl.formatMessage(appMessages.entities.taxonomies[col.taxonomy_id].shortSingle)
            : 'Categories',
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'hasResources':
        return ({
          ...col,
          title: appMessages.entities[`resources_${col.resourcetype_id}`]
            ? intl.formatMessage(appMessages.entities[`resources_${col.resourcetype_id}`].singleShort)
            : 'Resource',
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'resourceActions':
      case 'indicatorActions':
      case 'actorActions':
        if (!label) {
          label = 'Activities';
          if (col.members) {
            label = 'Activities as member';
          } else if (col.children) {
            label = 'Activities as parent';
          }
        }
        return ({
          ...col,
          title: label,
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'userActions':
        label = label || 'Assigned to';
        return ({
          ...col,
          title: label,
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'actionsSimple':
        if (!label) {
          label = 'Activities';
        }
        return ({
          ...col,
          title: label,
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'supportlevel':
        return ({
          ...col,
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'stackedBarActions':
        return ({
          ...col,
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'topicPosition':
        return ({
          ...col,
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'desc',
          onSort,
        });
      default:
        return col;
    }
  }
);

const getRelatedEntities = (
  relatedIDs,
  connections,
  column,
  connectionAttributeValues,
  connectionAttributes,
) => {
  if (relatedIDs && relatedIDs.size > 0) {
    return relatedIDs.reduce(
      (memo, relatedID, entityId) => {
        if (connections.get(relatedID.toString())) {
          let entityConnection = connections.get(relatedID.toString());
          if (connectionAttributeValues) {
            const myConnectionAttributeValues = connectionAttributeValues.get(entityId.toString());
            entityConnection = connectionAttributes.reduce(
              (memo2, attribute) => {
                const value = myConnectionAttributeValues.get(attribute.attribute);
                return memo2.set(
                  attribute.optionAs,
                  attribute.options[value],
                );
              },
              entityConnection,
            );
          }
          return memo.set(relatedID, entityConnection);
        }
        return memo;
      },
      Map(),
    );
  }
  return null;
};
const getRelatedSortValue = (relatedEntities) => {
  if (relatedEntities && relatedEntities.size > 0) {
    if (relatedEntities.size > 1) {
      return getRelatedValue(relatedEntities);
    }
    const entity = relatedEntities.first();
    return typeof entity.getIn(['attributes', 'reference']) !== 'undefined'
      && entity.getIn(['attributes', 'reference']) !== null
      && entity.getIn(['attributes', 'reference']).trim().length > 0
      ? entity.getIn(['attributes', 'reference'])
      : getEntityTitle(entity);
  }
  return null;
};

const getRelatedValue = (relatedEntities, typeLabel, includeLabel = false, first = false) => {
  if (relatedEntities && relatedEntities.size > 0) {
    if (relatedEntities.size > 1 && !first) {
      return (typeLabel && includeLabel)
        ? `${relatedEntities.size} ${lowerCase(typeLabel)}`
        : relatedEntities.size;
    }
    return getEntityTitle(relatedEntities.first());
  }
  return null;
};
const getSingleRelatedValueFromAttributes = (relatedEntity) => relatedEntity
  ? relatedEntity.get('name') || relatedEntity.get('title')
  : null;

// TODO move to utils/entities
export const getValueFromPositions = (positions) => {
  const latest = positions && positions.first();
  return latest && latest.get('supportlevel_id') && parseInt(latest.get('supportlevel_id'), 10);
};
const getColorFromPositions = (positions) => {
  const value = getValueFromPositions(positions);
  const level = value && ACTION_INDICATOR_SUPPORTLEVELS[parseInt(value, 10)];
  if (level) {
    return level.color;
  }
  return ACTION_INDICATOR_SUPPORTLEVELS[99].color;
};
// const getLevelFromPositions = (positions) => {
//   const value = getValueFromPositions(positions);
//   const level = value && ACTION_INDICATOR_SUPPORTLEVELS[parseInt(value, 10)];
//   return level || ACTION_INDICATOR_SUPPORTLEVELS[99];
// };

export const prepareEntityRows = ({
  entities,
  columns,
  entityIdsSelected,
  url,
  onEntitySelect,
  connections,
  taxonomies,
  resources,
  intl,
  includeMembers,
  includeChildren,
}) => entities.reduce(
  (memoEntities, entity) => {
    const id = entity.get('id');
    // console.log(connections && connections.toJS())
    const entityValues = columns.reduce(
      (memoEntity, col) => {
        const path = getEntityPath(entity);
        let relatedEntities;
        let relatedEntityIds;
        let temp;
        let attribute;
        let value;
        let sortValue = null;
        // console.log(col)
        // let formattedDate;
        if (col.attribute) {
          value = entity.getIn(['attributes', col.attribute]);
          if (!checkEmpty(value) && col.fallbackAttribute) {
            value = entity.getIn(['attributes', col.fallbackAttribute]);
          }
        }
        switch (col.type) {
          case 'main':
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                values: col.attributes.reduce(
                  (memo, att) => {
                    let attVal = att === 'title'
                      ? attVal = getEntityTitle(entity)
                      : entity.getIn(['attributes', att]);
                    return ({ ...memo, [att]: attVal });
                  },
                  {}
                ),
                draft: entity.getIn(['attributes', 'draft']),
                archived: entity.getIn(['attributes', 'is_archive']),
                noNotifications: entity.getIn(['attributes', 'notifications']) === false,
                private: entity.getIn(['attributes', 'private']),
                sortValue: entity.getIn(['attributes', col.sort || 'title']),
                selected: entityIdsSelected && entityIdsSelected.includes(id),
                id,
                path,
                href: url || `${path}/${id}`,
                onSelect: (checked) => onEntitySelect(id, checked),
              },
            };
          case 'attribute':
            return {
              ...memoEntity,
              [col.id]: { ...col, value },
            };
          case 'amount':
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: isNumber(value) && formatNumber(value, { intl }),
                draft: entity.getIn(['attributes', 'draft']),
                sortValue: entity.getIn(['attributes', col.sort])
                  && parseFloat(entity.getIn(['attributes', col.sort]), 10),
              },
            };
          case 'date':
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: value && intl.formatDate(value),
                draft: entity.getIn(['attributes', 'draft']),
                sortValue: value,
              },
            };
          case 'actionsSimple':
            attribute = col.actions || 'actions';
            temp = entity.get(attribute) || (entity.get(`${attribute}ByType`) && entity.get(`${attribute}ByType`).flatten(true));
            relatedEntities = getRelatedEntities(temp, connections.get('measures'), col);
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: getRelatedValue(relatedEntities, col.label || 'actions'),
                single: relatedEntities && relatedEntities.size === 1 && relatedEntities.first(),
                tooltip: relatedEntities && relatedEntities.size > 1
                  && relatedEntities.groupBy((t) => t.getIn(['attributes', 'measuretype_id'])),
                multiple: relatedEntities && relatedEntities.size > 1,
                sortValue: getRelatedSortValue(relatedEntities),
              },
            };
          case 'actorsViaChildren':
            temp = entity.get('actorsViaChildren');
            relatedEntities = getRelatedEntities(temp, connections.get('actors'), col);
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: getRelatedValue(relatedEntities, col.label || 'actors'),
                single: relatedEntities && relatedEntities.size === 1 && relatedEntities.first(),
                tooltip: relatedEntities && relatedEntities.size > 1
                  && relatedEntities.groupBy((t) => t.getIn(['attributes', 'actortype_id'])),
                multiple: relatedEntities && relatedEntities.size > 1,
                sortValue: getRelatedSortValue(relatedEntities),
              },
            };
          case 'users':
            temp = entity.get('users');
            relatedEntities = getRelatedEntities(temp, connections.get('users'), col);
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: getRelatedValue(relatedEntities, col.label || 'users'),
                single: relatedEntities && relatedEntities.size === 1 && relatedEntities.first(),
                tooltip: relatedEntities,
                multiple: relatedEntities && relatedEntities.size > 1,
                sortValue: getRelatedSortValue(relatedEntities),
              },
            };
          case 'indicators':
            temp = entity.get('indicators');
            relatedEntities = getRelatedEntities(
              temp,
              connections.get('indicators'),
              col,
              entity.get('indicatorConnections'),
              [{
                attribute: 'supportlevel_id',
                options: ACTION_INDICATOR_SUPPORTLEVELS,
                optionAs: 'supportlevel',
              }],
            );
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: getRelatedValue(relatedEntities, col.label || 'topics'),
                single: relatedEntities && relatedEntities.size === 1 && relatedEntities.first(),
                tooltip: relatedEntities
                  && relatedEntities.size > 1
                  && relatedEntities.groupBy((t) => t.getIn(['supportlevel', 'value']) || '0'),
                multiple: relatedEntities && relatedEntities.size > 1,
                sortValue: getRelatedSortValue(relatedEntities),
              },
            };
          case 'actors':
          case 'userActors':
            temp = entity.get('actors') || (entity.get('actorsByType') && entity.get('actorsByType').flatten(true));
            relatedEntities = getRelatedEntities(temp, connections.get('actors'), col);
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: getRelatedValue(relatedEntities, col.label || 'actors'),
                single: relatedEntities && relatedEntities.size === 1 && relatedEntities.first(),
                tooltip: relatedEntities && relatedEntities.size > 1
                  && relatedEntities.groupBy((t) => t.getIn(['attributes', 'actortype_id'])),
                multiple: relatedEntities && relatedEntities.size > 1,
                sortValue: getRelatedSortValue(relatedEntities),
              },
            };
          case 'viaGroups':
            relatedEntities = entity.getIn(['position', 'viaGroups']);
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: getRelatedValue(relatedEntities),
                single: relatedEntities && relatedEntities.size === 1 && relatedEntities.first(),
                multiple: relatedEntities && relatedEntities.size > 1,
                tooltip: relatedEntities && relatedEntities.size > 1
                  && relatedEntities.groupBy((t) => t.getIn(['attributes', 'actortype_id'])),
                sortValue: getRelatedSortValue(relatedEntities),
              },
            };
          case 'members':
            temp = entity.get('members') || (entity.get('membersByType') && entity.get('membersByType').flatten(true));
            relatedEntities = getRelatedEntities(temp, connections.get('actors'), col);
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: getRelatedValue(relatedEntities, 'members'),
                single: relatedEntities && relatedEntities.size === 1 && relatedEntities.first(),
                tooltip: relatedEntities && relatedEntities.size > 1
                  && relatedEntities.groupBy((t) => t.getIn(['attributes', 'actortype_id'])),
                multiple: relatedEntities && relatedEntities.size > 1,
                sortValue: getRelatedSortValue(relatedEntities),
              },
            };
          case 'associations':
            temp = entity.get('associations') || (entity.get('associationsByType') && entity.get('associationsByType').flatten(true));

            relatedEntities = getRelatedEntities(temp, connections.get('actors'), col);
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: getRelatedValue(relatedEntities, 'memberships'),
                single: relatedEntities && relatedEntities.size === 1 && relatedEntities.first(),
                tooltip: relatedEntities && relatedEntities.size > 1
                  && relatedEntities.groupBy((t) => t.getIn(['attributes', 'actortype_id'])),
                multiple: relatedEntities && relatedEntities.size > 1,
                sortValue: getRelatedSortValue(relatedEntities),
              },
            };
          case 'childActions':
            temp = entity.get('children') || (entity.get('childrenByType') && entity.get('childrenByType').flatten(true));
            relatedEntities = getRelatedEntities(temp, connections.get('measures'), col);
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: getRelatedValue(relatedEntities, 'children'),
                single: relatedEntities && relatedEntities.size === 1 && relatedEntities.first(),
                tooltip: relatedEntities && relatedEntities.size > 1
                  && relatedEntities.groupBy((t) => t.getIn(['attributes', 'measuretype_id'])),
                multiple: relatedEntities && relatedEntities.size > 1,
                sortValue: getRelatedSortValue(relatedEntities),
              },
            };
          case 'parentActions':
            temp = entity.get('parents') || (entity.get('parentsByType') && entity.get('parentsByType').flatten(true));
            relatedEntities = getRelatedEntities(temp, connections.get('measures'), col);
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: getRelatedValue(relatedEntities, 'parents'),
                single: relatedEntities && relatedEntities.size === 1 && relatedEntities.first(),
                tooltip: relatedEntities && relatedEntities.size > 1
                  && relatedEntities.groupBy((t) => t.getIn(['attributes', 'measuretype_id'])),
                multiple: relatedEntities && relatedEntities.size > 1,
                sortValue: getRelatedSortValue(relatedEntities),
              },
            };
          case 'taxonomy':
            // console.log(entity && entity.toJS())
            relatedEntities = taxonomies.get(col.taxonomy_id.toString())
              && getRelatedEntities(
                entity.get('categories'),
                taxonomies.get(col.taxonomy_id.toString()).get('categories'),
                col,
              );
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: getRelatedValue(relatedEntities, 'categories'),
                single: relatedEntities && relatedEntities.size === 1 && relatedEntities.first(),
                tooltip: relatedEntities && relatedEntities.size > 1 && relatedEntities,
                multiple: relatedEntities && relatedEntities.size > 1,
                sortValue: getRelatedSortValue(relatedEntities),
              },
            };
          case 'hasResources':
            // resources
            temp = entity.getIn(['resourcesByType', parseInt(col.resourcetype_id, 10)])
              || entity.getIn(['resourcesByType', col.resourcetype_id]);
            relatedEntities = temp && getRelatedEntities(temp, resources, col);
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: relatedEntities && relatedEntities.first(),
                sortValue: relatedEntities ? 1 : -1,
              },
            };
          case 'actorActions':
            temp = entity.get(col.actions)
              || (entity.get(`${col.actions}ByType`) && entity.get(`${col.actions}ByType`).flatten(true));
            relatedEntities = getRelatedEntities(temp, connections.get('measures'), col);
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: relatedEntities && relatedEntities.size,
                tooltip: relatedEntities && relatedEntities.size > 0
                  && relatedEntities.groupBy((t) => t.getIn(['attributes', 'measuretype_id'])),
              },
            };
          case 'userrole':
            // TODO: optimise - entities should only/already have a single/hightest role associated
            temp = entity.get('roles') && entity.get('roles').reduce(
              (highest, roleId) => {
                if (!highest) return parseInt(roleId, 10);
                const theRole = Object.values(USER_ROLES).find((r) => qe(r.value, parseInt(roleId, 10)));
                const highestRole = Object.values(USER_ROLES).find((r) => qe(r.value, parseInt(highest, 10)));
                return Math.min(theRole.order, highestRole.order);
              },
              null,
            );
            // actual only one
            temp = Object.values(USER_ROLES).find(
              (r) => qe(temp, r.value)
            ) || USER_ROLES.DEFAULT;
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: temp.message
                  ? appMessage(intl, temp.message)
                  : ((temp && temp.label)),
                sortValue: temp.value,
              },
            };
          case 'resourceActions':
          case 'indicatorActions':
          case 'userActions':
            temp = entity.get('actions')
              || (entity.get('actionsByType') && entity.get('actionsByType').flatten(true));
            relatedEntities = temp && getRelatedEntities(
              temp,
              connections.get(API.ACTIONS),
              col,
            );
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: getRelatedValue(relatedEntities, col.type === 'indicatorActions' ? 'statements' : 'actions'),
                single: relatedEntities && relatedEntities.size === 1 && relatedEntities.first(),
                tooltip: relatedEntities && relatedEntities.size > 1
                  && relatedEntities.groupBy((t) => t.getIn(['attributes', 'measuretype_id'])),
                multiple: relatedEntities && relatedEntities.size > 1,
                sortValue: getRelatedSortValue(relatedEntities),
              },
            };
          case 'actiontype':
            relatedEntityIds = entity.getIn([col.actions, parseInt(col.actiontype_id, 10)]) || Map();
            if (includeMembers && entity.getIn([col.actionsMembers, parseInt(col.actiontype_id, 10)])) {
              relatedEntityIds = relatedEntityIds
                .merge(entity.getIn([col.actionsMembers, parseInt(col.actiontype_id, 10)]))
                .toList()
                .toSet();
            }
            if (includeChildren && entity.getIn([col.actionsChildren, parseInt(col.actiontype_id, 10)])) {
              relatedEntityIds = relatedEntityIds
                .merge(entity.getIn([col.actionsChildren, parseInt(col.actiontype_id, 10)]))
                .toList()
                .toSet();
            }
            relatedEntities = getRelatedEntities(relatedEntityIds.flatten(true), connections.get('measures'), col);
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: relatedEntities && relatedEntities.size > 0
                  ? relatedEntities.size
                  : null,
                tooltip: relatedEntities && relatedEntities.size > 0
                  && relatedEntities.groupBy((t) => t.getIn(['attributes', 'measuretype_id'])),
              },
            };
          case 'supportlevel':
            if (entity.get('supportlevel')) {
              temp = entity.get('supportlevel')
                && entity.getIn(['supportlevel', col.actionId]);
            }
            if (entity.get('position')) {
              temp = entity.get('position')
                && entity.getIn(['position', 'supportlevel_id']);
            }
            if (!temp) {
              return {
                ...memoEntity,
                [col.id]: {
                  ...col,
                },
              };
            }
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: intl.formatMessage(appMessages.supportlevels[temp]),
                color: ACTION_INDICATOR_SUPPORTLEVELS[temp].color,
              },
            };
          case 'positionStatement':
            temp = entity.get('position') && entity.getIn(['position', 'measure']);
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: getSingleRelatedValueFromAttributes(temp),
                single: temp,
                // sortValue: getRelatedSortValue(temp),
              },
            };
          case 'positionStatementAuthority':
            temp = entity.get('position') && entity.getIn(['position', 'authority']);
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: getSingleRelatedValueFromAttributes(temp),
                single: temp,
                // sortValue: getRelatedSortValue(temp),
              },
            };
          case 'stackedBarActions':
            temp = entity.get(col.values);
            if (temp) {
              if (col.values === 'supportlevels') {
                sortValue = temp.reduce(
                  (sum, val) => {
                    if (val.count && [1, 2].indexOf(parseInt(val.value, 10)) > -1) {
                      return val.count + sum;
                    }
                    return sum;
                  },
                  0,
                );
              } else {
                sortValue = temp.reduce(
                  (sum, val) => (val.count || 0) + sum,
                  0,
                );
              }
            }
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                values: temp && temp.map(
                  (val) => {
                    if (val.actors) {
                      relatedEntities = getRelatedEntities(val.actors, connections.get('actors'), col);
                      if (relatedEntities && relatedEntities.size > 0) {
                        return {
                          ...val,
                          tooltip: relatedEntities && relatedEntities.size > 0
                            && relatedEntities.groupBy((t) => t.getIn(['attributes', 'actortype_id'])),
                        };
                      }
                    }
                    return val;
                  }
                ).toJS(),
                sortValue,
              },
            };
          case 'topicPosition':
            temp = entity.getIn([col.positions, col.indicatorId]);
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                color: getColorFromPositions(temp),
                sortValue: getValueFromPositions(temp) || 99,
              },
            };
          case 'positionsCompact':
            temp = entity.getIn([col.positions]) || null;
            // console.log('country', entity && entity.toJS())
            // console.log('connections', connections && connections.toJS())
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                // colors:,
                // levels: temp && temp.reduce((memo, indicatorPositions) => ([
                //   ...memo,
                //   getLevelFromPositions(indicatorPositions),
                // ]), []),
                mainEntity: {
                  id: entity.get('id'),
                  path,
                  href: url || `${path}/${id}`,
                },
                positions: temp && temp.reduce((memo, indicatorPositions, indicatorId) => {
                  const latest = indicatorPositions && indicatorPositions.first();
                  return ([
                    ...memo,
                    {
                      indicatorId: parseInt(indicatorId, 10),
                      supportlevelId: (latest && latest.get('supportlevel_id') && parseInt(latest.get('supportlevel_id'), 10)) || 99,
                      color: getColorFromPositions(indicatorPositions),
                      authority: latest && getSingleRelatedValueFromAttributes(latest.get('authority')),
                      actorTitle: getEntityTitle(entity),
                      groupTitle: latest && latest.get('viaGroups') && getEntityTitle(latest.get('viaGroups').first()),
                      indicatorTitle: connections
                        && connections.getIn([API.INDICATORS, indicatorId, 'attributes', 'title'])
                        && getIndicatorMainTitle(connections.getIn([API.INDICATORS, indicatorId, 'attributes', 'title'])),
                    },
                  ]);
                }, []),
              },
            };
          default:
            return memoEntity;
        }
      },
      { id },
    );
    return [
      ...memoEntities,
      entityValues,
    ];
  },
  [],
);

export const checkColumnFilterOptions = (column, entities) => {
  const {
    filterOptions,
    type,
    positions,
    indicatorId,
  } = column;
  return type === 'topicPosition' && filterOptions && filterOptions.reduce(
    (memo, option) => {
      const existEntities = !!entities.find(
        (entity) => {
          const entityPositions = entity.getIn([positions, indicatorId]);
          if (qe(option.value, 99) && !getValueFromPositions(entityPositions)) {
            return true;
          }
          return qe(option.value, getValueFromPositions(entityPositions));
        }
      );
      return [
        ...memo,
        {
          ...option,
          exists: existEntities,
        },
      ];
    },
    [],
  );
};

export const getListHeaderLabel = ({
  intl,
  entityTitle,
  selectedTotal,
  pageTotal,
  entitiesTotal,
  allSelectedOnPage,
  messages,
  hasFilters,
}) => {
  let result = 'error';
  if (!intl) return result;
  if (!entityTitle) return '';
  if (selectedTotal > 0) {
    if (allSelectedOnPage) {
      // return `All ${selectedTotal} ${selectedTotal === 1 ? entityTitle.single : entityTitle.plural} on this page are selected. `;
      result = intl.formatMessage(messages.entityListHeader.allSelectedOnPage, {
        total: selectedTotal,
        type: selectedTotal === 1 ? entityTitle.single : entityTitle.plural,
      });
    } else {
    // return `${selectedTotal} ${selectedTotal === 1 ? entityTitle.single : entityTitle.plural} selected. `;
      result = intl.formatMessage(messages.entityListHeader.selected, {
        total: selectedTotal,
        type: selectedTotal === 1 ? entityTitle.single : entityTitle.plural,
      });
    }
  } else if (typeof pageTotal !== 'undefined' && (pageTotal < entitiesTotal)) {
    result = intl.formatMessage(messages.entityListHeader.noneSelected, {
      pageTotal,
      entitiesTotal,
      type: entityTitle.plural,
      filtered: hasFilters ? ' (filtered)' : ' total',
    });
  } else {
    result = intl.formatMessage(messages.entityListHeader.notPaged, {
      entitiesTotal,
      type: (entitiesTotal === 1) ? entityTitle.single : entityTitle.plural,
      filtered: hasFilters ? ' (filtered)' : '',
    });
  }
  return result;
};

export const getSelectedState = (
  selectedTotal,
  allSelected,
) => {
  if (selectedTotal === 0) {
    return CHECKBOX_STATES.UNCHECKED;
  }
  if (selectedTotal > 0 && allSelected) {
    return CHECKBOX_STATES.CHECKED;
  }
  return CHECKBOX_STATES.INDETERMINATE;
};

export const getColumnMaxValues = (entities, columns) => entities.reduce(
  (maxValueMemo, entity) => columns.reduce(
    (maxValueMemo2, column) => {
      if (column.type === 'actorActions' || column.type === 'actiontype') {
        const val = entity[column.id].value;
        return val
          ? {
            ...maxValueMemo2,
            [column.id]: maxValueMemo2[column.id]
              ? Math.max(maxValueMemo2[column.id], val)
              : val,
          }
          : maxValueMemo2;
      }
      if (column.type === 'stackedBarActions') {
        const { values } = entity[column.id];
        const val = values && Object.values(values).reduce(
          (memo, value) => (value.count || 0) + memo,
          0,
        );
        return val
          ? {
            ...maxValueMemo2,
            [column.id]: maxValueMemo2[column.id]
              ? Math.max(maxValueMemo2[column.id], val)
              : val,
          }
          : maxValueMemo2;
      }
      return maxValueMemo2;
    },
    maxValueMemo,
  ),
  {},
);
