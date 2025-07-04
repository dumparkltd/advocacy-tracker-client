import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FieldFactory from 'components/fields/FieldFactory';
import styled from 'styled-components';
import { intlShape, injectIntl } from 'react-intl';
import { Map } from 'immutable';
import { Box, Text } from 'grommet';

import { lowerCase } from 'utils/string';

import { API, MEMBERSHIPS, ACTORTYPES } from 'themes/config';

import qe from 'utils/quasi-equals';

import {
  getIndicatorColumns,
} from 'utils/entities';
import {
  getIndicatorConnectionField,
} from 'utils/fields';

import {
  updatePath,
  loadEntitiesIfNeeded,
  setIncludeActorMembers,
  setIncludeInofficialStatements,
} from 'containers/App/actions';

import {
  selectReady,
  selectIncludeInofficialStatements,
  selectIncludeActorMembers,
  selectIsUserAdmin,
} from 'containers/App/selectors';
import appMessages from 'containers/App/messages';

import CheckboxOption from 'components/CheckboxOption';

import {
  selectPreviewEntity,
  selectIndicatorsWithSupport,
} from './selectors';

export const DEPENDENCIES = [
  API.USERS,
  API.USER_ROLES,
  API.CATEGORIES,
  API.TAXONOMIES,
  API.ACTIONTYPES,
  API.ACTORTYPES,
  API.ACTIONTYPE_TAXONOMIES,
  API.ACTORS,
  API.ACTIONS,
  API.ACTOR_ACTIONS,
  API.ACTION_ACTORS,
  API.MEMBERSHIPS,
  API.ACTOR_CATEGORIES,
  API.ACTION_CATEGORIES,
  API.INDICATORS,
  API.ACTION_INDICATORS,
];


const CheckboxOptionGroup = styled(
  (p) => <Box margin={{ top: 'xsmall', bottom: 'small' }} {...p} />
)``;


const SectionTitle = styled((p) => <Text size="xsmall" {...p} />)`
  text-transform: uppercase;
  font-weight: bold;
`;

const hasMemberOption = (typeId) => MEMBERSHIPS[typeId]
  && MEMBERSHIPS[typeId].length > 0
  && !qe(typeId, ACTORTYPES.CONTACT);

export function ActorIndicatorsField({
  title = 'Support by topic',
  previewEntity,
  onEntityClick,
  onLoadEntitiesIfNeeded,
  dataReady,
  intl,
  indicatorsWithSupport,
  isAdmin,
  includeActorMembers,
  onSetIncludeActorMembers,
  includeInofficial,
  onSetIncludeInofficial,
  content,
}) {
  useEffect(() => {
    if (!dataReady) onLoadEntitiesIfNeeded();
  }, [dataReady]);
  if (!dataReady) return null;
  const typeId = previewEntity && previewEntity.getIn(['attributes', 'actortype_id']);

  const type = typeId && lowerCase(
    intl.formatMessage(
      appMessages.entities[`actors_${typeId}`].single
    )
  );
  const field = dataReady && getIndicatorConnectionField({
    indicators: indicatorsWithSupport,
    onEntityClick,
    skipLabel: true,
    columns: getIndicatorColumns({
      typeId,
      intl,
      isAdmin,
    }),
  });
  const hasOptions = typeof content.get('withOptions') !== 'undefined'
    ? content.get('withOptions')
    : true;
  return (
    <Box gap="small">
      {title && (
        <SectionTitle>
          {title}
        </SectionTitle>
      )}
      {hasOptions && (
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
              label: 'Only consider "official" statements (Level of Authority)',
            }}
            type="official"
          />
        </CheckboxOptionGroup>
      )}
      <FieldFactory
        field={{
          ...field,
          onEntityClick,
          noPadding: true,
        }}
      />
    </Box>
  );
}

ActorIndicatorsField.propTypes = {
  onLoadEntitiesIfNeeded: PropTypes.func,
  onEntityClick: PropTypes.func,
  dataReady: PropTypes.bool,
  title: PropTypes.string,
  content: PropTypes.instanceOf(Map),
  previewEntity: PropTypes.instanceOf(Map),
  indicatorsWithSupport: PropTypes.instanceOf(Map),
  includeInofficial: PropTypes.bool,
  onSetIncludeInofficial: PropTypes.func,
  includeActorMembers: PropTypes.bool,
  isAdmin: PropTypes.bool,
  onSetIncludeActorMembers: PropTypes.func,
  // onUpdatePath: PropTypes.func,
  intl: intlShape,
};

const mapStateToProps = (state, { actorId }) => ({
  previewEntity: selectPreviewEntity(
    state,
    {
      id: actorId,
      path: API.ACTORS,
    },
  ),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  indicatorsWithSupport: selectIndicatorsWithSupport(state, { id: actorId }),
  includeInofficial: selectIncludeInofficialStatements(state),
  includeActorMembers: selectIncludeActorMembers(state),
  isAdmin: selectIsUserAdmin(state),
});
export function mapDispatchToProps(dispatch) {
  return {
    onLoadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    // onUpdatePath: (path) => {
    //   dispatch(updatePath(path));
    // },
    onEntityClick: (idOrPath, path) => {
      dispatch(updatePath(path ? `${path}/${idOrPath}` : idOrPath));
    },
    onSetIncludeInofficial: (value) => {
      dispatch(setIncludeInofficialStatements(value));
    },
    onSetIncludeActorMembers: (active) => {
      dispatch(setIncludeActorMembers(active));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ActorIndicatorsField));
