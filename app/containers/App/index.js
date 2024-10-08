/**
 *
 * App.js
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import ReactModal from 'react-modal';
import GlobalStyle from 'global-styles';
import styled from 'styled-components';
import { Box, Text } from 'grommet';

import Header from 'components/Header';
import Overlay from 'components/InfoOverlay/Overlay';
import EntityNew from 'containers/EntityNew';
import PrintUI from 'containers/PrintUI';

import { getAuthValues } from 'utils/api-request';

import { sortEntities } from 'utils/sort';
import { ROUTES, API, PRINT } from 'themes/config';

import {
  selectIsSignedIn,
  selectIsUserMember,
  selectIsUserVisitor,
  selectSessionUserAttributes,
  selectReady,
  selectEntitiesWhere,
  selectNewEntityModal,
  selectIsAuthenticating,
  selectIsPrintView,
  selectPrintConfig,
} from './selectors';

import {
  validateToken,
  loadEntitiesIfNeeded,
  updatePath,
  openNewEntityModal,
  submitInvalid,
  saveErrorDismiss,
} from './actions';

import { PrintContext } from './PrintContext';

import { DEPENDENCIES } from './constants';

import messages from './messages';

const Main = styled.div`
  position: absolute;
  top: ${({ isHome, theme }) => isHome
    ? 0
    : theme.sizes.header.banner.heightMobile
}px;
  left: 0;
  right: 0;
  bottom:0;
  overflow: ${({ isPrint }) => isPrint ? 'auto' : 'hidden'};
  width: auto;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    top: ${({ isHome, theme }) => isHome
    ? 0
    : theme.sizes.header.banner.height
}px;
  }
  @media print {
    background: transparent;
    position: static;
    overflow: hidden;
  }
`;
// A4 595 × 842
// A3 842 x 1190
/* eslint-disable prefer-template */
const getPrintHeight = ({
  isPrint,
  size, orient,
  fixed,
}) => {
  if (fixed && isPrint) {
    return PRINT.SIZES[size][orient].H + 'pt';
  }
  if (isPrint) {
    return 'auto';
  }
  return '100%';
};

const getPrintWidth = ({
  isPrint,
  orient,
  size,
}) => {
  if (isPrint) {
    return PRINT.SIZES[size][orient].W + 'pt';
  }
  return '100%';
};

const PrintWrapperInner = styled.div`
  position: ${({ isPrint, fixed }) => (isPrint && fixed) ? 'absolute' : 'static'};
  top: ${({ isPrint }) => isPrint ? 20 : 0}px;
  bottom: ${({ isPrint, fixed }) => {
    if (isPrint && fixed) {
      return '20px';
    }
    if (isPrint) {
      return 'auto';
    }
    return 0;
  }};
  right: ${({ isPrint }) => isPrint ? 20 : 0}px;
  left: ${({ isPrint }) => isPrint ? 20 : 0}px;
  @media print {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: ${({
    isPrint, orient, size, fixed,
  }) => fixed ? getPrintWidth({ size, orient, isPrint }) : '100%'};
    height: ${({
    isPrint, size, orient, fixed,
  }) => getPrintHeight({
    isPrint, size, orient, fixed,
  })};
  }
`;
const PrintWrapper = styled.div`
  position: relative;
  margin-bottom: ${({ isPrint }) => isPrint ? '140px' : '0px'};
  margin-right: ${({ isPrint }) => isPrint ? 'auto' : '0px'};
  margin-left: ${({ isPrint }) => isPrint ? 'auto' : '0px'};
  bottom: ${({ isPrint, fixed }) => {
    if (isPrint && fixed) {
      return 0;
    }
    if (isPrint) {
      return 'auto';
    }
    return 0;
  }};
  width: ${({ isPrint, size, orient }) => getPrintWidth({ isPrint, size, orient })};
  height: ${({
    isPrint, size, orient, fixed,
  }) => getPrintHeight({
    isPrint, size, orient, fixed,
  })};
  min-height: ${({ isPrint, size, orient }) => isPrint ? getPrintHeight({
    isPrint, size, orient, fixed: true,
  }) : 'auto'};
  box-shadow: ${({ isPrint }) => isPrint ? '0px 0px 5px 0px rgb(0 0 0 / 50%)' : 'none'};
  padding: ${({ isPrint }) => isPrint ? 20 : 0}px;
  @media print {
    position: static;
    box-shadow: none;
    padding: 0;
    margin: 0;
    bottom: 0;
    background: transparent;
  }
`;

class App extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  UNSAFE_componentWillMount() {
    // console.log('App/UNSAFE_componentWillMount', 'validateToken');
    this.props.validateToken();
    this.props.loadEntitiesIfNeeded();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
  }

  preparePageMenuPages = (pages, currentPath) => sortEntities(
    pages,
    'asc',
    'order',
    'number'
  )
    .map((page) => ({
      path: `${ROUTES.PAGES}/${page.get('id')}`,
      title: page.getIn(['attributes', 'menu_title']) || page.getIn(['attributes', 'title']),
      active: currentPath === `${ROUTES.PAGES}/${page.get('id')}`,
    }))
    .toArray();

  prepareMainMenuItems = (
    isMember,
    isVisitor,
    currentPath,
  ) => {
    const { intl } = this.context;
    let navItems = [];
    if (isVisitor) {
      navItems = navItems.concat([
        {
          path: ROUTES.INDICATORS,
          title: intl.formatMessage(messages.nav.indicators),
          active: currentPath && currentPath.startsWith(ROUTES.INDICATOR),
        },
        {
          path: ROUTES.RESOURCES,
          title: intl.formatMessage(messages.nav.resources),
          active: currentPath && currentPath.startsWith(ROUTES.RESOURCE),
        },
      ]);
    }
    if (isMember) {
      navItems = navItems.concat([
        {
          path: ROUTES.USERS,
          title: intl.formatMessage(messages.nav.users),
          isAdmin: true,
          active: currentPath === ROUTES.USERS,
        },
        {
          path: ROUTES.PAGES,
          title: intl.formatMessage(messages.nav.pages),
          isAdmin: true,
          active: currentPath === ROUTES.PAGES,
        },
        {
          path: ROUTES.TAXONOMIES,
          title: intl.formatMessage(messages.nav.taxonomies),
          isAdmin: true,
          active: currentPath.startsWith(ROUTES.CATEGORY)
            || currentPath.startsWith(ROUTES.TAXONOMIES),
        },
      ]);
    }
    return navItems;
  };

  render() {
    const {
      pages,
      onPageLink,
      isUserSignedIn,
      isMember,
      isVisitor,
      location,
      newEntityModal,
      user,
      children,
      isUserAuthenticating,
      isPrintView,
      printArgs,
    } = this.props;

    const { intl } = this.context;
    const title = intl.formatMessage(messages.app.title);
    const isHome = location.pathname === '/';
    const isAuth = location.pathname.startsWith(ROUTES.LOGIN)
      || location.pathname.startsWith(ROUTES.REGISTER)
      || location.pathname.startsWith(ROUTES.LOGOUT)
      || location.pathname.startsWith(ROUTES.UNAUTHORISED);
    let authUID;
    if (isUserAuthenticating) {
      const authValues = getAuthValues();
      authUID = authValues && authValues.uid;
    }

    return (
      <div id="app">
        <Helmet titleTemplate={`%s - ${title}`} defaultTitle={title} />
        {!isHome && (
          <Header
            isSignedIn={isUserSignedIn}
            isVisitor={isVisitor}
            isPrintView={isPrintView}
            user={user}
            pages={pages && this.preparePageMenuPages(pages, location.pathname)}
            navItems={this.prepareMainMenuItems(
              isUserSignedIn && isMember,
              isUserSignedIn && isVisitor,
              location.pathname,
            )}
            search={!isUserSignedIn
              ? null
              : {
                path: ROUTES.SEARCH,
                title: intl.formatMessage(messages.nav.search),
                active: location.pathname.startsWith(ROUTES.SEARCH),
                icon: 'search',
              }
            }
            onPageLink={onPageLink}
            isAuth={isAuth}
            currentPath={location.pathname}
          />
        )}
        <Main isHome={isHome} isPrint={isPrintView}>
          {isPrintView && (<PrintUI />)}
          <PrintWrapper
            isPrint={isPrintView}
            fixed={printArgs && printArgs.fixed ? printArgs.fixed : false}
            orient={printArgs && printArgs.printOrientation ? printArgs.printOrientation : 'portrait'}
            size={printArgs && printArgs.printSize ? printArgs.printSize : 'A4'}
          >
            <PrintWrapperInner
              isPrint={isPrintView}
              fixed={printArgs && printArgs.fixed ? printArgs.fixed : false}
              orient={printArgs && printArgs.printOrientation ? printArgs.printOrientation : 'portrait'}
              size={printArgs && printArgs.printSize ? printArgs.printSize : 'A4'}
            >
              <PrintContext.Provider value={isPrintView}>
                {React.Children.toArray(children)}
              </PrintContext.Provider>
            </PrintWrapperInner>
          </PrintWrapper>
        </Main>
        {newEntityModal && (
          <ReactModal
            isOpen
            contentLabel={newEntityModal.get('path')}
            onRequestClose={this.props.onCloseModal}
            className="new-entity-modal"
            overlayClassName="new-entity-modal-overlay"
            style={{
              overlay: { zIndex: 99999999 },
            }}
            appElement={document.getElementById('app')}
          >
            <EntityNew
              path={newEntityModal.get('path')}
              attributes={newEntityModal.get('attributes')}
              connect={newEntityModal.get('connect')}
              autoUser={newEntityModal.get('autoUser')}
              invalidateEntitiesOnSuccess={newEntityModal.get('invalidateEntitiesOnSuccess')
                && (
                  newEntityModal.get('invalidateEntitiesOnSuccess').toJS
                    ? newEntityModal.get('invalidateEntitiesOnSuccess').toJS()
                    : newEntityModal.get('invalidateEntitiesOnSuccess')
                )
              }
              onSaveSuccess={this.props.onCloseModal}
              onCancel={this.props.onCloseModal}
              inModal
            />
          </ReactModal>
        )}
        {isUserAuthenticating && !isAuth && !isUserSignedIn && (
          <Overlay
            title={intl.formatMessage(messages.labels.userLoading)}
            content={(
              <Box gap="medium">
                {authUID && (
                  <Text>
                    {`Welcome back ${authUID}!`}
                  </Text>
                )}
                {!authUID && (
                  <Text>
                    {'Welcome back!'}
                  </Text>
                )}
                <Text size="small">
                  {'Attempting to sign you back in...'}
                </Text>
              </Box>
            )}
            loading
          />
        )}
        <GlobalStyle isPrint={isPrintView} />
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.node,
  isUserSignedIn: PropTypes.bool,
  isUserAuthenticating: PropTypes.bool,
  isMember: PropTypes.bool,
  isVisitor: PropTypes.bool,
  user: PropTypes.object,
  pages: PropTypes.object,
  validateToken: PropTypes.func,
  loadEntitiesIfNeeded: PropTypes.func,
  onPageLink: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  newEntityModal: PropTypes.object,
  onCloseModal: PropTypes.func,
  isPrintView: PropTypes.bool,
  printArgs: PropTypes.object,
};
App.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  isMember: selectIsUserMember(state),
  isVisitor: selectIsUserVisitor(state),
  isUserSignedIn: selectIsSignedIn(state),
  isUserAuthenticating: selectIsAuthenticating(state),
  user: selectSessionUserAttributes(state),
  isPrintView: selectIsPrintView(state),
  printArgs: selectPrintConfig(state),
  pages: selectEntitiesWhere(state, {
    path: API.PAGES,
    where: { draft: false },
  }),
  newEntityModal: selectNewEntityModal(state),
});

export function mapDispatchToProps(dispatch) {
  return {
    validateToken: () => {
      dispatch(validateToken()); // Maybe this could move to routes.js or App wrapper
    },
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onPageLink: (path, args) => {
      dispatch(updatePath(path, args));
    },
    onCloseModal: () => {
      // cleanup
      dispatch(submitInvalid(true));
      dispatch(saveErrorDismiss());
      dispatch(openNewEntityModal(null));
    },
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(App);
