/*
 * Messages
 *
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.components.EntityListDelete.title',
    defaultMessage: 'Delete selected',
  },
  deleteButton: {
    id: 'app.components.EntityListDelete.deleteButton',
    defaultMessage: 'Delete',
  },
  confirm: {
    id: 'app.components.EntityListDelete.confirm',
    defaultMessage: 'Really delete {destroyableCount} selected? This action cannot be undone.',
  },
  excludingNote: {
    id: 'app.components.EntityListDelete.excludingNote',
    defaultMessage: 'Note: Excluding {excludingCount} selected items that you do not have permission to delete',
  },
  notAuthorizedNote: {
    id: 'app.components.EntityListDelete.notAuthorizedNote',
    defaultMessage: 'You don\'t have sufficient permission to delete any selected items. (Only Administrators can delete items they did not create)',
  },
});
