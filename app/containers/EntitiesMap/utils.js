import { scaleLinear } from 'd3-scale';

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

export const scaleColorCount = (max, stops) => {
  const noStops = stops.length;
  const min = 1;
  const minMax = max - min;
  const maxFactor = minMax / (noStops - 1);
  const domain = stops.map((stop, i) => (i * maxFactor + min));
  return scaleLinear()
    .domain(domain)
    .range(stops);
};
