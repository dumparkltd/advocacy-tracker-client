import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';

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
  API,
  ACTORTYPES,
  ROUTES,
  ACTION_INDICATOR_SUPPORTLEVELS,
  ACTIONTYPES,
  OFFICIAL_STATEMENT_CATEGORY_ID,
} from 'themes/config';
import { qe } from 'utils/quasi-equals';

import {
  loadEntitiesIfNeeded,
  setMapIndicator,
  setIncludeActorMembers,
  updateRouteQuery,
} from 'containers/App/actions';

import {
  selectReady,
  selectIndicators,
  selectMapIndicator,
  selectActorsWithPositions,
  selectIncludeActorMembers,
  selectCategoryQuery,
} from 'containers/App/selectors';
import { selectViewActions } from 'containers/ActionList/selectors';

import appMessages from 'containers/App/messages';
import Loading from 'components/Loading';
import MapContainer from 'containers/MapContainer';

import FilterOptions from './FilterOptions';
import messages from './messages';

const DEPENDENCIES = [
  API.ACTORS,
  API.ACTIONS,
  API.RESOURCES,
  API.ACTION_ACTIONS,
  API.ACTOR_ACTIONS,
  API.ACTION_ACTORS,
  API.ACTION_RESOURCES,
  API.ACTOR_CATEGORIES,
  API.ACTION_CATEGORIES,
  API.ACTORTYPES,
  API.ACTIONTYPES,
  API.RESOURCETYPES,
  API.ACTORTYPE_TAXONOMIES,
  API.ACTIONTYPE_TAXONOMIES,
  API.TAXONOMIES,
  API.CATEGORIES,
  API.MEMBERSHIPS,
  API.USERS,
  API.USER_ACTIONS,
  API.USER_ROLES,
  API.INDICATORS,
  API.ACTION_INDICATORS,
];

const StyledCard = styled((p) => <Box {...p} />)``;
const IndicatorSidePanel = styled((p) => <Box {...p} />)`
  border-right: 1px solid ${palette('light', 2)};
  width: 200px;
`;
const MapContainerWrapper = styled((p) => <Box {...p} />)``;
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

const MapTitle = styled((p) => <Heading level="3" {...p} />)`
  color: black;
  font-weight: bold;
`;
/* const MapSubTitle = styled((p) => <Heading level="4" {...p} />)`
  color: black;
  font-weight: bold; */
export function PositionsMap({
  indicators,
  countries,
  entities,
  currentIndicatorId,
  onSetMapIndicator,
  onSetIncludeActorMembers,
  includeActorMembers,
  catQuery,
  onUpdateQuery,
  mapIndicator,
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
  let activeId = currentIndicatorId;
  if (dataReady && indicators && (!activeId || activeId === '')) {
    activeId = indicators.first().get('id');
  }
  const indicatorEntities = entities.filter(
    (entity) => entity.get('indicatorConnections') && entity.get('indicatorConnections').some(
      (connection) => qe(connection.get('indicator_id'), mapIndicator)
    )
  );

  const reduceCountryAreas = (features) => features.reduce((memo, feature) => {
    const country = countries.find((e) => qe(e.getIn(['attributes', 'code']), feature.properties.ADM0_A3 || feature.properties.code));
    if (country) {
      let hasActiveStatements = indicatorEntities.some(
        (entity) => entity.get('actors') && entity.get('actors').some(
          (actorId) => qe(actorId, country.get('id'))
        )
      );
      if (!hasActiveStatements && includeActorMembers) {
        hasActiveStatements = indicatorEntities.some(
          (entity) => entity.get('actorsMembers') && entity.get('actorsMembers').some(
            (actorId) => qe(actorId, country.get('id'))
          )
        );
      }
      const countryPositions = hasActiveStatements
        && country.get('indicatorPositions')
        && country.getIn(['indicatorPositions', mapIndicator.toString()]).filter(
          (position) => indicatorEntities.some(
            (entity) => qe(entity.get('id'), position.get('measure_id'))
          )
        );
      const countryPosition = countryPositions && countryPositions.first();
      const statement = countryPosition && countryPosition.get('measure');
      const level = countryPosition
        && parseInt(countryPosition.get('supportlevel_id'), 10);
      const values = statement ? { [mapIndicator]: level || 0 } : {};
      return [
        ...memo,
        {
          ...feature,
          id: country.get('id'),
          attributes: country.get('attributes').toJS(),
          values,
        },
      ];
    }
    return memo;
  }, []);

  const typeLabels = {
    single: intl.formatMessage(appMessages.entities[`actions_${ACTIONTYPES.EXPRESS}`].single),
    plural: intl.formatMessage(appMessages.entities[`actions_${ACTIONTYPES.EXPRESS}`].plural),
  };

  const supportLevels = Object.values(ACTION_INDICATOR_SUPPORTLEVELS)
    .sort((a, b) => a.order > b.order ? 1 : -1)
    .filter((level) => !qe(level.value, 0))
    .map((level) => ({
      ...level,
      label: intl.formatMessage(appMessages.supportlevels[level.value]),
    }));

  const isOfficialFiltered = typeof catQuery === 'object'
    ? catQuery.includes(OFFICIAL_STATEMENT_CATEGORY_ID.toString())
    // string
    : qe(catQuery, OFFICIAL_STATEMENT_CATEGORY_ID);

  return (
    <Box pad={{ top: 'small', bottom: 'xsmall' }}>
      <Loading loading={!dataReady} />
      {dataReady && (
        <StyledCard
          elevation="small"
          background="white"
          direction="row"
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
                {indicators && indicators.entrySeq().map(([id, indicator]) => {
                  const active = qe(activeId, id);
                  return (
                    <IndicatorSelectButton
                      active={active}
                      key={id}
                      onClick={() => onSetMapIndicator(id)}
                      title={indicator.getIn(['attributes', 'title'])}
                    >
                      <IndicatorLabel active={active}>
                        {indicator.getIn(['attributes', 'title'])}
                      </IndicatorLabel>
                    </IndicatorSelectButton>
                  );
                })}
              </IndicatorList>
            </IndicatorSidePanel>
          )}
          <MapContainerWrapper
            direction="column"
            fill="horizontal"
            margin={{ horizontal: 'medium', bottom: 'medium' }}
            flex={{ grow: 1, shrink: 1 }}
          >
            <Box>
              {size !== 'small' && (
                <MapTitle>
                  {indicators.getIn([activeId, 'attributes', 'title'])}
                </MapTitle>
              )}
            </Box>
            <Box>
              <MapContainer
                //fullMap
                reduceCountryAreas={reduceCountryAreas}
                typeLabels={typeLabels}
                mapData={{
                  typeLabels,
                  indicator: activeId,
                  includeSecondaryMembers: true,
                  scrollWheelZoom: true,
                  hasPointOption: false,
                  hasPointOverlay: true,
                  valueToStyle: (value) => {
                    const pos = ACTION_INDICATOR_SUPPORTLEVELS[value || 0];
                    return ({
                      fillColor: pos.color,
                    });
                  },
                }}
                onActorClick={(id) => onEntityClick(id, ROUTES.ACTOR)}
              />
            </Box>
            <FilterOptions
              onSetIncludeActorMembers={onSetIncludeActorMembers}
              onUpdateQuery={onUpdateQuery}
              supportLevels={supportLevels}
              isOfficialFiltered={isOfficialFiltered}
              includeActorMembers={includeActorMembers}
            />
          </MapContainerWrapper>
        </StyledCard>
      )}
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
  includeActorMembers: PropTypes.bool,
  catQuery: PropTypes.string,
  mapIndicator: PropTypes.string,
  currentIndicatorId: PropTypes.string,
  indicators: PropTypes.object,
  entities: PropTypes.object,
  intl: intlShape.isRequired,
};

const structuredSelector = createStructuredSelector({
  dataReady: (state) => selectReady(state, { path: DEPENDENCIES }),
  entities: (state) => selectViewActions(state, { type: ACTIONTYPES.EXPRESS }),
  indicators: (state) => selectIndicators(state),
  mapIndicator: (state) => selectMapIndicator(state),
  currentIndicatorId: (state) => selectMapIndicator(state),
  catQuery: (state) => selectCategoryQuery(state),
  includeActorMembers: (state) => selectIncludeActorMembers(state),
});
const mapStateToProps = (state, { includeActorMembers }) => ({
  ...structuredSelector(state),
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
