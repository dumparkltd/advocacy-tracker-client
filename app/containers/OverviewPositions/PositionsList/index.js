import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Map } from 'immutable';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import {
  Box, Text, ResponsiveContext,
} from 'grommet';

import {
  ACTORTYPES,
  ACTION_INDICATOR_SUPPORTLEVELS,
  ROUTES,
  ACTIONTYPES,
  API,
} from 'themes/config';

import qe from 'utils/quasi-equals';
import asArray from 'utils/as-array';
import asList from 'utils/as-list';
import isNumber from 'utils/is-number';
import { isMinSize } from 'utils/responsive';

import {
  getIndicatorMainTitle,
  getIndicatorAbbreviation,
  getEntityTitle,
} from 'utils/entities';

import { sortEntities } from 'utils/sort';

import { getValueFromPositions } from 'containers/EntityListTable/utils';

import {
  loadEntitiesIfNeeded,
  setIncludeActorMembers,
  updateRouteQuery,
  updatePath,
  openNewEntityModal,
} from 'containers/App/actions';
import {
  selectReady,
  selectIndicators,
  selectIncludeActorMembers,
  selectIncludeInofficialStatements,
  selectAssociationTypeQuery,
  selectActorsByType,
  selectLocationQuery,
  selectActortypes,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';
import Loading from 'components/Loading';
import ButtonPrimary from 'components/buttons/ButtonPrimaryNew';
import Dot from 'components/styled/Dot';

import EntityListSearch from 'components/EntityListSearch';
import EntityListTable from 'containers/EntityListTable';

import Card from 'containers/OverviewPositions/Card';
import TitleOnCard from 'containers/OverviewPositions/TitleOnCard';
import TitleAboveCard from 'containers/OverviewPositions/TitleAboveCard';
import Button from 'components/buttons/Button';

import {
  selectConnections,
  selectCountries,
  selectHasFilters,
} from './selectors';
import { DEPENDENCIES } from './constants';

import ComponentOptions from './ComponentOptions';
import FilterDropdown from './FilterDropdown';

import messages from './messages';

const Label = styled(
  (p) => <Text {...p} color="textSecondary" size="xxxsmall" />
)`
  line-height: 24px;
`;

const TitleWrapper = styled(
  (p) => <Box {...p} />
)`
  @media (min-width: ${({ theme }) => theme.breakpointsMin.large}) {
    margin-top: 27px;
  }
`;

const SupportKeyTitle = styled((p) => <Text size="xsmall" {...p} />)`
  font-weight: 600;
`;


const ShowFiltersButton = styled(Button)`
  padding: 0.5em 0;
  text-transform: uppercase;
  font-family: ${({ theme }) => theme.fonts.title};
  text-align: left;
  color: ${palette('link', 0)};
  &:hover {
    color: ${palette('linkHover', 0)};
  }
  @media print {
    display: none;
  }
`;
const SupportKeyItem = styled(
  (p) => (
    <Box
      direction="row"
      align="center"
      gap="4px"
      margin={{ bottom: 'xsmall' }}
      {...p}
    />
  )
)`
  margin-right: 14px;
  &:last-child {
    margin-right: 0;
  }
}}
`;

const prepareDropdownOptions = (entities, query, countries) => entities
  ? sortEntities(
    entities.filter(
      (entity) => !!countries.find(
        (country) => country.get('associations') && !!country.get('associations').find(
          (associationId) => qe(associationId, entity.get('id'))
        )
      )
    ),
    'asc',
    'title',
    null,
    false,
  ).reduce(
    (memo, entity) => ([
      ...memo, {
        title: getEntityTitle(entity),
        id: entity.get('id'),
        active: asArray(query).indexOf(entity.get('id')) > -1,
      },
    ]),
    [],
  )
  : [];

const getActiveSupportLevels = (locationQuery, indicatorId) => {
  const locationQueryValue = locationQuery.get('indicators');
  if (!locationQueryValue) return null;
  const supportLevels = asList(locationQueryValue).reduce(
    (memo, queryValue) => {
      const value = queryValue.split('>')[0];
      if (qe(value, indicatorId)) {
        const levels = queryValue.indexOf('=') > -1
          && queryValue.split('=')[1].split('|');
        return levels ? [...memo, ...levels] : memo;
      }
      return memo;
    },
    [],
  );
  return supportLevels;
};

const filterAvailableLevels = (levelValue, indicatorId, countries) => countries.find(
  (country) => {
    const countryPositions = country.get('indicatorPositions');
    let countrySupportLevel;
    if (countryPositions) {
      countrySupportLevel = getValueFromPositions(countryPositions.get(indicatorId));
    }
    countrySupportLevel = countrySupportLevel || 99;
    return qe(countrySupportLevel, levelValue);
  },
);

const ID = 'positions-list';
export function PositionsList({
  dataReady,
  onLoadData,
  indicators,
  countries,
  onSetIncludeActorMembers,
  includeActorMembers,
  includeInofficialStatements,
  onUpdateQuery,
  intl,
  onUpdatePath,
  connections,
  associationRegionQuery,
  associationGroupQuery,
  actorsByType,
  onUpdateAssociationQuery,
  locationQuery,
  onUpdateColumnFilters,
  actortypes,
  onCreateOption,
  hasFilters,
}) {
  const size = React.useContext(ResponsiveContext);
  const [search, setSearch] = useState('');
  const [showFiltersOnMobile, setShowFiltersOnMobile] = useState(false);
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

  let supportLevels = Object.values(ACTION_INDICATOR_SUPPORTLEVELS)
    .filter((level) => parseInt(level.value, 10) > 0) // exclude 0
    .sort((a, b) => a.order > b.order ? 1 : -1);

  supportLevels = supportLevels
    .map((level) => ({
      ...level,
      label: intl.formatMessage(appMessages.supportlevels[level.value]),
    }));
  const options = [
    {
      id: `${ID}-0`,
      active: includeActorMembers,
      label: intl.formatMessage(appMessages.ui.statementOptions.includeMemberships),
      onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
      queryArg: 'am',
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
      queryArg: 'inofficial',
      inverse: true,
    },
  ];

  const topicColumns = dataReady && indicators && indicators.reduce(
    (memo, indicator) => {
      const title = getIndicatorAbbreviation(indicator.getIn(['attributes', 'title']));
      const id = `topic_${indicator.get('id')}`;
      const activeSupportLevels = getActiveSupportLevels(locationQuery, indicator.get('id'));
      let minSize = 'ms';
      const ref = indicator.getIn(['attributes', 'reference']);
      if (isNumber(ref) && parseInt(ref, 10) < 5) {
        minSize = 'small';
      }
      return [
        ...memo,
        {
          id,
          type: 'topicPosition',
          minSize,
          indicatorId: indicator.get('id'),
          indicatorCount: indicators.size,
          positions: 'indicatorPositions',
          title,
          align: 'center',
          mainTitle: getIndicatorMainTitle(indicator.getIn(['attributes', 'title'])),
          mouseOverTitleSupTitle: intl.formatMessage(appMessages.entities.indicators.single),
          queryArg: 'indicators',
          queryValue: indicator.get('id'),
          queryArgRelated: 'supportlevel_id',
          filterOptions: supportLevels
            .filter((level) => filterAvailableLevels(level.value, indicator.get('id'), countries))
            .map((level) => ({
              ...level,
              active: (activeSupportLevels && activeSupportLevels.length > 0)
                ? !!activeSupportLevels.find((val) => qe(val, level.value))
                : false,
            })),
        },
      ];
    },
    [],
  );
  const reducePreviewItem = ({ id, path, item }) => {
    if (item && qe(item.getIn(['attributes', 'actortype_id']), ACTORTYPES.COUNTRY)) {
      const indicatorsWithSupport = indicators && indicators.reduce(
        (memo, indicator, indicatorId) => {
          const indicatorPositions = item
            && item.get('indicatorPositions')
            && item.getIn([
              'indicatorPositions',
              indicator.get('id'),
            ]);
          if (indicatorPositions) {
            const relPos = indicatorPositions.first();
            const result = relPos && indicator
              .setIn(
                ['supportlevel', item.get('id')],
                relPos.get('supportlevel_id')
              )
              .set(
                'position',
                relPos,
              );
            if (result) {
              return memo.set(indicatorId, result);
            }
            return memo;
          }
          return memo;
        },
        Map(),
      );
      // let countryAssociations;
      // if (item.get('associationsByType') && actorsByType) {
      //   countryAssociations = item.get('associationsByType').reduce(
      //     (memo, association, typeid) => association.reduce((memo2, value) => memo2.setIn(
      //       [typeid, value.toString()], actorsByType.getIn([typeid, value.toString()])
      //     ), memo),
      //     Map()
      //   );
      // }
      // console.log('actortypes', actortypes && actortypes.toJS())
      // console.log('item', item && item.toJS())
      const content = {
        header: {
          aboveTitle: actortypes.getIn(
            [item.getIn(['attributes', 'actortype_id']).toString(), 'attributes', 'title']
          ),
          title: item.getIn(['attributes', 'title']),
          titlePath: `${ROUTES.ACTOR}/${item.get('id')}`,
          code: item.getIn(['attributes', 'code']),
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
                        actor_id: item.get('id'),
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
                        actor_id: item.get('id'),
                      }],
                    },
                  ],
                });
              },
            },
            {
              label: 'Edit',
              path: `${ROUTES.ACTOR}${ROUTES.EDIT}/${item.get('id')}`,
              onClick: (e) => {
                if (e && e.preventDefault) e.preventDefault();
                onUpdatePath(`${ROUTES.ACTOR}${ROUTES.EDIT}/${item.get('id')}`);
              },
            },
          ],
        },
        fields: {
          countryPositions: {
            key: {
              title: 'Levels of support',
              items: supportLevels,
            },
            options,
            countryPositionsTableColumns: [
              {
                id: 'main',
                type: 'main',
                sort: 'title',
                attributes: ['title'],
              },
              {
                id: 'positionStatement',
                type: 'positionStatement',
              },
              {
                id: 'authority',
                type: 'positionStatementAuthority',
              },
              {
                id: 'viaGroups',
                type: 'viaGroups',
              },
              {
                id: 'supportlevel_id',
                type: 'supportlevel',
                title: intl.formatMessage(appMessages.attributes.supportlevel_id),
                align: 'center',
                info: {
                  type: 'key-categorical',
                  attribute: 'supportlevel_id',
                  options: Object.values(ACTION_INDICATOR_SUPPORTLEVELS)
                    .sort((a, b) => a.order < b.order ? -1 : 1)
                    .map((level) => ({
                      ...level,
                      label: intl.formatMessage(appMessages.supportlevels[level.value]),
                    })),
                },
              },
            ],
            entityTitle: {
              single: intl.formatMessage(appMessages.entities.indicators.single),
              plural: intl.formatMessage(appMessages.entities.indicators.plural),
            },
            indicators: indicatorsWithSupport,
          },
          users: {
            title: 'Assigned staff',
            columnId: 'users',
          },
          groups: {
            columnId: 'associations',
            type: ACTORTYPES.GROUP,
            title: 'Groups',
          },
          regions: {
            columnId: 'associations',
            type: ACTORTYPES.REG,
            title: 'Regions',
          },
          [`actions_${ACTIONTYPES.EXPRESS}`]: {
            columnId: `actions_${ACTIONTYPES.EXPRESS}`,
          },
          [`actions_${ACTIONTYPES.INTERACTION}`]: {
            columnId: `actions_${ACTIONTYPES.INTERACTION}`,
          },
        },
        footer: {
          primaryLink: item && {
            path: `${ROUTES.ACTOR}/${item.get('id')}`,
            title: 'Country details',
          },
          secondaryLink: {
            path: ROUTES.INDICATORS,
            title: 'All topics',
          },
        },
      };
      return content;
    }
    if (id && path) {
      return { entity: { path, id } };
    }
    return {};
  };
  const countriesFilteredByColumn = countries && countries.filter(
    (country) => typeof country.get('passTopicPositionFilter') === 'undefined'
      || country.get('passTopicPositionFilter')
  );
  return (
    <Box pad={{ top: 'small', bottom: 'xsmall' }}>
      <Box>
        <TitleAboveCard>
          <FormattedMessage {...messages.title} />
        </TitleAboveCard>
      </Box>
      {!dataReady && <Loading loading={!dataReady} />}
      {dataReady && (
        <Card>
          <Box
            direction="column"
            fill="horizontal"
            pad={{ top: 'medium', horizontal: 'medium', bottom: 'none' }}
            flex={{ grow: 1, shrink: 1 }}
          >
            <Box gap="small">
              <Box
                direction={isMinSize(size, 'large') ? 'row' : 'column'}
                gap={isMinSize(size, 'medium') ? 'none' : 'small'}
                justify="between"
                margin={{ bottom: isMinSize(size, 'medium') ? 'medium' : 'small' }}
              >
                <TitleWrapper>
                  <TitleOnCard>
                    Countries
                  </TitleOnCard>
                </TitleWrapper>
                <Box direction={isMinSize(size, 'medium') ? 'row' : 'column'} gap="small">
                  {isMinSize(size, 'medium') && (
                    <FilterDropdown
                      options={prepareDropdownOptions(
                        actorsByType.get(parseInt(ACTORTYPES.REG, 10)),
                        associationRegionQuery,
                        countriesFilteredByColumn,
                      )}
                      onClear={() => onUpdateAssociationQuery({ type: ACTORTYPES.REG })}
                      onSelect={(id) => onUpdateAssociationQuery({ value: id, type: ACTORTYPES.REG })}
                      label="Filter by region"
                      buttonLabel="Select region"
                    />
                  )}
                  {isMinSize(size, 'medium') && (
                    <FilterDropdown
                      options={prepareDropdownOptions(
                        actorsByType.get(parseInt(ACTORTYPES.GROUP, 10)),
                        associationGroupQuery,
                        countriesFilteredByColumn,
                      )}
                      onClear={() => onUpdateAssociationQuery({ type: ACTORTYPES.GROUP })}
                      onSelect={(id) => onUpdateAssociationQuery({ value: id, type: ACTORTYPES.GROUP })}
                      label="Filter by group"
                      buttonLabel="Select group"
                    />
                  )}
                  <Box>
                    <Label>Filter by name or code</Label>
                    <EntityListSearch
                      searchQuery={search}
                      onSearch={setSearch}
                      placeholder="Enter name or code"
                    />
                  </Box>
                  {!isMinSize(size, 'medium') && showFiltersOnMobile && (
                    <FilterDropdown
                      options={prepareDropdownOptions(
                        actorsByType.get(parseInt(ACTORTYPES.REG, 10)),
                        associationRegionQuery,
                        countriesFilteredByColumn,
                      )}
                      onClear={() => onUpdateAssociationQuery({ type: ACTORTYPES.REG })}
                      onSelect={(id) => onUpdateAssociationQuery({ value: id, type: ACTORTYPES.REG })}
                      label="Filter by region"
                      buttonLabel="Select region"
                    />
                  )}
                  {!isMinSize(size, 'medium') && showFiltersOnMobile && (
                    <FilterDropdown
                      options={prepareDropdownOptions(
                        actorsByType.get(parseInt(ACTORTYPES.GROUP, 10)),
                        associationGroupQuery,
                        countriesFilteredByColumn,
                      )}
                      onClear={() => onUpdateAssociationQuery({ type: ACTORTYPES.GROUP })}
                      onSelect={(id) => onUpdateAssociationQuery({ value: id, type: ACTORTYPES.GROUP })}
                      label="Filter by group"
                      buttonLabel="Select group"
                    />
                  )}
                  {!isMinSize(size, 'medium') && (
                    <ShowFiltersButton
                      onClick={() => setShowFiltersOnMobile(!showFiltersOnMobile)}
                    >
                      {showFiltersOnMobile && (
                        <span>Hide filter options</span>
                      )}
                      {!showFiltersOnMobile && (
                        <span>Show filter options</span>
                      )}
                    </ShowFiltersButton>
                  )}
                </Box>
              </Box>
              <Box
                direction={isMinSize(size, 'medium') ? 'row' : 'column'}
                justify={isMinSize(size, 'medium') ? 'between' : 'start'}
                gap={isMinSize(size, 'medium') ? 'medium' : 'small'}
                responsive={false}
                align="start"
              >
                <Box gap="xsmall">
                  <SupportKeyTitle>Levels of support</SupportKeyTitle>
                  <Box direction="row" wrap>
                    {supportLevels && supportLevels.map((level) => (
                      <SupportKeyItem
                        key={level.value}
                      >
                        <Dot size="10px" color={level.color} />
                        <Text size="xxsmall" color="textSecondary">{level.label}</Text>
                      </SupportKeyItem>
                    ))}
                  </Box>
                </Box>
                <ComponentOptions
                  size={size}
                  options={options}
                  onUpdateQuery={onUpdateQuery}
                />
              </Box>
              <Box height={isMinSize(size, 'medium') ? { min: '500px' } : null}>
                <EntityListTable
                  entityPath={ROUTES.ACTOR}
                  hasFilters={hasFilters}
                  reducePreviewItem={reducePreviewItem}
                  onUpdateColumnFilters={(...args) => onUpdateColumnFilters(...args, locationQuery)}
                  columns={[
                    {
                      id: 'main',
                      type: 'main',
                      sort: 'title',
                      attributes: ['title'],
                    },
                    {
                      id: 'users',
                      type: 'users',
                      isSingleActionColumn: false,
                      minSize: 'large',
                    },
                    {
                      id: 'associations',
                      type: 'associations',
                      actors: 'associationsByType',
                      isSingleActionColumn: false,
                      minSize: 'large',
                      title: 'Part of',
                    },
                    {
                      id: `action_${ACTIONTYPES.EXPRESS}`,
                      type: 'actiontype',
                      actiontype_id: ACTIONTYPES.EXPRESS,
                      actions: 'actionsByType',
                      actionsMembers: 'actionsAsMemberByType',
                      actionsChildren: 'actionsAsParentByType',
                      isSingleActionColumn: false,
                      minSize: 'medium',
                      simple: true,
                    },
                    {
                      id: `action_${ACTIONTYPES.INTERACTION}`,
                      type: 'actiontype',
                      actiontype_id: ACTIONTYPES.INTERACTION,
                      actions: 'actionsByType',
                      actionsMembers: 'actionsAsMemberByType',
                      actionsChildren: 'actionsAsParentByType',
                      isSingleActionColumn: false,
                      minSize: 'xlarge',
                      simple: true,
                    },
                    ...topicColumns,
                  ]}
                  entityTitle={{
                    single: 'Country',
                    plural: 'Countries',
                  }}
                  options={{
                    paginate: true,
                    paginateOptions: false,
                    pageSize: 10,
                    search,
                    includeMembers: includeActorMembers,
                  }}
                  config={{
                    views: { list: { search: ['title', 'code'] } },
                  }}
                  entities={countriesFilteredByColumn.toList()}
                  connections={connections}
                />
              </Box>
              <Box
                direction="row"
                justify="end"
                pad={{ top: 'small' }}
                gap="none"
              >
                <ButtonPrimary
                  onClick={(e) => {
                    if (e && e.preventDefault) e.preventDefault();
                    onUpdatePath(`${ROUTES.ACTORS}/${ACTORTYPES.COUNTRY}`);
                  }}
                >
                  <Text size="large">
                    Full Country List
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

PositionsList.propTypes = {
  dataReady: PropTypes.bool,
  onLoadData: PropTypes.func.isRequired,
  countries: PropTypes.object,
  connections: PropTypes.object,
  indicators: PropTypes.object,
  onSetIncludeActorMembers: PropTypes.func,
  onUpdateAssociationQuery: PropTypes.func,
  includeActorMembers: PropTypes.bool,
  includeInofficialStatements: PropTypes.bool,
  onUpdateQuery: PropTypes.func,
  onUpdatePath: PropTypes.func,
  onUpdateColumnFilters: PropTypes.func,
  associationRegionQuery: PropTypes.string,
  associationGroupQuery: PropTypes.string,
  actorsByType: PropTypes.object, // immutable Map
  locationQuery: PropTypes.object, // immutable Map
  actortypes: PropTypes.object, // immutable Map
  onCreateOption: PropTypes.func,
  hasFilters: PropTypes.bool,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  indicators: selectIndicators(state),
  includeInofficialStatements: selectIncludeInofficialStatements(state),
  includeActorMembers: selectIncludeActorMembers(state),
  countries: selectCountries(state),
  connections: selectConnections(state),
  associationRegionQuery: selectAssociationTypeQuery(state, { typeId: ACTORTYPES.REG }),
  associationGroupQuery: selectAssociationTypeQuery(state, { typeId: ACTORTYPES.GROUP }),
  actorsByType: selectActorsByType(state),
  locationQuery: selectLocationQuery(state),
  actortypes: selectActortypes(state),
  hasFilters: selectHasFilters(state),
});

export function mapDispatchToProps(dispatch) {
  return {
    onLoadData: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onSetIncludeActorMembers: (value) => dispatch(setIncludeActorMembers(value)),
    onUpdateQuery: (value) => dispatch(updateRouteQuery(value)),
    onUpdatePath: (path) => dispatch(updatePath(path)),
    onCreateOption: (args) => dispatch(openNewEntityModal(args)),
    onUpdateColumnFilters: ({
      column, addToFilters, removeFromFilters,
    }, locationQuery) => {
      const indicatorQueryList = asList(locationQuery.get('indicators'));
      const currentFilterForColumn = indicatorQueryList.find((query) => {
        const indicatorQuery = query && query.split('>')[0];
        return qe(indicatorQuery, column.indicatorId);
      });
      // update column filter
      if (currentFilterForColumn) {
        const currentLevels = currentFilterForColumn.split('=')[1]
          && currentFilterForColumn.split('=')[1].split('|');
        let updatedLevels = [];
        if (currentLevels && addToFilters && addToFilters.length > 0) {
          updatedLevels = [...currentLevels, ...addToFilters];
        }
        if (currentLevels && removeFromFilters && removeFromFilters.length > 0) {
          updatedLevels = currentLevels.filter(
            (level) => removeFromFilters.indexOf(level) === -1
          );
        }
        if (updatedLevels && updatedLevels.length > 0) {
          const newValue = `${column.indicatorId}>supportlevel_id=${updatedLevels.join('|')}`;
          dispatch(updateRouteQuery({
            arg: 'indicators',
            value: newValue,
            prevValue: currentFilterForColumn,
            replace: true,
          }));
        } else {
          dispatch(updateRouteQuery({
            arg: 'indicators',
            value: currentFilterForColumn,
            remove: true,
            add: false,
          }));
        }
      // add new column filter
      } else if (addToFilters) {
        const newValue = `${column.indicatorId}>supportlevel_id=${addToFilters.join('|')}`;
        dispatch(updateRouteQuery({
          arg: 'indicators',
          value: newValue,
          remove: false,
          add: true,
        }));
      }
    },
    onUpdateAssociationQuery: ({ value, type }) => {
      if (!value) {
        dispatch(updateRouteQuery({
          arg: `by-association-${type}`,
          value: null,
          remove: true,
          replace: true,
          multipleAttributeValues: false,
        }));
      } else {
        dispatch(updateRouteQuery({
          arg: `by-association-${type}`,
          value,
          replace: true,
          multipleAttributeValues: false,
        }));
      }
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(PositionsList));
