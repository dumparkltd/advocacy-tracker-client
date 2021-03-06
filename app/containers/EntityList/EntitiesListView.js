/*
 *
 * EntitiesListView
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import { Box, Text } from 'grommet';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';

import {
  ROUTES,
  ACTORTYPES,
  ACTIONTYPE_ACTORTYPES,
  ACTIONTYPE_TARGETTYPES,
  ACTIONTYPES_CONFIG,
  ACTORTYPES_CONFIG,
  MEMBERSHIPS,
  // ACTIONTYPES,
} from 'themes/config';
import { CONTENT_LIST } from 'containers/App/constants';
import { jumpToComponent } from 'utils/scroll-to-component';
import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import Container from 'components/styled/Container';
import Content from 'components/styled/Content';
import Loading from 'components/Loading';
import EntityListViewOptions from 'components/EntityListViewOptions';
import MapSubjectOptions from 'containers/MapContainer/MapInfoOptions/MapSubjectOptions';
import MapMemberOption from 'containers/MapContainer/MapInfoOptions/MapMemberOption';
import EntityListTable from 'containers/EntityListTable';
import ButtonPill from 'components/buttons/ButtonPill';

import ContentHeader from 'components/ContentHeader';
import qe from 'utils/quasi-equals';
import appMessages from 'containers/App/messages';

import { getActorsForEntities, getUsersForEntities } from './utils';

const getActivityColumns = (mapSubject, typeId) => {
  let actionTypeIds;
  if (mapSubject === 'actors') {
    actionTypeIds = Object.keys(ACTIONTYPE_ACTORTYPES).filter(
      (actionTypeId) => {
        const actiontypeActortypeId = ACTIONTYPE_ACTORTYPES[actionTypeId];
        return actiontypeActortypeId.indexOf(typeId.toString()) > -1;
      }
    ).sort(
      (a, b) => {
        const orderA = ACTIONTYPES_CONFIG[parseInt(a, 10)].order;
        const orderB = ACTIONTYPES_CONFIG[parseInt(b, 10)].order;
        return orderA > orderB ? 1 : -1;
      }
    );
  } else {
    actionTypeIds = Object.keys(ACTIONTYPE_TARGETTYPES).filter(
      (actionTypeId) => {
        const actiontypeActortypeId = ACTIONTYPE_TARGETTYPES[actionTypeId];
        return actiontypeActortypeId.indexOf(typeId.toString()) > -1;
      }
    ).sort(
      (a, b) => {
        const orderA = ACTIONTYPES_CONFIG[parseInt(a, 10)].order;
        const orderB = ACTIONTYPES_CONFIG[parseInt(b, 10)].order;
        return orderA > orderB ? 1 : -1;
      }
    );
  }

  return actionTypeIds.map(
    (id) => ({
      id: `action_${id}`,
      type: 'actiontype',
      subject: mapSubject,
      actiontype_id: id,
      actions: mapSubject === 'actors'
        ? 'actionsByType'
        : 'targetingActionsByType',
      actionsMembers: mapSubject === 'actors'
        ? 'actionsAsMembersByType'
        : 'targetingActionsAsMemberByType',
    })
  );
};
class EntitiesListView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.ScrollContainer = React.createRef();
    this.ScrollTarget = React.createRef();
    this.ScrollReference = React.createRef();
    this.state = {
      viewType: ACTORTYPES.COUNTRY,
    };
  }

  scrollToTop = () => {
    jumpToComponent(
      this.ScrollTarget.current,
      this.ScrollReference.current,
      this.ScrollContainer.current
    );
  }

  setType = (type) => {
    this.setState({ viewType: type });
  }

  render() {
    const {
      config,
      entityTitle,
      dataReady,
      isManager,
      isAnalyst,
      taxonomies,
      connections,
      connectedTaxonomies,
      entities,
      errors,
      actortypes,
      headerStyle,
      viewOptions,
      hasFilters,
      showCode,
      entityIdsSelected,
      listUpdating,
      onEntityClick,
      onEntitySelect,
      onEntitySelectAll,
      onDismissError,
      typeId,
      mapSubject,
      onSetMapSubject,
      onSetIncludeActorMembers,
      onSetIncludeTargetMembers,
      includeActorMembers,
      includeTargetMembers,
      actiontypes,
      intl,
      resourcetypes,
      allEntityCount,
      headerOptions,
    } = this.props;
    const { viewType } = this.state;
    let type;
    let hasByTarget;
    let hasByActor;
    let isTarget;
    let isActive;
    let subjectOptions = [];
    let memberOption;
    let entityActors;
    let entityUsers;
    let columns;
    let headerColumnsUtility;
    let mapSubjectClean = mapSubject;
    let userEntityColumnTitle;

    // ACTIONS =================================================================

    if (config.types === 'actiontypes' && dataReady) {
      columns = ACTIONTYPES_CONFIG[typeId] && ACTIONTYPES_CONFIG[typeId].columns;
      type = actiontypes.find((at) => qe(at.get('id'), typeId));
      // hasByTarget = type.getIn(['attributes', 'has_target']);
      hasByActor = ACTIONTYPE_ACTORTYPES[typeId] && ACTIONTYPE_ACTORTYPES[typeId].length > 0;
      hasByTarget = ACTIONTYPE_TARGETTYPES[typeId] && ACTIONTYPE_TARGETTYPES[typeId].length > 0;
      // console.log(typeId, type.get('id'), ACTIONTYPE_ACTORTYPES, ACTIONTYPE_ACTORTYPES[typeId], hasByActor, hasByTarget)
      if (!hasByTarget && mapSubject === 'targets') {
        mapSubjectClean = null;
      }
      if (!hasByActor && mapSubject === 'actors') {
        mapSubjectClean = null;
      }
      subjectOptions = [
        {
          type: 'secondary',
          title: 'Activities',
          onClick: () => onSetMapSubject(),
          active: !mapSubjectClean,
          disabled: !mapSubjectClean,
        },
      ];
      if (hasByActor) {
        subjectOptions = [
          ...subjectOptions,
          {
            type: 'secondary',
            title: 'By actor',
            onClick: () => onSetMapSubject('actors'),
            active: mapSubjectClean === 'actors',
            disabled: mapSubjectClean === 'actors',
          },
        ];
      }
      if (hasByTarget) {
        subjectOptions = [
          ...subjectOptions,
          {
            type: 'secondary',
            title: 'By target',
            onClick: () => onSetMapSubject('targets'),
            active: mapSubjectClean === 'targets',
            disabled: mapSubjectClean === 'targets',
          },
        ];
      }
      subjectOptions = [
        ...subjectOptions,
        {
          type: 'secondary',
          title: 'By user',
          onClick: () => onSetMapSubject('users'),
          active: mapSubjectClean === 'users',
          disabled: mapSubjectClean === 'users',
        },
      ];
      if (mapSubjectClean === 'targets' && qe(viewType, ACTORTYPES.COUNTRY)) {
        memberOption = {
          active: includeTargetMembers,
          onClick: () => onSetIncludeTargetMembers(includeTargetMembers ? '0' : '1'),
          label: 'Include activities targeting regions and groups (countries belong to)',
        };
      } else if (mapSubjectClean === 'actors' && qe(viewType, ACTORTYPES.COUNTRY)) {
        memberOption = {
          active: includeActorMembers,
          onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
          label: 'Include activities of groups (countries belong to)',
        };
      }
      if (mapSubjectClean === 'actors' || mapSubjectClean === 'targets') {
        entityActors = getActorsForEntities(
          entities,
          connections && connections.get('actors'),
          mapSubjectClean,
          mapSubjectClean === 'actors' ? includeActorMembers : includeTargetMembers,
        );
        entityActors = entityActors && entityActors.groupBy(
          (actor) => actor.getIn(['attributes', 'actortype_id'])
        );
      } else if (mapSubjectClean === 'users') {
        entityUsers = getUsersForEntities(
          entities,
          connections && connections.get('users'),
          'actions',
        );
        userEntityColumnTitle = intl.formatMessage(appMessages.entities[`actions_${typeId}`].plural);
      }

      // ACTORS ================================================================
      //
    } else if (config.types === 'actortypes' && dataReady) {
      type = actortypes.find((at) => qe(at.get('id'), typeId));
      isTarget = type.getIn(['attributes', 'is_target']);
      isActive = type.getIn(['attributes', 'is_active']);
      if (isTarget && isActive) {
        mapSubjectClean = mapSubject || 'actors';
      } else if (isTarget && !isActive) {
        mapSubjectClean = 'targets';
      } else if (!isTarget && isActive) {
        mapSubjectClean = 'actors';
      }
      subjectOptions = [];
      const actionColumns = getActivityColumns(
        mapSubjectClean,
        typeId,
        includeActorMembers,
        includeTargetMembers,
      );
      const typeColumns = ACTORTYPES_CONFIG[typeId].columns || [];
      columns = [
        {
          id: 'main',
          type: 'main',
          sort: 'title',
          attributes: ['code', 'title'],
        },
        ...typeColumns,
        ...actionColumns,
      ];
      headerColumnsUtility = [
        {
          type: 'main',
          content: '',
        },
        ...typeColumns.map(() => ({ type: 'spacer', content: '' })),
        {
          type: 'options',
          span: actionColumns.length,
        },
      ];
      if (isActive) {
        subjectOptions = [
          ...subjectOptions,
          {
            type: 'secondary',
            title: 'As actors',
            onClick: () => onSetMapSubject('actors'),
            active: mapSubjectClean === 'actors',
            disabled: mapSubjectClean === 'actors',
          },
        ];
      }
      if (isTarget) {
        subjectOptions = [
          ...subjectOptions,
          {
            type: 'secondary',
            title: 'As targets',
            onClick: () => onSetMapSubject('targets'),
            active: mapSubjectClean === 'targets',
            disabled: mapSubjectClean === 'targets',
          },
        ];
      }
      const canBeMember = Object.keys(MEMBERSHIPS).indexOf(typeId) > -1
        && MEMBERSHIPS[typeId].length > 0;
      if (mapSubjectClean === 'targets' && canBeMember) {
        memberOption = {
          active: includeTargetMembers,
          onClick: () => onSetIncludeTargetMembers(includeTargetMembers ? '0' : '1'),
          label: 'Include activities targeting associated actors',
        };
      } else if (mapSubjectClean === 'actors' && canBeMember) {
        memberOption = {
          active: includeActorMembers,
          onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
          label: 'Include activities of associated actors',
        };
      }
      // RESOURCES ================================================================
      //
    } else if (config.types === 'resourcetypes' && dataReady) {
      type = resourcetypes.find((at) => qe(at.get('id'), typeId));
      columns = [
        {
          id: 'main',
          type: 'main',
          sort: 'title',
          attributes: ['title'],
        },
        {
          id: 'resourceActions',
          type: 'resourceActions',
        },
      ];
    } else if (config.types === 'indicators' && dataReady) {
      columns = [
        {
          id: 'main',
          type: 'main',
          sort: 'name',
          attributes: ['title'],
        },
        {
          id: 'actions', // one row per type,
          type: 'indicatorActions', // one row per type,
        },
      ];
    } else if (config.types === 'users' && dataReady) {
      columns = [
        {
          id: 'main',
          type: 'main',
          sort: 'name',
          attributes: ['name'],
        },
        {
          id: 'userrole',
          type: 'userrole',
        },
        {
          id: 'userActions',
          type: 'userActions',
        },
        {
          id: 'userActors',
          type: 'userActors',
        },
      ];
    } else if (config.types === 'pages' && dataReady) {
      columns = [
        {
          id: 'main',
          type: 'main',
          sort: 'name',
          attributes: ['title', 'menu_title'],
        },
      ];
    }
    let headerTitle;
    let headerSubTitle;
    if (entityTitle) {
      headerTitle = entities
        ? `${entities.size} ${entities.size === 1 ? entityTitle.single : entityTitle.plural}`
        : entityTitle.plural;
    }
    if (hasFilters) {
      headerSubTitle = `of ${allEntityCount} total`;
    }

    return (
      <ContainerWrapper headerStyle={headerStyle} ref={this.ScrollContainer}>
        {dataReady && viewOptions && viewOptions.length > 1 && (
          <EntityListViewOptions options={viewOptions} />
        )}
        <Container ref={this.ScrollReference}>
          <Content>
            {!dataReady && <Loading />}
            {dataReady && (
              <div>
                <ContentHeader
                  type={CONTENT_LIST}
                  title={headerTitle}
                  subTitle={headerSubTitle}
                  hasViewOptions={viewOptions && viewOptions.length > 1}
                  info={headerOptions && headerOptions.info}
                />
                {config.types === 'actiontypes' && (
                  <Box>
                    {subjectOptions && (
                      <MapSubjectOptions options={subjectOptions} />
                    )}
                  </Box>
                )}
                {entityActors && (
                  <Box>
                    <Box direction="row" gap="xsmall" margin={{ vertical: 'small' }} wrap>
                      {mapSubject === 'actors'
                        && ACTIONTYPE_ACTORTYPES[typeId]
                        && ACTIONTYPE_ACTORTYPES[typeId].length > 1
                        && ACTIONTYPE_ACTORTYPES[typeId].filter(
                          (actortypeId) => entityActors.get(parseInt(actortypeId, 10))
                        ).map(
                          (actortypeId) => (
                            <ButtonPill
                              key={actortypeId}
                              onClick={() => this.setType(actortypeId)}
                              active={qe(viewType, actortypeId)}
                            >
                              <Text size="small">
                                <FormattedMessage {...appMessages.entities[`actors_${actortypeId}`].pluralShort} />
                              </Text>
                            </ButtonPill>
                          )
                        )}
                      {mapSubject === 'targets'
                        && ACTIONTYPE_TARGETTYPES[typeId]
                        && ACTIONTYPE_TARGETTYPES[typeId].length > 1
                        && ACTIONTYPE_TARGETTYPES[typeId].filter(
                          (actortypeId) => entityActors.get(parseInt(actortypeId, 10))
                        ).map(
                          (actortypeId) => (
                            <ButtonPill
                              key={actortypeId}
                              onClick={() => this.setType(actortypeId)}
                              active={qe(viewType, actortypeId)}
                            >
                              <Text size="small">
                                <FormattedMessage {...appMessages.entities[`actors_${actortypeId}`].pluralShort} />
                              </Text>
                            </ButtonPill>
                          )
                        )}
                    </Box>
                    {memberOption && (
                      <Box>
                        <MapMemberOption option={memberOption} />
                      </Box>
                    )}
                    {entityActors.get(parseInt(viewType, 10)) && (
                      <EntityListTable
                        paginate
                        hasSearch
                        columns={[
                          {
                            id: 'main',
                            type: 'main',
                            sort: 'title',
                            attributes: ['code', 'title'],
                          },
                          {
                            id: 'actorActions',
                            type: 'actorActions',
                            subject: mapSubject,
                            actions: mapSubject === 'actors'
                              ? 'actions'
                              : 'targetingActions',
                          },
                          {
                            id: 'actorActionsAsMember',
                            type: 'actorActions',
                            members: true,
                            subject: mapSubject,
                            actions: mapSubject === 'actors'
                              ? 'actionsMembers'
                              : 'targetingActionsAsMember',
                            skip: !(memberOption
                              && (
                                (mapSubject === 'actors' && includeActorMembers)
                                || (mapSubject === 'targets' && includeTargetMembers)
                              )),
                          },
                        ]}
                        entities={entityActors.get(parseInt(viewType, 10))}
                        entityPath={ROUTES.ACTOR}
                        onEntityClick={onEntityClick}
                        entityTitle={{
                          single: intl.formatMessage(appMessages.entities[`actors_${viewType}`].single),
                          plural: intl.formatMessage(appMessages.entities[`actors_${viewType}`].plural),
                        }}
                        onResetScroll={this.scrollToTop}
                        config={{
                          types: 'actortypes',
                          clientPath: ROUTES.ACTOR,
                          views: {
                            list: {
                              search: ['code', 'title', 'description'],
                            },
                          },
                        }}
                        connections={connections}
                      />
                    )}
                  </Box>
                )}
                {entityUsers && (
                  <Box>
                    <EntityListTable
                      paginate
                      hasSearch
                      columns={[
                        {
                          id: 'main',
                          type: 'main',
                          sort: 'title',
                          attributes: ['name'],
                        },
                        {
                          id: 'userActions',
                          type: 'userActions',
                          actiontype_id: viewType,
                          title: userEntityColumnTitle,
                        },
                      ]}
                      entities={entityUsers}
                      entityPath={ROUTES.USER}
                      onEntityClick={onEntityClick}
                      entityTitle={{
                        single: intl.formatMessage(appMessages.entities.users.single),
                        plural: intl.formatMessage(appMessages.entities.users.plural),
                      }}
                      onResetScroll={this.scrollToTop}
                      config={{
                        clientPath: ROUTES.USER,
                        views: {
                          list: {
                            search: ['name', 'description'],
                          },
                        },
                      }}
                      connections={connections}
                    />
                  </Box>
                )}
                {!entityActors && !entityUsers && (
                  <EntityListTable
                    paginate
                    hasSearch
                    columns={columns}
                    headerColumnsUtility={headerColumnsUtility}
                    memberOption={memberOption && <MapMemberOption option={memberOption} />}
                    subjectOptions={subjectOptions && <MapSubjectOptions inList options={subjectOptions} />}
                    listUpdating={listUpdating}
                    entities={entities}
                    errors={errors}
                    taxonomies={taxonomies}
                    actortypes={actortypes}
                    connections={connections}
                    connectedTaxonomies={connectedTaxonomies}
                    entityIdsSelected={entityIdsSelected}
                    config={config}
                    entityTitle={entityTitle}

                    dataReady={dataReady}
                    canEdit={isManager}
                    isAnalyst={isAnalyst}

                    onEntitySelect={onEntitySelect}
                    onEntitySelectAll={onEntitySelectAll}
                    onResetScroll={this.scrollToTop}
                    onEntityClick={onEntityClick}
                    onDismissError={onDismissError}
                    typeId={typeId}
                    showCode={showCode}
                    includeMembers={mapSubjectClean === 'actors'
                      ? includeActorMembers
                      : includeTargetMembers
                    }
                  />
                )}
              </div>
            )}
          </Content>
        </Container>
      </ContainerWrapper>
    );
  }
}

EntitiesListView.propTypes = {
  entities: PropTypes.instanceOf(List),
  taxonomies: PropTypes.instanceOf(Map),
  actortypes: PropTypes.instanceOf(Map),
  resourcetypes: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  targettypes: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  connectedTaxonomies: PropTypes.instanceOf(Map),
  entityIdsSelected: PropTypes.instanceOf(List),
  errors: PropTypes.instanceOf(Map),
  // object/arrays
  config: PropTypes.object,
  viewOptions: PropTypes.array,
  entityTitle: PropTypes.object, // single/plural
  headerOptions: PropTypes.object, // single/plural
  intl: intlShape.isRequired,
  // primitive
  dataReady: PropTypes.bool,
  isManager: PropTypes.bool,
  isAnalyst: PropTypes.bool,
  includeActorMembers: PropTypes.bool,
  includeTargetMembers: PropTypes.bool,
  listUpdating: PropTypes.bool,
  headerStyle: PropTypes.string,
  hasFilters: PropTypes.bool,
  typeId: PropTypes.string,
  showCode: PropTypes.bool,
  mapSubject: PropTypes.string,
  allEntityCount: PropTypes.number,
  // functions
  onEntityClick: PropTypes.func.isRequired,
  onEntitySelect: PropTypes.func.isRequired,
  onEntitySelectAll: PropTypes.func.isRequired,
  onDismissError: PropTypes.func.isRequired,
  onSetMapSubject: PropTypes.func,
  onSetIncludeActorMembers: PropTypes.func,
  onSetIncludeTargetMembers: PropTypes.func,
};

export default injectIntl(EntitiesListView);
// export default EntitiesListView;
