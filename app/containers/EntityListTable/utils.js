import { STATES as CHECKBOX_STATES } from 'components/forms/IndeterminateCheckbox';
import { Map } from 'immutable';
import isNumber from 'utils/is-number';
import { formatNumber } from 'utils/fields';
import qe from 'utils/quasi-equals';
import appMessage from 'utils/app-message';
import { lowerCase } from 'utils/string';
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
    let label;
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
      case 'targets':
        return ({
          ...col,
          title: 'Targets',
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'actors':
      case 'userActors':
        return ({
          ...col,
          title: 'Actors',
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'users':
        return ({
          ...col,
          title: 'Users (staff)',
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
      case 'actiontype':
        return ({
          ...col,
          title: appMessages.entities[`actions_${col.actiontype_id}`]
            ? intl.formatMessage(appMessages.entities[`actions_${col.actiontype_id}`].pluralShort)
            : 'Actions',
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
      case 'userActions':
      case 'actionsSimple':
      case 'actorActions':
        if (col.subject !== 'actors') {
          label = col.members ? 'Targeted as member' : 'Targeted by';
        } else {
          label = col.members ? 'Activities as member' : 'Activities';
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
      case 'stackedBar':
        return ({
          ...col,
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
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
const getRelatedValue = (relatedEntities, typeLabel) => {
  if (relatedEntities && relatedEntities.size > 0) {
    if (relatedEntities.size > 1) {
      return typeLabel
        ? `${relatedEntities.size} ${lowerCase(typeLabel)}`
        : relatedEntities.size;
    }
    return relatedEntities.first().getIn(['attributes', 'name']) || relatedEntities.first().getIn(['attributes', 'title']);
  }
  return null;
};
const getRelatedSortValue = (relatedEntities) => {
  if (relatedEntities && relatedEntities.size > 0) {
    if (relatedEntities.size > 1) {
      return relatedEntities.size;
    }
    return relatedEntities.first().getIn(['attributes', 'title']);
  }
  return null;
};

export const prepareEntities = ({
  entities,
  columns,
  entityIdsSelected,
  config,
  url,
  entityPath,
  onEntityClick,
  onEntitySelect,
  connections,
  taxonomies,
  resources,
  intl,
  includeMembers,
}) => entities.reduce(
  (memoEntities, entity) => {
    const id = entity.get('id');
    // console.log(entity.toJS())
    // console.log(connections && connections.toJS())
    const entityValues = columns.reduce(
      (memoEntity, col) => {
        const path = (config && config.clientPath) || entityPath;
        let relatedEntities;
        let relatedEntityIds;
        let temp;
        let attribute;
        switch (col.type) {
          case 'main':
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                values: col.attributes.reduce(
                  (memo, att) => ({
                    ...memo,
                    [att]: entity.getIn(['attributes', att]),
                  }),
                  {}
                ),
                draft: entity.getIn(['attributes', 'draft']),
                archived: entity.getIn(['attributes', 'is_archive']),
                private: entity.getIn(['attributes', 'private']),
                sortValue: entity.getIn(['attributes', col.sort || 'title']),
                selected: entityIdsSelected && entityIdsSelected.includes(id),
                href: url || `${path}/${id}`,
                onClick: (evt) => {
                  if (evt) evt.preventDefault();
                  onEntityClick(id, path);
                },
                onSelect: (checked) => onEntitySelect(id, checked),
              },
            };
          case 'attribute':
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: entity.getIn(['attributes', col.attribute]),
              },
            };
          case 'amount':
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: isNumber(entity.getIn(['attributes', col.attribute]))
                  && formatNumber(
                    entity.getIn(['attributes', col.attribute]), { intl },
                  ),
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
                value: entity.getIn(['attributes', col.attribute])
                  && intl.formatDate(entity.getIn(['attributes', col.attribute])),
                draft: entity.getIn(['attributes', 'draft']),
                sortValue: entity.getIn(['attributes', col.attribute]),
              },
            };
          case 'actionsSimple':
            attribute = col.actions || 'actions';
            temp = entity.get(attribute) || (entity.get(`${attribute}ByType`) && entity.get(`${attribute}ByType`).flatten());
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
          case 'targets':
            temp = entity.get('targets') || (entity.get('targetsByType') && entity.get('targetsByType').flatten());
            relatedEntities = getRelatedEntities(temp, connections.get('actors'), col);
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: getRelatedValue(relatedEntities, col.label || 'targets'),
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
            temp = entity.get('actors') || (entity.get('actorsByType') && entity.get('actorsByType').flatten());
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
          case 'members':
            temp = entity.get('members') || (entity.get('membersByType') && entity.get('membersByType').flatten());
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
            temp = entity.get('associations') || (entity.get('associationsByType') && entity.get('associationsByType').flatten());

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
              || (entity.get(`${col.actions}ByType`) && entity.get(`${col.actions}ByType`).flatten());
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: temp && temp.size,
              },
            };
          case 'userrole':
            temp = entity.get('roles') && entity.get('roles').reduce(
              (highest, roleId) => {
                if (!highest) return parseInt(roleId, 10);
                return Math.min(parseInt(roleId, 10), highest);
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
              || (entity.get('actionsByType') && entity.get('actionsByType').flatten());
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
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: relatedEntityIds && relatedEntityIds.size > 0
                  ? relatedEntityIds.size
                  : null,
              },
            };
          case 'supportlevel':
            temp = entity.get('supportlevel')
              && entity.getIn(['supportlevel', col.actionId]);
            if (!temp) {
              temp = 0;
            }
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                value: intl.formatMessage(appMessages.supportlevels[temp]),
                color: ACTION_INDICATOR_SUPPORTLEVELS[temp].color,
              },
            };
          case 'stackedBar':
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                values: entity.get(col.values) && entity.get(col.values).toJS(),
                sortValue: entity.get(col.values)
                  ? entity.get(col.values).reduce(
                    (sum, val) => (val.count || 0) + sum,
                    0,
                  )
                  : null,
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

export const getListHeaderLabel = ({
  intl,
  entityTitle,
  selectedTotal,
  pageTotal,
  entitiesTotal,
  allSelectedOnPage,
  messages,
}) => {
  if (selectedTotal > 0) {
    if (allSelectedOnPage) {
      // return `All ${selectedTotal} ${selectedTotal === 1 ? entityTitle.single : entityTitle.plural} on this page are selected. `;
      return intl && intl.formatMessage(messages.entityListHeader.allSelectedOnPage, {
        total: selectedTotal,
        type: selectedTotal === 1 ? entityTitle.single : entityTitle.plural,
      });
    }
    // return `${selectedTotal} ${selectedTotal === 1 ? entityTitle.single : entityTitle.plural} selected. `;
    return intl && intl.formatMessage(messages.entityListHeader.selected, {
      total: selectedTotal,
      type: selectedTotal === 1 ? entityTitle.single : entityTitle.plural,
    });
  }
  if (pageTotal && (pageTotal < entitiesTotal)) {
    return intl && intl.formatMessage(messages.entityListHeader.noneSelected, {
      pageTotal,
      entitiesTotal,
      type: entityTitle.plural,
    });
  }
  return intl && intl.formatMessage(messages.entityListHeader.notPaged, {
    entitiesTotal,
    type: (entitiesTotal === 1) ? entityTitle.single : entityTitle.plural,
  });
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
      if (column.type === 'stackedBar') {
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
