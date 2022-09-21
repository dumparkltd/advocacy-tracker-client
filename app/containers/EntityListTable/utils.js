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
      case 'targetsViaChildren':
        return ({
          ...col,
          title: 'Indirect targets',
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
          info: {
            type: 'text',
            title: 'Indirect targets',
            text: 'From child activities, e.g tasks',
          },
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
      case 'viaGroups':
        return ({
          ...col,
          title: 'As Member of',
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
      case 'childActions':
        return ({
          ...col,
          title: col.title || 'Child activities',
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'parentActions':
        return ({
          ...col,
          title: col.title || 'Parent activities',
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
      case 'actorActions':
        if (col.subject === 'targets') {
          label = 'Targeted by';
          if (col.members) {
            label = 'Targeted as member';
          } else if (col.children) {
            label = 'Targeted as parent';
          }
        } else {
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
        label = 'Assigned to';
        return ({
          ...col,
          title: label,
          sortActive,
          sortOrder: sortActive && sortOrder ? sortOrder : 'asc',
          onSort,
        });
      case 'actionsSimple':
        label = col.subject === 'actors' ? 'Actions' : 'Targets';
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
const getRelatedSortValue = (relatedEntities) => getRelatedValue(relatedEntities);

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
const getSingleRelatedValueFromAttributes = (relatedEntity) => relatedEntity
  ? relatedEntity.get('name') || relatedEntity.get('title')
  : null;


export const prepareEntityRows = ({
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
  includeChildren,
}) => entities.reduce(
  (memoEntities, entity) => {
    const id = entity.get('id');
    // console.log(connections && connections.toJS())
    const entityValues = columns.reduce(
      (memoEntity, col) => {
        const path = (config && config.clientPath) || entityPath;
        let relatedEntities;
        let relatedEntityIds;
        let temp;
        let attribute;
        // console.log(col)
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
                noNotifications: entity.getIn(['attributes', 'notifications']) === false,
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
          case 'targets':
            temp = entity.get('targets') || (entity.get('targetsByType') && entity.get('targetsByType').flatten(true));
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
          case 'targetsViaChildren':
            temp = entity.get('targetsViaChildren');
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
                value: temp && temp.size,
                tooltip: relatedEntities && relatedEntities.size > 0
                  && relatedEntities.groupBy((t) => t.getIn(['attributes', 'measuretype_id'])),
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
                value: relatedEntityIds && relatedEntityIds.size > 0
                  ? relatedEntityIds.size
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
            return {
              ...memoEntity,
              [col.id]: {
                ...col,
                values: temp && temp.map(
                  (value) => {
                    if (value.actors) {
                      relatedEntities = getRelatedEntities(value.actors, connections.get('actors'), col);
                      if (relatedEntities && relatedEntities.size > 0) {
                        return {
                          ...value,
                          tooltip: relatedEntities && relatedEntities.size > 0
                            && relatedEntities.groupBy((t) => t.getIn(['attributes', 'actortype_id'])),
                        };
                      }
                    }
                    return value;
                  }
                ).toJS(),
                sortValue: temp
                  ? temp.reduce(
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
