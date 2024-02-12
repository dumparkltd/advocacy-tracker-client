import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text, Button } from 'grommet';
import InfoOverlay from 'components/InfoOverlay';

// import PrintHide from 'components/styled/PrintHide';
// import PrintOnly from 'components/styled/PrintOnly';

import MapKey from './MapKey';
import SelectFFIndicators from './SelectFFIndicators';

const Title = styled((p) => <Text weight={500} {...p} />)`
  margin-right: ${({ hasInfo }) => hasInfo ? 8 : 0}px;
`;
const SubTitle = styled((p) => <Text size="small" {...p} />)``;

const IndicatorButton = styled((p) => <Button plain {...p} />)`
    color: #0077d8;
    &:hover {
      color: #0063b5;
    }
`;

export function IndicatorsTab({
  config,
  showIndicatorInfo,
  minMaxValues,
  circleLayerConfig,
  isPrintView,
}) {
  const {
    title, onClick, href, info,
  } = config;
  return (
    <Box fill="horizontal">
      <SelectFFIndicators config={config} isPrintView={isPrintView} />
      {showIndicatorInfo && (
        <Box pad={{ top: 'medium' }} gap="medium">
          <MapKey
            maxValue={minMaxValues.points.max}
            minValue={minMaxValues.points.min}
            isIndicator
            type="circles"
            circleLayerConfig={circleLayerConfig}
          />
          {title
                        && (
                          <div>
                            {onClick && (
                              <IndicatorButton
                                as={href ? 'a' : 'button'}
                                href={href}
                                onClick={(evt) => {
                                  if (evt) evt.preventDefault();
                                  onClick();
                                }}
                              >
                                <Title hasInfo={!!info}>
                                  {title}
                                </Title>
                              </IndicatorButton>
                            )}
                            {!onClick && (
                              <Title hasInfo={!!info}>
                                {title}
                              </Title>
                            )}
                            {info && (
                              <InfoOverlay
                                title={title}
                                content={info}
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
  );
}

IndicatorsTab.propTypes = {
  config: PropTypes.object,
  minMaxValues: PropTypes.object,
  circleLayerConfig: PropTypes.object,
  showIndicatorInfo: PropTypes.bool,
  isPrintView: PropTypes.bool,
};

export default IndicatorsTab;
