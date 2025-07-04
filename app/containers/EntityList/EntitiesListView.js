/*
 *
 * EntitiesListView
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import { Box } from 'grommet';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';

import {
  ROUTES,
  ACTORTYPES,
  ACTIONTYPES,
  ACTIONTYPE_ACTORTYPES,
  USER_ACTIONTYPES,
  MEMBERSHIPS,
  ACTION_INDICATOR_SUPPORTLEVELS,
  // ACTIONTYPES,
} from 'themes/config';
import { CONTENT_LIST } from 'containers/App/constants';
import HeaderPrint from 'components/Header/HeaderPrint';
import TagList from 'components/TagList';

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

class EntitiesListView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = {
      viewType: ACTORTYPES.COUNTRY,
    };
  }

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
      hasFilters,
      filters,
      showCode,
      entityIdsSelected,
      listUpdating,
      reducePreviewItem,
      onEntitySelect,
      onEntitySelectAll,
      onDismissError,
      typeId,
      mapSubject,
      onSetMapSubject,
      onSetIncludeActorMembers,
      includeActorMembers,
      onSetIncludeActorChildren,
      includeActorChildren,
      includeInofficial,
      onSetIncludeInofficial,
      intl,
      allEntityCount,
      headerInfo,
      listActions,
      isPrintView,
      searchQuery,
      isAdmin,
      onScrollToTop,
      onEntityClick,
      onClearFilters,
      skipPreviews,
    } = this.props;

    const { viewType } = this.state;
    let hasByActor;
    let hasByUser;
    let subjectOptions = [];
    let checkboxOptions = [];
    let typeOptions = [];
    let entityActors;
    let entityUsers;
    let columns;
    let mapSubjectClean = mapSubject;
    let userEntityColumnTitle;
    let relatedActortypes;
    let viewTypeClean = viewType;

    const primaryEntityCount = entities && entities.size;

    const headerTitle = entityTitle.plural;
    // ACTIONS =================================================================
    if (config.types === 'actiontypes') {
      columns = getActiontypeColumns({
        typeId,
        showCode,
        isSingle: false,
        isAdmin,
      });
      // const type = actiontypes.find((at) => qe(at.get('id'), typeId));
      hasByActor = ACTIONTYPE_ACTORTYPES[typeId] && ACTIONTYPE_ACTORTYPES[typeId].length > 0;
      hasByUser = isAdmin && USER_ACTIONTYPES && USER_ACTIONTYPES.indexOf(typeId) > -1;
      if (!hasByActor && mapSubject === 'actors') {
        mapSubjectClean = null;
      }
      if (!hasByUser && mapSubject === 'users') {
        mapSubjectClean = null;
      }
      subjectOptions = [
        {
          type: 'secondary',
          title: `${primaryEntityCount} ${headerTitle}`,
          onClick: () => onSetMapSubject(),
          active: !mapSubjectClean,
        },
      ];
      if (hasByActor) {
        subjectOptions = [
          ...subjectOptions,
          {
            type: 'secondary',
            title: 'by stakeholder',
            onClick: () => onSetMapSubject('actors'),
            active: mapSubjectClean === 'actors',
          },
        ];
      }
      if (hasByUser) {
        subjectOptions = [
          ...subjectOptions,
          {
            type: 'secondary',
            title: 'by user',
            onClick: () => onSetMapSubject('users'),
            active: mapSubjectClean === 'users',
          },
        ];
      }
      if (mapSubjectClean === 'actors') {
        relatedActortypes = ACTIONTYPE_ACTORTYPES[typeId]
          && ACTIONTYPE_ACTORTYPES[typeId].length > 1
          && ACTIONTYPE_ACTORTYPES[typeId];
        viewTypeClean = (viewTypeClean && relatedActortypes.indexOf(viewTypeClean) > -1)
          ? viewTypeClean
          : relatedActortypes[0];
        const canBeMember = Object.keys(MEMBERSHIPS).indexOf(viewTypeClean) > -1
          && MEMBERSHIPS[viewTypeClean].length > 0;
        const canHaveMembers = !canBeMember && Object.keys(MEMBERSHIPS).some(
          (id) => MEMBERSHIPS[id].indexOf(viewTypeClean) > -1
        );
        entityActors = getActorsForEntities({
          actions: entities,
          actors: connections && connections.get('actors'),
          includeIndirect: canBeMember && includeActorMembers,
          includeChildren: canHaveMembers && includeActorChildren,
        });
        entityActors = entityActors && entityActors.groupBy(
          (actor) => actor.getIn(['attributes', 'actortype_id'])
        );
        const typeLabel = lowerCase(intl.formatMessage(appMessages.actortypes[viewTypeClean]));
        if (mapSubjectClean === 'actors') {
          typeOptions = relatedActortypes;
          if (canBeMember) {
            checkboxOptions = [
              ...checkboxOptions,
              {
                active: includeActorMembers,
                onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
                label: qe(viewTypeClean, ACTORTYPES.CONTACT)
                  ? `Show activities of countries, organisations & groups (${typeLabel} are member of)`
                  : `Show activities of groups (${typeLabel} are member of)`,
                type: 'as-member',
              },
            ];
          }
          if (canHaveMembers) {
            checkboxOptions = [
              ...checkboxOptions,
              {
                active: includeActorChildren,
                onClick: () => onSetIncludeActorChildren(includeActorChildren ? '0' : '1'),
                label: `Show activities of ${typeLabel}' members`,
                type: 'children',
              },
            ];
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
      mapSubjectClean = 'actors';
      const canBeMember = Object.keys(MEMBERSHIPS).indexOf(typeId) > -1
        && MEMBERSHIPS[typeId].length > 0;
      const canHaveMembers = Object.keys(MEMBERSHIPS).some(
        (id) => MEMBERSHIPS[id].indexOf(typeId) > -1
      );
      columns = [
        {
          id: 'main',
          type: 'main',
          sort: 'title',
          attributes: showCode ? ['code', 'title', 'prefix'] : ['title', 'prefix'],
        },
        ...getActortypeColumns({
          typeId,
          showCode,
          includeMain: false,
          isSingle: false,
          isAdmin,
          mapSubjectClean,
        }),
      ];
      if (qe(typeId, ACTORTYPES.COUNTRY)) {
        columns = [
          ...columns,
          {
            id: 'positionsCompact',
            type: 'positionsCompact',
            positions: 'indicatorPositions',
            title: 'Positions by topic',
            minSize: 'small',
            info: {
              title: intl.formatMessage(appMessages.attributes.supportlevel_id),
              type: 'key-categorical',
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
      }
      subjectOptions = [
        {
          type: 'secondary',
          title: `${primaryEntityCount} ${headerTitle}`,
          active: true,
        },
      ];

      if (mapSubjectClean === 'actors') {
        if (canBeMember) {
          let label;
          if (qe(typeId, ACTORTYPES.CONTACT)) {
            label = 'Include activities of countries (contacts belong to)';
          } else {
            label = `Include activities of ${lowerCase(intl.formatMessage(appMessages.actortypes[typeId]))}' groups`;
          }
          checkboxOptions = [
            ...checkboxOptions,
            {
              active: includeActorMembers,
              onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
              type: 'as-member',
              label,
            },
          ];
        }
        if (canHaveMembers) {
          let label;
          if (qe(typeId, ACTORTYPES.GROUP)) {
            label = 'Include activities of group members';
          }
          if (qe(typeId, ACTORTYPES.COUNTRY)) {
            label = 'Include activities of country contacts';
          }
          if (qe(typeId, ACTORTYPES.ORG)) {
            label = 'Include activities of organisation contacts';
          }
          if (qe(typeId, ACTORTYPES.REG)) {
            label = 'Include activities of region members';
          }
          checkboxOptions = [
            ...checkboxOptions,
            {
              active: includeActorChildren,
              onClick: () => onSetIncludeActorChildren(includeActorChildren ? '0' : '1'),
              type: 'children',
              label,
            },
          ];
        } // canhavemembers
      }


      // RESOURCES ================================================================
      //
    } else if (config.types === 'resourcetypes') {
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
      subjectOptions = [
        {
          type: 'secondary',
          title: `${primaryEntityCount} ${headerTitle}`,
          active: true,
        },
      ];
      columns = [
        {
          id: 'main',
          type: 'main',
          sort: 'reference',
          attributes: showCode ? ['code', 'title'] : ['title'],
        },
        {
          id: 'statements', // one row per type,
          type: 'indicatorActions', // one row per type,
          type_id: ACTIONTYPES.EXPRESS,
          title: intl.formatMessage(appMessages.actiontypes[1]),
          minSize: 'ms',
        },
        {
          id: 'support', // one row per type,
          type: 'stackedBarActions', // one row per type,
          values: 'supportlevels',
          title: 'Support',
          options: ACTION_INDICATOR_SUPPORTLEVELS,
          minSize: 'small',
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
        ...checkboxOptions,
        {
          label: 'Infer country support from group statements',
          active: includeActorMembers,
          onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
          type: 'as-member',
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
    const showMainEntities = !showRelatedActorsForActions && !showRelatedUsersForActions;

    return (
      <div>
        {isPrintView && (
          <HeaderPrint argsRemove={['subj', 'ac', 'tc', 'achmmap', 'achmap', 'actontype']} />
        )}
        <ContentHeader
          type={CONTENT_LIST}
          title={headerTitle}
          hasViewOptions
          info={headerInfo}
          buttons={listActions}
          entityIdsSelected={entityIdsSelected}
        />
        {(searchQuery || hasFilters) && (
          <Box margin={{ bottom: 'small' }}>
            {isPrintView && (
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
            )}
            <TagList
              filters={filters}
              searchQuery={searchQuery}
              onClear={onClearFilters}
            />
          </Box>
        )}
        {showRelatedActorsForActions && (
          <EntityListTable
            typeId={typeId}
            mapSubject={mapSubjectClean}
            skipPreviews={skipPreviews}
            isByOption
            reducePreviewItem={reducePreviewItem}
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
                actions: 'actions',
              },
              {
                id: 'actorActionsAsMember',
                type: 'actorActions',
                members: true,
                subject: mapSubject,
                label: `${entityTitle.plural} as member`,
                actions: 'actionsMembers',
              },
              {
                id: 'actorActionsAsParent',
                type: 'actorActions',
                children: true,
                subject: mapSubject,
                label: `${entityTitle.plural} by members`,
                actions: 'actionsAsParent',
              },
            ]}
            entities={entityActors.get(parseInt(viewTypeClean, 10))}
            entityPath={ROUTES.ACTOR}
            onEntityClick={onEntityClick}
            entityTitle={{
              single: intl.formatMessage(appMessages.entities[`actors_${viewTypeClean}`].single),
              plural: intl.formatMessage(appMessages.entities[`actors_${viewTypeClean}`].plural),
            }}
            onResetScroll={onScrollToTop}
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
            options={{
              checkboxOptions,
              subjectOptions,
              typeOptions: typeOptions.map((id) => ({
                id,
                onClick: () => this.setType(id),
                active: qe(viewTypeClean, id),
                label: intl.formatMessage(appMessages.entities[`actors_${id}`].pluralShort),
              })),
              hasSearch: true,
              paginate: true,
              paginateOptions: true,
              activeType: viewTypeClean,
            }}
          />
        )}
        {showRelatedUsersForActions && (
          <Box>
            <EntityListTable
              typeId={typeId}
              mapSubject={mapSubjectClean}
              skipPreviews={skipPreviews}
              reducePreviewItem={reducePreviewItem}
              isByOption
              hasFilters={hasFilters}
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
                  title: userEntityColumnTitle,
                },
              ]}
              entities={entityUsers}
              entityPath={ROUTES.USERS}
              onEntityClick={onEntityClick}
              entityTitle={{
                single: intl.formatMessage(appMessages.entities.users.single),
                plural: intl.formatMessage(appMessages.entities.users.plural),
              }}
              onResetScroll={onScrollToTop}
              config={{
                clientPath: ROUTES.USER,
                views: {
                  list: {
                    search: ['name', 'description'],
                  },
                },
              }}
              connections={connections}
              options={{
                hasSearch: true,
                paginate: true,
                paginateOptions: true,
                checkboxOptions,
                subjectOptions,
              }}
            />
          </Box>
        )}
        {showMainEntities && (
          <EntityListTable
            mapSubject={mapSubjectClean}
            skipPreviews={skipPreviews}
            hasFilters={hasFilters}
            columns={columns}
            options={{
              checkboxOptions,
              subjectOptions,
              typeOptions,
              hasSearch: true,
              paginate: true,
              paginateOptions: true,
              includeMembers: includeActorMembers,
              includeChildren: includeActorChildren,
            }}
            listUpdating={listUpdating}
            entities={entities}
            allEntityCount={allEntityCount}
            errors={errors}
            taxonomies={taxonomies}
            connections={connections}
            connectedTaxonomies={connectedTaxonomies}
            entityIdsSelected={entityIdsSelected}
            config={config}
            entityTitle={entityTitle}

            canEdit={isMember}
            isVisitor={isVisitor}

            onEntityClick={onEntityClick}
            onEntitySelect={onEntitySelect}
            onEntitySelectAll={onEntitySelectAll}
            onResetScroll={onScrollToTop}
            onDismissError={onDismissError}
            typeId={typeId}
            showCode={showCode}
            reducePreviewItem={reducePreviewItem}
          />
        )}
      </div>
    );
  }
}

EntitiesListView.propTypes = {
  entities: PropTypes.instanceOf(List),
  taxonomies: PropTypes.instanceOf(Map),
  actortypes: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  connectedTaxonomies: PropTypes.instanceOf(Map),
  entityIdsSelected: PropTypes.instanceOf(List),
  errors: PropTypes.instanceOf(Map),
  // object/arrays
  config: PropTypes.object,
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
  includeActorChildren: PropTypes.bool,
  includeInofficial: PropTypes.bool,
  listUpdating: PropTypes.bool,
  isAdmin: PropTypes.bool,
  hasFilters: PropTypes.bool,
  typeId: PropTypes.string,
  showCode: PropTypes.bool,
  skipPreviews: PropTypes.bool,
  mapSubject: PropTypes.string,
  searchQuery: PropTypes.string,
  allEntityCount: PropTypes.number,
  // functions
  onEntitySelect: PropTypes.func.isRequired,
  onEntityClick: PropTypes.func.isRequired,
  onEntitySelectAll: PropTypes.func.isRequired,
  onDismissError: PropTypes.func.isRequired,
  onSetMapSubject: PropTypes.func,
  onSetIncludeActorMembers: PropTypes.func,
  onSetIncludeActorChildren: PropTypes.func,
  onSetIncludeInofficial: PropTypes.func,
  onScrollToTop: PropTypes.func,
  onClearFilters: PropTypes.func,
  reducePreviewItem: PropTypes.func,
};

export default injectIntl(EntitiesListView);
// export default EntitiesListView;
