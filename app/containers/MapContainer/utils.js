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

export const filterFeaturesByZoom = (
  features,
  zoom,
  propertyMaxZoom,
) => features.filter((f) => {
  if (
    f.properties && f.properties[propertyMaxZoom]
  ) {
    return zoom <= parseInt(f.properties[propertyMaxZoom], 10);
  }
  return false;
});
export const filterNoDataFeatures = (
  features,
  indicator,
  isCount,
) => features.filter((f) => {
  if (f.hasData) {
    return true;
  }
  // exclude if no value is set
  if (!f.values || typeof f.values[indicator] === 'undefined') {
    return false;
  }
  // exclude if value is 0 and where 0 means "no data"
  if (isCount && f.values && f.values[indicator] === 0) {
    return false;
  }
  return true;
});

const getPointIconFillColor = ({
  feature,
  mapSubject,
  indicator,
  maxValueCountries,
  mapOptions,
  valueToStyle,
  styleType,
}) => {
  // check for explicitly set feature color
  if (feature.style && feature.style.fillColor) {
    return feature.style.fillColor;
  }
  if (feature.values && typeof feature.values[indicator] !== 'undefined') {
    // check for custom valueToStyle mapping function
    if (valueToStyle) {
      const style = valueToStyle(feature.values[indicator]);
      if (style && style.fillColor) {
        return style.fillColor;
      }
    }
    // use gradient scale if available
    // ... and if a value of 0 is not assumed to be "no data" (i.e. when counting activities)
    const noDataThreshold = indicator === 'indicator' ? 0 : 1;
    if (
      mapSubject
      && mapOptions.GRADIENT[mapSubject]
      && feature.values[indicator] >= noDataThreshold
    ) {
      const scale = scaleColorCount(maxValueCountries, mapOptions.GRADIENT[mapSubject], indicator === 'indicator');
      return scale(feature.values[indicator]);
    }
  }
  const defaultStyle = styleType && mapOptions.STYLE[styleType]
    ? {
      ...mapOptions.DEFAULT_STYLE,
      ...mapOptions.STYLE[styleType],
    }
    : mapOptions.DEFAULT_STYLE;
  // return default "no data" color
  return defaultStyle.fillColor || mapOptions.NO_DATA_COLOR;
};

// append point countries onto map
export const getPointLayer = ({
  data,
  config,
  markerEvents,
  styleType,
}) => {
  const layer = L.featureGroup(null);
  const {
    indicator, mapOptions, mapSubject, maxValueCountries, tooltip, valueToStyle,
  } = config;
  const events = {
    mouseover: (e) => markerEvents.mouseover ? markerEvents.mouseover(e, config) : null,
    mouseout: (e) => markerEvents.mouseout ? markerEvents.mouseout(e, config) : null,
    click: (e) => (markerEvents.click ? markerEvents.click(e, config) : null),
  };

  const tooltipFeatureIds = (tooltip && tooltip.features && tooltip.features.length > 0) ? tooltip.features.map((f) => f.id) : [];
  const jsonLayer = L.geoJSON(data, {
    pointToLayer: (feature, latlng) => {
      const iconCircleColor = getPointIconFillColor({
        feature,
        mapSubject,
        indicator,
        maxValueCountries,
        mapOptions,
        valueToStyle,
        styleType,
      });
      const iconRingColor = tooltipFeatureIds.length && tooltipFeatureIds.indexOf(feature.id) > -1 ? mapOptions.STYLE.active.color : 'white';
      const svgIcon = L.divIcon({
        html: `
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 28 30"
  width="25"
  height="27"
>
  <path
    d="m24,14.18c0-5.52-4.48-10-10-10S4,8.66,4,14.18c0,4.37,2.8,8.07,6.71,9.43l3.29,4.2,3.29-4.2c3.9-1.36,6.71-5.07,6.71-9.43Z"
    fill="${iconRingColor}"
    filter="drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.3))"
  />
  <circle cx="14" cy="14.18" r="8.18" fill="${iconCircleColor}"/>
</svg>`,
        className: 'country-marker-svg-icon',
        iconSize: [25, 27],
        iconAnchor: [12.5, 27],
      });

      return L.marker(latlng, {
        zIndex: 1,
        pane: 'markerPane',
        icon: svgIcon,
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
