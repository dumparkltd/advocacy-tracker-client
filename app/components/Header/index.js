import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled, { withTheme } from 'styled-components';
import { palette } from 'styled-theme';

import { SHOW_HEADER_TITLE, ROUTES } from 'themes/config';

import appMessages from 'containers/App/messages';
import Icon from 'components/Icon';
import Button from 'components/buttons/Button';
import ScreenReaderOnly from 'components/styled/ScreenReaderOnly';
import PrintHide from 'components/styled/PrintHide';

import Banner from './Banner';
import Brand from './Brand';
import BrandText from './BrandText';
import BrandTitle from './BrandTitle';
import BrandClaim from './BrandClaim';
import NavPages from './NavPages';
import NavAdmin from './NavAdmin';
import LinkPage from './LinkPage';
import NavAccount from './NavAccount';

import LinkAdmin from './LinkAdmin';


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
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    height:${(props) => {
    if (props.hasBrand) {
      return props.theme.sizes.header.banner.height;
    }
    return 0;
  }}px;
  }
  background-color: ${(props) => props.hasBackground ? palette('header', 0) : 'transparent'};
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

const NavSecondary = styled(PrintHide)`
  display: ${(props) => props.visible ? 'block' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  z-index: 99999;
  background-color:  ${palette('header', 0)};
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    position: relative;
    top: auto;
    bottom: auto;
    left: auto;
    right: auto;
    z-index: 300;
    display: block;
  }
`;
const ShowSecondary = styled(Button)`
  display: ${(props) => props.visible ? 'block' : 'none'};
  position: absolute;
  right: 0;
  top: 0;
  z-index: 300;
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    display: none;
  }
  background-color: transparent;
`;
const HideSecondaryWrap = styled.div`
  background-color: ${palette('header', 0)};
  text-align: right;
  display: block;
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    display: none;
  }
`;
const HideSecondary = styled(Button)``;


// const Search = styled(LinkMain)`
//   display: none;
//   color: ${(props) => props.active ? palette('headerNavMainItem', 1) : palette('headerNavMainItem', 0)};
//   &:hover {
//     color:${palette('headerNavMainItemHover', 0)};
//   }
//   padding: 2px ${(props) => props.theme.sizes.header.paddingLeft.mobile}px 1px;
//   @media (min-width: ${(props) => props.theme.breakpoints.small}) {
//     display: inline-block;
//     min-width: auto;
//     padding: 15px ${(props) => props.theme.sizes.header.paddingLeft.small}px 0;
//     position: absolute;
//     right: 0;
//     border-left: none;
//   }
//   @media (min-width: ${(props) => props.theme.breakpoints.large}) {
//     padding-left: 24px;
//     padding-right: 24px;
//   }
// `;

const STATE_INITIAL = {
  showSecondary: false,
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

  onShowSecondary = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({ showSecondary: true });
  };

  onHideSecondary = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({ showSecondary: false });
  };

  onClick = (evt, path, currentPath) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
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

  renderSecondary = (navItems) => (
    <PrintHide>
      <ShowSecondary
        visible={!this.state.showSecondary}
        onClick={this.onShowSecondary}
      >
        <ScreenReaderOnly>
          <FormattedMessage {...appMessages.buttons.showSecondaryNavigation} />
        </ScreenReaderOnly>
        <Icon name="menu" hasStroke />
      </ShowSecondary>
      <NavSecondary
        visible={this.state.showSecondary}
        onClick={(evt) => {
          evt.stopPropagation();
          this.onHideSecondary();
        }}
      >
        <HideSecondaryWrap>
          <HideSecondary
            onClick={this.onHideSecondary}
          >
            <ScreenReaderOnly>
              <FormattedMessage {...appMessages.buttons.hideSecondaryNavigation} />
            </ScreenReaderOnly>
            <Icon name="close" size="30px" />
          </HideSecondary>
        </HideSecondaryWrap>
        <NavAccount
          isSignedIn={this.props.isSignedIn}
          user={this.props.user}
          onPageLink={(evt, path, query) => {
            if (evt !== undefined && evt.stopPropagation) evt.stopPropagation();
            this.onHideSecondary();
            this.props.onPageLink(path, query);
          }}
          currentPath={this.props.currentPath}
        />
        { navItems
          && (
            <NavAdmin>
              { navItems.map((item, i) => (
                <LinkAdmin
                  key={i}
                  href={item.path}
                  active={item.active}
                  onClick={(evt) => {
                    evt.stopPropagation();
                    this.onHideSecondary();
                    this.onClick(evt, item.path);
                  }}
                >
                  {item.title}
                </LinkAdmin>
              ))}
            </NavAdmin>
          )
        }
        <NavPages>
          { this.props.pages && this.props.pages.map((page, i) => (
            <LinkPage
              key={i}
              href={page.path}
              active={page.active || this.props.currentPath === page.path}
              onClick={(evt) => this.onClick(evt, page.path)}
            >
              {page.title}
            </LinkPage>
          ))}
        </NavPages>
      </NavSecondary>
    </PrintHide>
  );

  render() {
    const { isAuth, navItems } = this.props;
    const { intl } = this.context;

    const appTitle = `${intl.formatMessage(appMessages.app.title)} - ${intl.formatMessage(appMessages.app.claim)}`;
    return (
      <Styled
        fixed={isAuth}
        sticky={!isAuth}
        hasBackground={!isAuth}
        hasShadow={!isAuth}
        hasNav={!isAuth}
        hasBrand
      >
        <Banner>
          <Brand
            href="/"
            onClick={(evt) => this.onClick(evt, '/')}
            title={appTitle}
          >
            {SHOW_HEADER_TITLE && (
              <BrandText>
                <BrandClaim>
                  <FormattedMessage {...appMessages.app.claim} />
                </BrandClaim>
                <BrandTitle>
                  <FormattedMessage {...appMessages.app.title} />
                </BrandTitle>
              </BrandText>
            )}
          </Brand>
          {this.renderSecondary(navItems)}
        </Banner>
      </Styled>
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
};

export default withTheme(Header);
