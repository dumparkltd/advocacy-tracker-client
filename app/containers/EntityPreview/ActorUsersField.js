import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FieldFactory from 'components/fields/FieldFactory';
import styled from 'styled-components';
import { Box, Text } from 'grommet';

import { API } from 'themes/config';

// import qe from 'utils/quasi-equals';

import {
  getUserConnectionField,
} from 'utils/fields';

import {
  loadEntitiesIfNeeded,
} from 'containers/App/actions';

import {
  selectReady,
} from 'containers/App/selectors';

import {
  selectEntityUsers,
} from './selectors';

export const DEPENDENCIES = [
  API.USERS,
  API.USER_ROLES,
  API.ACTORS,
  API.USER_ACTORS,
];

const SectionTitle = styled((p) => <Text size="xsmall" {...p} />)`
  text-transform: uppercase;
  font-weight: bold;
`;

export function ActorUsersField({
  content,
  onEntityClick,
  onLoadEntitiesIfNeeded,
  dataReady,
  users,
}) {
  useEffect(() => {
    if (!dataReady) onLoadEntitiesIfNeeded();
  }, [dataReady]);

  const field = getUserConnectionField({
    users,
  });
  return (
    <Box gap="small">
      {content.get('title') && (
        <SectionTitle>
          {content.get('title')}
        </SectionTitle>
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

ActorUsersField.propTypes = {
  onLoadEntitiesIfNeeded: PropTypes.func,
  content: PropTypes.object, // immutable Map
  users: PropTypes.object, // immutable Map
  onEntityClick: PropTypes.func,
  dataReady: PropTypes.bool,
};

const mapStateToProps = (state, { actorId }) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  users: selectEntityUsers(state, actorId),
});
export function mapDispatchToProps(dispatch) {
  return {
    onLoadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActorUsersField);
