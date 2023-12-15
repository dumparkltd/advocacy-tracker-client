/*
 *
 * ActorList
 *
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { Map, List, fromJS } from 'immutable';
import { injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';

import {
  Box,
  Button,
  Layer,
  Text,
} from 'grommet';

import { MailOption, FormClose } from 'grommet-icons';
import { loadEntitiesIfNeeded, updatePath, printView } from 'containers/App/actions';
import {
  selectReady,
  selectActortypeTaxonomiesWithCats,
  selectIsUserMember,
  selectIsUserVisitor,
  selectIsUserAdmin,
  selectActortypes,
  selectActiontypesForActortype,
  selectActiontypesForTargettype,
  selectMembertypesForActortype,
  selectAssociationtypesForActortype,
  selectParentAssociationtypesForActortype,
  selectViewQuery,
} from 'containers/App/selectors';

import { checkActorAttribute } from 'utils/entities';
import { keydownHandlerPrint } from 'utils/print';
import { qe } from 'utils/quasi-equals';
import appMessages from 'containers/App/messages';
import { ROUTES, ACTORTYPES } from 'themes/config';


import EntityList from 'containers/EntityList';
import { PRINT_TYPES } from 'containers/App/constants';
import EmailHelper from './EmailHelper';

import { CONFIG, DEPENDENCIES } from './constants';
import {
  selectListActors,
  selectConnections,
  selectActorsWithConnections,
} from './selectors';

import messages from './messages';

const LayerWrap = styled((p) => (
  <Box
    background="white"
    {...p}
  />
))`
width: 800px;
max-width: 100%;
min-height: 200px;
overflow-y: auto;
`;
const LayerHeader = styled((p) => (
  <Box
    direction="row"
    pad={{ left: 'medium', right: 'small', vertical: 'small' }}
    background="light-2"
    align="center"
    gap="small"
    justify="between"
    {...p}
  />
))``;

const LayerContent = styled((p) => (
  <Box
    pad={{ horizontal: 'medium', vertical: 'medium' }}
    background="white"
    {...p}
  />
))``;

const prepareTypeOptions = (
  types,
  activeId,
  intl,
) => types.toList().toJS().map(
  (type) => ({
    value: type.id,
    label: intl.formatMessage(appMessages.actortypes[type.id]),
    active: activeId === type.id,
  })
);

const VALID_VIEWS = ['map', 'list'];
const getView = ({
  view,
  hasMapOption,
}) => {
  // return default view if view unset, invalid or inconsistent
  if (
    !view
    || VALID_VIEWS.indexOf(view) === -1
    || (view === 'map' && !hasMapOption)
  ) {
    if (hasMapOption) {
      return 'map';
    }
    return 'list';
  }
  return view;
};
export function ActorList({
  dataReady,
  onLoadEntitiesIfNeeded,
  entities,
  allEntities,
  taxonomies,
  connections,
  location,
  isAdmin,
  isMember,
  isVisitor,
  params, // { id: the action type }
  actiontypes,
  actortypes,
  actiontypesForTarget,
  membertypes,
  parentAssociationtypes,
  associationtypes,
  onSelectType,
  handleNew,
  handleImport,
  onSetPrintView,
  view,
  intl,
}) {
  useEffect(() => {
    if (!dataReady) onLoadEntitiesIfNeeded();
  }, [dataReady]);

  const [emailEntities, onSetEmailEntities] = useState(null);
  const resetEmails = () => onSetEmailEntities(null);

  const typeId = params.id;
  const type = `actors_${typeId}`;
  const hasList = CONFIG.views && !!CONFIG.views.list;
  const hasMapOption = typeId
    && CONFIG.views
    && CONFIG.views.map
    && CONFIG.views.map.types
    && CONFIG.views.map.types.indexOf(typeId) > -1;

  const cleanView = getView({
    view,
    hasMapOption,
    hasList,
  });
  const showMap = cleanView === 'map';
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
  }, []);

  const headerOptions = {
    supTitle: intl.formatMessage(messages.pageTitle),
    actions: [],
    info: appMessages.actortypes_info[typeId]
      && intl.formatMessage(appMessages.actiontypes_info[typeId]).trim() !== ''
      ? {
        title: 'Please note',
        content: intl.formatMessage(appMessages.actortypes_info[typeId]),
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
      onClick: mySetPrintView,
      title: 'Print',
      icon: 'print',
    });
  }
  if (isMember) {
    headerOptions.actions.push({
      title: 'Create new',
      onClick: () => handleNew(typeId),
      icon: 'add',
      isMember,
    });
    headerOptions.actions.push({
      title: intl.formatMessage(appMessages.buttons.import),
      onClick: () => handleImport(typeId),
      icon: 'import',
      isMember,
    });
  }
  const listActions = [];
  if (qe(typeId, ACTORTYPES.CONTACT)) {
    // console.log(noGroupEmails)
    listActions.push({
      title: 'Email selected',
      onClick: (args) => {
        if (args && args.ids) {
          const selectedEntities = entities.filter(
            (entity) => args.ids.includes(entity.get('id'))
          );
          onSetEmailEntities(selectedEntities);
        }
      },
      icon: <MailOption color="dark" size="xxsmall" />,
      type: 'listOption',
      isMember,
    });
  }

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
        actiontypes={actiontypes}
        actiontypesForTarget={actiontypesForTarget}
        membertypes={membertypes}
        parentAssociationtypes={parentAssociationtypes}
        associationtypes={associationtypes}
        typeOptions={prepareTypeOptions(
          actortypes,
          typeId,
          intl,
        )}
        onSelectType={onSelectType}
        typeId={typeId}
        showCode={checkActorAttribute(typeId, 'code', isAdmin)}
        listActions={listActions}
      />
      {emailEntities && (
        <Layer
          onEsc={resetEmails}
          onClickOutside={resetEmails}
          margin={{ top: 'large' }}
          position="top"
          animate={false}
        >
          <LayerWrap>
            <LayerHeader flex={{ grow: 0, shrink: 0 }}>
              <Box>
                <Text weight={600}>{`Email ${emailEntities.size} selected contacts`}</Text>
              </Box>
              <Box flex={{ grow: 0 }}>
                <Button plain icon={<FormClose size="medium" />} onClick={() => resetEmails()} />
              </Box>
            </LayerHeader>
            <LayerContent flex={{ grow: 1 }}>
              <EmailHelper entities={emailEntities} />
            </LayerContent>
          </LayerWrap>
        </Layer>
      )}
    </div>
  );
}


ActorList.propTypes = {
  onLoadEntitiesIfNeeded: PropTypes.func,
  handleNew: PropTypes.func,
  handleImport: PropTypes.func,
  onSelectType: PropTypes.func,
  dataReady: PropTypes.bool,
  isMember: PropTypes.bool,
  isAdmin: PropTypes.bool,
  isVisitor: PropTypes.bool,
  view: PropTypes.string,
  entities: PropTypes.instanceOf(List).isRequired,
  allEntities: PropTypes.instanceOf(Map),
  taxonomies: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  actortypes: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  actiontypesForTarget: PropTypes.instanceOf(Map),
  membertypes: PropTypes.instanceOf(Map),
  parentAssociationtypes: PropTypes.instanceOf(Map),
  associationtypes: PropTypes.instanceOf(Map),
  location: PropTypes.object,
  params: PropTypes.object,
  onSetPrintView: PropTypes.func,
  intl: intlShape,
};

const mapStateToProps = (state, props) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  entities: selectListActors(state, { type: props.params.id }),
  taxonomies: selectActortypeTaxonomiesWithCats(state, { type: props.params.id }),
  connections: selectConnections(state),
  isMember: selectIsUserMember(state),
  isVisitor: selectIsUserVisitor(state),
  isAdmin: selectIsUserAdmin(state),
  actiontypes: selectActiontypesForActortype(state, { type: props.params.id }),
  actiontypesForTarget: selectActiontypesForTargettype(state, { type: props.params.id }),
  membertypes: selectMembertypesForActortype(state, { type: props.params.id }),
  parentAssociationtypes: selectParentAssociationtypesForActortype(state, { type: props.params.id }),
  associationtypes: selectAssociationtypesForActortype(state, { type: props.params.id }),
  actortypes: selectActortypes(state),
  allEntities: selectActorsWithConnections(state, { type: props.params.id }),
  view: selectViewQuery(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    handleNew: (typeId) => {
      dispatch(updatePath(`${ROUTES.ACTORS}/${typeId}${ROUTES.NEW}`, { replace: true }));
    },
    handleImport: (typeId) => {
      dispatch(updatePath(`${ROUTES.ACTORS}/${typeId}${ROUTES.IMPORT}`));
    },
    onSelectType: (typeId) => {
      dispatch(updatePath(
        typeId && typeId !== ''
          ? `${ROUTES.ACTORS}/${typeId}`
          : ROUTES.ACTORS
      ));
    },
    onSetPrintView: (config) => {
      dispatch(printView(config));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ActorList));
