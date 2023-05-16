/*
 *
 * Activities
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
// import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { Box, Text } from 'grommet';
import { Map } from 'immutable';
import styled from 'styled-components';
import countriesTopo from 'data/ne_countries_10m_v5.topo.json';
import countryPointsJSON from 'data/country-points.json';
import * as topojson from 'topojson-client';

import {
  getActorConnectionField,
} from 'utils/fields';
import qe from 'utils/quasi-equals';

import { ACTORTYPES, ROUTES } from 'themes/config';
import FieldGroup from 'components/fields/FieldGroup';

// import appMessages from 'containers/App/messages';
// import ActorMap from './ActorMap';
import MapContainer from 'containers/MapContainer/MapWrapper';
// import messages from './messages';

const MapOuterWrapper = styled((p) => <Box {...p} />)`
  z-index: 0;
`;
const MapWrapper = styled((p) => <Box {...p} />)`
  position: relative;
  height: 400px;
`;
const reduceCountryData = ({ features, countries }) => features.reduce(
  (memo, feature) => {
    const country = countries && countries.find(
      (e) => qe(e.getIn(['attributes', 'code']), feature.properties.ADM0_A3 || feature.properties.code)
    );
    if (country) {
      return [
        ...memo,
        {
          ...feature,
          id: country.get('id'),
          attributes: country.get('attributes').toJS(),
          tooltip: {
            id: country.get('id'),
            title: country.getIn(['attributes', 'title']),
          },
          values: {
            actions: 1,
          },
        },
      ];
    }
    return memo;
  },
  [],
);
export function TabMembers(props) {
  const {
    onEntityClick,
    membersByType,
    taxonomies,
    actorConnections,
    isAdmin,
  } = props;
  const countriesJSON = topojson.feature(
    countriesTopo,
    Object.values(countriesTopo.objects)[0],
  );
  const countries = membersByType && membersByType.get(parseInt(ACTORTYPES.COUNTRY, 10));
  const otherMembers = membersByType && membersByType.filter(
    (type, typeId) => !qe(typeId, ACTORTYPES.COUNTRY),
  );
  const countryData = countries && countries.size > 0 && reduceCountryData({
    features: countriesJSON.features,
    countries,
  });
  const countryPointData = countries && countries.size > 0 && reduceCountryData({
    features: countryPointsJSON.features,
    countries,
  });

  return (
    <Box>
      {(!membersByType || membersByType.size === 0) && (
        <Box margin={{ vertical: 'small' }}>
          <Text>
            No members found in database
          </Text>
        </Box>
      )}
      {countries && countries.size > 0 && (
        <Box>
          <MapOuterWrapper hasHeader noOverflow>
            <MapWrapper>
              <MapContainer
                countryData={countryData}
                countryPointData={countryPointData}
                countryFeatures={countriesJSON.features}
                styleType="members"
                onActorClick={(id) => onEntityClick(id, ROUTES.ACTOR)}
                fitBounds
                projection="gall-peters"
              />
            </MapWrapper>
          </MapOuterWrapper>
          <FieldGroup
            seamless
            group={{
              fields: [
                getActorConnectionField({
                  actors: countries,
                  onEntityClick,
                  typeid: ACTORTYPES.COUNTRY,
                  taxonomies,
                  connections: actorConnections,
                  columns: [
                    {
                      id: 'main',
                      type: 'main',
                      sort: 'title',
                      attributes: ['code', 'title'],
                    },
                    {
                      id: 'actorActions',
                      type: 'actionsSimple',
                      subject: 'actors',
                      actions: 'actions',
                    },
                    {
                      id: 'actorActionsTargets',
                      type: 'actionsSimple',
                      subject: 'targets',
                      actions: 'targetingActions',
                    },
                  ],
                }),
              ],
            }}
          />
        </Box>
      )}
      {otherMembers && otherMembers.size > 0 && (
        <FieldGroup
          seamless
          group={{
            fields: otherMembers.reduce(
              (memo, actors, typeid) => memo.concat([
                getActorConnectionField({
                  actors,
                  onEntityClick,
                  typeid,
                  taxonomies,
                  connections: actorConnections,
                  columns: [
                    {
                      id: 'main',
                      type: 'main',
                      sort: 'title',
                      attributes: isAdmin ? ['code', 'title'] : ['title'],
                    },
                    {
                      id: 'actorActions',
                      type: 'actionsSimple',
                      subject: 'actors',
                      actions: 'actions',
                    },
                    {
                      id: 'actorActionsTargets',
                      type: 'actionsSimple',
                      subject: 'targets',
                      actions: 'targetingActions',
                    },
                  ],
                }),
              ]),
              [],
            ),
          }}
        />
      )}
    </Box>
  );
}

TabMembers.propTypes = {
  onEntityClick: PropTypes.func,
  isAdmin: PropTypes.bool,
  membersByType: PropTypes.instanceOf(Map),
  taxonomies: PropTypes.instanceOf(Map),
  actorConnections: PropTypes.instanceOf(Map),
};


export default TabMembers;
