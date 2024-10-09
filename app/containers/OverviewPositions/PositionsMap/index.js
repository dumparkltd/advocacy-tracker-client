import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { List } from 'immutable';

import styled from 'styled-components';
import { palette } from 'styled-theme';

import {
  Box,
  Text,
  Heading,
  Button,
  ResponsiveContext,
} from 'grommet';

import {
  ACTORTYPES,
  ROUTES,
  ACTION_INDICATOR_SUPPORTLEVELS,
  ACTIONTYPES,
} from 'themes/config';
import qe from 'utils/quasi-equals';
import asList from 'utils/as-list';

import {
  loadEntitiesIfNeeded,
  setMapIndicator,
  setIncludeActorMembers,
  updateRouteQuery,
} from 'containers/App/actions';

import {
  selectReady,
  selectIndicators,
  selectActorsWithPositions,
  selectIncludeActorMembers,
  selectIncludeInofficialStatements,
  selectSupportQuery,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';
import Loading from 'components/Loading';
import MapContainer from 'containers/MapContainer';
import SelectIndicators from 'containers/MapContainer/MapInfoOptions/SelectIndicators';
import Icon from 'components/Icon';

import { DEPENDENCIES } from './constants';
import { selectIndicatorId } from './selectors';

import QuickFilters from './QuickFilters';
import Search from './Search';

import messages from './messages';


const StyledCard = styled((p) => <Box {...p} />)``;
const IndicatorSidePanel = styled((p) => <Box {...p} />)`
  border-right: 1px solid ${palette('light', 2)};
  width: 200px;
  @media (min-width: ${(props) => props.theme.breakpoints.large}) {
   width: 325px;
  }
  @media (min-width: ${(props) => props.theme.breakpoints.xlarge}) {
   width: 350px;
  }
`;
const OverviewContentWrapper = styled((p) => <Box {...p} />)``;
const IndicatorList = styled((p) => <Box {...p} />)``;
const IndicatorPanelHeader = styled((p) => <Box {...p} />)`
  border-bottom: 1px solid ${palette('light', 2)};
  position: relative;
`;
const IndicatorSelectButton = styled((p) => <Button plain {...p} />)`
  border-bottom: 1px solid ${palette('light', 2)};
  width: 100%;
  background: ${({ active }) => (active ? palette('primary', 1) : 'white')};
  position: relative;
  padding: ${({ theme }) => theme.global.edgeSize.small};
  &:focus {
    outline: none;
    box-shadow: none;
  }
  /* extra width at the start, on selected item */
  &::before {
    display: ${({ active }) => (active ? 'block' : 'none')};
    position: absolute;
    content: '';
    top: 50%;
    left: -5px;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 21px solid ${palette('primary', 1)};
    border-bottom: 21px solid ${palette('primary', 1)};
    border-right: 12px solid ${palette('primary', 1)};
  }
  /* arrow at the end, on selected item */
  &::after {
    display: ${({ active }) => (active ? 'inline-block' : 'none')};
    content: '';
    position: absolute;
    right: -24px;
    top: 50%;
    transform: translateY(-50%);
    border-width: 15px;
    border-style: solid;
    border-color: transparent transparent transparent ${palette('primary', 1)};
  }
  `;
const IndicatorListTitle = styled((p) => <Text size="small" {...p} />)`
  color: ${palette('dark', 4)};
  font-style: italic;
`;
const IndicatorLabel = styled((p) => <Text size="small" {...p} />)`
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ active }) => active ? 'white' : 'black'};
`;
const MapWrapper = styled((p) => <Box {...p} />)`
  position: relative;
`;
const SearchWrapper = styled((p) => <Box {...p} />)`
  position: absolute;
  z-index: 100;
  right: 12px;
  top: 12px;
  width: ${({ theme }) => theme.sizes.mapSearchBar.width}px;
`;
const MapTitle = styled((p) => <Heading level="3" {...p} />)`
  color: black;
  font-weight: bold;
`;
const SubTitle = styled((p) => <Heading level="3" {...p} />)`
  color: black;
  text-transform: uppercase;
  font-weight: bold;
`;
const TopicsButtonLabel = styled((p) => <Text size="large" {...p} />)`
  color: ${palette('primary', 1)};
    &:hover {
    color: ${palette('primary', 0)};
  }
`;
const TopicsButton = styled((p) => (
  <Button
    pad={{ vertical: 'small', horizontal: 'medium' }}
    {...p}
  />
))`
  font-family: ${({ theme }) => theme.fonts.title};
  text-transform: uppercase;
  border: none;
  path {
    stroke-width: 4px;
  }
  &:hover {
    border: none;
    box-shadow: none;
  }
`;
const GlobalRulesButton = styled((p) => (
  <Button
    pad={{ vertical: 'small', horizontal: 'medium' }}
    {...p}
  />
))`
  font-family: ${({ theme }) => theme.fonts.title};
  color: white;
  text-transform: uppercase;
  background: ${palette('primary', 1)};
  border-radius: 0;
  border: 1px solid transparent;
  &:hover {
    box-shadow: none;
    background: ${palette('primary', 0)};
  }
`;
/* const MapSubTitle = styled((p) => <Heading level="4" {...p} />)`
  color: black;
  font-weight: bold; */
export function PositionsMap({
  indicators,
  countries,
  currentIndicatorId,
  onSetMapIndicator,
  onSetIncludeActorMembers,
  includeActorMembers,
  includeInofficialStatements,
  supportQuery,
  onUpdateQuery,
  onLoadData,
  onEntityClick,
  dataReady,
  intl,
}) {
  useEffect(() => {
    // kick off loading of data
    onLoadData();
  }, []);

  const size = React.useContext(ResponsiveContext);

  const supportQueryAsList = supportQuery
    ? asList(supportQuery)
    : List([]);
  const reduceCountryAreas = (features) => features.reduce((memo, feature) => {
    const country = countries.find((e) => qe(e.getIn(['attributes', 'code']), feature.properties.ADM0_A3 || feature.properties.code));
    if (country) {
      const countryPosition = country.get('indicatorPositions')
        && country.getIn(['indicatorPositions', currentIndicatorId.toString()]).first();

      const statement = countryPosition && countryPosition.get('measure');
      const level = countryPosition
        && parseInt(countryPosition.get('supportlevel_id'), 10);

      return [
        ...memo,
        {
          ...feature,
          id: country.get('id'),
          attributes: country.get('attributes').toJS(),
          values: statement ? { [currentIndicatorId]: level || 0 } : {},
        },
      ];
    }
    return memo;
  }, []);

  const typeLabels = {
    single: intl.formatMessage(appMessages.entities[`actions_${ACTIONTYPES.EXPRESS}`].single),
    plural: intl.formatMessage(appMessages.entities[`actions_${ACTIONTYPES.EXPRESS}`].plural),
  };

  let supportLevels = Object.values(ACTION_INDICATOR_SUPPORTLEVELS)
    .filter((level) => !qe(level.value, 0)) // exclude 0
    .sort((a, b) => a.order > b.order ? 1 : -1);

  supportLevels = supportLevels
    .map((level) => ({
      ...level,
      active: supportQuery
        && supportQueryAsList.includes(level.value),
      label: intl.formatMessage(appMessages.supportlevels[level.value]),
    }));

  const indicatorOptions = indicators
    && indicators
      .entrySeq()
      .map(([id, indicator]) => ({
        key: id,
        active: qe(currentIndicatorId, id),
        label: indicator.getIn(['attributes', 'title']),
        onClick: () => onSetMapIndicator(id),
      }));

  return (
    <Box pad={{ top: 'small', bottom: 'xsmall' }}>
      <Box pad={{ top: 'small', bottom: 'xsmall' }}>
        <SubTitle>
          <FormattedMessage {...messages.subTitle} />
        </SubTitle>
      </Box>
      <StyledCard
        elevation="small"
        background="white"
        direction={size !== 'small' ? 'row' : 'column'}
        flex="grow"
        fill
      >
        {size !== 'small' && (
          <IndicatorSidePanel>
            <IndicatorPanelHeader
              pad={{
                vertical: 'small',
                horizontal: 'xsmall',
              }}
            >
              <IndicatorListTitle>
                <FormattedMessage {...messages.indicatorListTitle} />
              </IndicatorListTitle>
            </IndicatorPanelHeader>
            <IndicatorList>
              {dataReady && indicatorOptions && indicatorOptions.map((indicator) => (
                <IndicatorSelectButton
                  active={indicator.active}
                  key={indicator.key}
                  onClick={() => indicator.onClick(indicator.id)}
                  title={indicator.label}
                >
                  <IndicatorLabel active={indicator.active}>
                    {indicator.label}
                  </IndicatorLabel>
                </IndicatorSelectButton>
              ))}
            </IndicatorList>
          </IndicatorSidePanel>
        )}
        {size === 'small'
          && dataReady
          && indicatorOptions
          && (
            <Box pad="small">
              <SelectIndicators
                config={{
                  onIndicatorSelect: (id) => onSetMapIndicator(id),
                  indicatorOptions,
                  dropAlign: {
                    top: 'bottom',
                    left: 'left',
                  },
                }}
              />
            </Box>
          )
        }
        <OverviewContentWrapper
          direction="column"
          fill="horizontal"
          pad={{ horizontal: 'medium', bottom: 'none' }}
          flex={{ grow: 1, shrink: 1 }}
        >
          <Loading loading={!dataReady} />
          <Box>
            {dataReady && size !== 'small' && (
              <MapTitle>
                {indicators.getIn([currentIndicatorId.toString(), 'attributes', 'title'])}
              </MapTitle>
            )}
          </Box>
          <MapWrapper>
            {dataReady
              && (
                <SearchWrapper>
                  <Search
                    options={countries}
                    onSelect={() => { }}
                    placeholder={intl.formatMessage(messages.searchPlaceholder)}
                  />
                </SearchWrapper>
              )
            }
            {dataReady && (
              <MapContainer
                isOverviewMap
                reduceCountryAreas={reduceCountryAreas}
                typeLabels={typeLabels}
                mapData={{
                  typeLabels,
                  indicator: currentIndicatorId.toString(),
                  includeSecondaryMembers: true,
                  scrollWheelZoom: true,
                  hasPointOption: false,
                  hasPointOverlay: true,
                  valueToStyle: (value) => {
                    let val = value.toString() || '0';
                    if (supportQuery && !supportQueryAsList.includes(val)) {
                      val = '0';
                    }
                    const pos = ACTION_INDICATOR_SUPPORTLEVELS[val];
                    return ({
                      fillColor: pos.color,
                    });
                  },
                }}
                onActorClick={(id) => onEntityClick(id, ROUTES.ACTOR)}
              />
            )}
          </MapWrapper>
          {dataReady && (
            <QuickFilters
              onSetisActorMembers={onSetIncludeActorMembers}
              isActorMembers={includeActorMembers}
              onUpdateQuery={onUpdateQuery}
              supportLevels={supportLevels}
              includeInofficialStatements={includeInofficialStatements}
            />
          )}
          <Box
            direction="row"
            justify="end"
            pad={{ top: 'small' }}
            gap="none"
          >
            <TopicsButton
              reverse
              gap="none"
              justify="center"
              label={(
                <TopicsButtonLabel>
                  {intl.formatMessage(messages.allTopics)}
                </TopicsButtonLabel>
              )}
              icon={(
                <Box margin={{ top: '3px', left: '2px' }}>
                  <Icon
                    name="arrowRight"
                    size="10px"
                    palette="primary"
                    paletteIndex={1}
                    hasStroke
                  />
                </Box>
              )}
            />
            <GlobalRulesButton
              label={(
                <Text size="large">
                  {intl.formatMessage(messages.globalRules)}
                </Text>
              )}
            />
          </Box>
        </OverviewContentWrapper>
      </StyledCard>
    </Box>
  );
}

PositionsMap.propTypes = {
  dataReady: PropTypes.bool,
  onLoadData: PropTypes.func.isRequired,
  onSetMapIndicator: PropTypes.func,
  onSetIncludeActorMembers: PropTypes.func,
  onEntityClick: PropTypes.func,
  countries: PropTypes.object,
  onUpdateQuery: PropTypes.func,
  supportQuery: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(List),
  ]),
  includeActorMembers: PropTypes.bool,
  includeInofficialStatements: PropTypes.bool,
  currentIndicatorId: PropTypes.number,
  indicators: PropTypes.object,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state, { includeActorMembers }) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  indicators: selectIndicators(state),
  currentIndicatorId: selectIndicatorId(state),
  includeInofficialStatements: selectIncludeInofficialStatements(state),
  supportQuery: selectSupportQuery(state),
  includeActorMembers: selectIncludeActorMembers(state),
  countries: selectActorsWithPositions(state, { includeActorMembers, type: ACTORTYPES.COUNTRY }),
});

export function mapDispatchToProps(dispatch) {
  return {
    onLoadData: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onSetMapIndicator: (value) => dispatch(setMapIndicator(value)),
    onSetIncludeActorMembers: (value) => dispatch(setIncludeActorMembers(value)),
    onUpdateQuery: (value) => dispatch(updateRouteQuery(value)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(PositionsMap));
