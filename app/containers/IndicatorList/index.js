/*
 *
 * IndicatorList
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { List, Map, fromJS } from 'immutable';

import {
  checkIndicatorAttribute,
} from 'utils/entities';

import { loadEntitiesIfNeeded, updatePath } from 'containers/App/actions';
import {
  selectReady,
  selectIsUserMember,
  selectIsUserVisitor,
  selectIsUserAdmin,
  selectActiontypesForIndicators,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';
import { ROUTES } from 'themes/config';

import EntityList from 'containers/EntityList';

import { CONFIG, DEPENDENCIES } from './constants';
import {
  selectConnections,
  selectListIndicators,
  selectIndicatorsWithConnections,
} from './selectors';

import messages from './messages';

export class IndicatorList extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
  }

  render() {
    const { intl } = this.context;
    const {
      dataReady,
      entities,
      allEntities,
      connections,
      location,
      isAdmin,
      isMember,
      isVisitor,
      actiontypes,
    } = this.props;
    const type = 'indicators';
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
        onClick: () => window.print(),
        title: 'Print',
        icon: 'print',
      });
    }
    if (isMember) {
      headerOptions.actions.push({
        title: 'Create new',
        onClick: () => this.props.handleNew(),
        icon: 'add',
        isMember,
      });
      headerOptions.actions.push({
        title: intl.formatMessage(appMessages.buttons.import),
        onClick: () => this.props.handleImport(),
        icon: 'import',
        isMember,
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
        <EntityList
          entities={entities}
          config={CONFIG}
          allEntityCount={allEntities && allEntities.size}
          allEntities={allEntities.toList()}
          connections={connections}
          headerOptions={headerOptions}
          dataReady={dataReady}
          entityTitle={{
            single: intl.formatMessage(appMessages.entities.indicators.single),
            plural: intl.formatMessage(appMessages.entities.indicators.plural),
          }}
          locationQuery={fromJS(location.query)}
          actiontypes={actiontypes}
          showCode={checkIndicatorAttribute('code', isAdmin)}
        />
      </div>
    );
  }
}

IndicatorList.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  handleNew: PropTypes.func,
  handleImport: PropTypes.func,
  dataReady: PropTypes.bool,
  isMember: PropTypes.bool,
  entities: PropTypes.instanceOf(List).isRequired,
  connections: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  location: PropTypes.object,
  isAdmin: PropTypes.bool,
  isVisitor: PropTypes.bool,
  allEntities: PropTypes.instanceOf(Map),
};

IndicatorList.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  entities: selectListIndicators(state, fromJS(props.location.query)),
  connections: selectConnections(state),
  isMember: selectIsUserMember(state),
  isVisitor: selectIsUserVisitor(state),
  isAdmin: selectIsUserAdmin(state),
  actiontypes: selectActiontypesForIndicators(state),
  allEntities: selectIndicatorsWithConnections(state),
});
function mapDispatchToProps(dispatch) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    handleNew: () => {
      dispatch(updatePath(`${ROUTES.INDICATORS}${ROUTES.NEW}`, { replace: true }));
    },
    handleImport: () => {
      dispatch(updatePath(`${ROUTES.INDICATORS}${ROUTES.IMPORT}`));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(IndicatorList);
