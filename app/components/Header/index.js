import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled, { withTheme } from 'styled-components';
import {
  Box, Button, ResponsiveContext, Heading,
} from 'grommet';
import { ROUTES, IS_DEV } from 'themes/config';
import { isMinSize } from 'utils/responsive';
import appMessages from 'containers/App/messages';
import Icon from 'components/Icon';
import ScreenReaderOnly from 'components/styled/ScreenReaderOnly';
// import PrintOnly from 'components/styled/PrintOnly';
import PrintHide from 'components/styled/PrintHide';
import BoxPrint from 'components/styled/BoxPrint';

import Brand from './Brand';
import LogoWrap from './LogoWrap';

// const Claim = styled((p) => <Text {...p} />)`
//   font-family: ${({ theme }) => theme.fonts.title};
//   font-size: ${({ theme }) => theme.text.xxsmall.size};
//   line-height: ${({ theme }) => theme.text.xxsmall.size};
//   @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
//     font-size: ${({ theme }) => theme.text.xsmall.size};
//     line-height: ${({ theme }) => theme.text.xsmall.size};
//   }
// `;
const BrandTitle = styled((p) => <Heading level={1} {...p} />)`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.title};
  font-size: ${({ theme, isDev }) => isDev ? theme.text.medium.size : theme.text.large.size};
  line-height: ${({ theme, isDev }) => isDev ? theme.text.medium.size : theme.text.large.size};
  font-weight: 500;
  padding: 0;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    font-size: ${({ theme, isDev }) => isDev ? theme.text.large.size : theme.text.xlarge.size};
    line-height: ${({ theme, isDev }) => isDev ? theme.text.large.size : theme.text.xlarge.size};
  }
  @media print {
    font-size: ${({ theme }) => theme.sizes.header.print.title};
  }
`;

const Styled = styled.div`
  position: ${({ sticky, fixed }) => {
    if (fixed) {
      return 'fixed';
    }
    return sticky ? 'absolute' : 'relative';
  }};
  top: 0;
  left: 0;
  right: 0;
  height:${({ theme }) => theme.sizes.header.banner.heightMobile}px;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    height:${({ theme }) => theme.sizes.header.banner.height}px;
  }
  background-color: #000;
  box-shadow: ${({ hasShadow }) => hasShadow ? '0px 0px 5px 0px rgba(0,0,0,0.5)' : 'none'};
  z-index: 102;
  @media print {
    display: ${({ isPrint }) => isPrint ? 'none' : 'block'};
    position: static;
    box-shadow: none;
    background: white;
  }
`;

const LinkMenu = styled((p) => <Button plain as="a" justify="center" fill="vertical" {...p} />)`
  color: ${({ active }) => active ? 'black' : 'white'};
  background-color: ${({ active }) => active ? 'white' : 'transparent'};
  text-transform: uppercase;
  font-family: ${({ theme }) => theme.fonts.title};
  font-size: ${({ theme }) => theme.text.large.size};
  line-height: ${({ theme }) => theme.text.large.size};

  padding-right: 12px;
  padding-left: 12px;
  padding-top: 22px;
  padding-bottom: 0px;
  text-align: center;
  font-size: ${({ theme }) => theme.text.small.size};
  line-height: ${({ theme }) => theme.text.small.height};
  font-weight: 300;
  height:${({ theme }) => theme.sizes.header.banner.height}px;
  &:hover {
    color: ${({ active }) => active ? 'black' : 'white'};
    background-color: ${({ active }) => active ? '#f0f0f0' : '#282a2c'};
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    font-size: ${({ theme }) => theme.text.xlarge.size};
    line-height: ${({ theme }) => theme.text.xlarge.size};
  }
  @media print {
    font-size: ${({ theme }) => theme.sizes.header.print.title};
  }
`;
const LinkInHiddenMenu = styled((p) => <Button plain as="a" {...p} />)`
  color: black;
  background-color: ${({ active }) => active ? '#f0f0f0' : 'transparent'};
  padding: 12px;
  width: 100%;
  font-size: ${({ theme }) => theme.text.small.size};
  line-height: ${({ theme }) => theme.text.small.height};
  font-weight: ${({ active }) => active ? 500 : 300};
  &:hover {
    color: black;
    background-color: #dddddd;
  }
`;

const ToggleMenu = styled((p) => <Button plain as="a" {...p} />)`
  display: block;
  z-index: 300;
  background-color: black;
  color: white;
  &:hover {
    color: white;
    opacity: 0.9;
  }
`;

const Section = styled((p) => <Box margin={{ top: 'medium' }} {...p} />)``;
const HiddenMenu = styled((p) => <Box {...p} printHide />)`
  position: absolute;
  left: auto;
  right: 0;
  width: 100%;
  top: ${({ theme }) => theme.sizes.header.banner.heightMobile}px;
  background: white;
  @media (min-width: ${({ theme }) => theme.breakpoints.large}) {
    top: ${({ theme }) => theme.sizes.header.banner.height}px;
    width: 300px;
  }
`;

const STATE_INITIAL = {
  showMenu: false,
  showUserMenu: false,
  showCreateMenu: false,
};

class Header extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.state = STATE_INITIAL;
  }

  UNSAFE_componentWillMount() {
    this.setState(STATE_INITIAL);
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize);
    window.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('mousedown', this.handleClickOutside);
  }

  onShowMenu = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({
      showMenu: true,
      showUserMenu: false,
      showCreateMenu: false,
    });
  };

  onHideMenu = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({ showMenu: false });
  };

  onShowUserMenu = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({
      showUserMenu: true,
      showCreateMenu: false,
      showMenu: false,
    });
  };

  onHideUserMenu = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({ showUserMenu: false });
  };

  onShowCreateMenu = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({
      showCreateMenu: true,
      showUserMenu: false,
      showMenu: false,
    });
  };

  onHideCreateMenu = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({ showCreateMenu: false });
  };

  onClick = (evt, path, currentPath) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.onHideMenu();
    if (currentPath) {
      if (currentPath === ROUTES.LOGIN || currentPath === ROUTES.REGISTER) {
        this.props.onPageLink(path, { keepQuery: true });
      } else {
        this.props.onPageLink(path, { query: { arg: 'redirectOnAuthSuccess', value: currentPath } });
      }
    } else {
      this.props.onPageLink(path);
    }
  };

  resize = () => {
    // reset
    this.setState(STATE_INITIAL);
    this.forceUpdate();
  };

  render() {
    const { isAuth, navItems, isPrintView } = this.props;
    const { intl } = this.context;
    const appTitle = `${intl.formatMessage(appMessages.app.title)} - ${intl.formatMessage(appMessages.app.claim)}`;
    // const userPath = user ? `${ROUTES.USERS}/${user.id}` : '';
    // console.log('navItems', navItems);
    return (
      <ResponsiveContext.Consumer>
        {(size) => {
          const wide = isMinSize(size, 'large');
          return (
            <Styled
              sticky={!isAuth}
              hasBackground={!isAuth}
              hasShadow={!isAuth}
              hasNav={!isAuth}
              hasBrand
              isPrint={isPrintView}
            >
              <Box direction="row" fill justify="between">
                <Box>
                  <Brand
                    as={isPrintView ? 'div' : 'a'}
                    href={isPrintView ? '' : '/'}
                    onClick={(evt) => {
                      if (!isPrintView) this.onClick(evt, '/');
                    }}
                    title={appTitle}
                    isPrint={isPrintView}
                  >
                    <PrintHide>
                      <LogoWrap>
                        <Icon name="logo" size={isMinSize(size, 'medium') ? '72px' : '60px'} />
                      </LogoWrap>
                    </PrintHide>
                    <Box fill="vertical" pad={{ left: 'small' }} justify="center" gap="xxsmall">
                      <BrandTitle isDev={IS_DEV}>
                        {`${intl.formatMessage(appMessages.app.title)}${IS_DEV ? ' [TEST-DB]' : ''}`}
                      </BrandTitle>
                    </Box>
                  </Brand>
                </Box>
                {wide
                  && navItems
                  && navItems.main
                  && navItems.main.length > 0
                  && (
                    <Box direction="row" flex={{ grow: 1 }}>
                      {navItems.main.map((item, i) => (
                        <LinkMenu
                          flex={{ shrink: 0 }}
                          key={i}
                          href={item.path}
                          active={item.active}
                          onClick={(evt) => {
                            evt.stopPropagation();
                            this.onClick(evt, item.path);
                          }}
                        >
                          {item.title}
                        </LinkMenu>
                      ))}
                    </Box>
                  )}
                {!isPrintView && (
                  <Box direction="row">
                    {navItems
                      && navItems.create
                      && navItems.create.length > 0
                      && (
                        <>
                          {!this.state.showCreateMenu && (
                            <BoxPrint
                              printHide
                              flex={{ grow: 1 }}
                              direction="row"
                              align="center"
                              justify="end"
                              pad={{ right: 'small' }}
                            >
                              <ToggleMenu
                                onClick={this.onShowCreateMenu}
                              >
                                <ScreenReaderOnly>
                                  <FormattedMessage {...appMessages.buttons.showSecondaryNavigation} />
                                </ScreenReaderOnly>
                                <Icon name="menu" hasStroke size="39px" />
                              </ToggleMenu>
                            </BoxPrint>
                          )}
                          {this.state.showCreateMenu && (
                            <Box
                              flex={{ grow: 1 }}
                              direction="row"
                              align="center"
                              justify="end"
                              pad={{ right: 'small' }}
                            >
                              <ToggleMenu
                                onClick={this.onHideCreateMenu}
                              >
                                <ScreenReaderOnly>
                                  <FormattedMessage {...appMessages.buttons.showSecondaryNavigation} />
                                </ScreenReaderOnly>
                                <Icon name="close" size="39px" />
                              </ToggleMenu>
                            </Box>
                          )}
                          {this.state.showCreateMenu && (
                            <HiddenMenu
                              flex={{ grow: 1 }}
                              direction="column"
                              align="start"
                              justify="start"
                              wide={false}
                              elevation="medium"
                            >
                              <Section
                                fill="horizontal"
                                align="start"
                                justify="start"
                              >
                                {navItems.create.map((item, i) => (
                                  <LinkInHiddenMenu
                                    key={i}
                                    href={item.path}
                                    active={item.active}
                                    onClick={(evt) => {
                                      evt.stopPropagation();
                                      this.onHideCreateMenu();
                                      this.onClick(evt, item.path);
                                    }}
                                  >
                                    {`New ${item.title}`}
                                  </LinkInHiddenMenu>
                                ))}
                              </Section>
                            </HiddenMenu>
                          )}
                        </>
                      )}
                    {!this.state.showUserMenu && (
                      <BoxPrint
                        printHide
                        flex={{ grow: 1 }}
                        direction="row"
                        align="center"
                        justify="end"
                        pad={{ right: 'small' }}
                      >
                        <ToggleMenu
                          onClick={this.onShowUserMenu}
                        >
                          <ScreenReaderOnly>
                            <FormattedMessage {...appMessages.buttons.showSecondaryNavigation} />
                          </ScreenReaderOnly>
                          <Icon name="menu" hasStroke size="39px" />
                        </ToggleMenu>
                      </BoxPrint>
                    )}
                    {this.state.showUserMenu && (
                      <Box
                        flex={{ grow: 1 }}
                        direction="row"
                        align="center"
                        justify="end"
                        pad={{ right: 'small' }}
                      >
                        <ToggleMenu
                          onClick={this.onHideUserMenu}
                        >
                          <ScreenReaderOnly>
                            <FormattedMessage {...appMessages.buttons.showSecondaryNavigation} />
                          </ScreenReaderOnly>
                          <Icon name="close" size="39px" />
                        </ToggleMenu>
                      </Box>
                    )}
                    {this.state.showUserMenu && (
                      <HiddenMenu
                        flex={{ grow: 1 }}
                        direction="column"
                        align="start"
                        justify="start"
                        wide={false}
                        elevation="medium"
                      >
                        {navItems && navItems.user && navItems.user.length > 0 && (
                          <Section
                            fill="horizontal"
                            align="start"
                            justify="start"
                          >
                            {navItems.user.map((item, i) => (
                              <LinkInHiddenMenu
                                key={i}
                                href={item.path}
                                active={item.active}
                                onClick={(evt) => {
                                  evt.stopPropagation();
                                  this.onHideUserMenu();
                                  this.onClick(evt, item.path);
                                }}
                              >
                                {item.title}
                              </LinkInHiddenMenu>
                            ))}
                          </Section>
                        )}
                      </HiddenMenu>
                    )}
                    {!this.state.showMenu && (
                      <BoxPrint
                        printHide
                        flex={{ grow: 1 }}
                        direction="row"
                        align="center"
                        justify="end"
                        pad={{ right: 'small' }}
                      >
                        <ToggleMenu
                          onClick={this.onShowMenu}
                        >
                          <ScreenReaderOnly>
                            <FormattedMessage {...appMessages.buttons.showSecondaryNavigation} />
                          </ScreenReaderOnly>
                          <Icon name="menu" hasStroke size="39px" />
                        </ToggleMenu>
                      </BoxPrint>
                    )}
                    {this.state.showMenu && (
                      <Box
                        flex={{ grow: 1 }}
                        direction="row"
                        align="center"
                        justify="end"
                        pad={{ right: 'small' }}
                      >
                        <ToggleMenu
                          onClick={this.onHideMenu}
                        >
                          <ScreenReaderOnly>
                            <FormattedMessage {...appMessages.buttons.showSecondaryNavigation} />
                          </ScreenReaderOnly>
                          <Icon name="close" size="39px" />
                        </ToggleMenu>
                      </Box>
                    )}
                    {this.state.showMenu && (
                      <HiddenMenu
                        flex={{ grow: 1 }}
                        direction="column"
                        align="start"
                        justify="start"
                        wide={false}
                        elevation="medium"
                      >
                        {!wide && navItems && navItems.main && navItems.main.length > 0 && (
                          <Section
                            fill="horizontal"
                            align="start"
                            justify="start"
                          >
                            {navItems.main.map((item, i) => (
                              <LinkInHiddenMenu
                                key={i}
                                href={item.path}
                                active={item.active}
                                onClick={(evt) => {
                                  evt.stopPropagation();
                                  this.onHideMenu();
                                  this.onClick(evt, item.path);
                                }}
                              >
                                {item.title}
                              </LinkInHiddenMenu>
                            ))}
                          </Section>
                        )}
                        {navItems && navItems.pages && navItems.pages.length > 0 && (
                          <Section
                            fill="horizontal"
                            align="start"
                            justify="start"
                          >
                            {navItems.pages.map((page, i) => (
                              <LinkInHiddenMenu
                                key={i}
                                href={page.path}
                                active={page.active}
                                onClick={(evt) => this.onClick(evt, page.path)}
                                wide={wide}
                              >
                                {page.title}
                              </LinkInHiddenMenu>
                            ))}
                          </Section>
                        )}
                        {navItems && navItems.other && navItems.other.length > 0 && (
                          <Section
                            fill="horizontal"
                            align="start"
                            justify="start"
                          >
                            {navItems.other.map((item, i) => (
                              <LinkInHiddenMenu
                                key={i}
                                href={item.path}
                                active={item.active}
                                onClick={(evt) => {
                                  evt.stopPropagation();
                                  this.onHideMenu();
                                  this.onClick(evt, item.path);
                                }}
                                wide={wide}
                              >
                                {item.title}
                              </LinkInHiddenMenu>
                            ))}
                          </Section>
                        )}
                      </HiddenMenu>
                    )}
                  </Box>
                )}
              </Box>
            </Styled>
          );
        }}
      </ResponsiveContext.Consumer>
    );
  }
}

// {!wide && (
//   <Section
//     fill="horizontal"
//     direction="column"
//     align="start"
//     justify="start"
//     wide={false}
//   >
//     {isSignedIn && isVisitor && (
//       <LinkAccount
//         href={ROUTES.BOOKMARKS}
//         active={currentPath === ROUTES.BOOKMARKS}
//         onClick={(evt) => this.onClick(evt, ROUTES.BOOKMARKS)}
//         wide={wide}
//       >
//         <FormattedMessage {...appMessages.nav.bookmarks} />
//       </LinkAccount>
//     )}
//     {isSignedIn && user && (
//       <LinkAccount
//         href={userPath}
//         active={currentPath === userPath}
//         onClick={(evt) => this.onClick(evt, userPath)}
//         wide={wide}
//       >
//         Profile
//       </LinkAccount>
//     )}
//     {isSignedIn && (
//       <LinkAccount
//         href={ROUTES.LOGOUT}
//         active={currentPath === ROUTES.LOGOUT}
//         onClick={(evt) => this.onClick(evt, ROUTES.LOGOUT)}
//         wide={wide}
//       >
//         <FormattedMessage {...appMessages.nav.logout} />
//       </LinkAccount>
//     )}
//     {!isSignedIn && (
//       <LinkAccount
//         href={ROUTES.REGISTER}
//         active={currentPath === ROUTES.REGISTER}
//         onClick={(evt) => this.onClick(evt, ROUTES.REGISTER, currentPath)}
//         wide={wide}
//       >
//         <FormattedMessage {...appMessages.nav.register} />
//       </LinkAccount>
//     )}
//     {!isSignedIn && (
//       <LinkAccount
//         href={ROUTES.LOGIN}
//         active={currentPath === ROUTES.LOGIN}
//         onClick={(evt) => this.onClick(evt, ROUTES.LOGIN, currentPath)}
//         wide={wide}
//       >
//         <FormattedMessage {...appMessages.nav.login} />
//       </LinkAccount>
//     )}
//   </Section>
// )}

Header.contextTypes = {
  intl: PropTypes.object.isRequired,
};

Header.propTypes = {
  navItems: PropTypes.object,
  onPageLink: PropTypes.func.isRequired,
  isAuth: PropTypes.bool, // not shown on home page
  theme: PropTypes.object.isRequired,
  isPrintView: PropTypes.bool,
};

export default withTheme(Header);
