/*
 * OverviewPositions Messages
 *
 *
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  pageTitle: {
    id: 'app.containers.OverviewPositions.pageTitle',
    defaultMessage: 'Positions Dashboard',
  },
  subTitle: {
    id: 'app.containers.OverviewPositions.subTitle',
    defaultMessage: 'Country Position By Topic',
  },
  indicatorListTitle: {
    id: 'app.containers.OverviewPositions.indicatorListTitle',
    defaultMessage: 'Select a topic',
  },
  supportLevelTitle: {
    id: 'app.containers.OverviewPositions.supportLevelTitle',
    defaultMessage: 'UN Member States\' level of support',
  },
  supportLevelHint: {
    id: 'app.containers.OverviewPositions.supportLevelHint',
    defaultMessage: 'Click to highlight',
  },
  isActorMembers: {
    id: 'app.containers.OverviewPositions.isActorMembers',
    defaultMessage: 'Include positions of groups (countries are member of)',
  },
  isOfficialFiltered: {
    id: 'app.containers.OverviewPositions.isOfficialFiltered',
    defaultMessage: 'Only show "official" statements (Level of Authority)',
  },
});
