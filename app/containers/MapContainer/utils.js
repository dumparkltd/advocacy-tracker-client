import { scaleLinear } from 'd3-scale';
import { List } from 'immutable';

export const getRange = (allFeatures, attribute) => allFeatures.reduce(
  (range, f) => {
    const val = f.properties && parseFloat(f.properties[attribute]);
    return {
      min: range.min ? Math.min(range.min, val) : val,
      max: range.min ? Math.max(range.max, val) : val,
    };
  },
  {
    min: null,
    max: null,
  },
);

export const scaleColorCount = (max, stops, isIndicator) => {
  const noStops = stops.length;
  const min = isIndicator ? 0 : 1;
  const minMax = max - min;
  const maxFactor = minMax / (noStops - 1);
  const domain = stops.map((stop, i) => (i * maxFactor + min));
  return scaleLinear()
    .domain(domain)
    .range(stops);
};

export const addToList = (list, countryId, actionId) => {
  // if already present, add action id to country key
  if (list.get(countryId)) {
    return !list.get(countryId).includes(actionId)
      ? list.set(countryId, list.get(countryId).push(actionId))
      : list;
  }
  // else add country with action id as first entry
  return list.set(countryId, List([actionId]));
};
