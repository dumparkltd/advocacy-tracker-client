/*
 *
 * ActorView
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Map } from 'immutable';
import { Box, Text } from 'grommet';

import {
  getTitleField,
  getStatusField,
  getStatusFieldIf,
  getMetaField,
  getMarkdownField,
  getReferenceField,
  getLinkField,
  // getNumberField,
  getTaxonomyFields,
  hasTaxonomyCategories,
  getActorConnectionField,
  getEmailField,
  getInfoField,
  getTextField,
  getUserConnectionField,
} from 'utils/fields';
import qe from 'utils/quasi-equals';
import { keydownHandlerPrint } from 'utils/print';

import { getEntityTitleTruncated, checkActorAttribute } from 'utils/entities';

import {
  loadEntitiesIfNeeded,
  updatePath,
  closeEntity,
  setSubject,
  printView,
} from 'containers/App/actions';

import { CONTENT_SINGLE, PRINT_TYPES } from 'containers/App/constants';
import {
  ROUTES,
  ACTORTYPES,
  ACTIONTYPE_ACTORTYPES,
  ACTIONTYPES,
  MEMBERSHIPS,
} from 'themes/config';

import Loading from 'components/Loading';
import Content from 'components/Content';
import ViewHeader from 'components/EntityView/ViewHeader';
// import EntityView from 'components/EntityView';
import Main from 'components/EntityView/Main';
import Aside from 'components/EntityView/Aside';
import ViewWrapper from 'components/EntityView/ViewWrapper';
import ViewPanel from 'components/EntityView/ViewPanel';
import ViewPanelInside from 'components/EntityView/ViewPanelInside';
import FieldGroup from 'components/fields/FieldGroup';
import SubjectButton from 'components/styled/SubjectButton';
import SubjectButtonGroup from 'components/styled/SubjectButtonGroup';
import SubjectTabWrapper from 'components/styled/SubjectTabWrapper';

import {
  selectReady,
  selectIsUserMember,
  selectIsUserAdmin,
  selectSessionUserId,
  selectTaxonomiesWithCategories,
  selectActorConnections,
  selectSubjectQuery,
  selectActortypes,
  selectUserConnections,
  selectIsPrintView,
  selectPrintConfig,
} from 'containers/App/selectors';
import styled from 'styled-components';

import appMessages from 'containers/App/messages';
import HeaderPrint from 'components/Header/HeaderPrint';
import PrintOnly from 'components/styled/PrintOnly';
import PrintHide from 'components/styled/PrintHide';
import messages from './messages';
import TabActivities from './TabActivities';
import TabMembers from './TabMembers';
import CountryMap from './CountryMap';
import TabStatements from './TabStatements';

import {
  selectViewEntity,
  selectViewTaxonomies,
  selectActionsByType,
  selectMembersByType,
  selectAssociationsByType,
  selectEntityUsers,
} from './selectors';

import { DEPENDENCIES } from './constants';

const PrintSectionTitleWrapper = styled(
  (p) => <Box margin={{ top: 'large', bottom: 'small' }} pad={{ bottom: 'small' }} border="bottom" {...p} />
)``;
export function ActorView({
  intl,
  viewEntity,
  dataReady,
  isUserMember,
  onLoadData,
  params,
  handleEdit,
  handleClose,
  handleTypeClick,
  viewTaxonomies,
  associationsByType,
  onEntityClick,
  onSetSubject,
  membersByType,
  actortypes,
  taxonomies,
  actorConnections,
  actionsByActiontype,
  users,
  userConnections,
  isAdmin,
  myId,
  isPrintView,
  onSetPrintView,
  printArgs,
  subject,
}) {
  useEffect(() => {
    // kick off loading of data
    onLoadData();
  }, []);
  useEffect(() => {
    // also kick off loading of data again once dataReady changes and becomes negative again
    // required due to possible in-view creation of activities
    if (!dataReady) {
      onLoadData();
    }
  }, [dataReady]);

  const typeId = viewEntity && viewEntity.getIn(['attributes', 'actortype_id']);
  const viewActortype = actortypes && actortypes.find((type) => qe(type.get('id'), typeId));
  const viewActortypeId = viewActortype && viewActortype.get('id').toString();
  const isActive = true;
  const hasMembers = viewActortypeId
    && Object.values(MEMBERSHIPS).reduce(
      (memo, actorGroups) => [...memo, ...actorGroups],
      [],
    ).indexOf(viewActortypeId) > -1;
  const hasStatements = typeId && ACTIONTYPE_ACTORTYPES[ACTIONTYPES.EXPRESS].indexOf(typeId.toString()) > -1;
  const isCountry = qe(typeId, ACTORTYPES.COUNTRY);

  let viewSubject = subject || 'actors';
  const validViewSubjects = [];
  if (isActive) {
    validViewSubjects.push('actors');
  }
  if (hasStatements) {
    validViewSubjects.push('topics');
  }
  if (hasMembers) {
    validViewSubjects.push('members');
  }
  if (validViewSubjects.indexOf(viewSubject) === -1) {
    viewSubject = validViewSubjects.length > 0 ? validViewSubjects[0] : null;
  }
  const isMine = viewEntity && qe(viewEntity.getIn(['attributes', 'created_by_id']), myId);
  const showAllTabs = isPrintView && printArgs && printArgs.printTabs === 'all';
  const showAllActionTypes = isPrintView && printArgs.printActionTypes === 'all';
  const hasMap = !isCountry && viewSubject === 'members';

  const mySetPrintView = () => onSetPrintView({
    printType: PRINT_TYPES.SINGLE,
    printContentOptions: {
      tabs: true,
      actionTypes: viewSubject === 'actors' || viewSubject === 'targets',
      actionTypesForArgs: (args) => args.printTabs === 'all',
    },
    printMapOptions: {
      markers: hasMap,
      markersForArgs: (args) => !isCountry && hasMembers && args.printTabs === 'all',
    },
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

  let buttons = [];
  if (dataReady) {
    if (window.print) {
      buttons = [
        ...buttons,
        {
          type: 'icon',
          onClick: mySetPrintView,
          title: 'Print',
          icon: 'print',
        },
      ];
    }
    if (isUserMember) {
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
    ? intl.formatMessage(appMessages.entities[`actors_${typeId}`].single)
    : intl.formatMessage(appMessages.entities.actors.single);

  const metaTitle = viewEntity
    ? `${pageTitle}: ${getEntityTitleTruncated(viewEntity)}`
    : `${pageTitle}: ${params.id}`;

  return (
    <div>
      <Helmet
        title={metaTitle}
        meta={[
          { name: 'description', content: intl.formatMessage(messages.metaDescription) },
        ]}
      />
      <Content isSingle isPrintView={isPrintView}>
        {!dataReady
          && <Loading />
        }
        {!viewEntity && dataReady
          && (
            <div>
              <FormattedMessage {...messages.notFound} />
            </div>
          )
        }
        {viewEntity && dataReady && (
          <ViewWrapper isPrint={isPrintView}>
            {isPrintView && (
              <HeaderPrint argsKeep={['am', 'tm', 'subj', 'actiontype', 'inofficial']} />
            )}
            <ViewHeader
              isPrintView={isPrintView}
              title={typeId
                ? intl.formatMessage(appMessages.actortypes[typeId])
                : intl.formatMessage(appMessages.entities.actors.plural)
              }
              type={CONTENT_SINGLE}
              buttons={buttons}
              onClose={() => handleClose(typeId)}
              onTypeClick={() => handleTypeClick(typeId)}
            />
            <ViewPanel>
              <ViewPanelInside>
                <Main hasAside={isUserMember && !isPrintView}>
                  <FieldGroup
                    group={{ // fieldGroup
                      fields: [
                        checkActorAttribute(typeId, 'code', isAdmin) && getReferenceField(
                          viewEntity,
                          'code',
                          isAdmin,
                        ),
                        checkActorAttribute(typeId, 'title') && getTitleField(viewEntity),
                        checkActorAttribute(typeId, 'prefix', isUserMember) && getInfoField(
                          'prefix',
                          viewEntity.getIn(['attributes', 'prefix']),
                        ),
                        checkActorAttribute(typeId, 'name') && getTitleField(viewEntity),
                      ],
                    }}
                  />
                </Main>
                {isUserMember && !isPrintView && (
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
                        checkActorAttribute(typeId, 'description')
                        && getMarkdownField(viewEntity, 'description', true),
                        checkActorAttribute(typeId, 'activity_summary')
                        && getMarkdownField(viewEntity, 'activity_summary', true),
                      ],
                    }}
                  />
                  <Box>
                    <PrintHide>
                      <SubjectButtonGroup>
                        {isActive && (
                          <SubjectButton
                            onClick={() => onSetSubject('actors')}
                            active={viewSubject === 'actors'}
                          >
                            <Text size="large">Activities</Text>
                          </SubjectButton>
                        )}
                        {hasMembers && (
                          <SubjectButton
                            onClick={() => onSetSubject('members')}
                            active={viewSubject === 'members'}
                          >
                            <Text size="large">Members</Text>
                          </SubjectButton>
                        )}
                        {hasStatements && (
                          <SubjectButton
                            onClick={() => onSetSubject('topics')}
                            active={viewSubject === 'topics'}
                          >
                            <Text size="large">Positions</Text>
                          </SubjectButton>
                        )}
                      </SubjectButtonGroup>
                    </PrintHide>
                    <SubjectTabWrapper>
                      {(showAllTabs || viewSubject === 'actors' || viewSubject === 'targets') && (
                        <>
                          <PrintOnly>
                            <PrintSectionTitleWrapper>
                              <Text size="large">{viewSubject === 'actors' ? 'Activities' : 'Targeted By'}</Text>
                            </PrintSectionTitleWrapper>
                          </PrintOnly>
                          <TabActivities
                            isAdmin={isAdmin}
                            viewEntity={viewEntity}
                            onEntityClick={onEntityClick}
                            viewSubject={viewSubject}
                            taxonomies={taxonomies}
                            actionsByActiontype={actionsByActiontype}
                            printArgs={printArgs}
                            showAllActionTypes={showAllActionTypes}
                          />
                        </>
                      )}
                      {(showAllTabs || viewSubject === 'members') && hasMembers && (
                        <>
                          <PrintOnly>
                            <PrintSectionTitleWrapper>
                              <Text size="large">Members</Text>
                            </PrintSectionTitleWrapper>
                          </PrintOnly>
                          <TabMembers
                            isAdmin={isAdmin}
                            membersByType={membersByType}
                            onEntityClick={(id, path) => onEntityClick(id, path)}
                            taxonomies={taxonomies}
                            actorConnections={actorConnections}
                            printArgs={printArgs}
                          />
                        </>
                      )}
                      {(showAllTabs || viewSubject === 'topics') && hasStatements && (
                        <>
                          <PrintOnly>
                            <PrintSectionTitleWrapper>
                              <Text size="large">Topics</Text>
                            </PrintSectionTitleWrapper>
                          </PrintOnly>
                          <TabStatements
                            isAdmin={isAdmin}
                            viewEntity={viewEntity}
                            onEntityClick={(id, path) => onEntityClick(id, path)}
                            statements={actionsByActiontype && actionsByActiontype.get(parseInt(ACTIONTYPES.EXPRESS, 10))}
                            associationsByType={associationsByType}
                          />
                        </>
                      )}
                    </SubjectTabWrapper>
                  </Box>
                </Main>
                <Aside bottom>
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
                  {isCountry && !isPrintView && (
                    <CountryMap actor={viewEntity} printArgs={printArgs} />
                  )}
                  <FieldGroup
                    aside
                    group={{
                      fields: [
                        checkActorAttribute(typeId, 'email') && getEmailField(viewEntity, 'email'),
                        checkActorAttribute(typeId, 'phone') && getTextField(viewEntity, 'phone'),
                        checkActorAttribute(typeId, 'address') && getTextField(viewEntity, 'address'),
                        checkActorAttribute(typeId, 'url')
                        && getLinkField(viewEntity),
                      ],
                    }}
                  />
                  {hasTaxonomyCategories(viewTaxonomies) && (
                    <FieldGroup
                      aside
                      group={{ // fieldGroup
                        label: appMessages.entities.taxonomies.plural,
                        fields: getTaxonomyFields(viewTaxonomies),
                      }}
                    />
                  )}
                  {associationsByType && (
                    <FieldGroup
                      aside
                      group={{
                        label: appMessages.nav.associations,
                        fields: associationsByType.reduce(
                          (memo, actors, typeid) => memo.concat([
                            getActorConnectionField({
                              actors,
                              onEntityClick,
                              typeid,
                            }),
                          ]),
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

ActorView.propTypes = {
  viewEntity: PropTypes.object,
  onLoadData: PropTypes.func,
  dataReady: PropTypes.bool,
  handleEdit: PropTypes.func,
  handleClose: PropTypes.func,
  handleTypeClick: PropTypes.func,
  onEntityClick: PropTypes.func,
  viewTaxonomies: PropTypes.instanceOf(Map),
  taxonomies: PropTypes.instanceOf(Map),
  actorConnections: PropTypes.instanceOf(Map),
  actionsByActiontype: PropTypes.instanceOf(Map),
  membersByType: PropTypes.instanceOf(Map),
  associationsByType: PropTypes.instanceOf(Map),
  params: PropTypes.object,
  isUserMember: PropTypes.bool,
  intl: intlShape.isRequired,
  subject: PropTypes.string,
  viewActiontypeId: PropTypes.string,
  onSetSubject: PropTypes.func,
  actortypes: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  actionsAsMemberByActortype: PropTypes.instanceOf(Map),
  actionsAsTargetAsMemberByActortype: PropTypes.instanceOf(Map),
  userConnections: PropTypes.object,
  users: PropTypes.object,
  isAdmin: PropTypes.bool,
  myId: PropTypes.string,
  isPrintView: PropTypes.bool,
  onSetPrintView: PropTypes.func,
  printArgs: PropTypes.object,
};

const mapStateToProps = (state, props) => ({
  isUserMember: selectIsUserMember(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  viewEntity: selectViewEntity(state, props.params.id),
  viewTaxonomies: selectViewTaxonomies(state, props.params.id),
  taxonomies: selectTaxonomiesWithCategories(state),
  actionsByActiontype: selectActionsByType(state, props.params.id),
  actorConnections: selectActorConnections(state),
  membersByType: selectMembersByType(state, props.params.id),
  associationsByType: selectAssociationsByType(state, props.params.id),
  subject: selectSubjectQuery(state),
  actortypes: selectActortypes(state),
  users: selectEntityUsers(state, props.params.id),
  userConnections: selectUserConnections(state),
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
    handleEdit: () => {
      dispatch(updatePath(`${ROUTES.ACTOR}${ROUTES.EDIT}/${props.params.id}`, { replace: true }));
    },
    handleClose: (typeId) => {
      dispatch(closeEntity(`${ROUTES.ACTORS}/${typeId}`));
    },
    handleTypeClick: (typeId) => {
      dispatch(updatePath(`${ROUTES.ACTORS}/${typeId}`));
    },
    onEntityClick: (id, path) => {
      dispatch(updatePath(`${path}/${id}`));
    },
    onSetSubject: (type) => {
      dispatch(setSubject(type));
    },
    onSetPrintView: (config) => {
      dispatch(printView(config));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ActorView));
