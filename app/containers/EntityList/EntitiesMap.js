/*
 *
 * EntitiesMap
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';

import {
  selectMapIndicator,
} from 'containers/App/selectors';

import EntitiesMapActors from './EntitiesMapActors';
import EntitiesMapActions from './EntitiesMapActions';
// import messages from './messages';

export function EntitiesMap({
  viewOptions,
  config,
  entities,
  actortypes,
  actiontypes,
  typeId,
  mapSubject,
  onSetMapSubject,
  onSetIncludeActorMembers,
  includeActorMembers,
  onEntityClick,
  hasFilters,
  isPrintView,
  filters,
  onClearFilters,
  reducePreviewItem,
}) {
  // actors ===================================================
  if (config.types === 'actortypes') {
    return (
      <EntitiesMapActors
        isPrintView={isPrintView}
        entities={entities}
        actortypes={actortypes}
        actiontypes={actiontypes}
        viewOptions={viewOptions}
        typeId={typeId}
        mapSubject={mapSubject}
        onSetMapSubject={onSetMapSubject}
        onSetIncludeActorMembers={onSetIncludeActorMembers}
        includeActorMembers={includeActorMembers}
        hasFilters={hasFilters}
        onEntityClick={onEntityClick}
        filters={filters}
        onClearFilters={onClearFilters}
        reducePreviewItem={reducePreviewItem}
      />
    );
  }

  // actions ===================================================
  if (config.types === 'actiontypes') {
    return (
      <EntitiesMapActions
        isPrintView={isPrintView}
        entities={entities}
        actortypes={actortypes}
        actiontypes={actiontypes}
        viewOptions={viewOptions}
        typeId={typeId}
        mapSubject={mapSubject}
        onSetMapSubject={onSetMapSubject}
        onSetIncludeActorMembers={onSetIncludeActorMembers}
        includeActorMembers={includeActorMembers}
        hasFilters={hasFilters}
        onEntityClick={onEntityClick}
        filters={filters}
        onClearFilters={onClearFilters}
        // reducePreviewItem={reducePreviewItem}
      />
    );
  }
  return (<div></div>);
}

EntitiesMap.propTypes = {
  config: PropTypes.object,
  entities: PropTypes.instanceOf(List),
  // connections: PropTypes.instanceOf(Map),
  actortypes: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  // object/arrays
  viewOptions: PropTypes.array,
  // primitive
  typeId: PropTypes.string,
  mapSubject: PropTypes.string,
  onSetMapSubject: PropTypes.func,
  onSetIncludeActorMembers: PropTypes.func,
  includeActorMembers: PropTypes.bool,
  hasFilters: PropTypes.bool,
  onEntityClick: PropTypes.func,
  isPrintView: PropTypes.bool,
  filters: PropTypes.array,
  onClearFilters: PropTypes.func,
  reducePreviewItem: PropTypes.func,
};

const mapStateToProps = (state) => ({
  mapIndicator: selectMapIndicator(state),
});


export default connect(mapStateToProps, null)(EntitiesMap);
