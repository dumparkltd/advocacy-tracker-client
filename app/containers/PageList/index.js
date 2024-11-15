/*
 *
 * PageList
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { Map, List, fromJS } from 'immutable';
import { injectIntl, intlShape } from 'react-intl';

import { loadEntitiesIfNeeded, printView } from 'containers/App/actions';
import {
  selectReady,
  selectPages,
} from 'containers/App/selectors';
import appMessages from 'containers/App/messages';

import EntityList from 'containers/EntityList';

import { PRINT_TYPES } from 'containers/App/constants';
import { keydownHandlerPrint } from 'utils/print';
import { CONFIG, DEPENDENCIES } from './constants';
import { selectListPages } from './selectors';
import messages from './messages';

export function PageList({
  onLoadEntitiesIfNeeded,
  onSetPrintView,
  dataReady,
  location,
  entities,
  allEntities,
  intl,
}) {
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

  const headerOptions = {
    supTitle: intl.formatMessage(messages.pageTitle),
    actions: [],
  };
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
      <EntityList
        entities={entities}
        allEntities={allEntities ? allEntities.toList() : null}
        config={CONFIG}
        headerOptions={headerOptions}
        dataReady={dataReady}
        entityTitle={{
          single: intl.formatMessage(appMessages.entities.pages.single),
          plural: intl.formatMessage(appMessages.entities.pages.plural),
        }}
        locationQuery={fromJS(location.query)}
        skipPreviews
      />
    </div>
  );
}


PageList.propTypes = {
  onLoadEntitiesIfNeeded: PropTypes.func,
  onSetPrintView: PropTypes.func,
  dataReady: PropTypes.bool,
  entities: PropTypes.instanceOf(List).isRequired,
  allEntities: PropTypes.instanceOf(Map),
  location: PropTypes.object,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state, props) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  entities: selectListPages(state, fromJS(props.location.query)),
  allEntities: selectPages(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onSetPrintView: (config) => {
      dispatch(printView(config));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(PageList));
