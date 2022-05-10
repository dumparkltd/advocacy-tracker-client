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
  getMetaField,
  getMarkdownField,
  getDateField,
  getTextField,
  // getInfoField,
  getReferenceField,
  getLinkField,
  getNumberField,
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
} from 'containers/App/actions';

import {
  // ROUTES, ACTIONTYPES, ACTORTYPES_CONFIG, ACTORTYPES, RESOURCE_FIELDS,
  ROUTES,
  ACTIONTYPES,
  ACTORTYPES_CONFIG,
  ACTIONTYPE_TARGETTYPES,
  ACTIONTYPE_ACTORTYPES,
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
  selectActorConnections,
  selectResourceConnections,
  selectIndicatorConnections,
  selectActionConnections,
  selectTaxonomiesWithCategories,
  selectSubjectQuery,
  // selectActiontypes,
  selectUserConnections,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';
import messages from './messages';

import ActionMap from './ActionMap';

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
  // if (qe(typeid, ACTORTYPES.COUNTRY)) {
  //   columns = [
  //     ...columns,
  //     {
  //       id: 'classes',
  //       type: 'associations',
  //       actortype_id: ACTORTYPES.CLASS,
  //       title: 'Classes',
  //     },
  //   ];
  // }
  if (
    ACTORTYPES_CONFIG[parseInt(typeid, 10)]
    && ACTORTYPES_CONFIG[parseInt(typeid, 10)].columns
  ) {
    columns = [
      ...columns,
      ...ACTORTYPES_CONFIG[parseInt(typeid, 10)].columns,
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
    indicatorConnections,
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

  const hasMemberOption = !!typeId && !qe(typeId, ACTIONTYPES.NATL);
  const hasMap = qe(typeId, ACTIONTYPES.EXPRESS);
  let viewSubject;
  if (hasTarget && !hasActor) {
    viewSubject = 'targets';
  } else if (hasActor && !hasTarget) {
    viewSubject = 'actors';
  } else { // } if (hasTarget && hasActor) {
    viewSubject = subject || 'actors';
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
  return (
    <div>
      <Helmet
        title={metaTitle}
        meta={[
          { name: 'description', content: intl.formatMessage(messages.metaDescription) },
        ]}
      />
      <Content isSingle>
        { !dataReady
          && <Loading />
        }
        { !viewEntity && dataReady
          && (
            <div>
              <FormattedMessage {...messages.notFound} />
            </div>
          )
        }
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
                  {indicators && (
                    <FieldGroup
                      group={{
                        label: appMessages.nav.indicators,
                        fields: [
                          getIndicatorConnectionField({
                            indicators,
                            onEntityClick,
                            connections: indicatorConnections,
                            skipLabel: true,
                            // TODO columns
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
                    </Box>
                    {(!actortypesForSubject || actortypesForSubject.size === 0) && (
                      <Box margin={{ vertical: 'small', horizontal: 'medium' }}>
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
                          onEntityClick={(id) => onEntityClick(id, ROUTES.ACTOR)}
                          hasMemberOption={hasMemberOption}
                          typeId={typeId}
                        />
                      )}
                      {viewSubject === 'targets' && hasTarget && (
                        <FieldGroup
                          group={{
                            fields: [
                              checkActionAttribute(typeId, 'target_comment')
                                && getMarkdownField(viewEntity, 'target_comment', true),
                            ],
                          }}
                        />
                      )}
                      {actortypesForSubject && (
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
                        checkActionAttribute(typeId, 'amount')
                          && getNumberField(viewEntity, 'amount', { unit: 'US$', unitBefore: true }),
                        checkActionAttribute(typeId, 'amount_comment') && getTextField(viewEntity, 'amount_comment'),
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
                  {subActionsByType && (
                    <FieldGroup
                      aside
                      group={{
                        label: appMessages.entities.actions.subActions,
                        fields: subActionsByType.reduce(
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
  indicatorConnections: PropTypes.object,
  indicators: PropTypes.object,
  userConnections: PropTypes.object,
  users: PropTypes.object,
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
  // activitytypes: selectActiontypes(state),
  indicators: selectEntityIndicators(state, props.params.id),
  indicatorConnections: selectIndicatorConnections(state),
  users: selectEntityUsers(state, props.params.id),
  userConnections: selectUserConnections(state),
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
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ActionView));
