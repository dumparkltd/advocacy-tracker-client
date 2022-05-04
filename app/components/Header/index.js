import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled, { withTheme } from 'styled-components';
import {
  Box, Button, ResponsiveContext, Text, Heading,
} from 'grommet';
import { ROUTES } from 'themes/config';
import { isMinSize } from 'utils/responsive';
import appMessages from 'containers/App/messages';
import Icon from 'components/Icon';
import ScreenReaderOnly from 'components/styled/ScreenReaderOnly';

import Brand from './Brand';
import Logo from './Logo';
import messages from './messages';

const Claim = styled((p) => <Text {...p} />)`
  font-family: ${(props) => props.theme.fonts.title};
  font-size: ${(props) => props.theme.text.xxsmall.size};
  line-height: ${(props) => props.theme.text.xxsmall.size};
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    font-size: ${(props) => props.theme.text.xsmall.size};
    line-height: ${(props) => props.theme.text.xsmall.size};
  }
`;
const BrandTitle = styled((p) => <Heading level={1} {...p} />)`
  margin: 0;
  font-family: ${(props) => props.theme.fonts.title};
  font-size: ${(props) => props.theme.text.small.size};
  line-height: ${(props) => props.theme.text.small.size};
  font-weight: 500;
  padding: 0;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    font-size: ${(props) => props.theme.text.large.size};
    line-height: ${(props) => props.theme.text.large.size};
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.header.print.title};
  }
`;

const Styled = styled.div`
  position: ${(props) => {
    if (props.fixed) {
      return 'fixed';
    }
    return props.sticky ? 'absolute' : 'relative';
  }};
  top: 0;
  left: 0;
  right: 0;
  height:${(props) => {
    if (props.hasBrand) {
      return props.theme.sizes.header.banner.heightMobile;
    }
    return 0;
  }}px;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    height:${(props) => {
    if (props.hasBrand) {
      return props.theme.sizes.header.banner.height;
    }
    return 0;
  }}px;
  }
  background-color: #183863;
  box-shadow: ${(props) => props.hasShadow ? '0px 0px 5px 0px rgba(0,0,0,0.5)' : 'none'};
  z-index: 101;
  @media print {
    display: block;
    height: ${({ theme }) => theme.sizes.header.banner.height}px;
    position: static;
    box-shadow: none;
    background: white;
  }
`;

const LinkPage = styled((p) => <Button plain as="a" justify="center" fill="vertical" {...p} />)`
  color: ${({ wide, theme }) => theme.global.colors.text[!wide ? 'light' : 'dark']};
  background-color: ${({ theme, active, wide }) => (active && wide) ? theme.global.colors.highlight : 'transparent'};
  padding-right: 12px;
  padding-left: 12px;
  padding-top: 16px;
  padding-bottom: ${({ wide }) => !wide ? 16 : 0}px;
  width: ${({ wide }) => !wide ? '100%' : 'auto'};
  text-align: center;
  font-size: ${({ theme }) => theme.text.small.size};
  line-height: ${({ theme }) => theme.text.small.height};
  font-weight: ${({ wide, active }) => (!wide && active) ? 500 : 300};
  &:hover {
    color: ${({ wide, theme }) => theme.global.colors.text[!wide ? 'light' : 'dark']};
    background-color:${({ theme, wide }) => wide ? theme.global.colors.highlightHover : 'transparent'};
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
  border-right: 1px solid ${({ wide }) => wide ? 'black' : 'transparent'};
  border-bottom: 1px solid ${({ wide, theme }) => wide ? 'transparent' : theme.global.colors.background};
  &:last-child {
    border-color: transparent;
  }
`;
const MainMenu = styled((p) => <Box {...p} />)`
  position: ${({ wide }) => !wide ? 'absolute' : 'static'};
  left: ${({ wide }) => !wide ? 0 : 'auto'};
  right: ${({ wide }) => !wide ? 0 : 'auto'};
  width: ${({ wide }) => !wide ? '100%' : 'auto'};
  top: ${({ wide, theme }) => !wide ? theme.sizes.header.banner.heightMobile : 0}px;
  background: ${({ wide, theme }) => !wide ? theme.global.colors.white : 'transparent'};
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
  }

  resize = () => {
    // reset
    this.setState(STATE_INITIAL);
    this.forceUpdate();
  };

  render() {
    const {
      isAuth, navItems, search, isSignedIn, user, currentPath, isAnalyst,
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
            >
              <Box direction="row" fill>
                <Box>
                  <Brand
                    href="/"
                    onClick={(evt) => this.onClick(evt, '/')}
                    title={appTitle}
                  >
                    <Box direction="row" align="center">
                      <Logo src={this.props.theme.media.headerLogo} alt={appTitle} />
                      <Box fill="vertical" pad={{ left: 'small' }} justify="center" gap="xxsmall">
                        <Claim>
                          <FormattedMessage {...appMessages.app.claim} />
                        </Claim>
                        <BrandTitle>
                          <FormattedMessage {...appMessages.app.title} />
                        </BrandTitle>
                      </Box>
                    </Box>
                  </Brand>
                </Box>
                {!wide && !this.state.showMenu && (
                  <Box
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
                  </Box>
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
                      {isSignedIn && isAnalyst && (
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
                      {isSignedIn && !user && wide && (
                        <LinkAccount wide>
                          <FormattedMessage {...messages.userLoading} />
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
  isAnalyst: PropTypes.bool,
};

export default withTheme(Header);
