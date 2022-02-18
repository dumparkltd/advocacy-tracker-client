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

import { ROUTES, RESOURCETYPE_NAVGROUPS } from 'themes/config';
import { loadEntitiesIfNeeded, updatePath } from 'containers/App/actions';
import { selectReady } from 'containers/App/selectors';
import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import Container from 'components/styled/Container';
import Content from 'components/styled/Content';
import CardTeaser from 'components/CardTeaser';
import Footer from 'containers/Footer';

import { selectResourcetypesWithResourceCount } from './selectors';
import { DEPENDENCIES } from './constants';


const Group = styled((p) => <Box margin={{ bottom: 'large', top: 'medium' }} {...p} />)``;
const GroupTitle = styled.h5`
  font-size: 14px;
`;
const ViewContainer = styled(Container)`
  min-height: 85vH;
  @media print {
    min-height: 50vH;
  }
`;
export function ResourcesOverview({
  onLoadData, types, onUpdatePath, intl, dataReady,
}) {
  useEffect(() => {
    // kick off loading of data
    onLoadData();
  }, []);
  const size = React.useContext(ResponsiveContext);

  return (
    <ContainerWrapper hasFooter>
      <ViewContainer>
        <Content>
          {Object.keys(RESOURCETYPE_NAVGROUPS).map((key) => (
            <Group key={key}>
              <GroupTitle>
                <FormattedMessage {...appMessages.resourcetypeGroups[key]} />
              </GroupTitle>
              <Box direction={size === 'small' ? 'column' : 'row'} gap="small">
                {RESOURCETYPE_NAVGROUPS[key].types.map((typeId) => {
                  const path = `${ROUTES.RESOURCES}/${typeId}`;
                  const count = types.getIn([typeId, 'count']) ? parseInt(types.getIn([typeId, 'count']), 10) : 0;
                  const { primary } = RESOURCETYPE_NAVGROUPS[key];
                  return (
                    <CardTeaser
                      key={typeId}
                      basis={primary ? '1/2' : '1/4'}
                      primary={primary}
                      path={path}
                      onClick={(evt) => {
                        if (evt && evt.preventDefault) evt.preventDefault();
                        onUpdatePath(path);
                      }}
                      dataReady={dataReady}
                      count={count}
                      title={
                        intl.formatMessage(appMessages.resourcetypes_long[typeId])
                      }
                      description={
                        intl.formatMessage(appMessages.resourcetypes_about[typeId])
                      }
                    />
                  );
                })}
              </Box>
            </Group>
          ))}
        </Content>
      </ViewContainer>
      <Footer />
    </ContainerWrapper>
  );
}

ResourcesOverview.propTypes = {
  intl: intlShape.isRequired,
  onLoadData: PropTypes.func.isRequired,
  onUpdatePath: PropTypes.func.isRequired,
  types: PropTypes.instanceOf(Map),
  dataReady: PropTypes.bool,
};

const mapStateToProps = createStructuredSelector({
  dataReady: (state) => selectReady(state, DEPENDENCIES),
  types: (state) => selectResourcetypesWithResourceCount(state),
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

export default compose(withConnect)(injectIntl(ResourcesOverview));
