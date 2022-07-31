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
  const activeTab = options.find((o) => qe(tab, o.id));
  const renderTabs = (shadow) => options
    && options.length > 1
    ? options.map(
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
    )
    : null;
  let activeIndicatorOption;
  let showIndicatorInfo;
  if (activeTab.id === 'indicators') {
    activeIndicatorOption = activeTab.ffOptions.find(
      (o) => qe(o.value, activeTab.ffActiveOptionId || '0')
    );
    showIndicatorInfo = activeIndicatorOption
    && activeIndicatorOption.value !== '0'
    && circleLayerConfig
    && minMaxValues
    && minMaxValues.points;
  }
  return (
    <Styled hasTabs={options.length > 1}>
      <Pane>
        <Box fill="horizontal" direction="row" style={{ zIndex: 1 }}>
          {renderTabs(true)}
        </Box>
        <Box flex={{ grow: 1 }} direction="row" elevation="medium" background="white" style={{ zIndex: 2 }} />
      </Pane>
      <Pane>
        <Box fill="horizontal" direction="row">
          {renderTabs(false)}
        </Box>
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
          {activeTab.id === 'indicators' && (
            <Box fill="horizontal">
              <SelectIndicators config={activeTab} />
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
          {activeTab.id === 'countries' && (
            <Box>
              {activeTab.subjectOptions && (
                <MapSubjectOptions options={activeTab.subjectOptions} />
              )}
              {minMaxValues.countries && minMaxValues.countries.max > 0 && (
                <MapKey maxValue={minMaxValues.countries.max} mapSubject={countryMapSubject} />
              )}
              <Box gap="xsmall" margin={{ vertical: 'small' }}>
                {activeTab.title && (
                  <Title>{activeTab.title}</Title>
                )}
                {activeTab.subTitle && (
                  <SubTitle>{activeTab.subTitle}</SubTitle>
                )}
              </Box>
              {activeTab.memberOption && (
                <MapOption option={activeTab.memberOption} type="member" />
              )}
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
