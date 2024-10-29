import { Map, List } from 'immutable';

import { filter } from 'lodash/collection';

import {
  getEntityTitle,
  getEntityReference,
  getCategoryShortTitle,
} from 'utils/entities';
import qe from 'utils/quasi-equals';

import { getCheckedValuesFromOptions, getCheckedOptions } from 'components/forms/MultiSelectControl';
import validateDateFormat from 'components/forms/validators/validate-date-format';
import validateRequired from 'components/forms/validators/validate-required';
import validateNumber from 'components/forms/validators/validate-number';
import validateEmailFormat from 'components/forms/validators/validate-email-format';
import validateLength from 'components/forms/validators/validate-length';

import {
  PUBLISH_STATUSES,
  PRIVACY_STATUSES,
  ARCHIVE_STATUSES,
  NOTIFICATION_STATUSES,
  USER_ROLES,
  DATE_FORMAT,
  API,
  ACTIONTYPES_CONFIG,
  ACTORTYPES_CONFIG,
  ACTORTYPES,
} from 'themes/config';

import appMessages from 'containers/App/messages';

export const entityOption = (entity, defaultToId, hasTags, showCode) => Map({
  value: entity.get('id'),
  label: getEntityTitle(entity),
  reference: showCode && getEntityReference(entity, defaultToId),
  description: entity.getIn(['attributes', 'description']),
  checked: !!entity.get('associated'), // convert to boolean
  association: !!entity.get('associated') && entity.get('association'),
  tags: hasTags && entity.get('categories'),
  draft: entity.getIn(['attributes', 'draft']),
});

export const entityOptions = ({
  entities,
  defaultToId = false,
  hasTags = true,
  showCode = false,
}) => entities
  ? entities.toList().map(
    (entity) => entityOption(entity, defaultToId, hasTags, showCode)
  )
  : List();

export const userOption = (entity, activeUserId) => Map({
  value: entity.get('id'),
  label: entity.getIn(['attributes', 'name']),
  checked: activeUserId ? entity.get('id') === activeUserId.toString() : false,
});

export const userOptions = (entities, activeUserId) => entities
  ? entities.reduce((options, entity) => options.push(userOption(entity, activeUserId)), List())
  : List();

export const parentCategoryOption = (entity, activeParentId) => Map({
  value: entity.get('id'),
  label: entity.getIn(['attributes', 'title']),
  checked: activeParentId ? entity.get('id') === activeParentId.toString() : false,
});
export const parentCategoryOptions = (entities, activeParentId) => entities
  ? entities.reduce((options, entity) => options.push(parentCategoryOption(entity, activeParentId)), List())
  : List();

export const parentActionOption = (entity, activeParentId) => Map({
  value: entity.get('id'),
  label: getEntityTitle(entity),
  draft: entity.getIn(['attributes', 'draft']),
  checked: activeParentId ? entity.get('id') === activeParentId.toString() : false,
});

export const parentActionOptions = (entities, activeParentId) => entities
  ? entities.reduce((options, entity) => options.push(parentActionOption(entity, activeParentId)), List())
  : List();

export const dateOption = (entity, activeDateId) => Map({
  value: entity.get('id'),
  // TODO replace due_date
  label: entity.getIn(['attributes', 'due_date']),
  checked: activeDateId ? entity.get('id') === activeDateId.toString() : false,
});

export const taxonomyOptions = (taxonomies) => taxonomies
  ? taxonomies.toList().reduce(
    (values, tax) => values.set(
      tax.get('id'),
      entityOptions({
        entities: tax.get('categories'),
        defaultToId: false,
        hasTags: false,
      })
    ),
    Map(),
  )
  : Map();

const getTaxTitle = (id, intl) => intl ? intl.formatMessage(appMessages.entities.taxonomies[id].single) : '';

// turn taxonomies into multiselect options
export const makeTagFilterGroups = (taxonomies, intl) => taxonomies
  && taxonomies.toList().map((taxonomy) => ({
    title: getTaxTitle(parseInt(taxonomy.get('id'), 10), intl),
    palette: ['taxonomies', parseInt(taxonomy.get('id'), 10)],
    options: taxonomy.get('categories').map((category) => ({
      reference: getEntityReference(category, false),
      label: getEntityTitle(category),
      filterLabel: getCategoryShortTitle(category),
      showCount: false,
      value: category.get('id'),
    })).valueSeq().toArray(),
  })).toArray();

// export const renderActionControl = (
//   entities,
//   taxonomies,
//   onCreateOption,
//   intl,
//   showCode,
// ) => entities
//   ? {
//     id: 'actions',
//     model: '.associatedActions',
//     dataPath: ['associatedActions'],
//     label: intl.formatMessage(appMessages.entities.actions.plural),
//     controlType: 'multiselect',
//     options: entityOptions({
//       entities,
//       showCode,
//     }),
//     advanced: true,
//     selectAll: true,
//     tagFilterGroups: makeTagFilterGroups(taxonomies, intl),
//     onCreate: onCreateOption
//       ? () => onCreateOption({ path: API.ACTIONS })
//       : null,
//   }
//   : null;
export const renderIndicatorControl = ({
  entities,
  // onCreateOption,
  intl,
  connections,
  connectionAttributes,
  showCode,
  hidden,
}) => entities
  ? {
    id: 'indicators',
    model: '.associatedIndicators',
    dataPath: ['associatedIndicators'],
    label: intl.formatMessage(appMessages.entities.indicators.plural),
    controlType: 'multiselect',
    options: entityOptions({
      entities,
      showCode,
    }),
    advanced: true,
    selectAll: true,
    connections,
    connectionAttributes,
    hidden,
    // onCreate: onCreateOption
    //   ? () => onCreateOption({ path: API.INDICATORS })
    //   : null,
  }
  : null;
export const renderUserMultiControl = ({
  entities,
  intl,
  hidden,
}) => entities
  ? {
    id: 'users',
    model: '.associatedUsers',
    dataPath: ['associatedUsers'],
    label: intl.formatMessage(appMessages.entities.users.plural),
    controlType: 'multiselect',
    options: entityOptions({
      entities,
    }),
    advanced: true,
    selectAll: true,
    hidden,
    // onCreate: onCreateOption
    //   ? () => onCreateOption({ path: API.INDICATORS })
    //   : null,
  }
  : null;

// actors grouped by actortype
export const renderActorsByActortypeControl = ({
  entitiesByActortype,
  taxonomies,
  onCreateOption,
  intl,
  isAdmin,
  hidden,
}) => entitiesByActortype
  ? entitiesByActortype.reduce(
    (controls, entities, typeid) => controls.concat({
      id: `actors.${typeid}`,
      typeId: typeid,
      model: `.associatedActorsByActortype.${typeid}`,
      dataPath: ['associatedActorsByActortype', typeid],
      label: intl.formatMessage(appMessages.entities[`actors_${typeid}`].plural),
      controlType: 'multiselect',
      options: entityOptions({
        entities,
        showCode: isAdmin || qe(typeid, ACTORTYPES.COUNTRY),
      }),
      advanced: true,
      selectAll: true,
      tagFilterGroups: makeTagFilterGroups(taxonomies, intl),
      onCreate: onCreateOption
        ? () => onCreateOption({
          path: API.ACTORS,
          attributes: { actortype_id: typeid },
        })
        : null,
      hidden,
    }),
    [],
  ).sort((a, b) => {
    const configA = ACTORTYPES_CONFIG[a.typeId];
    const configB = ACTORTYPES_CONFIG[b.typeId];
    return configA.order < configB.order ? -1 : 1;
  })
  : null;
// actors grouped by actortype
export const renderTargetsByActortypeControl = ({
  entitiesByActortype,
  taxonomies,
  onCreateOption,
  intl,
  isAdmin,
  hidden,
}) => entitiesByActortype
  ? entitiesByActortype.reduce(
    (controls, entities, typeid) => controls.concat({
      id: `targets.${typeid}`,
      typeId: typeid,
      model: `.associatedTargetsByActortype.${typeid}`,
      dataPath: ['associatedTargetsByActortype', typeid],
      label: intl.formatMessage(appMessages.entities[`actors_${typeid}`].plural),
      controlType: 'multiselect',
      options: entityOptions({
        entities,
        showCode: isAdmin || qe(typeid, ACTORTYPES.COUNTRY),
      }),
      advanced: true,
      selectAll: true,
      tagFilterGroups: makeTagFilterGroups(taxonomies, intl),
      onCreate: onCreateOption
        ? () => onCreateOption({
          path: API.ACTORS,
          attributes: { actortype_id: typeid },
        })
        : null,
      hidden,
    }),
    [],
  ).sort((a, b) => {
    const configA = ACTORTYPES_CONFIG[a.typeId];
    const configB = ACTORTYPES_CONFIG[b.typeId];
    return configA.order < configB.order ? -1 : 1;
  })
  : null;

export const renderMembersByActortypeControl = ({
  entitiesByActortype,
  taxonomies,
  onCreateOption,
  intl,
  isAdmin,
  hidden,
}) => entitiesByActortype
  ? entitiesByActortype.reduce(
    (controls, entities, typeid) => controls.concat({
      id: `members.${typeid}`,
      typeId: typeid,
      model: `.associatedMembersByActortype.${typeid}`,
      dataPath: ['associatedMembersByActortype', typeid],
      label: intl.formatMessage(appMessages.entities[`actors_${typeid}`].plural),
      controlType: 'multiselect',
      options: entityOptions({
        entities,
        showCode: isAdmin || qe(typeid, ACTORTYPES.COUNTRY),
      }),
      advanced: true,
      selectAll: true,
      tagFilterGroups: makeTagFilterGroups(taxonomies, intl),
      onCreate: onCreateOption
        ? () => onCreateOption({
          path: API.ACTORS,
          attributes: { actortype_id: typeid },
        })
        : null,
      hidden,
    }),
    [],
  ).sort((a, b) => {
    const configA = ACTORTYPES_CONFIG[a.typeId];
    const configB = ACTORTYPES_CONFIG[b.typeId];
    return configA.order < configB.order ? -1 : 1;
  })
  : null;
export const renderAssociationsByActortypeControl = ({
  entitiesByActortype,
  taxonomies,
  onCreateOption,
  intl,
  isAdmin,
  hidden,
}) => entitiesByActortype
  ? entitiesByActortype.reduce(
    (controls, entities, typeid) => controls.concat({
      id: `associations.${typeid}`,
      typeId: typeid,
      model: `.associatedAssociationsByActortype.${typeid}`,
      dataPath: ['associatedAssociationsByActortype', typeid],
      label: intl.formatMessage(appMessages.entities[`actors_${typeid}`].plural),
      controlType: 'multiselect',
      options: entityOptions({
        entities,
        showCode: isAdmin || qe(typeid, ACTORTYPES.COUNTRY),
      }),
      advanced: true,
      selectAll: true,
      tagFilterGroups: makeTagFilterGroups(taxonomies, intl),
      onCreate: onCreateOption
        ? () => onCreateOption({
          path: API.ACTORS,
          attributes: { actortype_id: typeid },
        })
        : null,
      hidden,
    }),
    [],
  ).sort((a, b) => {
    const configA = ACTORTYPES_CONFIG[a.typeId];
    const configB = ACTORTYPES_CONFIG[b.typeId];
    return configA.order < configB.order ? -1 : 1;
  })
  : null;

export const renderActionsByActiontypeControl = ({
  entitiesByActiontype,
  taxonomies,
  onCreateOption,
  intl,
  connectionAttributesForType,
  model = 'associatedActionsByActiontype',
  isAdmin,
  hidden,
}) => entitiesByActiontype
  ? entitiesByActiontype.reduce(
    (controls, entities, typeid) => controls.concat({
      id: `actions.${typeid}`,
      typeId: typeid,
      model: `.${model}.${typeid}`,
      dataPath: [model, typeid],
      label: intl.formatMessage(appMessages.entities[`actions_${typeid}`].plural),
      controlType: 'multiselect',
      options: entityOptions({ entities, showCode: isAdmin }),
      advanced: true,
      selectAll: true,
      connectionAttributes: connectionAttributesForType && connectionAttributesForType(typeid),
      tagFilterGroups: makeTagFilterGroups(taxonomies, intl),
      onCreate: onCreateOption
        ? () => onCreateOption({
          path: API.ACTIONS,
          attributes: { measuretype_id: typeid },
        })
        : null,
      hidden,
    }),
    [],
  ).sort((a, b) => {
    const configA = ACTIONTYPES_CONFIG[a.typeId];
    const configB = ACTIONTYPES_CONFIG[b.typeId];
    return configA.order < configB.order ? -1 : 1;
  })
  : null;

export const renderActionsAsTargetByActiontypeControl = ({
  entitiesByActiontype,
  taxonomies,
  onCreateOption,
  intl,
  isAdmin,
  hidden,
}) => entitiesByActiontype
  ? entitiesByActiontype.reduce(
    (controls, entities, typeid) => controls.concat({
      id: `actionsAsTarget.${typeid}`,
      typeId: typeid,
      model: `.associatedActionsAsTargetByActiontype.${typeid}`,
      dataPath: ['associatedActionsAsTargetByActiontype', typeid],
      label: intl.formatMessage(appMessages.entities[`actions_${typeid}`].plural),
      controlType: 'multiselect',
      options: entityOptions({ entities, showCode: isAdmin }),
      advanced: true,
      selectAll: true,
      tagFilterGroups: makeTagFilterGroups(taxonomies, intl),
      onCreate: onCreateOption
        ? () => onCreateOption({
          path: API.ACTIONS,
          attributes: { measuretype_id: typeid },
        })
        : null,
      hidden,
    }),
    [],
  ).sort((a, b) => {
    const configA = ACTIONTYPES_CONFIG[a.typeId];
    const configB = ACTIONTYPES_CONFIG[b.typeId];
    return configA.order < configB.order ? -1 : 1;
  })
  : null;

// actors grouped by actortype
export const renderResourcesByResourcetypeControl = ({
  entitiesByResourcetype,
  onCreateOption,
  intl,
  isAdmin,
  hidden,
}) => entitiesByResourcetype
  ? entitiesByResourcetype.reduce(
    (controls, entities, typeid) => controls.concat({
      id: `resources.${typeid}`,
      model: `.associatedResourcesByResourcetype.${typeid}`,
      dataPath: ['associatedResourcesByResourcetype', typeid],
      label: intl.formatMessage(appMessages.entities[`resources_${typeid}`].plural),
      controlType: 'multiselect',
      options: entityOptions({ entities, showCode: isAdmin }),
      advanced: true,
      selectAll: true,
      onCreate: onCreateOption
        ? () => onCreateOption({
          path: API.RESOURCES,
          attributes: { resourcetype_id: typeid },
        })
        : null,
      hidden,
    }),
    [],
  ).sort((a, b) => a.id > b.id ? 1 : -1)
  : null;

// taxonomies with categories "embedded"
export const renderTaxonomyControl = ({
  taxonomies,
  onCreateOption,
  intl,
  hidden,
}) => taxonomies
  ? taxonomies.toList().reduce(
    (controls, taxonomy) => controls.concat({
      id: taxonomy.get('id'),
      model: `.associatedTaxonomies.${taxonomy.get('id')}`,
      dataPath: ['associatedTaxonomies', taxonomy.get('id')],
      label: getTaxTitle(parseInt(taxonomy.get('id'), 10), intl),
      controlType: 'multiselect',
      multiple: taxonomy.getIn(['attributes', 'allow_multiple']),
      options: entityOptions({
        entities: taxonomy.get('categories'),
        defaultToId: false,
      }),
      onCreate: onCreateOption
        ? () => onCreateOption({
          path: API.CATEGORIES,
          attributes: { taxonomy_id: taxonomy.get('id') },
        })
        : null,
      hidden,
    }),
    [],
  )
  : [];

// export const renderUserControl = ({ entities, label, activeUserId }) => entities
//   ? {
//     id: 'users',
//     model: '.associatedUser',
//     dataPath: ['associatedUser'],
//     label,
//     controlType: 'multiselect',
//     multiple: false,
//     options: userOptions(entities, activeUserId),
//   }
//   : null;

export const renderParentCategoryControl = ({
  entities, label, activeParentId, hidden,
}) => entities
  ? {
    id: 'associatedCategory',
    model: '.associatedCategory',
    dataPath: ['associatedCategory'],
    label,
    controlType: 'multiselect',
    multiple: false,
    options: parentCategoryOptions(entities, activeParentId),
    hidden,
  }
  : null;
// export const renderParentActionControl = ({ entities, label, activeParentId }) => entities
//   ? {
//     id: 'associatedParent',
//     model: '.associatedParent',
//     dataPath: ['associatedParent'],
//     label,
//     controlType: 'multiselect',
//     multiple: false,
//     options: parentActionOptions(entities, activeParentId),
//   }
//   : null;

const getAssociatedEntities = (entities) => entities
  ? entities.reduce(
    (entitiesAssociated, entity) => {
      if (entity && entity.get('associated')) {
        return entitiesAssociated.set(entity.get('id'), entity.get('associated'));
      }
      return entitiesAssociated;
    },
    Map(),
  )
  : Map();

const getAssociations = (entities) => entities
  ? entities.reduce(
    (entitiesAssociated, entity) => {
      if (entity && entity.get('associated')) {
        return entitiesAssociated.set(entity.get('id'), entity);
      }
      return entitiesAssociated;
    },
    Map(),
  )
  : Map();

const getAssociatedCategories = (taxonomy) => taxonomy.get('categories')
  ? getAssociatedEntities(taxonomy.get('categories'))
  : Map();

export const getCategoryUpdatesFromFormData = ({
  formData,
  taxonomies,
  createKey,
}) => taxonomies && taxonomies.reduce((updates, tax, taxId) => {
  const formCategoryIds = getCheckedValuesFromOptions(formData.getIn(['associatedTaxonomies', taxId]));

  // store associated cats as { [cat.id]: [association.id], ... }
  // then we can use keys for creating new associations and values for deleting
  const associatedCategories = getAssociatedCategories(tax);
  return Map({
    delete: updates.get('delete').concat(
      associatedCategories.reduce(
        (associatedIds, associatedId, catId) => !formCategoryIds.includes(catId)
          ? associatedIds.push(associatedId)
          : associatedIds,
        List(),
      )
    ),
    create: updates.get('create').concat(formCategoryIds.reduce((payloads, catId) => !associatedCategories.has(catId)
      ? payloads.push(Map({
        category_id: catId,
        [createKey]: formData.get('id'),
      }))
      : payloads,
    List())),
  });
}, Map({ delete: List(), create: List() }));

export const getConnectionUpdatesFromFormData = ({
  formData,
  connections,
  connectionAttribute,
  createConnectionKey,
  createKey,
  connectionAttributes,
}) => {
  let formConnectionIds = List();
  let formConnections = List();
  if (formData) {
    if (Array.isArray(connectionAttribute)) {
      // store associated Actions as [ [action.id] ]
      formConnectionIds = getCheckedValuesFromOptions(formData.getIn(connectionAttribute));
      // store associated Actions as [ action ]
      formConnections = getCheckedOptions(formData.getIn(connectionAttribute));
    } else {
      formConnectionIds = getCheckedValuesFromOptions(formData.get(connectionAttribute));
      formConnections = getCheckedOptions(formData.get(connectionAttribute));
    }
  }
  // store associated Actions as { [action.id]: [association.id], ... }
  const previousConnectionIds = getAssociatedEntities(connections);
  // store associated Actions as { [action.id]: association, ... }
  const previousConnections = getAssociations(connections);
  // console.log('previousConnections', previousConnections && previousConnections.toJS())
  // console.log('previousConnectionIds', previousConnectionIds && previousConnectionIds.toJS())
  // console.log('previousConnections', previousConnections && previousConnections.toJS())
  // console.log('formConnectionIds', formConnectionIds && formConnectionIds.toJS())
  // console.log('formConnections', formConnections && formConnections.toJS())

  // connection ids to be deleted / removed in formData
  const deleteListOfIds = previousConnectionIds.reduce(
    (associatedIds, associationId, id) => !formConnectionIds.includes(id)
      ? associatedIds.push(associationId)
      : associatedIds,
    List()
  );

  // new connections / added in formData
  const createList = formConnections.reduce(
    (payloads, connection) => {
      const id = connection.get('value');
      let payload = connection.get('association') || Map();
      if (!previousConnectionIds.has(id)) {
        payload = payload.set(createConnectionKey, id);
        if (createKey) {
          payload = payload.set(createKey, formData.get('id'));
        }
        return payloads.push(payload);
      }
      return payloads;
    },
    List(),
  );

  const updateList = connectionAttributes
    ? formConnections.reduce(
      (payloads, connection) => {
        const id = connection.get('value') && connection.get('value').toString();
        if (id && previousConnectionIds.has(id)) {
          const previousConnection = previousConnections.get(id);
          const attributeChanges = connectionAttributes.reduce(
            (memo, attribute) => {
              const previousValue = previousConnection.getIn(['association', attribute]);
              const formValue = connection.getIn(['association', attribute]);
              if (!qe(previousValue, formValue)) {
                return {
                  ...memo,
                  [attribute]: formValue,
                };
              }
              return memo;
            },
            {},
          );

          if (Object.keys(attributeChanges).length > 0 && previousConnection.get('association')) {
            return payloads.push(
              Map({
                id: previousConnectionIds.get(id),
                attributes: {
                  ...previousConnection.get('association').toJS(),
                  ...attributeChanges,
                },
              })
            );
          }
        }
        return payloads;
      },
      List(),
    )
    : List();
  return Map({
    delete: deleteListOfIds,
    create: createList,
    update: updateList,
  });
};

// only show the highest rated role (lower role ids means higher)
export const getHighestUserRoleId = (roles) => roles.reduce(
  (currentHighestRoleId, role) => {
    if (role.get('associated')) {
      const theRole = Object.values(USER_ROLES).find((r) => qe(r.value, parseInt(role.get('id'), 10)));
      const highestRole = Object.values(USER_ROLES).find((r) => qe(r.value, parseInt(currentHighestRoleId, 10)));
      return theRole.order < highestRole.order
        ? role.get('id').toString()
        : currentHighestRoleId.toString();
    }
    return currentHighestRoleId.toString();
  },
  USER_ROLES.DEFAULT.value
);

export const getRoleFormField = ({ formatMessage, roleOptions, hidden }) => ({
  id: 'role',
  controlType: 'select',
  model: '.associatedRole',
  label: formatMessage(appMessages.entities.roles.single),
  options: Object.values(filter(USER_ROLES, (userRole) => roleOptions.map((roleOption) => parseInt(roleOption.get('id'), 10)).includes(userRole.value)
    || userRole.value === USER_ROLES.DEFAULT.value)),
  hidden,
});

export const getStatusFormField = ({
  formatMessage, attribute = 'draft', options, hidden,
}) => {
  let myOptions = options;
  if (attribute === 'draft') {
    myOptions = PUBLISH_STATUSES;
  }
  if (attribute === 'private') {
    myOptions = PRIVACY_STATUSES;
  }
  if (attribute === 'is_archive') {
    myOptions = ARCHIVE_STATUSES;
  }
  if (attribute === 'notifications') {
    myOptions = NOTIFICATION_STATUSES;
  }
  return {
    id: 'status',
    controlType: 'select',
    model: `.attributes.${attribute}`,
    label: formatMessage(appMessages.attributes[attribute]),
    options: myOptions,
    hidden,
  };
};

export const getTitleFormField = ({
  formatMessage,
  controlType = 'title',
  attribute = 'title',
  required,
  label,
  hidden,
}) => getFormField({
  formatMessage,
  controlType,
  attribute,
  required,
  label,
  hidden,
});

export const getReferenceFormField = ({
  formatMessage, required = false, isAutoReference = false, hidden,
}) => getFormField({
  formatMessage,
  controlType: 'short',
  attribute: 'reference',
  required,
  label: required ? 'reference' : 'referenceOptional',
  hint: isAutoReference ? formatMessage(appMessages.hints.autoReference) : null,
  hidden,
});
export const getCodeFormField = ({
  formatMessage, attribute = 'code', required = false, hidden,
}) => getFormField({
  formatMessage,
  controlType: 'short',
  attribute,
  label: attribute,
  required,
  hidden,
});
export const getShortTextFormField = ({
  formatMessage, attribute, required = false, hidden,
}) => getFormField({
  formatMessage,
  controlType: 'short',
  attribute,
  label: attribute,
  required,
  hidden,
});
export const getTextFormField = ({
  formatMessage, attribute, required = false, hidden,
}) => getFormField({
  formatMessage,
  controlType: 'input',
  attribute,
  label: attribute,
  required,
  hidden,
});
export const getAmountFormField = ({
  formatMessage, required, attribute = 'amount', hidden,
}) => getFormField({
  formatMessage,
  controlType: attribute,
  attribute,
  required,
  hint: formatMessage(appMessages.hints.amount),
  hidden,
  // TODO: validate
});
export const getNumberFormField = ({
  formatMessage, required, attribute = 'value', hidden,
}) => getFormField({
  formatMessage,
  controlType: attribute,
  attribute,
  required,
  hint: appMessages.hints[attribute] && formatMessage(appMessages.hints[attribute]),
  hidden,
  // TODO: validate
});
export const getLinkFormField = ({
  formatMessage, required, attribute = 'url', hidden,
}) => getFormField({
  formatMessage,
  controlType: attribute,
  attribute,
  required,
  hidden,
  // TODO: validate
});
export const getShortTitleFormField = ({ formatMessage, hidden }) => getFormField({
  formatMessage,
  controlType: 'short',
  attribute: 'short_title',
  hidden,
});

export const getMenuTitleFormField = ({ formatMessage, hidden }) => getFormField({
  formatMessage,
  controlType: 'short',
  attribute: 'menu_title',
  required: true,
  hidden,
});

export const getMenuOrderFormField = ({ formatMessage, hidden }) => {
  const field = getFormField({
    formatMessage,
    controlType: 'short',
    attribute: 'order',
    hidden,
  });
  field.validators.number = validateNumber;
  field.errorMessages.number = formatMessage(appMessages.forms.numberError);
  return field;
};

export const getMarkdownFormField = ({
  formatMessage, required, attribute = 'description', label, placeholder, hint, hidden,
}) => getFormField({
  formatMessage,
  controlType: 'markdown',
  required,
  attribute,
  label: label || attribute,
  placeholder: placeholder || attribute,
  hint: hint
    ? (appMessages.hints[hint] && formatMessage(appMessages.hints[hint]))
    : (appMessages.hints[attribute] && formatMessage(appMessages.hints[attribute])),
  hidden,
});

export const getTextareaFormField = ({
  formatMessage, attribute = 'description', required, hidden,
}) => getFormField({
  formatMessage,
  controlType: 'textarea',
  attribute,
  required,
  hidden,
});

export const getDateFormField = ({
  formatMessage, attribute, required = false, label, onChange, hidden,
}) => {
  const field = getFormField({
    formatMessage,
    controlType: 'date',
    attribute,
    required,
    label,
    onChange,
    hidden,
  });
  field.validators.date = validateDateFormat;
  field.errorMessages.date = formatMessage(appMessages.forms.dateFormatError, { format: DATE_FORMAT });
  return field;
};

export const getCheckboxFormField = ({
  formatMessage,
  attribute,
  onChange,
  hidden,
}) => (
  {
    id: attribute,
    controlType: 'checkbox',
    model: `.attributes.${attribute}`,
    label: appMessages.attributes[attribute] && formatMessage(appMessages.attributes[attribute]),
    // value: entity && entity.getIn(['attributes', attribute]) ? entity.getIn(['attributes', attribute]) : false,
    changeAction: onChange,
    hint: appMessages.hints[attribute] && formatMessage(appMessages.hints[attribute]),
    hidden,
  });

export const getUploadFormField = ({ formatMessage, hidden }) => getFormField({
  formatMessage,
  controlType: 'uploader',
  attribute: 'document_url',
  placeholder: 'url',
  hidden,
});

export const getEmailFormField = ({
  formatMessage, required = true, model = '.attributes.email', hidden,
}) => {
  const field = getFormField({
    formatMessage,
    controlType: 'email',
    attribute: 'email',
    type: 'email',
    required,
    model,
    hidden,
  });
  field.validators.email = validateEmailFormat;
  field.errorMessages.email = formatMessage(appMessages.forms.emailFormatError);
  return field;
};

export const getNameFormField = ({
  formatMessage, model = '.attributes.name', hidden,
}) => {
  const field = getFormField({
    formatMessage,
    controlType: 'input',
    attribute: 'name',
    required: true,
    model,
    hidden,
  });
  return field;
};

export const getPasswordFormField = ({
  formatMessage, model = '.attributes.password', hidden,
}) => {
  const field = getFormField({
    formatMessage,
    controlType: 'input',
    attribute: 'password',
    type: 'password',
    required: true,
    model,
    hidden,
  });
  field.validators.passwordLength = (val) => validateLength(val, 6);
  field.errorMessages.passwordLength = formatMessage(appMessages.forms.passwordShortError);
  return field;
};

export const getPasswordCurrentFormField = ({
  formatMessage, model = '.attributes.password', hidden,
}) => {
  const field = getFormField({
    formatMessage,
    controlType: 'input',
    attribute: 'password',
    placeholder: 'passwordCurrent',
    type: 'password',
    required: true,
    model,
    hidden,
  });
  // field.validators.email = validateEmailFormat;
  // field.errorMessages.email = formatMessage(appMessages.forms.emailFormatError);
  return field;
};

export const getPasswordNewFormField = ({
  formatMessage, model = '.attributes.passwordNew',
}) => {
  const field = getFormField({
    formatMessage,
    controlType: 'input',
    attribute: 'passwordNew',
    type: 'password',
    required: true,
    model,
  });
  // field.validators.email = validateEmailFormat;
  // field.errorMessages.email = formatMessage(appMessages.forms.emailFormatError);
  return field;
};

export const getPasswordConfirmationFormField = ({
  formatMessage, model = '.attributes.passwordConfirmation',
}) => {
  const field = getFormField({
    formatMessage,
    controlType: 'input',
    attribute: 'passwordConfirmation',
    type: 'password',
    required: true,
    model,
  });
  // field.validators.email = validateEmailFormat;
  // field.errorMessages.email = formatMessage(appMessages.forms.emailFormatError);
  return field;
};

export const getFormField = ({
  formatMessage,
  controlType,
  attribute,
  required,
  label,
  placeholder,
  hint,
  onChange,
  type,
  model,
  hidden,
}) => {
  const field = {
    id: attribute,
    controlType,
    type,
    model: model || `.attributes.${attribute}`,
    placeholder: appMessages.placeholders[placeholder || attribute] && formatMessage(appMessages.placeholders[placeholder || attribute]),
    label: appMessages.attributes[label || attribute] && formatMessage(appMessages.attributes[label || attribute]),
    validators: {},
    hasrequired: !!required,
    errorMessages: {},
    hint,
    hidden: required ? false : hidden,
  };
  if (onChange) {
    field.changeAction = onChange;
  }
  if (required) {
    field.validators.required = typeof required === 'function' ? required : validateRequired;
    field.errorMessages.required = formatMessage(appMessages.forms.fieldRequired);
  }
  return field;
};
