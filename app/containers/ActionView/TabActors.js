/*
 *
 * TabActors
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Box, Text } from 'grommet';

import {
  getMarkdownField,
} from 'utils/fields';

import qe from 'utils/quasi-equals';
import {
  checkActionAttribute,
} from 'utils/entities';

import {
  ROUTES,
  ACTIONTYPES,
} from 'themes/config';

import FieldGroup from 'components/fields/FieldGroup';

import {
  selectActorConnections,
} from 'containers/App/selectors';

import ActionMap from './ActionMap';
import TabActorsAccordion from './TabActorsAccordion';

import {
  selectActorsByType,
  selectTargetsByType,
} from './selectors';

export function TabActors({
  viewEntity,
  typeId,
  taxonomies,
  viewSubject,
  hasChildren,
  onEntityClick,
  targetsByActortype,
  actorsByActortype,
  actorConnections,
  childActionsByActiontype,
}) {
  const hasMemberOption = !!typeId && !qe(typeId, ACTIONTYPES.NATL);

  const hasMap = viewSubject === 'actors' || viewSubject === 'targets';

  const actortypesForSubject = viewSubject === 'actors'
    ? actorsByActortype
    : targetsByActortype;

  return (
    <>
      {(!actortypesForSubject || actortypesForSubject.size === 0) && (
        <Box margin={{ top: 'small', horizontal: 'medium', bottom: 'large' }}>
          {viewSubject === 'actors' && (
            <Text>
              No actors for activity in database
            </Text>
          )}
          {viewSubject === 'targets' && (
            <Text>
              No activity targets in database
            </Text>
          )}
        </Box>
      )}
      {actortypesForSubject && hasMap && (
        <ActionMap
          entities={actortypesForSubject}
          mapSubject={viewSubject}
          onActorClick={(id) => onEntityClick(id, ROUTES.ACTOR)}
          hasMemberOption={hasMemberOption}
          typeId={typeId}
        />
      )}
      <Box margin={{ vertical: 'medium' }}>
        {viewSubject === 'targets' && (
          <FieldGroup
            seamless
            group={{
              fields: [
                checkActionAttribute(typeId, 'target_comment')
                  && getMarkdownField(viewEntity, 'target_comment', true),
              ],
            }}
          />
        )}
        {actortypesForSubject && (
          <TabActorsAccordion
            viewSubject={viewSubject}
            hasChildTargets={hasChildren && viewSubject === 'targets'}
            taxonomies={taxonomies}
            onEntityClick={onEntityClick}
            actorConnections={actorConnections}
            actorsByType={actortypesForSubject}
            childActionsByActiontype={childActionsByActiontype}
          />
        )}
      </Box>
    </>
  );
}

TabActors.propTypes = {
  viewEntity: PropTypes.object,
  typeId: PropTypes.string,
  onEntityClick: PropTypes.func,
  taxonomies: PropTypes.object,
  actorsByActortype: PropTypes.object,
  targetsByActortype: PropTypes.object,
  actorConnections: PropTypes.object,
  childActionsByActiontype: PropTypes.object,
  viewSubject: PropTypes.string,
  hasChildren: PropTypes.bool,
};

const mapStateToProps = (state, { viewEntity }) => ({
  actorsByActortype: selectActorsByType(state, viewEntity.get('id')),
  targetsByActortype: selectTargetsByType(state, viewEntity.get('id')),
  actorConnections: selectActorConnections(state),
});

export default connect(mapStateToProps, null)(TabActors);
