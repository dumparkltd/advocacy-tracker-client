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

import { selectActorConnections } from 'containers/App/selectors';

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
  isAdmin,
}) {
  const hasMemberOption = !!typeId && !qe(typeId, ACTIONTYPES.NATL);

  const hasMap = viewSubject === 'actors' || viewSubject === 'targets';

  const actortypesForSubject = viewSubject === 'actors'
    ? actorsByActortype
    : targetsByActortype;
  const hasChildTargets = viewSubject === 'targets'
    && hasChildren
    && childActionsByActiontype
    && childActionsByActiontype
      .flatten(true)
      .filter((action) => action.get('targetsByType'))
      .size > 0;

  const hasActivities = (
    actortypesForSubject && actortypesForSubject.size > 0
  ) || (
    childActionsByActiontype && childActionsByActiontype.size > 0
  );
  return (
    <>
      {!hasActivities && (
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
      {hasActivities && hasMap && (
        <ActionMap
          entities={actortypesForSubject}
          mapSubject={viewSubject}
          onActorClick={(id) => onEntityClick(id, ROUTES.ACTOR)}
          hasMemberOption={hasMemberOption}
          hasChildTargetOption={hasChildTargets}
          typeId={typeId}
          childActionsByActiontype={childActionsByActiontype}
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
        {hasActivities && (
          <TabActorsAccordion
            viewSubject={viewSubject}
            hasChildTargets={hasChildTargets}
            taxonomies={taxonomies}
            onEntityClick={onEntityClick}
            actorConnections={actorConnections}
            actorsByType={actortypesForSubject}
            childActionsByActiontype={childActionsByActiontype}
            isAdmin={isAdmin}
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
  isAdmin: PropTypes.bool,
};

const mapStateToProps = (state, { viewEntity }) => ({
  actorsByActortype: selectActorsByType(state, viewEntity.get('id')),
  targetsByActortype: selectTargetsByType(state, viewEntity.get('id')),
  actorConnections: selectActorConnections(state),
});

export default connect(mapStateToProps, null)(TabActors);
