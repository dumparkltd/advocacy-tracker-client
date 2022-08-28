/*
 *
 * Statements
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import {
  Box,
} from 'grommet';
import { Map } from 'immutable';
import styled from 'styled-components';

import { lowerCase } from 'utils/string';

import { MEMBERSHIPS } from 'themes/config';

import {
  getIndicatorConnectionField,
} from 'utils/fields';

import {
  updatePath,
  setIncludeActorMembers,
  setIncludeInofficialStatements,
} from 'containers/App/actions';

import appMessages from 'containers/App/messages';
import {
  selectIndicators,
  selectActorsWithPositions,
  selectIncludeActorMembers,
  selectIncludeInofficialStatements,
} from 'containers/App/selectors';

import FieldGroup from 'components/fields/FieldGroup';
import MapOption from 'containers/MapContainer/MapInfoOptions/MapOption';

const MapOptions = styled(
  (p) => <Box margin={{ horizontal: 'medium', top: 'medium' }} {...p} />
)``;

const getIndicatorColumns = (viewEntity, canBeMember, intl) => {
  let columns = [
    {
      id: 'main',
      type: 'main',
      sort: 'title',
      attributes: ['code', 'title'],
    },
    {
      id: 'positionStatement',
      type: 'positionStatement',
    },
    {
      id: 'supportlevel_id',
      type: 'supportlevel',
      actionId: viewEntity.get('id'),
      title: intl.formatMessage(appMessages.attributes.supportlevel_id),
    },
    {
      id: 'authority',
      type: 'positionStatementAuthority',
    },
  ];
  if (canBeMember) {
    columns = [
      ...columns,
      {
        id: 'viaGroups',
        type: 'viaGroups',
      },
    ];
  }
  return columns;
};

export function Statements(props) {
  const {
    indicators,
    actorsWithPositions,
    includeInofficial,
    includeActorMembers,
    onEntityClick,
    onSetIncludeInofficial,
    onSetIncludeActorMembers,
    intl,
    viewEntity,
  } = props;
  // console.log('statements', statements && statements.toJS());
  // // console.log('actorsWithPositions', actorsWithPositions && actorsWithPositions.toJS());
  // console.log('associationsByType', associationsByType && associationsByType.toJS());
  // console.log('includeInofficial', includeInofficial);
  // console.log('includeActorMembers', includeActorMembers);
  const actorWithPositions = actorsWithPositions && actorsWithPositions.get(viewEntity.get('id'));
  // const indicatorsWithSupport = indicators;
  const indicatorsWithSupport = indicators && indicators.reduce(
    (memo, indicator, id) => {
      const indicatorPositions = actorWithPositions
        && actorWithPositions.get('indicatorPositions')
        && actorWithPositions.getIn([
          'indicatorPositions',
          indicator.get('id'),
        ]);
      if (indicatorPositions) {
        const relPos = indicatorPositions.first();
        const result = relPos && indicator
          .setIn(
            ['supportlevel', viewEntity.get('id')],
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
    Map()
  );
  const type = lowerCase(
    intl.formatMessage(
      appMessages.entities[`actors_${viewEntity.getIn(['attributes', 'actortype_id'])}`].single
    )
  );
  const canBeMember = MEMBERSHIPS[viewEntity.getIn(['attributes', 'actortype_id'])]
    && MEMBERSHIPS[viewEntity.getIn(['attributes', 'actortype_id'])].length > 0;

  return (
    <div>
      <MapOptions>
        {canBeMember && (
          <MapOption
            option={{
              active: includeActorMembers,
              onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
              label: `Include statements of actors ${type} is a member of`,
            }}
            type="member"
          />
        )}
        <MapOption
          option={{
            active: !includeInofficial,
            onClick: () => onSetIncludeInofficial(includeInofficial ? '0' : '1'),
            label: 'Only consider "official" statements (Level of Authority)',
          }}
          type="official"
        />
      </MapOptions>
      {indicators && (
        <FieldGroup
          group={{
            fields: [
              getIndicatorConnectionField({
                indicators: indicatorsWithSupport,
                onEntityClick,
                skipLabel: true,
                columns: getIndicatorColumns(viewEntity, canBeMember, intl),
              }),
            ],
          }}
        />
      )}
    </div>
  );
}

Statements.propTypes = {
  viewEntity: PropTypes.instanceOf(Map),
  indicators: PropTypes.instanceOf(Map),
  actorsWithPositions: PropTypes.instanceOf(Map),
  includeInofficial: PropTypes.bool,
  onSetIncludeInofficial: PropTypes.func,
  includeActorMembers: PropTypes.bool,
  onSetIncludeActorMembers: PropTypes.func,
  onEntityClick: PropTypes.func,
  // onUpdatePath: PropTypes.func,
  intl: intlShape,
};

const mapStateToProps = (state) => ({
  indicators: selectIndicators(state),
  actorsWithPositions: selectActorsWithPositions(state),
  includeInofficial: selectIncludeInofficialStatements(state),
  includeActorMembers: selectIncludeActorMembers(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onUpdatePath: (path) => {
      dispatch(updatePath(path));
    },
    onSetIncludeInofficial: (value) => {
      dispatch(setIncludeInofficialStatements(value));
    },
    onSetIncludeActorMembers: (active) => {
      dispatch(setIncludeActorMembers(active));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Statements));
