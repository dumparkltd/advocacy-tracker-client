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
    listLabelAttributes: {
      activities: {
        id: 'app.components.EntityListDownload.optionGroups.listLabelAttributes.activities',
        defaultMessage: 'Select activity types',
      },
      actionAsTarget: {
        id: 'app.components.EntityListDownload.optionGroups.listLabelAttributes.actionAsTarget',
        defaultMessage: 'Select activity types',
      },
      actors: {
        id: 'app.components.EntityListDownload.optionGroups.listLabelAttributes.actors',
        defaultMessage: 'Select actor types',
      },
      associations: {
        id: 'app.components.EntityListDownload.optionGroups.listLabelAttributes.associations',
        defaultMessage: 'Select association types',
      },
      attributes: {
        id: 'app.components.EntityListDownload.optionGroups.listLabelAttributes.attributes',
        defaultMessage: 'Select attributes',
      },
      category: {
        id: 'app.components.EntityListDownload.optionGroups.listLabelAttributes.category',
        defaultMessage: 'Select category groups',
      },
      types: {
        id: 'app.components.EntityListDownload.optionGroups.listLabelAttributes.types',
        defaultMessage: 'Select target types',
      },
      parents: {
        id: 'app.components.EntityListDownload.optionGroups.listLabelAttributes.parents',
        defaultMessage: 'Select parent activity types',
      },
      children: {
        id: 'app.components.EntityListDownload.optionGroups.listLabelAttributes.children',
        defaultMessage: 'Select child activity types',
      },
      resources: {
        id: 'app.components.EntityListDownload.optionGroups.listLabelAttributes.resources',
        defaultMessage: 'Select resource types',
      },
      members: {
        id: 'app.components.EntityListDownload.optionGroups.listLabelAttributes.members',
        defaultMessage: 'Select member types',
      },
    },
    introLabels: {
      attributes: {
        id: 'app.components.EntityListDownload.optionGroups.introLabels.attributes',
        defaultMessage: 'The resulting CSV file will have one column for each attribute selected',
      },
      associations: {
        id: 'app.components.EntityListDownload.optionGroups.introLabels.associations',
        defaultMessage: 'The resulting CSV file will have one column for each attribute selected',
      },
      categories: {
        id: 'app.components.EntityListDownload.optionGroups.introLabels.categories',
        defaultMessage: 'The resulting CSV file will have one column for each category group (taxonomy) selected',
      },
      members: {
        id: 'app.components.EntityListDownload.optionGroups.introLabels.members',
        defaultMessage: 'By default, the resulting CSV file will have one column for each type of member selected.',
      },
      targets: {
        id: 'app.components.EntityListDownload.optionGroups.introLabels.targets',
        defaultMessage: 'By default, the resulting CSV file will have one column for each type of target selected',
      },
      parents: {
        id: 'app.components.EntityListDownload.optionGroups.introLabels.parents',
        defaultMessage: 'By default, the resulting CSV file will have one column for each type of parent activity selected.',
      },
      children: {
        id: 'app.components.EntityListDownload.optionGroups.introLabels.children',
        defaultMessage: 'By default, the resulting CSV file will have one column for each type of child activity selected.',
      },
      resources: {
        id: 'app.components.EntityListDownload.optionGroups.introLabels.resources',
        defaultMessage: 'By default, the resulting CSV file will have one column for each type of resource selected.',
      },
      support: {
        id: 'app.components.EntityListDownload.optionGroups.introLabels.support',
        defaultMessage: 'Please note that the values may include indirect support inferred from group statements (depending on the list option selected)',
      },
    },
    activeLabels: {
      topics: {
        id: 'app.components.EntityListDownload.optionGroups.activeLabels.topics',
        defaultMessage: 'Include topics',
      },
      users: {
        id: 'app.components.EntityListDownload.optionGroups.activeLabels.users',
        defaultMessage: 'Include users',
      },
    },
    label: {
      actionAsTarget: {
        id: 'app.components.EntityListDownload.optionGroups.label.actionAsTarget',
        defaultMessage: 'Activities as target',
      },
      activities: {
        id: 'app.components.EntityListDownload.optionGroups.label.activities',
        defaultMessage: 'Activities',
      },
      associations: {
        id: 'app.components.EntityListDownload.optionGroups.label.associations',
        defaultMessage: 'Memberships',
      },
      members: {
        id: 'app.components.EntityListDownload.optionGroups.label.members',
        defaultMessage: 'Members',
      },
      support: {
        id: 'app.components.EntityListDownload.optionGroups.label.support',
        defaultMessage: 'Support',
      },
      topics: {
        id: 'app.components.EntityListDownload.optionGroups.label.topics',
        defaultMessage: 'Topics',
      },
    },
    asRowsLabels: {
      actorColumns: {
        id: 'app.components.EntityListDownload.optionGroups.asRowsLabels.actorColumns',
        defaultMessage: 'Include topics as columns (one column for each topic)',
      },
      topicColumns: {
        id: 'app.components.EntityListDownload.optionGroups.asRowsLabels.topicColumns',
        defaultMessage: 'Include topics as columns (one column for each topic)',
      },
      activityColumns: {
        id: 'app.components.EntityListDownload.optionGroups.asRowsLabels.activityColumns',
        defaultMessage: 'Include activities as columns (one column for each activity type)',
      },
      actorRowsAsIndicator: {
        id: 'app.components.EntityListDownload.optionGroups.asRowsLabels.indicatorAsRowsActor',
        defaultMessage: 'Include actors as rows (one row for each activity, topic and actor)',
      },
      actorRows: {
        id: 'app.components.EntityListDownload.optionGroups.asRowsLabels.actorRows',
        defaultMessage: 'Include actors as rows (one row for each activity and actor)',
      },
      activityRows: {
        id: 'app.components.EntityListDownload.optionGroups.asRowsLabels.activityRows',
        defaultMessage: 'Include activities as rows (one row for each actor and activity)',
      },
      indicatorRowsActorAsRow: {
        id: 'app.components.EntityListDownload.optionGroups.asRowsLabels.indicatorRows',
        defaultMessage: 'Include topics as rows (one row for each activity, actor and topic)',
      },
      indicatorRows: {
        id: 'app.components.EntityListDownload.optionGroups.asRowsLabels.indicatorRows',
        defaultMessage: 'Include topics as rows (one row for each activity and topic)',
      },
    },
    introNode: {
      actors: {
        default: {
          id: 'app.components.EntityListDownload.optionGroups.introNode.actors.default',
          defaultMessage: 'By default, the resulting CSV file will have one column for each type of actor selected.',
        },
        indicatorActiveAsRows: {
          id: 'app.components.EntityListDownload.optionGroups.introNode.actors.indicatorActiveAsRows',
          defaultMessage: ' Alternatively you can chose to include actors as rows, resulting in one row per activity, topic and actor.',
        },
        noIndicatorInactiveAsRows: {
          id: 'app.components.EntityListDownload.optionGroups.introNode.actors.indicatorInactiveAsRows',
          defaultMessage: ' Alternatively you can chose to include actors as rows, resulting in one row per activity and actor.',
        },
      },
      actions: {
        default: {
          id: 'app.components.EntityListDownload.optionGroups.introNode.actions.default',
          defaultMessage: 'By default, the resulting CSV file will have one column for each type of activity selected.',
        },
        hasAssociations: {
          id: 'app.components.EntityListDownload.optionGroups.introNode.actions.hasAssociations',
          defaultMessage: ' Please note that activities of other associated actors (the {typeTitle} are members of) are not included.',
        },
        hasMembersNoAssociation: {
          id: 'app.components.EntityListDownload.optionGroups.introNode.actions.hasMembersNoAssociation',
          defaultMessage: ' Please note that activities of {typeTitle} members are not included.',
        },
      },
      actionAsTarget: {
        default: {
          id: 'app.components.EntityListDownload.optionGroups.introNode.actionAsTarget.defualt',
          defaultMessage: 'By default, the resulting CSV file will have one column for each type of activity selected.',
        },
        hasAssociations: {
          id: 'app.components.EntityListDownload.optionGroups.introNode.actionAsTarget.hasAssociations',
          defaultMessage: ' Please note that activities targeting associated actors (the {typeTitle} are members of) are not included.',
        },
        hasMembersNoAssociation: {
          id: 'app.components.EntityListDownload.optionGroups.introNode.actionAsTarget.hasMembersNoAssociation',
          defaultMessage: ' Please note that activities targeting {typeTitle} members are not included.',
        },
      },
      indicators: {
        default: {
          id: 'app.components.EntityListDownload.optionGroups.introNode.indicators.defualt',
          defaultMessage: 'By default, the resulting CSV file will have one column for each topic.',
        },
        actorsAsRow: {
          id: 'app.components.EntityListDownload.optionGroups.introNode.indicators.actorsAsRow',
          defaultMessage: ' Alternatively you can chose to include topics as rows, resulting in one row per activity, actor and topic',
        },
        notActorAsRows: {
          id: 'app.components.EntityListDownload.optionGroups.introNode.indicators.notActorAsRows',
          defaultMessage: ' Alternatively you can chose to include topics as rows, resulting in one row per activity and topic',
        },
      },
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
