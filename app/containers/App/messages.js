/*
 * Global Messages
 *
 * This contains the global text.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  app: {
    title: {
      id: 'app.containers.App.app.title',
      defaultMessage: 'Sadata',
    },
    claim: {
      id: 'app.containers.App.app.claim',
      defaultMessage: 'Samoa\'s home of human rights implementation',
    },
  },
  supportlevels: {
    0: {
      id: 'app.containers.App.supportlevels.0',
      defaultMessage: 'No support level assigned',
    },
    1: {
      id: 'app.containers.App.supportlevels.1',
      defaultMessage: 'Strong support',
    },
    2: {
      id: 'app.containers.App.supportlevels.2',
      defaultMessage: 'Quite positive',
    },
    3: {
      id: 'app.containers.App.supportlevels.3',
      defaultMessage: 'On the fence',
    },
    4: {
      id: 'app.containers.App.supportlevels.4',
      defaultMessage: 'Rather sceptical',
    },
    5: {
      id: 'app.containers.App.supportlevels.5',
      defaultMessage: 'Opponent',
    },
    99: {
      id: 'app.containers.App.supportlevels.99',
      defaultMessage: 'No statement on topic',
    },
  },
  actortypes: {
    single: {
      id: 'app.containers.App.actortypes.single',
      defaultMessage: 'Actortype',
    },
    plural: {
      id: 'app.containers.App.actortypes.plural',
      defaultMessage: 'Actortypes',
    },
    all: {
      id: 'app.containers.App.actortypes.all',
      defaultMessage: 'All Actortypes',
    },
    1: {
      id: 'app.containers.App.actortypes.1',
      defaultMessage: 'Human Rights Actors',
    },
    2: {
      id: 'app.containers.App.actortypes.2',
      defaultMessage: 'Sustainable Development Goals',
    },
    3: {
      id: 'app.containers.App.actortypes.3',
      defaultMessage: 'Actortype 3',
    },
    4: {
      id: 'app.containers.App.actortypes.4',
      defaultMessage: 'Actortype 4',
    },
    5: {
      id: 'app.containers.App.actortypes.5',
      defaultMessage: 'Actortype 5',
    },
  },
  actortypes_short: {
    common: {
      id: 'app.containers.App.actortypes_short.common',
      defaultMessage: 'multiple',
    },
    1: {
      id: 'app.containers.App.actortypes_short.1',
      defaultMessage: 'HR',
    },
    2: {
      id: 'app.containers.App.actortypes_short.2',
      defaultMessage: 'SDGs',
    },
    3: {
      id: 'app.containers.App.actortypes_short.3',
      defaultMessage: 'Actortype 3',
    },
    4: {
      id: 'app.containers.App.actortypes_short.4',
      defaultMessage: 'Actortype 4',
    },
    5: {
      id: 'app.containers.App.actortypes_short.5',
      defaultMessage: 'Actortype 5',
    },
  },
  actortypes_long: {
    1: {
      id: 'app.containers.App.actortypes_long.1',
      defaultMessage: 'HR',
    },
    2: {
      id: 'app.containers.App.actortypes_long.2',
      defaultMessage: 'SDGs',
    },
    3: {
      id: 'app.containers.App.actortypes_long.3',
      defaultMessage: 'Actortype 3',
    },
    4: {
      id: 'app.containers.App.actortypes_long.4',
      defaultMessage: 'Actortype 4',
    },
    5: {
      id: 'app.containers.App.actortypes_long.5',
      defaultMessage: 'Actortype 5',
    },
  },
  actortypes_about: {
    1: {
      id: 'app.containers.App.actortypes_about.1',
      defaultMessage: 'HR',
    },
    2: {
      id: 'app.containers.App.actortypes_about.2',
      defaultMessage: 'SDGs',
    },
    3: {
      id: 'app.containers.App.actortypes_about.3',
      defaultMessage: 'Actortype 3',
    },
    4: {
      id: 'app.containers.App.actortypes_about.4',
      defaultMessage: 'Actortype 4',
    },
    5: {
      id: 'app.containers.App.actortypes_about.5',
      defaultMessage: 'Actortype 5',
    },
  },
  actortypes_info: {
    1: {
      id: 'app.containers.App.actortypes_info.1',
      defaultMessage: 'In some cases country memberships/actors are not displayed in international frameworks and policies due to difficulty in retrieving information and potential inconsistencies through updates (e.g. regarding ratifications, etc.).',
    },
    2: {
      id: 'app.containers.App.actortypes_info.2',
      defaultMessage: 'The linking of institutions with activities, initiatives, etc. is partially shown in this mapping tool. For a comprehensive overview, institutions are also listed, but not linked to actors, etc., as they only contribute to plastic pollution prevention in general. It is continuously updated, especially with regard to regional contexts. ',
    },
    3: {
      id: 'app.containers.App.actortypes_info.3',
      defaultMessage: 'Actortype 3',
    },
    4: {
      id: 'app.containers.App.actortypes_info.4',
      defaultMessage: 'The naming and classifications of regions in this mapping tool is for informational purposes only and do not constitute recognition of international boundaries or regions.',
    },
    5: {
      id: 'app.containers.App.actortypes_info.5',
      defaultMessage: 'Actortype 5',
    },
    6: {
      id: 'app.containers.App.actortypes_info.6',
      defaultMessage: 'Actortype 6',
    },
    7: {
      id: 'app.containers.App.actortypes_info.7',
      defaultMessage: 'Actortype 7',
    },
  },
  actortypeGroups: {
    1: {
      id: 'app.containers.App.actortypeGroups.1',
      defaultMessage: 'Countries',
    },
    2: {
      id: 'app.containers.App.actortypeGroups.2',
      defaultMessage: 'Other actors and activity targets',
    },
  },
  resourcetypes: {
    single: {
      id: 'app.containers.App.resourcetypes.single',
      defaultMessage: 'Resource type',
    },
    plural: {
      id: 'app.containers.App.resourcetypes.plural',
      defaultMessage: 'Resource types',
    },
    all: {
      id: 'app.containers.App.resourcetypes.all',
      defaultMessage: 'All resource types',
    },
    1: {
      id: 'app.containers.App.resourcetypes.1',
      defaultMessage: 'References',
    },
    2: {
      id: 'app.containers.App.resourcetypes.2',
      defaultMessage: 'Websites',
    },
    3: {
      id: 'app.containers.App.resourcetypes.3',
      defaultMessage: 'Documents',
    },
    4: {
      id: 'app.containers.App.resourcetypes.4',
      defaultMessage: 'Action Plans',
    },
    5: {
      id: 'app.containers.App.resourcetypes.5',
      defaultMessage: 'Marine Litter Action Plans',
    },
  },
  resourcetypes_short: {
    common: {
      id: 'app.containers.App.resourcetypes_short.common',
      defaultMessage: 'multiple',
    },
    1: {
      id: 'app.containers.App.resourcetypes_short.1',
      defaultMessage: 'Refs',
    },
    2: {
      id: 'app.containers.App.resourcetypes_short.2',
      defaultMessage: 'Web',
    },
    3: {
      id: 'app.containers.App.resourcetypes_short.3',
      defaultMessage: 'Docs',
    },
    4: {
      id: 'app.containers.App.resourcetypes_short.4',
      defaultMessage: 'APs',
    },
    5: {
      id: 'app.containers.App.resourcetypes_short.5',
      defaultMessage: 'MLAPs',
    },
  },
  resourcetypes_long: {
    1: {
      id: 'app.containers.App.resourcetypes_long.1',
      defaultMessage: 'Refs',
    },
    2: {
      id: 'app.containers.App.resourcetypes_long.2',
      defaultMessage: 'Web',
    },
    3: {
      id: 'app.containers.App.resourcetypes_long.3',
      defaultMessage: 'Docs',
    },
    4: {
      id: 'app.containers.App.resourcetypes_long.4',
      defaultMessage: 'APs',
    },
    5: {
      id: 'app.containers.App.resourcetypes_long.5',
      defaultMessage: 'MLAPs',
    },
  },
  resourcetypes_about: {
    1: {
      id: 'app.containers.App.resourcetypes_about.1',
      defaultMessage: 'Refs',
    },
    2: {
      id: 'app.containers.App.resourcetypes_about.2',
      defaultMessage: 'Web',
    },
    3: {
      id: 'app.containers.App.resourcetypes_about.3',
      defaultMessage: 'Docs',
    },
    4: {
      id: 'app.containers.App.resourcetypes_about.4',
      defaultMessage: 'APs',
    },
    5: {
      id: 'app.containers.App.resourcetypes_about.5',
      defaultMessage: 'MLAPs',
    },
  },
  resourcetypeGroups: {
    1: {
      id: 'app.containers.App.resourcetypeGroups.1',
      defaultMessage: 'All resources',
    },
    2: {
      id: 'app.containers.App.resourcetypeGroups.2',
      defaultMessage: 'All resources',
    },
    3: {
      id: 'app.containers.App.resourcetypeGroups.3',
      defaultMessage: 'All resources',
    },
  },
  actiontypes: {
    single: {
      id: 'app.containers.App.actiontypes.single',
      defaultMessage: 'Actortype',
    },
    plural: {
      id: 'app.containers.App.actiontypes.plural',
      defaultMessage: 'Actortypes',
    },
    all: {
      id: 'app.containers.App.actiontypes.all',
      defaultMessage: 'All Actortypes',
    },
    1: {
      id: 'app.containers.App.actiontypes.1',
      defaultMessage: 'Human Rights Actors',
    },
    2: {
      id: 'app.containers.App.actiontypes.2',
      defaultMessage: 'Sustainable Development Goals',
    },
    3: {
      id: 'app.containers.App.actiontypes.3',
      defaultMessage: 'Actortype 3',
    },
    4: {
      id: 'app.containers.App.actiontypes.4',
      defaultMessage: 'Actortype 4',
    },
    5: {
      id: 'app.containers.App.actiontypes.5',
      defaultMessage: 'Actortype 5',
    },
    6: {
      id: 'app.containers.App.actiontypes.6',
      defaultMessage: 'Actortype 6',
    },
    7: {
      id: 'app.containers.App.actiontypes.7',
      defaultMessage: 'Actortype 7',
    },
  },
  actiontypes_short: {
    common: {
      id: 'app.containers.App.actiontypes_short.common',
      defaultMessage: 'multiple',
    },
    1: {
      id: 'app.containers.App.actiontypes_short.1',
      defaultMessage: 'HR',
    },
    2: {
      id: 'app.containers.App.actiontypes_short.2',
      defaultMessage: 'SDGs',
    },
    3: {
      id: 'app.containers.App.actiontypes_short.3',
      defaultMessage: 'Actortype 3',
    },
    4: {
      id: 'app.containers.App.actiontypes_short.4',
      defaultMessage: 'Actortype 4',
    },
    5: {
      id: 'app.containers.App.actiontypes_short.5',
      defaultMessage: 'Actortype 5',
    },
    6: {
      id: 'app.containers.App.actiontypes_short.6',
      defaultMessage: 'Actortype 6',
    },
    7: {
      id: 'app.containers.App.actiontypes_short.7',
      defaultMessage: 'Actortype 7',
    },
  },
  actiontypes_long: {
    1: {
      id: 'app.containers.App.actiontypes_long.1',
      defaultMessage: 'HR',
    },
    2: {
      id: 'app.containers.App.actiontypes_long.2',
      defaultMessage: 'SDGs',
    },
    3: {
      id: 'app.containers.App.actiontypes_long.3',
      defaultMessage: 'Actortype 3',
    },
    4: {
      id: 'app.containers.App.actiontypes_long.4',
      defaultMessage: 'Actortype 4',
    },
    5: {
      id: 'app.containers.App.actiontypes_long.5',
      defaultMessage: 'Actortype 5',
    },
    6: {
      id: 'app.containers.App.actiontypes_long.6',
      defaultMessage: 'Actortype 6',
    },
    7: {
      id: 'app.containers.App.actiontypes_long.7',
      defaultMessage: 'Actortype 7',
    },
  },
  actiontypes_about: {
    1: {
      id: 'app.containers.App.actiontypes_about.1',
      defaultMessage: 'HR',
    },
    2: {
      id: 'app.containers.App.actiontypes_about.2',
      defaultMessage: 'SDGs',
    },
    3: {
      id: 'app.containers.App.actiontypes_about.3',
      defaultMessage: 'Actortype 3',
    },
    4: {
      id: 'app.containers.App.actiontypes_about.4',
      defaultMessage: 'Actortype 4',
    },
    5: {
      id: 'app.containers.App.actiontypes_about.5',
      defaultMessage: 'Actortype 5',
    },
    6: {
      id: 'app.containers.App.actiontypes_about.6',
      defaultMessage: 'Actortype 6',
    },
    7: {
      id: 'app.containers.App.actiontypes_about.7',
      defaultMessage: 'Actortype 7',
    },
  },
  actiontypes_info: {
    1: {
      id: 'app.containers.App.actiontypes_info.1',
      defaultMessage: 'In some cases country memberships/actors are not displayed in international frameworks and policies due to difficulty in retrieving information and potential inconsistencies through updates (e.g. regarding ratifications, etc.).',
    },
    2: {
      id: 'app.containers.App.actiontypes_info.2',
      defaultMessage: 'SDGs',
    },
    3: {
      id: 'app.containers.App.actiontypes_info.3',
      defaultMessage: 'Actortype 3',
    },
    4: {
      id: 'app.containers.App.actiontypes_info.4',
      defaultMessage: 'Actortype 4',
    },
    5: {
      id: 'app.containers.App.actiontypes_info.5',
      defaultMessage: 'The term **donor** may also refer to other actors responsible for conducting the donor activity, such as **implementing partners**. A more detailed differentiation of different "donor" types is currently under development.',
    },
    6: {
      id: 'app.containers.App.actiontypes_info.6',
      defaultMessage: 'Actortype 6',
    },
    7: {
      id: 'app.containers.App.actiontypes_info.7',
      defaultMessage: 'Actortype 7',
    },
  },
  actiontypeGroups: {
    1: {
      id: 'app.containers.App.actiontypeGroups.1',
      defaultMessage: 'Donor activities',
    },
    2: {
      id: 'app.containers.App.actiontypeGroups.2',
      defaultMessage: 'Frameworks, actions and policies',
    },
    3: {
      id: 'app.containers.App.actiontypeGroups.3',
      defaultMessage: 'Initiatives',
    },
  },
  taxonomyGroups: {
    common: {
      id: 'app.containers.App.taxonomyGroups.common',
      defaultMessage: 'common',
    },
    actions: {
      id: 'app.containers.App.taxonomyGroups.actions',
      defaultMessage: 'actions',
    },
    actors: {
      id: 'app.containers.App.taxonomyGroups.actors',
      defaultMessage: '{type}',
    },
    users: {
      id: 'app.containers.App.taxonomyGroups.users',
      defaultMessage: '{type}',
    },
  },
  buttons: {
    cancel: {
      id: 'app.containers.App.buttons.cancel',
      defaultMessage: 'Cancel',
    },
    save: {
      id: 'app.containers.App.buttons.save',
      defaultMessage: 'Save',
    },
    close: {
      id: 'app.containers.App.buttons.close',
      defaultMessage: 'Close',
    },
    add: {
      id: 'app.containers.App.buttons.add',
      defaultMessage: 'New',
    },
    edit: {
      id: 'app.containers.App.buttons.edit',
      defaultMessage: 'Edit',
    },
    assign: {
      id: 'app.containers.App.buttons.assign',
      defaultMessage: 'Update',
    },
    updateFilter: {
      id: 'app.containers.App.buttons.updateFilter',
      defaultMessage: 'Apply filters',
    },
    previous: {
      id: 'app.containers.App.buttons.previous',
      defaultMessage: 'Previous',
    },
    next: {
      id: 'app.containers.App.buttons.next',
      defaultMessage: 'Next',
    },
    import: {
      id: 'app.containers.App.buttons.import',
      defaultMessage: 'Import',
    },
    hideSecondaryNavigation: {
      id: 'app.containers.App.buttons.hideSecondaryNavigation',
      defaultMessage: 'Hide top menu',
    },
    showSecondaryNavigation: {
      id: 'app.containers.App.buttons.showSecondaryNavigation',
      defaultMessage: 'Show top menu',
    },
  },
  labels: {
    perPage: {
      id: 'app.containers.App.labels.perPage',
      defaultMessage: 'Per page',
    },
    groupedByTaxonomy: {
      id: 'app.containers.App.labels.groupedByTaxonomy',
      defaultMessage: ' (by {tax})',
    },
    smart: {
      met: {
        id: 'app.containers.App.labels.smart.met',
        defaultMessage: 'Met',
      },
      notMet: {
        id: 'app.containers.App.labels.smart.notMet',
        defaultMessage: 'Not met',
      },
    },
    userLoading: {
      id: 'app.containers.App.labels.userLoading',
      defaultMessage: 'Signing in...',
    },
  },
  fields: {
    connectionsGrouped: {
      id: 'app.containers.App.fields.connectionsGrouped',
      defaultMessage: '{size} {type} grouped by {byType}',
    },
  },
  forms: {
    fieldRequired: {
      id: 'app.containers.App.forms.fieldRequired',
      defaultMessage: 'This field cannot be empty',
    },
    dateFormatError: {
      id: 'app.containers.App.forms.dateFormatError',
      defaultMessage: 'Please enter the date in the required format: {format}',
    },
    emailFormatError: {
      id: 'app.containers.App.forms.emailFormatError',
      defaultMessage: 'Please enter a valid email address',
    },
    passwordMismatchError: {
      id: 'app.containers.App.forms.passwordMismatchError',
      defaultMessage: 'Password confirmation does not match password',
    },
    passwordShortError: {
      id: 'app.containers.App.forms.passwordShortError',
      defaultMessage: 'Password is too short (minimum is 6 characters)',
    },
    passwordInvalidError: {
      id: 'app.containers.App.forms.passwordInvalidError',
      defaultMessage: 'Current password does not match password on file',
    },
    numberError: {
      id: 'app.containers.App.forms.numberError',
      defaultMessage: 'Please enter a number',
    },
    endDateBeforeStartDateError: {
      id: 'app.containers.App.forms.endDateBeforeStartDateError',
      defaultMessage: 'End date must be after start date',
    },
    startDateAfterEndDateError: {
      id: 'app.containers.App.forms.startDateAfterEndDateError',
      defaultMessage: 'Start date must be before end date',
    },
    outdatedError: {
      id: 'app.containers.App.forms.outdatedError',
      defaultMessage: 'Item outdated: this item had been updated on the server. Please review the latest server version below.',
    },
    titleRequiredError: {
      id: 'app.containers.App.forms.titleRequiredError',
      defaultMessage: '"Title" is required. ',
    },
    referenceRequiredError: {
      id: 'app.containers.App.forms.referenceRequiredError',
      defaultMessage: '"Reference" is required. ',
    },
  },
  hints: {
    autoReference: {
      id: 'app.containers.App.hints.autoReference',
      defaultMessage: 'Leave blank to assign database id',
    },
    user_only: {
      id: 'app.containers.App.hints.user_only',
      defaultMessage: 'Check to categorise users only',
    },
    amount: {
      id: 'app.containers.App.hints.amount',
      defaultMessage: 'Note',
    },
    printListMore: {
      id: 'app.containers.App.hints.printListMore',
      defaultMessage: 'List only showing {no} items.',
    },
    content: {
      id: 'app.containers.App.hints.content',
      defaultMessage: 'content hint',
    },
  },
  textValues: {
    user_only: {
      id: 'app.containers.App.textValues.user_only',
      defaultMessage: 'Categorises users only',
    },
  },
  import: {
    hint: {
      id: 'app.containers.App.import.hint',
      defaultMessage: 'This row provides additional information about the columns. Please replace or remove it before importing',
    },
    required: {
      id: 'app.containers.App.import.required',
      defaultMessage: 'Required',
    },
    optional: {
      id: 'app.containers.App.import.optional',
      defaultMessage: 'Optional',
    },
    text: {
      id: 'app.containers.App.import.text',
      defaultMessage: 'text',
    },
    number: {
      id: 'app.containers.App.import.number',
      defaultMessage: 'number',
    },
    markdown: {
      id: 'app.containers.App.import.markdown',
      defaultMessage: 'text (markdown supported)',
    },
    bool: {
      id: 'app.containers.App.import.bool',
      defaultMessage: 'boolean (true/false)',
    },
    date: {
      id: 'app.containers.App.import.date',
      defaultMessage: 'date ({format})',
    },
    url: {
      id: 'app.containers.App.import.url',
      defaultMessage: 'url',
    },
  },
  importFields: {
    title: {
      id: 'app.containers.App.importFields.title',
      defaultMessage: 'Title',
    },
    description: {
      id: 'app.containers.App.importFields.description',
      defaultMessage: 'Description',
    },
  },
  placeholders: {
    title: {
      id: 'app.containers.App.placeholders.title',
      defaultMessage: 'Enter title',
    },
    name: {
      id: 'app.containers.App.placeholders.name',
      defaultMessage: 'Full name',
    },
    email: {
      id: 'app.containers.App.placeholders.email',
      defaultMessage: 'Email address',
    },
    password: {
      id: 'app.containers.App.placeholders.password',
      defaultMessage: 'Password',
    },
    passwordCurrent: {
      id: 'app.containers.App.placeholders.passwordCurrent',
      defaultMessage: 'Current Password',
    },
    passwordNew: {
      id: 'app.containers.App.placeholders.passwordNew',
      defaultMessage: 'New Password',
    },
    passwordConfirmation: {
      id: 'app.containers.App.placeholders.passwordConfirmation',
      defaultMessage: 'Confirm Password',
    },
    short_title: {
      id: 'app.containers.App.placeholders.short_title',
      defaultMessage: 'Abbr.',
    },
    menu_title: {
      id: 'app.containers.App.placeholders.menu_title',
      defaultMessage: 'Menu title',
    },
    order: {
      id: 'app.containers.App.placeholders.order',
      defaultMessage: '#',
    },
    reference: {
      id: 'app.containers.App.placeholders.reference',
      defaultMessage: 'ID',
    },
    code: {
      id: 'app.containers.App.placeholders.code',
      defaultMessage: 'ID',
    },
    prefix: {
      id: 'app.containers.App.placeholders.prefix',
      defaultMessage: 'Dr/Ms/Mr',
    },
    phone: {
      id: 'app.containers.App.placeholders.phone',
      defaultMessage: 'Enter #',
    },
    address: {
      id: 'app.containers.App.placeholders.address',
      defaultMessage: 'Enter address',
    },
    description: {
      id: 'app.containers.App.placeholders.description',
      defaultMessage: 'Enter description',
    },
    comment: {
      id: 'app.containers.App.placeholders.comment',
      defaultMessage: 'Enter comment',
    },
    content: {
      id: 'app.containers.App.placeholders.content',
      defaultMessage: 'Enter content',
    },
    date_comment: {
      id: 'app.containers.App.placeholders.target_date_comment',
      defaultMessage: 'Additional information',
    },
    url: {
      id: 'app.containers.App.placeholders.url',
      defaultMessage: 'Enter full URL ("https://example.org")',
    },
    number: {
      id: 'app.containers.App.placeholders.number',
      defaultMessage: 'ID',
    },
    amount: {
      id: 'app.containers.App.placeholders.amount',
      defaultMessage: 'amount',
    },
    amount_comment: {
      id: 'app.containers.App.placeholders.amount_comment',
      defaultMessage: 'amount_comment',
    },
  },
  attributes: {
    id: {
      id: 'app.containers.App.attributes.id',
      defaultMessage: 'ID',
    },
    supportlevel_id: {
      id: 'app.containers.App.attributes.supportlevel_id',
      defaultMessage: 'Level of support',
    },
    actortype_id: {
      id: 'app.containers.App.attributes.actortype_id',
      defaultMessage: 'Actortype id',
    },
    measuretype_id: {
      id: 'app.containers.App.attributes.measuretype_id',
      defaultMessage: 'Actortype id',
    },
    resourcetype_id: {
      id: 'app.containers.App.attributes.resourcetype_id',
      defaultMessage: 'Resource type',
    },
    is_archive: {
      id: 'app.containers.App.attributes.is_archive',
      defaultMessage: 'Archived?',
    },
    private: {
      id: 'app.containers.App.attributes.private',
      defaultMessage: 'Confidentiality',
    },
    notifications: {
      id: 'app.containers.App.attributes.notifications',
      defaultMessage: 'Email notifications',
    },
    draft: {
      id: 'app.containers.App.attributes.draft',
      defaultMessage: 'Authoring status',
    },
    code: {
      id: 'app.containers.App.attributes.code',
      defaultMessage: 'Code',
    },
    prefix: {
      id: 'app.containers.App.attributes.prefix',
      defaultMessage: 'Prefix',
    },
    address: {
      id: 'app.containers.App.attributes.address',
      defaultMessage: 'Address',
    },
    phone: {
      id: 'app.containers.App.attributes.phone',
      defaultMessage: 'Phone/WhatsApp',
    },
    title: {
      id: 'app.containers.App.attributes.title',
      defaultMessage: 'Title',
    },
    description: {
      id: 'app.containers.App.attributes.description',
      defaultMessage: 'Description',
    },
    comment: {
      id: 'app.containers.App.attributes.comment',
      defaultMessage: 'Comment',
    },
    content: {
      id: 'app.containers.App.attributes.content',
      defaultMessage: 'Comment',
    },
    url: {
      id: 'app.containers.App.attributes.url',
      defaultMessage: 'Website',
    },
    date: {
      id: 'app.containers.App.attributes.date',
      defaultMessage: 'Date',
    },
    date_start: {
      id: 'app.containers.App.attributes.date_start',
      defaultMessage: 'Date',
    },
    date_start_empty: {
      id: 'app.containers.App.attributes.date_start_empty',
      defaultMessage: 'No start date set',
    },
    date_end: {
      id: 'app.containers.App.attributes.date_end',
      defaultMessage: 'Date',
    },
    date_end_empty: {
      id: 'app.containers.App.attributes.date_end_empty',
      defaultMessage: 'No end date set',
    },
    date_comment: {
      id: 'app.containers.App.attributes.date_comment',
      defaultMessage: 'Date comment',
    },
    target_comment: {
      id: 'app.containers.App.attributes.target_comment',
      defaultMessage: 'Target comment',
    },
    status_comment: {
      id: 'app.containers.App.attributes.status_comment',
      defaultMessage: 'Status comment',
    },
    reference: {
      id: 'app.containers.App.attributes.reference',
      defaultMessage: 'reference',
    },
    reference_ml: {
      id: 'app.containers.App.attributes.reference_ml',
      defaultMessage: 'reference_ml',
    },
    status_lbs_protocol: {
      id: 'app.containers.App.attributes.status_lbs_protocol',
      defaultMessage: 'status_lbs_protocol',
    },
    reference_landbased_ml: {
      id: 'app.containers.App.attributes.reference_landbased_ml',
      defaultMessage: 'reference_landbased_ml',
    },
    has_reference_landbased_ml: {
      id: 'app.containers.App.attributes.has_reference_landbased_ml',
      defaultMessage: 'has_reference_landbased_ml',
    },
    amount: {
      id: 'app.containers.App.attributes.amount',
      defaultMessage: 'amount',
    },
    amount_empty: {
      id: 'app.containers.App.attributes.amount_empty',
      defaultMessage: 'amount',
    },
    amount_comment: {
      id: 'app.containers.App.attributes.amount_comment',
      defaultMessage: 'amount_comment',
    },
    activity_summary: {
      id: 'app.containers.App.attributes.activity_summary',
      defaultMessage: 'activity_summary',
    },
    gdp: {
      id: 'app.containers.App.attributes.gdp',
      defaultMessage: 'gdp',
    },
    population: {
      id: 'app.containers.App.attributes.population',
      defaultMessage: 'population',
    },
    name: {
      id: 'app.containers.App.attributes.name',
      defaultMessage: 'User name',
    },
    email: {
      id: 'app.containers.App.attributes.email',
      defaultMessage: 'Email address',
    },
    menu_title: {
      id: 'app.containers.App.attributes.menu_title',
      defaultMessage: 'Menu title',
    },
    short_title: {
      id: 'app.containers.App.attributes.short_title',
      defaultMessage: 'Short title',
    },
    order: {
      id: 'app.containers.App.attributes.order',
      defaultMessage: 'Order',
    },
    user_only: {
      id: 'app.containers.App.attributes.user_only',
      defaultMessage: 'Users only',
    },
    parent_id: {
      id: 'app.containers.App.attributes.parent_id',
      defaultMessage: 'Predecessor',
    },
    manager_id: {
      categories: {
        id: 'app.containers.App.attributes.manager_id.categories',
        defaultMessage: 'Category manager',
      },
      categoriesEmpty: {
        id: 'app.containers.App.attributes.manager_id.categoriesEmpty',
        defaultMessage: 'No category manager assigned',
      },
    },
    metaTitle: {
      id: 'app.containers.App.attributes.metaTitle',
      defaultMessage: 'Meta',
    },
    updated_by_id: {
      id: 'app.containers.App.attributes.updated_by_id',
      defaultMessage: 'Updated by',
    },
    updated_at: {
      id: 'app.containers.App.attributes.updated_at',
      defaultMessage: 'Last updated',
    },
    created_by_id: {
      id: 'app.containers.App.attributes.created_by_id',
      defaultMessage: 'Created by',
    },
    created_at: {
      id: 'app.containers.App.attributes.created_at',
      defaultMessage: 'Created',
    },
    created_at_fallback: {
      id: 'app.containers.App.attributes.created_at_fallback',
      defaultMessage: 'Date (derived from "created at")',
    },
    relationship_updated_by_id: {
      id: 'app.containers.App.attributes.relationship_updated_by_id',
      defaultMessage: 'Connections updated by',
    },
    relationship_updated_at: {
      id: 'app.containers.App.attributes.relationship_updated_at',
      defaultMessage: 'Connections last updated at',
    },
    publication_date: {
      id: 'app.containers.App.attributes.publication_date',
      defaultMessage: 'Publication date',
    },
    access_date: {
      id: 'app.containers.App.attributes.access_date',
      defaultMessage: 'Access date',
    },
    status: {
      id: 'app.containers.App.attributes.status',
      defaultMessage: 'Status',
    },
  },
  attributeInfo: {
    draft: {
      id: 'app.containers.App.attributeInfo.draft',
      defaultMessage: 'info-draft',
    },
    draft_true: {
      id: 'app.containers.App.attributeInfo.draft_true',
      defaultMessage: 'info-draft-true',
    },
    draft_false: {
      id: 'app.containers.App.attributeInfo.draft_false',
      defaultMessage: 'info-draft-false',
    },
    private: {
      id: 'app.containers.App.attributeInfo.private',
      defaultMessage: 'private',
    },
    private_true: {
      id: 'app.containers.App.attributeInfo.private_true',
      defaultMessage: 'info-private-true',
    },
    private_false: {
      id: 'app.containers.App.attributeInfo.private_false',
      defaultMessage: 'info-private-false',
    },
    is_archive: {
      id: 'app.containers.App.attributeInfo.is_archive',
      defaultMessage: 'population',
    },
    is_archive_true: {
      id: 'app.containers.App.attributeInfo.is_archive_true',
      defaultMessage: 'info-is_archive-true',
    },
    is_archive_false: {
      id: 'app.containers.App.attributeInfo.is_archive_false',
      defaultMessage: 'info-is_archive-false',
    },
  },
  nav: {
    overview: {
      id: 'app.containers.App.nav.overview',
      defaultMessage: 'Classification',
    },
    overviewSuper: {
      id: 'app.containers.App.nav.overviewSuper',
      defaultMessage: 'Explore',
    },
    taxonomies: {
      id: 'app.containers.App.nav.taxonomies',
      defaultMessage: 'Categories',
    },
    actions: {
      id: 'app.containers.App.nav.actions',
      defaultMessage: 'Actions',
    },
    actionsMembers: {
      id: 'app.containers.App.nav.actionsMembers',
      defaultMessage: 'Activities as member',
    },
    topActions: {
      id: 'app.containers.App.nav.topActions',
      defaultMessage: 'Activities',
    },
    subActions: {
      id: 'app.containers.App.nav.subActions',
      defaultMessage: 'Sub-activities',
    },
    actors: {
      id: 'app.containers.App.nav.actors',
      defaultMessage: 'Actors',
    },
    resources: {
      id: 'app.containers.App.nav.resources',
      defaultMessage: 'Resources',
    },
    indicators: {
      id: 'app.containers.App.nav.indicators',
      defaultMessage: 'Position indicators',
    },
    members: {
      id: 'app.containers.App.nav.members',
      defaultMessage: 'Members',
    },
    parent: {
      id: 'app.containers.App.nav.parent',
      defaultMessage: 'Parent',
    },
    parents: {
      id: 'app.containers.App.nav.parents',
      defaultMessage: 'Activities',
    },
    children: {
      id: 'app.containers.App.nav.children',
      defaultMessage: 'Sub-activities',
    },
    attributes: {
      id: 'app.containers.App.nav.attributes',
      defaultMessage: 'Attributes',
    },
    associations: {
      id: 'app.containers.App.nav.associations',
      defaultMessage: 'Associations',
    },
    pages: {
      id: 'app.containers.App.nav.pages',
      defaultMessage: 'Page admin',
    },
    users: {
      id: 'app.containers.App.nav.users',
      defaultMessage: 'User admin',
    },
    userActions: {
      id: 'app.containers.App.nav.userActions',
      defaultMessage: 'Assigned users',
    },
    userActors: {
      id: 'app.containers.App.nav.userActors',
      defaultMessage: 'Assigned users',
    },
    actionUsers: {
      id: 'app.containers.App.nav.actionUsers',
      defaultMessage: 'Actions assigned to',
    },
    actorUsers: {
      id: 'app.containers.App.nav.actorUsers',
      defaultMessage: 'Actors assigned to',
    },
    roles: {
      id: 'app.containers.App.nav.roles',
      defaultMessage: 'Roles',
    },
    bookmarks: {
      id: 'app.containers.App.nav.bookmarks',
      defaultMessage: 'Bookmarks',
    },
    search: {
      id: 'app.containers.App.nav.search',
      defaultMessage: 'Search',
    },
    login: {
      id: 'app.containers.App.nav.login',
      defaultMessage: 'Sign in',
    },
    logout: {
      id: 'app.containers.App.nav.logout',
      defaultMessage: 'Sign out',
    },
    register: {
      id: 'app.containers.App.nav.register',
      defaultMessage: 'Register',
    },
    positions: {
      id: 'app.containers.App.nav.positions',
      defaultMessage: 'Positions',
    },
    outreach: {
      id: 'app.containers.App.nav.outreach',
      defaultMessage: 'Outreach',
    },
    mystuff: {
      id: 'app.containers.App.nav.mystuff',
      defaultMessage: 'My stuff',
    },
  },
  entities: {
    showAll: {
      id: 'app.containers.App.entities.showAll',
      defaultMessage: 'Show all',
    },
    showLess: {
      id: 'app.containers.App.entities.showLess',
      defaultMessage: 'Show less',
    },
    connected: {
      id: 'app.containers.App.entities.connected',
      defaultMessage: '(inferred)',
    },
    actors: {
      single: {
        id: 'app.containers.App.entities.actors.single',
        defaultMessage: 'Actor',
      },
      plural: {
        id: 'app.containers.App.entities.actors.plural',
        defaultMessage: 'Actors',
      },
      singleLong: {
        id: 'app.containers.App.entities.actors.singleLong',
        defaultMessage: 'Actor',
      },
      pluralLong: {
        id: 'app.containers.App.entities.actors.pluralLong',
        defaultMessage: 'Actors',
      },
      singleShort: {
        id: 'app.containers.App.entities.actors.singleShort',
        defaultMessage: 'Actor',
      },
      pluralShort: {
        id: 'app.containers.App.entities.actors.pluralShort',
        defaultMessage: 'Actors',
      },
      empty: {
        id: 'app.containers.App.entities.actors.empty',
        defaultMessage: 'No actors yet',
      },
    },
    actors_1: {
      single: {
        id: 'app.containers.App.entities.actors_1.single',
        defaultMessage: 'Actor',
      },
      plural: {
        id: 'app.containers.App.entities.actors_1.plural',
        defaultMessage: 'Actors',
      },
      singleLong: {
        id: 'app.containers.App.entities.actors_1.singleLong',
        defaultMessage: 'Actor',
      },
      pluralLong: {
        id: 'app.containers.App.entities.actors_1.pluralLong',
        defaultMessage: 'Actors',
      },
      singleShort: {
        id: 'app.containers.App.entities.actors_1.singleShort',
        defaultMessage: 'Actor',
      },
      pluralShort: {
        id: 'app.containers.App.entities.actors_1.pluralShort',
        defaultMessage: 'Actors',
      },
      empty: {
        id: 'app.containers.App.entities.actors_1.empty',
        defaultMessage: 'No actors yet',
      },
    },
    actors_2: {
      single: {
        id: 'app.containers.App.entities.actors_2.single',
        defaultMessage: 'Actor',
      },
      plural: {
        id: 'app.containers.App.entities.actors_2.plural',
        defaultMessage: 'Actors',
      },
      singleLong: {
        id: 'app.containers.App.entities.actors_2.singleLong',
        defaultMessage: 'Actor',
      },
      pluralLong: {
        id: 'app.containers.App.entities.actors_2.pluralLong',
        defaultMessage: 'Actors',
      },
      singleShort: {
        id: 'app.containers.App.entities.actors_2.singleShort',
        defaultMessage: 'Actor',
      },
      pluralShort: {
        id: 'app.containers.App.entities.actors_2.pluralShort',
        defaultMessage: 'Actors',
      },
      empty: {
        id: 'app.containers.App.entities.actors_2.empty',
        defaultMessage: 'No actors yet',
      },
    },
    actors_3: {
      single: {
        id: 'app.containers.App.entities.actors_3.single',
        defaultMessage: 'Actor',
      },
      plural: {
        id: 'app.containers.App.entities.actors_3.plural',
        defaultMessage: 'Actors',
      },
      singleLong: {
        id: 'app.containers.App.entities.actors_3.singleLong',
        defaultMessage: 'Actor',
      },
      pluralLong: {
        id: 'app.containers.App.entities.actors_3.pluralLong',
        defaultMessage: 'Actors',
      },
      singleShort: {
        id: 'app.containers.App.entities.actors_3.singleShort',
        defaultMessage: 'Actor',
      },
      pluralShort: {
        id: 'app.containers.App.entities.actors_3.pluralShort',
        defaultMessage: 'Actors',
      },
      empty: {
        id: 'app.containers.App.entities.actors_3.empty',
        defaultMessage: 'No actors yet',
      },
    },
    actors_4: {
      single: {
        id: 'app.containers.App.entities.actors_4.single',
        defaultMessage: 'Actor',
      },
      plural: {
        id: 'app.containers.App.entities.actors_4.plural',
        defaultMessage: 'Actors',
      },
      singleLong: {
        id: 'app.containers.App.entities.actors_4.singleLong',
        defaultMessage: 'Actor',
      },
      pluralLong: {
        id: 'app.containers.App.entities.actors_4.pluralLong',
        defaultMessage: 'Actors',
      },
      singleShort: {
        id: 'app.containers.App.entities.actors_4.singleShort',
        defaultMessage: 'Actor',
      },
      pluralShort: {
        id: 'app.containers.App.entities.actors_4.pluralShort',
        defaultMessage: 'Actors',
      },
      empty: {
        id: 'app.containers.App.entities.actors_4.empty',
        defaultMessage: 'No actors yet',
      },
    },
    actors_5: {
      single: {
        id: 'app.containers.App.entities.actors_5.single',
        defaultMessage: 'Actor',
      },
      plural: {
        id: 'app.containers.App.entities.actors_5.plural',
        defaultMessage: 'Actors',
      },
      singleLong: {
        id: 'app.containers.App.entities.actors_5.singleLong',
        defaultMessage: 'Actor',
      },
      pluralLong: {
        id: 'app.containers.App.entities.actors_5.pluralLong',
        defaultMessage: 'Actors',
      },
      singleShort: {
        id: 'app.containers.App.entities.actors_5.singleShort',
        defaultMessage: 'Actor',
      },
      pluralShort: {
        id: 'app.containers.App.entities.actors_5.pluralShort',
        defaultMessage: 'Actors',
      },
      empty: {
        id: 'app.containers.App.entities.actors_5.empty',
        defaultMessage: 'No actors yet',
      },
    },
    actions: {
      parent: {
        id: 'app.containers.App.entities.actions.parent',
        defaultMessage: 'Parent activity',
      },
      children: {
        id: 'app.containers.App.entities.actions.children',
        defaultMessage: 'Sub-activities',
      },
      topActions: {
        id: 'app.containers.App.entities.actions.topActions',
        defaultMessage: 'Activities',
      },
      subActions: {
        id: 'app.containers.App.entities.actions.subActions',
        defaultMessage: 'Sub-activities',
      },
      single: {
        id: 'app.containers.App.entities.actions.single',
        defaultMessage: 'Action',
      },
      plural: {
        id: 'app.containers.App.entities.actions.plural',
        defaultMessage: 'Actions',
      },
      singleLong: {
        id: 'app.containers.App.entities.actions.singleLong',
        defaultMessage: 'Government action',
      },
      pluralLong: {
        id: 'app.containers.App.entities.actions.pluralLong',
        defaultMessage: 'Government actions',
      },
      singleShort: {
        id: 'app.containers.App.entities.actions.singleShort',
        defaultMessage: 'Action',
      },
      pluralShort: {
        id: 'app.containers.App.entities.actions.pluralShort',
        defaultMessage: 'Actions',
      },
      empty: {
        id: 'app.containers.App.entities.actions.empty',
        defaultMessage: 'No actions yet',
      },
    },
    actions_1: {
      single: {
        id: 'app.containers.App.entities.actions_1.single',
        defaultMessage: 'Actor',
      },
      plural: {
        id: 'app.containers.App.entities.actions_1.plural',
        defaultMessage: 'Actors',
      },
      singleLong: {
        id: 'app.containers.App.entities.actions_1.singleLong',
        defaultMessage: 'Actor',
      },
      pluralLong: {
        id: 'app.containers.App.entities.actions_1.pluralLong',
        defaultMessage: 'Actors',
      },
      singleShort: {
        id: 'app.containers.App.entities.actions_1.singleShort',
        defaultMessage: 'Actor',
      },
      pluralShort: {
        id: 'app.containers.App.entities.actions_1.pluralShort',
        defaultMessage: 'Actors',
      },
      empty: {
        id: 'app.containers.App.entities.actions_1.empty',
        defaultMessage: 'No actors yet',
      },
    },
    actions_2: {
      single: {
        id: 'app.containers.App.entities.actions_2.single',
        defaultMessage: 'Actor',
      },
      plural: {
        id: 'app.containers.App.entities.actions_2.plural',
        defaultMessage: 'Actors',
      },
      singleLong: {
        id: 'app.containers.App.entities.actions_2.singleLong',
        defaultMessage: 'Actor',
      },
      pluralLong: {
        id: 'app.containers.App.entities.actions_2.pluralLong',
        defaultMessage: 'Actors',
      },
      singleShort: {
        id: 'app.containers.App.entities.actions_2.singleShort',
        defaultMessage: 'Actor',
      },
      pluralShort: {
        id: 'app.containers.App.entities.actions_2.pluralShort',
        defaultMessage: 'Actors',
      },
      empty: {
        id: 'app.containers.App.entities.actions_2.empty',
        defaultMessage: 'No actors yet',
      },
    },
    actions_3: {
      single: {
        id: 'app.containers.App.entities.actions_3.single',
        defaultMessage: 'Actor',
      },
      plural: {
        id: 'app.containers.App.entities.actions_3.plural',
        defaultMessage: 'Actors',
      },
      singleLong: {
        id: 'app.containers.App.entities.actions_3.singleLong',
        defaultMessage: 'Actor',
      },
      pluralLong: {
        id: 'app.containers.App.entities.actions_3.pluralLong',
        defaultMessage: 'Actors',
      },
      singleShort: {
        id: 'app.containers.App.entities.actions_3.singleShort',
        defaultMessage: 'Actor',
      },
      pluralShort: {
        id: 'app.containers.App.entities.actions_3.pluralShort',
        defaultMessage: 'Actors',
      },
      empty: {
        id: 'app.containers.App.entities.actions_3.empty',
        defaultMessage: 'No actors yet',
      },
    },
    actions_4: {
      single: {
        id: 'app.containers.App.entities.actions_4.single',
        defaultMessage: 'Actor',
      },
      plural: {
        id: 'app.containers.App.entities.actions_4.plural',
        defaultMessage: 'Actors',
      },
      singleLong: {
        id: 'app.containers.App.entities.actions_4.singleLong',
        defaultMessage: 'Actor',
      },
      pluralLong: {
        id: 'app.containers.App.entities.actions_4.pluralLong',
        defaultMessage: 'Actors',
      },
      singleShort: {
        id: 'app.containers.App.entities.actions_4.singleShort',
        defaultMessage: 'Actor',
      },
      pluralShort: {
        id: 'app.containers.App.entities.actions_4.pluralShort',
        defaultMessage: 'Actors',
      },
      empty: {
        id: 'app.containers.App.entities.actions_4.empty',
        defaultMessage: 'No actors yet',
      },
    },
    actions_5: {
      single: {
        id: 'app.containers.App.entities.actions_5.single',
        defaultMessage: 'Actor',
      },
      plural: {
        id: 'app.containers.App.entities.actions_5.plural',
        defaultMessage: 'Actors',
      },
      singleLong: {
        id: 'app.containers.App.entities.actions_5.singleLong',
        defaultMessage: 'Actor',
      },
      pluralLong: {
        id: 'app.containers.App.entities.actions_5.pluralLong',
        defaultMessage: 'Actors',
      },
      singleShort: {
        id: 'app.containers.App.entities.actions_5.singleShort',
        defaultMessage: 'Actor',
      },
      pluralShort: {
        id: 'app.containers.App.entities.actions_5.pluralShort',
        defaultMessage: 'Actors',
      },
      empty: {
        id: 'app.containers.App.entities.actions_5.empty',
        defaultMessage: 'No actors yet',
      },
    },
    actions_6: {
      single: {
        id: 'app.containers.App.entities.actions_6.single',
        defaultMessage: 'Actor',
      },
      plural: {
        id: 'app.containers.App.entities.actions_6.plural',
        defaultMessage: 'Actors',
      },
      singleLong: {
        id: 'app.containers.App.entities.actions_6.singleLong',
        defaultMessage: 'Actor',
      },
      pluralLong: {
        id: 'app.containers.App.entities.actions_6.pluralLong',
        defaultMessage: 'Actors',
      },
      singleShort: {
        id: 'app.containers.App.entities.actions_6.singleShort',
        defaultMessage: 'Actor',
      },
      pluralShort: {
        id: 'app.containers.App.entities.actions_6.pluralShort',
        defaultMessage: 'Actors',
      },
      empty: {
        id: 'app.containers.App.entities.actions_6.empty',
        defaultMessage: 'No actors yet',
      },
    },
    actions_7: {
      single: {
        id: 'app.containers.App.entities.actions_7.single',
        defaultMessage: 'Actor',
      },
      plural: {
        id: 'app.containers.App.entities.actions_7.plural',
        defaultMessage: 'Actors',
      },
      singleLong: {
        id: 'app.containers.App.entities.actions_7.singleLong',
        defaultMessage: 'Actor',
      },
      pluralLong: {
        id: 'app.containers.App.entities.actions_7.pluralLong',
        defaultMessage: 'Actors',
      },
      singleShort: {
        id: 'app.containers.App.entities.actions_7.singleShort',
        defaultMessage: 'Actor',
      },
      pluralShort: {
        id: 'app.containers.App.entities.actions_7.pluralShort',
        defaultMessage: 'Actors',
      },
      empty: {
        id: 'app.containers.App.entities.actions_7.empty',
        defaultMessage: 'No actors yet',
      },
    },
    resources: {
      single: {
        id: 'app.containers.App.entities.resources.single',
        defaultMessage: 'resource',
      },
      plural: {
        id: 'app.containers.App.entities.resources.plural',
        defaultMessage: 'resources',
      },
      singleLong: {
        id: 'app.containers.App.entities.resources.singleLong',
        defaultMessage: 'resource',
      },
      pluralLong: {
        id: 'app.containers.App.entities.resources.pluralLong',
        defaultMessage: 'resources',
      },
      singleShort: {
        id: 'app.containers.App.entities.resources.singleShort',
        defaultMessage: 'resource',
      },
      pluralShort: {
        id: 'app.containers.App.entities.resources.pluralShort',
        defaultMessage: 'resources',
      },
      empty: {
        id: 'app.containers.App.entities.resources.empty',
        defaultMessage: 'No resources yet',
      },
    },
    resources_1: {
      single: {
        id: 'app.containers.App.entities.resources_1.single',
        defaultMessage: 'resource',
      },
      plural: {
        id: 'app.containers.App.entities.resources_1.plural',
        defaultMessage: 'resources',
      },
      singleLong: {
        id: 'app.containers.App.entities.resources_1.singleLong',
        defaultMessage: 'resource',
      },
      pluralLong: {
        id: 'app.containers.App.entities.resources_1.pluralLong',
        defaultMessage: 'resources',
      },
      singleShort: {
        id: 'app.containers.App.entities.resources_1.singleShort',
        defaultMessage: 'resource',
      },
      pluralShort: {
        id: 'app.containers.App.entities.resources_1.pluralShort',
        defaultMessage: 'resources',
      },
      empty: {
        id: 'app.containers.App.entities.resources_1.empty',
        defaultMessage: 'No resources yet',
      },
    },
    resources_2: {
      single: {
        id: 'app.containers.App.entities.resources_2.single',
        defaultMessage: 'resource',
      },
      plural: {
        id: 'app.containers.App.entities.resources_2.plural',
        defaultMessage: 'resources',
      },
      singleLong: {
        id: 'app.containers.App.entities.resources_2.singleLong',
        defaultMessage: 'resource',
      },
      pluralLong: {
        id: 'app.containers.App.entities.resources_2.pluralLong',
        defaultMessage: 'resources',
      },
      singleShort: {
        id: 'app.containers.App.entities.resources_2.singleShort',
        defaultMessage: 'resource',
      },
      pluralShort: {
        id: 'app.containers.App.entities.resources_2.pluralShort',
        defaultMessage: 'resources',
      },
      empty: {
        id: 'app.containers.App.entities.resources_2.empty',
        defaultMessage: 'No resources yet',
      },
    },
    resources_3: {
      single: {
        id: 'app.containers.App.entities.resources_3.single',
        defaultMessage: 'resource',
      },
      plural: {
        id: 'app.containers.App.entities.resources_3.plural',
        defaultMessage: 'resources',
      },
      singleLong: {
        id: 'app.containers.App.entities.resources_3.singleLong',
        defaultMessage: 'resource',
      },
      pluralLong: {
        id: 'app.containers.App.entities.resources_3.pluralLong',
        defaultMessage: 'resources',
      },
      singleShort: {
        id: 'app.containers.App.entities.resources_3.singleShort',
        defaultMessage: 'resource',
      },
      pluralShort: {
        id: 'app.containers.App.entities.resources_3.pluralShort',
        defaultMessage: 'resources',
      },
      empty: {
        id: 'app.containers.App.entities.resources_3.empty',
        defaultMessage: 'No resources yet',
      },
    },
    resources_4: {
      single: {
        id: 'app.containers.App.entities.resources_4.single',
        defaultMessage: 'resource',
      },
      plural: {
        id: 'app.containers.App.entities.resources_4.plural',
        defaultMessage: 'resources',
      },
      singleLong: {
        id: 'app.containers.App.entities.resources_4.singleLong',
        defaultMessage: 'resource',
      },
      pluralLong: {
        id: 'app.containers.App.entities.resources_4.pluralLong',
        defaultMessage: 'resources',
      },
      singleShort: {
        id: 'app.containers.App.entities.resources_4.singleShort',
        defaultMessage: 'resource',
      },
      pluralShort: {
        id: 'app.containers.App.entities.resources_4.pluralShort',
        defaultMessage: 'resources',
      },
      empty: {
        id: 'app.containers.App.entities.resources_4.empty',
        defaultMessage: 'No resources yet',
      },
    },
    resources_5: {
      single: {
        id: 'app.containers.App.entities.resources_5.single',
        defaultMessage: 'resource',
      },
      plural: {
        id: 'app.containers.App.entities.resources_5.plural',
        defaultMessage: 'resources',
      },
      singleLong: {
        id: 'app.containers.App.entities.resources_5.singleLong',
        defaultMessage: 'resource',
      },
      pluralLong: {
        id: 'app.containers.App.entities.resources_5.pluralLong',
        defaultMessage: 'resources',
      },
      singleShort: {
        id: 'app.containers.App.entities.resources_5.singleShort',
        defaultMessage: 'resource',
      },
      pluralShort: {
        id: 'app.containers.App.entities.resources_5.pluralShort',
        defaultMessage: 'resources',
      },
      empty: {
        id: 'app.containers.App.entities.resources_5.empty',
        defaultMessage: 'No resources yet',
      },
    },
    indicators: {
      single: {
        id: 'app.containers.App.entities.indicators.single',
        defaultMessage: 'Actor',
      },
      plural: {
        id: 'app.containers.App.entities.indicators.plural',
        defaultMessage: 'Actors',
      },
      singleLong: {
        id: 'app.containers.App.entities.indicators.singleLong',
        defaultMessage: 'Actor',
      },
      pluralLong: {
        id: 'app.containers.App.entities.indicators.pluralLong',
        defaultMessage: 'Actors',
      },
      singleShort: {
        id: 'app.containers.App.entities.indicators.singleShort',
        defaultMessage: 'Actor',
      },
      pluralShort: {
        id: 'app.containers.App.entities.indicators.pluralShort',
        defaultMessage: 'Actors',
      },
      empty: {
        id: 'app.containers.App.entities.indicators.empty',
        defaultMessage: 'No actors yet',
      },
    },
    pages: {
      single: {
        id: 'app.containers.App.entities.pages.single',
        defaultMessage: 'Page',
      },
      plural: {
        id: 'app.containers.App.entities.pages.plural',
        defaultMessage: 'Pages',
      },
    },
    users: {
      single: {
        id: 'app.containers.App.entities.users.single',
        defaultMessage: 'User',
      },
      plural: {
        id: 'app.containers.App.entities.users.plural',
        defaultMessage: 'Users',
      },
      empty: {
        id: 'app.containers.App.entities.users.empty',
        defaultMessage: 'No WWF staff assigned yet',
      },
    },
    bookmarks: {
      single: {
        id: 'app.containers.App.entities.bookmarks.single',
        defaultMessage: 'Bookmark',
      },
      plural: {
        id: 'app.containers.App.entities.bookmarks.plural',
        defaultMessage: 'Bookmarks',
      },
    },
    connections: {
      single: {
        id: 'app.containers.App.entities.connections.single',
        defaultMessage: 'Connection',
      },
      plural: {
        id: 'app.containers.App.entities.connections.plural',
        defaultMessage: 'Connections',
      },
    },
    taxonomies: {
      single: {
        id: 'app.containers.App.entities.taxonomies.single',
        defaultMessage: 'Category',
      },
      plural: {
        id: 'app.containers.App.entities.taxonomies.plural',
        defaultMessage: 'Categories',
      },
      parent: {
        id: 'app.containers.App.entities.taxonomies.parent',
        defaultMessage: 'Parent category',
      },
      children: {
        id: 'app.containers.App.entities.taxonomies.children',
        defaultMessage: 'Child categories',
      },
      1: {
        single: {
          id: 'app.containers.App.entities.taxonomies.1.single',
          defaultMessage: 'Human rights body',
        },
        plural: {
          id: 'app.containers.App.entities.taxonomies.1.plural',
          defaultMessage: 'Human rights bodies',
        },
        empty: {
          id: 'app.containers.App.entities.taxonomies.1.empty',
          defaultMessage: 'No human rights body assigned yet',
        },
        shortSingle: {
          id: 'app.containers.App.entities.taxonomies.1.shortSingle',
          defaultMessage: 'HR body',
        },
        shortPlural: {
          id: 'app.containers.App.entities.taxonomies.1.shortPlural',
          defaultMessage: 'HR bodies',
        },
        description: {
          id: 'app.containers.App.entities.taxonomies.1.description',
          defaultMessage: 'About human rights bodies',
        },
      },
      2: {
        single: {
          id: 'app.containers.App.entities.taxonomies.2.single',
          defaultMessage: 'Cycle',
        },
        plural: {
          id: 'app.containers.App.entities.taxonomies.2.plural',
          defaultMessage: 'Cycles',
        },
        empty: {
          id: 'app.containers.App.entities.taxonomies.2.empty',
          defaultMessage: 'No cycle assigned yet',
        },
        shortSingle: {
          id: 'app.containers.App.entities.taxonomies.2.shortSingle',
          defaultMessage: 'Cycle',
        },
        shortPlural: {
          id: 'app.containers.App.entities.taxonomies.2.shortPlural',
          defaultMessage: 'Cycles',
        },
        description: {
          id: 'app.containers.App.entities.taxonomies.2.description',
          defaultMessage: 'About cycles',
        },
      },
      3: {
        single: {
          id: 'app.containers.App.entities.taxonomies.3.single',
          defaultMessage: 'Human rights issue',
        },
        plural: {
          id: 'app.containers.App.entities.taxonomies.3.plural',
          defaultMessage: 'Human rights issues',
        },
        empty: {
          id: 'app.containers.App.entities.taxonomies.3.empty',
          defaultMessage: 'No human rights issue assigned yet',
        },
        shortSingle: {
          id: 'app.containers.App.entities.taxonomies.3.shortSingle',
          defaultMessage: 'HR issue',
        },
        shortPlural: {
          id: 'app.containers.App.entities.taxonomies.3.shortPlural',
          defaultMessage: 'HR issues',
        },
        description: {
          id: 'app.containers.App.entities.taxonomies.3.description',
          defaultMessage: 'About human rights issues',
        },
      },
      4: {
        single: {
          id: 'app.containers.App.entities.taxonomies.4.single',
          defaultMessage: 'Affected persons',
        },
        plural: {
          id: 'app.containers.App.entities.taxonomies.4.plural',
          defaultMessage: 'Affected persons',
        },
        empty: {
          id: 'app.containers.App.entities.taxonomies.4.empty',
          defaultMessage: 'No affected persons assigned yet',
        },
        shortSingle: {
          id: 'app.containers.App.entities.taxonomies.4.shortSingle',
          defaultMessage: 'Persons',
        },
        shortPlural: {
          id: 'app.containers.App.entities.taxonomies.4.shortPlural',
          defaultMessage: 'Persons',
        },
        description: {
          id: 'app.containers.App.entities.taxonomies.4.description',
          defaultMessage: 'About affected persons',
        },
      },
      5: {
        single: {
          id: 'app.containers.App.entities.taxonomies.5.single',
          defaultMessage: 'Thematic cluster',
        },
        plural: {
          id: 'app.containers.App.entities.taxonomies.5.plural',
          defaultMessage: 'Thematic clusters',
        },
        empty: {
          id: 'app.containers.App.entities.taxonomies.5.empty',
          defaultMessage: 'No thematic cluster assigned yet',
        },
        shortSingle: {
          id: 'app.containers.App.entities.taxonomies.5.shortSingle',
          defaultMessage: 'Cluster',
        },
        shortPlural: {
          id: 'app.containers.App.entities.taxonomies.5.shortPlural',
          defaultMessage: 'Clusters',
        },
        description: {
          id: 'app.containers.App.entities.taxonomies.5.description',
          defaultMessage: 'About thematic clusters',
        },
      },
      6: {
        single: {
          id: 'app.containers.App.entities.taxonomies.6.single',
          defaultMessage: 'Organisation',
        },
        plural: {
          id: 'app.containers.App.entities.taxonomies.6.plural',
          defaultMessage: 'Organisations',
        },
        empty: {
          id: 'app.containers.App.entities.taxonomies.6.empty',
          defaultMessage: 'No organisation assigned yet',
        },
        shortSingle: {
          id: 'app.containers.App.entities.taxonomies.6.shortSingle',
          defaultMessage: 'Organisation',
        },
        shortPlural: {
          id: 'app.containers.App.entities.taxonomies.6.shortPlural',
          defaultMessage: 'Organisations',
        },
        description: {
          id: 'app.containers.App.entities.taxonomies.6.description',
          defaultMessage: 'About organisations',
        },
      },
      7: {
        single: {
          id: 'app.containers.App.entities.taxonomies.7.single',
          defaultMessage: 'Sustainable Development Goals',
        },
        plural: {
          id: 'app.containers.App.entities.taxonomies.7.plural',
          defaultMessage: 'Sustainable Development Goals',
        },
        empty: {
          id: 'app.containers.App.entities.taxonomies.7.empty',
          defaultMessage: 'No SDG assigned yet',
        },
        shortSingle: {
          id: 'app.containers.App.entities.taxonomies.7.shortSingle',
          defaultMessage: 'SDG',
        },
        shortPlural: {
          id: 'app.containers.App.entities.taxonomies.7.shortPlural',
          defaultMessage: 'SDGs',
        },
        description: {
          id: 'app.containers.App.entities.taxonomies.7.description',
          defaultMessage: 'About Sustainable Development Goals',
        },
      },
      8: {
        single: {
          id: 'app.containers.App.entities.taxonomies.8.single',
          defaultMessage: 'Taxonomy 8',
        },
        plural: {
          id: 'app.containers.App.entities.taxonomies.8.plural',
          defaultMessage: 'Taxonomy 8s',
        },
        empty: {
          id: 'app.containers.App.entities.taxonomies.8.empty',
          defaultMessage: 'No Taxonomy 8 assigned yet',
        },
        shortSingle: {
          id: 'app.containers.App.entities.taxonomies.8.shortSingle',
          defaultMessage: 'Taxonomy 8',
        },
        shortPlural: {
          id: 'app.containers.App.entities.taxonomies.8.shortPlural',
          defaultMessage: 'Taxonomy 8s',
        },
        description: {
          id: 'app.containers.App.entities.taxonomies.8.description',
          defaultMessage: 'About tax 8',
        },
      },
      9: {
        single: {
          id: 'app.containers.App.entities.taxonomies.9.single',
          defaultMessage: 'Taxonomy 9',
        },
        plural: {
          id: 'app.containers.App.entities.taxonomies.9.plural',
          defaultMessage: 'Taxonomy 9s',
        },
        empty: {
          id: 'app.containers.App.entities.taxonomies.9.empty',
          defaultMessage: 'No Taxonomy 9 assigned yet',
        },
        shortSingle: {
          id: 'app.containers.App.entities.taxonomies.9.shortSingle',
          defaultMessage: 'Taxonomy 9',
        },
        shortPlural: {
          id: 'app.containers.App.entities.taxonomies.9.shortPlural',
          defaultMessage: 'Taxonomy 9s',
        },
        description: {
          id: 'app.containers.App.entities.taxonomies.9.description',
          defaultMessage: 'About tax 9',
        },
      },
      10: {
        single: {
          id: 'app.containers.App.entities.taxonomies.10.single',
          defaultMessage: 'Taxonomy 10',
        },
        plural: {
          id: 'app.containers.App.entities.taxonomies.10.plural',
          defaultMessage: 'Taxonomy 10s',
        },
        empty: {
          id: 'app.containers.App.entities.taxonomies.10.empty',
          defaultMessage: 'No Taxonomy 10 assigned yet',
        },
        shortSingle: {
          id: 'app.containers.App.entities.taxonomies.10.shortSingle',
          defaultMessage: 'Taxonomy 10',
        },
        shortPlural: {
          id: 'app.containers.App.entities.taxonomies.10.shortPlural',
          defaultMessage: 'Taxonomy 10s',
        },
        description: {
          id: 'app.containers.App.entities.taxonomies.10.description',
          defaultMessage: 'About tax 10',
        },
      },
      11: {
        single: {
          id: 'app.containers.App.entities.taxonomies.11.single',
          defaultMessage: 'Taxonomy 10',
        },
        plural: {
          id: 'app.containers.App.entities.taxonomies.11.plural',
          defaultMessage: 'Taxonomy 10s',
        },
        empty: {
          id: 'app.containers.App.entities.taxonomies.11.empty',
          defaultMessage: 'No Taxonomy 10 assigned yet',
        },
        shortSingle: {
          id: 'app.containers.App.entities.taxonomies.11.shortSingle',
          defaultMessage: 'Taxonomy 10',
        },
        shortPlural: {
          id: 'app.containers.App.entities.taxonomies.11.shortPlural',
          defaultMessage: 'Taxonomy 10s',
        },
        description: {
          id: 'app.containers.App.entities.taxonomies.11.description',
          defaultMessage: 'About tax 10',
        },
      },
      12: {
        single: {
          id: 'app.containers.App.entities.taxonomies.12.single',
          defaultMessage: 'Taxonomy 12',
        },
        plural: {
          id: 'app.containers.App.entities.taxonomies.12.plural',
          defaultMessage: 'Taxonomy 12s',
        },
        empty: {
          id: 'app.containers.App.entities.taxonomies.12.empty',
          defaultMessage: 'No Taxonomy 12 assigned yet',
        },
        shortSingle: {
          id: 'app.containers.App.entities.taxonomies.12.shortSingle',
          defaultMessage: 'Taxonomy 12',
        },
        shortPlural: {
          id: 'app.containers.App.entities.taxonomies.12.shortPlural',
          defaultMessage: 'Taxonomy 12s',
        },
        description: {
          id: 'app.containers.App.entities.taxonomies.12.description',
          defaultMessage: 'About tax 12',
        },
      },
      13: {
        single: {
          id: 'app.containers.App.entities.taxonomies.13.single',
          defaultMessage: 'Taxonomy 13',
        },
        plural: {
          id: 'app.containers.App.entities.taxonomies.13.plural',
          defaultMessage: 'Taxonomy 13',
        },
        empty: {
          id: 'app.containers.App.entities.taxonomies.13.empty',
          defaultMessage: 'No Taxonomy 13 assigned yet',
        },
        shortSingle: {
          id: 'app.containers.App.entities.taxonomies.13.shortSingle',
          defaultMessage: 'Taxonomy 13',
        },
        shortPlural: {
          id: 'app.containers.App.entities.taxonomies.13.shortPlural',
          defaultMessage: 'Taxonomy 13',
        },
        description: {
          id: 'app.containers.App.entities.taxonomies.13.description',
          defaultMessage: 'About tax 13',
        },
      },
      14: {
        single: {
          id: 'app.containers.App.entities.taxonomies.14.single',
          defaultMessage: 'Taxonomy 14',
        },
        plural: {
          id: 'app.containers.App.entities.taxonomies.14.plural',
          defaultMessage: 'Taxonomy 14',
        },
        empty: {
          id: 'app.containers.App.entities.taxonomies.14.empty',
          defaultMessage: 'No Taxonomy 14 assigned yet',
        },
        shortSingle: {
          id: 'app.containers.App.entities.taxonomies.14.shortSingle',
          defaultMessage: 'Taxonomy 14',
        },
        shortPlural: {
          id: 'app.containers.App.entities.taxonomies.14.shortPlural',
          defaultMessage: 'Taxonomy 14',
        },
        description: {
          id: 'app.containers.App.entities.taxonomies.14.description',
          defaultMessage: 'About tax 14',
        },
      },
    },
    categories: {
      single: {
        id: 'app.containers.App.entities.categories.single',
        defaultMessage: 'Category',
      },
      plural: {
        id: 'app.containers.App.entities.categories.plural',
        defaultMessage: 'Categories',
      },
      empty: {
        id: 'app.containers.App.entities.categories.empty',
        defaultMessage: 'No categories yet',
      },
      noParentsAssociated: {
        id: 'app.containers.App.entities.categories.noParentsAssociated',
        defaultMessage: 'No parent categories yet associated',
      },
      noChildrenAssociated: {
        id: 'app.containers.App.entities.categories.noChildrenAssociated',
        defaultMessage: 'No child categories yet associated',
      },
    },
    roles: {
      single: {
        id: 'app.containers.App.entities.roles.single',
        defaultMessage: 'User role',
      },
      plural: {
        id: 'app.containers.App.entities.roles.plural',
        defaultMessage: 'User roles',
      },
    },
  },
  messages: {
    notSignedIn: {
      id: 'app.containers.App.messages.notSignedIn',
      defaultMessage: 'Please sign in or register first to access this page',
    },
    validateTokenFailed: {
      id: 'app.containers.App.messages.validateTokenFailed',
      defaultMessage: 'Please sign in again',
    },
    alreadySignedIn: {
      id: 'app.containers.App.messages.alreadySignedIn',
      defaultMessage: 'Welcome back!',
    },
    submitInvalid: {
      id: 'app.containers.App.messages.submitInvalid',
      defaultMessage: 'One or more fields have errors.',
    },
    recoverSuccess: {
      id: 'app.containers.App.messages.recoverSuccess',
      defaultMessage: 'Please check your email and follow the instructions to reset your password.',
    },
    createdAsGuest: {
      id: 'app.containers.App.messages.createdAsGuest',
      defaultMessage: '{entityType} created successfully. It will become publicly available once verified and published by an authorised user.',
    },
  },
  ui: {
    userRoles: {
      admin: {
        id: 'app.containers.App.ui.userRoles.admin',
        defaultMessage: 'Administrator',
      },
      coordinator: {
        id: 'app.containers.App.ui.userRoles.coordinator',
        defaultMessage: 'Coordinator',
      },
      member: {
        id: 'app.containers.App.ui.userRoles.member',
        defaultMessage: 'Member',
      },
      visitor: {
        id: 'app.containers.App.ui.userRoles.visitor',
        defaultMessage: 'Staff',
      },
      default: {
        id: 'app.containers.App.ui.userRoles.default',
        defaultMessage: 'Guest (no role assigned)',
      },
    },
    archiveStatuses: {
      archived: {
        id: 'app.containers.App.ui.archiveStatuses.archived',
        defaultMessage: 'Archived',
      },
      current: {
        id: 'app.containers.App.ui.archiveStatuses.current',
        defaultMessage: 'Active',
      },
    },
    privacyStatuses: {
      private: {
        id: 'app.containers.App.ui.privacyStatuses.private',
        defaultMessage: 'Confidential',
      },
      public: {
        id: 'app.containers.App.ui.privacyStatuses.public',
        defaultMessage: 'Not confidential',
      },
    },
    notificationStatuses: {
      enabled: {
        id: 'app.containers.App.ui.notificationStatuses.enabled',
        defaultMessage: 'Notifications enabled',
      },
      disabled: {
        id: 'app.containers.App.ui.notificationStatuses.disabled',
        defaultMessage: 'Notifications disabled',
      },
    },
    publishStatuses: {
      draft: {
        id: 'app.containers.App.ui.publishStatuses.draft',
        defaultMessage: 'Draft',
      },
      public: {
        id: 'app.containers.App.ui.publishStatuses.public',
        defaultMessage: 'Completed',
      },
    },
    emailStatuses: {
      valid: {
        id: 'app.containers.App.ui.emailStatuses.valid',
        defaultMessage: 'Valid',
      },
      invalid: {
        id: 'app.containers.App.ui.emailStatuses.invalid',
        defaultMessage: 'Invalid',
      },
      empty: {
        id: 'app.containers.App.ui.emailStatuses.empty',
        defaultMessage: 'Missing',
      },
    },
    docPublishStatuses: {
      public: {
        id: 'app.containers.App.ui.docPublishStatuses.public',
        defaultMessage: 'Public',
      },
      private: {
        id: 'app.containers.App.ui.docPublishStatuses.private',
        defaultMessage: 'Private',
      },
    },
    checkAttributeStatuses: {
      true: {
        id: 'app.containers.App.ui.checkAttributeStatuses.true',
        defaultMessage: 'Yes',
      },
      false: {
        id: 'app.containers.App.ui.checkAttributeStatuses.false',
        defaultMessage: 'No',
      },
    },
    sortOrderOptions: {
      asc: {
        id: 'app.containers.App.ui.sortOrderOptions.asc',
        defaultMessage: 'Ascending',
      },
      desc: {
        id: 'app.containers.App.ui.sortOrderOptions.desc',
        defaultMessage: 'Descending',
      },
    },
    pageItemOptions: {
      all: {
        id: 'app.containers.App.ui.pageItemOptions.all',
        defaultMessage: 'All',
      },
    },
    statementOptions: {
      includeMemberships: {
        id: 'app.containers.App.ui.statementOptions.includeMemberships',
        defaultMessage: 'Include positions of country groups',
      },
      excludeInofficial: {
        id: 'app.containers.App.ui.statementOptions.excludeInofficial',
        defaultMessage: 'Only show "official" statements',
      },
    },
  },
});
