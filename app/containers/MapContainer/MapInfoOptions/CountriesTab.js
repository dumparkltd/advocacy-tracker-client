import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text, Button } from 'grommet';
import InfoOverlay from 'components/InfoOverlay';

import PrintHide from 'components/styled/PrintHide';
import PrintOnly from 'components/styled/PrintOnly';

import MapKey from './MapKey';
import MapSubjectOptions from './MapSubjectOptions';
import MapOption from './MapOption';
import SelectIndicators from './SelectIndicators';

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

export function CountriesTab({
  config,
  minMaxValues,
  activeIndicatorOption,
  countryMapSubject,
  isPrintView,
}) {
  const {
    title,
    subTitle,
    memberOption,
    infoOptions,
    subjectOptions,
    indicatorOptions,
    titlePrint,
  } = config;

  if (indicatorOptions) {
    const { categoryConfig } = config;
    const {
      id, label, onClick, href, info,
    } = activeIndicatorOption;

    return (
      <Box fill="horizontal">
        <Box pad={{ bottom: 'ms' }} gap="xxsmall">
          <SubTitle>Select a topic to view country positions</SubTitle>
          <SelectIndicators config={config} />
        </Box>
        {id === 'all'
          && minMaxValues.countries
          && minMaxValues.countries.max > 0
          && (
            <MapKey
              maxValue={minMaxValues.countries.max}
              mapSubject={countryMapSubject}
              isPrint={isPrintView}
            />
          )}
        {id !== 'all' && categoryConfig
          && (
            <MapKey
              type="categories"
              config={categoryConfig}
              isPrint={isPrintView}
            />
          )}
        {id === 'all' && (
          <Box gap="xsmall" margin={{ vertical: 'small' }}>
            {titlePrint && (
              <Title>{titlePrint}</Title>
            )}
            {title && !titlePrint && (
              <Title>{title}</Title>
            )}
            {subTitle && (
              <SubTitle>{subTitle}</SubTitle>
            )}
          </Box>
        )}
        {id !== 'all' && (
          <Box pad={{ vertical: 'small' }} gap="medium">
            {label && (
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
                      {label}
                    </Title>
                  </IndicatorButton>
                )}
                {!onClick && (
                  <Title hasInfo={!!info}>
                    {label}
                  </Title>
                )}
                {info && (
                  <InfoOverlay
                    title={label}
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
        {memberOption && (
          <MapOption option={memberOption} type="member" />
        )}
        {infoOptions
          && infoOptions.length > 0
          && infoOptions.map(
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
    );
  }
  return (
    <Box fill="horizontal">
      <PrintOnly>
        {title
          && <Text size="small">{title}</Text>}
        <Box gap="xsmall" margin={{ top: 'xsmall', bottom: 'small' }}>
          {titlePrint && (
            <Title>{titlePrint}</Title>
          )}
          {subTitle && (
            <SubTitle>{subTitle}</SubTitle>
          )}
        </Box>
      </PrintOnly>
      {subjectOptions && (
        <PrintHide>
          <MapSubjectOptions options={subjectOptions} />
        </PrintHide>
      )}
      {minMaxValues.countries && minMaxValues.countries.max > 0 && (
        <MapKey
          maxValue={minMaxValues.countries.max}
          mapSubject={countryMapSubject}
          isPrint={isPrintView}
        />
      )}
      <PrintHide>
        <Box gap="xsmall" margin={{ vertical: 'small' }}>
          {title && (
            <Title>{title}</Title>
          )}
          {subTitle && (
            <SubTitle>{subTitle}</SubTitle>
          )}
        </Box>
      </PrintHide>
      {memberOption && (<MapOption option={memberOption} type="info" />)}
      {infoOptions
        && infoOptions.length > 0
        && infoOptions.map(
          (infoOption, i) => (
            <MapOption
              key={i}
              option={{ ...infoOption, id: infoOption.id || i }}
              type="info"
            />
          )
        )}
    </Box>
  );
}

CountriesTab.propTypes = {
  activeIndicatorOption: PropTypes.array,
  config: PropTypes.object,
  minMaxValues: PropTypes.object,
  countryMapSubject: PropTypes.string,
  isPrintView: PropTypes.bool,
};

export default CountriesTab;
