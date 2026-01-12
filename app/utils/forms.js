import { Map, List } from 'immutable';

import { filter, find } from 'lodash/collection';
import { get } from 'lodash/object';

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
  ATTRIBUTE_STATUSES,
  USER_ROLES,
  DATE_FORMAT,
  API,
  ACTIONTYPES_CONFIG,
  ACTORTYPES_CONFIG,
  RESOURCETYPES_CONFIG,
  INDICATOR_CONFIG,
  INDICATOR_FIELDS,
  RESOURCE_FIELDS,
  ACTORTYPES,
  ACTION_FIELDS,
  ACTOR_FIELDS,
  ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS,
} from 'themes/config';

import appMessages from 'containers/App/messages';

export const entityOption = (entity, defaultToId, hasTags, showCode) => Map({
  value: entity.get('id'),
  label: getEntityTitle(entity),
  reference: showCode && getEntityReference(entity, defaultToId),
  order: getEntityReference(entity, defaultToId),
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

export const getUserOptions = (entities, activeUserId) => entities
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
  hideByDefault,
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
    hideByDefault,
    // onCreate: onCreateOption
    //   ? () => onCreateOption({ path: API.INDICATORS })
    //   : null,
  }
  : null;
export const renderUserMultiControl = ({
  entities,
  intl,
  hideByDefault,
}) => entities
  ? {
    id: 'users',
    model: '.associatedUsers',
    dataPath: ['associatedUsers'],
    label: intl.formatMessage(appMessages.entities.users.plural),
    controlType: 'multiselect',
    options: entityOptions({
      entities,
      showCode: false,
    }),
    advanced: true,
    selectAll: true,
    hideByDefault,
    // onCreate: onCreateOption
    //   ? () => onCreateOption({ path: API.INDICATORS })
    //   : null,
  }
  : null;

export const getActorsFormControl = ({
  entities,
  taxonomies,
  onCreateOption,
  intl,
  isAdmin,
  hideByDefault,
  typeId,
  path = 'associatedActorsByActortype',
  fieldId,
}) => ({
  id: fieldId || `actors.${typeId}`,
  typeId,
  model: `.${path}.${typeId}`,
  dataPath: [path, typeId],
  label: intl.formatMessage(appMessages.entities[`actors_${typeId}`].plural),
  controlType: 'multiselect',
  options: entityOptions({
    entities,
    showCode: isAdmin || qe(typeId, ACTORTYPES.COUNTRY),
  }),
  advanced: true,
  selectAll: true,
  tagFilterGroups: makeTagFilterGroups(taxonomies, intl),
  onCreate: onCreateOption
    ? () => onCreateOption({
      path: API.ACTORS,
      attributes: { actortype_id: typeId },
    })
    : null,
  hideByDefault,
});

// actors grouped by actortype
export const renderActorsByActortypeControl = ({
  entitiesByActortype,
  taxonomies,
  onCreateOption,
  intl,
  isAdmin,
  hideByDefault,
  path = 'associatedActorsByActortype',
}) => entitiesByActortype
  ? entitiesByActortype.reduce(
    (memo, entities, typeId) => memo.concat(
      getActorsFormControl({
        entities,
        taxonomies,
        onCreateOption,
        intl,
        isAdmin,
        hideByDefault,
        typeId,
        path,
      })
    ),
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
  hideByDefault,
  path = 'associatedMembersByActortype',
}) => entitiesByActortype
  ? entitiesByActortype.reduce(
    (memo, entities, typeId) => memo.concat(
      getActorsFormControl({
        entities,
        taxonomies,
        onCreateOption,
        intl,
        isAdmin,
        hideByDefault,
        typeId,
        path,
        fieldId: `members.${typeId}`,
      })
    ),
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
  hideByDefault,
}) => entitiesByActortype
  ? entitiesByActortype.reduce(
    (memo, entities, typeId) => memo.concat(
      getActorsFormControl({
        entities,
        taxonomies,
        onCreateOption,
        intl,
        isAdmin,
        hideByDefault,
        typeId,
        path: 'associatedAssociationsByActortype',
        fieldId: `associations.${typeId}`,
      })
    ),
    [],
  ).sort((a, b) => {
    const configA = ACTORTYPES_CONFIG[a.typeId];
    const configB = ACTORTYPES_CONFIG[b.typeId];
    return configA.order < configB.order ? -1 : 1;
  })
  : null;

export const getActionsFormControl = ({
  entities,
  taxonomies,
  onCreateOption,
  intl,
  isAdmin,
  hideByDefault,
  typeId,
  path = 'associatedActionsByActiontype',
  fieldId,
  connectionAttributesForType,
}) => ({
  id: fieldId || `actions.${typeId}`,
  typeId,
  model: `.${path}.${typeId}`,
  dataPath: [path, typeId],
  label: intl.formatMessage(appMessages.entities[`actions_${typeId}`].plural),
  controlType: 'multiselect',
  options: entityOptions({ entities, showCode: isAdmin }),
  advanced: true,
  selectAll: true,
  connectionAttributes: connectionAttributesForType && connectionAttributesForType(typeId),
  tagFilterGroups: makeTagFilterGroups(taxonomies, intl),
  onCreate: onCreateOption
    ? () => onCreateOption({
      path: API.ACTIONS,
      attributes: { measuretype_id: typeId },
    })
    : null,
  hideByDefault,
});

export const renderActionsByActiontypeControl = ({
  entitiesByActiontype,
  taxonomies,
  onCreateOption,
  intl,
  connectionAttributesForType,
  model = 'associatedActionsByActiontype',
  path = 'associatedActionsByActiontype',
  isAdmin,
  hideByDefault,
}) => entitiesByActiontype
  ? entitiesByActiontype.reduce(
    (memo, entities, typeId) => memo.concat(
      getActionsFormControl({
        entities,
        taxonomies,
        onCreateOption,
        intl,
        isAdmin,
        hideByDefault,
        typeId,
        path: path || model,
        connectionAttributesForType,
      })
    ),
    [],
  ).sort((a, b) => {
    const configA = ACTIONTYPES_CONFIG[a.typeId];
    const configB = ACTIONTYPES_CONFIG[b.typeId];
    return configA.order < configB.order ? -1 : 1;
  })
  : null;

export const getResourcesFormControl = ({
  entities,
  onCreateOption,
  intl,
  isAdmin,
  hideByDefault,
  typeId,
  path = 'associatedResourcesByResourcetype',
  fieldId,
}) => ({
  id: fieldId || `resources.${typeId}`,
  model: `.${path}.${typeId}`,
  dataPath: [path, typeId],
  label: intl.formatMessage(appMessages.entities[`resources_${typeId}`].plural),
  controlType: 'multiselect',
  options: entityOptions({ entities, showCode: isAdmin }),
  advanced: true,
  selectAll: true,
  onCreate: onCreateOption
    ? () => onCreateOption({
      path: API.RESOURCES,
      attributes: { resourcetype_id: typeId },
    })
    : null,
  hideByDefault,
});

// actors grouped by actortype
export const renderResourcesByResourcetypeControl = ({
  entitiesByResourcetype,
  onCreateOption,
  intl,
  isAdmin,
  hideByDefault,
  model = 'associatedResourcesByResourcetype',
  path = 'associatedResourcesByResourcetype',
}) => entitiesByResourcetype
  ? entitiesByResourcetype.reduce(
    (memo, entities, typeId) => memo.concat(
      getResourcesFormControl({
        entities,
        onCreateOption,
        intl,
        isAdmin,
        hideByDefault,
        typeId,
        path: path || model,
      })
    ),
    [],
  ).sort((a, b) => a.id > b.id ? 1 : -1)
  : null;

export const getSingleTaxonomyFormControl = ({
  taxonomy,
  onCreateOption,
  intl,
  hideByDefault,
}) => ({
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
  hideByDefault,
});

// taxonomies with categories "embedded"
export const renderTaxonomyControl = ({
  taxonomies,
  onCreateOption,
  intl,
  hideByDefault,
}) => taxonomies
  ? taxonomies.toList().reduce(
    (memo, taxonomy) => memo.concat(
      getSingleTaxonomyFormControl(
        taxonomy,
        onCreateOption,
        intl,
        hideByDefault,
      )
    ),
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
  entities, label, activeParentId, hideByDefault,
}) => entities
  ? {
    id: 'associatedCategory',
    model: '.associatedCategory',
    dataPath: ['associatedCategory'],
    label,
    controlType: 'multiselect',
    multiple: false,
    options: parentCategoryOptions(entities, activeParentId),
    hideByDefault,
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

export const getRoleFormField = ({ formatMessage, roleOptions, hideByDefault }) => ({
  id: 'role',
  controlType: 'select',
  model: '.associatedRole',
  label: formatMessage(appMessages.entities.roles.single),
  options: Object.values(filter(USER_ROLES, (userRole) => roleOptions.map((roleOption) => parseInt(roleOption.get('id'), 10)).includes(userRole.value)
    || userRole.value === USER_ROLES.DEFAULT.value)),
  hideByDefault,
});

export const getCheckboxFormField = ({
  formatMessage, attribute = 'draft', hideByDefault, controlType, onChange,
}) => {
  let message;
  if (ATTRIBUTE_STATUSES[attribute]) {
    const option = find(ATTRIBUTE_STATUSES[attribute], { value: true });
    if (option) {
      /* eslint-disable prefer-destructuring */
      message = get(appMessages, option.message);
      /* eslint-enable prefer-destructuring */
    }
  }
  if (!message && appMessages.attributes[attribute]) {
    message = appMessages.attributes[attribute];
  }
  return {
    id: `status-${attribute}`,
    att: attribute,
    controlType: controlType || 'checkbox',
    model: `.attributes.${attribute}`,
    label: message ? formatMessage(message) : 'UNDEFINED',
    info: !!appMessages.attributeInfo[attribute],
    changeAction: onChange,
    hideByDefault,
  };
};

export const getTitleFormField = ({
  formatMessage,
  controlType = 'title',
  attribute = 'title',
  required,
  label,
  placeholder,
  hideByDefault,
}) => getFormField({
  formatMessage,
  controlType,
  attribute,
  required,
  label,
  placeholder,
  hideByDefault,
});

export const getReferenceFormField = ({
  formatMessage, required = false, isAutoReference = false, hideByDefault,
}) => getFormField({
  formatMessage,
  controlType: 'short',
  attribute: 'reference',
  required,
  label: required ? 'reference' : 'referenceOptional',
  hint: isAutoReference ? formatMessage(appMessages.hints.autoReference) : null,
  hideByDefault,
});

export const getCodeFormField = ({
  formatMessage,
  attribute = 'code',
  required = false,
  hideByDefault,
  placeholder,
  label,
}) => getFormField({
  formatMessage,
  controlType: 'short',
  attribute,
  label: label || attribute,
  placeholder: placeholder || attribute,
  required,
  hideByDefault,
});

export const getShortTextFormField = ({
  formatMessage, attribute, required = false, hideByDefault,
}) => getFormField({
  formatMessage,
  controlType: 'short',
  attribute,
  label: attribute,
  required,
  hideByDefault,
});

export const getTextFormField = ({
  formatMessage, attribute, required = false, hideByDefault,
}) => getFormField({
  formatMessage,
  controlType: 'input',
  attribute,
  label: attribute,
  required,
  hideByDefault,
});

export const getAmountFormField = ({
  formatMessage, required, attribute = 'amount', hideByDefault,
}) => getFormField({
  formatMessage,
  controlType: attribute,
  attribute,
  required,
  hint: formatMessage(appMessages.hints.amount),
  hideByDefault,
  // TODO: validate
});

export const getNumberFormField = ({
  formatMessage, required, attribute = 'value', hideByDefault,
}) => getFormField({
  formatMessage,
  controlType: attribute,
  attribute,
  required,
  hint: appMessages.hints[attribute] && formatMessage(appMessages.hints[attribute]),
  hideByDefault,
  // TODO: validate
});

export const getLinkFormField = ({
  formatMessage, required, attribute = 'url', hideByDefault,
}) => getFormField({
  formatMessage,
  controlType: attribute,
  attribute,
  required,
  hideByDefault,
  // TODO: validate
});

export const getShortTitleFormField = ({ formatMessage, hideByDefault }) => getFormField({
  formatMessage,
  controlType: 'short',
  attribute: 'short_title',
  hideByDefault,
});

export const getMenuTitleFormField = ({ formatMessage, hideByDefault }) => getFormField({
  formatMessage,
  controlType: 'short',
  attribute: 'menu_title',
  required: true,
  hideByDefault,
});

export const getMenuOrderFormField = ({ formatMessage, hideByDefault }) => {
  const field = getFormField({
    formatMessage,
    controlType: 'short',
    attribute: 'order',
    hideByDefault,
  });
  field.validators.number = validateNumber;
  field.errorMessages.number = formatMessage(appMessages.forms.numberError);
  return field;
};

export const getMarkdownFormField = ({
  formatMessage, required, attribute = 'description', label, placeholder, hint, hideByDefault,
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
  hideByDefault,
});

export const getTextareaFormField = ({
  formatMessage, attribute = 'description', required, hideByDefault,
}) => getFormField({
  formatMessage,
  controlType: 'textarea',
  attribute,
  required,
  hideByDefault,
});

export const getDateFormField = ({
  formatMessage, attribute, required = false, label, onChange, hideByDefault,
}) => {
  const field = getFormField({
    formatMessage,
    controlType: 'date',
    attribute,
    required,
    label,
    onChange,
    hideByDefault,
  });
  field.validators.date = validateDateFormat;
  field.errorMessages.date = formatMessage(appMessages.forms.dateFormatError, { format: DATE_FORMAT });
  return field;
};

// export const getCheckboxFormField = ({
//   formatMessage,
//   attribute,
//   onChange,
//   hideByDefault,
// }) => (
//   {
//     id: `checkbox-${attribute}`,
//     controlType: 'checkbox',
//     model: `.attributes.${attribute}`,
//     label: appMessages.attributes[attribute] && formatMessage(appMessages.attributes[attribute]),
//     // value: entity && entity.getIn(['attributes', attribute]) ? entity.getIn(['attributes', attribute]) : false,
//     changeAction: onChange,
//     hint: appMessages.hints[attribute] && formatMessage(appMessages.hints[attribute]),
//     hideByDefault,
//   });

export const getUploadFormField = ({ formatMessage, hideByDefault }) => getFormField({
  formatMessage,
  controlType: 'uploader',
  attribute: 'document_url',
  placeholder: 'url',
  hideByDefault,
});

export const getEmailFormField = ({
  formatMessage, required, model = '.attributes.email', hideByDefault,
}) => {
  const field = getFormField({
    formatMessage,
    controlType: 'email',
    attribute: 'email',
    type: 'email',
    required,
    model,
    hideByDefault,
  });
  field.validators.email = validateEmailFormat;
  field.errorMessages.email = formatMessage(appMessages.forms.emailFormatError);
  return field;
};

export const getNameFormField = ({
  formatMessage, model = '.attributes.name', hideByDefault,
}) => {
  const field = getFormField({
    formatMessage,
    controlType: 'input',
    attribute: 'name',
    required: true,
    model,
    hideByDefault,
  });
  return field;
};

export const getPasswordFormField = ({
  formatMessage, model = '.attributes.password', hideByDefault,
}) => {
  const field = getFormField({
    formatMessage,
    controlType: 'input',
    attribute: 'password',
    type: 'password',
    required: true,
    model,
    hideByDefault,
  });
  field.validators.passwordLength = (val) => validateLength(val, 6);
  field.errorMessages.passwordLength = formatMessage(appMessages.forms.passwordShortError);
  return field;
};

export const getPasswordCurrentFormField = ({
  formatMessage, model = '.attributes.password', hideByDefault,
}) => {
  const field = getFormField({
    formatMessage,
    controlType: 'input',
    attribute: 'password',
    placeholder: 'passwordCurrent',
    type: 'password',
    required: true,
    model,
    hideByDefault,
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

const getFormField = ({
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
  hideByDefault,
}) => {
  const field = {
    id: attribute,
    controlType,
    type,
    model: model || `.attributes.${attribute}`,
    placeholder: appMessages.placeholders[placeholder || attribute] && formatMessage(appMessages.placeholders[placeholder || attribute]),
    label: appMessages.attributes[label || attribute] && formatMessage(appMessages.attributes[label || attribute]),
    info: !!appMessages.attributeInfo[attribute],
    validators: {},
    hasrequired: !!required,
    errorMessages: {},
    hint,
    hideByDefault: required ? false : hideByDefault,
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

const getEntityFormField = (
  field,
  {
    isAdmin,
    typeId, // the action type of the principal entity
    taxonomies,
    connectedTaxonomies,
    userOptions,
    indicatorOptions,
    roleOptions,
    actionsByActiontype,
    topActionsByActiontype,
    subActionsByActiontype,
    actorsByActortype,
    associationsByActortype,
    membersByActortype,
    resourcesByResourcetype,
    entityIndicatorConnections,
    onCreateOption,
    connectionAttributesForType,
    intl,
  },
  fieldConfig,
) => {
  const { formatMessage } = intl;
  const {
    attribute,
    label,
    placeholder,
    connection,
    taxonomy,
    required,
    prepopulate,
    hideByDefault,
    type, //  the type of the entities associated in field
    asParents,
    asChildren,
    fieldType,
    basis,
  } = field;
  let result;
  if (attribute && !fieldConfig) {
    console.log('attribute, fieldConfig', attribute, fieldConfig);
  }
  if (attribute && fieldConfig) {
    const { controlType } = fieldConfig;
    const cleanFieldType = fieldType || fieldConfig.type;
    const fieldArgs = {
      formatMessage, attribute, required, hideByDefault, label, placeholder, controlType,
    };
    // for attributes
    if (attribute === 'title') {
      result = getTitleFormField(fieldArgs);
    } else if (attribute === 'code' || attribute === 'prefix' || attribute === 'reference') {
      result = getCodeFormField(fieldArgs);
    } else if (attribute === 'email') {
      result = getEmailFormField(fieldArgs);
    } else if (attribute === 'menu_title') {
      result = getMenuTitleFormField(fieldArgs);
    } else if (attribute === 'order') {
      result = getMenuOrderFormField(fieldArgs);

    // for field types
    } else if (cleanFieldType === 'markdown') {
      result = getMarkdownFormField(fieldArgs);
    } else if (cleanFieldType === 'date') {
      result = getDateFormField(fieldArgs);
    } else if (cleanFieldType === 'text') {
      result = getTextFormField(fieldArgs);
    } else if (cleanFieldType === 'short') {
      result = getFormField({
        ...fieldArgs,
        controlType: 'short',
        hideByDefault,
      });
    } else if (cleanFieldType === 'textarea') {
      result = getTextareaFormField(fieldArgs);
    } else if (cleanFieldType === 'url') {
      result = getLinkFormField(fieldArgs);
    } else if (cleanFieldType === 'bool') {
      result = getCheckboxFormField(fieldArgs);
    }
  } else if (connection) {
    if (type && connection === API.ACTORS) {
      let entities = actorsByActortype
      && actorsByActortype.get(type);
      let path = 'associatedActorsByActortype';
      if (asParents && associationsByActortype) {
        entities = associationsByActortype.get(type);
        path = 'associatedAssociationsByActortype';
      } else if (asChildren && membersByActortype) {
        entities = membersByActortype.get(type);
        path = 'associatedMembersByActortype';
      }
      if (entities) {
        result = getActorsFormControl({
          typeId: type,
          entities,
          taxonomies: connectedTaxonomies,
          onCreateOption,
          isAdmin,
          intl,
          path,
        });
      }
    } else if (type && connection === API.ACTIONS) {
      let entities = actionsByActiontype
        && actionsByActiontype.get(type);
      let path = 'associatedActionsByActiontype';
      if (asParents && topActionsByActiontype) {
        entities = topActionsByActiontype.get(type);
        path = 'associatedTopActionsByActiontype';
      } else if (asChildren && subActionsByActiontype) {
        entities = subActionsByActiontype.get(type);
        path = 'associatedSubActionsByActiontype';
      }
      if (entities) {
        result = getActionsFormControl({
          typeId: type,
          entities,
          taxonomies: connectedTaxonomies,
          onCreateOption,
          isAdmin,
          intl,
          path,
          connectionAttributesForType,
        });
      }
    }
    if (typeId && connection === API.INDICATORS && indicatorOptions) {
      result = renderIndicatorControl({
        entities: indicatorOptions,
        intl,
        connections: entityIndicatorConnections || null,
        connectionAttributes: [{
          attribute: 'supportlevel_id',
          type: 'select',
          showCode: isAdmin,
          options: ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS[typeId].map(
            (level) => ({
              label: intl.formatMessage(appMessages.supportlevels[level.value]),
              ...level,
            }),
          ),
        }],
      });
    } else if (type && connection === API.RESOURCES && resourcesByResourcetype) {
      result = getResourcesFormControl({
        typeId: type,
        entities: resourcesByResourcetype.get(type),
        onCreateOption,
        isAdmin,
        intl,
      });
    } else if (connection === API.USERS && userOptions) {
      result = renderUserMultiControl({ entities: userOptions, intl });
    } else if (connection === API.ROLES && roleOptions) {
      result = getRoleFormField(
        { formatMessage, roleOptions, hideByDefault }
      );
    }
  } else if (taxonomy && taxonomies) {
    const theTaxonomy = taxonomies.get(`${taxonomy}`);
    if (theTaxonomy) {
      result = getSingleTaxonomyFormControl({
        taxonomy: theTaxonomy,
        onCreateOption,
        intl,
        hideByDefault,
      });
    }
  }
  if (!result) return null;
  result = {
    ...result,
    required,
    hasrequired: !!required,
    autofill: !!prepopulate,
    hideByDefault,
    activeIf: field.activeIf,
    activeForAdmin: field.activeForAdmin,
    activeForAdminOrCoordinator: field.activeForAdminOrCoordinator,
    basis, // relative width within row
  };
  return result;
};
const checkPermission = ({
  permissions, // args
  requirements, // section / step / field
}) => {
  const { isAdmin, isMember, isMine } = permissions;
  const { needsAdmin, needsMember, needsAdminOrOwn } = requirements;
  const passAdmin = needsAdmin ? isAdmin : true;
  const passMember = needsMember ? (isMember || isAdmin) : true;
  const passAdminOrMine = needsAdminOrOwn ? (isAdmin || isMine) : true;
  return passAdmin && passAdminOrMine && passMember;
};

export const getEntityFormFields = (args, shape, attributes) => {
  const steps = shape && shape.reduce(
    (memo, step) => {
      if (!checkPermission({ permissions: args, requirements: step })) {
        return memo;
      }
      return [
        ...memo,
        {
          ...step,
          sections: step.sections && step.sections.reduce(
            (memo2, section) => {
              if (!checkPermission({ permissions: args, requirements: section })) {
                return memo2;
              }
              return [
                ...memo2,
                {
                  ...section,
                  rows: section.rows.map(
                    (row) => ({
                      fields: row.reduce(
                        (memo3, field) => {
                          if (!checkPermission({ permissions: args, requirements: field })) {
                            return memo3;
                          }
                          if (args.isNew && field.skipNew) {
                            return memo3;
                          }
                          const fieldConfig = (field.attribute && attributes)
                            ? attributes[field.attribute]
                            : null;
                          return [
                            ...memo3,
                            getEntityFormField(field, args, fieldConfig),
                          ];
                        },
                        [],
                      ),
                    })
                  ),
                },
              ];
            },
            [],
          ),
          // footer fields
          fields: step.fields && step.fields.reduce(
            (memo2, field) => {
              if (!checkPermission({ permissions: args, requirements: field })) {
                return memo2;
              }
              if (args.isNew && field.skipNew) {
                return memo2;
              }
              const fieldConfig = (field.attribute && attributes)
                ? attributes[field.attribute]
                : null;
              return [
                ...memo2,
                getEntityFormField(field, args, fieldConfig),
              ];
            },
            [],
          ),
        },
      ];
    },
    [],
  );
  return steps;
};


export const getActiontypeFormFields = (args) => {
  const { typeId } = args;
  const shape = ACTIONTYPES_CONFIG[parseInt(typeId, 10)]
    && ACTIONTYPES_CONFIG[parseInt(typeId, 10)].form;
  return shape && getEntityFormFields(
    args, shape, ACTION_FIELDS.ATTRIBUTES
  );
};

export const getActortypeFormFields = (args) => {
  const { typeId } = args;
  const shape = ACTORTYPES_CONFIG[parseInt(typeId, 10)]
    && ACTORTYPES_CONFIG[parseInt(typeId, 10)].form;
  return shape && getEntityFormFields(
    args, shape, ACTOR_FIELDS.ATTRIBUTES
  );
};
export const getCategoryFormFields = (args) => {
  const { typeId } = args;
  const shape = ACTORTYPES_CONFIG[parseInt(typeId, 10)]
    && ACTORTYPES_CONFIG[parseInt(typeId, 10)].form;
  return shape && getEntityFormFields(
    args, shape, ACTOR_FIELDS.ATTRIBUTES
  );
};

export const getResourcetypeFormFields = (args) => getEntityFormFields(
  args, RESOURCETYPES_CONFIG.form, RESOURCE_FIELDS.ATTRIBUTES
);

export const getIndicatorFormFields = (args) => getEntityFormFields(
  args, INDICATOR_CONFIG.form, INDICATOR_FIELDS.ATTRIBUTES
);
