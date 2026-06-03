/*
 *
 * TabActivitiesByType
 *
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Box } from 'grommet';
import { List, Map } from 'immutable';
// import styled from 'styled-components';

import { getActionConnectionField } from 'utils/fields';
import { lowerCase } from 'utils/string';
import { getActiontypeColumns } from 'utils/entities';

import { API, ROUTES } from 'themes/config';
import FieldGroup from 'components/fields/FieldGroup';
import Accordion from 'components/Accordion';
import A from 'components/styled/A';

import {
  openNewEntityModal,
} from 'containers/App/actions';
import {
  selectActionConnections,
} from 'containers/App/selectors';
import appMessages from 'containers/App/messages';

const getTypeLabel = (
  typeId,
  count,
  intl,
) => lowerCase(intl.formatMessage(appMessages.entities[`actions_${typeId}`][count === 1 ? 'single' : 'plural']));

const getActorLink = (entity) => `${ROUTES.ACTOR}/${entity.get('id')}`;

const getActorOnClick = (entity, onEntityClick) => (evt) => {
  if (evt) evt.preventDefault();
  onEntityClick(entity.get('id'), ROUTES.ACTOR);
};


const defaultState = [0];

export function TabActivitiesByType(props) {
  const {
    viewEntity, // current entity
    viewSubject,
    taxonomies,
    actionConnections,
    canBeMember,
    canHaveMembers,
    activeActiontypeId,
    activeActiontypeActions,
    actiontypesAsMemberForSubject,
    actiontypesViaMembersForSubject,
    onEntityClick,
    intl,
    onCreateOption,
    isAdmin,
  } = props;

  const [actives, setActive] = useState(defaultState);

  // reset state
  useEffect(() => {
    setActive(defaultState);
  }, [viewSubject, activeActiontypeId]);

  let associationsWithActionsViaMemberships;
  let uniqueActionsAsMember;
  if (canBeMember && actiontypesAsMemberForSubject) {
    associationsWithActionsViaMemberships = actiontypesAsMemberForSubject
      .flatten(true)
      .filter((association) => association.get('actionsByType')
        && association.getIn(['actionsByType', activeActiontypeId])
        && association.getIn(['actionsByType', activeActiontypeId]).size > 0);
    uniqueActionsAsMember = associationsWithActionsViaMemberships
      && associationsWithActionsViaMemberships.reduce(
        (memo, association) => memo.concat(
          association.getIn(['actionsByType', activeActiontypeId]).valueSeq(),
        ),
        List(),
      ).toSet();
  }
  let membersWithActionsViaMembership;
  let uniqueActionsViaMembers;
  if (canHaveMembers && actiontypesViaMembersForSubject) {
    membersWithActionsViaMembership = actiontypesViaMembersForSubject
      .flatten(true)
      .filter((member) => member.get('actionsByType')
        && member.getIn(['actionsByType', activeActiontypeId])
        && member.getIn(['actionsByType', activeActiontypeId]).size > 0);
    uniqueActionsViaMembers = membersWithActionsViaMembership
      && membersWithActionsViaMembership.reduce(
        (memo, member) => memo.concat(
          member.getIn(['actionsByType', activeActiontypeId]).valueSeq(),
        ),
        List(),
      ).toSet();
  }
  const hasAsMemberPanel = canBeMember && uniqueActionsAsMember && uniqueActionsAsMember.size > 0;
  const hasViaMembersPanel = canHaveMembers && uniqueActionsViaMembers && uniqueActionsViaMembers.size > 0;
  // console.log(hasAsMemberPanel, hasViaMembersPanel, membersWithActionsViaMembership && membersWithActionsViaMembership.toJS())
  return (
    <Box margin={{ bottom: 'xlarge' }}>
      <Accordion
        activePanels={actives}
        onActive={(newActives) => setActive(newActives)}
        options={[
          {
            id: 0,
            titleButton:
              `Direct: ${
                activeActiontypeActions ? activeActiontypeActions.size : 0
              } ${
                getTypeLabel(activeActiontypeId, activeActiontypeActions ? activeActiontypeActions.size : 0, intl)
              }`,
            renderContent: actives.indexOf(0) > -1 && (() => (
              <Box pad={{ vertical: 'small' }}>
                <FieldGroup
                  seamless
                  group={{
                    fields: [
                      getActionConnectionField({
                        actions: activeActiontypeActions,
                        taxonomies,
                        onEntityClick,
                        connections: actionConnections,
                        typeid: activeActiontypeId,
                        columns: getActiontypeColumns({
                          typeId: activeActiontypeId,
                          viewSubject,
                          isAdmin,
                        }),
                        onCreateOption: () => onCreateOption({
                          path: API.ACTIONS,
                          attributes: {
                            measuretype_id: activeActiontypeId,
                          },
                          invalidateEntitiesOnSuccess: [API.ACTORS, API.ACTIONS],
                          autoUser: true,
                          connect: {
                            type: 'actorActions',
                            create: [{
                              actor_id: viewEntity.get('id'),
                            }],
                          },
                        }),
                      }),
                    ],
                  }}
                />
              </Box>
            )),
          },
          hasAsMemberPanel ? {
            id: 1,
            titleButton: `As member: ${uniqueActionsAsMember.size} ${getTypeLabel(activeActiontypeId, uniqueActionsAsMember.size, intl)}`,
            renderContent: (() => (
              <div>
                {associationsWithActionsViaMemberships && associationsWithActionsViaMemberships.entrySeq().map(
                  ([actorId, actor]) => {
                    const actortypeLabel = lowerCase(intl.formatMessage(appMessages.entities[`actors_${actor.getIn(['attributes', 'actortype_id'])}`].singleShort));
                    return (
                      <Box key={actorId} pad={{ top: 'medium', bottom: 'hair' }}>
                        <FieldGroup
                          seamless
                          group={{
                            title: `As member of ${actortypeLabel}: "${actor.getIn(['attributes', 'title'])}"`,
                            fields: [
                              getActionConnectionField({
                                actions: actor.getIn(['actionsByType', activeActiontypeId]),
                                taxonomies,
                                onEntityClick,
                                connections: actionConnections,
                                typeid: activeActiontypeId,
                                columns: getActiontypeColumns({
                                  typeId: activeActiontypeId,
                                  viewSubject,
                                  isAdmin,
                                }),
                              }),
                            ],
                          }}
                        />
                      </Box>
                    );
                  }
                )}
              </div>
            )),
          } : null,
          hasViaMembersPanel ? {
            id: 2,
            titleButton: `From members: ${uniqueActionsViaMembers.size} ${getTypeLabel(activeActiontypeId, uniqueActionsViaMembers.size, intl)}`,
            renderContent: (() => (
              <div>
                {membersWithActionsViaMembership && membersWithActionsViaMembership.entrySeq().map(
                  ([actorId, actor]) => {
                    // console.log(actorId)
                    const actortypeLabel = lowerCase(intl.formatMessage(appMessages.entities[`actors_${actor.getIn(['attributes', 'actortype_id'])}`].singleShort));
                    return (
                      <Box key={actorId} pad={{ top: 'medium', bottom: 'hair' }}>
                        <FieldGroup
                          seamless
                          group={{
                            title: (
                              <div>
                                {`From member ${actortypeLabel}: `}
                                <A
                                  weight={600}
                                  href={getActorLink(actor)}
                                  onClick={getActorOnClick(actor, onEntityClick)}
                                  title={actor.getIn(['attributes', 'title'])}
                                >
                                  {actor.getIn(['attributes', 'title'])}
                                </A>
                              </div>
                            ),
                            fields: [
                              getActionConnectionField({
                                actions: actor.getIn(['actionsByType', activeActiontypeId]),
                                taxonomies,
                                onEntityClick,
                                connections: actionConnections,
                                typeid: activeActiontypeId,
                                columns: getActiontypeColumns({
                                  typeId: activeActiontypeId,
                                  viewSubject,
                                  isAdmin,
                                }),
                              }),
                            ],
                          }}
                        />
                      </Box>
                    );
                  }
                )}
              </div>
            )),
          } : null,
        ]}
      />
    </Box>
  );
}

TabActivitiesByType.propTypes = {
  viewEntity: PropTypes.instanceOf(Map),
  viewSubject: PropTypes.string,
  isAdmin: PropTypes.bool,
  taxonomies: PropTypes.instanceOf(Map),
  actionConnections: PropTypes.instanceOf(Map),
  onEntityClick: PropTypes.func,
  canBeMember: PropTypes.bool,
  canHaveMembers: PropTypes.bool,
  activeActiontypeId: PropTypes.string,
  activeActiontypeActions: PropTypes.instanceOf(Map),
  actiontypesAsMemberForSubject: PropTypes.instanceOf(Map),
  actiontypesViaMembersForSubject: PropTypes.instanceOf(Map),
  onCreateOption: PropTypes.func,
  intl: intlShape,
};

const mapStateToProps = (state) => ({
  actionConnections: selectActionConnections(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onCreateOption: (args) => {
      dispatch(openNewEntityModal(args));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(TabActivitiesByType));
