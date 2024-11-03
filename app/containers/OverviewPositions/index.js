import React from 'react';
// import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Box } from 'grommet';

import { ROUTES, ACTIONTYPES } from 'themes/config';

import NavSecondary from 'containers/NavSecondary';
import Footer from 'containers/Footer';
import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import Container from 'components/styled/Container';
import ContentSimple from 'components/styled/ContentSimple';
import { TitleMedium } from 'containers/ContentHeader';

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

const Title = styled(TitleMedium)`
  font-size: 48px;
  margin: 0;
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
            <Title>
              <FormattedMessage {...messages.pageTitle} />
            </Title>
          </Box>
          <Box gap="medium" margin={{ bottom: 'xlarge' }}>
            <PositionsMap />
            <PositionsList />
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
