import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
// import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { Box, Text, Button } from 'grommet';
import InfoOverlay from 'components/InfoOverlay';

import qe from 'utils/quasi-equals';

import MapKey from './MapKey';
import MapSubjectOptions from './MapSubjectOptions';
import MapOption from './MapOption';
import SelectFFIndicators from './SelectFFIndicators';
import SelectIndicators from './SelectIndicators';

const Title = styled((p) => <Text weight={500} {...p} />)`
  margin-right: ${({ hasInfo }) => hasInfo ? 8 : 0}px;
`;
const SubTitle = styled((p) => <Text size="small" {...p} />)``;

const Styled = styled.div`
  position: absolute;
  z-index: 50;
  bottom: 10px;
  width: 100%;
  height: ${({ hasTabs }) => hasTabs ? 250 : 220}px;
  left: 0;
  max-width: 380px;
  @media (min-width: 370px) {
    left: 10px;
    bottom: 50px;
  }
`;
const IndicatorButton = styled((p) => <Button plain {...p} />)`
    color: #0077d8;
    &:hover {
      color: #0063b5;
    }
`;
const Pane = styled((p) => <Box {...p} />)`
  position: absolute;
  z-index: 51;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
`;
// const X = styled((p) => (
//   <Box
//     elevation="small"
//     background="white"
//     pad={{
//       horizontal: 'small',
//       bottom: 'large',
//     }}
//     {...p}
//   />
// ))`
//   position: absolute;
//   z-index: 50;
//   bottom: 10px;
//   width: 100%;
//   height: 200px;
//   left: 0;
//   max-width: 350px;
//   padding: 5px 10px 5px;
//   @media (min-width: 370px) {
//     left: 10px;
//     bottom: 50px;
//   }
// `;

export function MapInfoOptions({
  options,
  countryMapSubject,
  minMaxValues,
  circleLayerConfig,
}) {
  if (!options) return null;
  const [tab, setTab] = useState(options[0].id);
  const activeOption = options.find((o) => qe(tab, o.id));
  const renderTabs = (shadow) => options
    && options.map(
      (option) => {
        const active = qe(tab, option.id);
        return (
          <Box
            key={option.id}
            elevation={shadow ? 'medium' : ''}
            style={{ zIndex: active ? 2 : 0 }}
            background={(shadow || active) ? 'white' : ''}
          >
            <Button
              plain
              onClick={() => setTab(option.id)}
            >
              <Box pad={{ vertical: 'xsmall', horizontal: 'small' }}>
                <Text
                  size="small"
                  weight={active ? 500 : 300}
                  style={{
                    opacity: shadow ? 0 : 1,
                  }}
                >
                  {option.tabTitle}
                </Text>
              </Box>
            </Button>
          </Box>
        );
      }
    );
  let activeIndicatorOption;
  let showIndicatorInfo;
  if (activeOption.id === 'indicators') {
    activeIndicatorOption = activeOption.ffOptions.find(
      (o) => qe(o.value, activeOption.ffActiveOptionId || '0')
    );
    showIndicatorInfo = activeIndicatorOption
      && activeIndicatorOption.value !== '0'
      && circleLayerConfig
      && minMaxValues
      && minMaxValues.points;
  }
  if (activeOption.id === 'countries' && activeOption.indicatorOptions) {
    activeIndicatorOption = activeOption.indicatorOptions.find(
      (o) => o.active
    );
  }
  return (
    <Styled hasTabs={options.length > 1 || activeOption.indicatorOptions}>
      <Pane>
        {options.length > 1 && (
          <Box fill="horizontal" direction="row" style={{ zIndex: 1 }}>
            {renderTabs(true)}
          </Box>
        )}
        <Box flex={{ grow: 1 }} direction="row" elevation="medium" background="white" style={{ zIndex: 2 }} />
      </Pane>
      <Pane>
        {options.length > 1 && (
          <Box fill="horizontal" direction="row">
            {renderTabs(false)}
          </Box>
        )}
        <Box
          flex={{ grow: 1 }}
          direction="row"
          background="white"
          align="start"
          pad={{
            horizontal: 'small',
            top: 'ms',
          }}
        >
          {activeOption.id === 'indicators' && (
            <Box fill="horizontal">
              <SelectFFIndicators config={activeOption} />
              {showIndicatorInfo && (
                <Box pad={{ top: 'medium' }} gap="medium">
                  <MapKey
                    maxValue={minMaxValues.points.max}
                    minValue={minMaxValues.points.min}
                    isIndicator
                    type="circles"
                    circleLayerConfig={circleLayerConfig}
                  />
                  {activeIndicatorOption.title && (
                    <div>
                      {activeIndicatorOption.onClick && (
                        <IndicatorButton
                          as={activeIndicatorOption.href ? 'a' : 'button'}
                          href={activeIndicatorOption.href}
                          onClick={(evt) => {
                            if (evt) evt.preventDefault();
                            activeIndicatorOption.onClick();
                          }}
                        >
                          <Title hasInfo={!!activeIndicatorOption.info}>
                            {activeIndicatorOption.title}
                          </Title>
                        </IndicatorButton>
                      )}
                      {!activeIndicatorOption.onClick && (
                        <Title hasInfo={!!activeIndicatorOption.info}>
                          {activeIndicatorOption.title}
                        </Title>
                      )}
                      {activeIndicatorOption.info && (
                        <InfoOverlay
                          title={activeIndicatorOption.title}
                          content={activeIndicatorOption.info}
                          markdown
                          tooltip
                          inline
                        />
                      )}
                    </div>
                  )}
                </Box>
              )}
              {!showIndicatorInfo && (
                <Box pad={{ top: 'medium' }}>
                  <SubTitle>Select an indicator to add it to the map</SubTitle>
                </Box>
              )}
            </Box>
          )}
          {activeOption.id === 'countries' && !activeOption.indicatorOptions && (
            <Box>
              {activeOption.subjectOptions && (
                <MapSubjectOptions options={activeOption.subjectOptions} />
              )}
              {minMaxValues.countries && minMaxValues.countries.max > 0 && (
                <MapKey maxValue={minMaxValues.countries.max} mapSubject={countryMapSubject} />
              )}
              <Box gap="xsmall" margin={{ vertical: 'small' }}>
                {activeOption.title && (
                  <Title>{activeOption.title}</Title>
                )}
                {activeOption.subTitle && (
                  <SubTitle>{activeOption.subTitle}</SubTitle>
                )}
              </Box>
              {activeOption.memberOption && (
                <MapOption option={activeOption.memberOption} type="info" />
              )}
              {activeOption.infoOptions
                && activeOption.infoOptions.length > 0
                && activeOption.infoOptions.map(
                  (infoOption, i) => (
                    <MapOption
                      key={i}
                      option={{ ...infoOption, id: infoOption.id || i }}
                      type="info"
                    />
                  )
                )
              }
            </Box>
          )}
          {activeOption.id === 'countries' && activeOption.indicatorOptions && (
            <Box fill="horizontal">
              <Box pad={{ bottom: 'ms' }} gap="xxsmall">
                <SubTitle>Select a topic to view country positions</SubTitle>
                <SelectIndicators config={activeOption} />
              </Box>
              {activeIndicatorOption.id === 'all'
                && minMaxValues.countries
                && minMaxValues.countries.max > 0 && (
                <MapKey maxValue={minMaxValues.countries.max} mapSubject={countryMapSubject} />
              )}
              {activeIndicatorOption.id !== 'all' && activeOption.categoryConfig && (
                <MapKey type="categories" config={activeOption.categoryConfig} />
              )}
              {activeIndicatorOption.id === 'all' && (
                <Box gap="xsmall" margin={{ vertical: 'small' }}>
                  {activeOption.title && (
                    <Title>{activeOption.title}</Title>
                  )}
                  {activeOption.subTitle && (
                    <SubTitle>{activeOption.subTitle}</SubTitle>
                  )}
                </Box>
              )}
              {activeIndicatorOption.id !== 'all' && (
                <Box pad={{ vertical: 'small' }} gap="medium">
                  {activeIndicatorOption.label && (
                    <div>
                      {activeIndicatorOption.onClick && (
                        <IndicatorButton
                          as={activeIndicatorOption.href ? 'a' : 'button'}
                          href={activeIndicatorOption.href}
                          onClick={(evt) => {
                            if (evt) evt.preventDefault();
                            activeIndicatorOption.onClick();
                          }}
                        >
                          <Title hasInfo={!!activeIndicatorOption.info}>
                            {activeIndicatorOption.label}
                          </Title>
                        </IndicatorButton>
                      )}
                      {!activeIndicatorOption.onClick && (
                        <Title hasInfo={!!activeIndicatorOption.info}>
                          {activeIndicatorOption.label}
                        </Title>
                      )}
                      {activeIndicatorOption.info && (
                        <InfoOverlay
                          title={activeIndicatorOption.label}
                          content={activeIndicatorOption.info}
                          markdown
                          tooltip
                          inline
                        />
                      )}
                    </div>
                  )}
                </Box>
              )}
              {activeOption.memberOption && (
                <MapOption option={activeOption.memberOption} type="member" />
              )}
              {activeOption.infoOptions
                && activeOption.infoOptions.length > 0
                && activeOption.infoOptions.map(
                  (infoOption, i) => (
                    <MapOption
                      key={i}
                      option={{ ...infoOption, id: infoOption.id || i }}
                      type="info"
                    />
                  )
                )
              }
            </Box>
          )}
        </Box>
      </Pane>
    </Styled>
  );
}

MapInfoOptions.propTypes = {
  options: PropTypes.array,
  minMaxValues: PropTypes.object,
  circleLayerConfig: PropTypes.object,
  countryMapSubject: PropTypes.string,
};

export default MapInfoOptions;
