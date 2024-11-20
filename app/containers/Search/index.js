/*
 *
 * Search
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import styled, { withTheme } from 'styled-components';
import { palette } from 'styled-theme';
import { fromJS } from 'immutable';
import { Box, Text } from 'grommet';
import { FormUp, FormDown } from 'grommet-icons';
import { FormattedMessage } from 'react-intl';

import { startsWith } from 'utils/string';
import qe from 'utils/quasi-equals';

import { loadEntitiesIfNeeded, updatePath } from 'containers/App/actions';
import {
  selectReady,
} from 'containers/App/selectors';
import { CONTENT_LIST } from 'containers/App/constants';

import Button from 'components/buttons/Button';
import Container from 'components/styled/Container';
import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import ContentSimple from 'components/styled/ContentSimple';
import Loading from 'components/Loading';
import ContentHeader from 'containers/ContentHeader';
import EntityListSearch from 'components/EntityListSearch';
import EntityListItem from 'components/EntityListItem';

import appMessages from 'containers/App/messages';
import {
  ROUTES,
  ACTORTYPES,
  OUTREACH_ACTIONTYPES,
  ACTIONTYPES,
  RESOURCETYPES,
} from 'themes/config';

import { DEPENDENCIES } from './constants';

import {
  selectEntitiesByQuery,
  selectPathQuery,
  selectAllTypeCounts,
} from './selectors';

import {
  updateQuery,
  updateSortBy,
  updateSortOrder,
} from './actions';

import messages from './messages';

import ContentPreview from './ContentPreview';

const StyledContainer = styled((p) => <Container {...p} />)``;
const SearchCardWrapper = styled.div`
  background: white;
  box-shadow: ${({ hasResults }) => hasResults ? 'none' : '0px 0px 5px 0px rgba(0,0,0,0.5)'};
`;
const EntityListSearchWrapper = styled.div`
  padding: 1.5em 0 2em 0;
`;
// TODO compare EntityListSidebarOption
const Target = styled(Button)`
  font-size: 0.85em;
  font-weight: ${(props) => props.active ? 'bold' : 'normal'};
  padding: 0;
  text-align: left;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding: 0;
  }
`;
const ListHint = styled.div`
  color:  ${palette('dark', 3)};
  margin-bottom: 50px;
`;
const ListWrapper = styled.div``;

export class Search extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
  }

  getTargetTitle = (target, count, intl) => {
    let msg;
    if (startsWith(target.get('path'), 'taxonomies')) {
      msg = appMessages.entities.taxonomies[target.get('taxId')];
    } else {
      msg = appMessages.entities[target.get('optionPath') || target.get('path')];
    }
    if (!msg) {
      return target.get('path');
    }
    if (count === 1) {
      return intl.formatMessage(msg.singleLong || msg.single);
    }
    return intl.formatMessage(msg.pluralLong || msg.plural);
  };

  prepareContentPreviewItems = (intl, counts) => ([
    {
      title: 'Positions',
      id: 'positions',
      items: [
        {
          path: `${ROUTES.ACTIONS}/${ACTIONTYPES.EXPRESS}`,
          title: intl.formatMessage(appMessages.entities.actions_1.plural),
          description: intl.formatMessage(appMessages.actiontypes_about[1]),
          count: (counts && counts.statementsCount) || 0,
        },
        {
          path: `${ROUTES.INDICATORS}`,
          title: intl.formatMessage(appMessages.entities.indicators.plural),
          description: intl.formatMessage(appMessages.actiontypes_about[3]),
          count: (counts && counts.indicatorsCount) || 0,
        },
      ],
    },
    {
      title: 'Stakeholders',
      id: 'stakeholders',
      items: [...Object.values(ACTORTYPES).reduce(
        (memo, actortypeId) => [
          ...memo,
          {
            path: `${ROUTES.ACTORS}/${actortypeId}`,
            title: intl.formatMessage(appMessages.actortypes_long[actortypeId]),
            description: intl.formatMessage(appMessages.actortypes_about[actortypeId]),
            count: (counts && counts.actortypesWithCount && counts.actortypesWithCount.getIn([actortypeId, 'count'])) || 0,
          },
        ],
        [],
      )],
    },
    {
      title: 'Outreach',
      id: 'outreach',
      items: [...OUTREACH_ACTIONTYPES.reduce(
        (memo, actionTypeId) => [
          ...memo,
          {
            path: `${ROUTES.ACTIONS}/${actionTypeId}`,
            title: intl.formatMessage(appMessages.actiontypes_long[actionTypeId]),
            description: intl.formatMessage(appMessages.actiontypes_about[actionTypeId]),
            count: (counts && counts.actiontypesWithCount && counts.actiontypesWithCount.getIn([actionTypeId, 'count'])) || 0,
          },
        ],
        [],
      )],
    },
    {
      title: 'Admin',
      id: 'admin',
      items: [
        {
          path: `${ROUTES.RESOURCES}/${RESOURCETYPES.WEB}`,
          title: intl.formatMessage(appMessages.entities.resources.plural),
          description: intl.formatMessage(messages.resources_about),
          count: (counts && counts.resourcesCount) || 0,
        },
        {
          path: `${ROUTES.USERS}`,
          title: intl.formatMessage(appMessages.entities.users.plural),
          description: intl.formatMessage(messages.users_about),
          count: (counts && counts.usersCount) || 0,
        },
        {
          path: `${ROUTES.PAGES}`,
          title: intl.formatMessage(appMessages.entities.pages.plural),
          description: intl.formatMessage(messages.pages_about),
          count: (counts && counts.pagesCount) || 0,
        },
        {
          path: `${ROUTES.TAXONOMIES}`,
          title: intl.formatMessage(appMessages.entities.categories.plural),
          description: intl.formatMessage(messages.categories_about),
          count: (counts && counts.categoriesCount) || 0,
        },
      ],
    },
  ]);

  render() {
    const { intl } = this.context;
    const {
      dataReady,
      location,
      onSearch,
      entities,
      onEntityClick,
      activeTargetPath,
      allTypeCounts,
      onUpdatePath,
    } = this.props;
    const hasQuery = !!location.query.search;
    const countResults = dataReady && hasQuery && entities && entities.reduce(
      (memo, group) => group.get('targets').reduce(
        (memo2, target) => target.get('results')
          ? memo2 + target.get('results').size
          : memo2,
        memo,
      ),
      0
    );
    const hasResults = countResults > 0;
    const countTargets = dataReady && hasQuery && entities && entities.reduce(
      (memo, group) => group.get('targets').reduce(
        (memo2, target) => {
          if (target.get('results') && target.get('results').size > 0) {
            return memo2 + 1;
          }
          return memo2;
        },
        memo,
      ),
      0,
    );
    const headerButtons = [{
      type: 'icon',
      onClick: () => window.print(),
      title: 'Print',
      icon: 'print',
    }];

    const navItems = this.prepareContentPreviewItems(intl, allTypeCounts);
    return (
      <div>
        <Helmet
          title={intl.formatMessage(messages.pageTitle)}
          meta={[
            { name: 'description', content: intl.formatMessage(messages.metaDescription) },
          ]}
        />
        <ContainerWrapper bg={!hasResults}>
          <SearchCardWrapper hasResults={hasResults}>
            <StyledContainer>
              <ContentSimple>
                <ContentHeader
                  type={CONTENT_LIST}
                  title={intl.formatMessage(messages.pageTitle)}
                  icon="search"
                  buttons={headerButtons}
                />
                {!dataReady && <Loading />}
                {dataReady && (
                  <div>
                    <EntityListSearchWrapper>
                      <EntityListSearch
                        placeholder={intl.formatMessage(messages.placeholder)}
                        searchQuery={location.query.search || ''}
                        onSearch={onSearch}
                      />
                    </EntityListSearchWrapper>
                    <ListWrapper>
                      {!hasQuery && (
                        <ListHint>
                          <FormattedMessage {...messages.hints.noQuery} />
                        </ListHint>
                      )}
                      {hasQuery && !hasResults && (
                        <ListHint>
                          <FormattedMessage {...messages.hints.noResultsNoAlternative} />
                        </ListHint>
                      )}
                      {hasResults && (
                        <Box>
                          <ListHint>
                            <Text>
                              {`${countResults} ${countResults === 1 ? 'result' : 'results'} found in database. `}
                            </Text>
                            {countTargets > 1 && (
                              <Text>
                                Please select a content type below to see individual results
                              </Text>
                            )}
                          </ListHint>
                          {entities.map(
                            (group, id) => {
                              const hasGroupResults = group.get('targets').some(
                                (target) => target.get('results') && target.get('results').size > 0
                              );
                              if (hasGroupResults) {
                                return (
                                  <Box key={id} margin={{ bottom: 'large' }}>
                                    <Box margin={{ bottom: 'xsmall' }}>
                                      <Text size="small">
                                        <FormattedMessage {...messages.groups[group.get('group')]} />
                                      </Text>
                                    </Box>
                                    <Box>
                                      {group.get('targets') && group.get('targets').map(
                                        (target) => {
                                          const hasTargetResults = target.get('results') && target.get('results').size > 0;
                                          if (hasTargetResults) {
                                            const count = target.get('results').size;
                                            const title = this.getTargetTitle(target, count, intl);
                                            const active = qe(target.get('optionPath'), activeTargetPath);
                                            const otherTargets = countTargets > 1;
                                            return (
                                              <Box key={target.get('optionPath')}>
                                                <Box border="bottom" gap="xsmall">
                                                  <Target
                                                    onClick={(evt) => {
                                                      if (evt !== undefined && evt.preventDefault) evt.preventDefault();
                                                      if (active) {
                                                        this.props.onTargetSelect('');
                                                      } else {
                                                        this.props.onTargetSelect(target.get('optionPath'));
                                                      }
                                                    }}
                                                    active={active}
                                                  >
                                                    <Box direction="row" gap="small" align="center" justify="between">
                                                      <Box direction="row" gap="xsmall" pad={{ vertical: 'small' }}>
                                                        <Text size="large">
                                                          {count}
                                                        </Text>
                                                        <Text size="large">
                                                          {title}
                                                        </Text>
                                                      </Box>
                                                      {otherTargets && active && (
                                                        <FormUp size="large" />
                                                      )}
                                                      {otherTargets && !active && (
                                                        <FormDown size="large" />
                                                      )}
                                                    </Box>
                                                  </Target>
                                                </Box>
                                                {(active || !otherTargets) && (
                                                  <Box margin={{ bottom: 'large' }}>
                                                    {target.get('results').toList().map((entity, key) => (
                                                      <EntityListItem
                                                        key={key}
                                                        entity={entity}
                                                        entityPath={target.get('clientPath') || target.get('path')}
                                                        onEntityClick={onEntityClick}
                                                      />
                                                    ))}
                                                  </Box>
                                                )}
                                              </Box>
                                            );
                                          }
                                          return null;
                                        }
                                      )}
                                    </Box>
                                  </Box>
                                );
                              }
                              return null;
                            }
                          )}
                        </Box>
                      )}
                    </ListWrapper>
                  </div>
                )}
              </ContentSimple>
            </StyledContainer>
          </SearchCardWrapper>
          {!hasResults && !hasQuery && (
            <ContentPreview
              navItems={navItems}
              dataReady={dataReady}
              onUpdatePath={onUpdatePath}
            />
          )}
        </ContainerWrapper>
      </div>
    );
  }
}

Search.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  dataReady: PropTypes.bool,
  entities: PropTypes.object, // List
  location: PropTypes.object,
  activeTargetPath: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
  onTargetSelect: PropTypes.func.isRequired,
  onEntityClick: PropTypes.func.isRequired,
  onSortOrder: PropTypes.func.isRequired,
  onSortBy: PropTypes.func.isRequired,
  onUpdatePath: PropTypes.func.isRequired,
  theme: PropTypes.object,
  allTypeCounts: PropTypes.object,
};

Search.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  entities: selectEntitiesByQuery(state),
  activeTargetPath: selectPathQuery(state),
  allTypeCounts: selectAllTypeCounts(state),
});
function mapDispatchToProps(dispatch) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onSearch: (value) => {
      // console.log('onSearch')
      dispatch(updateQuery(fromJS([
        {
          query: 'search',
          value,
          replace: true,
          checked: value !== '',
        },
      ])));
    },
    onTargetSelect: (value) => {
      // console.log('onTargetSelect')
      dispatch(updateQuery(fromJS([
        {
          query: 'path',
          value,
          replace: true,
          checked: value !== '',
        },
      ])));
    },
    onEntityClick: (id, path) => {
      dispatch(updatePath(`${path}/${id}`));
    },
    onSortOrder: (order) => {
      dispatch(updateSortOrder(order));
    },
    onSortBy: (sort) => {
      dispatch(updateSortBy(sort));
    },
    onUpdatePath: (path) => {
      dispatch(updatePath(path));
    },
  };
}

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(Search));
