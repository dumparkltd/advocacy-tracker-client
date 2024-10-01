import React from 'react';
// import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Box, Heading } from 'grommet';

import styled from 'styled-components';

import appMessages from 'containers/App/messages';

import { ROUTES, ACTIONTYPES } from 'themes/config';

import HeaderExplore from 'containers/HeaderExplore';
import Footer from 'containers/Footer';

import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import Container from 'components/styled/Container';
import ContentSimple from 'components/styled/ContentSimple';
import PositionsMap from './PositionsMap';

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
export function OverviewPositions({ intl }) {
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
      <ViewContainer>
        <ContentSimple>
          <Box pad={{ top: 'large' }}>
            <TitleMedium>
              <FormattedMessage {...messages.pageTitle} />
            </TitleMedium>
          </Box>
          <PositionsMap />
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
