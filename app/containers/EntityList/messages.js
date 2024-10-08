/*
 * EntityList Messages
 *
 * This contains all the text for the ActionView component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  processingUpdates: {
    id: 'app.containers.EntityList.processingUpdates',
    defaultMessage: 'Processing {processNo} of {totalNo} {types}.',
  },
  updatesFailed: {
    id: 'app.containers.EntityList.updatesFailed',
    defaultMessage: '{errorNo} {types} failed! Please wait for the items to be updated from the server and then carefully review the affected items above.',
  },
  updatesSuccess: {
    id: 'app.containers.EntityList.updatesSuccess',
    defaultMessage: 'All {successNo} {types} succeeded!',
  },
  deleteSuccess: {
    id: 'app.containers.EntityList.deleteSuccess',
    defaultMessage: 'All {successNo} {types} succeeded!',
  },
  createSuccess: {
    id: 'app.containers.EntityList.createSuccess',
    defaultMessage: 'All {successNo} {types} succeeded!',
  },
  type_save: {
    id: 'app.containers.EntityList.type_save',
    defaultMessage: 'update(s)',
  },
  type_new: {
    id: 'app.containers.EntityList.type_new',
    defaultMessage: 'addition(s)',
  },
  type_delete: {
    id: 'app.containers.EntityList.type_delete',
    defaultMessage: 'deletion(s)',
  },
  filterFormWithoutPrefix: {
    id: 'app.containers.EntityList.filterFormWithoutPrefix',
    defaultMessage: 'Without',
  },
  filterFormAnyPrefix: {
    id: 'app.containers.EntityList.filterFormAnyPrefix',
    defaultMessage: 'Some',
  },
  filterFormError: {
    id: 'app.containers.EntityList.filterFormError',
    defaultMessage: 'Errors',
  },
  labelPrintKeywords: {
    id: 'app.containers.EntityList.labelPrintKeywords',
    defaultMessage: 'List filtered by keyword:',
  },
  labelPrintFilters: {
    id: 'app.containers.EntityList.labelPrintFilters',
    defaultMessage: 'Current filters:',
  },
  labelPrintFiltersKeywords: {
    id: 'app.containers.EntityList.labelPrintFiltersKeywords',
    defaultMessage: 'Current filters and list keyword search:',
  },
});
