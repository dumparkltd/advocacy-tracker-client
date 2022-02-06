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
  background: #fff;
  z-index: 10;
`;

// const PROJ = {
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

export function MapContainer({
  countryFeatures,
  indicator,
  onCountryClick,
  typeLabels,
  maxValue,
  includeActorMembers,
  includeTargetMembers,
  mapSubject,
}) {
  const [tooltip, setTooltip] = useState(null);
  const [featureOver, setFeatureOver] = useState(null);
  const ref = useRef(null);
  const mapRef = useRef(null);
  const countryLayerGroupRef = useRef(null);
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
    mapRef.current = L.map('ll-map', {
      crs: new L.Proj.CRS(
        MAP_OPTIONS.PROJ.crs,
        MAP_OPTIONS.PROJ.proj4def,
        {
          resolutions: MAP_OPTIONS.PROJ.resolutions,
          origin: MAP_OPTIONS.PROJ.origin,
          bounds: MAP_OPTIONS.PROJ.bounds,
        },
      ),
      // center: MAP_OPTIONS.CENTER,
      // zoom: size === 'small' ? MAP_OPTIONS.ZOOM.MIN : MAP_OPTIONS.ZOOM.INIT,
      zoomControl: true,
      minZoom: MAP_OPTIONS.ZOOM.MIN,
      maxZoom: MAP_OPTIONS.ZOOM.MAX,
      maxBounds: [
        [MAP_OPTIONS.BOUNDS.N, MAP_OPTIONS.BOUNDS.W],
        [MAP_OPTIONS.BOUNDS.S, MAP_OPTIONS.BOUNDS.E],
      ],
      continuousWorld: true,
      worldCopyJump: false,
      attributionControl: false,
    }).on(mapEvents);
    // create an orange rectangle
    L.geoJSON(getBBox(MAP_OPTIONS.PROJ.bounds), MAP_OPTIONS.BBOX_STYLE).addTo(mapRef.current);
    countryLayerGroupRef.current = L.layerGroup();
    countryLayerGroupRef.current.addTo(mapRef.current);
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
      MAP_OPTIONS.CENTER,
      MAP_OPTIONS.ZOOM.INIT,
    );
    mapRef.current.zoomControl.setPosition('topleft');
  }, []);
  // add countryFeatures
  useEffect(() => {
    if (countryFeatures) {
      const scale = scaleColorCount(maxValue, MAP_OPTIONS.GRADIENT[mapSubject]);
      countryLayerGroupRef.current.clearLayers();
      const jsonLayer = L.geoJSON(
        countryFeatures,
        {
          style: (f) => ({
            ...MAP_OPTIONS.DEFAULT_STYLE,
            fillColor: f.values && f.values[indicator] && f.values[indicator] > 0
              ? scale(f.values[indicator])
              : MAP_OPTIONS.NO_DATA_COLOR,
          }),
          onEachFeature: (feature, layer) => {
            layer.on({
              click: (e) => onFeatureClick(e, feature),
              mouseover: (e) => onFeatureOver(e, feature),
              mouseout: () => onFeatureOver(),
            });
          },
        },
      );
      countryLayerGroupRef.current.addLayer(jsonLayer);
    }
  }, [countryFeatures, indicator, tooltip, mapSubject]);
  // add countryFeatures
  useEffect(() => {
    countryTooltipGroupRef.current.clearLayers();
    if (tooltip && countryFeatures) {
      const jsonLayer = L.geoJSON(
        countryFeatures.filter((f) => qe(f.id, tooltip.feature.id)),
        {
          style: MAP_OPTIONS.TOOLTIP_STYLE,
        },
      );
      countryTooltipGroupRef.current.addLayer(jsonLayer);
    }
  }, [tooltip, mapSubject, includeActorMembers, includeTargetMembers]);
  // useEffect(() => {
  //   countryTooltipGroupRef.current.clearLayers();
  //   if (tooltip && countryFeatures) {
  //     setTooltip(null);
  //   }
  // }, [countryFeatures]);

  useEffect(() => {
    countryOverGroupRef.current.clearLayers();
    if (featureOver && countryFeatures) {
      const jsonLayer = L.geoJSON(
        countryFeatures.filter((f) => qe(f.id, featureOver)),
        {
          style: MAP_OPTIONS.OVER_STYLE,
        },
      );
      countryOverGroupRef.current.addLayer(jsonLayer);
    }
  }, [featureOver]);

  return (
    <>
      <Styled id="ll-map" ref={ref} />
      {tooltip && (
        <Tooltip
          position={null}
          direction={tooltip.direction}
          feature={tooltip.feature}
          onClose={() => setTooltip(null)}
          typeLabels={typeLabels}
          onFeatureClick={(evt) => {
            if (evt !== undefined && evt.stopPropagation) evt.stopPropagation();
            setTooltip(null);
            if (tooltip.feature && tooltip.feature.attributes) {
              onCountryClick(tooltip.feature.id);
            }
          }}
          includeActorMembers={includeActorMembers}
          includeTargetMembers={includeTargetMembers}
          mapSubject={mapSubject}
        />
      )}
    </>
  );
}

MapContainer.propTypes = {
  typeLabels: PropTypes.object,
  countryFeatures: PropTypes.array,
  indicator: PropTypes.string,
  onCountryClick: PropTypes.func,
  maxValue: PropTypes.number,
  includeActorMembers: PropTypes.bool,
  includeTargetMembers: PropTypes.bool,
  mapSubject: PropTypes.string,
  // onSetMapSubject: PropTypes.func,
};

export default MapContainer;
