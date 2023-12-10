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
import { Box, Text } from 'grommet';
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

import { keydownHandlerPrint } from 'utils/print';

import {
  loadEntitiesIfNeeded,
  updatePath,
  closeEntity,
  setSubject,
  printView,
} from 'containers/App/actions';

import {
  // ROUTES, ACTIONTYPES, ACTORTYPES_CONFIG, ACTORTYPES, RESOURCE_FIELDS,
  ROUTES,
  ACTIONTYPE_TARGETTYPES,
  ACTIONTYPE_ACTORTYPES,
  ACTIONTYPE_ACTIONTYPES,
  INDICATOR_ACTIONTYPES,
  ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS,
} from 'themes/config';

import { PRINT_TYPES } from 'containers/App/constants';

import Loading from 'components/Loading';
import Content from 'components/Content';
import ViewHeader from 'components/EntityView/ViewHeader';
import Main from 'components/EntityView/Main';
import Aside from 'components/EntityView/Aside';
import ViewWrapper from 'components/EntityView/ViewWrapper';
import ViewPanel from 'components/EntityView/ViewPanel';
import ViewPanelInside from 'components/EntityView/ViewPanelInside';
import FieldGroup from 'components/fields/FieldGroup';
import SubjectButton from 'components/styled/SubjectButton';
import SubjectButtonGroup from 'components/styled/SubjectButtonGroup';
import SubjectTabWrapper from 'components/styled/SubjectTabWrapper';
import HeaderPrint from 'components/Header/HeaderPrint';
import PrintHide from 'components/styled/PrintHide';
import PrintOnly from 'components/styled/PrintOnly';

import {
  selectReady,
  selectIsUserMember,
  selectIsUserAdmin,
  selectResourceConnections,
  selectTaxonomiesWithCategories,
  selectSubjectQuery,
  selectActiontypes,
  selectUserConnections,
  selectActiontypeQuery,
  selectSessionUserId,
  selectIsPrintView,
  selectPrintConfig,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';
import messages from './messages';

import TabActivities from './TabActivities';
import TabActors from './TabActors';


import {
  selectViewEntity,
  selectViewTaxonomies,
  selectResourcesByType,
  selectTopActionsByActiontype,
  selectSubActionsByActiontype,
  selectEntityIndicators,
  selectEntityUsers,
} from './selectors';

import { DEPENDENCIES } from './constants';

const PrintSectionTitleWrapper = styled(
  (p) => <Box margin={{ top: 'large', bottom: 'small' }} pad={{ bottom: 'small' }} border="bottom" {...p} />
)``;

const getIndicatorColumns = (viewEntity, intl, isAdmin) => {
  let columns = [{
    id: 'main',
    type: 'main',
    sort: 'title',
    attributes: isAdmin ? ['code', 'title'] : ['title'],
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
    isMember,
    taxonomies,
    viewTaxonomies,
    resourcesByResourcetype,
    indicators,
    onEntityClick,
    resourceConnections,
    subActionsByType,
    topActionsByType,
    onLoadData,
    subject,
    onSetSubject,
    onSetPrintView,
    isPrintView,
    printArgs,
    intl,
    handleEdit,
    handleClose,
    params,
    handleTypeClick,
    users,
    userConnections,
    viewActiontypeId,
    actiontypes,
    isAdmin,
    myId,
  } = props;

  useEffect(() => {
    // kick off loading of data
    onLoadData();
  }, []);
  useEffect(() => {
    // also kick off loading of data again once dataReady changes and becomes negative again
    // required due to possible in-view creation of child activities
    if (!dataReady) {
      onLoadData();
    }
  }, [dataReady]);

  const typeId = viewEntity && viewEntity.getIn(['attributes', 'measuretype_id']);
  // const type = `actions_${typeId}`;
  let viewSubject = subject || 'actors';

  const showMap = viewSubject === 'actors' || viewSubject === 'targets';

  const mySetPrintView = () => onSetPrintView({
    printType: showMap ? PRINT_TYPES.FF : PRINT_TYPES.SINGLE,
    printContentOptions: {
      tabs: true,
      actionTypes: viewSubject === 'children',
      actionTypesForArgs: (args) => args.printTabs === 'all',
    },
    printMapOptions: showMap ? { markers: true } : null,
    printMapMarkers: true,
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

  // const typeId = viewEntity && viewEntity.getIn(['attributes', 'measuretype_id']);
  // const viewActivitytype = activitytypes && activitytypes.find((type) => qe(type.get('id'), typeId));

  let buttons = [];
  if (dataReady) {
    buttons = [
      ...buttons,
      {
        type: 'icon',
        onClick: () => mySetPrintView(),
        title: 'Print',
        icon: 'print',
      },
    ];
    if (isMember) {
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

  const hasIndicators = typeId && INDICATOR_ACTIONTYPES.indexOf(typeId.toString()) > -1;

  const validViewSubjects = [];
  if (hasActor) {
    validViewSubjects.push('actors');
  }
  if (hasTarget) {
    validViewSubjects.push('targets');
  }
  if (hasChildren) {
    validViewSubjects.push('children');
  }
  if (validViewSubjects.indexOf(viewSubject) === -1) {
    viewSubject = validViewSubjects.length > 0 ? validViewSubjects[0] : null;
  }
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
  const showAllTabs = isPrintView && printArgs && printArgs.printTabs === 'all';
  const showAllActionTypes = isPrintView && printArgs.printActionTypes === 'all';
  return (
    <div>
      <Helmet
        title={metaTitle}
        meta={[
          { name: 'description', content: intl.formatMessage(messages.metaDescription) },
        ]}
      />
      <Content isSingle isPrint={isPrintView}>
        {!dataReady && <Loading />}
        {!viewEntity && dataReady && (
          <div>
            <FormattedMessage {...messages.notFound} />
          </div>
        )}
        {viewEntity && dataReady && (
          <ViewWrapper isPrint={isPrintView}>
            {isPrintView && <HeaderPrint argsKeep={['am', 'tm', 'mtchm', 'subj', 'mtch', 'ac', 'tc']} />}
            <ViewHeader
              isPrintView={isPrintView}
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
                <Main hasAside={isMember && !isPrintView}>
                  <FieldGroup
                    group={{ // fieldGroup
                      fields: [
                        checkActionAttribute(typeId, 'code', isAdmin) && getReferenceField(
                          viewEntity,
                          'code',
                          isAdmin,
                        ),
                        checkActionAttribute(typeId, 'title') && getTitleField(viewEntity),
                      ],
                    }}
                  />
                </Main>
                {isMember && (
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
                          isAdmin && getStatusField(viewEntity, 'notifications'),
                          getMetaField(viewEntity, true),
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
                            columns: getIndicatorColumns(viewEntity, intl, isAdmin),
                          }),
                        ],
                      }}
                    />
                  )}
                  <Box>
                    <>
                      <PrintHide>
                        <SubjectButtonGroup>
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
                        </SubjectButtonGroup>
                      </PrintHide>
                    </>
                    <SubjectTabWrapper>
                      {validViewSubjects.filter(
                        (vSubject) => showAllTabs || vSubject === viewSubject
                      ).map(
                        (vSubject) => vSubject === 'children'
                          ? (
                            <span key={vSubject}>
                              <PrintOnly>
                                <PrintSectionTitleWrapper>
                                  <Text size="large">Child Activities</Text>
                                </PrintSectionTitleWrapper>
                              </PrintOnly>
                              <TabActivities
                                isAdmin={isAdmin}
                                showAllActionTypes={showAllActionTypes}
                                viewEntity={viewEntity}
                                taxonomies={taxonomies}
                                onEntityClick={onEntityClick}
                                viewActiontypeId={childActiontypeIds.indexOf(viewActiontypeId) > -1 ? viewActiontypeId : childActiontypeIds[0]}
                                actiontypes={actiontypes.filter((type) => childActiontypeIds.indexOf(type.get('id')) > -1)}
                                actionsByActiontype={subActionsByType}
                              />
                            </span>
                          )
                          : (
                            <span key={vSubject}>
                              <PrintOnly>
                                <PrintSectionTitleWrapper>
                                  <Text size="large">{subject === 'actors' ? 'Actors' : 'Targets'}</Text>
                                </PrintSectionTitleWrapper>
                              </PrintOnly>
                              <TabActors
                                isAdmin={isAdmin}
                                hasChildren={hasChildren}
                                childActionsByActiontype={subActionsByType}
                                viewEntity={viewEntity}
                                typeId={typeId.toString()}
                                viewSubject={vSubject}
                                taxonomies={taxonomies}
                                onEntityClick={onEntityClick}
                              />
                            </span>
                          )
                      )}
                    </SubjectTabWrapper>
                    <Box>
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
                  {users && (
                    <FieldGroup
                      aside
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
                                onEntityClick,
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
  isMember: PropTypes.bool,
  isAdmin: PropTypes.bool,
  isPrintView: PropTypes.bool,
  myId: PropTypes.string,
  viewTaxonomies: PropTypes.object,
  taxonomies: PropTypes.object,
  resourcesByResourcetype: PropTypes.object,
  resourceConnections: PropTypes.object,
  // activitytypes: PropTypes.object,
  params: PropTypes.object,
  subActionsByType: PropTypes.object,
  topActionsByType: PropTypes.object,
  onSetSubject: PropTypes.func,
  onSetPrintView: PropTypes.func,
  intl: intlShape.isRequired,
  subject: PropTypes.string,
  // indicatorConnections: PropTypes.object,
  indicators: PropTypes.object,
  userConnections: PropTypes.object,
  users: PropTypes.object,
  viewActiontypeId: PropTypes.string,
  actiontypes: PropTypes.object,
  printArgs: PropTypes.object,
};

const mapStateToProps = (state, props) => ({
  isMember: selectIsUserMember(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  viewEntity: selectViewEntity(state, props.params.id),
  viewTaxonomies: selectViewTaxonomies(state, props.params.id),
  taxonomies: selectTaxonomiesWithCategories(state),
  resourcesByResourcetype: selectResourcesByType(state, props.params.id),
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
  isPrintView: selectIsPrintView(state),
  printArgs: selectPrintConfig(state),
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
    onSetPrintView: (config) => {
      dispatch(printView(config));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ActionView));
