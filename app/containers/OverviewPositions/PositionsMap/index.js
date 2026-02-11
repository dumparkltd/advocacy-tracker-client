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
  ResponsiveContext,
} from 'grommet';

import {
  ACTORTYPES,
  ACTION_INDICATOR_SUPPORTLEVELS,
  ACTIONTYPES,
  ROUTES,
  API,
} from 'themes/config';
import qe from 'utils/quasi-equals';
import asList from 'utils/as-list';
import isDate from 'utils/is-date';
import {
  getIndicatorMainTitle,
  getIndicatorSecondaryTitle,
} from 'utils/entities';
import { isMinSize } from 'utils/responsive';

import {
  loadEntitiesIfNeeded,
  setMapIndicator,
  setIncludeActorMembers,
  updateRouteQuery,
  setPreviewContent,
  updatePath,
  setListPreview,
  openNewEntityModal,
} from 'containers/App/actions';

import {
  selectReady,
  selectIndicators,
  selectActorsWithPositions,
  selectIncludeActorMembers,
  selectIncludeInofficialStatements,
  selectIncludeUnpublishedAPIStatements,
  selectSupportQuery,
  selectPreviewQuery,
  selectLocationQuery,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';
import Loading from 'components/Loading';
import SelectIndicators from 'components/SelectIndicators';
import Icon from 'components/Icon';
import MapContainer from 'containers/MapContainer';
import ButtonPrimary from 'components/buttons/ButtonPrimaryNew';
import ButtonSecondary from 'components/buttons/ButtonSecondaryNew';
import Button from 'components/buttons/ButtonSimple';

import Card from 'containers/OverviewPositions/Card';
import TitleOnCard from 'containers/OverviewPositions/TitleOnCard';
import TitleAboveCard from 'containers/OverviewPositions/TitleAboveCard';

import { DEPENDENCIES } from './constants';
import { selectIndicatorId } from './selectors';

import ComponentOptions from './ComponentOptions';
import Search from './Search';

import messages from './messages';

const IndicatorSidePanel = styled((p) => <Box {...p} />)`
  border-right: 1px solid ${palette('light', 2)};
  width: 200px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.large}) {
   width: 325px;
  }
  @media (min-width: ${({ theme }) => theme.breakpointsMin.xlarge}) {
   width: 350px;
  }
`;
const IndicatorList = styled((p) => <Box {...p} />)`
  border-top: 1px solid ${palette('light', 2)};
`;
const IndicatorPanelHeader = styled(
  (p) => <Box justify="center" pad={{ horizontal: 'small' }} {...p} />
)`
  position: relative;
  min-height: 45px;
`;
const IndicatorSelectButton = styled((p) => <Button {...p} />)`
  border-bottom: 1px solid ${palette('light', 2)};
  min-height: 45px;
  width: 100%;
  color: ${({ active }) => active ? 'white' : 'black'};
  cursor: ${({ active }) => active ? 'default' : 'pointer'};
  position: relative;
  padding: ${({ theme }) => theme.global.edgeSize.small};
  &:focus {
    outline: none;
    box-shadow: none;
  }
  &:focus-visible {
    color: ${({ active, theme }) => active
    ? 'white'
    : theme.global.colors.highlight
};
    background-color: ${({ active, theme }) => active
    ? theme.global.colors.highlight
    : 'white'
};
  }
  &:hover {
    color: ${({ active, theme }) => active
    ? 'white'
    : theme.global.colors.highlight
};
  }
  /* extra width at the start and background for selected item */
  &::before {
    display: ${({ active }) => (active ? 'block' : 'none')};
    position: absolute;
    content: '';
    top: 0;
    left: -5px;
    bottom: 0;
    right: 0;
    background: ${palette('primary', 1)};
    box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.2);
  }
  /* arrow at the end for selected item */
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
const IndicatorListTitle = styled((p) => <Text size="xxxsmall" {...p} />)`
  color: ${({ theme }) => theme.global.colors.textSecondary};
`;
const IndicatorLabel = styled((p) => <Text size="small" weight={500} {...p} />)`
  position: relative;
  z-index: 1;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

`;
const MapWrapper = styled((p) => <Box {...p} />)`
  position: relative;
`;
const SearchWrapper = styled((p) => <Box {...p} />)`
  width: 100%;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    width: ${({ theme }) => theme.sizes.mapSearchBar.width}px;
  }
`;

const MapSecondaryTitle = styled((p) => <Text {...p} />)`
  margin: 0;
  color: black;
  font-weight: 600;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    font-size: 16px;
    line-height: 18px;
  }
`;

const ID = 'positions-map';

export function PositionsMap({
  indicators,
  countries,
  currentIndicatorId,
  onSetMapIndicator,
  onSetIncludeActorMembers,
  includeActorMembers,
  includeInofficialStatements,
  includeUnpublishedAPIStatements,
  supportQuery,
  onUpdateQuery,
  onLoadData,
  dataReady,
  previewItemId,
  intl,
  onSetPreviewContent,
  onSetPreviewItemId,
  onUpdatePath,
  locationQuery,
  onCreateOption,
}) {
  useEffect(() => {
    // kick off loading of data
    onLoadData();
  }, []);
  useEffect(() => {
    // also kick off loading of data again once dataReady changes and becomes negative again
    // required due to possible in-view creation of activities
    if (!dataReady) {
      onLoadData();
    }
  }, [dataReady]);

  const currentIndicator = indicators
    && currentIndicatorId
    && indicators.get(currentIndicatorId.toString());
  const isAggregate = currentIndicator && currentIndicator.getIn(['attributes', 'is_parent']);
  useEffect(() => {
    if (dataReady) {
      if (previewItemId) {
        const [componentId, countryId] = previewItemId.split('|');
        if (qe(componentId, ID)) {
          const country = countries && countryId && countries.get(countryId);
          if (country) {
            const countryIds = countries.keySeq().toArray();
            const countryIndex = countryIds.indexOf(country.get('id'));
            const nextIndex = countryIndex < countryIds.length && countryIds.length > 1 ? countryIndex + 1 : 0;
            const prevIndex = countryIndex > 0 ? countryIndex - 1 : countryIds.length - 1;

            const indicatorPositions = country.getIn(['indicatorPositions', currentIndicatorId.toString()])
              && country.getIn(['indicatorPositions', currentIndicatorId.toString()]);
            const indicatorPosition = indicatorPositions && indicatorPositions.first();

            const content = {
              item: country,
              header: {
                aboveTitle: 'Country',
                title: country.getIn(['attributes', 'title']),
                titlePath: `${ROUTES.ACTOR}/${country.get('id')}`,
                largeTitle: true,
                code: country.getIn(['attributes', 'code']),
                nextPreviewItem: `${ID}|${countryIds[nextIndex]}`,
                prevPreviewItem: `${ID}|${countryIds[prevIndex]}`,
                topActions: [
                  {
                    label: `Add ${intl.formatMessage(appMessages.entities[`actions_${ACTIONTYPES.EXPRESS}`].single)}`,
                    path: `${ROUTES.ACTIONS}/${ACTIONTYPES.EXPRESS}${ROUTES.NEW}`,
                    type: 'create',
                    onClick: (e) => {
                      if (e && e.preventDefault) e.preventDefault();
                      onCreateOption({
                        path: API.ACTIONS,
                        attributes: {
                          measuretype_id: ACTIONTYPES.EXPRESS,
                        },
                        invalidateEntitiesOnSuccess: [API.ACTORS, API.ACTIONS],
                        autoUser: true,
                        connect: [
                          {
                            type: 'actorActions',
                            create: [{
                              actor_id: country.get('id'),
                            }],
                          },
                          {
                            type: 'actorIndicators',
                            create: [{
                              indicator_id: currentIndicator.get('id'),
                            }],
                          },
                        ],
                      });
                    },
                  },
                  {
                    label: `Add ${intl.formatMessage(appMessages.entities[`actions_${ACTIONTYPES.INTERACTION}`].single)}`,
                    path: `${ROUTES.ACTIONS}/${ACTIONTYPES.INTERACTION}${ROUTES.NEW}`,
                    type: 'create',
                    onClick: (e) => {
                      if (e && e.preventDefault) e.preventDefault();
                      onCreateOption({
                        path: API.ACTIONS,
                        attributes: {
                          measuretype_id: ACTIONTYPES.INTERACTION,
                        },
                        invalidateEntitiesOnSuccess: [API.ACTORS, API.ACTIONS],
                        autoUser: true,
                        connect: [
                          {
                            type: 'actorActions',
                            create: [{
                              actor_id: country.get('id'),
                            }],
                          },
                        ],
                      });
                    },
                  },
                  {
                    label: 'Edit',
                    path: `${ROUTES.ACTOR}${ROUTES.EDIT}/${country.get('id')}`,
                    onClick: (e) => {
                      if (e && e.preventDefault) e.preventDefault();
                      onUpdatePath(`${ROUTES.ACTOR}${ROUTES.EDIT}/${country.get('id')}`);
                    },
                  },
                ],
              },
              footer: {
                primaryLink: {
                  path: `${ROUTES.ACTOR}/${country.get('id')}`,
                  title: 'Country details',
                },
                secondaryLink: currentIndicator && {
                  path: `${ROUTES.INDICATOR}/${currentIndicator.get('id')}`,
                  id: currentIndicator.get('id'),
                  title: getIndicatorMainTitle(currentIndicator.getIn(['attributes', 'title'])),
                },
              },
              fields: {
                topicPosition: {
                  topicId: currentIndicatorId,
                  topic: currentIndicator && {
                    title: getIndicatorMainTitle(currentIndicator.getIn(['attributes', 'title'])),
                    titlePath: `${ROUTES.INDICATOR}/${currentIndicator.get('id')}`,
                  },
                  position: indicatorPosition ? {
                    supportlevelId: indicatorPosition.get('supportlevel_id'),
                    supportlevelTitle: isAggregate && appMessages.supportlevelsAggregate[indicatorPosition.get('supportlevel_id')]
                      ? intl.formatMessage(appMessages.supportlevelsAggregate[indicatorPosition.get('supportlevel_id')])
                      : intl.formatMessage(appMessages.supportlevels[indicatorPosition.get('supportlevel_id')]),
                    levelOfAuthority: !isAggregate && intl.formatMessage(
                      indicatorPosition.getIn(['measure', 'is_official'])
                        ? appMessages.ui.officialStatuses.official
                        : appMessages.ui.officialStatuses.inofficial,
                    ),
                  } : {
                    supportlevelId: 0,
                    supportlevelTitle: isAggregate && appMessages.supportlevelsAggregate[99]
                      ? intl.formatMessage(appMessages.supportlevelsAggregate[99])
                      : intl.formatMessage(appMessages.supportlevels[99]),
                  },
                  options: [
                    {
                      id: `${ID}-preview-0`,
                      active: includeActorMembers,
                      label: intl.formatMessage(appMessages.ui.statementOptions.includeMemberships),
                      onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
                    },
                    {
                      id: `${ID}-preview-1`,
                      active: !includeInofficialStatements,
                      label: intl.formatMessage(appMessages.ui.statementOptions.excludeInofficial),
                      onClick: () => onUpdateQuery([{
                        arg: 'inofficial',
                        value: includeInofficialStatements ? 'false' : null,
                        replace: true,
                        multipleAttributeValues: false,
                      }]),
                    },
                    {
                      id: `${ID}-preview-2`,
                      active: !includeUnpublishedAPIStatements,
                      label: intl.formatMessage(appMessages.ui.statementOptions.excludeUnpublishedAPI),
                      onClick: () => onUpdateQuery([{
                        arg: 'unpublishedAPI',
                        value: includeUnpublishedAPIStatements ? 'false' : null,
                        replace: true,
                        multipleAttributeValues: false,
                      }]),
                    },
                  ],
                },
                topicStatements: indicatorPositions && !isAggregate && {
                  indicatorPositionsTableColumns: [
                    {
                      id: 'position',
                      type: 'position',
                      title: intl.formatMessage(appMessages.attributes.supportlevel_id),
                      width: '15%',
                      align: 'center',
                      info: {
                        type: 'key-categorical',
                        attribute: 'supportlevel_id',
                        options: Object.values(ACTION_INDICATOR_SUPPORTLEVELS)
                          .sort((a, b) => a.order < b.order ? -1 : 1)
                          .map((level) => {
                            const label = isAggregate && appMessages.supportlevelsAggregate[level.value]
                              ? intl.formatMessage(appMessages.supportlevelsAggregate[level.value])
                              : intl.formatMessage(appMessages.supportlevels[level.value]);
                            return { ...level, label };
                          }),
                      },
                    },
                    {
                      id: 'statement',
                      type: 'plainWithDate',
                      label: 'Statement',
                      width: '35%',
                    },
                    {
                      id: 'levelOfAuthority',
                      type: 'plain',
                      label: 'Level of authority',
                    },
                    {
                      id: 'viaGroup',
                      type: 'plain',
                      label: 'As member of',
                    },
                  ],
                  indicatorPositions: indicatorPositions.reduce((memo, position) => {
                    const statement = position.get('measure');
                    let date;
                    if (statement) {
                      date = statement.get('date_start');
                      if (date && isDate(date)) {
                        date = intl.formatDate(date);
                      } else if (statement.get('created_at') && isDate(statement.get('created_at'))) {
                        date = intl.formatDate(statement.get('created_at'));
                      }
                    }
                    const supportLevel = position.get('supportlevel_id') || 0;

                    return ([
                      ...memo,
                      {
                        position: {
                          color: ACTION_INDICATOR_SUPPORTLEVELS[supportLevel]
                            && ACTION_INDICATOR_SUPPORTLEVELS[supportLevel].color,
                          value: appMessages.supportlevels[supportLevel]
                            && intl.formatMessage(appMessages.supportlevels[supportLevel]),
                        },
                        statement: statement && {
                          // id: statement.get('id'),
                          date,
                          value: statement.get('title'),
                          path: `${ROUTES.ACTION}/${statement.get('id')}`,
                        },
                        levelOfAuthority: position && {
                          value: statement && intl.formatMessage(
                            statement.get('is_official')
                              ? appMessages.ui.officialStatuses.official
                              : appMessages.ui.officialStatuses.inofficial
                          ),
                        },
                        is_parent: isAggregate,
                        viaGroup: {
                          value: position.get('viaGroups')
                            && position.get('viaGroups').first()
                            ? position.get('viaGroups').first().getIn(['attributes', 'title'])
                            : '',
                          path: position.get('viaGroups')
                            && position.get('viaGroups').first()
                            && `${ROUTES.ACTOR}/${position.get('viaGroups').first().get('id')}`,
                        },
                      },
                    ]);
                  }, []),
                },
                actorUsers: {
                  title: 'Assigned staff',
                },
                groups: {
                  type: 'associations',
                  actortype: ACTORTYPES.REG,
                  title: 'Groups',
                },
                associations: {
                  actortype: ACTORTYPES.REG,
                  title: 'Regions',
                },
              },
            };
            onSetPreviewContent(content);
          } else {
            onSetPreviewContent();
          }
        }
      } else {
        onSetPreviewContent();
      }
    }
  }, [dataReady, previewItemId, countries, locationQuery]);

  const size = React.useContext(ResponsiveContext);

  const supportQueryAsList = supportQuery
    ? asList(supportQuery)
    : List([]);

  const countryValues = dataReady && countries.reduce(
    (memo, country) => {
      const countryPosition = country.get('indicatorPositions')
        && country.getIn(['indicatorPositions', currentIndicatorId.toString()])
        && country.getIn(['indicatorPositions', currentIndicatorId.toString()]).first();

      // const statement = countryPosition && countryPosition.get('measure');
      const level = countryPosition
        && parseInt(countryPosition.get('supportlevel_id'), 10);
      return [
        ...memo,
        {
          id: country.get('id'),
          previewItemId: `${ID}|${country.get('id')}`,
          attributes: country.get('attributes').toJS(),
          values: { [currentIndicatorId]: level || 0 },
        },
      ];
    },
    [],
  );
  const reduceCountryAreas = (features) => features.reduce((memo, feature) => {
    const country = countryValues.find((c) => qe(c.attributes.code, feature.properties.ADM0_A3 || feature.properties.code));
    if (country) {
      return [
        ...memo,
        {
          ...feature,
          ...country,
        },
      ];
    }
    return memo;
  }, []);

  const typeLabels = {
    single: intl.formatMessage(appMessages.entities[`actions_${ACTIONTYPES.EXPRESS}`].single),
    plural: intl.formatMessage(appMessages.entities[`actions_${ACTIONTYPES.EXPRESS}`].plural),
  };

  const supportLevels = dataReady && Object.values(ACTION_INDICATOR_SUPPORTLEVELS)
    .filter(
      (level) => parseInt(level.value, 10) > 0
        && parseInt(level.value, 10) < 99
        && (!isAggregate || level.aggregate)
    ) // exclude 0
    .sort((a, b) => a.order > b.order ? 1 : -1)
    .map((level) => {
      const count = countryValues
        ? countryValues.filter(
          (c) => c.values && c.values[currentIndicatorId] && qe(level.value, c.values[currentIndicatorId])
        ).length
        : 0;
      const label = isAggregate && appMessages.supportlevelsAggregate[level.value]
        ? intl.formatMessage(appMessages.supportlevelsAggregate[level.value])
        : intl.formatMessage(appMessages.supportlevels[level.value]);
      return {
        ...level,
        active: supportQuery
          && supportQueryAsList.includes(level.value),
        label: `${label} (${count})`,
        disabled: !count,
        count,
      };
    });

  let options = [
    {
      id: `${ID}-0`,
      active: includeActorMembers,
      label: intl.formatMessage(appMessages.ui.statementOptions.includeMemberships),
      onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
    },
    {
      id: `${ID}-1`,
      active: !includeInofficialStatements,
      label: intl.formatMessage(appMessages.ui.statementOptions.excludeInofficial),
      onClick: () => onUpdateQuery([{
        arg: 'inofficial',
        value: includeInofficialStatements ? 'false' : null,
        replace: true,
        multipleAttributeValues: false,
      }]),
    },
  ];
  let hasPublicAPI = currentIndicator && currentIndicator.getIn(['attributes', 'public_api']);
  // if parent and not directly published, check potential children
  if (!hasPublicAPI && currentIndicator && currentIndicator.getIn(['attributes', 'is_parent']) && indicators) {
    hasPublicAPI = indicators.some(
      (indicator) => indicator.getIn(['attributes', 'public_api']) && qe(indicator.getIn(['attributes', 'parent_id']), currentIndicatorId)
    );
  }
  if (currentIndicator && hasPublicAPI) {
    options = [
      ...options,
      {
        id: `${ID}-2`,
        active: !includeUnpublishedAPIStatements,
        label: intl.formatMessage(appMessages.ui.statementOptions.excludeUnpublishedAPI),
        onClick: () => onUpdateQuery([{
          arg: 'unpublishedAPI',
          value: includeUnpublishedAPIStatements ? 'false' : null,
          replace: true,
          multipleAttributeValues: false,
        }]),
      },
    ];
  }
  return (
    <Box pad={{ top: 'small', bottom: 'xsmall' }}>
      <Box>
        <TitleAboveCard>
          <FormattedMessage {...messages.title} />
        </TitleAboveCard>
      </Box>
      {!dataReady && <Loading loading={!dataReady} />}
      {dataReady && currentIndicator && (
        <Card>
          <Box direction={isMinSize(size, 'medium') ? 'row' : 'column'}>
            {isMinSize(size, 'medium') && (
              <IndicatorSidePanel>
                <IndicatorPanelHeader>
                  <IndicatorListTitle>
                    <FormattedMessage {...messages.indicatorListTitle} />
                  </IndicatorListTitle>
                </IndicatorPanelHeader>
                <IndicatorList>
                  {indicators && indicators.valueSeq().map((indicator) => {
                    const active = qe(currentIndicatorId, indicator.get('id'));
                    const label = getIndicatorMainTitle(indicator.getIn(['attributes', 'title']));
                    return (
                      <IndicatorSelectButton
                        active={active}
                        key={indicator.get('id')}
                        onClick={() => onSetMapIndicator(indicator.get('id'))}
                        title={label}
                      >
                        <IndicatorLabel active={active}>
                          {label}
                        </IndicatorLabel>
                      </IndicatorSelectButton>
                    );
                  })}
                </IndicatorList>
              </IndicatorSidePanel>
            )}
            {!isMinSize(size, 'medium') && indicators && (
              <Box pad="medium" margin={{ top: 'small' }}>
                <SelectIndicators
                  config={{
                    onIndicatorSelect: (id) => onSetMapIndicator(id),
                    indicatorOptions: indicators.reduce((memo, indicator) => ([
                      ...memo,
                      {
                        value: indicator.get('id'),
                        active: qe(currentIndicatorId, indicator.get('id')),
                        label: getIndicatorMainTitle(indicator.getIn(['attributes', 'title'])),
                      },
                    ]), []),
                    dropAlign: {
                      top: 'bottom',
                      left: 'left',
                    },
                  }}
                />
              </Box>
            )}
            <Box
              direction="column"
              fill="horizontal"
              pad={{ top: isMinSize(size, 'medium') ? '42px' : 'xsmall', horizontal: 'medium', bottom: 'none' }}
              flex={{ grow: 1, shrink: 1 }}
            >
              <Box
                direction="row"
                fill="horizontal"
                justify="between"
                margin={{ bottom: isMinSize(size, 'medium') ? 'small' : '15px' }}
              >
                {isMinSize(size, 'medium') && (
                  <Box pad={{ top: '5px' }}>
                    <TitleOnCard>
                      {getIndicatorMainTitle(currentIndicator.getIn(['attributes', 'title']))}
                    </TitleOnCard>
                    <MapSecondaryTitle>
                      {getIndicatorSecondaryTitle(currentIndicator.getIn(['attributes', 'title'])) || '$nbsp;'}
                    </MapSecondaryTitle>
                  </Box>
                )}
                <SearchWrapper>
                  <Search
                    options={countries}
                    onSelect={(countryId) => onSetPreviewItemId(`${ID}|${countryId}`)}
                    placeholder={intl.formatMessage(messages.searchPlaceholder)}
                  />
                </SearchWrapper>
              </Box>
              <MapWrapper>
                <MapContainer
                  isOverviewMap
                  reduceCountryAreas={reduceCountryAreas}
                  typeLabels={typeLabels}
                  mapData={{
                    fitBounds: false,
                    fitBoundsOnce: true,
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
                    previewContainerId: ID,
                  }}
                />
              </MapWrapper>
              <ComponentOptions
                supportLevels={supportLevels}
                options={options}
                onUpdateQuery={onUpdateQuery}
              />
              <Box
                direction="row"
                justify="end"
                pad={{ top: 'small' }}
                gap="none"
              >
                <ButtonSecondary
                  gap="none"
                  justify="center"
                  onClick={(e) => {
                    if (e && e.preventDefault) e.preventDefault();
                    onUpdatePath(ROUTES.INDICATORS);
                  }}
                >
                  <Box direction="row" align="center">
                    <Text size="large" style={{ marginTop: '-2px' }}>
                      {intl.formatMessage(messages.allTopics)}
                    </Text>
                    <Icon
                      name="arrowRight"
                      size="10px"
                      palette="primary"
                      paletteIndex={1}
                      hasStroke
                    />
                  </Box>
                </ButtonSecondary>
                <ButtonPrimary
                  onClick={(e) => {
                    if (e && e.preventDefault) e.preventDefault();
                    onUpdatePath(`${ROUTES.INDICATOR}/${currentIndicatorId}`);
                  }}
                >
                  <Text size="large">
                    {isMinSize(size, 'medium')
                      && indicators
                      && currentIndicatorId
                      && getIndicatorMainTitle(currentIndicator.getIn(['attributes', 'title']))}
                    {!isMinSize(size, 'medium')
                      && indicators
                      && currentIndicatorId
                      && 'Go to topic'
                    }
                  </Text>
                </ButtonPrimary>
              </Box>
            </Box>
          </Box>
        </Card>
      )}
    </Box>
  );
}

PositionsMap.propTypes = {
  dataReady: PropTypes.bool,
  onLoadData: PropTypes.func.isRequired,
  onSetMapIndicator: PropTypes.func,
  onSetIncludeActorMembers: PropTypes.func,
  countries: PropTypes.object,
  onUpdateQuery: PropTypes.func,
  supportQuery: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(List),
  ]),
  includeActorMembers: PropTypes.bool,
  includeInofficialStatements: PropTypes.bool,
  includeUnpublishedAPIStatements: PropTypes.bool,
  currentIndicatorId: PropTypes.number,
  indicators: PropTypes.object,
  locationQuery: PropTypes.object,
  previewItemId: PropTypes.string,
  onSetPreviewContent: PropTypes.func,
  onSetPreviewItemId: PropTypes.func,
  onUpdatePath: PropTypes.func,
  onCreateOption: PropTypes.func,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  indicators: selectIndicators(state),
  currentIndicatorId: selectIndicatorId(state),
  includeInofficialStatements: selectIncludeInofficialStatements(state),
  includeUnpublishedAPIStatements: selectIncludeUnpublishedAPIStatements(state),
  supportQuery: selectSupportQuery(state),
  includeActorMembers: selectIncludeActorMembers(state),
  countries: selectActorsWithPositions(state, { type: ACTORTYPES.COUNTRY }),
  previewItemId: selectPreviewQuery(state),
  locationQuery: selectLocationQuery(state),
});

export function mapDispatchToProps(dispatch) {
  return {
    onLoadData: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onSetMapIndicator: (value) => dispatch(setMapIndicator(value)),
    onSetIncludeActorMembers: (value) => dispatch(setIncludeActorMembers(value)),
    onUpdateQuery: (value) => dispatch(updateRouteQuery(value)),
    onSetPreviewContent: (value) => dispatch(setPreviewContent(value)),
    onUpdatePath: (path) => dispatch(updatePath(path)),
    onSetPreviewItemId: (value) => dispatch(setListPreview(value)),
    onCreateOption: (args) => dispatch(openNewEntityModal(args)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(PositionsMap));
