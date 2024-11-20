import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FieldFactory from 'components/fields/FieldFactory';
import styled from 'styled-components';
import { Box, Text } from 'grommet';
import { injectIntl, intlShape } from 'react-intl';

import { API, ACTIONTYPES } from 'themes/config';

// import qe from 'utils/quasi-equals';

import { getIndicatorColumnsForStatement } from 'utils/entities';
import { getIndicatorConnectionField } from 'utils/fields';

import {
  loadEntitiesIfNeeded,
} from 'containers/App/actions';

import {
  selectReady,
} from 'containers/App/selectors';

import {
  selectActionIndicators,
} from './selectors';

export const DEPENDENCIES = [
  API.INDICATORS,
  API.ACTIONS,
  API.ACTION_INDICATORS,
];

const SectionTitle = styled((p) => <Text size="xsmall" {...p} />)`
  text-transform: uppercase;
  font-weight: bold;
`;

export function StatementIndicatorsField({
  content,
  onEntityClick,
  onLoadEntitiesIfNeeded,
  dataReady,
  statement,
  intl,
  isAdmin,
  indicators,
}) {
  useEffect(() => {
    if (!dataReady) onLoadEntitiesIfNeeded();
  }, [dataReady]);

  const field = getIndicatorConnectionField({
    indicators,
    onEntityClick,
    // connections: indicatorConnections,
    skipLabel: true,
    columns: getIndicatorColumnsForStatement({
      action: statement,
      intl,
      isAdmin,
    }),
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

StatementIndicatorsField.propTypes = {
  onLoadEntitiesIfNeeded: PropTypes.func,
  content: PropTypes.object, // immutable Map
  statement: PropTypes.object, // immutable Map
  indicators: PropTypes.object, // immutable Map
  onEntityClick: PropTypes.func,
  dataReady: PropTypes.bool,
  isAdmin: PropTypes.bool,
  intl: intlShape,
};

const mapStateToProps = (state, { statement }) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  indicators: selectActionIndicators(
    state,
    {
      id: statement.get('id'),
      actionType: ACTIONTYPES.EXPRESS,
    },
  ),
});
export function mapDispatchToProps(dispatch) {
  return {
    onLoadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(StatementIndicatorsField));
