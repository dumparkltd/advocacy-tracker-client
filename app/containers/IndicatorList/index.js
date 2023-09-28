/*
 *
 * IndicatorList
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { List, Map, fromJS } from 'immutable';
import { injectIntl, intlShape } from 'react-intl';

import {
  checkIndicatorAttribute,
} from 'utils/entities';
import { keydownHandlerPrint } from 'utils/print';

import { loadEntitiesIfNeeded, updatePath, printView } from 'containers/App/actions';
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

import { PRINT_TYPES } from 'containers/App/constants';
import { CONFIG, DEPENDENCIES } from './constants';
import {
  selectConnections,
  selectListIndicators,
  selectIndicatorsWithConnections,
} from './selectors';

import messages from './messages';

export function IndicatorList({
  onLoadEntitiesIfNeeded,
  onSetPrintView,
  handleNew,
  handleImport,
  dataReady,
  entities,
  allEntities,
  connections,
  location,
  isAdmin,
  isMember,
  isVisitor,
  actiontypes,
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
  });

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
      onClick: () => mySetPrintView(),
      title: 'Print',
      icon: 'print',
    });
  }
  if (isMember) {
    headerOptions.actions.push({
      title: 'Create new',
      onClick: () => handleNew(),
      icon: 'add',
      isMember,
    });
    headerOptions.actions.push({
      title: intl.formatMessage(appMessages.buttons.import),
      onClick: () => handleImport(),
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

IndicatorList.propTypes = {
  onLoadEntitiesIfNeeded: PropTypes.func,
  onSetPrintView: PropTypes.func,
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
  intl: intlShape.isRequired,
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
    onLoadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    handleNew: () => {
      dispatch(updatePath(`${ROUTES.INDICATORS}${ROUTES.NEW}`, { replace: true }));
    },
    handleImport: () => {
      dispatch(updatePath(`${ROUTES.INDICATORS}${ROUTES.IMPORT}`));
    },
    onSetPrintView: (config) => {
      dispatch(printView(config));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(IndicatorList));
