/*
 *
 * UserList
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { Map, List, fromJS } from 'immutable';
import { injectIntl, intlShape } from 'react-intl';

import {
  loadEntitiesIfNeeded,
  redirectIfNotPermitted,
  printView,
} from 'containers/App/actions';

import { keydownHandlerPrint } from 'utils/print';

import {
  selectReady,
  selectReadyForAuthCheck,
  selectUserConnections,
  selectUserTaxonomies,
  selectActiontypesForUsers,
  selectActortypesForUsers,
  // selectIsUserMember,
  selectIsUserVisitor,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';
import { USER_ROLES } from 'themes/config';
import { PRINT_TYPES } from 'containers/App/constants';

import EntityList from 'containers/EntityList';

import { CONFIG, DEPENDENCIES } from './constants';

import {
  selectUsers,
  selectUsersWithConnections,
} from './selectors';
import messages from './messages';

export function UserList({
  onLoadEntitiesIfNeeded,
  onRedirectIfNotPermitted,
  entities,
  taxonomies,
  connections,
  location,
  dataReady,
  authReady,
  actortypes,
  actiontypes,
  // isMember,
  isVisitor,
  allEntities,
  onSetPrintView,
  intl,
}) {
  useEffect(() => {
    if (authReady) onRedirectIfNotPermitted();
  }, [authReady]);

  useEffect(() => {
    if (!dataReady) onLoadEntitiesIfNeeded();
  }, [dataReady]);

  const mySetPrintView = () => onSetPrintView({
    printType: PRINT_TYPES.LIST,
    printOrientation: 'portrait',
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

  const type = 'users';
  const headerOptions = {
    supTitle: intl.formatMessage(messages.pageTitle),
    actions: [],
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

  return (
    <div>
      <Helmet
        title={intl.formatMessage(messages.pageTitle)}
        meta={[
          { name: 'description', content: intl.formatMessage(messages.metaDescription) },
        ]}
      />
      {dataReady && (
        <EntityList
          entities={entities}
          allEntities={allEntities.toList()}
          taxonomies={taxonomies}
          connections={connections}
          config={CONFIG}
          headerOptions={headerOptions}
          dataReady={dataReady}
          includeHeader={false}
          entityTitle={{
            single: intl.formatMessage(appMessages.entities.users.single),
            plural: intl.formatMessage(appMessages.entities.users.plural),
          }}
          locationQuery={fromJS(location.query)}
          actiontypes={actiontypes}
          actortypes={actortypes}
        />
      )}
    </div>
  );
}

UserList.propTypes = {
  onLoadEntitiesIfNeeded: PropTypes.func,
  onRedirectIfNotPermitted: PropTypes.func,
  onSetPrintView: PropTypes.func,
  dataReady: PropTypes.bool,
  authReady: PropTypes.bool,
  entities: PropTypes.instanceOf(List).isRequired,
  allEntities: PropTypes.instanceOf(Map),
  taxonomies: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  location: PropTypes.object,
  actiontypes: PropTypes.instanceOf(Map),
  actortypes: PropTypes.instanceOf(Map),
  // isMember: PropTypes.bool,
  isVisitor: PropTypes.bool,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state, props) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  authReady: selectReadyForAuthCheck(state),
  entities: selectUsers(state, fromJS(props.location.query)),
  allEntities: selectUsersWithConnections(state),
  taxonomies: selectUserTaxonomies(state),
  connections: selectUserConnections(state),
  actiontypes: selectActiontypesForUsers(state),
  actortypes: selectActortypesForUsers(state),
  // isMember: selectIsUserMember(state),
  isVisitor: selectIsUserVisitor(state),
});
function mapDispatchToProps(dispatch) {
  return {
    onLoadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onRedirectIfNotPermitted: () => {
      dispatch(redirectIfNotPermitted(USER_ROLES.MEMBER.value));
    },
    onSetPrintView: (config) => {
      dispatch(printView(config));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(UserList));
