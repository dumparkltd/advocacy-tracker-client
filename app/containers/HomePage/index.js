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
import { palette } from 'styled-theme';
import Grid from 'grid-styled';
import Row from 'components/styled/Row';
import Container from 'components/styled/Container';

import { loadEntitiesIfNeeded, updatePath } from 'containers/App/actions';
import {
  selectIsSigningIn,
  selectIsUserAnalyst,
  selectIsSignedIn,
} from 'containers/App/selectors';

import ButtonHero from 'components/buttons/ButtonHero';
// import ButtonFlat from 'components/buttons/ButtonFlat';
import NormalImg from 'components/Img';
import Loading from 'components/Loading';
import Footer from 'containers/Footer';

import appMessages from 'containers/App/messages';

import {
  ROUTES,
  SHOW_HOME_TITLE,
  SHOW_BRAND_ON_HOME,
} from 'themes/config';

import { DEPENDENCIES } from './constants';

import messages from './messages';

const GraphicHome = styled(NormalImg)`
  width: 100%;
  max-width: 1200px;
`;

const SectionTop = styled.div`
  min-height: 90vH;
  display: ${(props) => props.hasBrand ? 'block' : 'table'};
  width: ${(props) => props.hasBrand ? 'auto' : '100%'};
  background-color: ${palette('home', 0)};
  color: ${palette('homeIntro', 0)};
  text-align: center;
  @media print {
    background-color: transparent;
    color: ${palette('text', 0)};
    display: block;
    min-height: auto;
  }
`;

const SectionWrapper = styled.div`
  display: ${(props) => props.hasBrand ? 'block' : 'table-cell'};
  vertical-align: ${(props) => props.hasBrand ? 'baseline' : 'middle'};
  padding-bottom: 3em;
  @media (min-width: ${(props) => props.theme.breakpoints.large}) {
    padding-bottom: 6em;
  }
`;

const HomeActions = styled.div`
  padding-top: 1em;
  @media (min-width: ${(props) => props.theme.breakpoints.large}) {
    padding-top: 2em;
  }
`;
const Title = styled.h1`
  color:${palette('headerBrand', 0)};
  font-family: ${(props) => props.theme.fonts.title};
  font-size: ${(props) => props.theme.sizes.home.text.titleMobile};
  /* text-transform: uppercase; */
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    font-size: ${(props) => props.theme.sizes.home.text.title};
  }
  @media (min-width: ${(props) => props.theme.breakpoints.large}) {
    margin-bottom: 1em;
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.home.print.title};
    color: ${palette('primary', 0)}
  }
`;

const Claim = styled.p`
  color: ${palette('headerBrand', 1)};
  font-family: ${(props) => props.theme.fonts.claim};
  font-size: ${(props) => props.theme.sizes.home.text.claimMobile};
  font-weight: 100;
  margin-left: auto;
  margin-right: auto;
  margin-top: 0.5em;
  line-height: 1.3;
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    font-size: ${(props) => props.theme.sizes.home.text.claim};
    margin-top: 2.5em;
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.home.print.claim};
    color: ${palette('primary', 0)}
  }
`;

const Intro = styled(ReactMarkdown)`
  font-size: 1em;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.3;
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    font-size: 1.1em;
  }
  @media (min-width: ${(props) => props.theme.breakpoints.large}) {
    font-size: 1.25em;
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.print.large};
  }
`;
const GridSpace = styled(Grid)`
  display: none !important;
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    display: inline-block;
  }
`;

const MainButton = styled(ButtonHero)`
  max-width: ${({ single }) => single ? 'auto' : '250px'};
  width: 100%;
  display: block;
  margin-bottom: 10px;
  min-width: auto;
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    display: inline-block;
    margin-bottom: 0;
    min-width: auto;
    width: ${({ single }) => single ? 'auto' : '250px'};
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.print.small};
    color: ${palette('primary', 0)};
    background: transparent;
    border: 1px solid ${palette('light', 3)};
    border-radius: 10px;
    max-width: ${({ count }) => count ? ((100 / count) - 2) : 100}%;
    min-width: auto;
    margin: 0 1%;
  }
`;

// const StyledButtonFlat = styled(ButtonFlat)`
//   color: ${palette('homeIntro', 0)};
//   @media print {
//     color: ${palette('text', 1)};
//     text-decoration: underline;
//   }
// `;

export class HomePage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
  }

  render() {
    const { intl } = this.context;
    const {
      theme, onPageLink, isUserSigningIn, isUserSignedIn, isUserAnalyst,
    } = this.props;
    const appTitle = `${intl.formatMessage(appMessages.app.title)} - ${intl.formatMessage(appMessages.app.claim)}`;
    return (
      <div>
        <Helmet
          title={intl.formatMessage(messages.pageTitle)}
          meta={[
            { name: 'description', content: intl.formatMessage(messages.metaDescription) },
          ]}
        />
        <SectionTop hasBrand={SHOW_BRAND_ON_HOME}>
          <SectionWrapper hasBrand={SHOW_BRAND_ON_HOME}>
            { !SHOW_HOME_TITLE
              && <GraphicHome src={theme.media.titleHome} alt={appTitle} />
            }
            <Container noPaddingBottom>
              { SHOW_HOME_TITLE
                && (
                  <Row>
                    <GridSpace lg={1 / 8} />
                    <Grid lg={3 / 4} sm={1}>
                      <Claim>
                        <FormattedMessage {...appMessages.app.claim} />
                      </Claim>
                      <Title>
                        <FormattedMessage {...appMessages.app.title} />
                      </Title>
                    </Grid>
                  </Row>
                )
              }
              <Row>
                <GridSpace lg={1 / 6} sm={1 / 8} />
                <Grid lg={2 / 3} sm={3 / 4} xs={1}>
                  <Intro source={intl.formatMessage(messages.intro)} />
                </Grid>
              </Row>
              <HomeActions>
                {isUserSigningIn && (
                  <Row>
                    <GridSpace lg={1 / 6} sm={1 / 8} />
                    <Grid lg={2 / 3} sm={3 / 4} xs={1}>
                      {isUserSigningIn && (
                        <FormattedMessage {...messages.signingIn} />
                      )}
                    </Grid>
                    <Grid lg={2 / 3} sm={3 / 4} xs={1}>
                      <Loading />
                    </Grid>
                  </Row>
                )}
                {!isUserSigningIn && isUserSignedIn && isUserAnalyst && (
                  <Row>
                    <GridSpace lg={1 / 6} sm={1 / 8} />
                    <Grid lg={1} sm={1} xs={1}>
                      <MainButton
                        space
                        onClick={() => onPageLink(ROUTES.ACTIONS)}
                        count={2}
                      >
                        <FormattedMessage {...appMessages.nav.actions} />
                      </MainButton>
                      <MainButton
                        space
                        onClick={() => onPageLink(ROUTES.ACTORS)}
                        count={2}
                      >
                        <FormattedMessage {...appMessages.nav.actors} />
                      </MainButton>
                    </Grid>
                  </Row>
                )}
                {!isUserSigningIn && isUserSignedIn && !isUserAnalyst && (
                  <Row>
                    <GridSpace lg={1 / 6} sm={1 / 8} />
                    <Intro source={intl.formatMessage(messages.noRoleAssigned)} />
                  </Row>
                )}
                {!isUserSigningIn && !isUserSignedIn && (
                  <Row>
                    <GridSpace lg={1 / 6} sm={1 / 8} />
                    <Grid lg={2 / 3} sm={3 / 4} xs={1}>
                      <Intro source={intl.formatMessage(messages.notSignedIn)} />
                    </Grid>
                    <Grid lg={1} sm={1} xs={1}>
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
                    </Grid>
                  </Row>
                )}
              </HomeActions>
            </Container>
          </SectionWrapper>
        </SectionTop>
        <Footer />
      </div>
    );
  }
}

HomePage.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func.isRequired,
  onPageLink: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
  isUserSigningIn: PropTypes.bool,
  isUserSignedIn: PropTypes.bool,
  isUserAnalyst: PropTypes.bool,
  dataReady: PropTypes.bool,
};

HomePage.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  isUserSigningIn: selectIsSigningIn(state),
  isUserSignedIn: selectIsSignedIn(state),
  isUserAnalyst: selectIsUserAnalyst(state),
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
