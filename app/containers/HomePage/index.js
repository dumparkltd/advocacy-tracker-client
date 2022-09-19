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
import Grid from 'grid-styled';
import Row from 'components/styled/Row';
import Container from 'components/styled/Container';

import { loadEntitiesIfNeeded, updatePath } from 'containers/App/actions';
import {
  selectIsSigningIn,
  selectIsUserVisitor,
  selectIsSignedIn,
} from 'containers/App/selectors';

import ButtonHero from 'components/buttons/ButtonHero';
// import ButtonFlat from 'components/buttons/ButtonFlat';
// import NormalImg from 'components/Img';
import Loading from 'components/Loading';
import Footer from 'containers/Footer';

import appMessages from 'containers/App/messages';

import { ROUTES } from 'themes/config';

import { DEPENDENCIES } from './constants';

import messages from './messages';

const Styled = styled.div`
  background: ${({ theme }) => theme.global.colors.background};
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
  padding-bottom: 3em;
  @media (min-width: ${(props) => props.theme.breakpoints.xlarge}) {
    padding-bottom: 6em;
  }
`;

const HomeActions = styled.div`
  margin-top: 30px;
  margin-bottom: 50px;
  @media (min-width: ${(props) => props.theme.breakpoints.large}) {
    margin-top: 50px;
  }
`;
const Title = styled.h1`
  margin: 5px 0 20px;
  color: ${({ theme }) => theme.global.colors.brand};
  font-family: ${(props) => props.theme.fonts.title};
  font-weight: 400;
  font-size: ${({ theme }) => theme.text.xxlarge.size};
  line-height: ${({ theme }) => theme.text.xxlarge.size.height};
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    font-size: ${({ theme }) => theme.text.xxxlarge.size};
    line-height: ${({ theme }) => theme.text.xxxlarge.size.height};
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.home.print.title};
  }
`;

const Claim = styled.p`
  color: ${({ theme }) => theme.global.colors.text.brand};
  font-family: ${(props) => props.theme.fonts.claim};
  font-size: ${(props) => props.theme.sizes.home.text.claimMobile};
  font-weight: 100;
  margin-left: auto;
  margin-right: auto;
  margin-top: 20px;
  margin-bottom: 0px;
  line-height: 1.3;
  font-size: ${({ theme }) => theme.text.large.size};
  line-height: ${({ theme }) => theme.text.large.size.height};
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    font-size: ${({ theme }) => theme.text.xlarge.size};
    line-height: ${({ theme }) => theme.text.xlarge.size.height};
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.home.print.claim};
  }
`;

const Intro = styled(ReactMarkdown)`
  font-size: ${({ hint, theme }) => theme.text[hint ? 'small' : 'medium'].size};
  line-height: ${({ hint, theme }) => theme.text[hint ? 'small' : 'medium'].height};
  color: ${({ hint, theme }) => theme.global.colors.text[hint ? 'secondary' : 'brand']};
  margin-left: auto;
  margin-right: auto;
  @media (min-width: ${(props) => props.theme.breakpoints.large}) {
    font-size: ${({ hint, theme }) => theme.text[hint ? 'medium' : 'large'].size};
    line-height: ${({ hint, theme }) => theme.text[hint ? 'medium' : 'large'].height};
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.print.large};
  }
`;
const GridSpace = styled(Grid)`
  display: none !important;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    display: inline-block;
  }
`;

const MainButton = styled(ButtonHero)`
  max-width: ${({ single }) => single ? 'auto' : '250px'};
  width: 100%;
  display: block;
  margin: 10px auto;
  min-width: auto;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    display: inline-block;
    margin: 10px 5px 0;
    min-width: auto;
    width: ${({ single }) => single ? 'auto' : '250px'};
  }
  @media print {
    display: none;
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
      onPageLink, isUserSigningIn, isUserSignedIn, isUserVisitor,
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
                {!isUserSigningIn && isUserSignedIn && isUserVisitor && (
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
                {!isUserSigningIn && isUserSignedIn && !isUserVisitor && (
                  <Row>
                    <GridSpace lg={1 / 6} sm={1 / 8} />
                    <Intro hint source={intl.formatMessage(messages.noRoleAssigned)} />
                  </Row>
                )}
                {!isUserSigningIn && !isUserSignedIn && (
                  <Row>
                    <GridSpace lg={1 / 6} sm={1 / 8} />
                    <Grid lg={2 / 3} sm={3 / 4} xs={1}>
                      <Intro hint source={intl.formatMessage(messages.notSignedIn)} />
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
      </Styled>
    );
  }
}

HomePage.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func.isRequired,
  onPageLink: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
  isUserSigningIn: PropTypes.bool,
  isUserSignedIn: PropTypes.bool,
  isUserVisitor: PropTypes.bool,
  dataReady: PropTypes.bool,
};

HomePage.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  isUserSigningIn: selectIsSigningIn(state),
  isUserSignedIn: selectIsSignedIn(state),
  isUserVisitor: selectIsUserVisitor(state),
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
