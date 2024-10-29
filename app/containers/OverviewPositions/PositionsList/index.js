import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Map } from 'immutable';
import { palette } from 'styled-theme';
import styled from 'styled-components';

import { Box, Text, Heading } from 'grommet';

import {
  ACTORTYPES,
  ACTION_INDICATOR_SUPPORTLEVELS,
  ROUTES,
  ACTIONTYPES,
} from 'themes/config';

import qe from 'utils/quasi-equals';
import asArray from 'utils/as-array';
import asList from 'utils/as-list';

import {
  getIndicatorMainTitle,
  getIndicatorAbbreviation,
  getIndicatorNumber,
  getEntityTitle,
} from 'utils/entities';

import { sortEntities } from 'utils/sort';

import {
  loadEntitiesIfNeeded,
  setIncludeActorMembers,
  updateRouteQuery,
  updatePath,
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
import Card from 'containers/OverviewPositions/Card';
import EntityListTable from 'containers/EntityListTable';

import {
  selectCountries,
  selectConnections,
} from './selectors';
import { DEPENDENCIES } from './constants';

import ComponentOptions from './ComponentOptions';
import FilterDropdown from './FilterDropdown';

import messages from './messages';

const ComponentTitle = styled((p) => <Heading level="3" {...p} />)`
  color: black;
  font-weight: bold;
  margin: 0;
`;
const Title = styled((p) => <Heading level="5" {...p} />)`
  color: black;
  text-transform: uppercase;
  font-weight: bold;
`;
const Label = styled.span`
  color: ${palette('dark', 2)};
  font-size: ${({ theme }) => theme.text.xsmall.size};
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
}) {
  const [search, setSearch] = useState('');
  useEffect(() => {
    // kick off loading of data
    onLoadData();
  }, []);
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

  const topicColumns = dataReady && indicators && indicators.reduce(
    (memo, indicator) => {
      const no = getIndicatorNumber(indicator.getIn(['attributes', 'title']));
      const abbrev = getIndicatorAbbreviation(indicator.getIn(['attributes', 'title']));
      const title = no ? `${no}.${abbrev}` : abbrev;
      const id = `topic_${indicator.get('id')}`;
      const activeSupportLevels = getActiveSupportLevels(locationQuery, indicator.get('id'));
      return [
        ...memo,
        {
          id,
          type: 'topicPosition',
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
          filterOptions: supportLevels.map((level) => ({
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
      let countryAssociations;
      if (item.get('associationsByType') && actorsByType) {
        countryAssociations = item.get('associationsByType').reduce(
          (memo, association, typeid) => association.reduce((memo2, value) => memo2.setIn(
            [typeid, value.toString()], actorsByType.getIn([typeid, value.toString()])
          ), memo),
          Map()
        );
      }
      const content = {
        header: {
          aboveTitle: actortypes.getIn(
            [item.getIn(['attributes', 'actortype_id']).toString(), 'attributes', 'title']
          ),
          title: item.getIn(['attributes', 'title']),
          code: item.getIn(['attributes', 'code']),
        },
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
            },
          ],
          entityTitle: {
            single: intl.formatMessage(appMessages.entities.indicators.single),
            plural: intl.formatMessage(appMessages.entities.indicators.plural),
          },
          indicators: indicatorsWithSupport,
          countryAssociations,
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

  return (
    <Box pad={{ top: 'small', bottom: 'xsmall' }}>
      <Box pad={{ top: 'small', bottom: 'xsmall' }}>
        <Title>
          <FormattedMessage {...messages.title} />
        </Title>
      </Box>
      <Card>
        <Box
          direction="column"
          fill="horizontal"
          pad={{ top: 'medium', horizontal: 'medium', bottom: 'none' }}
          flex={{ grow: 1, shrink: 1 }}
        >
          <Loading loading={!dataReady} />
          {dataReady && (
            <Box gap="small">
              <Box direction="row" justify="between">
                <Box gap="small" margin={{ vertical: 'small' }}>
                  <ComponentTitle>
                    Countries
                  </ComponentTitle>
                </Box>
                <Box direction="row" gap="small">
                  <FilterDropdown
                    options={prepareDropdownOptions(
                      actorsByType.get(parseInt(ACTORTYPES.REG, 10)),
                      associationRegionQuery,
                      countries,
                    )}
                    onClear={() => onUpdateAssociationQuery({ type: ACTORTYPES.REG })}
                    onSelect={(id) => onUpdateAssociationQuery({ value: id, type: ACTORTYPES.REG })}
                    label="Filter by region"
                    buttonLabel="Select region"
                  />
                  <FilterDropdown
                    options={prepareDropdownOptions(
                      actorsByType.get(parseInt(ACTORTYPES.GROUP, 10)),
                      associationGroupQuery,
                      countries,
                    )}
                    onClear={() => onUpdateAssociationQuery({ type: ACTORTYPES.GROUP })}
                    onSelect={(id) => onUpdateAssociationQuery({ value: id, type: ACTORTYPES.GROUP })}
                    label="Filter by group"
                    buttonLabel="Select group"
                  />
                  <Box>
                    <Label>Filter by name or code</Label>
                    <EntityListSearch
                      searchQuery={search}
                      onSearch={setSearch}
                      placeholder="Enter name or code"
                    />
                  </Box>
                </Box>
              </Box>
              <Box
                direction="row"
                justify="between"
                gap="small"
                align="end"
              >
                <Box gap="xsmall">
                  <Text weight={600}>Levels of support</Text>
                  <Box direction="row" wrap gap="xsmall">
                    {supportLevels && supportLevels.map((level) => (
                      <Box key={level.value} direction="row" align="center" gap="xsmall">
                        <Dot size="16px" color={level.color} />
                        <Text size="small">{level.label}</Text>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <ComponentOptions
                  options={options}
                  onUpdateQuery={onUpdateQuery}
                />
              </Box>
              <Box>
                <EntityListTable
                  entityPath={ROUTES.ACTOR}
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
                      id: `action_${ACTIONTYPES.EXPRESS}`,
                      type: 'actiontype',
                      actiontype_id: ACTIONTYPES.EXPRESS,
                      actions: 'actionsByType',
                      actionsMembers: 'actionsAsMemberByType',
                      actionsChildren: 'actionsAsParentByType',
                      isSingleActionColumn: false,
                    },
                    {
                      id: `action_${ACTIONTYPES.INTERACTION}`,
                      type: 'actiontype',
                      actiontype_id: ACTIONTYPES.INTERACTION,
                      actions: 'actionsByType',
                      actionsMembers: 'actionsAsMemberByType',
                      actionsChildren: 'actionsAsParentByType',
                      isSingleActionColumn: false,
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
                  entities={countries.toList()}
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
                  label={(
                    <Text size="large">
                      Full Country List
                    </Text>
                  )}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Card>
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
});

export function mapDispatchToProps(dispatch) {
  return {
    onLoadData: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onSetIncludeActorMembers: (value) => dispatch(setIncludeActorMembers(value)),
    onUpdateQuery: (value) => dispatch(updateRouteQuery(value)),
    onUpdatePath: (path) => dispatch(updatePath(path)),
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
