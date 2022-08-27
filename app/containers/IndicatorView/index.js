/*
 *
 * IndicatorView
 *
 */

import React from 'react';
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
  getReferenceField,
} from 'utils/fields';
// import { qe } from 'utils/quasi-equals';
import { getEntityTitleTruncated } from 'utils/entities';
import qe from 'utils/quasi-equals';

import {
  loadEntitiesIfNeeded,
  updatePath,
  closeEntity,
  setSubject,
  setIncludeActorMembers,
  setIncludeInofficialStatements,
} from 'containers/App/actions';

import {
  selectReady,
  selectIsUserManager,
  selectIsUserAdmin,
  selectSessionUserId,
  selectSubjectQuery,
  selectIncludeActorMembers,
  selectIncludeInofficialStatements,
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

import appMessages from 'containers/App/messages';
import CountryMap from './CountryMap';
import Actors from './Actors';
import Statements from './Statements';
import messages from './messages';

import {
  selectViewEntity,
  selectActorsByType,
} from './selectors';

import { DEPENDENCIES } from './constants';

const SubjectButton = styled((p) => <Button plain {...p} />)`
  padding: 2px 4px;
  border-bottom: 2px solid;
  border-bottom-color: ${({ active }) => active ? 'brand' : 'transparent'};
  background: none;
`;
export class IndicatorView extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
  }

  render() {
    const {
      viewEntity,
      dataReady,
      isManager,
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
      includeInofficial,
      onSetIncludeActorMembers,
      includeActorMembers,
    } = this.props;

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
    const pageTitle = intl.formatMessage(appMessages.entities.indicators.single);

    const metaTitle = viewEntity
      ? `${pageTitle}: ${getEntityTitleTruncated(viewEntity)}`
      : `${pageTitle}: ${this.props.params.id}`;
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
          { !dataReady && <Loading /> }
          { !viewEntity && dataReady && (
            <div>
              <FormattedMessage {...messages.notFound} />
            </div>
          )}
          { viewEntity && dataReady && (
            <ViewWrapper>
              <ViewHeader
                title={intl.formatMessage(appMessages.entities.indicators.plural)}
                buttons={buttons}
                onClose={() => handleClose()}
                onTypeClick={() => handleClose()}
              />
              <ViewPanel>
                <ViewPanelInside>
                  <Main hasAside={isManager}>
                    <FieldGroup
                      group={{ // fieldGroup
                        fields: [
                          getReferenceField(
                            viewEntity,
                            'code',
                            isManager,
                          ),
                          getTitleField(viewEntity),
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
                        onEntityClick={(id) => onEntityClick(id, ROUTES.ACTOR)}
                        includeInofficial={includeInofficial}
                        onSetIncludeInofficial={onSetIncludeInofficial}
                        includeActorMembers={includeActorMembers}
                        onSetIncludeActorMembers={onSetIncludeActorMembers}
                      />
                    </Box>
                    <Box margin={{ vertical: 'large' }}>
                      <Box direction="row" gap="small" margin={{ horizontal: 'medium' }}>
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
                      </Box>
                      {viewSubject === 'statements' && (
                        <Statements
                          viewEntity={viewEntity}
                        />
                      )}
                      {viewSubject === 'actors' && (
                        <Actors
                          viewEntity={viewEntity}
                        />
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
}

IndicatorView.propTypes = {
  viewEntity: PropTypes.object,
  loadEntitiesIfNeeded: PropTypes.func,
  dataReady: PropTypes.bool,
  handleEdit: PropTypes.func,
  handleClose: PropTypes.func,
  onEntityClick: PropTypes.func,
  actorsByActortype: PropTypes.object,
  params: PropTypes.object,
  myId: PropTypes.string,
  isManager: PropTypes.bool,
  isAdmin: PropTypes.bool,
  subject: PropTypes.string,
  onSetSubject: PropTypes.func,
  onSetIncludeInofficial: PropTypes.func,
  includeInofficial: PropTypes.bool,
  onSetIncludeActorMembers: PropTypes.func,
  includeActorMembers: PropTypes.bool,
  intl: intlShape,
};

const mapStateToProps = (state, props) => ({
  isManager: selectIsUserManager(state),
  isAdmin: selectIsUserAdmin(state),
  myId: selectSessionUserId(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  viewEntity: selectViewEntity(state, props.params.id),
  actorsByActortype: selectActorsByType(state, props.params.id),
  subject: selectSubjectQuery(state),
  includeInofficial: selectIncludeInofficialStatements(state),
  includeActorMembers: selectIncludeActorMembers(state),
});

function mapDispatchToProps(dispatch, props) {
  return {
    loadEntitiesIfNeeded: () => {
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
    onSetIncludeActorMembers: (active) => {
      dispatch(setIncludeActorMembers(active));
    },
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(IndicatorView));
