import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'redux';

import styled from 'styled-components';

import {
  Box,
  Text,
  Heading,
  ResponsiveContext,
} from 'grommet';

import {
  ACTORTYPES,
  ACTION_INDICATOR_SUPPORTLEVELS,
  ROUTES,
} from 'themes/config';

import { isMinSize } from 'utils/responsive';

import {
  loadEntitiesIfNeeded,
  setIncludeActorMembers,
  updateRouteQuery,
  // setPreviewContent,
  updatePath,
} from 'containers/App/actions';

import {
  selectReady,
  // selectIndicators,
  // selectActorsWithPositions,
  selectIncludeActorMembers,
  selectIncludeInofficialStatements,
  // selectPreviewQuery,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';
import Loading from 'components/Loading';
import ButtonPrimary from 'components/buttons/ButtonPrimaryNew';
import Dot from 'components/styled/Dot';

import Card from 'containers/OverviewPositions/Card';

import { DEPENDENCIES } from './constants';

import ComponentOptions from './ComponentOptions';

import messages from './messages';

const ComponentTitle = styled((p) => <Heading level="3" {...p} />)`
  color: black;
  font-weight: bold;
  margin: 0;
`;
const Title = styled((p) => <Heading level="5" {...p} />)`
  color: black;
  text-transform: uppercase;
  font-weight: bold;
`;
const ID = 'positions-list';

export function PositionsList({
  dataReady,
  onLoadData,
  // indicators,
  // countries,
  onSetIncludeActorMembers,
  includeActorMembers,
  includeInofficialStatements,
  onUpdateQuery,
  intl,
  // previewItemId,
  // onSetPreviewContent,
  onUpdatePath,
}) {
  useEffect(() => {
    // kick off loading of data
    onLoadData();
  }, []);

  const size = React.useContext(ResponsiveContext);

  let supportLevels = Object.values(ACTION_INDICATOR_SUPPORTLEVELS)
    .filter((level) => parseInt(level.value, 10) > 0) // exclude 0
    .sort((a, b) => a.order > b.order ? 1 : -1);

  supportLevels = supportLevels
    .map((level) => ({
      ...level,
      label: intl.formatMessage(appMessages.supportlevels[level.value]),
    }));

  const options = [
    {
      id: `${ID}-0`,
      active: includeActorMembers,
      label: intl.formatMessage(appMessages.ui.statementOptions.includeMemberships),
      onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
    },
    {
      id: `${ID}-1`,
      active: !includeInofficialStatements,
      label: intl.formatMessage(appMessages.ui.statementOptions.excludeInofficial),
      onClick: () => onUpdateQuery([{
        arg: 'inofficial',
        value: includeInofficialStatements ? 'false' : null,
        replace: true,
        multipleAttributeValues: false,
      }]),
    },
  ];
  return (
    <Box pad={{ top: 'small', bottom: 'xsmall' }}>
      <Box pad={{ top: 'small', bottom: 'xsmall' }}>
        <Title>
          <FormattedMessage {...messages.title} />
        </Title>
      </Box>
      <Card>
        <Box
          direction="column"
          fill="horizontal"
          pad={{ horizontal: 'medium', bottom: 'none' }}
          flex={{ grow: 1, shrink: 1 }}
        >
          <Loading loading={!dataReady} />
          {dataReady && (
            <>
              {isMinSize(size, 'medium') && (
                <Box gap="small" margin={{ vertical: 'small' }}>
                  <ComponentTitle>
                    Countries
                  </ComponentTitle>
                </Box>
              )}
              <Box direction="row" justify="between" gap="small" align="end">
                <Box gap="xsmall">
                  <Text weight={600}>Levels of support</Text>
                  <Box direction="row" wrap gap="xsmall">
                    {supportLevels && supportLevels.map((level) => (
                      <Box direction="row" align="center" gap="xsmall">
                        <Dot size="16px" color={level.color} />
                        <Text size="small">{level.label}</Text>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <ComponentOptions
                  options={options}
                  onUpdateQuery={onUpdateQuery}
                />
              </Box>
              <Box
                direction="row"
                justify="end"
                pad={{ top: 'small' }}
                gap="none"
              >
                <ButtonPrimary
                  onClick={(e) => {
                    if (e && e.preventDefault) e.preventDefault();
                    onUpdatePath(`${ROUTES.ACTORS}/${ACTORTYPES.COUNTRY}`);
                  }}
                  label={(
                    <Text size="large">
                      Full Country List
                    </Text>
                  )}
                />
              </Box>
            </>
          )}
        </Box>
      </Card>
    </Box>
  );
}

PositionsList.propTypes = {
  dataReady: PropTypes.bool,
  onLoadData: PropTypes.func.isRequired,
  // countries: PropTypes.object,
  // indicators: PropTypes.object,
  onSetIncludeActorMembers: PropTypes.func,
  includeActorMembers: PropTypes.bool,
  includeInofficialStatements: PropTypes.bool,
  onUpdateQuery: PropTypes.func,
  // previewItemId: PropTypes.string,
  // onSetPreviewContent: PropTypes.func,
  onUpdatePath: PropTypes.func,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  // indicators: selectIndicators(state),
  includeInofficialStatements: selectIncludeInofficialStatements(state),
  includeActorMembers: selectIncludeActorMembers(state),
  // countries: selectActorsWithPositions(state, { type: ACTORTYPES.COUNTRY }),
  // previewItemId: selectPreviewQuery(state),
});

export function mapDispatchToProps(dispatch) {
  return {
    onLoadData: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onSetIncludeActorMembers: (value) => dispatch(setIncludeActorMembers(value)),
    onUpdateQuery: (value) => dispatch(updateRouteQuery(value)),
    // onSetPreviewContent: (value) => dispatch(setPreviewContent(value)),
    onUpdatePath: (path) => dispatch(updatePath(path)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(PositionsList));
