import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Map } from 'immutable';
import { Box, ResponsiveContext } from 'grommet';

import styled from 'styled-components';

import appMessages from 'containers/App/messages';

import { ROUTES, ACTORTYPE_NAVGROUPS } from 'themes/config';
import { loadEntitiesIfNeeded, updatePath } from 'containers/App/actions';
import { selectReady } from 'containers/App/selectors';
import Footer from 'containers/Footer';
import HeaderExplore from 'containers/HeaderExplore';

import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import Container from 'components/styled/Container';
import ContentSimple from 'components/styled/ContentSimple';
import CardTeaser from 'components/CardTeaser';
import Loading from 'components/Loading';

import { isMaxSize } from 'utils/responsive';
import { selectActortypesWithActorCount } from './selectors';
import { DEPENDENCIES } from './constants';


const Group = styled((p) => <Box margin={{ bottom: 'large', top: 'medium' }} {...p} />)``;
const GroupTitle = styled.h5`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.global.colors.text.brand};
`;
const ViewContainer = styled(Container)`
  min-height: 80vH;
  @media print {
    min-height: 50vH;
  }
`;
export function ActorsOverview({
  onLoadData, types, onUpdatePath, intl, dataReady,
}) {
  useEffect(() => {
    // kick off loading of data
    onLoadData();
  }, []);
  const size = React.useContext(ResponsiveContext);
  return (
    <ContainerWrapper bg>
      <HeaderExplore />
      <Loading loading={!dataReady} />
      <ViewContainer>
        <ContentSimple>
          {Object.keys(ACTORTYPE_NAVGROUPS).map((key) => (
            <Group key={key}>
              <GroupTitle>
                <FormattedMessage {...appMessages.actortypeGroups[key]} />
              </GroupTitle>
              <Box direction={isMaxSize(size, 'medium') ? 'column' : 'row'} gap="small">
                {ACTORTYPE_NAVGROUPS[key].types.map((typeId) => {
                  const path = `${ROUTES.ACTORS}/${typeId}`;
                  const count = types.getIn([typeId, 'count']) ? parseInt(types.getIn([typeId, 'count']), 10) : 0;
                  const { primary } = ACTORTYPE_NAVGROUPS[key];
                  return (
                    <CardTeaser
                      key={typeId}
                      basis={primary ? '1/2' : '1/4'}
                      primary={primary}
                      path={path}
                      onClick={(evt) => {
                        if (evt && evt.preventDefault) evt.preventDefault();
                        if (dataReady) onUpdatePath(path);
                      }}
                      dataReady={dataReady}
                      count={count}
                      title={
                        intl.formatMessage(appMessages.actortypes_long[typeId])
                      }
                      description={
                        intl.formatMessage(appMessages.actortypes_about[typeId])
                      }
                    />
                  );
                })}
              </Box>
            </Group>
          ))}
        </ContentSimple>
      </ViewContainer>
      <Footer />
    </ContainerWrapper>
  );
}

ActorsOverview.propTypes = {
  intl: intlShape.isRequired,
  dataReady: PropTypes.bool,
  onLoadData: PropTypes.func.isRequired,
  onUpdatePath: PropTypes.func.isRequired,
  types: PropTypes.instanceOf(Map),
};

const mapStateToProps = createStructuredSelector({
  dataReady: (state) => selectReady(state, { path: DEPENDENCIES}),
  types: (state) => selectActortypesWithActorCount(state),
});

export function mapDispatchToProps(dispatch) {
  return {
    onLoadData: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onUpdatePath: (path) => {
      dispatch(updatePath(path));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(ActorsOverview));
