/*
 *
 * TabStatements
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

import { MEMBERSHIPS, ACTORTYPES } from 'themes/config';

import {
  getIndicatorColumns,
} from 'utils/entities';
import {
  getIndicatorConnectionField,
} from 'utils/fields';
import { qe } from 'utils/quasi-equals';

import {
  updatePath,
  setIncludeActorMembers,
  setIncludeInofficialStatements,
  setIncludeUnpublishedAPIStatements,
} from 'containers/App/actions';

import appMessages from 'containers/App/messages';
import {
  selectIndicators,
  selectActorsWithPositions,
  selectIncludeActorMembers,
  selectIncludeInofficialStatements,
  selectIncludeUnpublishedAPIStatements,
  selectIsUserAdmin,
} from 'containers/App/selectors';

import FieldGroup from 'components/fields/FieldGroup';
import CheckboxOption from 'components/CheckboxOption';

const CheckboxOptionGroup = styled(
  (p) => <Box margin={{ top: 'medium', bottom: 'small' }} {...p} />
)``;

const hasMemberOption = (typeId) => MEMBERSHIPS[typeId]
  && MEMBERSHIPS[typeId].length > 0
  && !qe(typeId, ACTORTYPES.CONTACT);

export function TabStatements(props) {
  const {
    indicators,
    actorsWithPositions,
    includeInofficial,
    includeUnpublishedAPI,
    includeActorMembers,
    onEntityClick,
    onSetIncludeInofficial,
    onSetIncludeUnpublishedAPI,
    onSetIncludeActorMembers,
    intl,
    viewEntity,
    isAdmin,
  } = props;
  const actorWithPositions = actorsWithPositions && actorsWithPositions.get(viewEntity.get('id'));

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
  const typeId = viewEntity.getIn(['attributes', 'actortype_id']);
  const type = lowerCase(
    intl.formatMessage(
      appMessages.entities[`actors_${typeId}`].single
    )
  );
  return (
    <div>
      <CheckboxOptionGroup>
        {hasMemberOption(typeId) && (
          <CheckboxOption
            option={{
              active: includeActorMembers,
              onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
              label: `Include statements of actors ${type} is a member of`,
            }}
            type="member"
          />
        )}
        <CheckboxOption
          option={{
            active: !includeInofficial,
            onClick: () => onSetIncludeInofficial(includeInofficial ? '0' : '1'),
            label: 'Only consider "official" statements',
          }}
          type="official"
        />
        <CheckboxOption
          option={{
            active: !includeUnpublishedAPI,
            onClick: () => onSetIncludeUnpublishedAPI(includeUnpublishedAPI ? '0' : '1'),
            label: 'Only consider statements published to GPN',
          }}
          type="unpublishedAPI"
        />
      </CheckboxOptionGroup>
      {indicators && (
        <FieldGroup
          seamless
          group={{
            fields: [
              getIndicatorConnectionField({
                indicators: indicatorsWithSupport,
                onEntityClick,
                skipLabel: true,
                columns: getIndicatorColumns({
                  typeId,
                  intl,
                  isAdmin,
                  hasMemberOption,
                  indicators,
                }),
              }),
            ],
          }}
        />
      )}
    </div>
  );
}

TabStatements.propTypes = {
  viewEntity: PropTypes.instanceOf(Map),
  indicators: PropTypes.instanceOf(Map),
  actorsWithPositions: PropTypes.instanceOf(Map),
  includeInofficial: PropTypes.bool,
  includeUnpublishedAPI: PropTypes.bool,
  onSetIncludeInofficial: PropTypes.func,
  onSetIncludeUnpublishedAPI: PropTypes.func,
  includeActorMembers: PropTypes.bool,
  isAdmin: PropTypes.bool,
  onSetIncludeActorMembers: PropTypes.func,
  onEntityClick: PropTypes.func,
  // onUpdatePath: PropTypes.func,
  intl: intlShape,
};

const mapStateToProps = (state) => ({
  indicators: selectIndicators(state),
  actorsWithPositions: selectActorsWithPositions(state),
  includeInofficial: selectIncludeInofficialStatements(state),
  includeUnpublishedAPI: selectIncludeUnpublishedAPIStatements(state),
  includeActorMembers: selectIncludeActorMembers(state),
  isAdmin: selectIsUserAdmin(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onUpdatePath: (path) => {
      dispatch(updatePath(path));
    },
    onSetIncludeInofficial: (value) => {
      dispatch(setIncludeInofficialStatements(value));
    },
    onSetIncludeUnpublishedAPI: (value) => {
      dispatch(setIncludeUnpublishedAPIStatements(value));
    },
    onSetIncludeActorMembers: (active) => {
      dispatch(setIncludeActorMembers(active));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(TabStatements));
