/*
 *
 * ActionList
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { List, Map, fromJS } from 'immutable';
import { injectIntl, intlShape } from 'react-intl';

import {
  loadEntitiesIfNeeded,
  updatePath,
  printView,
  setIncludeMembersForFiltering,
} from 'containers/App/actions';
import {
  selectReady,
  selectActiontypeTaxonomiesWithCats,
  selectIsUserMember,
  selectIsUserVisitor,
  selectIsUserAdmin,
  selectActiontypes,
  selectActortypesForActiontype,
  selectParentActortypesForActiontype,
  selectResourcetypesForActiontype,
  selectViewQuery,
  selectIncludeMembersForFiltering,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';
import { PRINT_TYPES } from 'containers/App/constants';

import { checkActionAttribute } from 'utils/entities';
import { keydownHandlerPrint } from 'utils/print';

import { ROUTES, ACTIONTYPES, OUTREACH_ACTIONTYPES } from 'themes/config';

import EntityList from 'containers/EntityList';
import { CONFIG, DEPENDENCIES } from './constants';
import {
  selectActionsWithConnections,
  selectConnections,
  selectViewActions,
} from './selectors';

import messages from './messages';

export function ActionList({
  onLoadEntitiesIfNeeded,
  dataReady,
  entities,
  allEntities,
  taxonomies,
  connections,
  location,
  isMember,
  isVisitor,
  isAdmin,
  params, // { id: the action type }
  actiontypes,
  actortypes,
  parentActortypes,
  resourcetypes,
  onSetPrintView,
  handleImport,
  view,
  intl,
  onSetFilterMemberOption,
  includeMembersWhenFiltering,
}) {
  useEffect(() => {
    if (!dataReady) onLoadEntitiesIfNeeded();
  }, [dataReady]);

  const typeId = params.id;
  const type = `actions_${typeId}`;

  const showMap = typeId
    && CONFIG.views
    && CONFIG.views.map
    && CONFIG.views.map.types
    && CONFIG.views.map.types.indexOf(typeId) > -1
    && view === 'map';

  const mySetPrintView = () => onSetPrintView({
    printType: PRINT_TYPES.LIST,
    printMapOptions: showMap ? { markers: true } : null,
    printMapMarkers: true,
    fixed: showMap,
    printOrientation: showMap ? 'landscape' : 'portrait',
    printSize: 'A4',
    printItems: 'all',
  });

  const keydownHandler = (e) => {
    keydownHandlerPrint(e, mySetPrintView);
  };

  useEffect(() => {
    document.addEventListener('keydown', keydownHandler);
    return () => {
      document.removeEventListener('keydown', keydownHandler);
    };
  });

  const headerOptions = {
    supTitle: intl.formatMessage(messages.pageTitle),
    actions: [],
    info: appMessages.actiontypes_info[typeId]
      && intl.formatMessage(appMessages.actiontypes_info[typeId]).trim() !== ''
      ? {
        title: 'Please note',
        content: intl.formatMessage(appMessages.actiontypes_info[typeId]),
      }
      : null,
  };
  if (isVisitor) {
    headerOptions.actions.push({
      type: 'bookmarker',
      title: intl.formatMessage(appMessages.entities[type].plural),
      entityType: type,
    });
  }
  if (window.print) {
    headerOptions.actions.push({
      type: 'icon',
      onClick: () => mySetPrintView(),
      title: 'Print',
      icon: 'print',
    });
  }
  if (isMember) {
    headerOptions.actions.push({
      title: intl.formatMessage(appMessages.buttons.import),
      onClick: () => handleImport(typeId),
      icon: 'import',
      isMember,
    });
  }
  const hasMemberFilterOption = (CONFIG.hasMemberFilterOption && CONFIG.hasMemberFilterOption.indexOf(typeId) > -1);
  const filterActortypes = hasMemberFilterOption && parentActortypes
    ? actortypes.merge(parentActortypes)
    : actortypes;
  // console.log('filterActortypes', filterActortypes && filterActortypes.toJS())
  // console.log('parentActortypes', parentActortypes && parentActortypes.toJS())
  // console.log('actortypes', actortypes && actortypes.toJS())
  let filteringOptions;
  if (hasMemberFilterOption && onSetFilterMemberOption) {
    filteringOptions = [{
      key: 'filter-member-option',
      active: !!includeMembersWhenFiltering,
      label: 'Also consider member countries when filtering by region or group',
      info: 'When enabled and when filtering by region or group, the list will also include activities associated with any members of those regions or groups',
      onClick: () => {
        onSetFilterMemberOption(!includeMembersWhenFiltering);
      },
    }];
  }

  let navItems;
  if (OUTREACH_ACTIONTYPES.indexOf(typeId) > -1) {
    navItems = [];
    navItems = OUTREACH_ACTIONTYPES.reduce(
      (memo, actionTypeId) => [
        ...memo,
        {
          path: `${ROUTES.ACTIONS}/${actionTypeId}`,
          title: intl.formatMessage(appMessages.actiontypes_short[actionTypeId]),
          active: location.pathname && location.pathname.startsWith(`${ROUTES.ACTIONS}/${actionTypeId}`),
        },
      ],
      navItems,
    );
  } else {
    navItems = [
      {
        path: ROUTES.POSITIONS,
        title: 'Overview',
      },
      {
        path: `${ROUTES.ACTIONS}/${ACTIONTYPES.EXPRESS}`,
        title: intl.formatMessage(appMessages.entities[`actions_${ACTIONTYPES.EXPRESS}`].plural),
        active: true,
      },
      {
        path: ROUTES.INDICATORS,
        title: intl.formatMessage(appMessages.entities.indicators.plural),
      },
    ];
  }
  return (
    <div>
      <Helmet
        title={intl.formatMessage(messages.pageTitle)}
        meta={[
          { name: 'description', content: intl.formatMessage(messages.metaDescription) },
        ]}
      />
      <EntityList
        secondaryNavItems={navItems}
        entities={entities}
        allEntities={allEntities.toList()}
        taxonomies={taxonomies}
        connections={connections}
        config={CONFIG}
        headerOptions={headerOptions}
        dataReady={dataReady}
        entityTitle={{
          single: intl.formatMessage(appMessages.entities[type].single),
          plural: intl.formatMessage(appMessages.entities[type].plural),
        }}
        locationQuery={fromJS(location.query)}
        actortypes={actortypes}
        filterActortypes={filterActortypes}
        actiontypes={actiontypes}
        resourcetypes={resourcetypes}
        typeId={typeId}
        showCode={checkActionAttribute(typeId, 'code', isAdmin)}
        includeMembersWhenFiltering={includeMembersWhenFiltering}
        filteringOptions={filteringOptions}
      />
    </div>
  );
}

ActionList.propTypes = {
  dataReady: PropTypes.bool,
  isMember: PropTypes.bool,
  entities: PropTypes.instanceOf(List).isRequired,
  taxonomies: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  actortypes: PropTypes.instanceOf(Map),
  parentActortypes: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  resourcetypes: PropTypes.instanceOf(Map),
  allEntities: PropTypes.instanceOf(Map),
  onLoadEntitiesIfNeeded: PropTypes.func,
  onSetFilterMemberOption: PropTypes.func,
  handleImport: PropTypes.func,
  onSetPrintView: PropTypes.func,
  location: PropTypes.object,
  isVisitor: PropTypes.bool,
  isAdmin: PropTypes.bool,
  includeMembersWhenFiltering: PropTypes.bool,
  params: PropTypes.object,
  view: PropTypes.string,
  intl: intlShape,
};

const mapStateToProps = (state, props) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  entities: selectViewActions(state, { type: props.params.id }), // type
  taxonomies: selectActiontypeTaxonomiesWithCats(state, { type: props.params.id }),
  connections: selectConnections(state),
  isMember: selectIsUserMember(state),
  isVisitor: selectIsUserVisitor(state),
  isAdmin: selectIsUserAdmin(state),
  actiontypes: selectActiontypes(state),
  actortypes: selectActortypesForActiontype(state, { type: props.params.id }),
  parentActortypes: selectParentActortypesForActiontype(state, { type: props.params.id }),
  resourcetypes: selectResourcetypesForActiontype(state, { type: props.params.id }),
  allEntities: selectActionsWithConnections(state, { type: props.params.id }),
  view: selectViewQuery(state),
  includeMembersWhenFiltering: selectIncludeMembersForFiltering(state),
});
function mapDispatchToProps(dispatch) {
  return {
    onLoadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    handleImport: (typeId) => {
      dispatch(updatePath(`${ROUTES.ACTIONS}/${typeId}${ROUTES.IMPORT}`));
    },
    onSetPrintView: (config) => {
      dispatch(printView(config));
    },
    onSetFilterMemberOption: (view) => {
      dispatch(setIncludeMembersForFiltering(view));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ActionList));
