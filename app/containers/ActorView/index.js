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
import { Box, Text, Button } from 'grommet';
import styled from 'styled-components';

import {
  getTitleField,
  getStatusField,
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

import { getEntityTitleTruncated, checkActorAttribute } from 'utils/entities';

import {
  loadEntitiesIfNeeded,
  updatePath,
  closeEntity,
  setSubject,
  setActiontype,
  openNewEntityModal,
} from 'containers/App/actions';

import { CONTENT_SINGLE } from 'containers/App/constants';
import { ROUTES, ACTORTYPES } from 'themes/config';

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

import {
  selectReady,
  selectIsUserManager,
  selectTaxonomiesWithCategories,
  selectActionConnections,
  selectActorConnections,
  selectSubjectQuery,
  selectActiontypeQuery,
  selectActortypes,
  selectActiontypes,
  selectUserConnections,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';
import messages from './messages';
import Activities from './Activities';
import Members from './Members';
import CountryMap from './CountryMap';

import {
  selectViewEntity,
  selectViewTaxonomies,
  selectActionsByType,
  selectActionsAsTargetByType,
  selectMembersByType,
  selectAssociationsByType,
  selectActionsAsMemberByActortype,
  selectActionsAsTargetAsMemberByActortype,
  selectEntityUsers,
} from './selectors';

import { DEPENDENCIES } from './constants';

const SubjectButton = styled((p) => <Button plain {...p} />)`
  padding: 2px 4px;
  border-bottom: 2px solid;
  border-bottom-color: ${({ active }) => active ? 'brand' : 'transparent'};
  background: none;
`;

export function ActorView(props) {
  const {
    intl,
    viewEntity,
    dataReady,
    isManager,
    onLoadData,
    params,
    handleEdit,
    handleClose,
    handleTypeClick,
    viewTaxonomies,
    associationsByType,
    onEntityClick,
    subject,
    onSetSubject,
    membersByType,
    actortypes,
    taxonomies,
    actionConnections,
    actorConnections,
    onSetActiontype,
    viewActiontypeId,
    actionsByActiontype,
    actionsAsTargetByActiontype,
    actiontypes,
    actionsAsMemberByActortype,
    actionsAsTargetAsMemberByActortype,
    onCreateOption,
    users,
    userConnections,
  } = props;
  useEffect(() => {
    // kick off loading of data
    onLoadData();
  }, []);

  const typeId = viewEntity && viewEntity.getIn(['attributes', 'actortype_id']);
  const viewActortype = actortypes && actortypes.find((type) => qe(type.get('id'), typeId));

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
    ? intl.formatMessage(appMessages.entities[`actors_${typeId}`].single)
    : intl.formatMessage(appMessages.entities.actors.single);

  const metaTitle = viewEntity
    ? `${pageTitle}: ${getEntityTitleTruncated(viewEntity)}`
    : `${pageTitle}: ${params.id}`;

  const isTarget = viewActortype && viewActortype.getIn(['attributes', 'is_target']);
  const isActive = viewActortype && viewActortype.getIn(['attributes', 'is_active']);
  const hasMembers = viewActortype && viewActortype.getIn(['attributes', 'has_members']);
  const isCountry = qe(typeId, ACTORTYPES.COUNTRY);

  let viewSubject = subject || (hasMembers ? 'members' : 'actors');
  const validViewSubjects = [];
  if (isTarget) {
    validViewSubjects.push('targets');
  }
  if (isActive) {
    validViewSubjects.push('actors');
  }
  if (hasMembers) {
    validViewSubjects.push('members');
  }
  if (validViewSubjects.indexOf(viewSubject) === -1) {
    viewSubject = validViewSubjects.length > 0 ? validViewSubjects[0] : null;
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
                <Main hasAside={isManager}>
                  <FieldGroup
                    group={{ // fieldGroup
                      fields: [
                        checkActorAttribute(typeId, 'code', isManager) && getReferenceField(
                          viewEntity,
                          'code',
                          isManager,
                        ),
                        checkActorAttribute(typeId, 'title') && getTitleField(viewEntity),
                        checkActorAttribute(typeId, 'prefix', isManager) && getInfoField(
                          'prefix',
                          viewEntity.getIn(['attributes', 'prefix']),
                        ),
                        checkActorAttribute(typeId, 'name') && getTitleField(viewEntity),
                      ],
                    }}
                  />
                  <FieldGroup
                    aside
                    group={{
                      fields: [
                        checkActorAttribute(typeId, 'address') && getTextField(viewEntity, 'address'),
                        checkActorAttribute(typeId, 'phone') && getTextField(viewEntity, 'phone'),
                        checkActorAttribute(typeId, 'email') && getEmailField(viewEntity, 'email'),
                        checkActorAttribute(typeId, 'url')
                          && getLinkField(viewEntity),
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
                        checkActorAttribute(typeId, 'description')
                          && getMarkdownField(viewEntity, 'description', true),
                        checkActorAttribute(typeId, 'activity_summary')
                          && getMarkdownField(viewEntity, 'activity_summary', true),
                      ],
                    }}
                  />
                  <Box>
                    <Box direction="row" gap="small" margin={{ vertical: 'small', horizontal: 'medium' }}>
                      {isActive && (
                        <SubjectButton
                          onClick={() => onSetSubject('actors')}
                          active={viewSubject === 'actors'}
                        >
                          <Text size="large">Activities</Text>
                        </SubjectButton>
                      )}
                      {isTarget && (
                        <SubjectButton
                          onClick={() => onSetSubject('targets')}
                          active={viewSubject === 'targets'}
                        >
                          <Text size="large">Targeted by</Text>
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
                    </Box>
                    {viewSubject === 'members' && hasMembers && (
                      <Members
                        membersByType={membersByType}
                        onEntityClick={(id) => onEntityClick(id, ROUTES.ACTOR)}
                        taxonomies={taxonomies}
                        actorConnections={actorConnections}
                      />
                    )}
                    {(viewSubject === 'actors' || viewSubject === 'targets') && (
                      <Activities
                        viewEntity={viewEntity}
                        onEntityClick={onEntityClick}
                        viewActortype={viewActortype}
                        viewSubject={viewSubject}
                        taxonomies={taxonomies}
                        actionConnections={actionConnections}
                        hasMembers={hasMembers}
                        onSetActiontype={onSetActiontype}
                        viewActiontypeId={viewActiontypeId}
                        actionsByActiontype={actionsByActiontype}
                        actionsAsTargetByActiontype={actionsAsTargetByActiontype}
                        actiontypes={actiontypes}
                        actionsAsMemberByActortype={actionsAsMemberByActortype}
                        actionsAsTargetAsMemberByActortype={actionsAsTargetAsMemberByActortype}
                        onCreateOption={onCreateOption}
                      />
                    )}
                  </Box>
                </Main>
                <Aside bottom>
                  {isCountry && (
                    <CountryMap actor={viewEntity} />
                  )}
                  {hasTaxonomyCategories(viewTaxonomies) && (
                    <FieldGroup
                      aside
                      group={{ // fieldGroup
                        label: appMessages.entities.taxonomies.plural,
                        fields: getTaxonomyFields(viewTaxonomies),
                      }}
                    />
                  )}
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
  actionConnections: PropTypes.instanceOf(Map),
  actorConnections: PropTypes.instanceOf(Map),
  actionsByActiontype: PropTypes.instanceOf(Map),
  actionsAsTargetByActiontype: PropTypes.instanceOf(Map),
  membersByType: PropTypes.instanceOf(Map),
  associationsByType: PropTypes.instanceOf(Map),
  params: PropTypes.object,
  isManager: PropTypes.bool,
  intl: intlShape.isRequired,
  subject: PropTypes.string,
  viewActiontypeId: PropTypes.string,
  onSetSubject: PropTypes.func,
  onSetActiontype: PropTypes.func,
  onCreateOption: PropTypes.func,
  actortypes: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  actionsAsMemberByActortype: PropTypes.instanceOf(Map),
  actionsAsTargetAsMemberByActortype: PropTypes.instanceOf(Map),
  userConnections: PropTypes.object,
  users: PropTypes.object,
};

const mapStateToProps = (state, props) => ({
  isManager: selectIsUserManager(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  viewEntity: selectViewEntity(state, props.params.id),
  viewTaxonomies: selectViewTaxonomies(state, props.params.id),
  taxonomies: selectTaxonomiesWithCategories(state),
  actionsByActiontype: selectActionsByType(state, props.params.id),
  actionsAsTargetByActiontype: selectActionsAsTargetByType(state, props.params.id),
  actionsAsMemberByActortype: selectActionsAsMemberByActortype(state, props.params.id),
  actionsAsTargetAsMemberByActortype: selectActionsAsTargetAsMemberByActortype(state, props.params.id),
  actionConnections: selectActionConnections(state),
  actorConnections: selectActorConnections(state),
  membersByType: selectMembersByType(state, props.params.id),
  associationsByType: selectAssociationsByType(state, props.params.id),
  subject: selectSubjectQuery(state),
  viewActiontypeId: selectActiontypeQuery(state),
  actortypes: selectActortypes(state),
  actiontypes: selectActiontypes(state),
  users: selectEntityUsers(state, props.params.id),
  userConnections: selectUserConnections(state),
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
    onSetActiontype: (type) => {
      dispatch(setActiontype(type));
    },
    onCreateOption: (args) => {
      dispatch(openNewEntityModal(args));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ActorView));
