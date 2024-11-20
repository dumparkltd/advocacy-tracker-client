import React from 'react';
import PropTypes from 'prop-types';
import styled, { withTheme } from 'styled-components';
import {
  Box, ResponsiveContext, Heading,
} from 'grommet';
import { ROUTES, IS_DEV } from 'themes/config';
import { isMinSize } from 'utils/responsive';
import appMessages from 'containers/App/messages';
import Icon from 'components/Icon';
// import PrintOnly from 'components/styled/PrintOnly';
import PrintHide from 'components/styled/PrintHide';

import Brand from './Brand';
import LogoWrap from './LogoWrap';
import MainMenu from './MainMenu';
import DropMenu from './DropMenu';
import messages from './messages';

const BrandTitle = styled((p) => <Heading level={1} {...p} />)`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.title};
  font-size: ${({ theme, isDev }) => isDev ? theme.text.medium.size : theme.text.large.size};
  line-height: ${({ theme, isDev }) => isDev ? theme.text.medium.size : theme.text.large.size};
  font-weight: 500;
  padding: 0;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
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
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
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
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  // onShowMenu = (evt) => {
  //   if (evt !== undefined && evt.preventDefault) evt.preventDefault();
  //   this.setState({ showMenu: true });
  // };
  //
  // onHideMenu = (evt) => {
  //   if (evt !== undefined && evt.preventDefault) evt.preventDefault();
  //   this.setState({ showMenu: false });
  // };

  onClick = (path, currentPath, evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    // this.onHideMenu();
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

    return (
      <ResponsiveContext.Consumer>
        {(size) => {
          const isMainBelow = !isMinSize(size, 'medium');
          return (
            <Styled
              sticky={!isAuth}
              hasBackground={!isAuth}
              hasShadow={!isAuth}
              hasNav={!isAuth}
              hasBrand
              isPrint={isPrintView}
            >
              <div>
                <Box direction="row" justify="between" style={{ textAlign: 'center' }}>
                  <Brand
                    as={isPrintView ? 'div' : 'a'}
                    href={isPrintView ? '' : '/'}
                    onClick={(evt) => {
                      if (evt) evt.stopPropagation();
                      if (!isPrintView) this.onClick('/');
                    }}
                    title={appTitle}
                    isPrint={isPrintView}
                  >
                    <PrintHide>
                      <LogoWrap>
                        <Icon name="logo" size={isMinSize(size, 'large') ? '72px' : '60px'} />
                      </LogoWrap>
                    </PrintHide>
                    <Box fill="vertical" pad={{ left: 'small' }} justify="center" gap="xxsmall">
                      <BrandTitle isDev={IS_DEV}>
                        {`${intl.formatMessage(appMessages.app.title)}${IS_DEV ? ' [TEST-DB]' : ''}`}
                      </BrandTitle>
                    </Box>
                  </Brand>
                  {!isMainBelow
                    && !isPrintView
                    && navItems
                    && navItems.main
                    && navItems.main.length > 0
                    && (
                      <MainMenu navItems={navItems.main} onClick={this.onClick()} />
                    )}
                  {!isPrintView && (
                    <Box direction="row" flex={{ grow: 0 }} style={{ position: 'relative' }}>
                      {navItems && navItems.create && navItems.create.length > 0 && (
                        <DropMenu
                          title={intl.formatMessage(messages.addLabel)}
                          type="add"
                          navItemGroups={navItems && navItems.create}
                          onClick={(path) => this.onClick(path)}
                        />
                      )}
                      {navItems && navItems.user && navItems.user.length > 0 && (
                        <DropMenu
                          title="User"
                          type="user"
                          icon="profile"
                          navItemGroups={navItems && navItems.user}
                          onClick={(path) => this.onClick(path)}
                        />
                      )}
                      {navItems && navItems.other && (
                        <DropMenu
                          title="More"
                          type="other"
                          navItemGroups={navItems.other}
                          onClick={(path) => this.onClick(path)}
                        />
                      )}
                    </Box>
                  )}
                </Box>
                {isMainBelow
                  && navItems
                  && navItems.main
                  && navItems.main.length > 0
                  && (
                    <Box>
                      <MainMenu navItems={navItems.main} onClick={this.onClick} />
                    </Box>
                  )}
              </div>
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
  navItems: PropTypes.object,
  onPageLink: PropTypes.func.isRequired,
  isAuth: PropTypes.bool, // not shown on home page
  isPrintView: PropTypes.bool,
};

export default withTheme(Header);
