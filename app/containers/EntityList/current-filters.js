import { find, forEach } from 'lodash/collection';
import { upperFirst } from 'lodash/string';

import {
  TEXT_TRUNCATE,
  ACTORTYPES,
} from 'themes/config';

import { getCategoryShortTitle } from 'utils/entities';
import { qe } from 'utils/quasi-equals';
import appMessage from 'utils/app-message';

import { truncateText } from 'utils/string';
import isNumber from 'utils/is-number';
import asList from 'utils/as-list';

import appMessages from 'containers/App/messages';

export const currentFilterArgs = (config, locationQuery) => {
  let args = [];
  if (config.actortypes && locationQuery.get(config.actortypes.query)) {
    args = args.concat(config.actortypes.query);
  }
  if (config.taxonomies && locationQuery.get(config.taxonomies.query)) {
    args = args.concat(config.taxonomies.query);
  }
  if (config.connectedTaxonomies && locationQuery.get(config.connectedTaxonomies.query)) {
    args = args.concat(config.connectedTaxonomies.query);
  }
  if (config.connections) {
    Object.keys(config.connections).forEach((connectionKey) => {
      const connectionConfig = config.connections[connectionKey];
      if (locationQuery.get(connectionConfig.query)) {
        args = args.concat(connectionConfig.query);
      }
    });
  }
  if (locationQuery.get('where')) {
    args = args.concat('where');
  }
  if (locationQuery.get('without')) {
    args = args.concat('without');
  }
  if (locationQuery.get('any')) {
    args = args.concat('any');
  }
  return args;
};


export const currentFilters = (
  {
    config,
    entities,
    taxonomies,
    connections,
    connectedTaxonomies,
    locationQuery,
    onTagClick,
    errors,
    intl,
    isAdmin,
  },
  withoutLabel,
  anyLabel,
  errorLabel,
) => {
  let filterTags = [];
  if (errors && errors.size > 0) {
    filterTags.push(getErrorTag(errorLabel));
  }

  if (config.taxonomies && taxonomies) {
    filterTags = filterTags.concat(getCurrentTaxonomyFilters(
      config.taxonomies,
      taxonomies,
      locationQuery,
      onTagClick,
      withoutLabel,
      anyLabel,
      intl,
    ));
  }
  if (connections && config.connections) {
    Object.keys(config.connections).forEach((connectionKey) => {
      filterTags = filterTags.concat(getCurrentConnectionFilters(
        connectionKey,
        config.connections[connectionKey],
        connections,
        locationQuery,
        onTagClick,
        withoutLabel,
        anyLabel,
        intl,
        isAdmin,
      ));
      if (config.connections[connectionKey].connectionAttributeFilter) {
        filterTags = filterTags.concat(getCurrentConnectionAttributeFilters(
          connectionKey,
          config.connections[connectionKey].connectionAttributeFilter,
          locationQuery,
          onTagClick,
          intl,
        ));
      }
    });
  }
  if (config.attributes) {
    filterTags = filterTags.concat(getCurrentAttributeFilters(
      entities,
      config.attributes.options,
      locationQuery,
      onTagClick,
      withoutLabel,
      anyLabel,
      intl,
    ));
  }
  if (connectedTaxonomies && config.connectedTaxonomies) {
    filterTags = filterTags.concat(getCurrentConnectedTaxonomyFilters(
      config.connectedTaxonomies,
      connectedTaxonomies,
      locationQuery,
      onTagClick
    ));
  }
  return filterTags;
};

const getErrorTag = (label) => ({
  id: 'error',
  type: 'error',
  label,
});
const getConnectionLabel = (connection, value, long, labels, intl) => {
  if (connection) {
    if (labels) {
      const label = labels.find((l) => qe(l.value, value));
      if (label && label.message) {
        return truncateText(
          appMessage(intl, label.message),
          TEXT_TRUNCATE.CONNECTION_TAG,
        );
      }
    }
    if (long) {
      return truncateText(
        connection.getIn(['attributes', 'title']) || connection.getIn(['attributes', 'name']) || connection.get('id'),
        TEXT_TRUNCATE.CONNECTION_TAG,
      );
    }
    return truncateText(
      connection.getIn(['attributes', 'code'])
      || connection.getIn(['attributes', 'name'])
      || connection.getIn(['attributes', 'title'])
      || connection.get('id'),
      TEXT_TRUNCATE.CONNECTION_TAG,
    );
  }
  return upperFirst(value);
};

const getCategoryLabel = (category) => truncateText(getCategoryShortTitle(category), TEXT_TRUNCATE.ENTITY_TAG);

const getCurrentTaxonomyFilters = (
  taxonomyFilters,
  taxonomies,
  locationQuery,
  onClick,
  withoutLabel,
  anyLabel,
  intl,
) => {
  const tags = [];
  if (locationQuery.get(taxonomyFilters.query)) {
    const locationQueryValue = locationQuery.get(taxonomyFilters.query);
    taxonomies.forEach(
      (taxonomy) => {
        asList(locationQueryValue).forEach((queryValue) => {
          const value = queryValue.toString();
          if (taxonomy.getIn(['categories', value])) {
            const category = taxonomy.getIn(['categories', value]);
            tags.push({
              label: getCategoryLabel(category),
              type: 'taxonomies',
              id: taxonomy.get('id'),
              group: intl.formatMessage(appMessages.nav.taxonomies),
              inverse: true,
              onClick: () => onClick({
                value,
                query: taxonomyFilters.query,
                checked: false,
              }),
              groupId: 'taxonomies',
              optionId: taxonomy.get('id'),
            });
          }
        });
      }
    );
  }
  if (locationQuery.get('without')) {
    const locationQueryValue = locationQuery.get('without');
    taxonomies.forEach((taxonomy) => {
      asList(locationQueryValue).forEach((queryValue) => {
        // numeric means taxonomy
        if (isNumber(queryValue) && taxonomy.get('id') === queryValue) {
          const value = queryValue.toString();
          tags.push({
            labels: [
              { label: withoutLabel },
              {
                label: `entities.taxonomies.${parseInt(taxonomy.get('id'), 10)}.single`,
                lowerCase: true,
                appMessage: true,
              },
            ],
            type: 'taxonomies',
            group: intl.formatMessage(appMessages.nav.taxonomies),
            id: taxonomy.get('id'),
            onClick: () => onClick({
              value,
              query: 'without',
              checked: false,
            }),
            groupId: 'taxonomies',
            optionId: taxonomy.get('id'),
          });
        }
      });
    });
  }
  if (locationQuery.get('any')) {
    const locationQueryValue = locationQuery.get('any');
    taxonomies.forEach((taxonomy) => {
      asList(locationQueryValue).forEach((queryValue) => {
        // numeric means taxonomy
        if (isNumber(queryValue) && taxonomy.get('id') === queryValue) {
          const value = queryValue.toString();
          tags.push({
            labels: [
              { label: anyLabel },
              {
                label: `entities.taxonomies.${parseInt(taxonomy.get('id'), 10)}.single`,
                lowerCase: true,
                appMessage: true,
              },
            ],
            type: 'taxonomies',
            group: intl.formatMessage(appMessages.nav.taxonomies),
            id: taxonomy.get('id'),
            onClick: () => onClick({
              value,
              query: 'any',
              checked: false,
            }),
            groupId: 'taxonomies',
            optionId: taxonomy.get('id'),
          });
        }
      });
    });
  }
  return tags;
};

const checkCodeVisibility = (
  connection,
  entityType,
  isMember,
) => {
  if (!isMember && entityType === 'actors') {
    return qe(connection.getIn(['attributes', 'actortype_id']), ACTORTYPES.COUNTRY);
  }
  return true;
};

const getCurrentConnectionFilters = (
  connectionKey,
  option,
  connections,
  locationQuery,
  onClick,
  withoutLabel,
  anyLabel,
  intl,
  isAdmin,
) => {
  const tags = [];
  const {
    query,
    path,
    groupByType,
    labels,
    connectionAttributeFilter,
  } = option;
  if (locationQuery.get(query) && connections.get(path)) {
    const locationQueryValue = locationQuery.get(query);
    asList(locationQueryValue).forEach((queryValue) => {
      let value = queryValue;
      let optionId;
      let connectionAttributeQuery;
      let connectedAttributes;
      let connectionAttributeName;
      if (connections.get(path)) {
        // check for connection attribute queries
        if (connectionAttributeFilter && value.indexOf('>') > -1) {
          let values;
          [value, connectionAttributeQuery] = value.split('>');
          [connectionAttributeName, values] = connectionAttributeQuery.split('=');
          values = values.split('|');
          if (connectionAttributeFilter && connectionAttributeFilter.options) {
            connectedAttributes = Object.values(connectionAttributeFilter.options).filter(
              (o) => values.indexOf(o.value.toString()) > -1
            ).map(
              (o) => {
                let newQueryValue = value;
                const newValues = values.filter(
                  (v) => !qe(v, o.value)
                );
                if (newValues.length > 0) {
                  newQueryValue = `${newQueryValue}>${connectionAttributeName}=${newValues.join('|')}`;
                }
                return ({
                  ...o,
                  label: intl.formatMessage(appMessages[connectionAttributeFilter.optionMessages][o.value]),
                  attribute: connectionAttributeName,
                  onClick: () => onClick({
                    query,
                    value: newQueryValue,
                    prevValue: queryValue,
                    replace: true,
                  }),
                });
              }
            ).sort(
              (a, b) => a.order > b.order ? 1 : -1,
            );
          }
        }
        if (groupByType && queryValue.indexOf(':') > -1) {
          [optionId, value] = queryValue.split(':');
        }
      }
      const connection = connections.getIn([path, value]);
      if (connection) {
        const isCodePublic = checkCodeVisibility(connection, option.entityType, isAdmin);
        tags.push({
          label: getConnectionLabel(connection, value, !isCodePublic, labels, intl),
          labelLong: getConnectionLabel(connection, value, true, labels, intl),
          type: option.entityType,
          group: intl.formatMessage(appMessages.nav[option.entityTypeAs || option.entityType]),
          connectedAttributes,
          connectionAttributeName,
          query,
          queryValue,
          onClick: () => onClick({
            value: queryValue,
            query,
            checked: false,
          }),
          groupId: connectionKey,
          optionId,
        });
      }
    });
  }
  // FK connection (1 : n)
  if (option.attribute) {
    if (locationQuery.get('without')) {
      const locationQueryValue = locationQuery.get('without');
      asList(locationQueryValue).forEach((queryValue) => {
        const [, attribute] = queryValue.split(':');
        if (option.attribute === attribute) {
          const label = option.message;
          tags.push({
            labels: [
              { label: withoutLabel },
              {
                appMessage: true,
                label,
                lowerCase: true,
              },
              { label: option.label },
            ],
            group: intl.formatMessage(appMessages.nav[option.entityTypeAs || option.entityType]),
            type: option.entityType,
            onClick: () => onClick({
              value: queryValue,
              query: 'without',
              checked: false,
            }),
            groupId: connectionKey,
            optionId: attribute,
          });
          // }
        }
      });
    }
    if (locationQuery.get('any')) {
      const locationQueryValue = locationQuery.get('any');
      asList(locationQueryValue).forEach((queryValue) => {
        const [, attribute] = queryValue.split(':');
        if (option.attribute === attribute) {
          const label = option.message;
          tags.push({
            labels: [
              { label: anyLabel },
              {
                appMessage: true,
                label,
                lowerCase: true,
              },
              { label: option.label },
            ],
            group: intl.formatMessage(appMessages.nav[option.entityTypeAs || option.entityType]),
            type: option.entityType,
            onClick: () => onClick({
              value: queryValue,
              query: 'any',
              checked: false,
            }),
            groupId: connectionKey,
            optionId: attribute,
          });
          // }
        }
      });
    }
  // FK connection (n : m)
  } else {
    if (locationQuery.get('without')) {
      const locationQueryValue = locationQuery.get('without');
      asList(locationQueryValue).forEach((queryValue) => {
        const [entityType, typeId] = queryValue.split('_');
        if (entityType === (option.entityTypeAs || option.entityType)) {
          let label;
          if (typeId && option.groupByType && option.messageByType && option.messageByType.indexOf('{typeid}') > -1) {
            label = option.messageByType.replace('{typeid}', typeId);
          } else {
            label = option.message;
          }
          tags.push({
            labels: [
              { label: withoutLabel },
              {
                appMessage: true,
                label,
                lowerCase: true,
              },
              { label: option.label },
            ],
            group: intl.formatMessage(appMessages.nav[option.entityTypeAs || option.entityType]),
            type: option.entityType,
            query: 'without',
            onClick: () => onClick({
              value: queryValue,
              query: 'without',
              checked: false,
            }),
            groupId: connectionKey,
            optionId: typeId,
          });
          // }
        }
      });
    }
    if (locationQuery.get('any')) {
      const locationQueryValue = locationQuery.get('any');
      asList(locationQueryValue).forEach((queryValue) => {
        const [entityType, typeId] = queryValue.split('_');
        if (entityType === (option.entityTypeAs || option.entityType)) {
          let label;
          if (typeId && option.groupByType && option.messageByType && option.messageByType.indexOf('{typeid}') > -1) {
            label = option.messageByType.replace('{typeid}', typeId);
          } else {
            label = option.message;
          }
          tags.push({
            labels: [
              { label: anyLabel },
              {
                appMessage: true,
                label,
                lowerCase: true,
              },
              { label: option.label },
            ],
            group: intl.formatMessage(appMessages.nav[option.entityTypeAs || option.entityType]),
            type: option.entityType,
            query: 'any',
            onClick: () => onClick({
              value: queryValue,
              query: 'any',
              checked: false,
            }),
            groupId: connectionKey,
            optionId: typeId,
          });
          // }
        }
      });
    }
  }
  return tags;
};
const getCurrentConnectionAttributeFilters = (
  connectionKey,
  connectionAttribute,
  locationQuery,
  onClick,
  intl,
) => {
  const tags = [];
  const locationQueryValue = locationQuery.get('xwhere');
  if (locationQueryValue) {
    asList(locationQueryValue).forEach((queryValue) => {
      const [path, attValue] = queryValue.split('|');
      const [att, value] = attValue.split(':');
      // console.log(path, att, value)
      if (att === connectionAttribute.attribute && path === connectionAttribute.path) {
        const option = Object.values(connectionAttribute.options).find((o) => qe(value, o.value));
        if (option) {
          tags.push({
            ...option,
            label: truncateText(
              intl.formatMessage(appMessages[connectionAttribute.optionMessages][value]),
              TEXT_TRUNCATE.ATTRIBUTE_TAG,
              false,
            ),
            type: 'connectionAttributes',
            groupId: connectionAttribute.path,
            attribute: connectionAttribute.attribute,
            dot: option.color,
            group: appMessage(intl, connectionAttribute.message),
            onClick: () => onClick({
              value: queryValue,
              query: 'xwhere',
              checked: false,
            }),
          });
        }
      }
    });
  }
  return tags;
};

const getCurrentAttributeFilters = (
  entities,
  attributeFiltersOptions,
  locationQuery,
  onClick,
  withoutLabel,
  anyLabel,
  intl,
) => {
  const tags = [];
  if (locationQuery.get('where')) {
    const locationQueryValue = locationQuery.get('where');
    forEach(attributeFiltersOptions, (option) => {
      if (locationQueryValue) {
        asList(locationQueryValue).forEach((queryValue) => {
          const [qAttribute, value] = queryValue.split(':');
          if (qAttribute === option.attribute && value) {
            if (option.reference) {
              // without
              if (value === 'null') {
                tags.push({
                  labels: [
                    { label: withoutLabel },
                    { appMessage: !!option.message, label: option.message || option.label, lowerCase: true },
                  ],
                  type: 'attributes',
                  group: intl.formatMessage(appMessages.nav.attributes),
                  onClick: () => onClick({
                    value: queryValue,
                    query: 'where',
                    checked: false,
                  }),
                });
              } else {
                const referenceEntity = entities.find((entity) => qe(entity.getIn(['attributes', option.attribute]), value));
                const label = referenceEntity && referenceEntity.getIn([option.reference.key, 'attributes', option.reference.label]);
                tags.push({
                  labels: label
                    ? [{ label }]
                    : [
                      { appMessage: !!option.message, label: option.message || option.label, postfix: ':' },
                      { label: value },
                    ],
                  type: 'attributes',
                  group: intl.formatMessage(appMessages.nav.attributes),
                  onClick: () => onClick({
                    value: queryValue,
                    query: 'where',
                    checked: false,
                  }),
                });
              }
            } else if (option.options) {
              const attribute = find(option.options, (o) => o.value.toString() === value.toString());
              let label = attribute ? attribute.message : upperFirst(value);
              label = truncateText(label, TEXT_TRUNCATE.ATTRIBUTE_TAG);
              tags.push({
                labels: [{
                  appMessage: !!attribute.message,
                  label,
                }],
                type: 'attributes',
                group: intl.formatMessage(appMessages.nav.attributes),
                onClick: () => onClick({
                  value: queryValue,
                  query: 'where',
                  checked: false,
                }),
              });
            }
          }
        });
      }
    });
  }
  return tags;
};


const getCurrentConnectedTaxonomyFilters = (
  taxonomyFilters,
  taxonomies,
  locationQuery,
  onClick
) => {
  const tags = [];
  if (locationQuery.get(taxonomyFilters.query)) {
    const locationQueryValue = locationQuery.get(taxonomyFilters.query);
    taxonomies.forEach((taxonomy) => {
      asList(locationQueryValue).forEach((queryValue) => {
        const [path, value] = queryValue.split(':');
        if (path && value) {
          if (taxonomy.getIn(['categories', value])) {
            const category = taxonomy.getIn(['categories', value]);
            tags.push({
              label: getCategoryLabel(category),
              type: 'taxonomies',
              id: taxonomy.get('id'),
              group: 'Statement categories',
              groupId: 'connectedTaxonomies',
              inverse: category.getIn(['attributes', 'draft']),
              onClick: () => onClick({
                value: queryValue,
                query: taxonomyFilters.query,
                checked: false,
              }),
            });
          }
        }
      });
    });
  }
  return tags;
};
