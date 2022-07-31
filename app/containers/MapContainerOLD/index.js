/*
 *
 * EntitiesMap
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
import { scaleColorCount } from './utils';

const Styled = styled.div`
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

export function MapContainerOLD({
  countryFeatures,
  countryData,
  indicator,
  onCountryClick,
  maxValue,
  includeActorMembers,
  includeTargetMembers,
  mapSubject,
  fitBounds,
  options = {},
  projection = 'robinson',
  styleType,
  mapId = 'll-map',
  interactive = true,
  scrollWheelZoom = false,
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
  const [tooltip, setTooltip] = useState(null);
  const [featureOver, setFeatureOver] = useState(null);
  const ref = useRef(null);
  const mapRef = useRef(null);
  const countryLayerGroupRef = useRef(null);
  const countryOverlayGroupRef = useRef(null);
  const countryTooltipGroupRef = useRef(null);
  const countryOverGroupRef = useRef(null);
  const mapEvents = {
    // resize: () => {
    //   // console.log('resize')
    //   setTooltip(null);
    // },
    click: () => {
      // console.log('mapClick')
      setTooltip(null);
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
  const onFeatureClick = (e, feature) => {
    if (e && L.DomEvent) L.DomEvent.stopPropagation(e);
    if (e && e.containerPoint && feature && feature.tooltip) {
      setTooltip({
        anchor: e.containerPoint,
        direction: {
          x: 'left',
          y: 'top',
        },
        feature,
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
    countryTooltipGroupRef.current = L.layerGroup();
    countryTooltipGroupRef.current.addTo(mapRef.current);
    countryOverGroupRef.current = L.layerGroup();
    countryOverGroupRef.current.addTo(mapRef.current);
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
    if (mapRef.current.zoomControl) {
      mapRef.current.zoomControl.setPosition('topleft');
    }
  }, []);

  // add countryFeatures
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

  // add countryData
  useEffect(() => {
    if (countryData) {
      countryOverlayGroupRef.current.clearLayers();
      if (countryData.length > 0) {
        const scale = mapSubject && scaleColorCount(maxValue, mapOptions.GRADIENT[mapSubject], indicator === 'indicator');
        const jsonLayer = L.geoJSON(
          countryData,
          {
            style: (f) => {
              const defaultStyle = styleType && mapOptions.STYLE[styleType]
                ? {
                  ...mapOptions.DEFAULT_STYLE,
                  ...mapOptions.STYLE[styleType],
                }
                : mapOptions.DEFAULT_STYLE;
              const fstyle = f.isActive
                ? {
                  ...defaultStyle,
                  ...mapOptions.STYLE.active,
                }
                : defaultStyle;
              if (mapSubject) {
                if (f.values && f.values[indicator] && f.values[indicator] > 0) {
                  return {
                    ...fstyle,
                    fillColor: scale(f.values[indicator]),
                    ...f.style,
                  };
                }
                return {
                  ...fstyle,
                  fillColor: mapOptions.NO_DATA_COLOR,
                  ...f.style,
                };
              }
              return {
                ...fstyle,
                ...f.style,
              };
            },
            onEachFeature: (feature, layer) => {
              layer.on({
                click: (e) => onFeatureClick(e, feature),
                // mouseover: (e) => onFeatureOver(e, feature),
                mouseout: () => onFeatureOver(),
              });
            },
          },
        );
        countryOverlayGroupRef.current.addLayer(jsonLayer);
        if (fitBounds) {
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
    }
  }, [countryData, indicator, tooltip, mapSubject]);

  // highlight tooltip feature
  useEffect(() => {
    countryTooltipGroupRef.current.clearLayers();
    if (tooltip && countryData) {
      const jsonLayer = L.geoJSON(
        countryData.filter((f) => qe(f.id, tooltip.feature.id)),
        {
          style: mapOptions.TOOLTIP_STYLE,
        },
      );
      countryTooltipGroupRef.current.addLayer(jsonLayer);
    }
  }, [tooltip, mapSubject, includeActorMembers, includeTargetMembers]);

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
      const featureUpdated = countryData.find((f) => qe(f.id, tooltip.feature.id));
      if (featureUpdated) {
        setTooltip({
          feature: featureUpdated,
        });
      } else {
        setTooltip(null);
      }
    } else {
      setTooltip(null);
    }
  }, [mapSubject, countryData]);
  return (
    <>
      <Styled id={mapId} ref={ref} styleType={styleType} />
      {tooltip && tooltip.feature && tooltip.feature.tooltip && (
        <Tooltip
          position={null}
          direction={tooltip.direction}
          feature={tooltip.feature.tooltip}
          onClose={() => setTooltip(null)}
          onFeatureClick={(evt) => {
            if (evt !== undefined && evt.stopPropagation) evt.stopPropagation();
            setTooltip(null);
            if (tooltip.feature) {
              onCountryClick(tooltip.feature.id);
            }
          }}
        />
      )}
    </>
  );
}

MapContainerOLD.propTypes = {
  countryFeatures: PropTypes.array,
  countryData: PropTypes.array,
  indicator: PropTypes.string,
  onCountryClick: PropTypes.func,
  maxValue: PropTypes.number,
  includeActorMembers: PropTypes.bool,
  includeTargetMembers: PropTypes.bool,
  fitBounds: PropTypes.bool,
  interactive: PropTypes.bool,
  scrollWheelZoom: PropTypes.bool,
  mapSubject: PropTypes.string,
  projection: PropTypes.string,
  styleType: PropTypes.string,
  mapId: PropTypes.string,
  options: PropTypes.object,
  // onSetMapSubject: PropTypes.func,
};

export default MapContainerOLD;
