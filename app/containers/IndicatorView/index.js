/*
 *
 * IndicatorView
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
  getEntityLinkField,
  getStatusField,
  getStatusFieldIf,
  getMetaField,
  getMarkdownField,
  getReferenceField,
  getIndicatorConnectionField,
} from 'utils/fields';
// import { qe } from 'utils/quasi-equals';
import {
  getEntityTitleTruncated,
  getIndicatorColumnsForStatement,
} from 'utils/entities';
import qe from 'utils/quasi-equals';
import { keydownHandlerPrint } from 'utils/print';

import {
  loadEntitiesIfNeeded,
  updatePath,
  closeEntity,
  setSubject,
  setIncludeActorMembers,
  setIncludeInofficialStatements,
  setIncludeUnpublishedAPIStatements,
  printView,
} from 'containers/App/actions';

import {
  selectReady,
  selectIsUserMember,
  selectIsUserAdmin,
  selectSessionUserId,
  selectSubjectQuery,
  selectIncludeActorMembers,
  selectIncludeInofficialStatements,
  selectIncludeUnpublishedAPIStatements,
  selectIsPrintView,
  selectPrintConfig,
} from 'containers/App/selectors';

import {
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
import PrintOnly from 'components/styled/PrintOnly';
import PrintHide from 'components/styled/PrintHide';

import appMessages from 'containers/App/messages';
import { PRINT_TYPES } from 'containers/App/constants';
import CountryMap from './CountryMap';
import Actors from './Actors';
import Statements from './Statements';
import messages from './messages';

import {
  selectViewEntity,
  selectActorsByType,
  selectChildIndicators,
} from './selectors';

import { DEPENDENCIES } from './constants';

const PrintSectionTitleWrapper = styled(
  (p) => <Box margin={{ top: 'large', bottom: 'small' }} pad={{ bottom: 'small' }} border="bottom" {...p} />
)``;
export function IndicatorView({
  viewEntity,
  dataReady,
  isMember,
  isAdmin,
  myId,
  onEntityClick,
  handleEdit,
  handleClose,
  actorsByActortype,
  intl,
  onSetSubject,
  subject,
  onSetIncludeInofficial,
  onSetIncludeUnpublishedAPI,
  includeInofficial,
  includeUnpublishedAPI,
  onSetIncludeActorMembers,
  includeActorMembers,
  onLoadEntitiesIfNeeded,
  params,
  onSetPrintView,
  isPrintView,
  printArgs,
  childIndicators,
}) {
  useEffect(() => {
    if (!dataReady) onLoadEntitiesIfNeeded();
  }, [dataReady]);

  const mySetPrintView = () => onSetPrintView({
    printType: PRINT_TYPES.SINGLE,
    printContentOptions: { tabs: true, types: false },
    printMapOptions: { markers: true },
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
  const countries = actorsByActortype && actorsByActortype.get(parseInt(ACTORTYPES.COUNTRY, 10));
  // view subject
  let viewSubject = subject || 'statements';
  const validViewSubjects = ['statements', 'actors'];
  if (validViewSubjects.indexOf(viewSubject) === -1) {
    viewSubject = validViewSubjects.length > 0 ? validViewSubjects[0] : null;
  }

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
  const pageTitle = intl.formatMessage(appMessages.entities.indicators.single);

  const metaTitle = viewEntity
    ? `${pageTitle}: ${getEntityTitleTruncated(viewEntity)}`
    : `${pageTitle}: ${params.id}`;
  const isMine = viewEntity && qe(viewEntity.getIn(['attributes', 'created_by_id']), myId);

  return (
    <div>
      <Helmet
        title={metaTitle}
        meta={[
          { name: 'description', content: intl.formatMessage(messages.metaDescription) },
        ]}
      />
      <Content isSingle>
        {!dataReady && <Loading />}
        {!viewEntity && dataReady && (
          <div>
            <FormattedMessage {...messages.notFound} />
          </div>
        )}
        {viewEntity && dataReady && (
          <ViewWrapper>
            {isPrintView && (<HeaderPrint />)}
            <ViewHeader
              title={intl.formatMessage(appMessages.entities.indicators.plural)}
              buttons={buttons}
              onClose={() => handleClose()}
              onTypeClick={() => handleClose()}
            />
            <ViewPanel>
              <ViewPanelInside>
                <Main hasAside={isMember && !isPrintView}>
                  <FieldGroup
                    group={{ // fieldGroup
                      fields: [
                        getReferenceField(
                          viewEntity,
                          'code',
                          isAdmin,
                        ),
                        getTitleField(viewEntity),
                        // order
                        getReferenceField(
                          viewEntity,
                          'reference',
                          isAdmin,
                        ),
                        getReferenceField(
                          viewEntity,
                          'code_api',
                          isAdmin,
                        ),
                      ],
                    }}
                  />
                  {viewEntity.get('parent') && (
                    <FieldGroup
                      group={{ // fieldGroup
                        label: appMessages.attributes.parent_id,
                        fields: [
                          getEntityLinkField(
                            viewEntity.get('parent'),
                            '/topic',
                            '',
                            'Parent topic'
                          )],
                      }}
                    />
                  )}
                  {childIndicators && childIndicators.size > 0 && (
                    <FieldGroup
                      group={{
                        label: appMessages.nav.indicators,
                        fields: [
                          getIndicatorConnectionField({
                            indicators: childIndicators,
                            onEntityClick,
                            skipLabel: true,
                            columns: getIndicatorColumnsForStatement({
                              intl,
                              isAdmin,
                            }),
                          }),
                        ],
                      }}
                    />
                  )}
                </Main>
                {isMember && !isPrintView && (
                  <Aside>
                    <FieldGroup
                      group={{
                        fields: [
                          getStatusField(viewEntity, 'public_api'),
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
                <Main bottom>
                  <FieldGroup
                    group={{
                      fields: [
                        getMarkdownField(viewEntity, 'description', true),
                      ],
                    }}
                  />
                  <Box pad={{ vertical: 'small' }}>
                    <CountryMap
                      countries={countries}
                      indicatorId={viewEntity.get('id')}
                      onEntityClick={(id, path) => onEntityClick(id, path || ROUTES.ACTOR)}
                      includeInofficial={includeInofficial}
                      onSetIncludeInofficial={onSetIncludeInofficial}
                      includeUnpublishedAPI={includeUnpublishedAPI}
                      onSetIncludeUnpublishedAPI={onSetIncludeUnpublishedAPI}
                      includeActorMembers={includeActorMembers}
                      onSetIncludeActorMembers={onSetIncludeActorMembers}
                    />
                  </Box>
                  <Box margin={{ vertical: 'large' }}>
                    <PrintHide>
                      <SubjectButtonGroup margin={{ horizontal: 'medium' }}>
                        <SubjectButton
                          onClick={() => onSetSubject('statements')}
                          active={viewSubject === 'statements'}
                        >
                          <Text size="large">Statements</Text>
                        </SubjectButton>
                        <SubjectButton
                          onClick={() => onSetSubject('actors')}
                          active={viewSubject === 'actors'}
                        >
                          <Text size="large">Countries & other actors</Text>
                        </SubjectButton>
                      </SubjectButtonGroup>
                    </PrintHide>
                    {(viewSubject === 'statements' || (isPrintView && printArgs && printArgs.printTabs === 'all')) && (
                      <>
                        {' '}
                        {isPrintView
                        && (
                          <PrintOnly>
                            <PrintSectionTitleWrapper>
                              <Text size="large">Statements</Text>
                            </PrintSectionTitleWrapper>
                          </PrintOnly>
                        )}
                        <Statements
                          viewEntity={viewEntity}
                        />
                      </>
                    )}
                    {(viewSubject === 'actors' || (isPrintView && printArgs && printArgs.printTabs === 'all')) && (
                      <>
                        {' '}
                        {isPrintView
                        && (
                          <PrintOnly>
                            <PrintSectionTitleWrapper>
                              <Text size="large">Countries & other actors</Text>
                            </PrintSectionTitleWrapper>
                          </PrintOnly>
                        )}
                        <Actors
                          viewEntity={viewEntity}
                          isAdmin={isAdmin}
                        />
                      </>
                    )}
                  </Box>
                </Main>
              </ViewPanelInside>
            </ViewPanel>
          </ViewWrapper>
        )}
      </Content>
    </div>
  );
}

IndicatorView.propTypes = {
  viewEntity: PropTypes.object,
  onLoadEntitiesIfNeeded: PropTypes.func,
  dataReady: PropTypes.bool,
  handleEdit: PropTypes.func,
  handleClose: PropTypes.func,
  onEntityClick: PropTypes.func,
  onSetPrintView: PropTypes.func,
  actorsByActortype: PropTypes.object,
  childIndicators: PropTypes.object,
  params: PropTypes.object,
  myId: PropTypes.string,
  isMember: PropTypes.bool,
  isAdmin: PropTypes.bool,
  subject: PropTypes.string,
  onSetSubject: PropTypes.func,
  onSetIncludeInofficial: PropTypes.func,
  onSetIncludeUnpublishedAPI: PropTypes.func,
  includeInofficial: PropTypes.bool,
  includeUnpublishedAPI: PropTypes.bool,
  onSetIncludeActorMembers: PropTypes.func,
  includeActorMembers: PropTypes.bool,
  isPrintView: PropTypes.bool,
  printArgs: PropTypes.object,
  intl: intlShape,
};

const mapStateToProps = (state, props) => ({
  isMember: selectIsUserMember(state),
  isAdmin: selectIsUserAdmin(state),
  myId: selectSessionUserId(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  viewEntity: selectViewEntity(state, props.params.id),
  actorsByActortype: selectActorsByType(state, props.params.id),
  subject: selectSubjectQuery(state),
  includeInofficial: selectIncludeInofficialStatements(state),
  includeUnpublishedAPI: selectIncludeUnpublishedAPIStatements(state),
  includeActorMembers: selectIncludeActorMembers(state),
  isPrintView: selectIsPrintView(state),
  printArgs: selectPrintConfig(state),
  childIndicators: selectChildIndicators(state, props.params.id),
});

function mapDispatchToProps(dispatch, props) {
  return {
    onLoadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    handleEdit: () => {
      dispatch(updatePath(`${ROUTES.INDICATOR}${ROUTES.EDIT}/${props.params.id}`, { replace: true }));
    },
    handleClose: () => {
      dispatch(closeEntity(ROUTES.INDICATORS));
    },
    onEntityClick: (id, path) => {
      dispatch(updatePath(`${path}/${id}`));
    },
    onSetSubject: (type) => {
      dispatch(setSubject(type));
    },
    onSetIncludeInofficial: (value) => {
      dispatch(setIncludeInofficialStatements(value));
    },
    onSetIncludeUnpublishedAPI: (value) => {
      dispatch(setIncludeUnpublishedAPIStatements(value));
    },
    onSetIncludeActorMembers: (active) => {
      dispatch(setIncludeActorMembers(active));
    },
    onSetPrintView: (config) => {
      dispatch(printView(config));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(IndicatorView));
