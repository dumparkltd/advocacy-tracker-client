import React from 'react';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import styled from 'styled-components';
import {
  Box, Text, ResponsiveContext,
} from 'grommet';

import { VERSION } from 'themes/config';
import Container from 'components/styled/Container';
// import PrintHide from 'components/styled/PrintHide';
import BoxPrint from 'components/styled/BoxPrint';
import { usePrint } from 'containers/App/PrintContext';
import Icon from 'components/Icon';

import { isMinSize } from 'utils/responsive';

import appMessages from 'containers/App/messages';

import BrandTitle from './BrandTitle';
import messages from './messages';

const FooterMain = styled.div`
  background-color: ${({ isPrint }) => isPrint ? 'transparent' : '#000000'};
  color: ${({ isPrint, theme }) => isPrint ? theme.global.colors.text.secondary : 'white'};
  border-top: 1px solid;
  border-color: ${({ isPrint, theme }) => isPrint ? theme.global.colors.text.secondary : 'transparent'};
  padding: 0;
  @media print {
    color: ${({ theme }) => theme.global.colors.text.secondary} !important;
    border-color: ${({ theme }) => theme.global.colors.text.secondary};
    background: transparent;
  }
`;
const FooterLink = styled.a`
  font-weight: bold;
  color: ${({ isPrint, theme }) => isPrint ? theme.global.colors.text.secondary : 'white'};
  &:hover {
    color: white;
    text-decoration: underline;
  }
  @media print {
    color: ${({ theme }) => theme.global.colors.text.secondary} !important;
  }
`;

const LogoWrap = styled((p) => <Box {...p} />)`
  background: white;
  color: black;
  height: 65px;
  width: 60px;
  @media print {
    height: 60px;
    width: 60px;
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.large}) {
    height:  ${({ isPrint }) => isPrint ? '62' : '93'}px;
    width:  ${({ isPrint }) => isPrint ? '62' : '85'}px;
  }
`;
const Label = styled((p) => <Text {...p} />)`
  font-family: ${({ theme }) => theme.fonts.title};
`;
const StyledBoxPrint = styled((p) => (
  <BoxPrint
    fill
    pad={isMinSize(p.size, 'large') ? 'medium' : 'small'}
    justify="center"
    {...p}
  />
))`
  min-height: unset;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    min-height: ${({ theme }) => theme.sizes.footer.height}px;
  }
`;
const FooterWrapper = styled((p) => <Box {...p} />)`
  padding: ${({ theme }) => theme.global.edgeSize.small};
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    padding: 0px;
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.large}) {
    padding-left: ${({ theme }) => theme.global.edgeSize.medium};
    padding-right: ${({ theme }) => theme.global.edgeSize.medium};
  }
`;
function Footer({
  intl,
}) {
  const size = React.useContext(ResponsiveContext);
  // const appTitle = `${intl.formatMessage(appMessages.app.claim)} - ${intl.formatMessage(appMessages.app.title)}`;
  const appTitle = `${intl.formatMessage(appMessages.app.title)}`;
  const isPrint = usePrint();
  return (
    <FooterMain isPrint={isPrint}>
      <Container noPaddingBottom>
        <FooterWrapper
          direction={isMinSize(size, 'medium') ? 'row' : 'column'}
          fill="vertical"
        >
          <StyledBoxPrint
            size={size}
            pad={{
              left: isMinSize(size, 'large') ? 'medium' : 'small',
              right: 'none',
            }}
            align="center"
            direction="row"
            justify="start"
            basis="1/4"
            gap={isMinSize(size, 'large') ? 'small' : 'xsmall'}
          >
            <LogoWrap isPrint={isPrint}>
              <Icon name="logo" size={isMinSize(size, 'large') ? '80px' : '60px'} />
            </LogoWrap>
            <Box
              fill="vertical"
              pad={{ left: 'small' }}
              justify="center"
              gap="xxsmall"
            >
              <BrandTitle size={isMinSize(size, 'large') ? 'xlarge' : 'large'}>
                <FormattedMessage {...appMessages.app.title} />
              </BrandTitle>
            </Box>
          </StyledBoxPrint>
          <StyledBoxPrint size={size} basis="1/2" gap="small">
            <Text size={isMinSize(size, 'large') ? 'small' : 'xsmall'}>
              <FormattedMessage {...messages.disclaimer} />
            </Text>
            <Text size={isMinSize(size, 'large') ? 'small' : 'xsmall'}>
              <FormattedMessage
                {...messages.disclaimer2}
                values={{
                  contact1: (
                    <FooterLink
                      isPrint={isPrint}
                      target="_blank"
                      href={`mailto:${intl.formatMessage(messages.contact.email)}`}
                      title={intl.formatMessage(messages.contact.anchor)}
                    >
                      <FormattedMessage {...messages.contact.anchor} />
                    </FooterLink>
                  ),
                  contact2: (
                    <FooterLink
                      isPrint={isPrint}
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
          </StyledBoxPrint>
          <StyledBoxPrint basis="1/4" gap="none">
            <Label size="medium">
              {appTitle}
            </Label>
            <Label size="medium">
              {`Version: ${VERSION}`}
            </Label>
          </StyledBoxPrint>
        </FooterWrapper>
      </Container>
    </FooterMain>
  );
}

Footer.propTypes = {
  intl: intlShape.isRequired,
};

// Wrap the component to inject dispatch and state into it
export default injectIntl(Footer);
