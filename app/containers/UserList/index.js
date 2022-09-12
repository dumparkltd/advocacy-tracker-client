/*
 *
 * UserList
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { Map, List, fromJS } from 'immutable';

import {
  loadEntitiesIfNeeded,
  redirectIfNotPermitted,
} from 'containers/App/actions';

import {
  selectReady,
  selectReadyForAuthCheck,
  selectUserConnections,
  selectUserTaxonomies,
  selectActiontypesForUsers,
  selectActortypesForUsers,
  // selectIsUserManager,
  selectIsUserAnalyst,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';
import { USER_ROLES } from 'themes/config';

import EntityList from 'containers/EntityList';

import { CONFIG, DEPENDENCIES } from './constants';
import {
  selectUsers,
  selectUsersWithConnections,
} from './selectors';
import messages from './messages';

export class UserList extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
    if (nextProps.authReady && !this.props.authReady) {
      this.props.redirectIfNotPermitted();
    }
  }

  render() {
    const { intl } = this.context;
    const {
      dataReady,
      actortypes,
      actiontypes,
      // isManager,
      isAnalyst,
      allEntities,
    } = this.props;
    const type = 'users';
    const headerOptions = {
      supTitle: intl.formatMessage(messages.pageTitle),
      actions: [],
    };
    if (isAnalyst) {
      headerOptions.actions.push({
        type: 'bookmarker',
        title: intl.formatMessage(appMessages.entities[type].plural),
        entityType: type,
      });
    }
    if (window.print) {
      headerOptions.actions.push({
        type: 'icon',
        onClick: () => window.print(),
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
            entities={this.props.entities}
            allEntities={allEntities.toList()}
            taxonomies={this.props.taxonomies}
            connections={this.props.connections}
            config={CONFIG}
            headerOptions={headerOptions}
            dataReady={dataReady}
            includeHeader={false}
            entityTitle={{
              single: intl.formatMessage(appMessages.entities.users.single),
              plural: intl.formatMessage(appMessages.entities.users.plural),
            }}
            locationQuery={fromJS(this.props.location.query)}
            actiontypes={actiontypes}
            actortypes={actortypes}
          />
        )}
      </div>
    );
  }
}

UserList.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  redirectIfNotPermitted: PropTypes.func,
  dataReady: PropTypes.bool,
  authReady: PropTypes.bool,
  entities: PropTypes.instanceOf(List).isRequired,
  allEntities: PropTypes.instanceOf(Map),
  taxonomies: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  location: PropTypes.object,
  actiontypes: PropTypes.instanceOf(Map),
  actortypes: PropTypes.instanceOf(Map),
  // isManager: PropTypes.bool,
  isAnalyst: PropTypes.bool,
};

UserList.contextTypes = {
  intl: PropTypes.object.isRequired,
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
  // isManager: selectIsUserManager(state),
  isAnalyst: selectIsUserAnalyst(state),
});
function mapDispatchToProps(dispatch) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    redirectIfNotPermitted: () => {
      dispatch(redirectIfNotPermitted(USER_ROLES.MANAGER.value));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserList);
