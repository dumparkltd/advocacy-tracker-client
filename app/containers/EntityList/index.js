/*
 *
 * EntityList
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Edit } from 'grommet-icons';
import { Map, List, fromJS } from 'immutable';
import ReactModal from 'react-modal';

import { qe } from 'utils/quasi-equals';
import { jumpToComponent } from 'utils/scroll-to-component';
import {
  getActiontypePreviewFields,
  getActortypePreviewFields,
} from 'utils/fields';

import Messages from 'components/Messages';
import Loading from 'components/Loading';
import Icon from 'components/Icon';
import EntityListHeader from 'components/EntityListHeader';
import EntityListSidebar from 'components/EntityListSidebar';

import EntityListDownload from 'components/EntityListDownload';
import EntityListDelete from 'components/EntityListDelete';
import NavSecondary from 'containers/NavSecondary';
import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import Container from 'components/styled/Container';
import Content from 'components/styled/ContentSimple';

import {
  selectHasUserRole,
  selectCurrentPathname,
  selectAllTaxonomiesWithCategories,
  selectViewQuery,
  selectMapSubjectQuery,
  selectIncludeActorMembers,
  selectIncludeActorChildren,
  selectIncludeInofficialStatements,
  selectIncludeUnpublishedAPIStatements,
  selectTaxonomiesWithCategories,
  selectIsPrintView,
  selectSearchQuery,
  selectSessionUserId,
} from 'containers/App/selectors';

import {
  setListPreview,
  openNewEntityModal,
  setView,
  updateRouteQuery,
  setMapSubject,
  setIncludeActorMembers,
  setIncludeActorChildren,
  setIncludeInofficialStatements,
  setIncludeUnpublishedAPIStatements,
  saveMultipleEntities,
  newMultipleEntities,
  deleteMultipleEntities,
  updatePath,
} from 'containers/App/actions';
import appMessages from 'containers/App/messages';

// import appMessages from 'containers/App/messages';
import {
  USER_ROLES,
  ACTION_FIELDS,
  ACTOR_FIELDS,
  INDICATOR_FIELDS,
  ROUTES,
  API,
} from 'themes/config';

import EntitiesMap from './EntitiesMap';
import EntitiesListView from './EntitiesListView';

import {
  selectDomain,
  selectProgress,
  selectActivePanel,
  selectSelectedEntities,
  selectProgressTypes,
} from './selectors';

import messages from './messages';

import {
  resetProgress,
  // saveMultiple,
  // newMultipleConnections,
  // deleteMultipleConnections,
  selectEntity,
  selectMultipleEntities,
  updateQuery,
  setClientPath,
  dismissError,
  dismissAllErrors,
  resetFilters,
  setFilters,
} from './actions';

import { currentFilters, currentFilterArgs } from './current-filters';

const Progress = styled.div`
  position: fixed;
  width: 100%;
  display: block;
  background: white;
  bottom: 0;
  left: 0;
  right: 0;
  box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.2);
  background-color: ${palette('primary', 4)};
  padding: ${({ error }) => error ? 0 : 40}px;
  z-index: 200;
`;

const ProgressText = styled.div`
  font-weight: bold;
  font-size: 1em;
  color: ${palette('primary', 2)};
  margin-bottom: 0.25em;
  margin-top: -0.5em;
  overflow: hidden;
  @media print {
    font-size: ${({ theme }) => theme.sizes.print.default};
  }
`;

const STATE_INITIAL = {
  visibleFilters: null,
  visibleEditOptions: null,
  deleteConfirm: null,
  downloadActive: false,
};
const reducePreviewItem = ({
  item, id, path, intl, onUpdatePath, isCoordinator, isMember,
}) => {
  if (id && path) {
    return { entity: { path, id } };
  }
  if (item && qe(item.get('type'), API.ACTORS)) {
    const label = intl.formatMessage(
      appMessages.entities[`actors_${item.getIn(['attributes', 'actortype_id'])}`].single
    );
    let title = item ? item.getIn(['attributes', 'title']) : 'undefined';
    if (item.getIn(['attributes', 'prefix']) && item.getIn(['attributes', 'prefix']).trim().length > 0) {
      title = `${title} (${item.getIn(['attributes', 'prefix'])})`;
    }
    const content = {
      header: {
        aboveTitle: label,
        title,
        titlePath: `${ROUTES.ACTOR}/${item.get('id')}`,
        topActions: [{
          label: 'Edit',
          path: `${ROUTES.ACTOR}${ROUTES.EDIT}/${item.get('id')}`,
          onClick: (e) => {
            if (e && e.preventDefault) e.preventDefault();
            onUpdatePath(`${ROUTES.ACTOR}${ROUTES.EDIT}/${item.get('id')}`);
          },
        }],
      },
      fields: getActortypePreviewFields(item.getIn(['attributes', 'actortype_id'])),
      item,
      footer: {
        primaryLink: item && {
          path: `${ROUTES.ACTOR}/${item.get('id')}`,
          title: `${label} details`,
        },
      },
    };
    return content;
  }
  if (item && qe(item.get('type'), API.ACTIONS)) {
    const label = intl.formatMessage(
      appMessages.entities[`actions_${item.getIn(['attributes', 'measuretype_id'])}`].single
    );
    let topActions = [];
    const canEdit = item.getIn(['attributes', 'public_api']) ? isCoordinator : isMember;
    if (canEdit) {
      topActions = [
        ...topActions,
        {
          label: 'Edit',
          path: `${ROUTES.ACTION}${ROUTES.EDIT}/${item.get('id')}`,
          onClick: (e) => {
            if (e && e.preventDefault) e.preventDefault();
            onUpdatePath(`${ROUTES.ACTION}${ROUTES.EDIT}/${item.get('id')}`);
          },
        },
      ];
    }
    const content = {
      header: {
        aboveTitle: label,
        title: item && item.getIn(['attributes', 'title']),
        titlePath: `${ROUTES.ACTION}/${item.get('id')}`,
        topActions,
      },
      fields: getActiontypePreviewFields(item.getIn(['attributes', 'measuretype_id'])),
      item,
      footer: {
        primaryLink: item && {
          path: `${ROUTES.ACTION}/${item.get('id')}`,
          title: `${label} details`,
        },
      },
    };
    return content;
  }
  if (item && qe(item.get('type'), API.INDICATORS)) {
    // return { entity: { path: ROUTES.INDICATOR, id: item.get('id') } };
    const label = intl.formatMessage(
      appMessages.entities.indicators.single
    );
    const content = {
      header: {
        aboveTitle: label,
        title: item && item.getIn(['attributes', 'title']),
        topActions: [{
          label: 'Edit',
          path: `${ROUTES.INDICATOR}${ROUTES.EDIT}/${item.get('id')}`,
          onClick: (e) => {
            if (e && e.preventDefault) e.preventDefault();
            onUpdatePath(`${ROUTES.INDICATOR}${ROUTES.EDIT}/${item.get('id')}`);
          },
        }],
      },
      item,
      footer: {
        primaryLink: item && {
          path: `${ROUTES.INDICATOR}/${item.get('id')}`,
          title: `${label} details`,
        },
      },
    };
    return content;
  }
  if (item && qe(item.get('type'), API.USERS)) {
    // return { entity: { path: ROUTES.USERS, id: item.get('id') } };
    const label = intl.formatMessage(
      appMessages.entities.users.single
    );
    const content = {
      header: {
        aboveTitle: label,
        title: item && item.getIn(['attributes', 'name']),
      },
      item,
      footer: {
        primaryLink: item && {
          path: `${ROUTES.USERS}/${item.get('id')}`,
          title: `${label} details`,
        },
      },
    };
    return content;
  }
  if (item && qe(item.get('type'), API.CATEGORIES)) {
    // return { entity: { path: ROUTES.CATEGORY, id: item.get('id') } };
    const label = appMessages.entities.taxonomies[item.getIn(['attributes', 'taxonomy_id'])]
      ? intl.formatMessage(
        appMessages.entities.taxonomies[item.getIn(['attributes', 'taxonomy_id'])].single
      )
      : 'Category';
    const content = {
      header: {
        aboveTitle: label,
        title: item && item.getIn(['attributes', 'title']),
      },
      item,
      footer: {
        primaryLink: item && {
          path: `${ROUTES.CATEGORY}/${item.get('id')}`,
          title: `${label} details`,
        },
      },
    };
    return content;
  }
  if (item && qe(item.get('type'), API.RESOURCES)) {
    const label = intl.formatMessage(
      appMessages.entities[`resources_${item.getIn(['attributes', 'resourcetype_id'])}`].single
    );
    const content = {
      header: {
        aboveTitle: label,
        title: item && item.getIn(['attributes', 'title']),
      },
      item,
      footer: {
        primaryLink: item && {
          path: `${ROUTES.RESOURCE}/${item.get('id')}`,
          title: `${label} details`,
        },
      },
    };
    return content;
  }
  return {};
};

export class EntityList extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.ScrollContainer = React.createRef();
    this.ScrollTarget = React.createRef();
    this.ScrollReference = React.createRef();
    this.state = STATE_INITIAL;
  }

  UNSAFE_componentWillMount() {
    this.props.updateClientPath();
  }

  scrollToTop = () => {
    jumpToComponent(
      this.ScrollTarget.current,
      this.ScrollReference.current,
      this.ScrollContainer.current
    );
  };

  onShowFilters = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({
      visibleFilters: true,
      visibleEditOptions: null,
      deleteConfirm: null,
    });
  };

  onHideFilters = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({ visibleFilters: null });
  };

  onShowEditOptions = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({
      visibleEditOptions: true,
      visibleFilters: null,
      deleteConfirm: null,
    });
  };

  onShowDeleteConfirm = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({
      visibleEditOptions: null,
      visibleFilters: null,
      deleteConfirm: true,
    });
  };

  onHideDeleteConfirm = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({
      visibleEditOptions: null,
      visibleFilters: null,
      deleteConfirm: null,
    });
  };

  onResetEditOptions = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({
      visibleEditOptions: null,
    });
  };

  onHideEditOptions = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({ visibleEditOptions: false });
  };

  onClearFilters = () => {
    this.props.onResetFilters(currentFilterArgs(
      this.props.config,
      this.props.locationQuery,
    ));
    this.props.onDismissAllErrors();
  };

  onDownloadClick = () => {
    this.setState({ downloadActive: true });
  }

  onDownloadDismiss = () => {
    this.setState({ downloadActive: false });
  }

  getMessageForType = (type) => {
    switch (type) {
      case 'new':
        return messages.createSuccess;
      case 'delete':
        return messages.deleteSuccess;
      default:
        return messages.updatesSuccess;
    }
  };

  getFields = (type) => {
    switch (type) {
      case 'actiontypes':
        return ACTION_FIELDS;
      case 'actortypes':
        return ACTOR_FIELDS;
      case 'indicators':
        return INDICATOR_FIELDS;
      default:
        return null;
    }
  }

  mapError = (error, key) => fromJS({
    type: error.data.type,
    error: error.error,
    key,
  });

  mapErrors = (errors) => errors.reduce((errorMap, error, key) => {
    const entityId = error.data.saveRef;
    return errorMap.has(entityId) // check if error already present for entity
      ? errorMap.set(entityId, errorMap.get(entityId).push(this.mapError(error, key)))
      : errorMap.set(entityId, List().push(this.mapError(error, key)));
  }, Map());

  filterByError = (entities, errors) => entities.filter((entity) => errors.has(entity.get('id')));

  render() {
    const { intl } = this.context;
    // make sure selected entities are still actually on page
    const {
      entityIdsSelected,
      progress,
      viewDomain,
      canEdit,
      progressTypes,
      allTaxonomies,
      config,
      locationQuery,
      connections,
      onTagClick,
      actortypes,
      filterActortypes,
      actiontypes,
      resourcetypes,
      onSetView,
      typeId,
      view = 'list',
      onEntitySelectAll,
      dataReady,
      showCode,
      onUpdateQuery,
      filteringOptions,
      includeMembersWhenFiltering,
      mapSubject,
      onSetMapSubject,
      onSetIncludeActorMembers,
      onSetIncludeActorChildren,
      onSetIncludeInofficial,
      onSetIncludeUnpublishedAPI,
      includeActorMembers,
      includeActorChildren,
      includeInofficial,
      includeUnpublishedAPI,
      headerOptions,
      taxonomies,
      connectedTaxonomies,
      includeHeader,
      headerStyle,
      entityTitle,
      hasUserRole,
      onEntitySelect,
      onDismissError,
      onEntityClick,
      onResetProgress,
      membertypes,
      filterAssociationtypes,
      associationtypes,
      handleEditSubmit,
      onCreateOption,
      listActions,
      onEntitiesDelete,
      onUpdateFilters,
      isPrintView,
      searchQuery,
      currentUserId,
      secondaryNavItems,
      onUpdatePath,
      skipPreviews,
    } = this.props;
    // detect print to avoid expensive rendering
    const printing = isPrintView || !!(
      typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('print').matches
    );

    const sending = viewDomain.get('sending');
    const success = viewDomain.get('success');
    const errors = viewDomain.get('errors').size > 0 ? this.mapErrors(viewDomain.get('errors')) : Map();

    const { entities, allEntities } = this.props;
    const entityIdsSelectedFiltered = entityIdsSelected.size > 0 && entities
      ? entityIdsSelected.filter((id) => entities.map((entity) => entity.get('id')).includes(id))
      : entityIdsSelected;
    const isMember = canEdit && hasUserRole[USER_ROLES.MEMBER.value];
    const isCoordinator = canEdit && hasUserRole[USER_ROLES.COORDINATOR.value];
    const isAdmin = canEdit && hasUserRole[USER_ROLES.ADMIN.value];

    const filters = currentFilters(
      {
        config,
        taxonomies: allTaxonomies,
        connections,
        connectedTaxonomies,
        locationQuery,
        onTagClick,
        errors,
        // actortypes,
        intl,
        isAdmin,
      },
      intl.formatMessage(messages.filterFormWithoutPrefix),
      intl.formatMessage(messages.filterFormAnyPrefix),
      intl.formatMessage(messages.filterFormError),
    );
    const hasList = config.views && config.views.list;
    const hasMap = typeId
      && config.views
      && config.views.map
      && config.views.map.types
      && config.views.map.types.indexOf(typeId) > -1;
    const showList = !hasMap || (hasList && view === 'list');
    const showMap = hasMap && view === 'map';

    let viewOptions;
    if (hasList && hasMap) {
      viewOptions = [
        {
          type: 'primaryGroup',
          title: 'List',
          icon: 'list',
          onClick: () => onSetView('list'),
          active: showList,
          disabled: showList,
          isFirst: true,
        },
        {
          type: 'primaryGroup',
          title: 'Map',
          icon: 'map',
          onClick: () => onSetView('map'),
          active: showMap,
          disabled: showMap,
          isLast: true,
        },
      ];
    }
    const hasSelected = dataReady && canEdit && entityIdsSelectedFiltered && entityIdsSelectedFiltered.size > 0;
    const entitiesSelected = hasSelected
      ? entities.filter((entity) => entityIdsSelected.includes(entity.get('id')))
      : null;

    let allListActions;
    let destroyableEntityIdsSelected;
    if (hasSelected) {
      allListActions = listActions || [];
      if (config.batchDelete && isMember) {
        destroyableEntityIdsSelected = isAdmin
          ? entityIdsSelectedFiltered
          : entityIdsSelectedFiltered.filter((id) => {
            const entity = entities.find((e) => qe(e.get('id'), id));
            return entity && qe(entity.getIn(['attributes', 'created_by_id']), currentUserId);
          });
        allListActions = [
          {
            title: 'Delete selected',
            onClick: (evt) => this.onShowDeleteConfirm(evt),
            icon: <Icon name="trash" size="20px" />,
            type: 'listOption',
          },
          ...allListActions,
        ];
      }
      // if (!isAdmin || !this.state.deleteConfirm || !config.batchDelete) {
      allListActions = [
        ...allListActions,
        {
          title: 'Edit selected',
          onClick: (evt) => this.onShowEditOptions(evt),
          icon: <Edit color="white" size="14px" />,
          type: 'listOption',
          active: true,
          isMember,
        },
      ];
      // }
    }
    let headerActions = headerOptions ? headerOptions.actions : [];
    if (config.downloadCSV) {
      headerActions = [
        ...headerActions,
        {
          type: 'icon',
          onClick: () => this.onDownloadClick(),
          title: 'Download CSV',
          icon: 'download',
        },
      ];
    }
    // we only consider the search query for download when we are looking at the list and when we have the default map subject selected
    const isSearchQueryActiveForDownload = !!locationQuery.get('search') && showList;
    const isSelectionActiveForDownload = showList && entityIdsSelectedFiltered && entityIdsSelectedFiltered.size > 0;
    const showFilters = this.state.visibleFilters;
    const showEditOptions = isMember && showList && this.state.visibleEditOptions;

    return (
      <>
        <ContainerWrapper ref={this.ScrollContainer} isPrintView={isPrintView}>
          {secondaryNavItems && (<NavSecondary navItems={secondaryNavItems} />)}
          {config.batchDelete && this.state.deleteConfirm && entityIdsSelectedFiltered && (
            <ReactModal
              isOpen
              onRequestClose={() => this.onHideDeleteConfirm()}
              className="delete-csv-modal"
              overlayClassName="delete-csv-modal-overlay"
              style={{
                overlay: { zIndex: 99999999 },
              }}
              appElement={document.getElementById('app')}
            >
              <EntityListDelete
                selectedCount={entityIdsSelectedFiltered.size}
                destroyableCount={destroyableEntityIdsSelected.size}
                onCancel={() => this.onHideDeleteConfirm()}
                onConfirm={(evt) => {
                  this.onHideDeleteConfirm(evt);
                  onEntitiesDelete(config.serverPath, destroyableEntityIdsSelected);
                  onEntitySelectAll([]);
                }}
              />
            </ReactModal>
          )}
          {config.downloadCSV && this.state.downloadActive && (
            <ReactModal
              isOpen
              onRequestClose={() => this.onDownloadDismiss()}
              className="download-csv-modal"
              overlayClassName="download-csv-modal-overlay"
              style={{
                overlay: { zIndex: 99999999 },
              }}
              appElement={document.getElementById('app')}
            >
              <EntityListDownload
                config={config}
                fields={this.getFields(config.types)}
                typeId={typeId}
                entities={entities}
                taxonomies={taxonomies}
                connections={connections}
                onClose={() => this.onDownloadDismiss()}
                typeNames={{
                  actiontypes: actiontypes && actiontypes.map(
                    (type) => intl.formatMessage(appMessages.entities[`actions_${type.get('id')}`].single)
                  ).toJS(),
                  actortypes: actortypes && actortypes.map(
                    (type) => intl.formatMessage(appMessages.entities[`actors_${type.get('id')}`].single)
                  ).toJS(),
                }}
                isAdmin={isAdmin}
                searchQuery={isSearchQueryActiveForDownload ? locationQuery.get('search') : null}
                entityIdsSelected={isSelectionActiveForDownload ? entityIdsSelectedFiltered : null}
              />
            </ReactModal>
          )}
          {!dataReady && !isPrintView && (
            <Loading loading={!dataReady} />
          )}
          {dataReady && (
            <Container ref={this.ScrollReference} isPrint={isPrintView}>
              <Content isPrint={isPrintView}>
                {headerStyle === 'types' && !printing && (
                  <EntityListHeader
                    currentFilters={filters}
                    canEdit={isMember && showList}
                    headerActions={headerActions}
                    viewOptions={viewOptions}
                    isPrintView={isPrintView}
                    isOnMap={showMap}
                    onShowFilters={this.onShowFilters}
                  />
                )}
                {headerStyle === 'simple' && (
                  <EntityListHeader
                    headerStyle={headerStyle}
                    canEdit={isMember && showList}
                    headerActions={headerOptions && headerOptions.actions}
                    isPrintView={isPrintView}
                  />
                )}
                {showList && dataReady && (
                  <EntitiesListView
                    reducePreviewItem={({ item, id, path }) => reducePreviewItem({
                      item, id, path, intl, onUpdatePath, isCoordinator, isMember,
                    })}
                    onScrollToTop={this.scrollToTop}
                    searchQuery={searchQuery}
                    isPrintView={isPrintView}
                    headerInfo={headerOptions.info}
                    listActions={allListActions}
                    showEntitiesDelete={onEntitiesDelete}
                    allEntityCount={allEntities && allEntities.size}
                    hasHeader={includeHeader}
                    headerStyle={headerStyle}
                    listUpdating={progress !== null && progress >= 0 && progress < 100}
                    entities={entities}
                    errors={errors}
                    taxonomies={taxonomies}
                    connections={connections}
                    connectedTaxonomies={connectedTaxonomies}
                    entityIdsSelected={entityIdsSelectedFiltered}
                    skipPreviews={skipPreviews}
                    config={config}
                    entityTitle={entityTitle}

                    isMember={isMember}
                    isAdmin={isAdmin}
                    isVisitor={hasUserRole[USER_ROLES.VISITOR.value]}

                    onEntitySelect={(id, checked) => {
                      // reset when unchecking last selected item
                      if (!checked && !this.state.visibleEditOptions && entityIdsSelectedFiltered.size === 1) {
                        this.onResetEditOptions();
                      }
                      this.onHideDeleteConfirm();
                      onEntitySelect(id, checked);
                    }}
                    onEntitySelectAll={(ids) => {
                      // reset when unchecking last selected item
                      if (!this.state.visibleEditOptions && (!ids || ids.length === 0)) {
                        this.onResetEditOptions();
                      }
                      this.onHideDeleteConfirm();
                      onEntitySelectAll(ids);
                    }}
                    onEntityClick={(id, path, componentId) => onEntityClick(
                      {
                        id, path, componentId, errors: viewDomain.get('errors'),
                      }
                    )}
                    onDismissError={onDismissError}
                    typeId={typeId}
                    hasFilters={filters && filters.length > 0}
                    filters={filters}
                    showCode={showCode}
                    mapSubject={mapSubject}
                    onSetMapSubject={onSetMapSubject}
                    onSetIncludeActorMembers={onSetIncludeActorMembers}
                    onSetIncludeActorChildren={onSetIncludeActorChildren}
                    onSetIncludeInofficial={onSetIncludeInofficial}
                    onSetIncludeUnpublishedAPI={onSetIncludeUnpublishedAPI}
                    includeActorMembers={includeActorMembers}
                    includeActorChildren={includeActorChildren}
                    includeInofficial={includeInofficial}
                    includeUnpublishedAPI={includeUnpublishedAPI}
                    onClearFilters={this.onClearFilters}
                  />
                )}
              </Content>
              {showMap && (
                <EntitiesMap
                  viewOptions={viewOptions}
                  entities={entities}
                  actortypes={actortypes}
                  actiontypes={actiontypes}
                  config={config}
                  dataReady={dataReady}
                  onEntityClick={(id, path, componentId) => onEntityClick(
                    {
                      id, path, componentId, errors: viewDomain.get('errors'),
                    }
                  )}
                  typeId={typeId}
                  hasFilters={filters && filters.length > 0}
                  mapSubject={mapSubject}
                  onSetMapSubject={onSetMapSubject}
                  onSetIncludeActorMembers={onSetIncludeActorMembers}
                  onSetIncludeActorChildren={onSetIncludeActorChildren}
                  includeActorMembers={includeActorMembers}
                  includeActorChildren={includeActorChildren}
                  isPrintView={isPrintView}
                  filters={filters}
                  onClearFilters={this.onClearFilters}
                />
              )}
            </Container>
          )}
          {isMember && (progress !== null && progress < 100) && (
            <Progress>
              <ProgressText>
                <FormattedMessage
                  {...messages.processingUpdates}
                  values={{
                    processNo: Math.min(success.size + errors.size + 1, sending.size),
                    totalNo: sending.size,
                    types:
                      intl.formatMessage(messages[
                        `type_${progressTypes.size === 1 ? progressTypes.first() : 'save'}`
                      ]),
                  }}
                />
              </ProgressText>
              <Loading
                progress={progress}
              />
            </Progress>
          )}
          {isMember && (viewDomain.get('errors').size > 0 && progress >= 100) && (
            <Progress error>
              <Messages
                type="error"
                message={
                  intl.formatMessage(
                    messages.updatesFailed,
                    {
                      errorNo: viewDomain.get('errors').size,
                      types:
                        intl.formatMessage(messages[
                          `type_${progressTypes.size === 1 ? progressTypes.first() : 'save'}`
                        ]),
                    },
                  )
                }
                onDismiss={onResetProgress}
                preMessage={false}
              />
            </Progress>
          )}
          {isMember && (viewDomain.get('errors').size === 0 && progress >= 100) && (
            <Progress error>
              <Messages
                type="success"
                message={
                  intl.formatMessage(
                    this.getMessageForType(
                      progressTypes.size === 1 ? progressTypes.first() : 'save',
                      viewDomain.get('success').size,
                    ),
                    {
                      successNo: viewDomain.get('success').size,
                    },
                  )
                }
                onDismiss={onResetProgress}
                autoDismiss={2000}
              />
            </Progress>
          )}
        </ContainerWrapper>
        {dataReady && (showFilters || showEditOptions) && (
          <EntityListSidebar
            showFilters={showFilters}
            showEditOptions={showEditOptions}
            allEntities={allEntities}
            entitiesSelected={entitiesSelected}
            onUpdateQuery={onUpdateQuery}
            filteringOptions={filteringOptions}
            onUpdate={
              (associations, activeEditOption) => handleEditSubmit(
                associations,
                activeEditOption,
                entityIdsSelectedFiltered,
                viewDomain.get('errors'),
                connections,
              )}
            onUpdateFilters={onUpdateFilters}
            connections={connections}
            includeActorMembers={includeActorMembers}
            includeActorChildren={includeActorChildren}
            includeMembersWhenFiltering={includeMembersWhenFiltering}
            typeId={typeId}
            config={config}
            isAdmin={isAdmin}
            hasUserRole={hasUserRole}
            locationQuery={locationQuery}
            taxonomies={taxonomies}
            connectedTaxonomies={connectedTaxonomies}
            actortypes={actortypes}
            filterActortypes={filterActortypes}
            actiontypes={actiontypes}
            resourcetypes={resourcetypes}
            membertypes={membertypes}
            filterAssociationtypes={filterAssociationtypes}
            associationtypes={associationtypes}
            currentFilters={filters}
            onHideFilters={this.onHideFilters}
            onHideEditOptions={this.onHideEditOptions}
            onCreateOption={onCreateOption}
          />
        )}
      </>
    );
  }
}

EntityList.defaultProps = {
  includeHeader: true,
  canEdit: true,
  headerStyle: 'types',
};

EntityList.propTypes = {
  // wrapper props
  entities: PropTypes.instanceOf(List).isRequired,
  allEntities: PropTypes.instanceOf(List),
  taxonomies: PropTypes.instanceOf(Map),
  allTaxonomies: PropTypes.instanceOf(Map),
  actortypes: PropTypes.instanceOf(Map),
  filterActortypes: PropTypes.instanceOf(Map),
  resourcetypes: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  membertypes: PropTypes.instanceOf(Map),
  filterAssociationtypes: PropTypes.instanceOf(Map),
  associationtypes: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  connectedTaxonomies: PropTypes.instanceOf(Map),
  config: PropTypes.object,
  dataReady: PropTypes.bool,
  headerOptions: PropTypes.object,
  locationQuery: PropTypes.instanceOf(Map),
  entityTitle: PropTypes.object, // single/plural
  entityIcon: PropTypes.func,
  // selector props
  activePanel: PropTypes.string,
  hasUserRole: PropTypes.object, // { 1: isAdmin, 2: isMember, 3: isVisitor}
  entityIdsSelected: PropTypes.object,
  viewDomain: PropTypes.object,
  progress: PropTypes.number,
  typeId: PropTypes.string,
  progressTypes: PropTypes.instanceOf(List),
  // dispatch props
  handleEditSubmit: PropTypes.func.isRequired,
  onEntitySelect: PropTypes.func.isRequired,
  onEntitySelectAll: PropTypes.func.isRequired,
  onTagClick: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired,
  onEntityClick: PropTypes.func.isRequired,
  onResetProgress: PropTypes.func.isRequired,
  updateClientPath: PropTypes.func.isRequired,
  onCreateOption: PropTypes.func.isRequired,
  onDismissError: PropTypes.func.isRequired,
  onDismissAllErrors: PropTypes.func.isRequired,
  onUpdateQuery: PropTypes.func.isRequired,
  // reducePreviewItem: PropTypes.func,
  canEdit: PropTypes.bool,
  includeHeader: PropTypes.bool,
  headerStyle: PropTypes.string,
  showCode: PropTypes.bool,
  includeMembersWhenFiltering: PropTypes.bool,
  listActions: PropTypes.array,
  onSetView: PropTypes.func,
  // onSetFilterMemberOption: PropTypes.func,
  view: PropTypes.string,
  mapSubject: PropTypes.string,
  searchQuery: PropTypes.string,
  onSetMapSubject: PropTypes.func,
  onSetIncludeActorMembers: PropTypes.func,
  onSetIncludeActorChildren: PropTypes.func,
  onSetIncludeInofficial: PropTypes.func,
  onSetIncludeUnpublishedAPI: PropTypes.func,
  includeActorMembers: PropTypes.bool,
  includeActorChildren: PropTypes.bool,
  includeInofficial: PropTypes.bool,
  includeUnpublishedAPI: PropTypes.bool,
  onEntitiesDelete: PropTypes.func,
  onUpdateFilters: PropTypes.func,
  onUpdatePath: PropTypes.func,
  isPrintView: PropTypes.bool,
  currentUserId: PropTypes.string,
  filteringOptions: PropTypes.array,
  secondaryNavItems: PropTypes.array,
  skipPreviews: PropTypes.bool,
};

EntityList.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  hasUserRole: selectHasUserRole(state),
  activePanel: selectActivePanel(state),
  entityIdsSelected: selectSelectedEntities(state),
  viewDomain: selectDomain(state),
  progress: selectProgress(state),
  progressTypes: selectProgressTypes(state),
  currentPath: selectCurrentPathname(state),
  allTaxonomies: selectAllTaxonomiesWithCategories(state),
  view: selectViewQuery(state),
  mapSubject: selectMapSubjectQuery(state),
  includeActorMembers: selectIncludeActorMembers(state),
  includeActorChildren: selectIncludeActorChildren(state),
  includeInofficial: selectIncludeInofficialStatements(state),
  includeUnpublishedAPI: selectIncludeUnpublishedAPIStatements(state),
  connectedTaxonomies: selectTaxonomiesWithCategories(state),
  isPrintView: selectIsPrintView(state),
  searchQuery: selectSearchQuery(state),
  currentUserId: selectSessionUserId(state),
});

function mapDispatchToProps(dispatch, props) {
  return {
    onDismissError: (key) => {
      dispatch(resetProgress());
      dispatch(dismissError(key));
    },
    onDismissAllErrors: () => {
      dispatch(resetProgress());
      dispatch(dismissAllErrors());
    },
    onResetProgress: () => {
      dispatch(resetProgress());
    },
    updateClientPath: () => {
      dispatch(setClientPath(props.config.clientPath));
    },
    onEntitySelect: (id, checked) => {
      dispatch(selectEntity({ id, checked }));
    },
    onEntityClick: ({
      id, path, componentId, errors,
    }) => {
      if (errors && errors.size) {
        dispatch(resetProgress());
        errors.forEach((error, key) => {
          if (error.data.saveRef === id) {
            dispatch(dismissError(key));
          }
        });
      }
      if (props.skipPreviews || !componentId) {
        dispatch(updatePath(`${path || props.config.clientPath}/${id}`));
      } else {
        dispatch(setListPreview(`${componentId}|${path}|${id}`));
      }
    },
    onEntitySelectAll: (ids) => {
      dispatch(selectMultipleEntities(ids));
    },
    onTagClick: (value) => {
      dispatch(updateQuery(fromJS([value])));
    },
    onResetFilters: (values) => {
      dispatch(resetFilters(values));
    },
    onCreateOption: (args) => {
      dispatch(openNewEntityModal(args));
    },
    onUpdateQuery: (args) => {
      dispatch(updateRouteQuery(args));
    },
    onUpdatePath: (path) => dispatch(updatePath(path)),
    onUpdateFilters: (values) => {
      dispatch(setFilters(values));
    },
    onSetView: (view) => {
      dispatch(setView(view));
    },
    onSetMapSubject: (subject) => {
      dispatch(setMapSubject(subject));
    },
    onSetIncludeActorMembers: (active) => {
      dispatch(setIncludeActorMembers(active));
    },
    onSetIncludeActorChildren: (active) => {
      dispatch(setIncludeActorChildren(active));
    },
    onSetIncludeInofficial: (active) => {
      dispatch(setIncludeInofficialStatements(active));
    },
    onSetIncludeUnpublishedAPI: (active) => {
      dispatch(setIncludeUnpublishedAPIStatements(active));
    },
    onEntitiesDelete: (path, entityIdsSelected) => {
      dispatch(deleteMultipleEntities({
        data: entityIdsSelected.toJS().map(
          (id) => ({
            id,
            path,
            saveRef: id,
          })
        ),
      }));
    },
    handleEditSubmit: (formData, activeEditOption, entityIdsSelected, errors, connections) => {
      dispatch(resetProgress());

      const entities = props.entities.filter(
        (entity) => entityIdsSelected.includes(entity.get('id'))
      );
      // figure out changes
      const changes = formData.get('values').filter((option) => option.get('hasChanged'));
      // figure out updates (either new attribute values or new connections)
      const creates = changes
        .filter((option) => option.get('checked') === true)
        .map((option) => option.get('value'));

      // attributes
      if (activeEditOption.group === 'attributes') {
        if (creates.size > 0) {
          // take the first
          // TODO multiselect should be run in single value mode and only return 1 value
          const newValue = creates.first();
          entities.forEach((entity) => {
            // not exactly sure what is happening here?
            if (errors && errors.size) {
              errors.forEach((error, key) => {
                if (error.data.saveRef === entity.get('id')) {
                  dispatch(dismissError(key));
                }
              });
            }
          });
          dispatch(saveMultipleEntities(
            props.config.serverPath,
            entities.filter(
              (entity) => entity.getIn(['attributes', activeEditOption.optionId]) !== newValue
            ).map(
              (entity) => Map()
                .set('path', props.config.serverPath)
                .set('entity', entity.setIn(['attributes', activeEditOption.optionId], newValue))
                .set('saveRef', entity.get('id'))
            ).toJS()
          ));
        }
        // connections
      } else {
        // figure out connection deletions (not necessary for attributes as deletions will be overridden)
        const deletes = changes
          .filter((option) => option.get('checked') === false)
          .map((option) => option.get('value'));

        entities.forEach(
          (entity) => {
            if (errors && errors.size) {
              errors.forEach((error, key) => {
                if (error.data.saveRef === entity.get('id')) {
                  dispatch(dismissError(key));
                }
              });
            }
          }
        );
        const updates = entities.reduce(
          (memo, entity) => {
            let entityCreates = List();
            let entityDeletes = List();
            let existingAssignments;
            switch (activeEditOption.group) {
              case ('taxonomies'):
                existingAssignments = entity.get('categories');
                break;
              case ('actions'):
              case ('actors'):
              case ('members'):
              case ('associations'):
              case ('resources'):
              case ('indicators'):
              case ('roles'):
              case ('children'):
              case ('users'):
              case ('parents'):
                existingAssignments = entity.get(activeEditOption.connection);
                break;
              default:
                existingAssignments = List();
                break;
            }

            if (activeEditOption.group === 'roles') {
              const roles = connections.get('roles');
              // "creates" includes single new "highest" role
              // existingAssignments includes previous highest role
              // if new highest role higher (that is actually lower)
              //    --> create all roles higher than old role up to the new highest role
              const prevHighestRoleId = existingAssignments
                ? existingAssignments.toList().first()
                : USER_ROLES.DEFAULT.value;
              // console.log('existingAssignments', existingAssignments && existingAssignments.toJS())
              // console.log('prevHighestRoleId', prevHighestRoleId)
              const newHighestRoleId = creates.size > 0 ? creates.first() : USER_ROLES.DEFAULT.value;
              // console.log('newHighestRoleId', newHighestRoleId)
              const prevRoleIds = prevHighestRoleId
                ? roles.filter(
                  (role) => {
                    const theRole = Object.values(USER_ROLES).find((r) => qe(r.value, parseInt(role.get('id'), 10)));
                    const prevHighestRole = Object.values(USER_ROLES).find((r) => qe(r.value, parseInt(prevHighestRoleId, 10)));
                    return prevHighestRole.order <= theRole.order;
                  }
                ).map(
                  (role) => parseInt(role.get('id'), 10)
                ).toList()
                : List();
              // console.log('prevRoleIds', prevRoleIds && prevRoleIds.toJS())
              const createRoleIds = newHighestRoleId === USER_ROLES.DEFAULT.value
                ? List()
                : roles.filter(
                  (role) => {
                    const theRole = Object.values(USER_ROLES).find((r) => qe(r.value, parseInt(role.get('id'), 10)));
                    const newHighestRole = Object.values(USER_ROLES).find((r) => qe(r.value, parseInt(newHighestRoleId, 10)));
                    return newHighestRole && newHighestRole.order <= theRole.order && !prevRoleIds.includes(theRole.value);
                  }
                ).map((role) => parseInt(role.get('id'), 10)).toList();
              const deleteRoleIds = roles.filter(
                (role) => {
                  const theRole = Object.values(USER_ROLES).find((r) => qe(r.value, parseInt(role.get('id'), 10)));
                  const newHighestRole = Object.values(USER_ROLES).find((r) => qe(r.value, parseInt(newHighestRoleId, 10)));
                  return !newHighestRole || (newHighestRole.order > theRole.order && prevRoleIds.includes(theRole.value));
                }
              ).map((role) => parseInt(role.get('id'), 10)).toList();
              // console.log('createRoleIds', createRoleIds.toJS())
              // console.log('deleteRoleIds', deleteRoleIds.toJS())
              // console.log('entity.allRoles', entity.get('allRoles').toJS())
              if (createRoleIds.size > 0) {
                entityCreates = createRoleIds.map((id) => fromJS({
                  path: activeEditOption.path,
                  entity: {
                    attributes: {
                      [activeEditOption.ownKey]: entity.get('id'),
                      [activeEditOption.key]: id.toString(),
                    },
                  },
                  saveRef: entity.get('id'),
                }));
              }
              if (deleteRoleIds.size > 0) {
                // console.log(deleteConnections.toJS())
                entityDeletes = entity.get('allRoles').filter(
                  (roleId) => deleteRoleIds.includes(roleId)
                ).map(
                  (assigned, id) => fromJS({
                    path: activeEditOption.path,
                    id,
                    saveRef: entity.get('id'),
                  })
                ).toList();
              }
            } else {
              // create connections
              if (creates.size > 0) {
                // exclude existing relations from the changeSet
                entityCreates = !!existingAssignments && existingAssignments.size > 0
                  ? creates.filter(
                    (id) => !existingAssignments.includes(parseInt(id, 10))
                  )
                  : creates;
                entityCreates = entityCreates.map(
                  (id) => fromJS({
                    path: activeEditOption.path,
                    entity: {
                      attributes: {
                        [activeEditOption.ownKey]: entity.get('id'),
                        [activeEditOption.key]: id,
                      },
                    },
                    saveRef: entity.get('id'),
                  })
                );
              }
              // delete connections
              if (
                deletes.size > 0
                && !!existingAssignments
                && existingAssignments.size > 0
              ) {
                entityDeletes = existingAssignments.filter(
                  (assigned) => deletes.includes(assigned.toString())
                ).map(
                  (assigned, id) => fromJS({
                    path: activeEditOption.path,
                    id,
                    saveRef: entity.get('id'),
                  })
                ).toList();
              }
            }
            return memo
              .set('creates', memo.get('creates').concat(entityCreates))
              .set('deletes', memo.get('deletes').concat(entityDeletes));
          },
          Map().set('creates', List()).set('deletes', List()),
        ); // reduce entities

        // associations
        if (updates.get('creates') && updates.get('creates').size > 0) {
          dispatch(newMultipleEntities(
            activeEditOption.path,
            updates.get('creates').toJS(),
            activeEditOption.invalidateEntitiesPaths
            && activeEditOption.invalidateEntitiesPaths.toJS(),
          ));
        }
        if (updates.get('deletes') && updates.get('deletes').size > 0) {
          dispatch(deleteMultipleEntities({
            path: activeEditOption.path,
            data: updates.get('deletes').toJS(),
            invalidateEntitiesPaths: activeEditOption.invalidateEntitiesPaths
              && activeEditOption.invalidateEntitiesPaths.toJS(),
          }));
        }
      }
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EntityList);
