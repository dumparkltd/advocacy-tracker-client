import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { injectIntl, intlShape } from 'react-intl';
import { Map, List } from 'immutable';
import { Box, Button, ResponsiveContext } from 'grommet';

import styled from 'styled-components';

import appMessages from 'containers/App/messages';
import qe from 'utils/quasi-equals';
import { isMaxSize } from 'utils/responsive';

import { ROUTES, FF_ACTIONTYPE } from 'themes/config';
import { updatePath } from 'containers/App/actions';

import HeaderExplore from 'containers/HeaderExplore';
import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import Container from 'components/styled/Container';
import Content from 'components/styled/Content';
import CardTeaser from 'components/CardTeaser';
import Footer from 'containers/Footer';
import ButtonFactory from 'components/buttons/ButtonFactory';

const Group = styled((p) => <Box margin={{ bottom: 'large', top: 'medium' }} {...p} />)``;
const GroupTitle = styled.h5`
  font-size: 14px;
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
`;
const GroupTitleLabel = styled(GroupTitle)`
  color: ${({ theme }) => theme.global.colors.text.brand};
`;
const ViewContainer = styled(Container)`
  min-height: 70vH;
  @media print {
    min-height: 50vH;
  }
`;

const ResourceButton = styled((p) => <Button plain {...p} />)``;

export function ActionsFactsOverview({
  entities, intl, dataReady, handleNew, isManager, connections, onUpdatePath,
}) {
  const typeId = FF_ACTIONTYPE;
  const type = `actions_${typeId}`;

  const optionNew = dataReady && isManager && {
    type: 'add',
    title: [
      intl.formatMessage(appMessages.buttons.add),
      {
        title: intl.formatMessage(appMessages.entities[type].single),
        hiddenSmall: true,
      },
    ],
    onClick: () => handleNew(typeId),
  };
  const indicatorsByResourceId = entities.groupBy(
    (entity) => {
      if (entity.get('resources')) {
        return entity.get('resources').toList().first();
      }
      return 'without';
    }
  );
  const size = React.useContext(ResponsiveContext);
  return (
    <ContainerWrapper bg>
      <HeaderExplore />
      <ViewContainer>
        <Content>
          {optionNew && (
            <Box align="end" margin={{ top: 'small' }}>
              <ButtonFactory button={optionNew} />
            </Box>
          )}
          <Box>
            {dataReady && indicatorsByResourceId && indicatorsByResourceId.keySeq().map(
              (resourceId) => {
                const resource = !qe(resourceId, 'without')
                  && connections
                  && connections.getIn(['resources', resourceId.toString()]);
                const resourceIndicators = indicatorsByResourceId.get(resourceId);
                return (
                  <Group key={`res-${resourceId}`}>
                    {resource && (
                      <Box
                        pad={{ vertical: 'medium' }}
                        direction={isMaxSize(size, 'medium') ? 'column' : 'row'}
                        gap="xsmall"
                      >
                        <Box>
                          <GroupTitleLabel>
                            Publication
                          </GroupTitleLabel>
                        </Box>
                        <Box>
                          <ResourceButton
                            as="a"
                            href={`${ROUTES.RESOURCE}/${resourceId}`}
                            onClick={(e) => {
                              if (e) e.preventDefault();
                              onUpdatePath(`${ROUTES.RESOURCE}/${resourceId}`);
                            }}
                          >
                            <GroupTitle>
                              {resource.getIn(['attributes', 'title'])}
                            </GroupTitle>
                          </ResourceButton>
                        </Box>
                      </Box>
                    )}
                    {!resource && (
                      <GroupTitle>
                        Without resource
                      </GroupTitle>
                    )}
                    <Box direction={isMaxSize(size, 'medium') ? 'column' : 'row'} gap="small">
                      {resourceIndicators && resourceIndicators.map((indicator) => {
                        const path = `${ROUTES.ACTION}/${indicator.get('id')}`;
                        const [lead] = indicator.getIn(['attributes', 'description']).split('\n');
                        return (
                          <CardTeaser
                            key={indicator.get('id')}
                            basis="1/3"
                            path={path}
                            onClick={(evt) => {
                              if (evt && evt.preventDefault) evt.preventDefault();
                              onUpdatePath(path);
                            }}
                            dataReady={dataReady}
                            title={
                              indicator.getIn(['attributes', 'title'])
                            }
                            description={lead}
                          />
                        );
                      })}
                    </Box>
                  </Group>
                );
              }
            )}
          </Box>
        </Content>
      </ViewContainer>
      <Footer />
    </ContainerWrapper>
  );
}

ActionsFactsOverview.propTypes = {
  intl: intlShape.isRequired,
  dataReady: PropTypes.bool,
  onUpdatePath: PropTypes.func.isRequired,
  handleNew: PropTypes.func,
  entities: PropTypes.instanceOf(List).isRequired,
  connections: PropTypes.instanceOf(Map),
  isManager: PropTypes.bool,
};

export function mapDispatchToProps(dispatch) {
  return {
    onUpdatePath: (path) => {
      dispatch(updatePath(path));
    },
    handleNew: (typeId) => {
      dispatch(updatePath(`${ROUTES.ACTIONS}/${typeId}${ROUTES.NEW}`, { replace: true }));
    },
  };
}

const withConnect = connect(
  null,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(ActionsFactsOverview));
