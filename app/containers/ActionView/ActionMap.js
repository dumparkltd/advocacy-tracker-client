/*
 *
 * ActionMap
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Box, Text } from 'grommet';

import * as topojson from 'topojson-client';
// import { FormattedMessage } from 'react-intl';

import countriesTopo from 'data/ne_countries_10m_v5.topo.json';
import countryPointsJSON from 'data/country-points.json';

import { ACTORTYPES, MAP_OPTIONS } from 'themes/config';

import {
  selectActortypeActors,
  selectIncludeActorMembers,
  selectIncludeActorChildrenOnMap,
  selectIncludeActorChildrenMembersOnMap,
  selectPrintConfig,
} from 'containers/App/selectors';

import {
  setIncludeActorMembers,
  setIncludeActorChildrenOnMap,
  setIncludeActorChildrenMembersOnMap,
} from 'containers/App/actions';


// import appMessages from 'containers/App/messages';
import qe from 'utils/quasi-equals';

// import { hasGroupActors } from 'utils/entities';
import { scaleColorCount } from 'containers/MapContainer/utils';
import MapKeySimple from 'containers/MapContainer/MapKeySimple';
import { usePrint } from 'containers/App/PrintContext';
import LeafletWrapper from 'containers/MapContainer/LeafletWrapper';
import CheckboxOption from 'components/CheckboxOption';

// import messages from './messages';

const Styled = styled((p) => <Box {...p} />)`
  z-index: 0;
`;
const MapTitle = styled((p) => <Box margin={{ vertical: 'xsmall' }} {...p} />)``;

const MapOuterWrapper = styled((p) => <Box {...p} />)`
  position: relative;
  height: 400px;
  background: #F9F9FA;
  @media print {
    page-break-inside: avoid;
    break-inside: avoid;
  }
`;
const MAX_VALUE_COUNTRIES = 100;

const reduceCountryData = ({
  features,
  entities, // actors by type
  countriesVia,
  countriesChildActors,
  hasDirectCountries,
  mapKeyOptionMap,
}) => features.reduce(
  (memo, feature) => {
    const countryDirect = hasDirectCountries
      && entities
      && entities.get(parseInt(ACTORTYPES.COUNTRY, 10)).find(
        (e) => qe(e.getIn(['attributes', 'code']), feature.properties.ADM0_A3 || feature.properties.code)
      );
    const countryVia = !countryDirect
      && countriesVia
      && countriesVia.find(
        (e) => qe(e.getIn(['attributes', 'code']), feature.properties.ADM0_A3 || feature.properties.code)
      );
    const countriesChildActor = !countryDirect
      && !countryVia
      && countriesChildActors
      && countriesChildActors.find(
        (e) => qe(e.getIn(['attributes', 'code']), feature.properties.ADM0_A3 || feature.properties.code)
      );
    const country = countryDirect || countryVia || countriesChildActor;

    if (country) {
      let styleOption = mapKeyOptionMap.direct;
      let content = 'As direct actor';
      if (countryVia) {
        styleOption = mapKeyOptionMap.via;
        content = 'As member of group actor';
      } else if (countriesChildActor) {
        styleOption = mapKeyOptionMap.children;
        content = 'As actor of child activity';
      }
      return [
        ...memo,
        {
          ...feature,
          id: country.get('id'),
          attributes: country.get('attributes').toJS(),
          tooltip: {
            id: country.get('id'),
            title: country.getIn(['attributes', 'title']),
            content: <Text size="small" style={{ fontStyle: 'italic' }}>{content}</Text>,
          },
          values: {
            actions: styleOption.colorValue,
          },
        },
      ];
    }
    return memo;
  },
  [],
);

export function ActionMap({
  entities,
  mapSubject,
  onSetIncludeActorMembers,
  includeActorMembers,
  onActorClick,
  countries,
  hasMemberOption,
  hasChildActorOption,
  includeActorChildren,
  onSetIncludeActorChildren,
  childActionsByActiontype,
  includeActorChildrenMembers,
  onSetIncludeActorChildrenMembers,
  printArgs,
  // typeId,
  // intl,
}) {
  const isPrintView = usePrint();

  // const { intl } = this.context;
  // let type;
  const countriesJSON = topojson.feature(
    countriesTopo,
    Object.values(countriesTopo.objects)[0],
  );
  const hasDirectActors = entities && entities.size > 0;
  const hasDirectCountries = hasDirectActors
    && entities.get(parseInt(ACTORTYPES.COUNTRY, 10))
    && entities.get(parseInt(ACTORTYPES.COUNTRY, 10)).size > 0;

  let hasAssociations = false;
  if (hasDirectCountries) {
    hasAssociations = !!(
      entities.get(parseInt(ACTORTYPES.GROUP, 10))
      || entities.get(parseInt(ACTORTYPES.REG, 10))
      || entities.get(parseInt(ACTORTYPES.CLASS, 10))
    );
  }
  // if (!hasCountries && !hasAssociations) return null;
  const includeMembers = includeActorMembers;

  const countriesVia = hasMemberOption
    && includeMembers
    && hasDirectActors
    && entities.reduce(
      (memo, typeActors, actortypeId) => {
        // skip non group types
        // TODO check actortypes db object
        if (qe(actortypeId, ACTORTYPES.COUNTRY) || qe(actortypeId, ACTORTYPES.ORG)) {
          return memo;
        }
        return memo.concat(typeActors.reduce(
          (memo2, association) => {
            if (association.getIn(['membersByType', ACTORTYPES.COUNTRY])) {
              return memo2.concat(association.getIn(['membersByType', ACTORTYPES.COUNTRY]).toList());
            }
            return memo2;
          },
          List(),
        ));
      },
      List(),
    ).toSet(
    ).map(
      (countryId) => countries.get(countryId.toString())
    );
  const countriesChildActors = hasChildActorOption
    && includeActorChildren
    && childActionsByActiontype
    && childActionsByActiontype.reduce(
      (memo, typeActions) => memo.concat(typeActions.reduce(
        (memo2, childAction) => {
          let result = memo2;
          if (childAction.getIn(['actorsByType', ACTORTYPES.COUNTRY])) {
            result = result.concat(childAction.getIn(['actorsByType', ACTORTYPES.COUNTRY]).toList());
          }
          if (hasMemberOption && includeActorChildrenMembers && childAction.getIn(['actorMembersByType', ACTORTYPES.COUNTRY])) {
            result = result.concat(childAction.getIn(['actorMembersByType', ACTORTYPES.COUNTRY]).toList());
          }
          return result;
        },
        List(),
      )),
      List(),
    ).toSet(
    ).map(
      (countryId) => countries.get(countryId.toString())
    );
  let mapKeyOptionMap = {};
  if (hasDirectActors) {
    mapKeyOptionMap = {
      ...mapKeyOptionMap,
      direct: {
        label: 'Direct stakeholders',
        colorValue: 100,
        color: scaleColorCount(MAX_VALUE_COUNTRIES, MAP_OPTIONS.GRADIENT[mapSubject], false)(100),
        order: 1,
      },
    };
  }
  if (hasMemberOption) {
    mapKeyOptionMap = {
      ...mapKeyOptionMap,
      via: {
        label: 'Members of regions or groups',
        colorValue: 50,
        color: scaleColorCount(MAX_VALUE_COUNTRIES, MAP_OPTIONS.GRADIENT.actors, false)(50),
        order: 2,
      },
    };
  }
  if (hasChildActorOption) {
    mapKeyOptionMap = {
      ...mapKeyOptionMap,
      children: {
        label: 'Countries associated with sub-activities',
        colorValue: 30,
        color: scaleColorCount(MAX_VALUE_COUNTRIES, MAP_OPTIONS.GRADIENT.actors, false)(30),
        order: 3,
      },
    };
  }

  const countryData = reduceCountryData({
    features: countriesJSON.features,
    entities, // actors
    countriesVia,
    countriesChildActors,
    hasDirectCountries,
    mapKeyOptionMap,
    mapSubject,
  });
  const showMarkers = !isPrintView || (printArgs && printArgs.printMapMarkers);
  const countryPointData = showMarkers
    ? reduceCountryData({
      features: countryPointsJSON.features,
      entities, // actors
      countriesVia,
      countriesChildActors,
      hasDirectCountries,
      mapKeyOptionMap,
      mapSubject,
    })
    : null;
  let memberOption;
  const mapTitle = `${countryData ? countryData.length : 'No'} countries responsible by activity`;
  if (hasMemberOption && hasAssociations) {
    memberOption = {
      active: includeActorMembers,
      onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
      label: 'Include country members of associated regions or groups',
    };
  }
  const childrenOption = hasChildActorOption && ({
    active: includeActorChildren,
    onClick: () => onSetIncludeActorChildren(includeActorChildren ? '0' : '1'),
    label: 'Include countries associated with sub-activities',
  });
  const memberChildrenOption = hasChildActorOption && hasMemberOption && includeActorChildren && ({
    active: includeActorChildrenMembers,
    onClick: () => onSetIncludeActorChildrenMembers(includeActorChildrenMembers ? '0' : '1'),
    label: 'Include country members of regions or groups associated with sub-activities',
  });
  return (
    <Styled hasHeader noOverflow>
      <MapOuterWrapper>
        <LeafletWrapper
          countryData={countryData}
          countryPointData={countryPointData}
          countryFeatures={countriesJSON.features}
          indicator="actions"
          onCountryClick={(id) => onActorClick(id)}
          maxValueCountries={MAX_VALUE_COUNTRIES}
          includeSecondaryMembers={includeActorMembers}
          mapSubject={mapSubject}
          fitBounds
          projection="gall-peters"
          mapId="ll-action-map"
        />
      </MapOuterWrapper>
      {mapTitle && (
        <Box>
          <MapTitle>
            <Text weight={600}>{mapTitle}</Text>
          </MapTitle>
        </Box>
      )}
      {(memberOption || childrenOption || memberChildrenOption) && (
        <Box gap="xxsmall">
          {memberOption && (
            <CheckboxOption option={memberOption} type="member" plain />
          )}
          {childrenOption && (
            <CheckboxOption option={childrenOption} type="children" plain />
          )}
          {memberChildrenOption && (
            <Box margin={{ left: 'medium' }}>
              <CheckboxOption option={memberChildrenOption} type="children-members" plain />
            </Box>
          )}
        </Box>
      )}
      <Box>
        <MapKeySimple
          options={Object.values(mapKeyOptionMap)}
          title="Countries"
        />
      </Box>
    </Styled>
  );
}

ActionMap.propTypes = {
  entities: PropTypes.instanceOf(Map), // actors by actortype for current action
  countries: PropTypes.instanceOf(Map), // all countries needed for indirect connections
  childActionsByActiontype: PropTypes.instanceOf(Map), // all countries needed for indirect connections
  onSetIncludeActorMembers: PropTypes.func,
  onSetIncludeActorChildren: PropTypes.func,
  onSetIncludeActorChildrenMembers: PropTypes.func,
  includeActorMembers: PropTypes.bool,
  includeActorChildren: PropTypes.bool,
  includeActorChildrenMembers: PropTypes.bool,
  hasMemberOption: PropTypes.bool,
  hasChildActorOption: PropTypes.bool,
  onActorClick: PropTypes.func,
  mapSubject: PropTypes.string,
  printArgs: PropTypes.object,
};

const mapStateToProps = (state) => ({
  countries: selectActortypeActors(state, { type: ACTORTYPES.COUNTRY }),
  includeActorMembers: selectIncludeActorMembers(state),
  includeActorChildren: selectIncludeActorChildrenOnMap(state),
  includeActorChildrenMembers: selectIncludeActorChildrenMembersOnMap(state),
  printArgs: selectPrintConfig(state),
});
function mapDispatchToProps(dispatch) {
  return {
    onSetIncludeActorChildren: (active) => {
      dispatch(setIncludeActorChildrenOnMap(active));
    },
    onSetIncludeActorChildrenMembers: (active) => {
      dispatch(setIncludeActorChildrenMembersOnMap(active));
    },
    onSetIncludeActorMembers: (active) => {
      dispatch(setIncludeActorMembers(active));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActionMap);
