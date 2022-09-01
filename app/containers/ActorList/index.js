/*
 *
 * ActorList
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { Map, List, fromJS } from 'immutable';
import styled from 'styled-components';

import {
  Box,
  Button,
  Layer,
  Text,
} from 'grommet';

import { MailOption, FormClose } from 'grommet-icons';
import { loadEntitiesIfNeeded, updatePath } from 'containers/App/actions';
import {
  selectReady,
  selectActortypeTaxonomiesWithCats,
  selectIsUserManager,
  selectIsUserAnalyst,
  selectActortypes,
  selectActiontypesForActortype,
  selectActiontypesForTargettype,
  selectMembertypesForActortype,
  selectAssociationtypesForActortype,
  selectActortypeActors,
} from 'containers/App/selectors';

import { checkActionAttribute } from 'utils/entities';
import { qe } from 'utils/quasi-equals';
import appMessages from 'containers/App/messages';
import { ROUTES, ACTORTYPES } from 'themes/config';

import EntityList from 'containers/EntityList';
import EmailHelper from './EmailHelper';

import { CONFIG, DEPENDENCIES } from './constants';
import {
  selectListActors,
  selectConnectedTaxonomies,
  selectConnections,
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

export class ActorList extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.state = {
      emailEntities: null,
    };
  }

  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
    this.setState({ emailEntities: null });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
  }

  onSetEmailEntities = (emailEntities) => {
    this.setState({ emailEntities });
  }

  resetEmails = () => {
    this.setState({ emailEntities: null });
  }

  prepareTypeOptions = (types, activeId) => {
    const { intl } = this.context;
    return types.toList().toJS().map((type) => ({
      value: type.id,
      label: intl.formatMessage(appMessages.actortypes[type.id]),
      active: activeId === type.id,
    }));
  }

  render() {
    const { intl } = this.context;
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
      actiontypesForTarget,
      membertypes,
      associationtypes,
      onSelectType,
    } = this.props;
    const typeId = params.id;
    const type = `actors_${typeId}`;
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
            this.onSetEmailEntities(selectedEntities);
          }
        },
        icon: <MailOption color="dark" size="xxsmall" />,
        type: 'listOption',
        isManager,
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
          actiontypesForTarget={actiontypesForTarget}
          membertypes={membertypes}
          associationtypes={associationtypes}
          typeOptions={this.prepareTypeOptions(actortypes, typeId)}
          onSelectType={onSelectType}
          typeId={typeId}
          showCode={checkActionAttribute(typeId, 'code', isManager)}
          listActions={listActions}
        />
        {this.state.emailEntities && (
          <Layer
            onEsc={this.resetEmails}
            onClickOutside={this.resetEmails}
            margin={{ top: 'large' }}
            position="top"
            animate={false}
          >
            <LayerWrap>
              <LayerHeader flex={{ grow: 0, shrink: 0 }}>
                <Box>
                  <Text weight={600}>Email selected entities</Text>
                </Box>
                <Box flex={{ grow: 0 }}>
                  <Button plain icon={<FormClose size="medium" />} onClick={() => this.resetEmails()} />
                </Box>
              </LayerHeader>
              <LayerContent flex={{ grow: 1 }}>
                <EmailHelper entities={this.state.emailEntities} />
              </LayerContent>
            </LayerWrap>
          </Layer>
        )}
      </div>
    );
  }
}

ActorList.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  handleNew: PropTypes.func,
  handleImport: PropTypes.func,
  onSelectType: PropTypes.func,
  dataReady: PropTypes.bool,
  isManager: PropTypes.bool,
  entities: PropTypes.instanceOf(List).isRequired,
  allEntities: PropTypes.instanceOf(Map),
  taxonomies: PropTypes.instanceOf(Map),
  connectedTaxonomies: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  actortypes: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  actiontypesForTarget: PropTypes.instanceOf(Map),
  membertypes: PropTypes.instanceOf(Map),
  associationtypes: PropTypes.instanceOf(Map),
  location: PropTypes.object,
  isAnalyst: PropTypes.bool,
  params: PropTypes.object,
};

ActorList.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  entities: selectListActors(state, { type: props.params.id }),
  taxonomies: selectActortypeTaxonomiesWithCats(state, { type: props.params.id }),
  connections: selectConnections(state),
  connectedTaxonomies: selectConnectedTaxonomies(state),
  isManager: selectIsUserManager(state),
  isAnalyst: selectIsUserAnalyst(state),
  actiontypes: selectActiontypesForActortype(state, { type: props.params.id }),
  actiontypesForTarget: selectActiontypesForTargettype(state, { type: props.params.id }),
  membertypes: selectMembertypesForActortype(state, { type: props.params.id }),
  associationtypes: selectAssociationtypesForActortype(state, { type: props.params.id }),
  actortypes: selectActortypes(state),
  allEntities: selectActortypeActors(state, { type: props.params.id }),
});

function mapDispatchToProps(dispatch) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    handleNew: (typeId) => {
      dispatch(updatePath(`${ROUTES.ACTORS}/${typeId}${ROUTES.NEW}`, { replace: true }));
    },
    handleImport: () => {
      dispatch(updatePath(`${ROUTES.ACTORS}${ROUTES.IMPORT}`));
    },
    onSelectType: (typeId) => {
      dispatch(updatePath(
        typeId && typeId !== ''
          ? `${ROUTES.ACTORS}/${typeId}`
          : ROUTES.ACTORS
      ));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActorList);
