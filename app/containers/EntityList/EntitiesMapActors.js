/*
 *
 * EntitiesMapActors
 *
 */
import React from 'react';
import { injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import styled from 'styled-components';

// import { FormattedMessage } from 'react-intl';

import {
  ACTORTYPES,
  ROUTES,
} from 'themes/config';

import {
  selectActors,
  selectActions,
  selectActortypeActors,
  selectActionActorsGroupedByAction,
  selectActorActionsGroupedByAction,
  selectMembershipsGroupedByParent,
  selectMapIndicator,
} from 'containers/App/selectors';

import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import EntityListViewOptions from 'components/EntityListViewOptions';

import appMessages from 'containers/App/messages';
import qe from 'utils/quasi-equals';
import { hasGroupActors } from 'utils/entities';
import MapContainer from 'containers/MapContainer';
import HeaderPrint from 'components/Header/HeaderPrint';
// import messages from './messages';

const Styled = styled((p) => <ContainerWrapper {...p} />)`
  background: white;
  box-shadow: none;
  padding: 0;
`;

export function EntitiesMapActors({
  viewOptions,
  entities,
  actortypes,
  actiontypes,
  typeId,
  mapSubject,
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
  isPrintView,
}) {
  // const { intl } = this.context;
  // let { countries } = this.props;
  let subjectOptions = [];
  let memberOption;
  let typeLabels;
  let typeLabelsFor;
  let indicator = includeActorMembers ? 'actionsTotal' : 'actions';
  let infoTitle;
  let infoTitlePrint;
  let infoSubTitle;
  let reduceCountryAreas;
  let reducePoints;
  let mapSubjectClean = mapSubject || 'actors';
  const entitiesTotal = entities ? entities.size : 0;

  const type = actortypes.find((at) => qe(at.get('id'), typeId));
  const hasByTarget = type.getIn(['attributes', 'is_target']);
  const hasActions = type.getIn(['attributes', 'is_active']);
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
        label: 'Include activities targeting regions & groups',
      };
    } else if (hasGroupActors(actortypes)) {
      memberOption = {
        active: includeActorMembers,
        onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
        label: 'Include activities of groups',
      };
    }
    // } else if (hasActions && !hasByTarget) { // i.e. institutions
    //   // showing targeted countries
    //   mapSubjectClean = 'targets';
    //   memberOption = {
    //     active: includeTargetMembers,
    //     onClick: () => onSetIncludeTargetMembers(includeTargetMembers ? '0' : '1'),
    //     label: 'Include activities targeting regions & groups',
    //   };
  } else { // i.e. groups
    mapSubjectClean = 'targets';
    memberOption = {
      active: includeTargetMembers,
      onClick: () => onSetIncludeTargetMembers(includeTargetMembers ? '0' : '1'),
      label: 'Include activities targeting regions & groups',
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
      const country = entities.find((e) => qe(e.getIn(['attributes', 'code']), feature.properties.ADM0_A3 || feature.properties.code));
      // console.log('country', country && country.toJS())
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
    const subjectOption = subjectOptions && subjectOptions.find((option) => option.active);
    infoTitlePrint = subjectOption.title;
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
      const country = countries.find((e) => qe(e.getIn(['attributes', 'code']), feature.properties.ADM0_A3 || feature.properties.code));
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
    infoTitlePrint = infoTitle;
  }

  return (
    <Styled headerStyle="types" noOverflowisPrint={isPrintView}>
      {isPrintView && (
        <HeaderPrint />
      )}
      <MapContainer
        fullMap
        isPrintView={isPrintView}
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
          fitBounds: true,
        }}
        onActorClick={(id) => onEntityClick(id, ROUTES.ACTOR)}
        mapInfo={[{
          id: 'countries',
          title: infoTitle,
          titlePrint: infoTitlePrint,
          subTitle: infoSubTitle,
          subjectOptions,
          memberOption,
        }]}
      />
      {viewOptions && viewOptions.length > 1 && !isPrintView && (
        <EntityListViewOptions options={viewOptions} isOnMap />
      )}
    </Styled>
  );
}

EntitiesMapActors.propTypes = {
  entities: PropTypes.instanceOf(List),
  actors: PropTypes.instanceOf(Map),
  actions: PropTypes.instanceOf(Map),
  // connections: PropTypes.instanceOf(Map),
  actortypes: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  countries: PropTypes.instanceOf(Map),
  actionActorsByAction: PropTypes.instanceOf(Map),
  actorActionsByAction: PropTypes.instanceOf(Map),
  membershipsByAssociation: PropTypes.instanceOf(Map),
  viewOptions: PropTypes.array,
  typeId: PropTypes.string,
  mapSubject: PropTypes.string,
  onSetMapSubject: PropTypes.func,
  onSetIncludeActorMembers: PropTypes.func,
  onSetIncludeTargetMembers: PropTypes.func,
  includeActorMembers: PropTypes.bool,
  includeTargetMembers: PropTypes.bool,
  hasFilters: PropTypes.bool,
  isPrintView: PropTypes.bool,
  onEntityClick: PropTypes.func,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state) => ({
  countries: selectActortypeActors(state, { type: ACTORTYPES.COUNTRY }),
  actors: selectActors(state),
  actions: selectActions(state),
  actionActorsByAction: selectActionActorsGroupedByAction(state), // for figuring out targeted countries
  actorActionsByAction: selectActorActionsGroupedByAction(state), // for figuring out targeted countries
  membershipsByAssociation: selectMembershipsGroupedByParent(state),
  mapIndicator: selectMapIndicator(state),
});

export default connect(mapStateToProps, null)(injectIntl(EntitiesMapActors));
