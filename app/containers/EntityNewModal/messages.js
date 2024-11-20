/*
 * EntityNewModal Messages
 *
 * This contains all the text for the EntityNewModal component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  categories: {
    pageTitle: {
      id: 'app.containers.EntityNewModal.categories.pageTitle',
      defaultMessage: 'New Category',
    },
    pageTitleTaxonomy: {
      id: 'app.containers.EntityNewModal.categories.pageTitleTaxonomy',
      defaultMessage: 'New {taxonomy}',
    },
  },
  actions: {
    pageTitle: {
      id: 'app.containers.EntityNewModal.actions.pageTitle',
      defaultMessage: 'New { type }',
    },
  },
  actors: {
    pageTitle: {
      id: 'app.containers.EntityNewModal.actors.pageTitle',
      defaultMessage: 'New { type }',
    },
  },
  resources: {
    pageTitle: {
      id: 'app.containers.EntityNewModal.resources.pageTitle',
      defaultMessage: 'New { type }',
    },
  },
});
