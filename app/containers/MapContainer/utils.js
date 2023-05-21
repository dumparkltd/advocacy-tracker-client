import L from 'leaflet';
import { scaleLinear, scalePow } from 'd3-scale';
import { List } from 'immutable';

export const getRange = (allFeatures, attribute, rangeMax) => allFeatures.reduce(
  (range, f) => {
    const val = f.values && parseFloat(f.values[attribute]);
    return {
      min: range.min ? Math.min(range.min, val) : val,
      max: range.max ? Math.max(range.max, val) : val,
    };
  },
  {
    min: null,
    max: rangeMax || null,
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

const getFloatProperty = (feature, attribute) => feature.values
  && parseFloat(feature.values[attribute]);

export const scaleCircle = (val, range, config) => {
  const scale = scalePow()
    .exponent(config.exp || 0.5)
    .domain([0, range.max])
    .range([0, config.max]);
  return Math.max(config.min, scale(val));
};

export const valueOfCircle = (radius, range, config) => {
  const scale = scalePow()
    .exponent(1 / config.exp || 2)
    .domain([0, config.max])
    .range([0, range.max]);
  return scale(radius);
};

const filterFeatureMaxZoom = (feature, zoom) => {
  if (
    feature.properties && feature.properties.marker_max_zoom
  ) {
    console.log(zoom >= parseInt(feature.properties.marker_max_zoom, 10));
    return zoom <= parseInt(feature.properties.marker_max_zoom, 10);
  }
  return false;
};

export const getPointLayer = ({ data, config, markerEvents }) => {
  const layer = L.featureGroup(null);

  const events = {
    mouseover: (e) => markerEvents.mouseover ? markerEvents.mouseover(e, config) : null,
    mouseout: (e) => markerEvents.mouseout ? markerEvents.mouseout(e, config) : null,
    click: (e) => (markerEvents.click ? markerEvents.click(e, config) : null),
  };
  const { zoom } = config;

  const jsonLayer = L.geoJSON(data, {
    pointToLayer: (feature, latlng) => {
      const filterFeature = filterFeatureMaxZoom(feature, zoom);
      return L.circleMarker(latlng, {
        radius: 5,
        zIndex: 1,
        opacity: filterFeature ? 1 : 0,
        fillOpacity: filterFeature ? 1 : 0,
      }).on(events);
    },
  });

  layer.addLayer(jsonLayer);

  return layer;
};

export const getCircleLayer = ({ features, config, markerEvents }) => {
  const options = {
    pane: 'overlayPane',
    ...config.style,
    zIndex: config['z-index'] || 1,
  };
  const events = {
    mouseout: markerEvents.mouseout,
    click: markerEvents.click,
  };
  const range = getRange(features, config.attribute, config.rangeMax);
  const jsonLayer = L.geoJSON(
    {
      features,
      crs: {
        type: 'name',
        properties: {
          name: 'urn:ogc:def:crs:OGC:1.3:CRS84',
        },
      },
    },
    {
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
        ...options,
        radius: scaleCircle(
          getFloatProperty(feature, config.attribute),
          range,
          config.render,
        ),
      }).on(events),
    },
  );
  return jsonLayer;
};
