/*
 * Messages
 *
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  buttonDownload: {
    id: 'app.components.EntityListDownload.buttonDownload',
    defaultMessage: 'Download CSV',
  },
  groupShow: {
    id: 'app.components.EntityListDownload.groupShow',
    defaultMessage: 'Show',
  },
  groupHide: {
    id: 'app.components.EntityListDownload.groupHide',
    defaultMessage: 'Hide',
  },
  includeTimestamp: {
    id: 'app.components.EntityListDownload.includeTimestamp',
    defaultMessage: 'Include timestamp',
  },
  filenameLabel: {
    id: 'app.components.EntityListDownload.filenameLabel',
    defaultMessage: 'Enter filename',
  },
  ignoreSelected: {
    id: 'app.components.EntityListDownload.ignoreSelected',
    defaultMessage: 'Ignore selected items',
  },
  ignoreKeyword: {
    id: 'app.components.EntityListDownload.ignoreKeyword',
    defaultMessage: 'Ignore search keyword',
  },
  exportDescription: {
    id: 'app.components.EntityListDownload.exportDescription',
    defaultMessage: 'Please select the attributes, categories and/or connections you would like to include',
  },
  downloadCsvTitle: {
    id: 'app.components.EntityListDownload.downloadCsvTitle',
    defaultMessage: 'Download CSV',
  },
  exportAsTitle: {
    id: 'app.components.EntityListDownload.exportAsTitle',
    defaultMessage: 'Export {count} {typeTitle} as CSV',
  },
  exportAsTitleNone: {
    id: 'app.components.EntityListDownload.exportAsTitleNone',
    defaultMessage: 'No {typeTitle} with current selection or search',
  },
  optionGroups: {
    listLabelColumns: {
      id: 'app.components.EntityListDownload.optionGroups.listLabelColumns',
      defaultMessage: 'Customise column name',
    },
    listLabelTypes: {
      id: 'app.components.EntityListDownload.optionGroups.listLabelTypes',
      defaultMessage: 'Select {type} types',
    },
    listLabelGroups: {
      id: 'app.components.EntityListDownload.optionGroups.listLabelGroups',
      defaultMessage: 'Select {type} groups',
    },
    listLabelActivity: {
      id: 'app.components.EntityListDownload.optionGroups.listLabelActivity',
      defaultMessage: 'Select {type} activity types',
    },
    listLabelAttributes: {
      id: 'app.components.EntityListDownload.optionGroups.listLabelAttributes',
      defaultMessage: 'Select {type}',
    },
    listLabelCategories: {
      id: 'app.components.EntityListDownload.optionGroups.listLabelCategories',
      defaultMessage: 'Select category groups',
    },
    introLabelTaxonomy: {
      id: 'app.components.EntityListDownload.introLabelTaxonomy',
      defaultMessage: 'The resulting CSV file will have one column for each category group (taxonomy) selected',
    },
    introLabelDefault: {
      id: 'app.components.EntityListDownload.introLabelDefault',
      defaultMessage: 'The resulting CSV file will have one column for each {type} selected',
    },
    introLabelActivity: {
      id: 'app.components.EntityListDownload.optionGroups.introLabelActivity',
      defaultMessage: 'By default, the resulting CSV file will have one column for each type of {type} activity selected.',
    },
    introLabelGroups: {
      id: 'app.components.EntityListDownload.optionGroups.introLabelGroups',
      defaultMessage: 'By default, the resulting CSV file will have one column for each type of {type} selected.',
    },
    introLabelSupport: {
      id: 'app.components.EntityListDownload.optionGroups.introLabelSupport',
      defaultMessage: 'Please note that the values may include indirect support inferred from group statements (depending on the list option selected)',
    },
    attributeLabel: {
      id: 'app.components.EntityListDownload.optionGroups.attributeLabel',
      defaultMessage: 'attribute',
    },
    topicLabel: {
      id: 'app.components.EntityListDownload.optionGroups.topicLabel',
      defaultMessage: 'topic',
    },
    topicsLabel: {
      id: 'app.components.EntityListDownload.optionGroups.topicsLabel',
      defaultMessage: 'Topics',
    },
    supportLabel: {
      id: 'app.components.EntityListDownload.optionGroups.supportLabel',
      defaultMessage: 'Support',
    },
    actionAsTargetLabel: {
      id: 'app.components.EntityListDownload.optionGroups.actionAsTargetLabel',
      defaultMessage: 'Activities as target',
    },
    associationsLabel: {
      id: 'app.components.EntityListDownload.optionGroups.associationsLabel',
      defaultMessage: 'Memberships',
    },
    membersLabel: {
      id: 'app.components.EntityListDownload.optionGroups.membersLabel',
      defaultMessage: 'Members',
    },
    actorLabel: {
      id: 'app.components.EntityListDownload.optionGroups.actorLabel',
      defaultMessage: 'actor',
    },
    parentLabel: {
      id: 'app.components.EntityListDownload.optionGroups.parentLabel',
      defaultMessage: 'parent',
    },
    childLabel: {
      id: 'app.components.EntityListDownload.optionGroups.childLabel',
      defaultMessage: 'child',
    },
    activityLabel: {
      id: 'app.components.EntityListDownload.optionGroups.activityLabel',
      defaultMessage: 'activity',
    },
    associationLabel: {
      id: 'app.components.EntityListDownload.optionGroups.associationLabel',
      defaultMessage: 'association',
    },
    memberLabel: {
      id: 'app.components.EntityListDownload.optionGroups.memberLabel',
      defaultMessage: 'member',
    },
    asRowsLabelColumn: {
      id: 'app.components.EntityListDownload.optionGroups.asRowsLabelColumn',
      defaultMessage: 'Include {type}s as columns (one column for each {type})',
    },
    asRowsLabelsActivity: {
      id: 'app.components.EntityListDownload.optionGroups.asRowsLabelsActivity',
      defaultMessage: 'Include activities as {type} (one column for each activity type)',
    },
    asRowsLabelsAsRow: {
      id: 'app.components.EntityListDownload.optionGroups.asRowsLabelsAsRow',
      defaultMessage: 'Include {type}s as rows (one row for each activity, actor and {type})',
    },
    asRowsLabels: {
      id: 'app.components.EntityListDownload.optionGroups.asRowsLabels',
      defaultMessage: 'Include {type}s as rows (one row for each activity and {type})',
    },
    introNodeDefault: {
      id: 'app.components.EntityListDownload.optionGroups.introNodeDefault',
      defaultMessage: 'By default, the resulting CSV file will have one column for each type of {type} selected. ',
    },
    introNodeAlternativeActor: {
      id: 'app.components.EntityListDownload.optionGroups.introNodeAlternativeActor',
      defaultMessage: 'Alternatively you can chose to include activities as rows, resulting in one row per actor and activity.',
    },
    introNodeTypeAsRows: {
      id: 'app.components.EntityListDownload.optionGroups.introNodeTypeAsRows',
      defaultMessage: ' Alternatively you can chose to include {type} as rows, resulting in one row per activity, topic and actor.',
    },
    introNodeTypeNotAsRows: {
      id: 'app.components.EntityListDownload.optionGroups.introNode.introNodeTypeNotAsRows',
      defaultMessage: ' Alternatively you can chose to include {type}s as rows, resulting in one row per activity and {type}.',
    },
    introNodeHasMembersNoAssociation: {
      id: 'app.components.EntityListDownload.optionGroups.introNode.introNodeHasMembersNoAssociation',
      defaultMessage: ' Please note that activities targeting {type} members are not included.',
    },
    introNodeHasAssociations: {
      id: 'app.components.EntityListDownload.optionGroups.introNodeHasAssociations',
      defaultMessage: ' Please note that activities of other associated actors (the {type} are members of) are not included.',
    },
    onActiveLabelDefault: {
      id: 'app.components.EntityListDownload.optionGroups.onActiveLabelDefault',
      defaultMessage: 'Include {type}',
    },
    onActiveUserLabel: {
      id: 'app.components.EntityListDownload.optionGroups.onActiveUserLabel',
      defaultMessage: 'Include assigned users',
    },
    onActiveSupportLabel: {
      id: 'app.components.EntityListDownload.optionGroups.onActiveSupportLabel',
      defaultMessage: 'Include country numbers by level of support',
    },
  },
});
