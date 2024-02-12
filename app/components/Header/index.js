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

const LinkPage = styled((p) => <Button plain as="a" justify="center" fill="vertical" {...p} />)`
  color: ${({ active }) => active ? 'black' : 'white'};
  background-color: ${({ active }) => active ? '#f0f0f0' : 'transparent'};
  padding-right: 12px;
  padding-left: 12px;
  padding-top: 16px;
  padding-bottom: ${({ wide }) => !wide ? 16 : 0}px;
  width: ${({ wide }) => !wide ? '100%' : 'auto'};
  text-align: center;
  font-size: ${({ theme }) => theme.text.small.size};
  line-height: ${({ theme }) => theme.text.small.height};
  font-weight: ${({ wide, active }) => (!wide && active) ? 500 : 300};
  height:${({ theme }) => theme.sizes.header.banner.heightMobile}px;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    height:${({ theme }) => theme.sizes.header.banner.height}px;
    padding-top: 22px;
  }
  &:hover {
    color: ${({ active }) => active ? 'black' : 'white'};
    background-color: ${({ active }) => active ? '#f0f0f0' : '#282a2c'};
  }
`;
const LinkAccount = LinkPage;


const ToggleMenu = styled((p) => <Button plain as="a" {...p} />)`
  display: block;
  z-index: 300;
  background-color: transparent;
  color: white;
  &:hover {
    color: white;
    opacity: 0.9;
  }
`;

const Section = styled((p) => <Box {...p} />)`
  border-right: 1px solid ${({ wide }) => wide ? '#282a2c' : 'transparent'};
  border-bottom: 1px solid ${({ wide }) => !wide ? '#282a2c' : 'transparent'};
  &:last-child {
    border-color: transparent;
  }
`;
const MainMenu = styled((p) => <Box {...p} printHide />)`
  position: ${({ wide }) => !wide ? 'absolute' : 'static'};
  left: ${({ wide }) => !wide ? 0 : 'auto'};
  right: ${({ wide }) => !wide ? 0 : 'auto'};
  width: ${({ wide }) => !wide ? '100%' : 'auto'};
  top: ${({ wide, theme }) => !wide ? theme.sizes.header.banner.heightMobile : 0}px;
  background: black;
`;

const STATE_INITIAL = {
  showMenu: false,
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
    this.setState({ showMenu: true });
  };

  onHideMenu = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({ showMenu: false });
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
    const {
      isAuth,
      navItems,
      search,
      isSignedIn,
      user,
      currentPath,
      isVisitor,
      isPrintView,
    } = this.props;
    const { intl } = this.context;
    const appTitle = `${intl.formatMessage(appMessages.app.title)} - ${intl.formatMessage(appMessages.app.claim)}`;
    const userPath = user ? `${ROUTES.USERS}/${user.id}` : '';
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
              <Box direction="row" fill>
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
                {!isPrintView && (
                  <>
                    {!wide && !this.state.showMenu && (
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

                    {!wide && this.state.showMenu && (
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
                    {(wide || this.state.showMenu) && (
                      <MainMenu
                        flex={{ grow: 1 }}
                        direction={wide ? 'row' : 'column'}
                        align={wide ? 'center' : 'end'}
                        justify={wide ? 'end' : 'center'}
                        wide={wide}
                        elevation={wide ? 'none' : 'medium'}
                      >
                        {search && (
                          <Section
                            fill={wide ? 'vertical' : 'horizontal'}
                            justify={wide ? 'center' : 'end'}
                            align={wide ? 'end' : 'center'}
                            direction={wide ? 'row' : 'column'}
                            wide={wide}
                          >
                            <LinkPage
                              href={search.path}
                              active={search.active}
                              onClick={(evt) => this.onClick(evt, search.path)}
                              title={search.title}
                              wide={wide}
                            >
                              {search.title}
                              {search.icon
                                && <Icon title={search.title} name={search.icon} text textRight size="1em" />
                              }
                            </LinkPage>
                          </Section>
                        )}
                        {this.props.pages && this.props.pages.length > 0 && (
                          <Section
                            fill={wide ? 'vertical' : 'horizontal'}
                            justify={wide ? 'center' : 'end'}
                            align={wide ? 'end' : 'center'}
                            direction={wide ? 'row' : 'column'}
                            wide={wide}
                          >
                            {this.props.pages.map((page, i) => (
                              <LinkPage
                                key={i}
                                href={page.path}
                                active={page.active || this.props.currentPath === page.path}
                                onClick={(evt) => this.onClick(evt, page.path)}
                                wide={wide}
                              >
                                {page.title}
                              </LinkPage>
                            ))}
                          </Section>
                        )}
                        {navItems && navItems.length > 0 && (
                          <Section
                            fill={wide ? 'vertical' : 'horizontal'}
                            justify={wide ? 'center' : 'end'}
                            align={wide ? 'end' : 'center'}
                            direction={wide ? 'row' : 'column'}
                            wide={wide}
                          >
                            {navItems.map((item, i) => (
                              <LinkPage
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
                              </LinkPage>
                            ))}
                          </Section>
                        )}
                        <Section
                          fill={wide ? 'vertical' : 'horizontal'}
                          justify={wide ? 'center' : 'end'}
                          align={wide ? 'end' : 'center'}
                          direction={wide ? 'row' : 'column'}
                          wide={wide}
                        >
                          {isSignedIn && isVisitor && (
                            <LinkAccount
                              href={ROUTES.BOOKMARKS}
                              active={currentPath === ROUTES.BOOKMARKS}
                              onClick={(evt) => this.onClick(evt, ROUTES.BOOKMARKS)}
                              wide={wide}
                            >
                              <FormattedMessage {...appMessages.nav.bookmarks} />
                            </LinkAccount>
                          )}
                          {isSignedIn && user && (
                            <LinkAccount
                              href={userPath}
                              active={currentPath === userPath}
                              onClick={(evt) => this.onClick(evt, userPath)}
                              wide={wide}
                            >
                              Profile
                            </LinkAccount>
                          )}
                          {isSignedIn && (
                            <LinkAccount
                              href={ROUTES.LOGOUT}
                              active={currentPath === ROUTES.LOGOUT}
                              onClick={(evt) => this.onClick(evt, ROUTES.LOGOUT)}
                              wide={wide}
                            >
                              <FormattedMessage {...appMessages.nav.logout} />
                            </LinkAccount>
                          )}
                          {!isSignedIn && (
                            <LinkAccount
                              href={ROUTES.REGISTER}
                              active={currentPath === ROUTES.REGISTER}
                              onClick={(evt) => this.onClick(evt, ROUTES.REGISTER, currentPath)}
                              wide={wide}
                            >
                              <FormattedMessage {...appMessages.nav.register} />
                            </LinkAccount>
                          )}
                          {!isSignedIn && (
                            <LinkAccount
                              href={ROUTES.LOGIN}
                              active={currentPath === ROUTES.LOGIN}
                              onClick={(evt) => this.onClick(evt, ROUTES.LOGIN, currentPath)}
                              wide={wide}
                            >
                              <FormattedMessage {...appMessages.nav.login} />
                            </LinkAccount>
                          )}
                        </Section>
                      </MainMenu>
                    )}
                  </>
                )}
              </Box>
            </Styled>
          );
        }}
      </ResponsiveContext.Consumer>
    );
  }
}

Header.contextTypes = {
  intl: PropTypes.object.isRequired,
};

Header.propTypes = {
  isSignedIn: PropTypes.bool,
  user: PropTypes.object,
  currentPath: PropTypes.string,
  pages: PropTypes.array,
  navItems: PropTypes.array,
  onPageLink: PropTypes.func.isRequired,
  isAuth: PropTypes.bool, // not shown on home page
  theme: PropTypes.object.isRequired,
  search: PropTypes.object,
  isVisitor: PropTypes.bool,
  isPrintView: PropTypes.bool,
};

export default withTheme(Header);
