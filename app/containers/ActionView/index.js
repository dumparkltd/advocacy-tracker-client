/*
 *
 * ActionView
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Box, Text, Button } from 'grommet';
import styled from 'styled-components';

import {
  getTitleField,
  getStatusField,
  getStatusFieldIf,
  getMetaField,
  getMarkdownField,
  getDateField,
  getTextField,
  getReferenceField,
  getLinkField,
  getTaxonomyFields,
  hasTaxonomyCategories,
  getActorConnectionField,
  getActionConnectionField,
  getResourceConnectionField,
  getIndicatorConnectionField,
  getUserConnectionField,
} from 'utils/fields';

import qe from 'utils/quasi-equals';
import {
  getEntityTitleTruncated,
  checkActionAttribute,
} from 'utils/entities';

import {
  loadEntitiesIfNeeded,
  updatePath,
  closeEntity,
  setSubject,
  openNewEntityModal,
  setActiontype,
} from 'containers/App/actions';

import {
  // ROUTES, ACTIONTYPES, ACTORTYPES_CONFIG, ACTORTYPES, RESOURCE_FIELDS,
  ROUTES,
  ACTIONTYPES,
  ACTORTYPES,
  ACTORTYPES_CONFIG,
  ACTIONTYPE_TARGETTYPES,
  ACTIONTYPE_ACTORTYPES,
  ACTIONTYPE_ACTIONTYPES,
  INDICATOR_ACTIONTYPES,
  ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS,
} from 'themes/config';

import Loading from 'components/Loading';
import Content from 'components/Content';
import ViewHeader from 'components/EntityView/ViewHeader';
import Main from 'components/EntityView/Main';
import Aside from 'components/EntityView/Aside';
import ViewWrapper from 'components/EntityView/ViewWrapper';
import ViewPanel from 'components/EntityView/ViewPanel';
import ViewPanelInside from 'components/EntityView/ViewPanelInside';
import FieldGroup from 'components/fields/FieldGroup';

import {
  selectReady,
  selectIsUserManager,
  selectIsUserAdmin,
  selectActorConnections,
  selectResourceConnections,
  // selectIndicatorConnections,
  selectActionConnections,
  selectTaxonomiesWithCategories,
  selectSubjectQuery,
  selectActiontypes,
  selectUserConnections,
  selectActiontypeQuery,
  selectSessionUserId,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';
import messages from './messages';

import ActionMap from './ActionMap';
import Activities from './Activities';

import {
  selectViewEntity,
  selectViewTaxonomies,
  selectActorsByType,
  selectTargetsByType,
  selectResourcesByType,
  selectTopActionsByActiontype,
  selectSubActionsByActiontype,
  selectEntityIndicators,
  selectEntityUsers,
} from './selectors';

import { DEPENDENCIES } from './constants';

const SubjectButton = styled((p) => <Button plain {...p} />)`
  padding: 2px 4px;
  border-bottom: 2px solid;
  border-bottom-color: ${({ active }) => active ? 'brand' : 'transparent'};
  background: none;
`;

const getActortypeColumns = (typeid) => {
  let columns = [{
    id: 'main',
    type: 'main',
    sort: 'title',
    attributes: ['code', 'title'],
  }];
  if (
    ACTORTYPES_CONFIG[parseInt(typeid, 10)]
    && ACTORTYPES_CONFIG[parseInt(typeid, 10)].columns
  ) {
    columns = [
      ...columns,
      ...ACTORTYPES_CONFIG[parseInt(typeid, 10)].columns,
    ];
  }
  return qe(typeid, ACTORTYPES.REG)
    ? columns
    : [
      ...columns,
      {
        id: 'actions', // one row per type,
        type: 'actionsSimple', // one row per type,
        subject: 'actors', // one row per type,
      },
    ];
  // {
  //   id: 'targets', // one row per type,
  //   type: 'actionsSimple', // one row per type,
  //   subject: 'targets', // one row per type,
  //   actions: 'targetingActions'
  // },
};

const getIndicatorColumns = (viewEntity, intl) => {
  let columns = [{
    id: 'main',
    type: 'main',
    sort: 'title',
    attributes: ['code', 'title'],
  }];
  if (
    ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS[viewEntity.getIn(['attributes', 'measuretype_id'])]
    && ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS[viewEntity.getIn(['attributes', 'measuretype_id'])].length > 0
  ) {
    columns = [
      ...columns,
      {
        id: 'supportlevel_id',
        type: 'supportlevel',
        actionId: viewEntity.get('id'),
        title: intl.formatMessage(appMessages.attributes.supportlevel_id),
      },
    ];
  }
  return columns;
};

export function ActionView(props) {
  const {
    viewEntity,
    dataReady,
    isManager,
    taxonomies,
    viewTaxonomies,
    actorsByActortype,
    targetsByActortype,
    resourcesByResourcetype,
    indicators,
    onEntityClick,
    actorConnections,
    resourceConnections,
    // indicatorConnections,
    actionConnections,
    subActionsByType,
    topActionsByType,
    onLoadData,
    subject,
    onSetSubject,
    intl,
    handleEdit,
    handleClose,
    params,
    // activitytypes,
    handleTypeClick,
    users,
    userConnections,
    viewActiontypeId,
    onSetActiontype,
    onCreateOption,
    actiontypes,
    isAdmin,
    myId,
  } = props;

  useEffect(() => {
    // kick off loading of data
    onLoadData();
  }, []);

  const typeId = viewEntity && viewEntity.getIn(['attributes', 'measuretype_id']);
  // const viewActivitytype = activitytypes && activitytypes.find((type) => qe(type.get('id'), typeId));

  let buttons = [];
  if (dataReady) {
    buttons = [
      ...buttons,
      {
        type: 'icon',
        onClick: () => window.print(),
        title: 'Print',
        icon: 'print',
      },
    ];
    if (isManager) {
      buttons = [
        ...buttons,
        {
          type: 'edit',
          onClick: handleEdit,
        },
      ];
    }
  }
  const pageTitle = typeId
    ? intl.formatMessage(appMessages.entities[`actions_${typeId}`].single)
    : intl.formatMessage(appMessages.entities.actions.single);

  const metaTitle = viewEntity
    ? `${pageTitle}: ${getEntityTitleTruncated(viewEntity)}`
    : `${pageTitle}: ${params.id}`;

  const hasTarget = ACTIONTYPE_TARGETTYPES[typeId] && ACTIONTYPE_TARGETTYPES[typeId].length > 0;
  const hasActor = ACTIONTYPE_ACTORTYPES[typeId] && ACTIONTYPE_ACTORTYPES[typeId].length > 0;
  const childActiontypeIds = typeId
    ? Object.keys(ACTIONTYPE_ACTIONTYPES).reduce(
      (memo, childTypeId) => {
        const parents = ACTIONTYPE_ACTIONTYPES[childTypeId];
        const isParent = parents.indexOf(typeId.toString()) > -1;
        return isParent ? [...memo, childTypeId] : memo;
      },
      [],
    )
    : [];
  const hasChildren = childActiontypeIds && childActiontypeIds.length > 0;

  const hasMemberOption = !!typeId && !qe(typeId, ACTIONTYPES.NATL);
  const hasMap = true;
  const hasIndicators = typeId && INDICATOR_ACTIONTYPES.indexOf(typeId.toString()) > -1;

  let viewSubject = subject || 'actors';
  const validViewSubjects = [];
  if (hasChildren) {
    validViewSubjects.push('children');
  }
  if (hasTarget) {
    validViewSubjects.push('targets');
  }
  if (hasActor) {
    validViewSubjects.push('actors');
  }
  if (validViewSubjects.indexOf(viewSubject) === -1) {
    viewSubject = validViewSubjects.length > 0 ? validViewSubjects[0] : null;
  }

  const actortypesForSubject = viewSubject === 'actors'
    ? actorsByActortype
    : targetsByActortype;

  // check date comment for date spceficity
  // const DATE_SPECIFICITIES = ['y', 'm', 'd'];
  const dateSpecificity = 'd';
  // if (
  //   viewEntity
  //   && viewEntity.getIn(['attributes', 'date_comment'])
  //   && DATE_SPECIFICITIES.indexOf(viewEntity.getIn(['attributes', 'date_comment']).trim()) > -1
  // ) {
  //   dateSpecificity = viewEntity.getIn(['attributes', 'date_comment']).trim();
  // }
  let datesEqual;
  if (
    viewEntity
    && viewEntity.getIn(['attributes', 'date_start'])
    && viewEntity.getIn(['attributes', 'date_end'])
  ) {
    const [ds] = viewEntity.getIn(['attributes', 'date_start']).split('T');
    const [de] = viewEntity.getIn(['attributes', 'date_end']).split('T');
    datesEqual = ds === de;
  }

  const isMine = viewEntity && qe(viewEntity.getIn(['attributes', 'created_by_id']), myId);
  console.log(indicators && indicators.toJS());
  // console.log(indicatorConnections && indicatorConnections.toJS())
  return (
    <div>
      <Helmet
        title={metaTitle}
        meta={[
          { name: 'description', content: intl.formatMessage(messages.metaDescription) },
        ]}
      />
      <Content isSingle>
        { !dataReady && <Loading /> }
        { !viewEntity && dataReady && (
          <div>
            <FormattedMessage {...messages.notFound} />
          </div>
        )}
        { viewEntity && dataReady && (
          <ViewWrapper>
            <ViewHeader
              title={typeId
                ? intl.formatMessage(appMessages.actiontypes[typeId])
                : intl.formatMessage(appMessages.entities.actions.plural)
              }
              buttons={buttons}
              onClose={() => handleClose(typeId)}
              onTypeClick={() => handleTypeClick(typeId)}
            />
            <ViewPanel>
              <ViewPanelInside>
                <Main hasAside={isManager}>
                  <FieldGroup
                    group={{ // fieldGroup
                      fields: [
                        checkActionAttribute(typeId, 'code', isManager) && getReferenceField(
                          viewEntity,
                          'code',
                          isManager,
                        ),
                        checkActionAttribute(typeId, 'title') && getTitleField(viewEntity),
                      ],
                    }}
                  />
                </Main>
                {isManager && (
                  <Aside>
                    <FieldGroup
                      group={{
                        fields: [
                          getStatusField(viewEntity),
                          (isAdmin || isMine) && getStatusFieldIf({
                            entity: viewEntity,
                            attribute: 'private',
                          }),
                          isAdmin && getStatusFieldIf({
                            entity: viewEntity,
                            attribute: 'is_archive',
                          }),
                          getMetaField(viewEntity),
                        ],
                      }}
                      aside
                    />
                  </Aside>
                )}
              </ViewPanelInside>
            </ViewPanel>
            <ViewPanel>
              <ViewPanelInside>
                <Main hasAside bottom>
                  <FieldGroup
                    group={{
                      fields: [
                        checkActionAttribute(typeId, 'description')
                          && getMarkdownField(viewEntity, 'description', true),
                        checkActionAttribute(typeId, 'comment')
                          && getMarkdownField(viewEntity, 'comment', true),
                        checkActionAttribute(typeId, 'status_comment')
                          && getMarkdownField(viewEntity, 'status_comment', true),
                      ],
                    }}
                  />
                  {indicators && hasIndicators && (
                    <FieldGroup
                      group={{
                        label: appMessages.nav.indicators,
                        fields: [
                          getIndicatorConnectionField({
                            indicators,
                            onEntityClick,
                            // connections: indicatorConnections,
                            skipLabel: true,
                            columns: getIndicatorColumns(viewEntity, intl),
                          }),
                        ],
                      }}
                    />
                  )}
                  <Box>
                    <Box direction="row" gap="small" margin={{ vertical: 'small', horizontal: 'medium' }}>
                      {hasActor && (
                        <SubjectButton
                          onClick={() => onSetSubject('actors')}
                          active={viewSubject === 'actors'}
                        >
                          <Text size="large">Actors</Text>
                        </SubjectButton>
                      )}
                      {hasTarget && (
                        <SubjectButton
                          onClick={() => onSetSubject('targets')}
                          active={viewSubject === 'targets'}
                        >
                          <Text size="large">Targets</Text>
                        </SubjectButton>
                      )}
                      {hasChildren && (
                        <SubjectButton
                          onClick={() => onSetSubject('children')}
                          active={viewSubject === 'children'}
                        >
                          <Text size="large">Child activities</Text>
                        </SubjectButton>
                      )}
                    </Box>
                    {viewSubject !== 'children' && (!actortypesForSubject || actortypesForSubject.size === 0) && (
                      <Box margin={{ top: 'small', horizontal: 'medium', bottom: 'large' }}>
                        {viewSubject === 'actors' && (
                          <Text>
                            No actors for activity in database
                          </Text>
                        )}
                        {viewSubject === 'targets' && (
                          <Text>
                            No activity targets in database
                          </Text>
                        )}
                      </Box>
                    )}
                    <Box>
                      {dataReady && actortypesForSubject && hasMap && (
                        <ActionMap
                          entities={actortypesForSubject}
                          mapSubject={viewSubject}
                          onActorClick={(id) => onEntityClick(id, ROUTES.ACTOR)}
                          hasMemberOption={hasMemberOption}
                          typeId={typeId}
                        />
                      )}
                      {viewSubject === 'targets' && (
                        <FieldGroup
                          group={{
                            fields: [
                              checkActionAttribute(typeId, 'target_comment')
                                && getMarkdownField(viewEntity, 'target_comment', true),
                            ],
                          }}
                        />
                      )}
                      {viewSubject === 'children' && (
                        <Activities
                          viewEntity={viewEntity}
                          taxonomies={taxonomies}
                          actionConnections={actionConnections}
                          onSetActiontype={onSetActiontype}
                          onEntityClick={onEntityClick}
                          onCreateOption={onCreateOption}
                          viewActiontypeId={childActiontypeIds.indexOf(viewActiontypeId) > -1 ? viewActiontypeId : childActiontypeIds[0]}
                          actionsByActiontype={subActionsByType}
                          actiontypes={actiontypes.filter((type) => childActiontypeIds.indexOf(type.get('id')) > -1)}
                        />
                      )}
                      {viewSubject !== 'children' && actortypesForSubject && (
                        <FieldGroup
                          group={{
                            fields: actortypesForSubject.reduce(
                              (memo, actors, typeid) => memo.concat([
                                getActorConnectionField({
                                  actors,
                                  taxonomies,
                                  onEntityClick,
                                  connections: actorConnections,
                                  typeid,
                                  columns: getActortypeColumns(typeid),
                                }),
                              ]),
                              [],
                            ),
                          }}
                        />
                      )}
                      {resourcesByResourcetype && (
                        <FieldGroup
                          group={{
                            type: 'dark',
                            label: appMessages.nav.resources,
                            fields: resourcesByResourcetype.reduce(
                              (memo, resources, resourcetypeid) => {
                                const columns = [
                                  {
                                    id: 'main',
                                    type: 'main',
                                    sort: 'title',
                                    attributes: ['title'],
                                  },
                                ];
                                return memo.concat([
                                  getResourceConnectionField({
                                    resources,
                                    taxonomies,
                                    onEntityClick,
                                    connections: resourceConnections,
                                    typeid: resourcetypeid,
                                    columns,
                                  }),
                                ]);
                              },
                              [],
                            ),
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </Main>
                <Aside bottom>
                  <FieldGroup
                    aside
                    group={{
                      fields: [
                        checkActionAttribute(typeId, 'url') && getLinkField(viewEntity),
                      ],
                    }}
                  />
                  <FieldGroup
                    aside
                    group={{
                      type: 'dark',
                      fields: [
                        checkActionAttribute(typeId, 'date_start')
                          && getDateField(
                            viewEntity,
                            'date_start',
                            {
                              specificity: dateSpecificity,
                              attributeLabel: datesEqual ? 'date' : 'date_start',
                            }
                          ),
                        !datesEqual
                          && checkActionAttribute(typeId, 'date_end')
                          && getDateField(viewEntity, 'date_end', { specificity: dateSpecificity }),
                        !dateSpecificity
                          && checkActionAttribute(typeId, 'date_comment')
                          && getTextField(viewEntity, 'date_comment'),
                      ],
                    }}
                  />
                  {hasTaxonomyCategories(viewTaxonomies) && (
                    <FieldGroup
                      aside
                      group={{
                        label: appMessages.entities.taxonomies.plural,
                        icon: 'categories',
                        fields: getTaxonomyFields(viewTaxonomies),
                      }}
                    />
                  )}
                  {users && (
                    <FieldGroup
                      group={{
                        label: appMessages.nav.userActions,
                        fields: [
                          getUserConnectionField({
                            users,
                            onEntityClick,
                            connections: userConnections,
                            skipLabel: true,
                            // TODO columns
                          }),
                        ],
                      }}
                    />
                  )}
                  {topActionsByType && (
                    <FieldGroup
                      aside
                      group={{
                        label: appMessages.entities.actions.topActions,
                        fields: topActionsByType.reduce(
                          (memo, actions, typeid) => {
                            const columns = [
                              {
                                id: 'main',
                                type: 'main',
                                sort: 'title',
                                attributes: ['title'],
                              },
                            ];
                            return memo.concat([
                              getActionConnectionField({
                                actions,
                                taxonomies,
                                onEntityClick,
                                connections: actionConnections,
                                typeid,
                                columns,
                              }),
                            ]);
                          },
                          [],
                        ),
                      }}
                    />
                  )}
                </Aside>
              </ViewPanelInside>
            </ViewPanel>
          </ViewWrapper>
        )}
      </Content>
    </div>
  );
}

ActionView.propTypes = {
  viewEntity: PropTypes.object,
  onLoadData: PropTypes.func,
  handleTypeClick: PropTypes.func,
  dataReady: PropTypes.bool,
  handleEdit: PropTypes.func,
  handleClose: PropTypes.func,
  onEntityClick: PropTypes.func,
  isManager: PropTypes.bool,
  isAdmin: PropTypes.bool,
  myId: PropTypes.string,
  viewTaxonomies: PropTypes.object,
  taxonomies: PropTypes.object,
  actorsByActortype: PropTypes.object,
  targetsByActortype: PropTypes.object,
  resourcesByResourcetype: PropTypes.object,
  actorConnections: PropTypes.object,
  actionConnections: PropTypes.object,
  resourceConnections: PropTypes.object,
  // activitytypes: PropTypes.object,
  params: PropTypes.object,
  subActionsByType: PropTypes.object,
  topActionsByType: PropTypes.object,
  onSetSubject: PropTypes.func,
  intl: intlShape.isRequired,
  subject: PropTypes.string,
  // indicatorConnections: PropTypes.object,
  indicators: PropTypes.object,
  userConnections: PropTypes.object,
  users: PropTypes.object,
  viewActiontypeId: PropTypes.string,
  onCreateOption: PropTypes.func,
  onSetActiontype: PropTypes.func,
  actiontypes: PropTypes.object,
};

ActionView.contextTypes = {
  intl: PropTypes.object.isRequired,
};


const mapStateToProps = (state, props) => ({
  isManager: selectIsUserManager(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  viewEntity: selectViewEntity(state, props.params.id),
  viewTaxonomies: selectViewTaxonomies(state, props.params.id),
  taxonomies: selectTaxonomiesWithCategories(state),
  actorsByActortype: selectActorsByType(state, props.params.id),
  resourcesByResourcetype: selectResourcesByType(state, props.params.id),
  targetsByActortype: selectTargetsByType(state, props.params.id),
  actorConnections: selectActorConnections(state),
  actionConnections: selectActionConnections(state),
  resourceConnections: selectResourceConnections(state),
  topActionsByType: selectTopActionsByActiontype(state, props.params.id),
  subActionsByType: selectSubActionsByActiontype(state, props.params.id),
  subject: selectSubjectQuery(state),
  indicators: selectEntityIndicators(state, props.params.id),
  // indicatorConnections: selectIndicatorConnections(state),
  users: selectEntityUsers(state, props.params.id),
  userConnections: selectUserConnections(state),
  viewActiontypeId: selectActiontypeQuery(state),
  actiontypes: selectActiontypes(state),
  isAdmin: selectIsUserAdmin(state),
  myId: selectSessionUserId(state),
});

function mapDispatchToProps(dispatch, props) {
  return {
    onLoadData: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onEntityClick: (id, path) => {
      dispatch(updatePath(`${path}/${id}`));
    },
    handleEdit: () => {
      dispatch(updatePath(`${ROUTES.ACTION}${ROUTES.EDIT}/${props.params.id}`, { replace: true }));
    },
    handleClose: (typeId) => {
      dispatch(closeEntity(`${ROUTES.ACTIONS}/${typeId}`));
    },
    handleTypeClick: (typeId) => {
      dispatch(updatePath(`${ROUTES.ACTIONS}/${typeId}`));
    },
    onSetSubject: (type) => {
      dispatch(setSubject(type));
    },
    onSetActiontype: (type) => {
      dispatch(setActiontype(type));
    },
    onCreateOption: (args) => {
      dispatch(openNewEntityModal(args));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ActionView));
