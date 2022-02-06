/*
 * EntityListGroups Messages
 *
 * This contains all the text for the EntityList component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  associationNotExistent: {
    id: 'app.components.EntityListItem.associationNotExistent',
    defaultMessage: 'Association no longer present.',
  },
  associationAlreadyPresent: {
    id: 'app.components.EntityListItem.associationAlreadyPresent',
    defaultMessage: 'Association already created.',
  },
});
