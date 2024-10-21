/*
 * EntityPreview Messages
 *
 * This contains all the text for the EntityPreview component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  countryTopicPosition: {
    sectionTitle: {
      id: 'app.containers.EntityPreview.countryTopicPosition.sectionTitle',
      defaultMessage: 'Country position on',
    },
  },
  countryTopicStatementList: {
    latestSectionTitle: {
      id: 'app.containers.EntityPreview.countryTopicStatementList.latestSectionTitle',
      defaultMessage: 'Most recent statement on topic',
    },
    previousSectionTitle: {
      id: 'app.containers.EntityPreview.countryTopicStatementList.previousSectionTitle',
      defaultMessage: 'Other statements on topic',
    },
  },
});
