/*
 *
 * EntityList
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import { Map, List, fromJS } from 'immutable';

// import { getEntityReference } from 'utils/entities';
import Messages from 'components/Messages';
import Loading from 'components/Loading';

import EntityListHeader from 'components/EntityListHeader';
import EntityListPrintKey from 'components/EntityListPrintKey';
import EntityListMain from 'components/EntityListMain';
import EntitiesMap from 'containers/EntitiesMap';
import PrintOnly from 'components/styled/PrintOnly';

import {
  selectHasUserRole,
  selectCurrentPathname,
  selectAllTaxonomiesWithCategories,
  selectViewQuery,
} from 'containers/App/selectors';

import {
  updatePath,
  openNewEntityModal,
  setView,
} from 'containers/App/actions';

// import appMessages from 'containers/App/messages';
import { PARAMS } from 'containers/App/constants';
import { USER_ROLES } from 'themes/config';

import {
  selectDomain,
  selectProgress,
  selectActivePanel,
  selectSelectedEntities,
  selectProgressTypes,
} from './selectors';

import messages from './messages';

import {
  resetProgress,
  saveMultiple,
  newMultipleConnections,
  deleteMultipleConnections,
  selectEntity,
  selectMultipleEntities,
  updateQuery,
  updateGroup,
  updatePage,
  updatePageItems,
  updateSortBy,
  updateSortOrder,
  setClientPath,
  dismissError,
  dismissAllErrors,
  resetSearchQuery,
} from './actions';

import { currentFilters, currentFilterArgs } from './current-filters';

const Progress = styled.div`
  position: absolute;
  width: 100%;
  display: block;
  background: white;
  bottom: 0;
  box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.2);
  background-color: ${palette('primary', 4)};
  padding: ${(props) => props.error ? 0 : 40}px;
  z-index: 200;
`;

const ProgressText = styled.div`
  font-weight: bold;
  font-size: 1em;
  color: ${palette('primary', 2)};
  margin-bottom: 0.25em;
  margin-top: -0.5em;
  overflow: hidden;
  @media print {
    font-size: ${(props) => props.theme.sizes.print.default};
  }
`;

const STATE_INITIAL = {
  visibleFilters: null,
  visibleEditOptions: null,
};

export class EntityList extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.state = STATE_INITIAL;
  }

  UNSAFE_componentWillMount() {
    this.props.updateClientPath();
  }

  onShowFilters = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({
      visibleFilters: true,
      visibleEditOptions: null,
    });
  };

  onHideFilters = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({ visibleFilters: false });
  };

  onShowEditOptions = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({
      visibleEditOptions: true,
      visibleFilters: null,
    });
  };

  onResetEditOptions = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({
      visibleEditOptions: null,
    });
  };

  onHideEditOptions = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({ visibleEditOptions: false });
  };

  onClearFilters = () => {
    this.props.onResetFilters(currentFilterArgs(
      this.props.config,
      this.props.locationQuery,
    ));
    this.props.onDismissAllErrors();
  }

  getMessageForType = (type) => {
    switch (type) {
      case 'new':
        return messages.createSuccess;
      case 'delete':
        return messages.deleteSuccess;
      default:
        return messages.updatesSuccess;
    }
  }

  mapError = (error, key) => fromJS({
    type: error.data.type,
    error: error.error,
    key,
  });

  mapErrors = (errors) => errors.reduce((errorMap, error, key) => {
    const entityId = error.data.saveRef;
    return errorMap.has(entityId) // check if error already present for entity
      ? errorMap.set(entityId, errorMap.get(entityId).push(this.mapError(error, key)))
      : errorMap.set(entityId, List().push(this.mapError(error, key)));
  }, Map());

  filterByError = (entities, errors) => entities.filter((entity) => errors.has(entity.get('id')));

  render() {
    const { intl } = this.context;
    // make sure selected entities are still actually on page
    const {
      entityIdsSelected,
      progress,
      viewDomain,
      canEdit,
      progressTypes,
      allTaxonomies,
      config,
      locationQuery,
      connections,
      onTagClick,
      actortypes,
      actiontypes,
      typeOptions,
      onSelectType,
      onSetView,
      typeId,
      view,
      onEntitySelectAll,
      dataReady,
      resourcetypes,
      showCode,
    } = this.props;

    // detect print to avoid expensive rendering
    const printing = !!(
      typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('print').matches
    );

    const sending = viewDomain.get('sending');
    const success = viewDomain.get('success');
    const errors = viewDomain.get('errors').size > 0 ? this.mapErrors(viewDomain.get('errors')) : Map();

    const entities = (dataReady && errors.size > 0)
      ? this.filterByError(this.props.entities, errors)
      : this.props.entities;

    const entityIdsSelectedFiltered = entityIdsSelected.size > 0 && entities
      ? entityIdsSelected.filter((id) => entities.map((entity) => entity.get('id')).includes(id))
      : entityIdsSelected;
    const isManager = canEdit && this.props.hasUserRole[USER_ROLES.MANAGER.value];

    const filters = currentFilters(
      {
        config,
        entities,
        taxonomies: allTaxonomies,
        connections,
        locationQuery,
        onTagClick,
        errors,
        actortypes,
        intl,
      },
      intl.formatMessage(messages.filterFormWithoutPrefix),
      intl.formatMessage(messages.filterFormError),
    );

    const hasList = config.views && config.views.list;
    const hasMap = typeId
      && config.views
      && config.views.map
      && config.views.map.types
      && config.views.map.types.indexOf(typeId) > -1;
    const showList = !hasMap || (hasList && view === 'list');
    const showMap = hasMap && view === 'map';

    let viewOptions;
    if (hasList && hasMap) {
      viewOptions = [
        {
          type: 'primary',
          title: 'List',
          onClick: () => onSetView('list'),
          active: showList,
          disabled: showList,
        },
        {
          type: 'primary',
          title: 'Map',
          onClick: () => onSetView('map'),
          active: showMap,
          disabled: showMap,
        },
      ];
    }
    return (
      <div>
        {this.props.includeHeader && !printing && (
          <EntityListHeader
            typeId={typeId}
            dataReady={dataReady}
            currentFilters={filters}
            onClearFilters={this.onClearFilters}
            listUpdating={progress !== null && progress >= 0 && progress < 100}
            entities={entities}
            entityIdsSelected={entityIdsSelected}
            taxonomies={this.props.taxonomies}
            actortypes={actortypes}
            resourcetypes={resourcetypes}
            actiontypes={actiontypes}
            targettypes={this.props.targettypes}
            actiontypesForTarget={this.props.actiontypesForTarget}
            membertypes={this.props.membertypes}
            connections={connections}
            associationtypes={this.props.associationtypes}
            connectedTaxonomies={this.props.connectedTaxonomies}
            config={config}
            locationQuery={locationQuery}
            canEdit={isManager && showList}
            isManager={isManager}
            hasUserRole={this.props.hasUserRole}
            onCreateOption={this.props.onCreateOption}
            onUpdate={
              (associations, activeEditOption) => this.props.handleEditSubmit(
                associations,
                activeEditOption,
                this.props.entityIdsSelected,
                viewDomain.get('errors'),
              )}
            showFilters={this.state.visibleFilters}
            showEditOptions={isManager && showList && this.state.visibleEditOptions}
            onShowFilters={this.onShowFilters}
            onHideFilters={this.onHideFilters}
            onHideEditOptions={this.onHideEditOptions}
            onShowEditOptions={this.onShowEditOptions}
            onSelectType={(type) => {
              // reset selection
              onEntitySelectAll([]);
              onSelectType(type);
            }}
            typeOptions={typeOptions}
            hasFilters={filters && filters.length > 0}
          />
        )}
        {showList && (
          <EntityListMain
            onClearFilters={() => {
              this.props.onSearch('');
              if (!this.props.includeHeader) {
                this.onClearFilters();
              }
            }}
            viewOptions={viewOptions}
            hasHeader={this.props.includeHeader}
            listUpdating={progress !== null && progress >= 0 && progress < 100}
            entities={entities}
            errors={errors}
            taxonomies={this.props.taxonomies}
            actortypes={this.props.actortypes}
            actiontypes={this.props.actiontypes}
            resourcetypes={this.props.resourcetypes}
            connections={this.props.connections}
            connectedTaxonomies={this.props.connectedTaxonomies}
            entityIdsSelected={entityIdsSelectedFiltered}
            locationQuery={locationQuery}

            config={config}
            header={this.props.header}
            entityTitle={this.props.entityTitle}

            dataReady={dataReady}
            isManager={isManager}
            isAnalyst={this.props.hasUserRole[USER_ROLES.ANALYST.value]}

            onEntitySelect={(id, checked) => {
              // show options when selected and not hidden
              if (checked && this.state.visibleEditOptions !== false) {
                this.onShowEditOptions();
              }
              // reset when unchecking last selected item
              if (!checked && !this.state.visibleEditOptions && entityIdsSelected.size === 1) {
                this.onResetEditOptions();
              }
              this.props.onEntitySelect(id, checked);
            }}
            onEntitySelectAll={(ids) => {
              // show options when selected and not hidden
              if (this.state.visibleEditOptions !== false && ids && ids.length > 0) {
                this.onShowEditOptions();
              }
              // reset when unchecking last selected item
              if (!this.state.visibleEditOptions && (!ids || ids.length === 0)) {
                this.onResetEditOptions();
              }
              onEntitySelectAll(ids);
            }}
            onGroupSelect={this.props.onGroupSelect}
            onSubgroupSelect={this.props.onSubgroupSelect}
            onSearch={this.props.onSearch}
            onPageSelect={this.props.onPageSelect}
            onPageItemsSelect={this.props.onPageItemsSelect}
            onEntityClick={(id, path) => this.props.onEntityClick(
              id, path, viewDomain.get('errors')
            )}
            onSortBy={this.props.onSortBy}
            onSortOrder={this.props.onSortOrder}
            onDismissError={this.props.onDismissError}
            typeId={typeId}
            hasFilters={filters && filters.length > 0}
            showCode={showCode}
          />
        )}
        {showMap && (
          <EntitiesMap
            viewOptions={viewOptions}
            entities={entities}
            taxonomies={this.props.taxonomies}
            actortypes={this.props.actortypes}
            actiontypes={this.props.actiontypes}
            targettypes={this.props.targettypes}
            connections={this.props.connections}
            connectedTaxonomies={this.props.connectedTaxonomies}
            locationQuery={locationQuery}
            config={config}
            dataReady={dataReady}
            onEntityClick={(id, path) => this.props.onEntityClick(
              id, path, viewDomain.get('errors')
            )}
            typeId={typeId}
            hasFilters={filters && filters.length > 0}
          />
        )}
        {hasList && dataReady && config.taxonomies && (
          <PrintOnly>
            <EntityListPrintKey
              entities={entities}
              taxonomies={this.props.taxonomies}
              config={config}
              locationQuery={locationQuery}
            />
          </PrintOnly>
        )}
        {isManager && (progress !== null && progress < 100) && (
          <Progress>
            <ProgressText>
              <FormattedMessage
                {...messages.processingUpdates}
                values={{
                  processNo: Math.min(success.size + errors.size + 1, sending.size),
                  totalNo: sending.size,
                  types:
                  intl.formatMessage(messages[
                    `type_${progressTypes.size === 1 ? progressTypes.first() : 'save'}`
                  ]),
                }}
              />
            </ProgressText>
            <Loading
              progress={progress}
            />
          </Progress>
        )}
        {isManager && (viewDomain.get('errors').size > 0 && progress >= 100) && (
          <Progress error>
            <Messages
              type="error"
              message={
                intl.formatMessage(
                  messages.updatesFailed,
                  {
                    errorNo: viewDomain.get('errors').size,
                    types:
                    intl.formatMessage(messages[
                      `type_${progressTypes.size === 1 ? progressTypes.first() : 'save'}`
                    ]),
                  },
                )
              }
              onDismiss={this.props.resetProgress}
              preMessage={false}
            />
          </Progress>
        )}
        {isManager && (viewDomain.get('errors').size === 0 && progress >= 100) && (
          <Progress error>
            <Messages
              type="success"
              message={
                intl.formatMessage(
                  this.getMessageForType(
                    progressTypes.size === 1 ? progressTypes.first() : 'save',
                    viewDomain.get('success').size,
                  ),
                  {
                    successNo: viewDomain.get('success').size,
                  },
                )
              }
              onDismiss={this.props.resetProgress}
              autoDismiss={2000}
            />
          </Progress>
        )}
      </div>
    );
  }
}

EntityList.defaultProps = {
  includeHeader: true,
  canEdit: true,
};

EntityList.propTypes = {
  // wrapper props
  entities: PropTypes.instanceOf(List).isRequired,
  taxonomies: PropTypes.instanceOf(Map),
  allTaxonomies: PropTypes.instanceOf(Map),
  actortypes: PropTypes.instanceOf(Map),
  resourcetypes: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  targettypes: PropTypes.instanceOf(Map),
  actiontypesForTarget: PropTypes.instanceOf(Map),
  membertypes: PropTypes.instanceOf(Map),
  associationtypes: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  connectedTaxonomies: PropTypes.instanceOf(Map),
  config: PropTypes.object,
  dataReady: PropTypes.bool,
  header: PropTypes.object,
  locationQuery: PropTypes.instanceOf(Map),
  entityTitle: PropTypes.object, // single/plural
  entityIcon: PropTypes.func,
  // selector props
  activePanel: PropTypes.string,
  hasUserRole: PropTypes.object, // { 1: isAdmin, 2: isManager, 3: isAnalyst}
  entityIdsSelected: PropTypes.object,
  viewDomain: PropTypes.object,
  progress: PropTypes.number,
  typeId: PropTypes.string,
  progressTypes: PropTypes.instanceOf(List),
  // dispatch props
  handleEditSubmit: PropTypes.func.isRequired,
  onEntitySelect: PropTypes.func.isRequired,
  onEntitySelectAll: PropTypes.func.isRequired,
  onTagClick: PropTypes.func.isRequired,
  onGroupSelect: PropTypes.func.isRequired,
  onSubgroupSelect: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired,
  onPageSelect: PropTypes.func.isRequired,
  onPageItemsSelect: PropTypes.func.isRequired,
  onEntityClick: PropTypes.func.isRequired,
  resetProgress: PropTypes.func.isRequired,
  updateClientPath: PropTypes.func.isRequired,
  onSortBy: PropTypes.func.isRequired,
  onSortOrder: PropTypes.func.isRequired,
  onCreateOption: PropTypes.func.isRequired,
  onDismissError: PropTypes.func.isRequired,
  onDismissAllErrors: PropTypes.func.isRequired,
  canEdit: PropTypes.bool,
  includeHeader: PropTypes.bool,
  showCode: PropTypes.bool,
  typeOptions: PropTypes.array,
  onSelectType: PropTypes.func,
  onSetView: PropTypes.func,
  view: PropTypes.string,
};

EntityList.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  hasUserRole: selectHasUserRole(state),
  activePanel: selectActivePanel(state),
  entityIdsSelected: selectSelectedEntities(state),
  viewDomain: selectDomain(state),
  progress: selectProgress(state),
  progressTypes: selectProgressTypes(state),
  currentPath: selectCurrentPathname(state),
  allTaxonomies: selectAllTaxonomiesWithCategories(state),
  view: selectViewQuery(state),
});

function mapDispatchToProps(dispatch, props) {
  return {
    onDismissError: (key) => {
      dispatch(resetProgress());
      dispatch(dismissError(key));
    },
    onDismissAllErrors: () => {
      dispatch(resetProgress());
      dispatch(dismissAllErrors());
    },
    resetProgress: () => {
      dispatch(resetProgress());
    },
    updateClientPath: () => {
      dispatch(setClientPath(props.config.clientPath));
    },
    onEntitySelect: (id, checked) => {
      dispatch(selectEntity({ id, checked }));
    },
    onEntityClick: (id, path, errors) => {
      if (errors && errors.size) {
        dispatch(resetProgress());
        errors.forEach((error, key) => {
          if (error.data.saveRef === id) {
            dispatch(dismissError(key));
          }
        });
      }
      dispatch(updatePath(`${path || props.config.clientPath}/${id}`));
    },
    onEntitySelectAll: (ids) => {
      dispatch(selectMultipleEntities(ids));
    },
    onTagClick: (value) => {
      dispatch(updateQuery(fromJS([value])));
    },
    onSearch: (value) => {
      dispatch(updateQuery(fromJS([
        {
          query: 'search',
          value,
          replace: true,
          checked: value !== '',
        },
      ])));
    },
    onResetFilters: (values) => {
      dispatch(resetSearchQuery(values));
    },
    onGroupSelect: (value) => {
      dispatch(updateGroup(fromJS([
        {
          query: 'group',
          value,
        },
      ])));
      if (value === PARAMS.GROUP_RESET) {
        dispatch(updateGroup(fromJS([
          {
            query: 'subgroup',
            value,
          },
        ])));
      }
    },
    onSubgroupSelect: (value) => {
      dispatch(updateGroup(fromJS([
        {
          query: 'subgroup',
          value,
        },
      ])));
    },
    onPageSelect: (page) => {
      dispatch(updatePage(page));
    },
    onPageItemsSelect: (no) => {
      dispatch(updatePageItems(no));
    },
    onSortOrder: (order) => {
      dispatch(updateSortOrder(order));
    },
    onSortBy: (sort) => {
      dispatch(updateSortBy(sort));
    },
    onCreateOption: (args) => {
      dispatch(openNewEntityModal(args));
    },
    onSetView: (view) => {
      dispatch(setView(view));
    },
    handleEditSubmit: (formData, activeEditOption, entityIdsSelected, errors) => {
      dispatch(resetProgress());

      const entities = props.entities.filter(
        (entity) => entityIdsSelected.includes(entity.get('id'))
      );

      // figure out changes
      const changes = formData.get('values').filter((option) => option.get('hasChanged'));
      // figure out updates (either new attribute values or new connections)
      const creates = changes
        .filter((option) => option.get('checked') === true)
        .map((option) => option.get('value'));

      // attributes
      if (activeEditOption.group === 'attributes') {
        if (creates.size > 0) {
          // take the first
          // TODO multiselect should be run in single value mode and only return 1 value
          const newValue = creates.first();
          entities.forEach((entity) => {
            // not exactly sure what is happening here?
            if (errors && errors.size) {
              errors.forEach((error, key) => {
                if (error.data.saveRef === entity.get('id')) {
                  dispatch(dismissError(key));
                }
              });
            }
          });
          dispatch(saveMultiple(
            props.config.serverPath,
            entities.filter(
              (entity) => entity.getIn(['attributes', activeEditOption.optionId]) !== newValue
            ).map(
              (entity) => Map()
                .set('path', props.config.serverPath)
                .set('entity', entity.setIn(['attributes', activeEditOption.optionId], newValue))
                .set('saveRef', entity.get('id'))
            ).toJS()
          ));
        }
      // connections
      } else {
        // figure out connection deletions (not necessary for attributes as deletions will be overridden)
        const deletes = changes
          .filter((option) => option.get('checked') === false)
          .map((option) => option.get('value'));

        entities.forEach(
          (entity) => {
            if (errors && errors.size) {
              errors.forEach((error, key) => {
                if (error.data.saveRef === entity.get('id')) {
                  dispatch(dismissError(key));
                }
              });
            }
          }
        );
        const updates = entities.reduce(
          (memo, entity) => {
            let entityCreates = List();
            let entityDeletes = List();
            let existingAssignments;
            switch (activeEditOption.group) {
              case ('taxonomies'):
                existingAssignments = entity.get('categories');
                break;
              case ('actions'):
              case ('actors'):
              case ('targets'):
              case ('members'):
              case ('associations'):
              case ('resources'):
              case ('indicators'):
                existingAssignments = entity.get(activeEditOption.connection);
                break;
              default:
                existingAssignments = List();
                break;
            }
            // create connections
            if (creates.size > 0) {
              // exclude existing relations from the changeSet
              entityCreates = !!existingAssignments && existingAssignments.size > 0
                ? creates.filter(
                  (id) => !existingAssignments.includes(parseInt(id, 10))
                )
                : creates;
              entityCreates = entityCreates.map(
                (id) => fromJS({
                  path: activeEditOption.path,
                  entity: {
                    attributes: {
                      [activeEditOption.ownKey]: entity.get('id'),
                      [activeEditOption.key]: id,
                    },
                  },
                  saveRef: entity.get('id'),
                })
              );
            }
            // delete connections
            if (
              deletes.size > 0
              && !!existingAssignments
              && existingAssignments.size > 0
            ) {
              entityDeletes = existingAssignments.filter(
                (assigned) => deletes.includes(assigned.toString())
              ).map(
                (assigned, id) => fromJS({
                  path: activeEditOption.path,
                  id,
                  saveRef: entity.get('id'),
                })
              ).toList();
            }
            return memo
              .set('creates', memo.get('creates').concat(entityCreates))
              .set('deletes', memo.get('deletes').concat(entityDeletes));
          },
          Map().set('creates', List()).set('deletes', List()),
        ); // reduce entities
        // associations
        if (updates.get('creates') && updates.get('creates').size > 0) {
          dispatch(newMultipleConnections(
            activeEditOption.path,
            updates.get('creates').toJS(),
          ));
        }
        if (updates.get('deletes') && updates.get('deletes').size > 0) {
          dispatch(deleteMultipleConnections(
            activeEditOption.path,
            updates.get('deletes').toJS(),
          ));
        }
        // entityCreates.forEach((id) => dispatch(newConnection({
        //   path: activeEditOption.path,
        //   entity: {
        //     attributes: {
        //       [activeEditOption.ownKey]: entity.get('id'),
        //       [activeEditOption.key]: id,
        //     },
        //   },
        //   saveRef: entity.get('id'),
        // })));
        // existingAssignments
        //   .forEach((assigned, id) => dispatch(deleteConnection({
        //     path: activeEditOption.path,
        //     id,
        //     saveRef: entity.get('id'),
        //   })));
      }
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EntityList);
