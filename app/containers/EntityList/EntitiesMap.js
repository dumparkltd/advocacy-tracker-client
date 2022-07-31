/*
 *
 * EntitiesMap
 *
 */
import React from 'react';
import { injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { Box, Text } from 'grommet';
// import { FormattedMessage } from 'react-intl';

import {
  ACTORTYPES,
  ROUTES,
  ACTIONTYPES,
  ACTION_INDICATOR_SUPPORTLEVELS,
} from 'themes/config';

import {
  selectActors,
  selectActions,
  selectActortypeActors,
  selectCountriesWithPositions,
  selectActionActorsGroupedByAction,
  selectActorActionsGroupedByAction,
  selectMembershipsGroupedByAssociation,
  selectMapIndicator,
} from 'containers/App/selectors';

import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import Loading from 'components/Loading';
import EntityListViewOptions from 'components/EntityListViewOptions';

import appMessages from 'containers/App/messages';
import qe from 'utils/quasi-equals';
import { hasGroupActors } from 'utils/entities';
import MapContainer from 'containers/MapContainer';
// import messages from './messages';

const LoadingWrap = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background: white;
  z-index: 999;
  pointer-events: none;
  background: none;
`;

const Styled = styled(ContainerWrapper)`
  background: white;
`;

export function EntitiesMap({
  dataReady,
  viewOptions,
  config,
  entities,
  actortypes,
  actiontypes,
  targettypes,
  typeId,
  mapSubject,
  mapIndicator,
  onSetMapSubject,
  onSetIncludeActorMembers,
  onSetIncludeTargetMembers,
  includeActorMembers,
  includeTargetMembers,
  countries,
  actors,
  actions,
  onEntityClick,
  intl,
  hasFilters,
  actionActorsByAction,
  membershipsByAssociation,
  actorActionsByAction,
  // connections,
  // connectedTaxonomies,
  // locationQuery,
  // taxonomies,
}) {
  // const { intl } = this.context;
  // let { countries } = this.props;
  let type;
  let hasByTarget;
  let hasActions;
  let subjectOptions = [];
  let memberOption;
  let typeLabels;
  let typeLabelsFor;
  let indicator = includeActorMembers ? 'actionsTotal' : 'actions';
  let actionsTotalShowing;
  let infoTitle;
  let infoSubTitle;
  let reduceCountryAreas;
  let reducePoints;
  let mapSubjectClean = mapSubject || 'actors';
  const entitiesTotal = entities ? entities.size : 0;

  if (dataReady) {
    // actors ===================================================
    if (config.types === 'actortypes') {
      type = actortypes.find((at) => qe(at.get('id'), typeId));
      hasByTarget = type.getIn(['attributes', 'is_target']);
      hasActions = type.getIn(['attributes', 'is_active']);
      if (hasByTarget) { // ie countries & groups
        if (mapSubjectClean === 'targets') {
          indicator = includeTargetMembers ? 'targetingActionsTotal' : 'targetingActions';
        }
        subjectOptions = [
          {
            title: 'As actors',
            onClick: () => onSetMapSubject('actors'),
            active: mapSubjectClean === 'actors',
            disabled: mapSubjectClean === 'actors',
          },
          {
            title: 'As targets',
            onClick: () => onSetMapSubject('targets'),
            active: mapSubjectClean === 'targets',
            disabled: mapSubjectClean === 'targets',
          },
        ];
        if (mapSubjectClean === 'targets') {
          // note this should always be true!
          memberOption = {
            active: includeTargetMembers,
            onClick: () => onSetIncludeTargetMembers(includeTargetMembers ? '0' : '1'),
            label: 'Include activities targeting regions and groups (countries belong to)',
          };
        } else if (hasGroupActors(actortypes)) {
          memberOption = {
            active: includeActorMembers,
            onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
            label: 'Include activities of groups (countries belong to)',
          };
        }
      } else if (hasActions && !hasByTarget) { // i.e. institutions
        // showing targeted countries
        mapSubjectClean = 'targets';
        memberOption = {
          active: includeTargetMembers,
          onClick: () => onSetIncludeTargetMembers(includeTargetMembers ? '0' : '1'),
          label: 'Include activities targeting regions and groups (countries belong to)',
        };
      // } else if (!hasActions && hasByTarget) { // i.e. regions, classes
      //   mapSubjectClean = 'targets';
      //   memberOption = {
      //     active: includeActorMembers,
      //     onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
      //     label: 'Include activities of groups (countries belong to)',
      //   };
      } else { // i.e. groups
        mapSubjectClean = 'targets';
        memberOption = {
          active: includeTargetMembers,
          onClick: () => onSetIncludeTargetMembers(includeTargetMembers ? '0' : '1'),
          label: 'Include activities targeting regions and groups (countries belong to)',
        };
      }

      // entities are filtered countries
      if (qe(typeId, ACTORTYPES.COUNTRY)) {
        // entities are filtered countries
        // actions are stored with each country
        typeLabels = {
          plural: intl.formatMessage(appMessages.entities.actions.plural),
          single: intl.formatMessage(appMessages.entities.actions.single),
        };
        typeLabelsFor = {
          single: intl.formatMessage(appMessages.entities[`actors_${typeId}`].single),
          plural: intl.formatMessage(appMessages.entities[`actors_${typeId}`].plural),
        };
        reduceCountryAreas = (features) => features.map((feature) => {
          const country = entities.find((e) => qe(e.getIn(['attributes', 'code']), feature.properties.ADM0_A3));
          if (country) {
            const countActions = country.get('actions')
              ? country.get('actions').toSet().size
              : 0;
            const countActionsMembers = country.get('actionsAsMembers')
              ? country.get('actionsAsMembers').filter(
                (actionId) => !country.get('actions').includes(actionId)
              ).toSet().size
              : 0;
            const countTargetingActions = country.get('targetingActions')
              ? country.get('targetingActions').toSet().size
              : 0;
            const countTargetingActionsMembers = country.get('targetingActionsAsMember')
              ? country.get('targetingActionsAsMember').filter(
                (actionId) => !country.get('targetingActions').includes(actionId)
              ).toSet().size
              : 0;
            const actionsTotal = countActions + countActionsMembers;
            const targetingActionsTotal = countTargetingActions + countTargetingActionsMembers;
            let stats;
            if (mapSubjectClean === 'actors') {
              stats = [
                {
                  title: `${intl.formatMessage(appMessages.entities.actions.plural)}: ${actionsTotal}`,
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
            } else if (mapSubjectClean === 'targets') {
              stats = [
                {
                  title: `${intl.formatMessage(appMessages.entities.actions.plural)} as target: ${targetingActionsTotal}`,
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
        infoTitle = typeLabels.plural;
        infoSubTitle = `for ${entitiesTotal} ${typeLabelsFor[entitiesTotal === 1 ? 'single' : 'plural']}${hasFilters ? ' (filtered)' : ''}`;
      } else if (hasActions) {
        // entities are orgs
        // figure out action ids for each country
        let countryActionIds = Map();
        countryActionIds = actionActorsByAction && entities.reduce(
          (memo, actor) => {
            if (actor.get('actions')) {
              return actor.get('actions').reduce(
                (memo2, actionId) => {
                  const action = actions.find((a) => qe(a.get('id'), actionId));
                  if (action) {
                    const actionTypeId = action.getIn(['attributes', 'measuretype_id']);
                    const actionType = actiontypes.find((t) => qe(t.get('id'), actionTypeId));
                    let targetIds;
                    if (actionType.getIn(['attributes', 'has_target'])) {
                      targetIds = actionActorsByAction.get(actionId);
                    } else {
                      targetIds = actorActionsByAction.get(actionId); // actually actors
                    }
                    if (targetIds) {
                      return targetIds.reduce(
                        (memo3, targetId) => {
                          const target = actors.get(targetId.toString());
                          if (target) {
                            const targetTypeId = target.getIn(['attributes', 'actortype_id']);
                            const targetType = actortypes.find((t) => qe(t.get('id'), targetTypeId));
                            if (qe(targetTypeId, ACTORTYPES.COUNTRY)) {
                              if (memo3.getIn([targetId, 'targetingActions'])) {
                                if (!memo3.getIn([targetId, 'targetingActions']).includes(actionId)) {
                                  return memo3.setIn(
                                    [targetId, 'targetingActions'],
                                    memo3.getIn([targetId, 'targetingActions']).push(actionId),
                                  );
                                }
                                return memo3;
                              }
                              return memo3.setIn([targetId, 'targetingActions'], List([actionId]));
                            }
                            // include countries via group-actors
                            if (membershipsByAssociation && targetType.getIn(['attributes', 'has_members'])) {
                              const targetMembers = membershipsByAssociation.get(targetId);
                              if (targetMembers) {
                                return targetMembers.reduce(
                                  (memo4, countryId) => {
                                    const country = countries.get(countryId.toString());
                                    if (country) {
                                      if (memo4.getIn([countryId, 'targetingActionsMember'])) {
                                        if (!memo4.getIn([countryId, 'targetingActionsMember']).includes(actionId)) {
                                          return memo4.setIn(
                                            [countryId, 'targetingActionsMember'],
                                            memo4.getIn([countryId, 'targetingActionsMember']).push(actionId),
                                          );
                                        }
                                        return memo4;
                                      }
                                      return memo4.setIn([countryId, 'targetingActionsMember'], List([actionId]));
                                    }
                                    return memo4;
                                  },
                                  memo3,
                                );
                              }
                              return memo3;
                            }
                            return memo3;
                          }
                          return memo3;
                        },
                        memo2,
                      );
                    }
                    return memo2;
                  }
                  return memo2;
                },
                memo,
              );
            }
            return memo;
          },
          countryActionIds,
        );
        reduceCountryAreas = (features) => features.map((feature) => {
          const country = countries.find((e) => qe(e.getIn(['attributes', 'code']), feature.properties.ADM0_A3));
          if (country) {
            const actionIds = countryActionIds && countryActionIds.get(parseInt(country.get('id'), 10));
            const countTargetingActions = actionIds && actionIds.get('targetingActions')
              ? actionIds.get('targetingActions').size
              : 0;
            const countTargetingActionsMember = actionIds && actionIds.get('targetingActionsMember')
              ? actionIds.get('targetingActionsMember').size
              : 0;
            const targetingActionsTotal = countTargetingActions + countTargetingActionsMember;
            const stats = [
              {
                title: `${intl.formatMessage(appMessages.entities.actions.plural)} as target: ${targetingActionsTotal}`,
                values: [
                  {
                    label: 'Targeted directly',
                    value: countTargetingActions,
                  },
                  {
                    label: 'Targeted as member of region, intergov. org. or class',
                    value: countTargetingActionsMember,
                  },
                ],
              },
            ];
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
                targetingActions: countTargetingActions,
                targetingActionsTotal,
              },
            };
          }
          return {
            ...feature,
            values: {
              targetingActions: 0,
              targetingActionsTotal: 0,
            },
          };
        });
        indicator = includeTargetMembers ? 'targetingActionsTotal' : 'targetingActions';
        const countriesTotal = countryActionIds ? countryActionIds.size : 0;
        typeLabels = {
          plural: `${intl.formatMessage(appMessages.entities.actions.plural)} of ${entitiesTotal} ${intl.formatMessage(appMessages.entities[`actors_${typeId}`].plural)}`,
          single: `${intl.formatMessage(appMessages.entities.actions.single)} of ${entitiesTotal} ${intl.formatMessage(appMessages.entities[`actors_${typeId}`].plural)}`,
        };
        typeLabelsFor = {
          single: intl.formatMessage(appMessages.entities[`actors_${ACTORTYPES.COUNTRY}`].single),
          plural: intl.formatMessage(appMessages.entities[`actors_${ACTORTYPES.COUNTRY}`].plural),
        };
        infoTitle = `${typeLabels.plural}${hasFilters ? ' (filtered)' : ''}`;
        infoSubTitle = `targeting ${countriesTotal} ${typeLabelsFor[countriesTotal === 1 ? 'single' : 'plural']}`;
      }

    // actions ===================================================
    } else if (config.types === 'actiontypes') {
      typeLabels = {
        single: intl.formatMessage(appMessages.entities[`actions_${typeId}`].single),
        plural: intl.formatMessage(appMessages.entities[`actions_${typeId}`].plural),
      };
      type = actiontypes.find((at) => qe(at.get('id'), typeId));
      hasByTarget = type.getIn(['attributes', 'has_target']);
      hasActions = qe(typeId, ACTIONTYPES.EXPRESS)
        || qe(typeId, ACTIONTYPES.INTERACTION)
        || qe(typeId, ACTIONTYPES.EVENT);
      if (hasActions) {
        subjectOptions = [
          {
            title: qe(ACTIONTYPES.DONOR, typeId) ? 'By donor' : 'By actor',
            onClick: () => onSetMapSubject('actors'),
            active: mapSubjectClean === 'actors',
            disabled: mapSubjectClean === 'actors',
          },
        ];
      }
      if (hasByTarget) {
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
      } else {
        mapSubjectClean = 'actors';
      }
      if (mapSubjectClean === 'targets') {
        // note this should always be true!
        if (hasGroupActors(targettypes)) {
          memberOption = {
            active: includeTargetMembers,
            onClick: () => onSetIncludeTargetMembers(includeTargetMembers ? '0' : '1'),
            label: 'Include activities targeting regions and groups (countries belong to)',
          };
        }
      } else if (hasGroupActors(actortypes)) {
        memberOption = {
          active: includeActorMembers,
          onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
          label: 'Include activities of groups (countries belong to)',
        };
      }

      const isPositionIndicator = qe(typeId, ACTIONTYPES.EXPRESS)
        && typeof mapIndicator !== 'undefined'
        && mapIndicator !== null;
      if (isPositionIndicator) {
        indicator = null;
      }
      // entities are filtered actions
      let countryCounts = null;
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
          if (isPositionIndicator) {
            const countryPositions = country.getIn(['indicatorPositions', mapIndicator.toString()]);
            const countryPosition = countryPositions && countryPositions.first();
            const level = countryPosition && parseInt(countryPosition.get('supportlevel_id'), 10);
            const statement = countryPosition && countryPosition.get('measure');
            const position = ACTION_INDICATOR_SUPPORTLEVELS[level || 0];
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
                      <Text size="xsmall">
                        {`Statement: ${statement.get('title')}`}
                      </Text>
                    )}
                  </Box>
                ),
              },
              style: {
                fillColor: position.color,
              },
            };
            //
          }
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
    }
  }

  return (
    <Styled headerStyle="types" noOverflow>
      <MapContainer
        fullMap
        reduceCountryAreas={reduceCountryAreas}
        reducePoints={reducePoints}
        typeLabels={typeLabels}
        mapData={{
          typeLabels,
          indicator,
          includeSecondaryMembers: includeActorMembers || includeTargetMembers,
          scrollWheelZoom: true,
          mapSubject: mapSubjectClean,
          hasPointOption: false,
          hasPointOverlay: true,
        }}
        onActorClick={(id) => onEntityClick(id, ROUTES.ACTOR)}
        mapInfo={[{
          id: 'countries',
          tabTitle: 'Activities',
          title: infoTitle,
          subTitle: infoSubTitle,
          subjectOptions,
          memberOption,
        }]}
      />
      {!dataReady && (
        <LoadingWrap>
          <Loading />
        </LoadingWrap>
      )}
      {viewOptions && viewOptions.length > 1 && (
        <EntityListViewOptions options={viewOptions} isOnMap />
      )}
    </Styled>
  );
}

// {dataReady && (
//   <MapInfoOptions
//   config={{
//     title: infoTitle,
//     subTitle: infoSubTitle,
//     subjectOptions: hasByTarget && subjectOptions,
//     memberOption,
//     maxValue,
//   }}
//   mapSubject={mapSubjectClean}
//   />
// )}
EntitiesMap.propTypes = {
  config: PropTypes.object,
  entities: PropTypes.instanceOf(List),
  actors: PropTypes.instanceOf(Map),
  actions: PropTypes.instanceOf(Map),
  // connections: PropTypes.instanceOf(Map),
  actortypes: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  targettypes: PropTypes.instanceOf(Map),
  countries: PropTypes.instanceOf(Map),
  actionActorsByAction: PropTypes.instanceOf(Map),
  actorActionsByAction: PropTypes.instanceOf(Map),
  membershipsByAssociation: PropTypes.instanceOf(Map),
  // taxonomies: PropTypes.instanceOf(Map),
  // connectedTaxonomies: PropTypes.instanceOf(Map),
  // locationQuery: PropTypes.instanceOf(Map),
  // object/arrays
  viewOptions: PropTypes.array,
  // primitive
  dataReady: PropTypes.bool,
  typeId: PropTypes.string,
  mapSubject: PropTypes.string,
  mapIndicator: PropTypes.string,
  onSetMapSubject: PropTypes.func,
  onSetIncludeActorMembers: PropTypes.func,
  onSetIncludeTargetMembers: PropTypes.func,
  includeActorMembers: PropTypes.bool,
  includeTargetMembers: PropTypes.bool,
  hasFilters: PropTypes.bool,
  onEntityClick: PropTypes.func,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state, { typeId, config, includeActorMembers }) => ({
  countries: (config.types === 'actiontypes'
    && qe(typeId, ACTIONTYPES.EXPRESS))
    ? selectCountriesWithPositions(state, { includeActorMembers })
    : selectActortypeActors(state, { type: ACTORTYPES.COUNTRY }),
  actors: selectActors(state),
  actions: selectActions(state),
  actionActorsByAction: selectActionActorsGroupedByAction(state), // for figuring out targeted countries
  actorActionsByAction: selectActorActionsGroupedByAction(state), // for figuring out targeted countries
  membershipsByAssociation: selectMembershipsGroupedByAssociation(state),
  mapIndicator: selectMapIndicator(state),
});

export default connect(mapStateToProps, null)(injectIntl(EntitiesMap));
