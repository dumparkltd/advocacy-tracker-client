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

import { selectMapIndicator } from 'containers/App/selectors';

import ContainerWrapper from 'components/styled/Container/ContainerWrapper';

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

// countries only
export function EntitiesMapActors({
  entities,
  actortypes,
  typeId,
  mapSubject,
  onSetIncludeActorMembers,
  includeActorMembers,
  onEntityClick,
  intl,
  hasFilters,
  isPrintView,
  filters,
  onClearFilters,
}) {
  // const { intl } = this.context;
  // let { countries } = this.props;
  let memberOption;
  let typeLabels;
  let typeLabelsFor;
  let infoTitle;
  let infoTitlePrint;
  let infoSubTitle;
  let reduceCountryAreas;
  let reducePoints;
  const indicator = includeActorMembers ? 'actionsTotal' : 'actions';
  const mapSubjectClean = mapSubject || 'actors';
  const entitiesTotal = entities ? entities.size : 0;

  if (hasGroupActors(actortypes)) {
    memberOption = {
      active: includeActorMembers,
      onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
      label: 'Include activities of groups',
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
        const actionsTotal = countActions + countActionsMembers;
        let stats;
        if (mapSubjectClean === 'actors') {
          stats = [
            {
              title: `${intl.formatMessage(appMessages.entities.actions.plural)}: ${actionsTotal}`,
              values: [
                {
                  label: 'Directly',
                  value: countActions,
                },
                {
                  label: 'As member of intergov. org.',
                  value: countActionsMembers,
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
          },
        };
      }
      return {
        ...feature,
        values: {
          actions: 0,
          actionsTotal: 0,
        },
      };
    });
    infoTitle = typeLabels.plural;
    infoSubTitle = `for ${entitiesTotal} ${typeLabelsFor[entitiesTotal === 1 ? 'single' : 'plural']}${hasFilters ? ' (filtered)' : ''}`;
    infoTitlePrint = infoTitle;
  }
  return (
    <Styled noOverflow isOnMap>
      {isPrintView && (
        <HeaderPrint argsRemove={['subj', 'ac', 'tc', 'achmmap', 'achmap', 'actontype']} />
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
          includeSecondaryMembers: includeActorMembers,
          scrollWheelZoom: true,
          mapSubject: mapSubjectClean,
          hasPointOption: false,
          hasPointOverlay: true,
          fitBounds: true,
          filters,
        }}
        onActorClick={(id) => onEntityClick(id, ROUTES.ACTOR)}
        mapInfo={{
          title: infoTitle,
          titlePrint: infoTitlePrint,
          subTitle: infoSubTitle,
          memberOption,
        }}
        onClearFilters={onClearFilters}
      />
    </Styled>
  );
}

EntitiesMapActors.propTypes = {
  entities: PropTypes.instanceOf(List),
  // connections: PropTypes.instanceOf(Map),
  actortypes: PropTypes.instanceOf(Map),
  typeId: PropTypes.string,
  mapSubject: PropTypes.string,
  onSetIncludeActorMembers: PropTypes.func,
  includeActorMembers: PropTypes.bool,
  hasFilters: PropTypes.bool,
  isPrintView: PropTypes.bool,
  onEntityClick: PropTypes.func,
  filters: PropTypes.array,
  intl: intlShape.isRequired,
  onClearFilters: PropTypes.func,
};

const mapStateToProps = (state) => ({
  mapIndicator: selectMapIndicator(state),
});

export default connect(mapStateToProps, null)(injectIntl(EntitiesMapActors));
