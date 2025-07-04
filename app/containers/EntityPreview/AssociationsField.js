import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FieldFactory from 'components/fields/FieldFactory';
import styled from 'styled-components';
import { Box, Text } from 'grommet';

import { API } from 'themes/config';

// import qe from 'utils/quasi-equals';

import {
  getActorConnectionField,
} from 'utils/fields';

import {
  loadEntitiesIfNeeded,
} from 'containers/App/actions';

import {
  selectReady,
} from 'containers/App/selectors';

import {
  selectActorAssociationsByType,
} from './selectors';

export const DEPENDENCIES = [
  API.ACTORS,
  API.MEMBERSHIPS,
];

const SectionTitle = styled((p) => <Text size="xsmall" {...p} />)`
  text-transform: uppercase;
  font-weight: bold;
`;

export function AssociationsField({
  content,
  onEntityClick,
  onLoadEntitiesIfNeeded,
  dataReady,
  associationsByType,
}) {
  useEffect(() => {
    if (!dataReady) onLoadEntitiesIfNeeded();
  }, [dataReady]);
  const actortype = content.get('actortype');
  if (!associationsByType || !actortype) return null;
  const typeActors = associationsByType.get(parseInt(actortype, 10));
  const field = getActorConnectionField({
    actors: typeActors,
    typeid: parseInt(actortype, 10),
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

AssociationsField.propTypes = {
  onLoadEntitiesIfNeeded: PropTypes.func,
  content: PropTypes.object, // immutable Map
  associationsByType: PropTypes.object, // immutable Map
  onEntityClick: PropTypes.func,
  dataReady: PropTypes.bool,
};

const mapStateToProps = (state, { actorId }) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  associationsByType: selectActorAssociationsByType(state, { id: actorId }),
});
export function mapDispatchToProps(dispatch) {
  return {
    onLoadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AssociationsField);
