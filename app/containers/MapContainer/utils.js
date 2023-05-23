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

const filterFeaturesByZoom = (feature, zoom, propertyMaxZoom) => {
  if (
    feature.properties && feature.properties[propertyMaxZoom]
  ) {
    return zoom <= parseInt(feature.properties[propertyMaxZoom], 10);
  }
  return false;
};

const getPointIconFillColor = (feature, mapSubject, indicator, maxValueCountries, mapOptions) => {
  if (feature.style && feature.style.fillColor) {
    return feature.style.fillColor;
  } if (mapSubject) {
    const noDataThreshold = indicator === 'indicator' ? 0 : 1;
    if (feature.values
      && typeof feature.values[indicator] !== 'undefined'
      && feature.values[indicator] >= noDataThreshold) {
      const scale = mapSubject
        && scaleColorCount(maxValueCountries, mapOptions.GRADIENT[mapSubject], indicator === 'indicator');

      return scale(feature.values[indicator]);
    }
  }
  return mapOptions.NO_DATA_COLOR;
};

// append point countries onto map
export const getPointLayer = ({ data, config, markerEvents }) => {
  const layer = L.featureGroup(null);
  const {
    indicator, mapOptions, mapSubject, maxValueCountries, tooltip, zoom,
  } = config;
  const events = {
    mouseover: (e) => markerEvents.mouseover ? markerEvents.mouseover(e, config) : null,
    mouseout: (e) => markerEvents.mouseout ? markerEvents.mouseout(e, config) : null,
    click: (e) => (markerEvents.click ? markerEvents.click(e, config) : null),
  };

  const tooltipFeatureIds = (tooltip && tooltip.features && tooltip.features.length > 0) ? tooltip.features.map((f) => f.id) : [];
  const jsonLayer = L.geoJSON(data, {
    pointToLayer: (feature, latlng) => {
      const iconCircleColor = getPointIconFillColor(feature, mapSubject, indicator, maxValueCountries, mapOptions);
      const iconRingColor = tooltipFeatureIds.length && tooltipFeatureIds.indexOf(feature.id) > -1 ? mapOptions.STYLE.active.color : 'white';
      const svgIcon = L.divIcon({
        html: `
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 28 30"
  width="28"
  height="30"
>
  <path d="m24,14.18c0-5.52-4.48-10-10-10S4,8.66,4,14.18c0,4.37,2.8,8.07,6.71,9.43l3.29,4.2,3.29-4.2c3.9-1.36,6.71-5.07,6.71-9.43Z" fill="${iconRingColor}" filter="drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.4))"/>
  <circle cx="14" cy="14.18" r="8.18" fill="${iconCircleColor}"/>
</svg>`,
        className: '',
        iconSize: [20, 25],
        iconAnchor: [15, 28],
      });

      const filterFeature = filterFeaturesByZoom(feature, zoom, 'marker_max_zoom');

      return L.marker(latlng, {
        zIndex: 1,
        pane: 'markerPane',
        opacity: filterFeature ? 1 : 0,
        fillOpacity: filterFeature ? 1 : 0,
        icon: svgIcon,
      }).on(events);
    },
  });

  layer.addLayer(jsonLayer);

  return layer;
};

// generate styles for a feature
export const getAreaLayer = (feature, indicator, mapOptions, mapSubject, maxValueCountries, styleType, valueToStyle) => {
  const scale = mapSubject
    && scaleColorCount(maxValueCountries, mapOptions.GRADIENT[mapSubject], indicator === 'indicator');
  // treat 0 as no data when showing counts
  const noDataThreshold = indicator === 'indicator' ? 0 : 1;

  // default style
  const defaultStyle = styleType && mapOptions.STYLE[styleType]
    ? {
      ...mapOptions.DEFAULT_STYLE,
      ...mapOptions.STYLE[styleType],
    }
    : mapOptions.DEFAULT_STYLE;
  // check if feature is "active"
  const fstyle = feature.isActive
    ? {
      ...defaultStyle,
      ...mapOptions.STYLE.active,
    }
    : defaultStyle;
  // check for value-to-style function
  if (
    valueToStyle
    && feature.values
    && typeof feature.values[indicator] !== 'undefined'
  ) {
    return {
      ...fstyle,
      ...valueToStyle(feature.values[indicator]),
      ...feature.style,
    };
  }
  // style based on subject/indicator
  if (mapSubject) {
    if (
      feature.values
      && typeof feature.values[indicator] !== 'undefined'
      && feature.values[indicator] >= noDataThreshold
    ) {
      return {
        ...fstyle,
        fillColor: scale(feature.values[indicator]),
        ...feature.style,
      };
    }
    return {
      ...fstyle,
      fillColor: mapOptions.NO_DATA_COLOR,
      ...feature.style,
    };
  }
  return {
    ...fstyle,
    ...feature.style,
  };
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
