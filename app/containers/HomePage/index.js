/*
 * HomePage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import ReactMarkdown from 'react-markdown';
import styled, { withTheme } from 'styled-components';
import { Box } from 'grommet';
import Container from 'components/styled/Container';

import { loadEntitiesIfNeeded, updatePath } from 'containers/App/actions';
import { selectIsSignedIn } from 'containers/App/selectors';

import ButtonHero from 'components/buttons/ButtonHero';

import Footer from 'containers/Footer';

import appMessages from 'containers/App/messages';

import { ROUTES, IS_DEV } from 'themes/config';

import { DEPENDENCIES } from './constants';

import messages from './messages';

const Styled = styled.div`
  background: ${({ theme }) => theme.global.colors.background};
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  overflow: hidden auto;
`;
const SectionTop = styled.div`
  min-height: 90vH;
  display: ${(props) => props.hasBrand ? 'block' : 'table'};
  width: ${(props) => props.hasBrand ? 'auto' : '100%'};
  color: ${({ theme }) => theme.global.colors.brand};
  text-align: center;
`;

const SectionWrapper = styled.div`
  display: ${(props) => props.hasBrand ? 'block' : 'table-cell'};
  vertical-align: ${(props) => props.hasBrand ? 'baseline' : 'middle'};
  padding-bottom: 1em;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.xlarge}) {
    padding-bottom: 3em;
  }
`;

const HomeActions = styled.div`
  margin-top: 30px;
  margin-bottom: 50px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.large}) {
    margin-top: 50px;
  }
`;
const Title = styled.h1`
  margin: 40px 0 20px;
  color: ${({ theme }) => theme.global.colors.brand};
  font-family: ${(props) => props.theme.fonts.title};
  font-weight: 400;
  font-size: ${({ theme }) => theme.text.xxlarge.size};
  line-height: ${({ theme }) => theme.text.xxlarge.size.height};
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    font-size: ${({ theme }) => theme.text.xxxlarge.size};
    line-height: ${({ theme }) => theme.text.xxxlarge.size.height};
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.home.print.title};
  }
`;

const Intro = styled(ReactMarkdown)`
  font-size: ${({ hint, theme }) => theme.text[hint ? 'small' : 'medium'].size};
  line-height: ${({ hint, theme }) => theme.text[hint ? 'small' : 'medium'].height};
  color: ${({ hint, theme }) => theme.global.colors.text[hint ? 'secondary' : 'brand']};
  margin-left: auto;
  margin-right: auto;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.large}) {
    font-size: ${({ hint, theme }) => theme.text[hint ? 'medium' : 'large'].size};
    line-height: ${({ hint, theme }) => theme.text[hint ? 'medium' : 'large'].height};
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.print.large};
  }
`;

const MainButton = styled(ButtonHero)`
  max-width: ${({ single }) => single ? 'auto' : '250px'};
  width: 100%;
  display: block;
  margin: 10px auto;
  min-width: auto;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    display: inline-block;
    margin: 10px 5px 0;
    min-width: auto;
    width: ${({ single }) => single ? 'auto' : '250px'};
  }
  @media print {
    display: none;
  }
`;

export class HomePage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
  }

  render() {
    const { intl } = this.context;
    const {
      onPageLink, isUserSignedIn,
    } = this.props;
    return (
      <Styled>
        <Helmet
          title={intl.formatMessage(messages.pageTitle)}
          meta={[
            { name: 'description', content: intl.formatMessage(messages.metaDescription) },
          ]}
        />
        <SectionTop>
          <SectionWrapper>
            <Container noPaddingBottom>
              <Title>
                <FormattedMessage {...appMessages.app.title} />
              </Title>
              <Intro source={intl.formatMessage(messages.intro, { isDev: IS_DEV })} />
              <HomeActions>
                {!isUserSignedIn && (
                  <Box>
                    <Intro hint source={intl.formatMessage(messages.notSignedIn)} />
                    <Box direction="row" gap="xsmall" justify="center">
                      <MainButton
                        space
                        onClick={() => onPageLink(ROUTES.LOGIN)}
                        count={2}
                      >
                        <FormattedMessage {...appMessages.nav.login} />
                      </MainButton>
                      <MainButton
                        space
                        onClick={() => onPageLink(ROUTES.REGISTER)}
                        count={2}
                      >
                        <FormattedMessage {...appMessages.nav.register} />
                      </MainButton>
                    </Box>
                  </Box>
                )}
              </HomeActions>
            </Container>
          </SectionWrapper>
        </SectionTop>
        <Footer />
      </Styled>
    );
  }
}

HomePage.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func.isRequired,
  onPageLink: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
  isUserSignedIn: PropTypes.bool,
  dataReady: PropTypes.bool,
};

HomePage.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  isUserSignedIn: selectIsSignedIn(state),
});

function mapDispatchToProps(dispatch) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onPageLink: (path) => {
      dispatch(updatePath(path));
    },
    // onSelectActortype: (actortype) => {
    //   dispatch(updatePath(
    //     ROUTES.OVERVIEW,
    //     {
    //       query: {
    //         arg: 'actortype',
    //         value: actortype,
    //         replace: true,
    //       },
    //       extend: true,
    //     },
    //   ));
    // },
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(withTheme(HomePage));
