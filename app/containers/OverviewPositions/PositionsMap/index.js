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
} from 'utils/entities';

import {
  loadEntitiesIfNeeded,
  setMapIndicator,
  setIncludeActorMembers,
  updateRouteQuery,
  setPreviewContent,
  updatePath,
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

import { DEPENDENCIES } from './constants';
import { selectIndicatorId } from './selectors';

import QuickFilters from './QuickFilters';
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
  previewItemNo,
  intl,
  onSetPreviewContent,
  onUpdatePath,
}) {
  useEffect(() => {
    // kick off loading of data
    onLoadData();
  }, []);
  useEffect(() => {
    if (dataReady && previewItemNo) {
      const country = countries && countries.get(previewItemNo);
      if (country) {
        const countryIds = countries.keySeq().toArray();
        const countryIndex = countryIds.indexOf(country.get('id'));
        const nextIndex = countryIndex < countryIds.length ? countryIndex + 1 : 0;
        const prevIndex = countryIndex > 0 ? countryIndex - 1 : countryIds.length - 1;

        const currentIndicator = indicators && indicators.get(currentIndicatorId.toString());
        const indicatorPositions = country.getIn(['indicatorPositions', currentIndicatorId.toString()])
          && country.getIn(['indicatorPositions', currentIndicatorId.toString()]);
        const indicatorPosition = indicatorPositions && indicatorPositions.first();
        console.log('indicatorPosition', indicatorPosition && indicatorPosition.toJS())
        const content = {
          header: {
            aboveTitle: 'Country',
            title: country.getIn(['attributes', 'title']),
            code: country.getIn(['attributes', 'code']),
            nextPreviewItem: countryIds[nextIndex],
            prevPreviewItem: countryIds[prevIndex],
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
                id: '0',
                active: includeActorMembers,
                onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
                label: intl.formatMessage(messages.isActorMembers),
              },
              {
                id: '1',
                active: !includeInofficialStatements,
                label: intl.formatMessage(messages.isOfficialFiltered),
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
      }
    } else {
      onSetPreviewContent();
    }
  }, [dataReady, previewItemNo, countries]);

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
          previewItemNo: country.get('id'),
          isPreviewItem: qe(previewItemNo, country.get('id')),
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
        label: getIndicatorMainTitle(indicator.getIn(['attributes', 'title'])),
        onClick: () => onSetMapIndicator(id),
      }));
  const currentIndicator = indicators
    && currentIndicatorId
    && indicators.get(currentIndicatorId.toString());

  const options = [
    {
      id: '0',
      active: includeActorMembers,
      onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
      label: intl.formatMessage(messages.isActorMembers),
    },
    {
      id: '1',
      active: !includeInofficialStatements,
      label: intl.formatMessage(messages.isOfficialFiltered),
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
      <Box
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
        <Box
          direction="column"
          fill="horizontal"
          pad={{ horizontal: 'medium', bottom: 'none' }}
          flex={{ grow: 1, shrink: 1 }}
        >
          <Loading loading={!dataReady} />
          {dataReady && (
            <>
              {size !== 'small' && (
                <Box gap="small" margin={{ vertical: 'small' }}>
                  <MapTitle>
                    {getIndicatorMainTitle(currentIndicator.getIn(['attributes', 'title']))}
                  </MapTitle>
                  {getIndicatorSecondaryTitle(currentIndicator.getIn(['attributes', 'title'])) && (
                    <MapSecondaryTitle>
                      {getIndicatorSecondaryTitle(currentIndicator.getIn(['attributes', 'title']))}
                    </MapSecondaryTitle>
                  )}
                </Box>
              )}
              <MapWrapper>
                <SearchWrapper>
                  <Search
                    options={countries}
                    onSelect={() => { }}
                    placeholder={intl.formatMessage(messages.searchPlaceholder)}
                  />
                </SearchWrapper>
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
                />
              </MapWrapper>
              <QuickFilters
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
            </>
          )}
        </Box>
      </Box>
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
  previewItemNo: PropTypes.string,
  onSetPreviewContent: PropTypes.func,
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
  previewItemNo: selectPreviewQuery(state),
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
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(PositionsMap));
