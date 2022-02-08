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

import * as topojson from 'topojson-client';
// import { FormattedMessage } from 'react-intl';

import countriesTopo from 'data/ne_countries_10m_v5.topo.json';

import { ACTORTYPES, ROUTES } from 'themes/config';

import {
  selectMapSubjectQuery,
  selectActortypeActors,
  selectIncludeActorMembers,
  selectIncludeTargetMembers,
} from 'containers/App/selectors';

import {
  setMapSubject,
  setIncludeActorMembers,
  setIncludeTargetMembers,
} from 'containers/App/actions';

import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import Loading from 'components/Loading';
import EntityListViewOptions from 'components/EntityListViewOptions';

import appMessages from 'containers/App/messages';
import qe from 'utils/quasi-equals';
import { hasGroupActors } from 'utils/entities';
import MapContainer from './MapContainer';
import MapInfoOptions from './MapInfoOptions';
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

export function EntitiesMap({
  dataReady,
  viewOptions,
  config,
  entities,
  actortypes,
  // actiontypes,
  targettypes,
  typeId,
  mapSubject,
  onSetMapSubject,
  onSetIncludeActorMembers,
  onSetIncludeTargetMembers,
  includeActorMembers,
  includeTargetMembers,
  countries,
  onEntityClick,
  intl,
  hasFilters,
  // connections,
  // connectedTaxonomies,
  // locationQuery,
  // taxonomies,
}) {
  // const { intl } = this.context;
  // let { countries } = this.props;
  // let type;
  const countriesJSON = topojson.feature(
    countriesTopo,
    Object.values(countriesTopo.objects)[0],
  );
  let countryFeatures;
  let hasByTarget;
  let subjectOptions;
  let memberOption;
  let typeLabels;
  let typeLabelsFor;
  let indicator = includeActorMembers ? 'actionsTotal' : 'actions';
  let actionsTotalShowing;
  let infoTitle;
  let infoSubTitle;
  let mapSubjectClean = mapSubject;
  // let cleanMapSubject = 'actors';
  if (dataReady) {
    if (config.types === 'actortypes' && typeId === ACTORTYPES.COUNTRY) {
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

      // type = actortypes.find((at) => qe(at.get('id'), typeId));
      hasByTarget = false; // type.getIn(['attributes', 'is_target']);
      if (!hasByTarget) {
        if (mapSubject === 'targets') {
          indicator = includeTargetMembers ? 'targetingActionsTotal' : 'targetingActions';
        }
        // cleanMapSubject = mapSubject;
        subjectOptions = [
          {
            type: 'secondary',
            title: 'As actors',
            onClick: () => onSetMapSubject('actors'),
            active: mapSubject === 'actors',
            disabled: mapSubject === 'actors',
          },
          {
            type: 'secondary',
            title: 'As targets',
            onClick: () => onSetMapSubject('targets'),
            active: mapSubject === 'targets',
            disabled: mapSubject === 'targets',
          },
        ];
        if (mapSubject === 'targets') {
          // note this should always be true!
          memberOption = {
            active: includeTargetMembers,
            onClick: () => onSetIncludeTargetMembers(includeTargetMembers ? '0' : '1'),
            label: 'Include members of targeted regions, groups, classes',
          };
        } else if (hasGroupActors(actortypes)) {
          memberOption = {
            active: includeActorMembers,
            onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
            label: 'Include members of group actors',
          };
        }
        // entities are filtered countries
        countryFeatures = countriesJSON.features.map((feature) => {
          const country = entities.find((e) => qe(e.getIn(['attributes', 'code']), feature.properties.ADM0_A3));
          if (country) {
            const countActions = country.get('actions')
              ? country.get('actions').size
              : 0;
            const countActionsMembers = country.get('actionsAsMembers')
              ? country.get('actionsAsMembers').filter((actionId) => !country.get('actions').includes(actionId)).size
              : 0;
            const countTargetingActions = country.get('targetingActions')
              ? country.get('targetingActions').size
              : 0;
            const countTargetingActionsMembers = country.get('targetingActionsAsMember')
              ? country.get('targetingActionsAsMember').filter((actionId) => !country.get('targetingActions').includes(actionId)).size
              : 0;
            return {
              ...feature,
              id: country.get('id'),
              attributes: country.get('attributes').toJS(),
              tooltip: {
                title: country.getIn(['attributes', 'title']),
              },
              values: {
                actions: countActions,
                actionsMembers: countActionsMembers,
                actionsTotal: countActions + countActionsMembers,
                targetingActions: countTargetingActions,
                targetingActionsMembers: countTargetingActionsMembers,
                targetingActionsTotal: countTargetingActions + countTargetingActionsMembers,
              },
            };
          }
          return {
            ...feature,
            values: {
              actions: 0,
              actionsMembers: 0,
              actionsTotal: 0,
              targetingActions: 0,
              targetingActionsMembers: 0,
              targetingActionsTotal: 0,
            },
          };
        });
      }
      const countriesTotal = entities ? entities.size : 0;
      infoTitle = typeLabels.plural;
      infoSubTitle = `for ${countriesTotal} ${typeLabelsFor[countriesTotal === 1 ? 'single' : 'plural']}${hasFilters ? ' (filtered)' : ''}`;
    } else if (config.types === 'actiontypes') {
      typeLabels = {
        single: intl.formatMessage(appMessages.entities[`actions_${typeId}`].single),
        plural: intl.formatMessage(appMessages.entities[`actions_${typeId}`].plural),
      };
      // type = actiontypes.find((at) => qe(at.get('id'), typeId));
      hasByTarget = false; // type.getIn(['attributes', 'has_target']);
      if (hasByTarget) {
        if (mapSubject === 'targets') {
          indicator = includeTargetMembers ? 'targetingActionsTotal' : 'targetingActions';
        }
        // cleanMapSubject = mapSubject;
        subjectOptions = [
          {
            type: 'secondary',
            title: 'By actor',
            onClick: () => onSetMapSubject('actors'),
            active: mapSubject === 'actors',
            disabled: mapSubject === 'actors',
          },
          {
            type: 'secondary',
            title: 'By target',
            onClick: () => onSetMapSubject('targets'),
            active: mapSubject === 'targets',
            disabled: mapSubject === 'targets',
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
            label: 'Include member countries of targeted regions, groups, classes',
          };
        }
      } else if (hasGroupActors(actortypes)) {
        memberOption = {
          active: includeActorMembers,
          onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
          label: 'Include member countries of group actors',
        };
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
      // console.log('countryCounts', countryCounts && countryCounts.toJS())
      countryFeatures = countriesJSON.features.map((feature) => {
        const country = countries.find((e) => qe(e.getIn(['attributes', 'code']), feature.properties.ADM0_A3));
        if (country) {
          const cCounts = countryCounts.get(parseInt(country.get('id'), 10));
          const countActions = (cCounts && cCounts.get('actions')) || 0;
          const countActionsMembers = (cCounts && cCounts.get('actionsMembers')) || 0;
          const countTargetingActions = (cCounts && cCounts.get('targetingActions')) || 0;
          const countTargetingActionsMembers = (cCounts && cCounts.get('targetingActionsMembers')) || 0;
          return {
            ...feature,
            id: country.get('id'),
            attributes: country.get('attributes').toJS(),
            tooltip: {
              title: country.getIn(['attributes', 'title']),
            },
            values: {
              actions: countActions,
              actionsMembers: countActionsMembers,
              actionsTotal: countActions + countActionsMembers,
              targetingActions: countTargetingActions,
              targetingActionsMembers: countTargetingActionsMembers,
              targetingActionsTotal: countTargetingActions + countTargetingActionsMembers,
            },
          };
        }
        return {
          ...feature,
          values: {
            actions: 0,
            actionsMembers: 0,
            actionsTotal: 0,
            targetingActions: 0,
            targetingActionsMembers: 0,
            targetingActionsTotal: 0,
          },
        };
      });
      infoTitle = `No. of ${typeLabels[actionsTotalShowing === 1 ? 'single' : 'plural']} by Country`;
      infoSubTitle = `Showing ${actionsTotalShowing} of ${entities ? entities.size : 0} activities total${hasFilters ? ' (filtered)' : ''}`;
    }
  }
  let maxValue;
  if (countryFeatures) {
    maxValue = countryFeatures.reduce(
      (max, f) => max ? Math.max(max, f.values[indicator]) : f.values[indicator],
      null,
    );
  }

  return (
    <ContainerWrapper hasHeader noOverflow>
      <MapContainer
        typeLabels={typeLabels}
        countryFeatures={countryFeatures}
        indicator={indicator}
        onCountryClick={(id) => onEntityClick(id, ROUTES.ACTOR)}
        maxValue={maxValue}
        includeActorMembers={includeActorMembers}
        includeTargetMembers={includeTargetMembers}
        mapSubject={hasByTarget ? mapSubjectClean : 'actors'}
      />
      {!dataReady && (
        <LoadingWrap>
          <Loading />
        </LoadingWrap>
      )}
      {viewOptions && viewOptions.length > 1 && (
        <EntityListViewOptions options={viewOptions} />
      )}
      {dataReady && (
        <MapInfoOptions
          config={{
            title: infoTitle,
            subTitle: infoSubTitle,
            subjectOptions: hasByTarget && subjectOptions,
            memberOption,
            maxValue,
          }}
          mapSubject={hasByTarget ? mapSubjectClean : 'actors'}
        />
      )}
    </ContainerWrapper>
  );
}

EntitiesMap.propTypes = {
  config: PropTypes.object,
  entities: PropTypes.instanceOf(List),
  // connections: PropTypes.instanceOf(Map),
  actortypes: PropTypes.instanceOf(Map),
  // actiontypes: PropTypes.instanceOf(Map),
  targettypes: PropTypes.instanceOf(Map),
  countries: PropTypes.instanceOf(Map),
  // taxonomies: PropTypes.instanceOf(Map),
  // connectedTaxonomies: PropTypes.instanceOf(Map),
  // locationQuery: PropTypes.instanceOf(Map),
  // object/arrays
  viewOptions: PropTypes.array,
  // primitive
  dataReady: PropTypes.bool,
  typeId: PropTypes.string,
  mapSubject: PropTypes.string,
  onSetMapSubject: PropTypes.func,
  onSetIncludeActorMembers: PropTypes.func,
  onSetIncludeTargetMembers: PropTypes.func,
  includeActorMembers: PropTypes.bool,
  includeTargetMembers: PropTypes.bool,
  hasFilters: PropTypes.bool,
  onEntityClick: PropTypes.func,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state) => ({
  mapSubject: selectMapSubjectQuery(state),
  countries: selectActortypeActors(state, { type: ACTORTYPES.COUNTRY }),
  includeActorMembers: selectIncludeActorMembers(state),
  includeTargetMembers: selectIncludeTargetMembers(state),
});
function mapDispatchToProps(dispatch) {
  return {
    onSetMapSubject: (subject) => {
      dispatch(setMapSubject(subject));
    },
    onSetIncludeTargetMembers: (active) => {
      dispatch(setIncludeTargetMembers(active));
    },
    onSetIncludeActorMembers: (active) => {
      dispatch(setIncludeActorMembers(active));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(EntitiesMap));
