import React from 'react';
// import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Box, Heading } from 'grommet';

import { ROUTES, ACTIONTYPES } from 'themes/config';

import NavSecondary from 'containers/NavSecondary';
import Footer from 'containers/Footer';
import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import Container from 'components/styled/Container';
import ContentSimple from 'components/styled/ContentSimple';

import appMessages from 'containers/App/messages';
import messages from './messages';

import PositionsMap from './PositionsMap';
import PositionsList from './PositionsList';

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

export function OverviewPositions({ intl }) {
  return (
    <ContainerWrapper bg>
      <NavSecondary
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
      <ViewContainer>
        <ContentSimple>
          <Box pad={{ top: 'large' }}>
            <TitleMedium>
              <FormattedMessage {...messages.pageTitle} />
            </TitleMedium>
          </Box>
          <Box gap="small">
            <PositionsList />
            <PositionsMap />
          </Box>
        </ContentSimple>
      </ViewContainer>
      <Footer />
    </ContainerWrapper>
  );
}

OverviewPositions.propTypes = {
  intl: intlShape.isRequired,
  // onUpdatePath: PropTypes.func.isRequired,
  // types: PropTypes.instanceOf(Map),
};

export default injectIntl(OverviewPositions);
