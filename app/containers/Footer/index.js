import React from 'react';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import styled from 'styled-components';
import { Box, Text, ResponsiveContext } from 'grommet';

import { version } from 'themes/config';
import Container from 'components/styled/Container';
import { isMinSize } from 'utils/responsive';

import appMessages from 'containers/App/messages';
import messages from './messages';

const FooterMain = styled.div`
  background-color: #183863;
  color: white;
  padding: 0;
  @media print {
    color: black;
    background: transparent;
  }
`;

const FooterLink = styled.a`
  font-weight: bold;
  color: white;
  &:hover {
    color: white;
    text-decoration: underline;
  }
`;

const Between = styled((p) => <Box plain {...p} />)`
  flex: 0 0 auto;
  align-self: stretch;
  width: ${({ direction }) => direction === 'row' ? '1px' : '100%'};
  position: relative;
  &:after {
    content: "";
    position: absolute;
    height: 100%;
    width: 100%;
    left: 0;
    top: 0;
    border-left: ${({ direction }) => direction === 'row' ? 1 : 0}px solid rgba(0, 0, 0, 1);
    border-top: ${({ direction }) => direction === 'column' ? 1 : 0}px solid rgba(0, 0, 0, 1);
  }
`;
function Footer({
  intl,
}) {
  const size = React.useContext(ResponsiveContext);
  // const appTitle = `${intl.formatMessage(appMessages.app.claim)} - ${intl.formatMessage(appMessages.app.title)}`;
  const appTitle = `${intl.formatMessage(appMessages.app.title)}`;

  return (
    <FooterMain>
      <Container noPaddingBottom>
        <Box direction={isMinSize(size, 'medium') ? 'row' : 'column'} fill="vertical">
          <Box pad="medium" fill basis="1/2">
            <Text size="small">
              {appTitle}
            </Text>
            <Text size="xsmall">
              {`Version: ${version}`}
            </Text>
          </Box>
          <Between direction={isMinSize(size, 'medium') ? 'row' : 'column'} />
          <Box pad="medium" fill basis="1/2" gap="small" style={{ minHeight: '150px' }}>
            <Text size="small">
              <FormattedMessage {...messages.disclaimer} />
            </Text>
            <Text size="small">
              <FormattedMessage
                {...messages.disclaimer2}
                values={{
                  contact1: (
                    <FooterLink
                      target="_blank"
                      href={`mailto:${intl.formatMessage(messages.contact.email)}`}
                      title={intl.formatMessage(messages.contact.anchor)}
                    >
                      <FormattedMessage {...messages.contact.anchor} />
                    </FooterLink>
                  ),
                  contact2: (
                    <FooterLink
                      target="_blank"
                      href={`mailto:${intl.formatMessage(messages.contact2.email)}`}
                      title={intl.formatMessage(messages.contact2.anchor)}
                    >
                      <FormattedMessage {...messages.contact2.anchor} />
                    </FooterLink>
                  ),
                }}
              />
            </Text>
          </Box>
        </Box>
      </Container>
    </FooterMain>
  );
}

Footer.propTypes = {
  intl: intlShape.isRequired,
};

// Wrap the component to inject dispatch and state into it
export default injectIntl(Footer);
