import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
// import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { Box, Text } from 'grommet';
import TagList from 'components/TagList';
import PrintHide from 'components/styled/PrintHide';
import CheckboxOption from 'components/CheckboxOption';
import SelectIndicators from 'components/SelectIndicators';

import MapKey from './MapKey';

const Title = styled((p) => <Text weight={500} {...p} />)`
  margin-right: ${({ hasInfo }) => hasInfo ? 8 : 0}px;
`;
const SubTitle = styled((p) => <Text size="small" {...p} />)``;

const Styled = styled.div`
  position: absolute;
  z-index: 50;
  bottom: ${({ isPrint }) => isPrint ? 0 : 10}px;
  width: ${({ isPrint }) => isPrint ? 'auto' : '100%'};
  background: ${({ isPrint }) => isPrint ? 'white' : 'transparent'};
  height: ${({ hasTabs, isPrint }) => {
    if (isPrint) return '160px;';
    if (hasTabs) return '260px;';
    return '220px;';
  }}
  left: 0;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.ms}) {
    width: 420px;
    left: ${({ isPrint }) => isPrint ? 0 : 10}px;
    bottom: ${({ isPrint }) => isPrint ? 0 : 30}px;
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

export function MapKeySettingsPanel({
  option,
  countryMapSubject,
  minMaxValues,
  isPrintView,
  filters,
  onClearFilters,
}) {
  if (!option) return null;
  let activeIndicatorOption;
  if (option.indicatorOptions) {
    activeIndicatorOption = option.indicatorOptions.find((o) => o.active);
  }
  return (
    <Styled isPrint={isPrintView}>
      <Pane elevation="medium">
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
          <Box fill="horizontal">
            {option.indicatorOptions && (
              <PrintHide>
                <Box pad={{ bottom: 'ms' }} gap="xxsmall">
                  {activeIndicatorOption && activeIndicatorOption.supTitle && (
                    <SubTitle>{activeIndicatorOption.supTitle}</SubTitle>
                  )}
                  <SelectIndicators config={option} />
                </Box>
              </PrintHide>
            )}
            {!option.indicatorOptions && (
              <Box gap="xsmall" margin={{ vertical: 'small' }}>
                {option.title && (
                  <Title>{option.title}</Title>
                )}
                {option.subTitle && (
                  <SubTitle>{option.subTitle}</SubTitle>
                )}
              </Box>
            )}
            {(!activeIndicatorOption || activeIndicatorOption.id === 'all')
            && minMaxValues.countries && minMaxValues.countries.max > 0 && (
              <MapKey maxValue={minMaxValues.countries.max} mapSubject={countryMapSubject} />
            )}
            {activeIndicatorOption && activeIndicatorOption.id !== 'all' && option.categoryConfig && (
              <MapKey type="categories" config={option.categoryConfig} />
            )}
            {filters && (
              <TagList filters={filters} onClear={onClearFilters} />
            )}
            {(
              option.memberOption ||
              (option.infoOptions && option.infoOptions.length > 0)
            ) && (
              <Box margin={{ top: 'xsmall' }}>
                {option.memberOption && (
                  <CheckboxOption option={option.memberOption} type="info" />
                )}
                {option.infoOptions
                  && option.infoOptions.length > 0
                  && option.infoOptions.map(
                    (infoOption, i) => (
                      <CheckboxOption
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
        </Box>
      </Pane>
    </Styled>
  );
}

MapKeySettingsPanel.propTypes = {
  option: PropTypes.object,
  filters: PropTypes.array,
  minMaxValues: PropTypes.object,
  countryMapSubject: PropTypes.string,
  isPrintView: PropTypes.bool,
  onClearFilters: PropTypes.func,
};

export default MapKeySettingsPanel;
