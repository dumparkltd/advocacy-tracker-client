/*
 *
 * ResourceList
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
  updatePath,
  printView,
} from 'containers/App/actions';
import {
  selectReady,
  selectIsUserMember,
  selectIsUserVisitor,
  selectResourcetypes,
  selectActiontypesForResourcetype,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';
import { ROUTES } from 'themes/config';
import { PRINT_TYPES } from 'containers/App/constants';

import { keydownHandlerPrint } from 'utils/print';

import EntityList from 'containers/EntityList';

import { CONFIG, DEPENDENCIES } from './constants';
import {
  selectListResources,
  selectConnections,
  selectResourcesWithConnections,
} from './selectors';

import messages from './messages';

const prepareTypeOptions = (types, activeId, intl) => types.toList().toJS().map((type) => ({
  value: type.id,
  label: intl.formatMessage(appMessages.resourcetypes[type.id]),
  active: activeId === type.id,
}));

export function ResourceList({
  onLoadEntitiesIfNeeded,
  dataReady,
  entities,
  connections,
  // connectedTaxonomies,
  location,
  isMember,
  isVisitor,
  params, // { id: the action type }
  actiontypes,
  resourcetypes,
  onSelectType,
  handleImport,
  handleNew,
  allEntities,
  onSetPrintView,
  intl,
}) {
  useEffect(() => {
    if (!dataReady) onLoadEntitiesIfNeeded();
  }, [dataReady]);

  const mySetPrintView = () => onSetPrintView({
    printType: PRINT_TYPES.LIST,
    printContentOptions: { pages: true },
    printOrientation: 'portrait',
    printSize: 'A4',
  });
  const keydownHandler = (e) => {
    keydownHandlerPrint(e, mySetPrintView);
  };
  useEffect(() => {
    document.addEventListener('keydown', keydownHandler);
    return () => {
      document.removeEventListener('keydown', keydownHandler);
    };
  }, []);

  const typeId = params.id;
  const type = `resources_${typeId}`;
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
      onClick: () => onSetPrintView({
        printType: PRINT_TYPES.LIST,
        printContentOptions: { pages: true },
        printOrientation: 'portrait',
        printSize: 'A4',
      }),
      title: 'Print',
      icon: 'print',
    });
  }
  if (isMember) {
    headerOptions.actions.push({
      type: 'text',
      title: 'Create new',
      onClick: () => handleNew(typeId),
      icon: 'add',
      isMember,
    });
    headerOptions.actions.push({
      type: 'text',
      title: intl.formatMessage(appMessages.buttons.import),
      onClick: () => handleImport(typeId),
      icon: 'import',
      isMember,
    });
  }

  // connectedTaxonomies={connectedTaxonomies}
  return (
    <div>
      <Helmet
        title={`${intl.formatMessage(messages.pageTitle)}`}
        meta={[
          { name: 'description', content: intl.formatMessage(messages.metaDescription) },
        ]}
      />
      <EntityList
        entities={entities}
        allEntities={allEntities.toList()}
        allEntityCount={allEntities && allEntities.size}
        connections={connections}
        config={CONFIG}
        headerOptions={headerOptions}
        dataReady={dataReady}
        entityTitle={{
          single: intl.formatMessage(appMessages.entities[type].single),
          plural: intl.formatMessage(appMessages.entities[type].plural),
        }}
        locationQuery={fromJS(location.query)}
        resourcetypes={resourcetypes}
        actiontypes={actiontypes}
        typeOptions={prepareTypeOptions(resourcetypes, typeId, intl)}
        onSelectType={onSelectType}
        typeId={typeId}
      />
    </div>
  );
}


ResourceList.propTypes = {
  onLoadEntitiesIfNeeded: PropTypes.func,
  handleNew: PropTypes.func,
  handleImport: PropTypes.func,
  onSelectType: PropTypes.func,
  dataReady: PropTypes.bool,
  isMember: PropTypes.bool,
  entities: PropTypes.instanceOf(List).isRequired,
  // taxonomies: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  resourcetypes: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  location: PropTypes.object,
  isVisitor: PropTypes.bool,
  params: PropTypes.object,
  allEntities: PropTypes.instanceOf(Map),
  onSetPrintView: PropTypes.func,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state, props) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  entities: selectListResources(state, { type: props.params.id }),
  connections: selectConnections(state),
  isMember: selectIsUserMember(state),
  isVisitor: selectIsUserVisitor(state),
  actiontypes: selectActiontypesForResourcetype(state, { type: props.params.id }),
  resourcetypes: selectResourcetypes(state),
  allEntities: selectResourcesWithConnections(state, { type: props.params.id }),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    handleNew: (typeId) => {
      dispatch(updatePath(`${ROUTES.RESOURCES}/${typeId}${ROUTES.NEW}`, { replace: true }));
    },
    handleImport: (typeId) => {
      dispatch(updatePath(`${ROUTES.RESOURCES}/${typeId}${ROUTES.IMPORT}`));
    },
    onSelectType: (typeId) => {
      dispatch(updatePath(
        typeId && typeId !== ''
          ? `${ROUTES.RESOURCES}/${typeId}`
          : ROUTES.RESOURCES
      ));
    },
    onSetPrintView: (config) => {
      dispatch(printView(config));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ResourceList));
