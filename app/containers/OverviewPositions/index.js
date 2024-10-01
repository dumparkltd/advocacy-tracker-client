import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Box, Heading } from 'grommet';

import styled from 'styled-components';

import appMessages from 'containers/App/messages';

import { ROUTES, ACTIONTYPES } from 'themes/config';
import { loadEntitiesIfNeeded } from 'containers/App/actions';

import {
  selectReady,
} from 'containers/App/selectors';

import HeaderExplore from 'containers/HeaderExplore';
import Footer from 'containers/Footer';

import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import Container from 'components/styled/Container';
import ContentSimple from 'components/styled/ContentSimple';
import Loading from 'components/Loading';
import PositionsMap from './PositionsMap';

import { DEPENDENCIES } from './constants';
import messages from './messages';

const ViewContainer = styled(Container)`
  min-height: 80vH;
  @media print {
    min-height: 50vH;
  }
`;

const TitleMedium = styled((p) => <Heading level="2" {...p} />)`
  color: black;
  text-transform: uppercase;
  font-weight: bold;
`;
export function OverviewPositions({
  onLoadData,
  intl,
  dataReady,
}) {
  useEffect(() => {
    // kick off loading of data
    onLoadData();
  }, []);

  return (
    <ContainerWrapper bg>
      <HeaderExplore
        navItems={[
          {
            path: ROUTES.POSITIONS,
            active: true,
            title: 'Overview',
          },
          {
            path: `${ROUTES.ACTIONS}/${ACTIONTYPES.EXPRESS}`,
            title: intl.formatMessage(appMessages.entities[`actions_${ACTIONTYPES.EXPRESS}`].plural),
          },
          {
            path: ROUTES.INDICATORS,
            title: intl.formatMessage(appMessages.entities.indicators.plural),
          },
        ]}
      />
      <Loading loading={!dataReady} />
      <ViewContainer>
        <ContentSimple>
          <Box pad={{ top: 'large' }}>
            <TitleMedium>
              <FormattedMessage {...messages.pageTitle} />
            </TitleMedium>
          </Box>
          {dataReady && <PositionsMap />}
        </ContentSimple>
      </ViewContainer>
      <Footer />
    </ContainerWrapper>
  );
}

OverviewPositions.propTypes = {
  intl: intlShape.isRequired,
  dataReady: PropTypes.bool,
  onLoadData: PropTypes.func.isRequired,
  // onUpdatePath: PropTypes.func.isRequired,
  // types: PropTypes.instanceOf(Map),
};

const mapStateToProps = createStructuredSelector({
  dataReady: (state) => selectReady(state, { path: DEPENDENCIES }),
});


export function mapDispatchToProps(dispatch) {
  return {
    onLoadData: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(OverviewPositions));
