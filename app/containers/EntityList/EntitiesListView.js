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
import styled from 'styled-components';

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
import Content from 'components/styled/ContentSimple';
import ButtonPill from 'components/buttons/ButtonPill';
import HeaderPrint from 'components/Header/HeaderPrint';
import TagList from 'components/TagList';
import BoxPrint from 'components/styled/BoxPrint';

import MapSubjectOptions from 'containers/MapContainer/MapInfoOptions/MapSubjectOptions';
import MapOption from 'containers/MapContainer/MapInfoOptions/MapOption';
import EntityListTable from 'containers/EntityListTable';
import ContentHeader from 'containers/ContentHeader';

import qe from 'utils/quasi-equals';
import { lowerCase } from 'utils/string';
import { getActiontypeColumns, getActortypeColumns } from 'utils/entities';
import appMessages from 'containers/App/messages';

import { getActorsForEntities, getUsersForEntities } from './utils';
import messages from './messages';

const LabelPrint = styled.span`
  font-size: ${({ theme }) => theme.sizes.print.smaller};
`;
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
  };

  setType = (type) => {
    this.setState({ viewType: type });
  };

  render() {
    const {
      config,
      entityTitle,
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
      filters,
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
      isPrintView,
      searchQuery,
      isAdmin,
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

    let headerTitle = entityTitle.plural;
    // ACTIONS =================================================================
    if (config.types === 'actiontypes') {
      columns = getActiontypeColumns({
        typeId,
        showCode,
        isSingle: false,
        isAdmin,
      });
      type = actiontypes.find((at) => qe(at.get('id'), typeId));
      // hasByTarget = type.getIn(['attributes', 'has_target']);
      hasByActor = ACTIONTYPE_ACTORTYPES[typeId] && ACTIONTYPE_ACTORTYPES[typeId].length > 0;
      hasByTarget = ACTIONTYPE_TARGETTYPES[typeId] && ACTIONTYPE_TARGETTYPES[typeId].length > 0;
      hasByUser = isAdmin && USER_ACTIONTYPES && USER_ACTIONTYPES.indexOf(typeId) > -1;
      // console.log(typeId, type.get('id'), ACTIONTYPE_ACTORTYPES, ACTIONTYPE_ACTORTYPES[typeId], hasByActor, hasByTarget)
      if (!hasByTarget && mapSubject === 'targets') {
        mapSubjectClean = null;
      }
      if (!hasByActor && mapSubject === 'actors') {
        mapSubjectClean = null;
      }
      if (!hasByUser && mapSubject === 'users') {
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
        if (mapSubjectClean === 'actors') {
          headerTitle = `${headerTitle} by actor`;
        }
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
        if (mapSubjectClean === 'targets') {
          headerTitle = `${headerTitle} by target`;
        }
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
        if (mapSubjectClean === 'users') {
          headerTitle = `${headerTitle} by user`;
        }
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
          }
          if (canHaveMembers) {
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
    } else if (config.types === 'actortypes') {
      type = actortypes.find((at) => qe(at.get('id'), typeId));
      isTarget = type.getIn(['attributes', 'is_target']);
      isActive = type.getIn(['attributes', 'is_active']);
      if (isTarget && isActive) {
        mapSubjectClean = mapSubject || 'actors';
        if (mapSubjectClean === 'users') {
          mapSubjectClean = 'actors';
        }
      } else if (isTarget && !isActive) {
        mapSubjectClean = 'targets';
      } else if (!isTarget && isActive) {
        mapSubjectClean = 'actors';
      }
      subjectOptions = [];
      const canBeMember = Object.keys(MEMBERSHIPS).indexOf(typeId) > -1
        && MEMBERSHIPS[typeId].length > 0;
      const canHaveMembers = Object.keys(MEMBERSHIPS).some(
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
        isAdmin,
      });
      headerColumnsUtility = [
        {
          type: 'main',
          content: '',
        },
        ...typeColumns.map(() => ({
          type: 'spacer',
          content: '',
          hasSingleActionColumn: actionColumns.length === 1,
        })),
        {
          type: 'options',
          span: actionColumns.length,
          isSingleActionColumn: actionColumns.length === 1,
        },
      ];

      columns = [
        {
          id: 'main',
          type: 'main',
          sort: 'title',
          attributes: showCode ? ['code', 'title'] : ['title'],
        },
        ...typeColumns.map((tc) => ({
          ...tc,
          hasSingleActionColumn: actionColumns.length === 1,
        })),
        ...actionColumns.map((ac) => ({
          ...ac,
          isSingleActionColumn: actionColumns.length === 1,
        })),
      ];

      if (isActive) {
        subjectOptions = [
          ...subjectOptions,
          {
            type: 'secondary',
            title: isPrintView ? 'Activities' : 'As actors',
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
            title: isPrintView ? 'Activities targeted by' : 'As targets',
            onClick: () => onSetMapSubject('targets'),
            active: mapSubjectClean === 'targets',
            disabled: mapSubjectClean === 'targets',
          },
        ];
      }

      if (mapSubjectClean === 'targets') {
        if (canBeMember) {
          if (qe(typeId, ACTORTYPES.CONTACT)) {
            memberOption = {
              active: includeTargetMembers,
              onClick: () => onSetIncludeTargetMembers(includeTargetMembers ? '0' : '1'),
              label: 'Show activities targeting countries (contacts belong to)',
            };
          } else if (!qe(typeId, ACTORTYPES.ORG)) {
            memberOption = {
              active: includeTargetMembers,
              onClick: () => onSetIncludeTargetMembers(includeTargetMembers ? '0' : '1'),
              label: `Show activities targeting groups or regions (${lowerCase(intl.formatMessage(appMessages.actortypes[typeId]))} belong to)`,
            };
          }
        }
        if (canHaveMembers) {
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
          } else if (qe(typeId, ACTORTYPES.COUNTRY)) {
            childOption = {
              active: includeTargetChildren,
              onClick: () => onSetIncludeTargetChildren(includeTargetChildren ? '0' : '1'),
              label: 'Show activities targeting country members',
            };
          } else if (qe(typeId, ACTORTYPES.ORG)) {
            childOption = {
              active: includeTargetChildren,
              onClick: () => onSetIncludeTargetChildren(includeTargetChildren ? '0' : '1'),
              label: 'Show activities targeting organisation members',
            };
          }
        }
      } else if (mapSubjectClean === 'actors') {
        if (canBeMember) {
          if (qe(typeId, ACTORTYPES.CONTACT)) {
            memberOption = {
              active: includeActorMembers,
              onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
              label: 'Include activities of countries (contacts belong to)',
            };
          } else {
            memberOption = {
              active: includeActorMembers,
              onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
              label: `Include activities of ${lowerCase(intl.formatMessage(appMessages.actortypes[typeId]))}' groups`,
            };
          }
        }
        if (canHaveMembers) {
          if (qe(typeId, ACTORTYPES.GROUP)) {
            childOption = {
              active: includeActorChildren,
              onClick: () => onSetIncludeActorChildren(includeActorChildren ? '0' : '1'),
              label: 'Include activities of group members',
            };
          }
          if (qe(typeId, ACTORTYPES.COUNTRY)) {
            childOption = {
              active: includeActorChildren,
              onClick: () => onSetIncludeActorChildren(includeActorChildren ? '0' : '1'),
              label: 'Include activities of country contacts',
            };
          }
          if (qe(typeId, ACTORTYPES.ORG)) {
            childOption = {
              active: includeActorChildren,
              onClick: () => onSetIncludeActorChildren(includeActorChildren ? '0' : '1'),
              label: 'Include activities of organisation contacts',
            };
          }
        }
      }


      // RESOURCES ================================================================
      //
    } else if (config.types === 'resourcetypes') {
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
    } else if (config.types === 'indicators') {
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
          title: intl.formatMessage(appMessages.actiontypes[1]),
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
    } else if (config.types === 'users') {
      mapSubjectClean = 'actors';
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
    } else if (config.types === 'pages') {
      columns = [
        {
          id: 'main',
          type: 'main',
          sort: 'title',
          attributes: ['title', 'menu_title'],
        },
      ];
    }
    // let headerSubTitle = `${allEntityCount} ${allEntityCount === 1 ? entityTitle.single : entityTitle.plural} in database`;
    // if (entities && hasFilters) {
    //   headerSubTitle = `Showing ${entities.size} of ${headerSubTitle}`;
    // }

    const showRelatedActorsForActions = !!entityActors;
    const showRelatedUsersForActions = !!entityUsers;
    const showEntities = !showRelatedActorsForActions && !showRelatedUsersForActions;

    return (
      <ContainerWrapper headerStyle={headerStyle} ref={this.ScrollContainer} isPrintView={isPrintView}>
        {isPrintView && (
          <HeaderPrint argsRemove={['subj', 'ac', 'tc', 'mtchm', 'mtch', 'actontype']} />
        )}
        <Container ref={this.ScrollReference} isPrint={isPrintView}>
          <Content isPrint={isPrintView}>
            <div>
              <ContentHeader
                type={CONTENT_LIST}
                title={headerTitle}
                hasViewOptions={viewOptions && viewOptions.length > 1}
                info={headerInfo}
                buttons={listActions}
                entityIdsSelected={entityIdsSelected}
              />
              {isPrintView && (searchQuery || hasFilters) && (
                <Box margin={{ vertical: 'small' }}>
                  <LabelPrint>
                    {!!searchQuery && !hasFilters && (
                      <FormattedMessage {...messages.labelPrintKeywords} />
                    )}
                    {!searchQuery && hasFilters && (
                      <FormattedMessage {...messages.labelPrintFilters} />
                    )}
                    {!!searchQuery && hasFilters && (
                      <FormattedMessage {...messages.labelPrintFiltersKeywords} />
                    )}
                  </LabelPrint>
                  <TagList
                    filters={filters}
                    searchQuery={searchQuery}
                    isPrintView
                    isPrint
                  />
                </Box>
              )}
              {config.types === 'actiontypes' && subjectOptions && !isPrintView && (
                <Box>
                  <MapSubjectOptions options={subjectOptions} inList />
                </Box>
              )}
              {checkboxOptions && (
                <Box>
                  {checkboxOptions && checkboxOptions.map(
                    (option, i) => (
                      <MapOption key={i} option={option} />
                    )
                  )}
                </Box>
              )}
              {showRelatedActorsForActions && (
                <Box>
                  <BoxPrint
                    isPrint={isPrintView}
                    printHide
                    direction="row"
                    gap="xsmall"
                    margin={{ vertical: 'small' }}
                    wrap
                  >
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
                  </BoxPrint>
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
                  <EntityListTable
                    isByOption
                    hasFilters={hasFilters}
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
                        label: entityTitle.plural,
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
                        label: `${entityTitle.plural} as member`,
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
                        label: mapSubject === 'actors'
                          ? `${entityTitle.plural} by members`
                          : `${entityTitle.plural} targeting members`,
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
                </Box>
              )}
              {showRelatedUsersForActions && (
                <Box>
                  <EntityListTable
                    isByOption
                    hasFilters={hasFilters}
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
                  hasFilters={hasFilters}
                  paginate
                  hasSearch
                  columns={columns}
                  headerColumnsUtility={headerColumnsUtility}
                  memberOption={memberOption && (
                    <MapOption
                      option={memberOption}
                      type="member"
                    />
                  )}
                  childOption={childOption && (
                    <MapOption
                      option={childOption}
                      type="child"
                    />
                  )}
                  subjectOptions={config.types === 'actortypes'
                    && subjectOptions
                    && (
                      <MapSubjectOptions
                        inList
                        options={subjectOptions}
                      />
                    )}
                  listUpdating={listUpdating}
                  entities={entities}
                  allEntityCount={allEntityCount}
                  errors={errors}
                  taxonomies={taxonomies}
                  actortypes={actortypes}
                  connections={connections}
                  connectedTaxonomies={connectedTaxonomies}
                  entityIdsSelected={entityIdsSelected}
                  config={config}
                  entityTitle={entityTitle}

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
  filters: PropTypes.array,
  intl: intlShape.isRequired,
  // primitive
  isPrintView: PropTypes.bool,
  isMember: PropTypes.bool,
  isVisitor: PropTypes.bool,
  includeActorMembers: PropTypes.bool,
  includeTargetMembers: PropTypes.bool,
  includeActorChildren: PropTypes.bool,
  includeTargetChildren: PropTypes.bool,
  includeInofficial: PropTypes.bool,
  listUpdating: PropTypes.bool,
  isAdmin: PropTypes.bool,
  headerStyle: PropTypes.string,
  hasFilters: PropTypes.bool,
  typeId: PropTypes.string,
  showCode: PropTypes.bool,
  mapSubject: PropTypes.string,
  searchQuery: PropTypes.string,
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
