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
  ACTION_INDICATOR_SUPPORTLEVELS,
  ACTIONTYPES,
  ROUTES,
} from 'themes/config';
import qe from 'utils/quasi-equals';
import asList from 'utils/as-list';
import isDate from 'utils/is-date';
import {
  getIndicatorMainTitle,
  getIndicatorShortTitle,
  getIndicatorSecondaryTitle,
  getIndicatorNiceTitle,
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
} from 'containers/App/actions';

import {
  selectReady,
  selectIndicators,
  selectActorsWithPositions,
  selectIncludeActorMembers,
  selectIncludeInofficialStatements,
  selectSupportQuery,
  selectPreviewQuery,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';
import Loading from 'components/Loading';
import MapContainer from 'containers/MapContainer';
import SelectIndicators from 'containers/MapContainer/MapInfoOptions/SelectIndicators';
import Icon from 'components/Icon';
import ButtonPrimary from 'components/buttons/ButtonPrimaryNew';
import ButtonSecondary from 'components/buttons/ButtonSecondaryNew';

import Card from 'containers/OverviewPositions/Card';

import { DEPENDENCIES } from './constants';
import { selectIndicatorId } from './selectors';

import ComponentOptions from './ComponentOptions';
import Search from './Search';

import messages from './messages';

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
const IndicatorList = styled((p) => <Box {...p} />)`
  border-top: 1px solid ${palette('light', 2)};
`;
const IndicatorPanelHeader = styled((p) => <Box {...p} />)`
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
const IndicatorLabel = styled((p) => <Text size="small" weight={600} {...p} />)`
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
  width: ${({ theme }) => theme.sizes.mapSearchBar.width}px;
`;
const MapTitle = styled((p) => <Heading level="3" {...p} />)`
  color: black;
  font-weight: bold;
  margin: 0;
`;
const Title = styled((p) => <Heading level="5" {...p} />)`
  color: black;
  text-transform: uppercase;
  font-weight: bold;
`;
const MapSecondaryTitle = styled((p) => <Text size="large" {...p} />)`
  margin: 0;
  color: black;
  font-weight: bold;
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
  supportQuery,
  onUpdateQuery,
  onLoadData,
  dataReady,
  previewItemId,
  intl,
  onSetPreviewContent,
  onSetPreviewItemId,
  onUpdatePath,
}) {
  useEffect(() => {
    // kick off loading of data
    onLoadData();
  }, []);
  useEffect(() => {
    if (dataReady) {
      if (previewItemId) {
        const [componentId, countryId] = previewItemId.split('|');
        if (qe(componentId, ID)) {
          const country = countries && countryId && countries.get(countryId);
          if (country) {
            const countryIds = countries.keySeq().toArray();
            const countryIndex = countryIds.indexOf(country.get('id'));
            const nextIndex = countryIndex < countryIds.length ? countryIndex + 1 : 0;
            const prevIndex = countryIndex > 0 ? countryIndex - 1 : countryIds.length - 1;

            const currentIndicator = indicators && indicators.get(currentIndicatorId.toString());
            const indicatorPositions = country.getIn(['indicatorPositions', currentIndicatorId.toString()])
              && country.getIn(['indicatorPositions', currentIndicatorId.toString()]);
            const indicatorPosition = indicatorPositions && indicatorPositions.first();
            const content = {
              header: {
                aboveTitle: 'Country',
                title: country.getIn(['attributes', 'title']),
                code: country.getIn(['attributes', 'code']),
                nextPreviewItem: `${ID}|${countryIds[nextIndex]}`,
                prevPreviewItem: `${ID}|${countryIds[prevIndex]}`,
              },
              topicPosition: {
                topicId: currentIndicatorId,
                topic: currentIndicator && {
                  title: getIndicatorShortTitle(currentIndicator.getIn(['attributes', 'title'])),
                  viaGroup: indicatorPosition && indicatorPosition.get('viaGroups')
                  && indicatorPosition.get('viaGroups').first()
                  && indicatorPosition.get('viaGroups').first().getIn(['attributes', 'title']),
                },
                position: indicatorPosition ? {
                  supportlevelId: indicatorPosition.get('supportlevel_id'),
                  supportlevelTitle: intl.formatMessage(appMessages.supportlevels[indicatorPosition.get('supportlevel_id')]),
                  levelOfAuthority: indicatorPosition.getIn(['authority', 'short_title']),
                } : {
                  supportlevelId: 0,
                  supportlevelTitle: intl.formatMessage(appMessages.supportlevels[99]),
                },
              },
              topicStatements: indicatorPositions && {
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
                ],
                indicatorPositionsTableColumns: [
                  {
                    id: 'position',
                    type: 'position',
                    label: 'Level of support',
                  },
                  {
                    id: 'statement',
                    type: 'plainWithDate',
                    label: 'Statement',
                  },
                  {
                    id: 'levelOfAuthority',
                    type: 'plain',
                    label: 'Level of authority',
                  },
                  {
                    id: 'viaGroup',
                    type: 'plain',
                    label: 'As Member of',
                  },
                ],
                indicatorPositions: indicatorPositions.reduce((memo, position) => {
                  const statement = position.get('measure');
                  let date = statement.get('date_start');
                  if (date && isDate(date)) {
                    date = intl.formatDate(date);
                  } else if (statement.get('created_at') && isDate(statement.get('created_at'))) {
                    date = intl.formatDate(statement.get('created_at'));
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
                      },
                      levelOfAuthority: position && {
                        value: position.getIn(['authority', 'short_title']),
                      },
                      viaGroup: {
                        value: position.get('viaGroups')
                          && position.get('viaGroups').first()
                          ? position.get('viaGroups').first().getIn(['attributes', 'title'])
                          : '',
                      },
                    },
                  ]);
                }, []),
              },
              footer: {
                primaryLink: country && {
                  path: `${ROUTES.ACTOR}/${country.get('id')}`,
                  title: 'Country details',
                },
                secondaryLink: currentIndicator && {
                  path: `${ROUTES.INDICATOR}/${currentIndicator.get('id')}`,
                  id: currentIndicator.get('id'),
                  title: getIndicatorShortTitle(currentIndicator.getIn(['attributes', 'title'])),
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
  }, [dataReady, previewItemId, countries]);

  const size = React.useContext(ResponsiveContext);

  const supportQueryAsList = supportQuery
    ? asList(supportQuery)
    : List([]);
  const reduceCountryAreas = (features) => features.reduce((memo, feature) => {
    const country = countries.find((e) => qe(e.getIn(['attributes', 'code']), feature.properties.ADM0_A3 || feature.properties.code));
    if (country) {
      const countryPosition = country.get('indicatorPositions')
        && country.getIn(['indicatorPositions', currentIndicatorId.toString()])
        && country.getIn(['indicatorPositions', currentIndicatorId.toString()]).first();

      const statement = countryPosition && countryPosition.get('measure');
      const level = countryPosition
        && parseInt(countryPosition.get('supportlevel_id'), 10);

      return [
        ...memo,
        {
          ...feature,
          id: country.get('id'),
          previewItemId: `${ID}|${country.get('id')}`,
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
    .filter((level) => parseInt(level.value, 10) > 0 && parseInt(level.value, 10) < 99) // exclude 0
    .sort((a, b) => a.order > b.order ? 1 : -1);

  supportLevels = supportLevels
    .map((level) => ({
      ...level,
      active: supportQuery
        && supportQueryAsList.includes(level.value),
      label: intl.formatMessage(appMessages.supportlevels[level.value]),
    }));

  const currentIndicator = indicators
    && currentIndicatorId
    && indicators.get(currentIndicatorId.toString());

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
  return (
    <Box pad={{ top: 'small', bottom: 'xsmall' }}>
      <Box pad={{ top: 'small', bottom: 'xsmall' }}>
        <Title>
          <FormattedMessage {...messages.title} />
        </Title>
      </Box>
      <Card>
        <Loading loading={!dataReady} />
        {dataReady && (
          <Box direction={isMinSize(size, 'medium') ? 'row' : 'column'}>
            {isMinSize(size, 'medium') && (
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
                  {indicators && indicators.valueSeq().map((indicator) => {
                    const active = qe(currentIndicatorId, indicator.get('id'));
                    const label = getIndicatorNiceTitle(indicator.getIn(['attributes', 'title']));
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
              <Box pad="small">
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
              pad={{ horizontal: 'medium', bottom: 'none' }}
              flex={{ grow: 1, shrink: 1 }}
            >
              <Box direction="row" fill="horizontal" justify="between" margin={{ vertical: 'small' }}>
                {isMinSize(size, 'medium') && (
                  <Box gap="small">
                    <MapTitle>
                      {getIndicatorNiceTitle(currentIndicator.getIn(['attributes', 'title']))}
                    </MapTitle>
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
                  label={(
                    <Text size="large">
                      {indicators
                        && currentIndicatorId
                        && getIndicatorShortTitle(currentIndicator.getIn(['attributes', 'title']))}
                    </Text>
                  )}
                />
              </Box>
            </Box>
          </Box>
        )}
      </Card>
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
  currentIndicatorId: PropTypes.number,
  indicators: PropTypes.object,
  previewItemId: PropTypes.string,
  onSetPreviewContent: PropTypes.func,
  onSetPreviewItemId: PropTypes.func,
  onUpdatePath: PropTypes.func,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  indicators: selectIndicators(state),
  currentIndicatorId: selectIndicatorId(state),
  includeInofficialStatements: selectIncludeInofficialStatements(state),
  supportQuery: selectSupportQuery(state),
  includeActorMembers: selectIncludeActorMembers(state),
  countries: selectActorsWithPositions(state, { type: ACTORTYPES.COUNTRY }),
  previewItemId: selectPreviewQuery(state),
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
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(PositionsMap));
