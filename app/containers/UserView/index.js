/*
 *
 * UserView
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { Box, Text } from 'grommet';

import {
  getTitleField,
  getRoleField,
  getMetaField,
  getEmailField,
  getTaxonomyFields,
  getActorConnectionField,
} from 'utils/fields';

import { getEntityTitle } from 'utils/entities';

import {
  loadEntitiesIfNeeded,
  updatePath,
  closeEntity,
  setSubject,
  setActiontype,
  openNewEntityModal,
} from 'containers/App/actions';

import { CONTENT_SINGLE } from 'containers/App/constants';
import { USER_ROLES, ROUTES, ACTORTYPES_CONFIG } from 'themes/config';

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

import {
  selectReady,
  selectSessionUserId,
  selectSessionUserHighestRoleId,
  selectActionConnections,
  selectActorConnections,
  selectIsUserManager,
  selectSubjectQuery,
  selectActiontypeQuery,
  selectActortypes,
  selectActiontypes,
  selectTaxonomiesWithCategories,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';

import Activities from './Activities';
import messages from './messages';

import {
  selectViewEntity,
  selectViewTaxonomies,
  selectActionsByType,
  selectActorsByType,
} from './selectors';

import { DEPENDENCIES } from './constants';

// only show the highest rated role (lower role ids means higher)
const getHighestUserRoleId = (user) => user
  ? user.get('roles').reduce(
    (memo, role) => (role && role.get('id') < memo) ? role.get('id') : memo,
    USER_ROLES.DEFAULT.value
  )
  : USER_ROLES.DEFAULT.value;

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
      ...ACTORTYPES_CONFIG[parseInt(typeid, 10)].columns.filter(
        (col) => {
          if (typeof col.showOnSingle !== 'undefined') {
            return col.showOnSingle;
          }
          return true;
        }
      ),
    ];
  }
  return columns;
};

const VALID_SUBJECTS = ['uactivities', 'uactors'];

export function UserView({
  user,
  dataReady,
  sessionUserHighestRoleId,
  handleTypeClick,
  handleClose,
  taxonomies,
  actionsByActiontype,
  actionConnections,
  actorsByActortype,
  actorConnections,
  onEntityClick,
  isManager,
  handleEditPassword,
  sessionUserId,
  handleEdit,
  intl,
  params,
  onLoadData,
  onSetSubject,
  subject,
  onSetActiontype,
  viewActiontypeId,
  actiontypes,
  onCreateOption,
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

  const pageTitle = intl.formatMessage(
    isManager ? messages.pageTitleBack : messages.pageTitle
  );
  const metaTitle = user
    ? `${pageTitle}: ${getEntityTitle(user)}`
    : `${pageTitle} ${params.id}`;
  const userId = user
    ? user.get('id') || user.getIn(['attributes', 'id'])
    : params.id;

  const viewSubject = VALID_SUBJECTS.indexOf(subject) > -1
    ? subject
    : VALID_SUBJECTS[0];

  const buttons = [];
  if (dataReady) {
    buttons.push({
      type: 'icon',
      onClick: () => window.print(),
      title: 'Print',
      icon: 'print',
    });
  }
  if (userId === sessionUserId) {
    buttons.push({
      type: 'edit',
      title: intl.formatMessage(messages.editPassword),
      onClick: () => handleEditPassword(userId),
    });
  }
  if (sessionUserHighestRoleId === USER_ROLES.ADMIN.value // is admin
    || userId === sessionUserId // own profile
    || sessionUserHighestRoleId < getHighestUserRoleId(user) // TODO verify
  ) {
    buttons.push({
      type: 'edit',
      onClick: () => handleEdit(userId),
    });
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
        {!user && !dataReady && <Loading />}
        {!user && dataReady && (
          <div>
            <FormattedMessage {...messages.notFound} />
          </div>
        )}
        {user && dataReady && (
          <ViewWrapper>
            <ViewHeader
              title={pageTitle}
              type={CONTENT_SINGLE}
              buttons={buttons}
              onClose={() => handleClose()}
              onTypeClick={isManager ? () => handleTypeClick() : null}
            />
            <ViewPanel>
              <ViewPanelInside>
                <Main hasAside={isManager}>
                  <FieldGroup
                    group={{ // fieldGroup
                      fields: [
                        getTitleField(user, isManager, 'name', appMessages.attributes.name),
                      ],
                    }}
                  />
                </Main>
                {isManager && (
                  <Aside>
                    <FieldGroup
                      group={{
                        fields: [
                          getRoleField(user),
                          getMetaField(user, true),
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
                  {isManager && (
                    <Box>
                      <SubjectButtonGroup>
                        <SubjectButton
                          onClick={() => onSetSubject('uactivities')}
                          active={viewSubject === 'uactivities'}
                        >
                          <Text size="large">Activities</Text>
                        </SubjectButton>
                        <SubjectButton
                          onClick={() => onSetSubject('uactors')}
                          active={viewSubject === 'uactors'}
                        >
                          <Text size="large">Actors</Text>
                        </SubjectButton>
                      </SubjectButtonGroup>
                      {(viewSubject === 'uactivities') && (
                        <Activities
                          viewEntity={user}
                          viewSubject={viewSubject}
                          taxonomies={taxonomies}
                          actionConnections={actionConnections}
                          onSetActiontype={onSetActiontype}
                          onEntityClick={onEntityClick}
                          onCreateOption={onCreateOption}
                          viewActiontypeId={viewActiontypeId}
                          actionsByActiontype={actionsByActiontype}
                          actiontypes={actiontypes}
                        />
                      )}
                      {viewSubject === 'uactors' && actorsByActortype && (
                        <FieldGroup
                          group={{
                            fields: actorsByActortype.reduce(
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
                    </Box>
                  )}
                </Main>
                <Aside bottom>
                  <FieldGroup
                    group={{
                      fields: [
                        getEmailField(user),
                      ],
                    }}
                    aside
                  />
                  {isManager && (
                    <FieldGroup
                      group={{
                        fields: [
                          getTaxonomyFields(taxonomies),
                        ],
                      }}
                      aside
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

UserView.propTypes = {
  onLoadData: PropTypes.func,
  handleEdit: PropTypes.func,
  handleEditPassword: PropTypes.func,
  handleClose: PropTypes.func,
  user: PropTypes.object,
  taxonomies: PropTypes.object,
  dataReady: PropTypes.bool,
  sessionUserHighestRoleId: PropTypes.number,
  params: PropTypes.object,
  actionsByActiontype: PropTypes.object,
  actorsByActortype: PropTypes.object,
  actortypes: PropTypes.object,
  actiontypes: PropTypes.object,
  actionConnections: PropTypes.object,
  actorConnections: PropTypes.object,
  handleTypeClick: PropTypes.func,
  onEntityClick: PropTypes.func,
  onCreateOption: PropTypes.func,
  onSetActiontype: PropTypes.func,
  isManager: PropTypes.bool,
  sessionUserId: PropTypes.string,
  viewActiontypeId: PropTypes.string,
  intl: intlShape,
  subject: PropTypes.string,
  onSetSubject: PropTypes.func,
};

const mapStateToProps = (state, props) => ({
  isManager: selectIsUserManager(state),
  sessionUserHighestRoleId: selectSessionUserHighestRoleId(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  sessionUserId: selectSessionUserId(state),
  user: selectViewEntity(state, props.params.id),
  // all connected categories for all user-taggable taxonomies
  viewTaxonomies: selectViewTaxonomies(state, props.params.id),
  taxonomies: selectTaxonomiesWithCategories(state),
  actionsByActiontype: selectActionsByType(state, props.params.id),
  actorsByActortype: selectActorsByType(state, props.params.id),
  actionConnections: selectActionConnections(state),
  actorConnections: selectActorConnections(state),
  subject: selectSubjectQuery(state),
  viewActiontypeId: selectActiontypeQuery(state),
  actortypes: selectActortypes(state),
  actiontypes: selectActiontypes(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadData: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    handleEdit: (userId) => {
      dispatch(updatePath(`${ROUTES.USERS}${ROUTES.EDIT}/${userId}`, { replace: true }));
    },
    handleEditPassword: (userId) => {
      dispatch(updatePath(`${ROUTES.USERS}${ROUTES.PASSWORD}/${userId}`, { replace: true }));
    },
    handleClose: () => {
      dispatch(closeEntity(ROUTES.USERS));
    },
    handleTypeClick: () => {
      dispatch(updatePath(ROUTES.USERS));
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

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(UserView));
