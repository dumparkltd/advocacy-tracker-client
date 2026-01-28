import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FieldFactory from 'components/fields/FieldFactory';
import styled from 'styled-components';
import { Box, Text } from 'grommet';
import { injectIntl, intlShape } from 'react-intl';

import { API, ACTION_INDICATOR_SUPPORTLEVELS } from 'themes/config';

import { getIndicatorConnectionField } from 'utils/fields';

import {
  loadEntitiesIfNeeded,
} from 'containers/App/actions';

import {
  selectReady,
  selectActorConnections,
} from 'containers/App/selectors';


import appMessages from 'containers/App/messages';

import { selectChildIndicators } from './selectors';

export const DEPENDENCIES = [
  API.INDICATORS,
  API.ACTIONS,
  API.ACTION_INDICATORS,
  API.ACTORS,
  API.ACTOR_ACTIONS,
];

const SectionTitle = styled((p) => <Text size="xsmall" {...p} />)`
  text-transform: uppercase;
  font-weight: bold;
`;

export function ChildIndicatorsField({
  content,
  onEntityClick,
  onLoadEntitiesIfNeeded,
  dataReady,
  intl,
  // isAdmin,
  actorConnections,
  childIndicators,
}) {
  useEffect(() => {
    if (!dataReady) onLoadEntitiesIfNeeded();
  }, [dataReady]);
  const field = getIndicatorConnectionField({
    indicators: childIndicators,
    connections: actorConnections,
    onEntityClick,
    skipLabel: true,
    columns: [
      {
        id: 'main',
        type: 'main',
        sort: 'reference',
        attributes: ['code', 'title'],
      },
      {
        id: 'support', // one row per type,
        type: 'stackedBarActions', // one row per type,
        values: 'supportlevels',
        title: 'Support',
        options: ACTION_INDICATOR_SUPPORTLEVELS,
        minSize: 'small',
        info: {
          type: 'key-categorical',
          title: 'Support by number of countries',
          attribute: 'supportlevel_id',
          options: Object.values(ACTION_INDICATOR_SUPPORTLEVELS)
            .sort((a, b) => a.order < b.order ? -1 : 1)
            .map((level) => ({
              ...level,
              label: intl.formatMessage(appMessages.supportlevels[level.value]),
            })),
        },
      },
    ],
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

ChildIndicatorsField.propTypes = {
  onLoadEntitiesIfNeeded: PropTypes.func,
  content: PropTypes.object, // immutable Map
  // indicator: PropTypes.object, // immutable Map
  childIndicators: PropTypes.object, // immutable Map
  actorConnections: PropTypes.object, // immutable Map
  onEntityClick: PropTypes.func,
  dataReady: PropTypes.bool,
  intl: intlShape,
};

const mapStateToProps = (state, { indicator }) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  actorConnections: selectActorConnections(state),
  childIndicators: selectChildIndicators(state, indicator.get('id')),
});
export function mapDispatchToProps(dispatch) {
  return {
    onLoadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ChildIndicatorsField));
