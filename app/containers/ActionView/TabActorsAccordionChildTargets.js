/*
 *
 * TabActorsAccordion
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Box,
} from 'grommet';
import {
  getActorConnectionField,
} from 'utils/fields';

import FieldGroup from 'components/fields/FieldGroup';
import { checkActorAttribute } from 'utils/entities';
import {
  selectChildTargetsByType,
} from './selectors';

export function TabActorsAccordionChildTargets({
  targetsByType,
  title,
  taxonomies,
  onEntityClick,
  actorConnections,
  getActortypeColumns,
  isAdmin,
}) {
  return (
    <Box pad={{ top: 'medium', bottom: 'hair' }}>
      <FieldGroup
        seamless
        group={{
          title,
          fields: targetsByType.reduce(
            (memo, actors, actortypeid) => ([
              ...memo,
              getActorConnectionField({
                actors,
                taxonomies,
                onEntityClick,
                connections: actorConnections,
                typeid: actortypeid,
                columns: getActortypeColumns(
                  actortypeid,
                  checkActorAttribute(actortypeid, 'code', isAdmin)
                ),
              }),
            ]),
            [],
          ),
        }}
      />
    </Box>
  );
}

TabActorsAccordionChildTargets.propTypes = {
  // targetIds: PropTypes.object,
  targetsByType: PropTypes.object,
  onEntityClick: PropTypes.func,
  getActortypeColumns: PropTypes.func,
  taxonomies: PropTypes.object,
  actorConnections: PropTypes.object,
  title: PropTypes.string,
  isAdmin: PropTypes.bool,
};

const mapStateToProps = (state, { targetIds }) => ({
  targetsByType: selectChildTargetsByType(state, targetIds),
});

export default connect(mapStateToProps, null)(TabActorsAccordionChildTargets);
