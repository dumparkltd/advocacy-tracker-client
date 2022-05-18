import { find, forEach } from 'lodash/collection';
import { upperFirst } from 'lodash/string';

import {
  TEXT_TRUNCATE,
  ACTIONTYPES_CONFIG,
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
  // if (config.connectedTaxonomies && locationQuery.get(config.connectedTaxonomies.query)) {
  //   args = args.concat(config.connectedTaxonomies.query);
  // }
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
  return args;
};


export const currentFilters = (
  {
    config,
    entities,
    taxonomies,
    connections,
    locationQuery,
    onTagClick,
    errors,
    // actortypes,
    intl,
    isManager,
  },
  withoutLabel,
  anyLabel,
  errorLabel,
) => {
  let filterTags = [];
  if (errors && errors.size > 0) {
    filterTags.push(getErrorTag(errorLabel));
  }
  // if (config.actortypes && actortypes && actortypes.size > 1) {
  //   filterTags = filterTags.concat(getCurrentActortypeFilter(
  //     config.actortypes,
  //     actortypes,
  //     locationQuery,
  //     onTagClick
  //   ));
  // }
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
        isManager,
      ));
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
  isManager,
) => {
  if (!isManager && entityType === 'actions') {
    const config = ACTIONTYPES_CONFIG[connection.getIn(['attributes', 'measuretype_id'])];
    return !!config.is_code_public;
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
  isManager,
) => {
  const tags = [];
  const {
    query, path, groupByType, labels,
  } = option;
  if (locationQuery.get(query) && connections.get(path)) {
    const locationQueryValue = locationQuery.get(query);
    asList(locationQueryValue).forEach((queryValue) => {
      let value;
      let optionId;
      if (connections.get(path)) {
        if (groupByType) {
          [optionId, value] = queryValue.indexOf(':') > -1 ? queryValue.split(':') : [null, queryValue];
        } else {
          value = queryValue;
        }
      }
      if (value) {
        const connection = connections.getIn([path, value]);
        if (connection) {
          const isCodePublic = checkCodeVisibility(connection, option.entityType, isManager);
          tags.push({
            label: getConnectionLabel(connection, value, !isCodePublic, labels, intl),
            labelLong: getConnectionLabel(connection, value, true, labels, intl),
            type: option.entityType,
            group: intl.formatMessage(appMessages.nav[option.entityTypeAs || option.entityType]),
            onClick: () => onClick({
              value: queryValue,
              query,
              checked: false,
            }),
            groupId: connectionKey,
            optionId,
          });
        }
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
