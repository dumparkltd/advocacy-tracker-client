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
  USER_ACTIONTYPES,
  MEMBERSHIPS,
  ACTION_INDICATOR_SUPPORTLEVELS,
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
import MapOption from 'containers/MapContainer/MapInfoOptions/MapOption';
import EntityListTable from 'containers/EntityListTable';
import ButtonPill from 'components/buttons/ButtonPill';

import ContentHeader from 'components/ContentHeader';
import qe from 'utils/quasi-equals';
import { lowerCase } from 'utils/string';
import { getActiontypeColumns, getActortypeColumns } from 'utils/entities';
import appMessages from 'containers/App/messages';

import { getActorsForEntities, getUsersForEntities } from './utils';

const getOwnActivityColumns = (mapSubject, typeId) => {
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
        ? 'actionsAsMemberByType'
        : 'targetingActionsAsMemberByType',
      actionsChildren: mapSubject === 'actors'
        ? 'actionsAsParentByType'
        : 'targetingActionsAsParentByType',
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
      isMember,
      isVisitor,
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
      onSetIncludeActorChildren,
      onSetIncludeTargetChildren,
      includeActorChildren,
      includeTargetChildren,
      includeInofficial,
      onSetIncludeInofficial,
      actiontypes,
      intl,
      resourcetypes,
      allEntityCount,
      headerInfo,
      listActions,
    } = this.props;
    const { viewType } = this.state;
    let type;
    let hasByTarget;
    let hasByActor;
    let hasByUser;
    let isTarget;
    let isActive;
    let subjectOptions = [];
    let memberOption;
    let childOption;
    let checkboxOptions;
    let entityActors;
    let entityUsers;
    let columns;
    let headerColumnsUtility;
    let mapSubjectClean = mapSubject;
    let userEntityColumnTitle;
    let relatedActortypes;
    let relatedTargettypes;
    let viewTypeClean = viewType;

    // ACTIONS =================================================================
    if (config.types === 'actiontypes' && dataReady) {
      columns = getActiontypeColumns({
        typeId,
        showCode,
        isSingle: false,
      });
      type = actiontypes.find((at) => qe(at.get('id'), typeId));
      // hasByTarget = type.getIn(['attributes', 'has_target']);
      hasByActor = ACTIONTYPE_ACTORTYPES[typeId] && ACTIONTYPE_ACTORTYPES[typeId].length > 0;
      hasByTarget = ACTIONTYPE_TARGETTYPES[typeId] && ACTIONTYPE_TARGETTYPES[typeId].length > 0;
      hasByUser = USER_ACTIONTYPES && USER_ACTIONTYPES.indexOf(typeId) > -1;
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
      if (hasByUser) {
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
      }
      if (mapSubjectClean === 'actors' || mapSubjectClean === 'targets') {
        if (mapSubjectClean === 'actors') {
          relatedActortypes = ACTIONTYPE_ACTORTYPES[typeId]
            && ACTIONTYPE_ACTORTYPES[typeId].length > 1
            && ACTIONTYPE_ACTORTYPES[typeId];
          viewTypeClean = (viewTypeClean && relatedActortypes.indexOf(viewTypeClean) > -1)
            ? viewTypeClean
            : relatedActortypes[0];
        } else {
          relatedTargettypes = ACTIONTYPE_TARGETTYPES[typeId]
            && ACTIONTYPE_TARGETTYPES[typeId].length > 1
            && ACTIONTYPE_TARGETTYPES[typeId];
          viewTypeClean = (viewTypeClean && relatedTargettypes.indexOf(viewTypeClean) > -1)
            ? viewTypeClean
            : relatedTargettypes[0];
        }
        const canBeMember = Object.keys(MEMBERSHIPS).indexOf(viewTypeClean) > -1
          && MEMBERSHIPS[viewTypeClean].length > 0;
        const canHaveMembers = !canBeMember && Object.keys(MEMBERSHIPS).some(
          (id) => MEMBERSHIPS[id].indexOf(viewTypeClean) > -1
        );
        entityActors = getActorsForEntities({
          actions: entities,
          actors: connections && connections.get('actors'),
          subject: mapSubjectClean,
          includeIndirect: canBeMember && (mapSubjectClean === 'actors' ? includeActorMembers : includeTargetMembers),
          includeChildren: canHaveMembers && (mapSubjectClean === 'actors' ? includeActorChildren : includeTargetChildren),
        });
        entityActors = entityActors && entityActors.groupBy(
          (actor) => actor.getIn(['attributes', 'actortype_id'])
        );
        const typeLabel = lowerCase(intl.formatMessage(appMessages.actortypes[viewTypeClean]));
        if (mapSubjectClean === 'targets') {
          if (canBeMember) {
            if (qe(viewTypeClean, ACTORTYPES.COUNTRY)) {
              memberOption = {
                active: includeTargetMembers,
                onClick: () => onSetIncludeTargetMembers(includeTargetMembers ? '0' : '1'),
                label: `Show activities targeting regions & groups (${typeLabel} are member of)`,
              };
            } else if (qe(viewTypeClean, ACTORTYPES.ORG)) {
              memberOption = {
                active: includeTargetMembers,
                onClick: () => onSetIncludeTargetMembers(includeTargetMembers ? '0' : '1'),
                label: `Show activities targeting groups (${typeLabel} are member of)`,
              };
            } else if (qe(viewTypeClean, ACTORTYPES.CONTACT)) {
              memberOption = {
                active: includeTargetMembers,
                onClick: () => onSetIncludeTargetMembers(includeTargetMembers ? '0' : '1'),
                label: `Show activities targeting countries, organisations & groups (${typeLabel} are member of)`,
              };
            }
          } else if (canHaveMembers) {
            childOption = {
              active: includeTargetChildren,
              onClick: () => onSetIncludeTargetChildren(includeTargetChildren ? '0' : '1'),
              label: `Show activities targeting members of ${typeLabel}`,
            };
          }
        } else if (mapSubjectClean === 'actors') {
          if (canBeMember) {
            memberOption = {
              active: includeActorMembers,
              onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
              label: qe(viewTypeClean, ACTORTYPES.CONTACT)
                ? `Show activities of countries, organisations & groups (${typeLabel} are member of)`
                : `Show activities of groups (${typeLabel} are member of)`,
            };
          } else if (canHaveMembers) {
            childOption = {
              active: includeActorChildren,
              onClick: () => onSetIncludeActorChildren(includeActorChildren ? '0' : '1'),
              label: `Show activities of ${typeLabel} members`,
            };
          }
        }
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
      const canBeMember = Object.keys(MEMBERSHIPS).indexOf(typeId) > -1
        && MEMBERSHIPS[typeId].length > 0;
      const canHaveMembers = !canBeMember && Object.keys(MEMBERSHIPS).some(
        (id) => MEMBERSHIPS[id].indexOf(typeId) > -1
      );
      const actionColumns = getOwnActivityColumns(
        mapSubjectClean,
        typeId,
      );
      const typeColumns = getActortypeColumns({
        typeId,
        showCode,
        includeMain: false,
        isSingle: false,
      });
      columns = [
        {
          id: 'main',
          type: 'main',
          sort: 'title',
          attributes: showCode ? ['code', 'title'] : ['title'],
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

      if (mapSubjectClean === 'targets') {
        if (canBeMember) {
          memberOption = {
            active: includeTargetMembers,
            onClick: () => onSetIncludeTargetMembers(includeTargetMembers ? '0' : '1'),
            label: `Show activities targeting ${lowerCase(intl.formatMessage(appMessages.actortypes[typeId]))}' regions & groups`,
          };
        } else if (canHaveMembers) {
          if (qe(typeId, ACTORTYPES.REG)) {
            childOption = {
              active: includeTargetChildren,
              onClick: () => onSetIncludeTargetChildren(includeTargetChildren ? '0' : '1'),
              label: 'Show activities targeting region members',
            };
          } else if (qe(typeId, ACTORTYPES.GROUP)) {
            childOption = {
              active: includeTargetChildren,
              onClick: () => onSetIncludeTargetChildren(includeTargetChildren ? '0' : '1'),
              label: 'Show activities targeting group members',
            };
          }
        }
      } else if (mapSubjectClean === 'actors') {
        if (canBeMember) {
          memberOption = {
            active: includeActorMembers,
            onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
            label: `Include activities of ${lowerCase(intl.formatMessage(appMessages.actortypes[typeId]))}' groups`,
          };
        } else if (canHaveMembers) {
          if (qe(typeId, ACTORTYPES.GROUP)) {
            childOption = {
              active: includeActorChildren,
              onClick: () => onSetIncludeActorChildren(includeActorChildren ? '0' : '1'),
              label: 'Include activities of group members',
            };
          }
        }
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
          sort: 'title',
          attributes: showCode ? ['code', 'title'] : ['title'],
        },
        {
          id: 'statements', // one row per type,
          type: 'indicatorActions', // one row per type,
        },
        {
          id: 'support', // one row per type,
          type: 'stackedBarActions', // one row per type,
          values: 'supportlevels',
          title: 'Support',
          options: ACTION_INDICATOR_SUPPORTLEVELS,
          info: {
            type: 'key-categorical',
            title: 'Support by number of countries',
            attribute: 'supportlevel_id',
            options: Object.values(ACTION_INDICATOR_SUPPORTLEVELS)
              .sort((a, b) => a.order < b.order ? -1 : 1)
              .map((level) => ({
                ...level,
                label: intl.formatMessage(appMessages.supportlevels[level.value]),
              })),
          },
        },
      ];
      checkboxOptions = [
        {
          label: 'Infer country support from group statements',
          active: includeActorMembers,
          onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
          type: 'members',
        },
        {
          active: !includeInofficial,
          onClick: () => onSetIncludeInofficial(includeInofficial ? '0' : '1'),
          label: 'Consider "official" statements only (category: Level of Authority)',
          type: 'inoffical',
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
          sort: 'title',
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

    const showRelatedActorsForActions = !!entityActors;
    const showRelatedUsersForActions = !!entityUsers;
    const showEntities = !showRelatedActorsForActions && !showRelatedUsersForActions;

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
                  info={headerInfo}
                  buttons={listActions}
                  entityIdsSelected={entityIdsSelected}
                />
                {config.types === 'actiontypes' && subjectOptions && (
                  <Box>
                    {subjectOptions && (
                      <MapSubjectOptions options={subjectOptions} />
                    )}
                  </Box>
                )}
                {checkboxOptions && (
                  <Box>
                    {checkboxOptions && checkboxOptions.map(
                      (option, i) => (
                        <MapOption
                          key={i}
                          option={option}
                        />
                      )
                    )}
                  </Box>
                )}
                {showRelatedActorsForActions && (
                  <Box>
                    <Box direction="row" gap="xsmall" margin={{ vertical: 'small' }} wrap>
                      {mapSubject === 'actors'
                        && relatedActortypes
                        && relatedActortypes.map(
                          (actortypeId) => (
                            <ButtonPill
                              key={actortypeId}
                              onClick={() => this.setType(actortypeId)}
                              active={qe(viewTypeClean, actortypeId)}
                            >
                              <Text size="small">
                                <FormattedMessage {...appMessages.entities[`actors_${actortypeId}`].pluralShort} />
                              </Text>
                            </ButtonPill>
                          )
                        )}
                      {mapSubject === 'targets'
                        && relatedTargettypes
                        && relatedTargettypes.map(
                          (actortypeId) => (
                            <ButtonPill
                              key={actortypeId}
                              onClick={() => this.setType(actortypeId)}
                              active={qe(viewTypeClean, actortypeId)}
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
                        <MapOption option={memberOption} type="member" />
                      </Box>
                    )}
                    {childOption && (
                      <Box>
                        <MapOption option={childOption} type="child" />
                      </Box>
                    )}
                    {entityActors.get(parseInt(viewTypeClean, 10)) && (
                      <EntityListTable
                        paginate
                        hasSearch
                        columns={[
                          {
                            id: 'main',
                            type: 'main',
                            sort: 'title',
                            attributes: (showCode || qe(viewTypeClean, ACTORTYPES.COUNTRY))
                              ? ['code', 'title']
                              : ['title'],
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
                          {
                            id: 'actorActionsAsParent',
                            type: 'actorActions',
                            children: true,
                            subject: mapSubject,
                            actions: mapSubject === 'actors'
                              ? 'actionsAsParent'
                              : 'targetingActionsAsParent',
                            skip: !(childOption
                              && (
                                (mapSubject === 'actors' && includeActorChildren)
                                || (mapSubject === 'targets' && includeTargetChildren)
                              )),
                          },
                        ]}
                        entities={entityActors.get(parseInt(viewTypeClean, 10))}
                        entityPath={ROUTES.ACTOR}
                        onEntityClick={onEntityClick}
                        entityTitle={{
                          single: intl.formatMessage(appMessages.entities[`actors_${viewTypeClean}`].single),
                          plural: intl.formatMessage(appMessages.entities[`actors_${viewTypeClean}`].plural),
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
                {showRelatedUsersForActions && (
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
                          actiontype_id: viewTypeClean,
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
                {showEntities && (
                  <EntityListTable
                    paginate
                    hasSearch
                    columns={columns}
                    headerColumnsUtility={headerColumnsUtility}
                    memberOption={(memberOption || childOption) && <MapOption option={memberOption || childOption} type="member" />}
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
                    canEdit={isMember}
                    isVisitor={isVisitor}

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
                    includeChildren={mapSubjectClean === 'actors'
                      ? includeActorChildren
                      : includeTargetChildren
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
  headerInfo: PropTypes.object,
  listActions: PropTypes.array,
  checkboxOptions: PropTypes.array,
  intl: intlShape.isRequired,
  // primitive
  dataReady: PropTypes.bool,
  isMember: PropTypes.bool,
  isVisitor: PropTypes.bool,
  includeActorMembers: PropTypes.bool,
  includeTargetMembers: PropTypes.bool,
  includeActorChildren: PropTypes.bool,
  includeTargetChildren: PropTypes.bool,
  includeInofficial: PropTypes.bool,
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
  onSetIncludeActorChildren: PropTypes.func,
  onSetIncludeTargetChildren: PropTypes.func,
  onSetIncludeInofficial: PropTypes.func,
};

export default injectIntl(EntitiesListView);
// export default EntitiesListView;
