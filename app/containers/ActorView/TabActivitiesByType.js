/*
 *
 * TabActivitiesByType
 *
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import {
  Box,
  Accordion,
  AccordionPanel,
} from 'grommet';
import { List, Map } from 'immutable';
// import styled from 'styled-components';

import { getActionConnectionField } from 'utils/fields';
import { lowerCase } from 'utils/string';

import {
  ACTIONTYPES_CONFIG,
  API,
} from 'themes/config';
import FieldGroup from 'components/fields/FieldGroup';
import AccordionHeader from 'components/AccordionHeader';

import {
  openNewEntityModal,
} from 'containers/App/actions';
import {
  selectActionConnections,
} from 'containers/App/selectors';
import appMessages from 'containers/App/messages';

const getActiontypeColumns = (typeid, viewSubject, isAdmin) => {
  let columns = [{
    id: 'main',
    type: 'main',
    sort: 'title',
    attributes: isAdmin ? ['code', 'title'] : ['title'],
  }];

  if (
    ACTIONTYPES_CONFIG[parseInt(typeid, 10)]
    && ACTIONTYPES_CONFIG[parseInt(typeid, 10)].columns
  ) {
    columns = [
      ...columns,
      ...ACTIONTYPES_CONFIG[parseInt(typeid, 10)].columns.filter(
        (col) => {
          if (typeof col.showOnSingle !== 'undefined') {
            if (viewSubject && Array.isArray(col.showOnSingle)) {
              return col.showOnSingle.indexOf(viewSubject) > -1;
            }
            return col.showOnSingle;
          }
          return true;
        }
      ),
    ];
  }
  return columns;
};


const getTypeLabel = (
  typeId,
  count,
  intl,
) => lowerCase(intl.formatMessage(appMessages.entities[`actions_${typeId}`][count === 1 ? 'single' : 'plural']));

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
      .filter((association) => {
        if (viewSubject === 'actors') {
          return association.get('actionsByType')
            && association.getIn(['actionsByType', activeActiontypeId])
            && association.getIn(['actionsByType', activeActiontypeId]).size > 0;
        }
        if (viewSubject === 'targets') {
          return association.get('targetingActionsByType')
            && association.getIn(['targetingActionsByType', activeActiontypeId])
            && association.getIn(['targetingActionsByType', activeActiontypeId]).size > 0;
        }
        return false;
      });
    uniqueActionsAsMember = associationsWithActionsViaMemberships
      && associationsWithActionsViaMemberships.reduce(
        (memo, association) => {
          if (viewSubject === 'actors') {
            return memo.concat(association.getIn(['actionsByType', activeActiontypeId]).valueSeq());
          }
          return memo.concat(association.getIn(['targetingActionsByType', activeActiontypeId]).valueSeq());
        },
        List(),
      ).toSet();
  }
  let membersWithActionsViaMembership;
  let uniqueActionsViaMembers;
  if (canHaveMembers && actiontypesViaMembersForSubject) {
    membersWithActionsViaMembership = actiontypesViaMembersForSubject
      .flatten(true)
      .filter((member) => {
        if (viewSubject === 'actors') {
          return member.get('actionsByType')
            && member.getIn(['actionsByType', activeActiontypeId])
            && member.getIn(['actionsByType', activeActiontypeId]).size > 0;
        }
        if (viewSubject === 'targets') {
          return member.get('targetingActionsByType')
            && member.getIn(['targetingActionsByType', activeActiontypeId])
            && member.getIn(['targetingActionsByType', activeActiontypeId]).size > 0;
        }
        return false;
      });
    uniqueActionsViaMembers = membersWithActionsViaMembership
      && membersWithActionsViaMembership.reduce(
        (memo, member) => {
          if (viewSubject === 'actors') {
            return memo.concat(member.getIn(['actionsByType', activeActiontypeId]).valueSeq());
          }
          return memo.concat(member.getIn(['targetingActionsByType', activeActiontypeId]).valueSeq());
        },
        List(),
      ).toSet();
  }
  const hasAsMemberPanel = canBeMember && uniqueActionsAsMember && uniqueActionsAsMember.size > 0;
  const hasViaMembersPanel = canHaveMembers && uniqueActionsViaMembers && uniqueActionsViaMembers.size > 0;

  return (
    <Box margin={{ bottom: 'xlarge' }}>
      <Accordion
        activeIndex={actives}
        onActive={(newActive) => setActive(newActive)}
        multiple
        animate={false}
      >
        <AccordionPanel
          header={(
            <AccordionHeader
              title={
                `Direct${
                  viewSubject === 'actors' ? '' : ' (as target)'
                }: ${
                  activeActiontypeActions ? activeActiontypeActions.size : 0
                } ${
                  getTypeLabel(activeActiontypeId, activeActiontypeActions ? activeActiontypeActions.size : 0, intl)
                }`
              }
              open={actives.includes(0)}
            />
          )}
        >
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
                    columns: getActiontypeColumns(
                      activeActiontypeId,
                      viewSubject,
                      isAdmin,
                    ),
                    onCreateOption: () => onCreateOption({
                      path: API.ACTIONS,
                      attributes: {
                        measuretype_id: activeActiontypeId,
                      },
                      invalidateEntitiesOnSuccess: API.ACTORS,
                      autoUser: true,
                      connect: {
                        type: viewSubject === 'actors' ? 'actorActions' : 'actionActors',
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
        </AccordionPanel>
        {hasAsMemberPanel && (
          <AccordionPanel
            header={(
              <AccordionHeader
                title={
                  `As member${viewSubject === 'actors' ? '' : ' (of target)'}: ${uniqueActionsAsMember.size} ${getTypeLabel(activeActiontypeId, uniqueActionsAsMember.size, intl)}`
                }
                open={actives.includes(1)}
              />
            )}
          >
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
                            actions: actor.getIn([viewSubject === 'actors' ? 'actionsByType' : 'targetingActionsByType', activeActiontypeId]),
                            taxonomies,
                            onEntityClick,
                            connections: actionConnections,
                            typeid: activeActiontypeId,
                            columns: getActiontypeColumns(
                              activeActiontypeId,
                              viewSubject,
                              isAdmin,
                            ),
                          }),
                        ],
                      }}
                    />
                  </Box>
                );
              }
            )}
          </AccordionPanel>
        )}
        {hasViaMembersPanel && (
          <AccordionPanel
            header={(
              <AccordionHeader
                title={
                  `From members${viewSubject === 'actors' ? '' : ' (as targets)'}: ${uniqueActionsViaMembers.size} ${getTypeLabel(activeActiontypeId, uniqueActionsViaMembers.size, intl)}`
                }
                open={actives.includes(hasAsMemberPanel ? 2 : 1)}
              />
            )}
          >
            {membersWithActionsViaMembership && membersWithActionsViaMembership.entrySeq().map(
              ([actorId, actor]) => {
                const actortypeLabel = lowerCase(intl.formatMessage(appMessages.entities[`actors_${actor.getIn(['attributes', 'actortype_id'])}`].singleShort));
                return (
                  <Box key={actorId} pad={{ top: 'medium', bottom: 'hair' }}>
                    <FieldGroup
                      seamless
                      group={{
                        title: `From member: "${actor.getIn(['attributes', 'title'])}" (${actortypeLabel})`,
                        fields: [
                          getActionConnectionField({
                            actions: actor.getIn([viewSubject === 'actors' ? 'actionsByType' : 'targetingActionsByType', activeActiontypeId]),
                            taxonomies,
                            onEntityClick,
                            connections: actionConnections,
                            typeid: activeActiontypeId,
                            columns: getActiontypeColumns(
                              activeActiontypeId,
                              viewSubject,
                              isAdmin,
                            ),
                          }),
                        ],
                      }}
                    />
                  </Box>
                );
              }
            )}
          </AccordionPanel>
        )}
      </Accordion>
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
