import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Map } from 'immutable';

import styled from 'styled-components';

import {
  Box,
  Text,
  Heading,
  // ResponsiveContext,
} from 'grommet';

import {
  ACTORTYPES,
  ACTION_INDICATOR_SUPPORTLEVELS,
  ROUTES,
  ACTIONTYPES,
} from 'themes/config';

import {
  getIndicatorMainTitle,
  getIndicatorAbbreviation,
  getIndicatorNumber,
} from 'utils/entities';

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
      return [
        ...memo,
        {
          id: `topic_${indicator.get('id')}`,
          type: 'topicPosition',
          indicatorId: indicator.get('id'),
          indicatorCount: indicators.size,
          positions: 'indicatorPositions',
          title,
          mainTitle: getIndicatorMainTitle(indicator.getIn(['attributes', 'title'])),
        },
      ];
    },
    [],
  );
  const reducePreviewItem = (item) => {
    const indicatorsWithSupport = indicators && indicators.reduce(
      (memo, indicator, id) => {
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
            return memo.set(id, result);
          }
          return memo;
        }
        return memo;
      },
      Map(),
    );
    const content = {
      header: {
        aboveTitle: 'Country',
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
                <Box>
                  <EntityListSearch
                    searchQuery={search}
                    onSearch={setSearch}
                    placeholder="Search list by name or code"
                  />
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
  includeActorMembers: PropTypes.bool,
  includeInofficialStatements: PropTypes.bool,
  onUpdateQuery: PropTypes.func,
  onUpdatePath: PropTypes.func,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  indicators: selectIndicators(state),
  includeInofficialStatements: selectIncludeInofficialStatements(state),
  includeActorMembers: selectIncludeActorMembers(state),
  countries: selectCountries(state),
  connections: selectConnections(state),
});

export function mapDispatchToProps(dispatch) {
  return {
    onLoadData: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onSetIncludeActorMembers: (value) => dispatch(setIncludeActorMembers(value)),
    onUpdateQuery: (value) => dispatch(updateRouteQuery(value)),
    onUpdatePath: (path) => dispatch(updatePath(path)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(PositionsList));
