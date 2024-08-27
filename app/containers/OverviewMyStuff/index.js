import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
// import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
// import { Map } from 'immutable';
// import { Box, ResponsiveContext } from 'grommet';

import styled from 'styled-components';

// import appMessages from 'containers/App/messages';

import { ROUTES } from 'themes/config';
import { loadEntitiesIfNeeded } from 'containers/App/actions';
import { selectReady } from 'containers/App/selectors';
import HeaderExplore from 'containers/HeaderExplore';
import Footer from 'containers/Footer';

import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import Container from 'components/styled/Container';
import ContentSimple from 'components/styled/ContentSimple';
import Loading from 'components/Loading';

import { DEPENDENCIES } from './constants';

const ViewContainer = styled(Container)`
  min-height: 80vH;
  @media print {
    min-height: 50vH;
  }
`;
export function OverviewOutreach({
  onLoadData,
  // types,
  // onUpdatePath,
  // intl,
  dataReady,
  location,
}) {
  useEffect(() => {
    // kick off loading of data
    onLoadData();
  }, []);
  // const size = React.useContext(ResponsiveContext);
  const navItems = [
    {
      path: ROUTES.BOOKMARKS,
      title: 'My Bookmarks',
      active: location.pathname && location.pathname.startsWith(ROUTES.BOOKMARKS),
    },
  ];
  return (
    <ContainerWrapper bg>
      <HeaderExplore navItems={navItems} />
      <Loading loading={!dataReady} />
      <ViewContainer>
        <ContentSimple>
            UNDER CONSTRUCTION
        </ContentSimple>
      </ViewContainer>
      <Footer />
    </ContainerWrapper>
  );
}

OverviewOutreach.propTypes = {
  // intl: intlShape.isRequired,
  dataReady: PropTypes.bool,
  onLoadData: PropTypes.func.isRequired,
  // onUpdatePath: PropTypes.func.isRequired,
  // types: PropTypes.instanceOf(Map),
  location: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  dataReady: (state) => selectReady(state, { path: DEPENDENCIES }),
  // types: (state) => selectActiontypesWithActionCount(state),
});

export function mapDispatchToProps(dispatch) {
  return {
    onLoadData: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    // onUpdatePath: (path) => {
    //   dispatch(updatePath(path));
    // },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(OverviewOutreach);
