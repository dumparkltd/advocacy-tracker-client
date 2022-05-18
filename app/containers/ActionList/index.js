/*
 *
 * ActionList
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { List, Map, fromJS } from 'immutable';

import { loadEntitiesIfNeeded, updatePath } from 'containers/App/actions';
import {
  selectReady,
  selectActiontypeTaxonomiesWithCats,
  selectIsUserManager,
  selectIsUserAnalyst,
  selectActiontypes,
  // selectActortypes,
  selectActortypesForActiontype,
  selectTargettypesForActiontype,
  selectResourcetypesForActiontype,
  selectActiontypeActions,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';

import { checkActionAttribute } from 'utils/entities';

import { ROUTES, ACTIONTYPE_DISCLAIMERS } from 'themes/config';

import EntityList from 'containers/EntityList';
import { CONFIG, DEPENDENCIES } from './constants';
import {
  selectConnections,
  selectViewActions,
  selectConnectedTaxonomies,
} from './selectors';

import messages from './messages';

export class ActionList extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
  }

  prepareTypeOptions = (types, activeId) => {
    const { intl } = this.context;
    return types.toList().toJS().map((type) => ({
      value: type.id,
      label: intl.formatMessage(appMessages.actiontypes[type.id]),
      active: activeId === type.id,
    }));
  }

  render() {
    const {
      dataReady,
      entities,
      allEntities,
      taxonomies,
      connections,
      connectedTaxonomies,
      location,
      isManager,
      isAnalyst,
      params, // { id: the action type }
      actiontypes,
      actortypes,
      targettypes,
      resourcetypes,
      onSelectType,
    } = this.props;
    const { intl } = this.context;
    const typeId = params.id;
    const type = `actions_${typeId}`;
    const headerOptions = {
      supTitle: intl.formatMessage(messages.pageTitle),
      actions: [],
      info: appMessages.actiontypes_info[typeId]
        && ACTIONTYPE_DISCLAIMERS.indexOf(typeId) > -1
        ? {
          title: 'Please note',
          content: intl.formatMessage(appMessages.actiontypes_info[typeId]),
        }
        : null,
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
    if (isManager) {
      headerOptions.actions.push({
        title: 'Create new',
        onClick: () => this.props.handleNew(typeId),
        icon: 'add',
        isManager,
      });
      headerOptions.actions.push({
        title: intl.formatMessage(appMessages.buttons.import),
        onClick: () => this.props.handleImport(),
        icon: 'import',
        isManager,
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
          allEntityCount={allEntities && allEntities.size}
          taxonomies={taxonomies}
          connections={connections}
          connectedTaxonomies={connectedTaxonomies}
          config={CONFIG}
          headerOptions={headerOptions}
          dataReady={dataReady}
          entityTitle={{
            single: intl.formatMessage(appMessages.entities[type].single),
            plural: intl.formatMessage(appMessages.entities[type].plural),
          }}
          locationQuery={fromJS(location.query)}
          actortypes={actortypes}
          actiontypes={actiontypes}
          targettypes={targettypes}
          resourcetypes={resourcetypes}
          typeOptions={this.prepareTypeOptions(actiontypes, typeId)}
          onSelectType={onSelectType}
          typeId={typeId}
          showCode={checkActionAttribute(typeId, 'code', isManager)}
        />
      </div>
    );
  }
}

ActionList.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  handleNew: PropTypes.func,
  handleImport: PropTypes.func,
  onSelectType: PropTypes.func,
  dataReady: PropTypes.bool,
  isManager: PropTypes.bool,
  entities: PropTypes.instanceOf(List).isRequired,
  taxonomies: PropTypes.instanceOf(Map),
  connectedTaxonomies: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  actortypes: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  targettypes: PropTypes.instanceOf(Map),
  resourcetypes: PropTypes.instanceOf(Map),
  allEntities: PropTypes.instanceOf(Map),
  location: PropTypes.object,
  isAnalyst: PropTypes.bool,
  params: PropTypes.object,
};

ActionList.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  entities: selectViewActions(state, { type: props.params.id }), // type
  taxonomies: selectActiontypeTaxonomiesWithCats(state, { type: props.params.id }),
  connections: selectConnections(state),
  connectedTaxonomies: selectConnectedTaxonomies(state),
  isManager: selectIsUserManager(state),
  isAnalyst: selectIsUserAnalyst(state),
  actiontypes: selectActiontypes(state),
  actortypes: selectActortypesForActiontype(state, { type: props.params.id }),
  targettypes: selectTargettypesForActiontype(state, { type: props.params.id }),
  resourcetypes: selectResourcetypesForActiontype(state, { type: props.params.id }),
  allEntities: selectActiontypeActions(state, { type: props.params.id }),
});
function mapDispatchToProps(dispatch) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    handleNew: (typeId) => {
      dispatch(updatePath(`${ROUTES.ACTIONS}/${typeId}${ROUTES.NEW}`, { replace: true }));
    },
    handleImport: () => {
      dispatch(updatePath(`${ROUTES.ACTIONS}${ROUTES.IMPORT}`));
    },
    onSelectType: (typeId) => {
      dispatch(updatePath(
        typeId && typeId !== ''
          ? `${ROUTES.ACTIONS}/${typeId}`
          : ROUTES.ACTIONS
      ));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActionList);
