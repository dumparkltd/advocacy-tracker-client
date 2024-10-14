import { createSelector } from 'reselect';

import {
  selectIndicators,
  selectMapIndicator,
} from 'containers/App/selectors';

export const selectIndicatorId = createSelector(
  selectMapIndicator,
  selectIndicators,
  (indicatorId, indicators) => {
    if (
      indicatorId
      && indicatorId !== ''
      && indicators
      && indicators.get(indicatorId)
    ) {
      return parseInt(indicatorId, 10);
    }
    return indicators && indicators.size > 0
      ? parseInt(indicators.first().get('id'), 10)
      : null;
  }
);
