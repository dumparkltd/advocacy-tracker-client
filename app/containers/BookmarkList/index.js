/*
 *
 * BookmarkList
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { List, fromJS } from 'immutable';
import styled, { withTheme } from 'styled-components';
import { palette } from 'styled-theme';
import { FormattedMessage } from 'react-intl';

import { qe } from 'utils/quasi-equals';

import { loadEntitiesIfNeeded, openBookmark } from 'containers/App/actions';
import { selectReady, selectEntities } from 'containers/App/selectors';
import { getNextQueryString } from 'containers/App/sagas';
import { CONTENT_LIST, VIEWPORTS } from 'containers/App/constants';
import { API, ROUTES } from 'themes/config';

import appMessages from 'containers/App/messages';

import Button from 'components/buttons/Button';
import ContainerWithSidebar from 'components/styled/Container/ContainerWithSidebar';
import Container from 'components/styled/Container';
import Loading from 'components/Loading';
import ContentHeader from 'containers/ContentHeader';
import Scrollable from 'components/styled/Scrollable';
import Sidebar from 'components/styled/Sidebar';
import SidebarHeader from 'components/styled/SidebarHeader';
import SidebarGroupLabel from 'components/styled/SidebarGroupLabel';
import SupTitle from 'components/SupTitle';
import Component from 'components/styled/Component';
import ContentSimple from 'components/styled/ContentSimple';
import EntityListItem from 'components/EntityListItem';
import PrintHide from 'components/styled/PrintHide';

import EntityListMainHeader from './EntityListMainHeader';
import {
  updateQuery,
  updateSortBy,
  updateSortOrder,
} from './actions';

import { DEPENDENCIES, CONFIG } from './constants';
import { selectBookmarks, selectTypeQuery } from './selectors';
import messages from './messages';

const ScrollableWrapper = styled(Scrollable)`
  background-color: ${palette('aside', 0)};
`;
const Group = styled.div`
  border-bottom: ${(props) => props.hasBorder ? '1px solid' : 0};
  border-color: ${(props) => props.expanded ? palette('aside', 0) : palette('light', 2)};
  &:last-child {
    border-bottom: 0;
  }
`;

// TODO compare EntityListSidebarOption
const Target = styled(Button)`
  display: table;
  width: 100%;
  font-size: 0.85em;
  font-weight: ${(props) => props.active ? 'bold' : 'normal'};
  padding: 0.3em 8px 0.3em 12px;
  text-align: left;
  color:  ${(props) => {
    if (props.disabled) {
      return props.active ? palette('asideListItem', 1) : palette('dark', 4);
    }
    return props.active ? palette('asideListItem', 1) : palette('asideListItem', 0);
  }};
  background-color: ${(props) => props.active ? palette('asideListItem', 3) : palette('asideListItem', 2)};
  border-bottom: 1px solid ${palette('asideListItem', 4)};
  &:hover {
    color: ${(props) => {
    if (props.disabled) {
      return props.active ? palette('asideListItem', 1) : palette('dark', 4);
    }
    return props.active ? palette('asideListItemHover', 1) : palette('asideListItemHover', 0);
  }};
    background-color: ${(props) => {
    if (props.disabled) {
      return props.active ? palette('asideListItem', 3) : palette('asideListItem', 2);
    }
    return props.active ? palette('asideListItemHover', 3) : palette('asideListItemHover', 2);
  }};
    border-bottom-color: ${palette('asideListItemHover', 4)}
  }
  &:last-child {
    border-bottom: 0;
  }
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    font-size: 0.85em;
    padding: 0.3em 8px 0.3em 12px;
  }
  @media (min-width: ${({ theme }) => theme.breakpointsMin.xlarge}) {
    padding: 0.4em 20px 0.4em 24px
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.print.smaller};
  }
`;

const TargetTitle = styled.div`
  vertical-align: middle;
  display: table-cell;
  width: 99%;
`;

const ListHint = styled.div`
  color:  ${palette('dark', 3)};
  padding-bottom: 10px;
`;
const ListWrapper = styled.div``;
const ListEntitiesMain = styled.div`
  padding-top: 0.5em;
`;

const STATE_INITIAL = {
  viewport: null,
};
const stripSlash = (txt) => txt.replace('/', '');
const getTypeLabel = (type, formatMessage, short = true) => {
  const [path, entitytype] = type.indexOf('_') > -1
    ? type.split('_')
    : [type, null];
  let label = formatMessage(appMessages.entities[path].plural);
  if (entitytype && path === stripSlash(ROUTES.ACTORS)) {
    label = `${label} | ${formatMessage(appMessages[short ? 'actortypes_short' : 'actortypes'][entitytype])}`;
  } else if (entitytype && path === stripSlash(ROUTES.ACTIONS)) {
    label = `${label} | ${formatMessage(appMessages[short ? 'actiontypes_short' : 'actiontypes'][entitytype])}`;
  }
  return label;
};
export class BookmarkList extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = STATE_INITIAL;
  }

  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
  }

  componentDidMount() {
    this.updateViewport();
    window.addEventListener('resize', this.resize);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  resize = () => {
    // reset
    this.setState(STATE_INITIAL);
    this.updateViewport();
    this.forceUpdate();
  };

  renderBookmarkTypes = () => {
    const { intl } = this.context;
    return (
      <div>
        <Group>
          <SidebarGroupLabel>
            <FormattedMessage {...messages.group} />
          </SidebarGroupLabel>
          <div>
            {this.props.bookmarksForSearch && this.props.bookmarksForSearch
              .groupBy((e) => e.getIn(['attributes', 'view', 'type']))
              .keySeq()
              .sort((a, b) => a > b ? 1 : -1)
              .map((type) => {
                const label = getTypeLabel(type, intl.formatMessage, true);
                return (
                  <Target
                    key={type}
                    onClick={(evt) => {
                      if (evt !== undefined && evt.preventDefault) evt.preventDefault();
                      if (type === this.props.activeType) {
                        this.props.onTypeSelect('');
                      } else {
                        this.props.onTypeSelect(type);
                      }
                    }}
                    active={type === this.props.activeType}
                  >
                    <TargetTitle>
                      {label}
                    </TargetTitle>
                  </Target>
                );
              })
            }
          </div>
        </Group>
      </div>
    );
  };

  updateViewport() {
    let viewport = VIEWPORTS.MOBILE;
    if (window.innerWidth > parseInt(this.props.theme.breakpoints.xlarge, 10)) {
      viewport = VIEWPORTS.LARGE;
    } else if (window.innerWidth > parseInt(this.props.theme.breakpoints.large, 10)) {
      viewport = VIEWPORTS.MEDIUM;
    } else if (window.innerWidth > parseInt(this.props.theme.breakpoints.medium, 10)) {
      viewport = VIEWPORTS.SMALL;
    }
    this.setState({ viewport });
  }

  render() {
    const { intl } = this.context;
    const {
      dataReady,
      location,
      bookmarksForSearch,
      onOpenBookmark,
      onSortOrder,
      onSortBy,
      activeType,
      allBookmarks,
    } = this.props;
    const hasBookmarks = allBookmarks && allBookmarks.size > 0;
    const filtered = activeType && activeType !== '';
    const bookmarksFiltered = bookmarksForSearch.filter((e) => !filtered || qe(activeType, e.getIn(['attributes', 'view', 'type'])));

    return (
      <div>
        <Helmet
          title={intl.formatMessage(messages.pageTitle)}
          meta={[
            { name: 'description', content: intl.formatMessage(messages.metaDescription) },
          ]}
        />
        {dataReady
          && hasBookmarks
          && this.state.viewport
          && this.state.viewport !== VIEWPORTS.MOBILE
          && (
            <PrintHide>
              <Sidebar responsiveSmall>
                <ScrollableWrapper>
                  <Component>
                    <SidebarHeader responsiveSmall>
                      <SupTitle title={intl.formatMessage(messages.sidebarTitle)} />
                    </SidebarHeader>
                    {
                      this.renderBookmarkTypes()
                    }
                  </Component>
                </ScrollableWrapper>
              </Sidebar>
            </PrintHide>
          )
        }
        <ContainerWithSidebar noSidebar={!hasBookmarks} sidebarResponsiveSmall>
          <Container>
            <ContentSimple>
              <ContentHeader
                type={CONTENT_LIST}
                title={intl.formatMessage(messages.pageTitle)}
                icon="bookmark_active"
              />
              {!dataReady
                && <Loading />
              }
              {dataReady && (
                <div>
                  <ListWrapper>
                    {(allBookmarks.size === 0) && (
                      <ListHint>
                        <FormattedMessage {...messages.noBookmarks} />
                      </ListHint>
                    )}
                    {(allBookmarks.size > 0 && bookmarksFiltered.size === 0) && (
                      <ListHint>
                        <FormattedMessage {...messages.noResults} />
                      </ListHint>
                    )}
                    {bookmarksFiltered && bookmarksFiltered.size > 0 && (
                      <div>
                        <EntityListMainHeader
                          entitiesTotal={bookmarksFiltered.size}
                          entityTitle={{
                            single: intl.formatMessage(messages.single),
                            plural: intl.formatMessage(messages.plural),
                          }}
                          sortOptions={CONFIG.sorting}
                          sortBy={location.query.sort}
                          sortOrder={location.query.order}
                          onSortBy={onSortBy}
                          onSortOrder={onSortOrder}
                        />
                        <ListEntitiesMain>
                          {bookmarksFiltered.map((bookmark, key) => {
                            const type = bookmark.getIn(['attributes', 'view', 'type']);
                            const label = getTypeLabel(type, intl.formatMessage, false);
                            const path = bookmark.getIn(['attributes', 'view', 'path']);
                            const queryString = getNextQueryString(
                              bookmark.getIn(['attributes', 'view', 'query']).toJS(),
                            );
                            return (
                              <EntityListItem
                                key={key}
                                entity={bookmark.setIn(['attributes', 'reference'], label)}
                                entityPath={bookmark.getIn(['attributes', 'view', 'path'])}
                                onEntityClick={() => onOpenBookmark(bookmark)}
                                url={`${path}?${queryString}`}
                              />
                            );
                          })}
                        </ListEntitiesMain>
                      </div>
                    )}
                  </ListWrapper>
                </div>
              )}
            </ContentSimple>
          </Container>
        </ContainerWithSidebar>
      </div>
    );
  }
}

BookmarkList.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  dataReady: PropTypes.bool,
  location: PropTypes.object,
  onOpenBookmark: PropTypes.func.isRequired,
  onSortOrder: PropTypes.func.isRequired,
  onSortBy: PropTypes.func.isRequired,
  theme: PropTypes.object,
  bookmarksForSearch: PropTypes.instanceOf(List).isRequired,
  allBookmarks: PropTypes.object.isRequired,
  onTypeSelect: PropTypes.func.isRequired,
  activeType: PropTypes.string,
};

BookmarkList.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  bookmarksForSearch: selectBookmarks(state, fromJS(props.location.query)),
  activeType: selectTypeQuery(state),
  allBookmarks: selectEntities(state, API.BOOKMARKS),
});
function mapDispatchToProps(dispatch) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onTypeSelect: (value) => {
      // console.log('onTypeSelect')
      dispatch(updateQuery(fromJS([
        {
          query: 'type',
          value,
          replace: true,
          checked: value !== '',
        },
      ])));
    },
    onOpenBookmark: (bookmark) => {
      dispatch(openBookmark(bookmark));
    },
    onSortOrder: (order) => {
      dispatch(updateSortOrder(order));
    },
    onSortBy: (sort) => {
      dispatch(updateSortBy(sort));
    },
  };
}

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(BookmarkList));
