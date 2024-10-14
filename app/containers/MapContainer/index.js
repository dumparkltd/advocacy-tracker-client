/*
 *
 * MapContainer
 *
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import styled, { css } from 'styled-components';
import { Box, Text } from 'grommet';

import * as topojson from 'topojson-client';
// import { FormattedMessage } from 'react-intl';

import countriesTopo from 'data/ne_countries_10m_v5.topo.json';
import countryPointsJSON from 'data/country-points.json';


import {
  selectPrintConfig,
} from 'containers/App/selectors';
import {
  setListPreview,
} from 'containers/App/actions';

import { usePrint } from 'containers/App/PrintContext';

// import appMessages from 'containers/App/messages';
// import { hasGroupActors } from 'utils/entities';
import MapWrapper from './MapWrapper';
import MapOption from './MapInfoOptions/MapOption';
import MapKey from './MapInfoOptions/MapKey';
import MapInfoOptions from './MapInfoOptions';
const MapKeyWrapper = styled((p) => <Box margin={{ horizontal: 'medium', top: 'xsmall', bottom: 'small' }} {...p} />)`
  max-width: 400px;
`;
// import messages from './messages';

const Styled = styled(
  React.forwardRef((p, ref) => <Box {...p} ref={ref} />)
)`
  z-index: 0;
  @media print {
    page-break-inside: avoid;
    break-inside: avoid;
  }
`;
const MapTitle = styled((p) => <Box margin={{ horizontal: 'medium', vertical: 'xsmall' }} {...p} />)``;
const MapOptions = styled((p) => <Box margin={{ horizontal: 'medium', top: 'small' }} {...p} />)`
${({ isPrint }) => isPrint && css`margin-left: 0`};
@media print {
  margin-left: 0;
}
`;
const getMapOuterWrapper = (fullMap) => fullMap
  ? styled.div``
  : styled(({ isOverviewMap, ...rest }) => (
    <Box
      margin={isOverviewMap ? null : { horizontal: 'medium' }}
      {...rest}
    />
  ))`
    ${({ isPrint }) => isPrint && css`margin-left: 0;`}
    ${({ isPrint }) => isPrint && css`margin-right: 0;`}
    position: relative;
    overflow: hidden;
    padding-top: ${({ isPrint, orient }) => (isPrint && orient) === 'landscape' ? '50%' : '56.25%'};
    @media print {
      margin-left: 0;
      margin-right: 0;
      display: block;
      page-break-inside: avoid;
      break-inside: avoid;
    }
  `;

export function MapContainer({
  mapKey = {},
  mapInfo,
  mapOptions = [],
  mapData = {},
  onActorClick,
  reducePoints,
  reduceCountryAreas,
  fullMap,
  isOverviewMap,
  printArgs,
  onClearFilters,
  onSetPreviewItemNo,
  // intl,
}) {
  const {
    indicator,
    indicatorPoints,
    mapId,
    projection,
    mapSubject,
    circleLayerConfig,
    hasPointOption,
    hasPointOverlay,
    fitBounds,
    typeLabels,
    includeSecondaryMembers,
    scrollWheelZoom,
    valueToStyle,
    filters,
  } = mapData;
  const {
    keyTitle,
    isIndicator,
    unit,
    maxBinValue,
  } = mapKey;
  const [showAsPoint, setShowAsPoint] = useState(false);

  // convert TopoJSON to JSON
  const countriesJSON = topojson.feature(
    countriesTopo,
    Object.values(countriesTopo.objects)[0],
  );

  let countryData = null;
  let locationData = null;
  let countryPointData = null;
  let maxValue;
  let minValue;
  const minMaxValues = { points: null, countries: null };

  const showPointsOnly = hasPointOption && showAsPoint;
  if (
    reducePoints
    && indicatorPoints
    && indicatorPoints !== '0'
    && (hasPointOverlay || showPointsOnly)
  ) {
    const ffUnit = unit || circleLayerConfig.unit || '';
    const isPercentage = ffUnit.indexOf('%') > -1;

    // reducePoints sets up the country marker data merging the country attributes from the db with the JSON feature attributes
    locationData = reducePoints && reducePoints(
      countryPointsJSON.features,
      showAsPoint,
    );

    [maxValue, minValue] = locationData && locationData.reduce(
      ([max, min], feature) => {
        if (!feature || !feature.values) {
          return [max, min];
        }
        return ([
          max !== null ? Math.max(max, feature.values[indicatorPoints]) : feature.values[indicatorPoints],
          min !== null ? Math.min(min, feature.values[indicatorPoints]) : feature.values[indicatorPoints],
        ]);
      },
      [isPercentage ? 100 : null, null],
    );

    minMaxValues.points = {
      max: maxValue,
      min: minValue,
    };
  }
  // reduceCountryAreas sets up the country data merging the country attributes from the db with the JSON feature attributes
  if (
    reduceCountryAreas
    && !showPointsOnly
  ) {
    countryData = reduceCountryAreas && reduceCountryAreas(countriesJSON.features);
    countryPointData = reduceCountryAreas && reduceCountryAreas(countryPointsJSON.features);

    if (indicator) {
      [maxValue, minValue] = countryData
        ? countryData.reduce(
          ([max, min], feature) => ([
            max !== null ? Math.max(max, feature.values[indicator]) : feature.values[indicator],
            min !== null ? Math.min(min, feature.values[indicator]) : feature.values[indicator],
          ]),
          [null, null],
        )
        : [0, 0];
      minMaxValues.countries = {
        max: maxValue,
        min: minValue,
      };
    }
  }
  let allMapOptions = mapOptions;
  if (hasPointOption) {
    allMapOptions = [
      {
        active: showAsPoint,
        onClick: () => setShowAsPoint(!showAsPoint),
        label: 'Show as circles',
        key: 'circle',
      },
      ...mapOptions,
    ];
  }
  const isPrintView = usePrint();
  const MapOuterWrapper = getMapOuterWrapper(fullMap);

  return (
    <Styled
      className={`advocacy-tracker-map${fullMap ? ' advocacy-tracker-map-full' : ''}`}
    >
      <MapOuterWrapper
        isPrint={isPrintView}
        orient={printArgs && printArgs.printOrientation}
        isOverviewMap={isOverviewMap}
      >
        <MapWrapper
          fullMap={fullMap}
          isPrintView={isPrintView}
          printArgs={printArgs}
          scrollWheelZoom={scrollWheelZoom}
          typeLabels={typeLabels}
          includeSecondaryMembers={includeSecondaryMembers}
          countryData={countryData}
          countryPointData={countryPointData}
          locationData={locationData}
          countryFeatures={countriesJSON.features}
          indicator={indicator}
          valueToStyle={valueToStyle}
          onCountryClick={(id) => onActorClick(id)}
          maxValueCountries={minMaxValues
            && minMaxValues.countries
            ? minMaxValues.countries.max
            : null
          }
          mapSubject={mapSubject}
          fitBounds={fitBounds}
          projection={projection}
          mapId={mapId}
          hasInfo={!!mapInfo}
          circleLayerConfig={{
            ...circleLayerConfig,
            rangeMax: minMaxValues && minMaxValues.points && minMaxValues.points.max,
          }}
          onSetPreviewItemNo={onSetPreviewItemNo}
        />
      </MapOuterWrapper>
      {mapInfo && (
        <MapInfoOptions
          isPrintView={isPrintView}
          option={mapInfo}
          minMaxValues={minMaxValues}
          countryMapSubject={mapSubject}
          circleLayerConfig={circleLayerConfig}
          filters={filters}
          onClearFilters={onClearFilters}
        />
      )}
      {mapKey && Object.keys(mapKey).length > 0 && (
        <MapOptions isPrint={isPrintView}>
          <MapTitle>
            <Text weight={600}>{keyTitle}</Text>
          </MapTitle>
          <MapKeyWrapper>
            <MapKey
              isPrint={isPrintView}
              mapSubject={mapSubject}
              maxValue={maxValue}
              minValue={minValue}
              maxBinValue={maxBinValue}
              isIndicator={isIndicator}
              type={hasPointOption && showAsPoint ? 'circles' : 'gradient'}
              unit={unit}
              circleLayerConfig={circleLayerConfig}
            />
          </MapKeyWrapper>
        </MapOptions>
      )}
      {allMapOptions && allMapOptions.length > 0 && (
        <MapOptions isPrint={isPrintView}>
          {allMapOptions.map(
            (option, id) => (
              <MapOption
                key={id}
                option={option}
                type={option.type}
              />
            )
          )}
        </MapOptions>
      )}
    </Styled>
  );
}

MapContainer.propTypes = {
  onActorClick: PropTypes.func,
  onClearFilters: PropTypes.func,
  reducePoints: PropTypes.func,
  reduceCountryAreas: PropTypes.func,
  mapData: PropTypes.object,
  mapKey: PropTypes.object,
  printArgs: PropTypes.object,
  mapInfo: PropTypes.object,
  mapOptions: PropTypes.array,
  fullMap: PropTypes.bool,
  isOverviewMap: PropTypes.bool,
  onSetPreviewItemNo: PropTypes.func,
};

const mapStateToProps = (state) => ({
  printArgs: selectPrintConfig(state),
});


export function mapDispatchToProps(dispatch) {
  return {
    onSetPreviewItemNo: (value) => dispatch(setListPreview(value)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(MapContainer);
