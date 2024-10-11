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
import {
  selectChildActorsByType,
} from './selectors';

export function TabActorsAccordionChildActors({
  actorsByType,
  title,
  taxonomies,
  onEntityClick,
  actorConnections,
  getActortypeColumns,
}) {
  return (
    <Box pad={{ top: 'medium', bottom: 'hair' }}>
      <FieldGroup
        seamless
        group={{
          title,
          fields: actorsByType.reduce(
            (memo, actors, actortypeid) => ([
              ...memo,
              getActorConnectionField({
                actors,
                taxonomies,
                onEntityClick,
                connections: actorConnections,
                typeid: actortypeid,
                columns: getActortypeColumns(actortypeid),
              }),
            ]),
            [],
          ),
        }}
      />
    </Box>
  );
}

TabActorsAccordionChildActors.propTypes = {
  // targetIds: PropTypes.object,
  actorsByType: PropTypes.object,
  onEntityClick: PropTypes.func,
  getActortypeColumns: PropTypes.func,
  taxonomies: PropTypes.object,
  actorConnections: PropTypes.object,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]),
};

const mapStateToProps = (state, { actorIds }) => ({
  actorsByType: selectChildActorsByType(state, actorIds),
});

export default connect(mapStateToProps, null)(TabActorsAccordionChildActors);
