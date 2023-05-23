/*
 *
 * MapWrapper
 *
 */
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import L from 'leaflet';
import 'proj4leaflet';
import { ResponsiveContext } from 'grommet';
import { merge } from 'lodash/object';

import { MAP_OPTIONS } from 'themes/config';

import qe from 'utils/quasi-equals';


import Tooltip from './Tooltip';
import TooltipContent from './TooltipContent';
import {
  getCircleLayer, getPointLayer, scaleColorCount,
} from './utils';

const Styled = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background: transparent;
  z-index: 10;
  overflow: hidden;
`;
const Map = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background: transparent;
  z-index: 10;
`;

// const PROJ[projection] = {
//   name: 'Custom',
//   crs: 'ESRI:54030',
//   proj4def: '+proj=robin +lon_0=11.7 +x_0=-11.7 +y_0=0 +datum=WGS84 +units=m +no_defs +type=crs',
//   resolutions: [
//     65536, 32768, 16384, 8192, 4096, 2048, 1024, 512, 256, 128,
//   ],
//   origin: [0, 11.7],
//   bounds: [[90, -180], [-90, 180]], // [[N, W], [S, E]]
// };

const getBBox = (bounds, xLat = 0.5, xLon = 180) => {
  const nw = bounds[0];
  const se = bounds[1];
  const n = nw[0]; // 90
  const w = nw[1]; // -180
  const s = se[0]; // -90
  const e = se[1]; // 180
  const coordinates = [];
  // South: SE >> SW
  for (let lon = e; lon >= w; lon -= xLon) {
    coordinates.push([lon, s]);
  }
  // SW >> NW
  for (let lat = s; lat <= n; lat += xLat) {
    coordinates.push([w, lat]);
  }
  // NW >> NE
  for (let lon = w; lon <= e; lon += xLon) {
    coordinates.push([lon, n]);
  }
  // NE >> SE
  for (let lat = n; lat >= s; lat -= xLat) {
    coordinates.push([e, lat]);
  }

  return ({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
      },
    ],
  });
};

const TOOLTIP_INITIAL = { features: [] };

export function MapWrapper({
  countryFeatures,
  countryData,
  countryPointData,
  locationData,
  indicator,
  onCountryClick,
  maxValueCountries,
  includeSecondaryMembers,
  mapSubject,
  fitBounds,
  options = {},
  projection = 'robinson',
  styleType,
  mapId = 'll-map',
  interactive = true,
  scrollWheelZoom = false,
  isLocationData = false, // real location data not country points
  circleLayerConfig = {},
  valueToStyle,
}) {
  const mapOptions = merge({}, options, MAP_OPTIONS);

  const customMapProjection = mapOptions.PROJ[projection];
  const size = React.useContext(ResponsiveContext);
  const leafletOptions = customMapProjection
    ? {
      crs: new L.Proj.CRS(
        customMapProjection.crs,
        customMapProjection.proj4def,
        {
          resolutions: customMapProjection.resolutions,
          origin: customMapProjection.origin,
          bounds: customMapProjection.bounds,
        },
      ),
      // center: mapOptions.CENTER,
      // zoom: size === 'small' ? mapOptions.ZOOM.MIN : mapOptions.ZOOM.INIT,
      zoomControl: size !== 'small' && interactive,
      dragging: interactive,
      doubleClickZoom: interactive,
      scrollWheelZoom,
      minZoom: mapOptions.ZOOM.MIN,
      maxZoom: mapOptions.ZOOM.MAX,
      maxBounds: [
        [mapOptions.BOUNDS.N, mapOptions.BOUNDS.W],
        [mapOptions.BOUNDS.S, mapOptions.BOUNDS.E],
      ],
      continuousWorld: customMapProjection.continuousWorld || false,
      worldCopyJump: false,
      attributionControl: false,
    }
    : {
      // center: mapOptions.CENTER,
      // zoom: size === 'small' ? mapOptions.ZOOM.MIN : mapOptions.ZOOM.INIT,
      zoomControl: interactive,
      dragging: interactive,
      doubleClickZoom: interactive,
      scrollWheelZoom,
      minZoom: mapOptions.ZOOM.MIN,
      maxZoom: mapOptions.ZOOM.MAX,
      continuousWorld: true,
      worldCopyJump: false,
      attributionControl: false,
    };
  const [tooltip, setTooltip] = useState(TOOLTIP_INITIAL);
  const [featureOver, setFeatureOver] = useState(null);
  const [zoom, setZoom] = useState(MAP_OPTIONS.ZOOM.INIT);
  const ref = useRef(null);
  const mapRef = useRef(null);
  const countryLayerGroupRef = useRef(null);
  const countryOverlayGroupRef = useRef(null);
  const countryPointOverlayGroupRef = useRef(null);
  const locationOverlayGroupRef = useRef(null);
  const countryTooltipGroupRef = useRef(null);
  const countryOverGroupRef = useRef(null);
  const mapEvents = {
    // resize: () => {
    //   // console.log('resize')
    //   setTooltip(null);
    // },
    click: () => {
      // console.log('mapClick')
      setTooltip(TOOLTIP_INITIAL);
    },
    // mouseover: (a, b, c) => {
    //   console.log('mouseOver', a, b, c)
    // },
    // mousemove: (a, b, c) => {
    //   console.log('mousemove', a, b, c)
    // },
    // zoomstart: () => {
    //   // console.log('zoomstart')
    //   setTooltip(null);
    // },
    // movestart: () => {
    //   // console.log('movestart')
    //   setTooltip(null);
    // },
    // layeradd: () => {
    //   // console.log('layerAdd', layer)
    //   // setTooltip(null)
    // },
    // layerremove: () => {
    //   // console.log('layerremove', layer)
    //   // setTooltip(null)
    // },
  };
  const onFeatureClick = (e) => {
    const { feature } = e.sourceTarget;
    if (e && L.DomEvent) L.DomEvent.stopPropagation(e);
    if (e && e.containerPoint && feature && feature.tooltip) {
      const activeTT = tooltip.features.reduce(
        (active, f) => f.id === feature.id || active,
        false,
      );
      let newFeatures;
      // remove
      if (activeTT) {
        newFeatures = tooltip.features.reduce(
          (memo, f) => f.id === feature.id ? memo : [...memo, f],
          [],
        );
      } else {
        // const newFeature = feature;
        let content;
        if (countryData && locationData) {
          // add country Data
          const countryF = countryData.find((fcd) => qe(fcd.id, feature.id));
          if (countryF && feature.tooltip.isLocationData) {
            content = [
              countryF.tooltip.stats
                ? <TooltipContent stats={countryF.tooltip.stats} isCount={countryF.tooltip.isCount} />
                : countryF.tooltip.content,
              feature.tooltip.stats
                ? <TooltipContent stats={feature.tooltip.stats} isCount={feature.tooltip.isCount} />
                : feature.tooltip.content,
            ];
          } else if (feature.tooltip.isCountryData) {
            const locF = locationData.find((fcd) => qe(fcd.id, feature.id));
            if (locF) {
              content = [
                countryF.tooltip.stats
                  ? <TooltipContent stats={countryF.tooltip.stats} isCount={countryF.tooltip.isCount} />
                  : feature.tooltip.content,
                locF.tooltip.stats
                  ? <TooltipContent stats={locF.tooltip.stats} isCount={locF.tooltip.isCount} />
                  : locF.tooltip.content,
              ];
            }
          }
          if (!content) {
            content = [
              feature.tooltip.stats
                ? <TooltipContent stats={feature.tooltip.stats} isCount={feature.tooltip.isCount} />
                : feature.tooltip.content,
            ];
          }
        } else {
          content = [
            feature.tooltip.stats
              ? <TooltipContent stats={feature.tooltip.stats} isCount={feature.tooltip.isCount} />
              : feature.tooltip.content,
          ];
        }
        const newFeature = {
          ...feature,
          tooltip: {
            ...feature.tooltip,
            content,
          },
        };
        newFeatures = [
          newFeature,
          ...tooltip.features,
        ];
      }
      setTooltip({
        anchor: e.containerPoint,
        direction: { x: 'left', y: 'top' },
        features: newFeatures,
      });
    }
  };
  const onFeatureOver = (e, feature) => {
    if (e && L.DomEvent) L.DomEvent.stopPropagation(e);
    if (!e || !feature || feature.id) setFeatureOver(null);
    if (feature && feature.id) setFeatureOver(feature.id);
  };
  // useEffect(() => {
  //   /**
  //    * Alert if clicked on outside of element
  //    */
  //   function handleClickOutside(event) {
  //     console.log(event.target)
  //     // Do nothing if clicking ref's element or descendent elements
  //     if (!ref.current || ref.current.contains(event.target)) {
  //       return;
  //     }
  //     setTooltip();
  //   }
  //   // Bind the event listener
  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => {
  //     // Unbind the event listener on clean up
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, [ref]);
  useEffect(() => {
    mapRef.current = L.map(mapId, leafletOptions).on(mapEvents);
    // create an orange rectangle
    if (customMapProjection && customMapProjection.addBBox) {
      L.geoJSON(getBBox(customMapProjection.bounds), mapOptions.BBOX_STYLE).addTo(mapRef.current);
    }
    countryLayerGroupRef.current = L.layerGroup();
    countryLayerGroupRef.current.addTo(mapRef.current);
    countryOverlayGroupRef.current = L.layerGroup();
    countryOverlayGroupRef.current.addTo(mapRef.current);
    locationOverlayGroupRef.current = L.layerGroup();
    locationOverlayGroupRef.current.addTo(mapRef.current);
    countryTooltipGroupRef.current = L.layerGroup();
    countryTooltipGroupRef.current.addTo(mapRef.current);
    countryOverGroupRef.current = L.layerGroup();
    countryOverGroupRef.current.addTo(mapRef.current);
    countryPointOverlayGroupRef.current = L.layerGroup();
    countryPointOverlayGroupRef.current.addTo(mapRef.current);
    //
    // mapRef.current.on('zoomend', () => {
    //   setZoom(mapRef.current.getZoom());
    // });
    // mapRef.current.on('moveend', () => {
    //   onMapMove(getNWSE(mapRef.current));
    // });
    mapRef.current.setView(
      mapOptions.CENTER,
      mapOptions.ZOOM.INIT,
    );
    mapRef.current.on('zoomend', () => {
      setZoom(mapRef.current.getZoom());
    });
    if (mapRef.current.zoomControl) {
      mapRef.current.zoomControl.setPosition('topleft');
    }
  }, []);

  // add countryFeatures basemap
  useEffect(() => {
    if (countryFeatures) {
      countryLayerGroupRef.current.clearLayers();
      const jsonLayer = L.geoJSON(
        countryFeatures,
        {
          style: () => ({
            ...mapOptions.DEFAULT_STYLE,
          }),
        },
      );
      countryLayerGroupRef.current.addLayer(jsonLayer);
    }
  }, [countryFeatures]);

  // add countryPointData
  useEffect(() => {
    countryPointOverlayGroupRef.current.clearLayers();

    if (countryPointData && countryPointData.length > 0) {
      const jsonLayer = getPointLayer({
        data: countryPointData,
        config: {
          zoom, indicator, mapOptions, mapSubject, maxValueCountries, styleType, valueToStyle,
        },
        markerEvents: {
          click: (e) => onFeatureClick(e),
          mouseout: () => onFeatureOver(),
        },
      });
      countryPointOverlayGroupRef.current.addLayer(jsonLayer);
    }
  }, [countryPointData, zoom, indicator, tooltip, mapSubject]);

  // add countryData
  useEffect(() => {
    countryOverlayGroupRef.current.clearLayers();
    if (countryData && countryData.length > 0) {
      const jsonLayer = L.geoJSON(
        countryData,
        {
          style: (feature) => {
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
          },
        }
      ).on({
        click: (e) => onFeatureClick(e),
        mouseout: () => onFeatureOver(),
      });
      countryOverlayGroupRef.current.addLayer(jsonLayer);
    }
  }, [countryData, indicator, tooltip, mapSubject, zoom]);
  // add zoom to countryData
  useEffect(() => {
    if (
      fitBounds
      && countryData
      && countryData.length > 0
      && countryOverlayGroupRef
      && countryOverlayGroupRef.current
      && countryOverlayGroupRef.current.getLayers()
      && countryOverlayGroupRef.current.getLayers().length > 0
    ) {
      const jsonLayer = countryOverlayGroupRef.current.getLayers()[0];
      if (jsonLayer.getBounds) {
        const boundsZoom = mapRef.current.getBoundsZoom(
          jsonLayer.getBounds(),
          false, // inside,
          [20, 20], // padding in px
        );
        const boundsCenter = jsonLayer.getBounds().getCenter();
        // add zoom level to account for custom proj issue
        const ZOOM_OFFSET = 0;
        const MAX_ZOOM = 7;
        mapRef.current.setView(
          boundsCenter,
          Math.min(
            Math.max(boundsZoom - ZOOM_OFFSET, 0),
            MAX_ZOOM,
          ),
          {
            animate: false,
          },
        );
      }
    }
  }, [countryData]);
  // add zoom to locationData
  useEffect(() => {
    if (
      fitBounds
      && locationData
      && locationData.length > 0
      && locationOverlayGroupRef
      && locationOverlayGroupRef.current
      && locationOverlayGroupRef.current.getLayers()
      && locationOverlayGroupRef.current.getLayers().length > 0
    ) {
      const jsonLayer = locationOverlayGroupRef.current.getLayers()[0];
      if (jsonLayer.getBounds) {
        const boundsZoom = mapRef.current.getBoundsZoom(
          jsonLayer.getBounds(),
          false, // inside,
          [20, 20], // padding in px
        );
        const boundsCenter = jsonLayer.getBounds().getCenter();
        // add zoom level to account for custom proj issue
        const ZOOM_OFFSET = 0;
        const MAX_ZOOM = 7;
        mapRef.current.setView(
          boundsCenter,
          Math.min(
            Math.max(
              boundsZoom - ZOOM_OFFSET,
              0,
            ),
            MAX_ZOOM,
          ),
          {
            animate: false,
          },
        );
      }
    }
  }, [locationData]);

  // add locationData
  useEffect(() => {
    locationOverlayGroupRef.current.clearLayers();
    if (locationData && locationData.length > 0) {
      const layer = L.featureGroup(null, { pane: 'overlayPane' });
      const jsonLayer = getCircleLayer({
        features: locationData,
        config: circleLayerConfig,
        markerEvents: {
          click: (e) => onFeatureClick(e),
          mouseout: () => onFeatureOver(),
        },
      });
      layer.addLayer(jsonLayer);
      locationOverlayGroupRef.current.addLayer(layer);
    }
  }, [locationData, indicator, tooltip, mapSubject, circleLayerConfig]);

  // highlight tooltip feature
  useEffect(() => {
    countryTooltipGroupRef.current.clearLayers();
    if (countryData && tooltip && tooltip.features && tooltip.features.length > 0) {
      tooltip.features.forEach(
        (ttFeature) => {
          const jsonLayer = L.geoJSON(
            countryData.filter((f) => qe(f.id, ttFeature.id)),
            { style: mapOptions.TOOLTIP_STYLE },
          );
          countryTooltipGroupRef.current.addLayer(jsonLayer);
        }
      );
    }
    if (locationData && locationOverlayGroupRef.current && locationOverlayGroupRef.current.getLayers()) {
      const layerGroup = locationOverlayGroupRef.current.getLayers()[0];
      const layer = layerGroup && layerGroup.getLayers()[0];
      if (layer) {
        if (tooltip && tooltip.features && tooltip.features.length > 0) {
          const tooltipFeatureIds = tooltip.features.map((f) => f.id);
          if (layer && layer.getLayers()) {
            layer.getLayers().filter(
              (f) => tooltipFeatureIds.indexOf(f.feature.id) > -1
            ).forEach(
              (f) => {
                f.bringToFront();
                f.setStyle({ weight: 1.5 });
              }
            );
          }
        } else {
          layer.getLayers().forEach(
            (feature) => feature.setStyle({ weight: 0.5 })
          );
        }
      }
    }
  }, [tooltip, mapSubject, includeSecondaryMembers]);

  useEffect(() => {
    countryOverGroupRef.current.clearLayers();
    if (featureOver && countryData) {
      const jsonLayer = L.geoJSON(
        countryData.filter((f) => qe(f.id, featureOver)),
        {
          style: mapOptions.OVER_STYLE,
        },
      );
      countryOverGroupRef.current.addLayer(jsonLayer);
    }
  }, [featureOver]);
  // update tooltip
  useEffect(() => {
    if (tooltip && countryData) {
      if (tooltip.features && tooltip.features.length > 0) {
        setTooltip({
          features: tooltip.features.map(
            (f) => countryData.find((c) => qe(c.id, f.id))
          ).filter(
            (f) => !!f
          ),
        });
      } else {
        setTooltip(TOOLTIP_INITIAL);
      }
    } else {
      setTooltip(TOOLTIP_INITIAL);
    }
  }, [mapSubject, countryData]);

  return (
    <Styled>
      <Map id={mapId} ref={ref} styleType={styleType} />
      {tooltip && tooltip.features && tooltip.features.length > 0 && (
        <Tooltip
          isLocationData={isLocationData}
          mapRef={ref}
          position={null}
          direction={tooltip.direction}
          features={tooltip.features && tooltip.features.map((f) => f && f.tooltip)}
          onFeatureClick={onCountryClick ? (id) => onCountryClick(id) : null}
          onClose={(id) => setTooltip({
            ...tooltip,
            features: tooltip.features.reduce(
              (memo, f) => f.id === id ? memo : [...memo, f],
              [],
            ),
          })}
        />
      )}
    </Styled>
  );
}

MapWrapper.propTypes = {
  countryFeatures: PropTypes.array, // country basemap
  countryData: PropTypes.array, // country data overlay
  countryPointData: PropTypes.array, // country data overlay
  locationData: PropTypes.array, // location data overlay
  indicator: PropTypes.string,
  onCountryClick: PropTypes.func,
  valueToStyle: PropTypes.func,
  maxValueCountries: PropTypes.number,
  includeSecondaryMembers: PropTypes.bool,
  fitBounds: PropTypes.bool,
  interactive: PropTypes.bool,
  scrollWheelZoom: PropTypes.bool,
  mapSubject: PropTypes.string,
  projection: PropTypes.string,
  styleType: PropTypes.string,
  mapId: PropTypes.string,
  options: PropTypes.object,
  isLocationData: PropTypes.bool,
  circleLayerConfig: PropTypes.object,
  // onSetMapSubject: PropTypes.func,
};

export default MapWrapper;
