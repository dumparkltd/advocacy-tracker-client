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
  getHighestUserRoleId,
} from 'utils/fields';

import qe from 'utils/quasi-equals';
import { getEntityTitle, getActortypeColumns } from 'utils/entities';

import {
  loadEntitiesIfNeeded,
  updatePath,
  closeEntity,
  setSubject,
  setActiontype,
  openNewEntityModal,
  printView,
} from 'containers/App/actions';

import { CONTENT_SINGLE, PRINT_TYPES } from 'containers/App/constants';
import {
  USER_ROLES,
  ROUTES,
  ACTORTYPES,
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
import SubjectButton from 'components/styled/SubjectButton';
import SubjectButtonGroup from 'components/styled/SubjectButtonGroup';
import HeaderPrint from 'components/Header/HeaderPrint';

import {
  selectReady,
  selectSessionUserId,
  selectSessionUserHighestRoleId,
  selectActionConnections,
  selectActorConnections,
  selectIsUserMember,
  selectIsUserAdmin,
  selectSubjectQuery,
  selectActiontypeQuery,
  selectActortypes,
  selectActiontypes,
  selectTaxonomiesWithCategories,
  selectIsPrintView,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';

import { keydownHandlerPrint } from 'utils/print';
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
// const getHighestUserRoleId = (user) => user
//   ? user.get('roles').reduce(
//     (memo, role) => (role && role.get('id') < memo) ? role.get('id') : memo,
//     USER_ROLES.DEFAULT.value
//   )
//   : USER_ROLES.DEFAULT.value;

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
  isMember,
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
  isAdmin,
  onSetPrintView,
  isPrintView,
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

  const mySetPrintView = () => onSetPrintView({
    printType: PRINT_TYPES.SINGLE,
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

  const pageTitle = intl.formatMessage(
    isMember ? messages.pageTitleBack : messages.pageTitle
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
      onClick: () => mySetPrintView(),
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
  const sessionUserHighestRole = Object.values(USER_ROLES).find((r) => qe(r.value, sessionUserHighestRoleId));
  const userHighestRole = user && Object.values(USER_ROLES).find((r) => qe(r.value, getHighestUserRoleId(user.get('roles'))));
  if (user
    && (
      sessionUserHighestRoleId === USER_ROLES.ADMIN.value // is admin
      || userId === sessionUserId // own profile
      || sessionUserHighestRole.order < userHighestRole.order // TODO verify
    )
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
            {isPrintView && (<HeaderPrint />)}
            <ViewHeader
              title={pageTitle}
              type={CONTENT_SINGLE}
              buttons={buttons}
              onClose={() => handleClose()}
              onTypeClick={isMember ? () => handleTypeClick() : null}
            />
            <ViewPanel>
              <ViewPanelInside>
                <Main hasAside={isMember && !isPrintView}>
                  <FieldGroup
                    aside={!isPrintView}
                    group={{ // fieldGroup
                      fields: [
                        getTitleField(user, isMember, 'name', appMessages.attributes.name),
                      ],
                    }}
                  />
                </Main>
                {isMember && (
                  <Aside>
                    <FieldGroup
                      group={{
                        fields: [
                          getRoleField(user),
                          getMetaField(user, true),
                        ],
                      }}
                      aside={!isPrintView}
                    />
                  </Aside>
                )}
              </ViewPanelInside>
            </ViewPanel>
            <ViewPanel>
              <ViewPanelInside>
                <Main hasAside={!isPrintView} bottom>
                  {isMember && (
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
                          <Text size="large">Stakeholders</Text>
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
                          isAdmin={isAdmin}
                          isPrint={isPrintView}
                        />
                      )}
                      {viewSubject === 'uactors' && actorsByActortype && (
                        <FieldGroup
                          aside={!isPrintView}
                          group={{
                            fields: actorsByActortype.reduce(
                              (memo, actors, typeid) => memo.concat([
                                getActorConnectionField({
                                  actors,
                                  taxonomies,
                                  onEntityClick,
                                  connections: actorConnections,
                                  typeid,
                                  columns: getActortypeColumns({
                                    typeId: typeid,
                                    showCode: isAdmin || qe(typeid, ACTORTYPES.COUNTRY),
                                    isAdmin,
                                  }),
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
                    aside={!isPrintView}
                  />
                  {isMember && (
                    <FieldGroup
                      group={{
                        fields: [
                          getTaxonomyFields(taxonomies),
                        ],
                      }}
                      aside={!isPrintView}
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
  isMember: PropTypes.bool,
  isAdmin: PropTypes.bool,
  isPrintView: PropTypes.bool,
  sessionUserId: PropTypes.string,
  viewActiontypeId: PropTypes.string,
  intl: intlShape,
  subject: PropTypes.string,
  onSetSubject: PropTypes.func,
  onSetPrintView: PropTypes.func,
};

const mapStateToProps = (state, props) => ({
  isMember: selectIsUserMember(state),
  isAdmin: selectIsUserAdmin(state),
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
  isPrintView: selectIsPrintView(state),
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
    onSetPrintView: (config) => {
      dispatch(printView(config));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(UserView));
