/*
 *
 * EntitiesMapActions
 *
 */
import React from 'react';
import { injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Box, Text, Button } from 'grommet';

import {
  ACTORTYPES,
  ROUTES,
  ACTIONTYPES,
  ACTION_INDICATOR_SUPPORTLEVELS,
  OFFICIAL_STATEMENT_CATEGORY_ID,
} from 'themes/config';

import {
  selectActortypeActors,
  selectActorsWithPositions,
  selectMapIndicator,
  selectIndicators,
  selectCategoryQuery,
} from 'containers/App/selectors';
import {
  setMapIndicator,
  updateRouteQuery,
} from 'containers/App/actions';

import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import EntityListViewOptions from 'components/EntityListViewOptions';

import appMessages from 'containers/App/messages';
import qe from 'utils/quasi-equals';
import { hasGroupActors } from 'utils/entities';
import MapContainer from 'containers/MapContainer';
// import messages from './messages';

const Styled = styled(ContainerWrapper)`
  background: white;
`;

const StatementButton = styled((p) => <Button {...p} />)`
  font-weight: 500;
  font-size: 13px;
  line-height: 16px;
  display: inline-block;
  stroke: ${({ theme }) => theme.global.colors.a};
  &:hover {
    stroke: ${({ theme }) => theme.global.colors.aHover};
  }
`;

export function EntitiesMapActions({
  viewOptions,
  entities,
  actortypes,
  actiontypes,
  targettypes,
  typeId,
  mapSubject,
  onSetMapSubject,
  onSetIncludeActorMembers,
  includeActorMembers,
  onSetIncludeTargetMembers,
  includeTargetMembers,
  countries,
  onEntityClick,
  intl,
  hasFilters,
  mapIndicator,
  indicators,
  onSetMapIndicator,
  catQuery,
  onUpdateQuery,
}) {
  let subjectOptions = [];
  let indicatorOptions;
  let infoOptions = [];
  let indicator = includeActorMembers ? 'actionsTotal' : 'actions';
  let mapSubjectClean = mapSubject || 'actors';
  let reduceCountryAreas;
  let countryCounts;
  let actionsTotalShowing;
  let infoTitle;
  let infoSubTitle;
  let mapInfo;

  const isStatements = qe(typeId, ACTIONTYPES.EXPRESS);
  const isPositionIndicator = isStatements
    && indicators
    && indicators.find(
      (entity) => qe(entity.get('id'), mapIndicator)
    );

  const typeLabels = {
    single: intl.formatMessage(appMessages.entities[`actions_${typeId}`].single),
    plural: intl.formatMessage(appMessages.entities[`actions_${typeId}`].plural),
  };
  const type = actiontypes.find((at) => qe(at.get('id'), typeId));
  const hasByTarget = type.getIn(['attributes', 'has_target']);
  const hasActions = isStatements
    || qe(typeId, ACTIONTYPES.INTERACTION)
    || qe(typeId, ACTIONTYPES.EVENT);

  if (hasActions) {
    if (!hasByTarget) {
      mapSubjectClean = 'actors';
    }
    if (!isStatements) {
      subjectOptions = [
        {
          title: qe(ACTIONTYPES.DONOR, typeId) ? 'By donor' : 'By actor',
          onClick: () => onSetMapSubject('actors'),
          active: mapSubjectClean === 'actors',
          disabled: mapSubjectClean === 'actors',
        },
      ];
    }
  }
  if (!isStatements && hasByTarget) {
    if (!hasActions) {
      mapSubjectClean = 'targets';
    }
    if (mapSubjectClean === 'targets') {
      indicator = includeTargetMembers ? 'targetingActionsTotal' : 'targetingActions';
    }
    // cleanMapSubject = mapSubject;
    subjectOptions = [
      ...subjectOptions,
      {
        title: qe(ACTIONTYPES.DONOR, typeId) ? 'By recipient' : 'By target',
        onClick: () => onSetMapSubject('targets'),
        active: mapSubjectClean === 'targets',
        disabled: mapSubjectClean === 'targets',
      },
    ];
  }
  if (mapSubjectClean === 'targets') {
    // note this should always be true!
    if (hasGroupActors(targettypes)) {
      infoOptions = [{
        active: includeTargetMembers,
        onClick: () => onSetIncludeTargetMembers(includeTargetMembers ? '0' : '1'),
        label: 'Include activities targeting regions and groups',
      }];
    }
  } else if (hasGroupActors(actortypes)) {
    if (isPositionIndicator) {
      infoOptions = [{
        active: includeActorMembers,
        onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
        label: 'Include positions of groups',
      }];
    } else {
      infoOptions = [{
        active: includeActorMembers,
        onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
        label: isStatements
          ? 'Include statements of groups'
          : 'Include activities of groups',
      }];
    }
  }

  if (isStatements) {
    const isOfficialFiltered = typeof catQuery === 'object'
      ? catQuery.includes(OFFICIAL_STATEMENT_CATEGORY_ID.toString())
      // string
      : qe(catQuery, OFFICIAL_STATEMENT_CATEGORY_ID);
    infoOptions.push({
      active: isOfficialFiltered,
      label: 'Only show "official" statements (Level of Authority)',
      onClick: () => onUpdateQuery([{
        arg: 'cat',
        value: OFFICIAL_STATEMENT_CATEGORY_ID,
        add: !isOfficialFiltered,
        remove: isOfficialFiltered,
        replace: false,
        multipleAttributeValues: false,
      }]),
    });

    indicatorOptions = indicators.sort(
      (a, b) => parseInt(a.get('id'), 10) < parseInt(b.get('id'), 10) ? -1 : 1
    ).reduce(
      (memo, entity) => ([
        ...memo,
        {
          id: entity.get('id'),
          value: entity.get('id'),
          label: entity.getIn(['attributes', 'title']),
          active: qe(mapIndicator, entity.get('id')),
          onClick: () => onEntityClick(entity.get('id'), ROUTES.INDICATOR),
          href: `${ROUTES.INDICATOR}/${entity.get('id')}`,
          // info: entity.getIn(['attributes', 'description']),
        },
      ]),
      [{
        id: 'all',
        value: 'all',
        label: 'All topics',
        active: typeof mapIndicator === 'undefined' || mapIndicator === null,
      }]
    );
  }
  // if  position indicator
  if (isPositionIndicator) {
    const indicatorEntities = entities.filter(
      (entity) => entity.get('indicatorConnections') && entity.get('indicatorConnections').some(
        (connection) => qe(connection.get('indicator_id'), mapIndicator)
      )
    );
    reduceCountryAreas = (features) => features.map((feature) => {
      const country = countries.find((e) => qe(e.getIn(['attributes', 'code']), feature.properties.ADM0_A3));
      if (country) {
        let hasActiveStatements = indicatorEntities.some(
          (entity) => entity.get('actors').some(
            (actorId) => qe(actorId, country.get('id'))
          )
        );
        if (!hasActiveStatements && includeActorMembers) {
          hasActiveStatements = indicatorEntities.some(
            (entity) => entity.get('actorsMembers').some(
              (actorId) => qe(actorId, country.get('id'))
            )
          );
        }
        // if (hasActiveStatements) {
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
        const position = level || level === 0
          ? ACTION_INDICATOR_SUPPORTLEVELS[level || 0]
          : {
            value: '99',
            color: '#EDEFF0',
          };
        return {
          ...feature,
          id: country.get('id'),
          attributes: country.get('attributes').toJS(),
          tooltip: {
            id: country.get('id'),
            title: country.getIn(['attributes', 'title']),
            content: (
              <Box gap="small" pad={{ top: 'small' }}>
                <Text weight={600}>
                  {intl.formatMessage(appMessages.supportlevels[position.value])}
                </Text>
                {statement && (
                  <Box gap="xxsmall">
                    <Box direction="row" gap="xxsmall" align="center">
                      <Text size="xxxsmall" color="textSecondary">
                        Statement
                      </Text>
                      {statement.get('date_start') && (
                        <Text size="xxxsmall" color="textSecondary">
                          {`(${intl.formatDate(statement.get('date_start'))})`}
                        </Text>
                      )}
                    </Box>
                    <StatementButton
                      as="a"
                      plain
                      href={`${ROUTES.ACTION}/${statement.get('id')}`}
                      onClick={(evt) => {
                        if (evt && evt.preventDefault) evt.preventDefault();
                        if (evt && evt.stopPropagation) evt.stopPropagation();
                        onEntityClick(statement.get('id'), ROUTES.ACTION);
                      }}
                    >
                      {statement.get('title')}
                    </StatementButton>
                  </Box>
                )}
              </Box>
            ),
          },
          values: {
            [mapIndicator]: level || 0,
          },
        };
      }
      // }
      return {
        ...feature,
        values: {
          [mapIndicator]: 0,
        },
      };
    });
    indicator = mapIndicator;
    mapSubjectClean = null;
    mapInfo = [{
      id: 'countries',
      infoOptions,
      indicatorOptions,
      onIndicatorSelect: onSetMapIndicator,
      categoryConfig: {
        categories: Object.values(ACTION_INDICATOR_SUPPORTLEVELS)
          .sort(
            (a, b) => a.order > b.order ? 1 : -1
          )
          .filter(
            (level) => !qe(level.value, 0)
          )
          .map(
            (level) => ({
              ...level,
              label: intl.formatMessage(appMessages.supportlevels[level.value]),
            })
          ),
      },
    }];
  } else {
    [countryCounts, actionsTotalShowing] = entities.reduce(([memo, memo2], action) => {
      let updated = memo;
      let total = memo2;
      // get countries
      const actionCountries = action.get('actorsByType')
        && action.getIn(['actorsByType', parseInt(ACTORTYPES.COUNTRY, 10)]);
      if (actionCountries) {
        actionCountries.forEach((cid) => {
          if (memo.get(cid) && memo.getIn([cid, 'actions'])) {
            updated = updated.setIn([cid, 'actions'], memo.getIn([cid, 'actions']) + 1);
          } else {
            updated = updated.setIn([cid, 'actions'], 1);
          }
        });
        if (mapSubjectClean === 'actors') {
          total += 1;
        }
      }
      const actionCountriesMembers = action.get('actorsMembersByType')
        && action.getIn(['actorsMembersByType', parseInt(ACTORTYPES.COUNTRY, 10)]);
      if (actionCountriesMembers) {
        actionCountriesMembers
          .filter((cid) => !actionCountries || !actionCountries.includes(cid))
          .forEach((cid) => {
            if (memo.get(cid) && memo.getIn([cid, 'actionsMembers'])) {
              updated = updated.setIn([cid, 'actionsMembers'], memo.getIn([cid, 'actionsMembers']) + 1);
            } else {
              updated = updated.setIn([cid, 'actionsMembers'], 1);
            }
          });
        if (mapSubjectClean === 'actors' && includeActorMembers && total === memo2) {
          total += 1;
        }
      }
      if (hasByTarget) {
        const actionCountriesAsTargets = action.get('targetsByType')
          && action.getIn(['targetsByType', parseInt(ACTORTYPES.COUNTRY, 10)]);
        if (actionCountriesAsTargets) {
          actionCountriesAsTargets.forEach((cid) => {
            if (memo.get(cid) && memo.getIn([cid, 'targetingActions'])) {
              updated = updated.setIn([cid, 'targetingActions'], memo.getIn([cid, 'targetingActions']) + 1);
            } else {
              updated = updated.setIn([cid, 'targetingActions'], 1);
            }
          });
          if (mapSubjectClean === 'targets') {
            total += 1;
          }
        }
        const actionCountriesAsTargetsMembers = action.get('targetsMembersByType')
          && action.getIn(['targetsMembersByType', parseInt(ACTORTYPES.COUNTRY, 10)]);
        if (actionCountriesAsTargetsMembers) {
          actionCountriesAsTargetsMembers
            .filter((cid) => !actionCountriesAsTargets || !actionCountriesAsTargets.includes(cid))
            .forEach((cid) => {
              if (memo.get(cid) && memo.getIn([cid, 'targetingActionsMembers'])) {
                updated = updated.setIn([cid, 'targetingActionsMembers'], memo.getIn([cid, 'targetingActionsMembers']) + 1);
              } else {
                updated = updated.setIn([cid, 'targetingActionsMembers'], 1);
              }
            });
          if (mapSubjectClean === 'targets' && includeTargetMembers && total === memo2) {
            total += 1;
          }
        }
      }
      return [updated, total];
    }, [Map(), 0]);

    reduceCountryAreas = (features) => features.map((feature) => {
      const country = countries.find((e) => qe(e.getIn(['attributes', 'code']), feature.properties.ADM0_A3));
      if (country) {
        const cCounts = countryCounts.get(parseInt(country.get('id'), 10));
        const countActions = (cCounts && cCounts.get('actions')) || 0;
        const countActionsMembers = (cCounts && cCounts.get('actionsMembers')) || 0;
        const countTargetingActions = (cCounts && cCounts.get('targetingActions')) || 0;
        const countTargetingActionsMembers = (cCounts && cCounts.get('targetingActionsMembers')) || 0;
        const actionsTotal = countActions + countActionsMembers;
        const targetingActionsTotal = countTargetingActions + countTargetingActionsMembers;
        let stats;
        if (mapSubjectClean === 'actors') {
          stats = [
            {
              title: `${intl.formatMessage(appMessages.entities[`actions_${typeId}`].plural)}: ${actionsTotal}`,
              values: [
                {
                  label: 'As actor',
                  value: countActions,
                },
                {
                  label: 'As member of intergov. org.',
                  value: countActionsMembers,
                },
              ],
            },
          ];
          // level of support
          // add tooltip stats
          // if (qe(typeId, ACTIONTYPES.EXPRESS)) {
          // }
        } else if (mapSubjectClean === 'targets') {
          stats = [
            {
              title: `${intl.formatMessage(appMessages.entities[`actions_${typeId}`].plural)} as target: ${targetingActionsTotal}`,
              values: [
                {
                  label: 'Targeted directly',
                  value: countTargetingActions,
                },
                {
                  label: 'Targeted as member of region, intergov. org. or class',
                  value: countTargetingActionsMembers,
                },
              ],
            },
          ];
        }
        return {
          ...feature,
          id: country.get('id'),
          attributes: country.get('attributes').toJS(),
          tooltip: {
            id: country.get('id'),
            title: country.getIn(['attributes', 'title']),
            stats,
            isCount: true,
            isCountryData: true,
          },
          values: {
            actions: countActions,
            actionsTotal,
            targetingActions: countTargetingActions,
            targetingActionsTotal,
          },
        };
      }
      return {
        ...feature,
        values: {
          actions: 0,
          actionsTotal: 0,
          targetingActions: 0,
          targetingActionsTotal: 0,
        },
      };
    });
    infoTitle = `No. of ${typeLabels[actionsTotalShowing === 1 ? 'single' : 'plural']} by Country`;
    infoSubTitle = `Showing ${actionsTotalShowing} of ${entities ? entities.size : 0} activities total${hasFilters ? ' (filtered)' : ''}`;
    mapInfo = [{
      id: 'countries',
      title: infoTitle,
      subTitle: infoSubTitle,
      infoOptions,
      subjectOptions,
      indicatorOptions,
      onIndicatorSelect: onSetMapIndicator,
    }];
  }
  return (
    <Styled headerStyle="types" noOverflow>
      <MapContainer
        fullMap
        reduceCountryAreas={reduceCountryAreas}
        typeLabels={typeLabels}
        mapData={{
          typeLabels,
          indicator,
          includeSecondaryMembers: includeActorMembers || includeTargetMembers,
          scrollWheelZoom: true,
          mapSubject: mapSubjectClean,
          hasPointOption: false,
          hasPointOverlay: true,
          valueToStyle: isPositionIndicator
            ? (value) => {
              const pos = ACTION_INDICATOR_SUPPORTLEVELS[value || 0];
              return ({
                fillColor: pos.color,
              });
            }
            : null,
        }}
        onActorClick={(id) => onEntityClick(id, ROUTES.ACTOR)}
        mapInfo={mapInfo}
      />
      {viewOptions && viewOptions.length > 1 && (
        <EntityListViewOptions options={viewOptions} isOnMap />
      )}
    </Styled>
  );
}

EntitiesMapActions.propTypes = {
  entities: PropTypes.instanceOf(List),
  actortypes: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  targettypes: PropTypes.instanceOf(Map),
  countries: PropTypes.instanceOf(Map),
  indicators: PropTypes.instanceOf(Map),
  viewOptions: PropTypes.array,
  // primitive
  typeId: PropTypes.string,
  mapSubject: PropTypes.string,
  mapIndicator: PropTypes.string,
  catQuery: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(List),
  ]),
  onSetMapSubject: PropTypes.func,
  onSetIncludeActorMembers: PropTypes.func,
  includeActorMembers: PropTypes.bool,
  onSetIncludeTargetMembers: PropTypes.func,
  includeTargetMembers: PropTypes.bool,
  hasFilters: PropTypes.bool,
  onEntityClick: PropTypes.func,
  onSetMapIndicator: PropTypes.func,
  onUpdateQuery: PropTypes.func,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state, { typeId, includeActorMembers }) => ({
  countries: qe(typeId, ACTIONTYPES.EXPRESS)
    ? selectActorsWithPositions(state, { includeActorMembers, type: ACTORTYPES.COUNTRY })
    : selectActortypeActors(state, { type: ACTORTYPES.COUNTRY }),
  mapIndicator: selectMapIndicator(state),
  catQuery: selectCategoryQuery(state),
  indicators: qe(typeId, ACTIONTYPES.EXPRESS) ? selectIndicators(state) : null,
});

function mapDispatchToProps(dispatch) {
  return {
    onSetMapIndicator: (value) => dispatch(setMapIndicator(value)),
    onUpdateQuery: (args) => {
      dispatch(updateRouteQuery(args));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(EntitiesMapActions));
