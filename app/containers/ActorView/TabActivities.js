/*
 *
 * TabActivities
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { Box, Text } from 'grommet';
import { Map } from 'immutable';
import styled from 'styled-components';

import qe from 'utils/quasi-equals';

import {
  ACTIONTYPES_CONFIG,
  ACTIONTYPE_ACTORTYPES,
  ACTIONTYPE_TARGETTYPES,
  MEMBERSHIPS,
} from 'themes/config';

import {
  setActiontype,
} from 'containers/App/actions';

import {
  selectActiontypes,
  selectActiontypeQuery,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';
import PrintHide from 'components/styled/PrintHide';
import PrintOnly from 'components/styled/PrintOnly';
import ButtonPill from 'components/buttons/ButtonPill';
import TabActivitiesByType from './TabActivitiesByType';

import {
  selectActionsAsTargetByType,
  selectActionsAsMemberByActortype,
  selectActionsAsTargetAsMemberByActortype,
  selectActionsViaMembersByActortype,
  selectActionsAsTargetViaMembersByActortype,
} from './selectors';

const TypeSelectBox = styled((p) => <Box {...p} />)``;
const TypeButton = styled((p) => <ButtonPill {...p} />)`
  margin-bottom: 5px;
`;
const StyledPrint = styled.div`
  margin-left: 0;
`;

export function TabActivities(props) {
  const {
    viewEntity, // current entity
    viewSubject,
    taxonomies,
    onSetActiontype,
    viewActiontypeId, // as set in URL
    actionsByActiontype,
    actionsAsTargetByActiontype,
    actiontypes,
    actionsAsMemberByActortype,
    actionsAsTargetAsMemberByActortype,
    onEntityClick,
    intl,
    actionsViaMembersByActortype,
    actionsAsTargetViaMembersByActortype,
    isAdmin,
    showAllActionTypes,
  } = props;

  const viewActortypeId = viewEntity.getIn(['attributes', 'actortype_id']).toString();
  // figure out connected action types ##################################################
  const canBeMember = viewActortypeId
    && MEMBERSHIPS[viewActortypeId]
    && MEMBERSHIPS[viewActortypeId].length > 0;
  const canHaveMembers = viewActortypeId
    && Object.values(MEMBERSHIPS).reduce(
      (memo, actorGroups) => [...memo, ...actorGroups],
      [],
    ).indexOf(viewActortypeId) > -1;
  let actiontypesForSubject;
  let actiontypesAsMemberByActortypeForSubject;
  let actiontypesViaMembersByActortypeForSubject;
  let actiontypesAsMemberForSubject;
  let actiontypesViaMembersForSubject;
  let actiontypesForSubjectOptions;
  let actiontypeIdsForSubjectOptions;
  let activeActiontypeId;
  let activeActiontypeActions;

  if (viewSubject !== 'members') {
    // direct actions by type for selected subject
    if (viewSubject === 'actors') {
      actiontypesForSubject = actionsByActiontype;
      actiontypesForSubjectOptions = actiontypes.filter(
        (at) => {
          const atId = at.get('id');
          return ACTIONTYPE_ACTORTYPES[atId] && ACTIONTYPE_ACTORTYPES[atId].indexOf(viewActortypeId) > -1;
        }
      );
    } else if (viewSubject === 'targets') {
      actiontypesForSubject = actionsAsTargetByActiontype;
      actiontypesForSubjectOptions = actiontypes.filter(
        (at) => {
          const atId = at.get('id');
          return ACTIONTYPE_TARGETTYPES[atId] && ACTIONTYPE_TARGETTYPES[atId].indexOf(viewActortypeId) > -1;
        }
      );
    }
    // direct && indirect actiontypeids for selected subject
    actiontypeIdsForSubjectOptions = actiontypesForSubjectOptions
      && actiontypesForSubjectOptions.entrySeq().map(([id]) => id.toString());
    // any indirect actions present for selected subject and type?
    // indirect actions by type for selected subject
    if (canBeMember) {
      if (viewSubject === 'actors') {
        // indirect actiontypeids for selected subject
        actiontypesAsMemberByActortypeForSubject = actionsAsMemberByActortype;
      } else if (viewSubject === 'targets') {
        actiontypesAsMemberByActortypeForSubject = actionsAsTargetAsMemberByActortype;
      }
    }
    if (canHaveMembers) {
      if (viewSubject === 'actors') {
        // indirect actiontypeids for selected subject
        actiontypesViaMembersByActortypeForSubject = actionsViaMembersByActortype;
      } else if (viewSubject === 'targets') {
        actiontypesViaMembersByActortypeForSubject = actionsAsTargetViaMembersByActortype;
      }
    }

    // sort
    actiontypeIdsForSubjectOptions = actiontypeIdsForSubjectOptions
      && actiontypeIdsForSubjectOptions.sort((a, b) => {
        const configA = ACTIONTYPES_CONFIG[a];
        const configB = ACTIONTYPES_CONFIG[b];
        return configA.order < configB.order ? -1 : 1;
      });
    // figure out active action type #################################################
    // selected actiontype (or first in list when not in list)
    activeActiontypeId = viewActiontypeId;
    if (actiontypeIdsForSubjectOptions && !actiontypeIdsForSubjectOptions.includes(viewActiontypeId.toString())) {
      activeActiontypeId = actiontypeIdsForSubjectOptions.first();
    }
    // figure out actions for active action type #################################################

    // direct actions for selected subject and type
    activeActiontypeActions = actiontypesForSubject && actiontypesForSubject.get(parseInt(activeActiontypeId, 10));
    // figure out inactive action types
    if (canBeMember && (viewSubject === 'actors' || viewSubject === 'targets')) {
      actiontypesAsMemberForSubject = actiontypesAsMemberByActortypeForSubject
        && actiontypesAsMemberByActortypeForSubject.reduce(
          (memo, typeActors, id) => {
            if (typeActors && typeActors.size > 0) {
              return memo.merge(Map().set(id, typeActors));
            }
            return memo;
          },
          Map(),
        );
    }
    // figure out inactive action types
    if (canHaveMembers && (viewSubject === 'actors' || viewSubject === 'targets')) {
      actiontypesViaMembersForSubject = actiontypesViaMembersByActortypeForSubject
        && actiontypesViaMembersByActortypeForSubject.reduce(
          (memo, typeActors, id) => {
            if (typeActors && typeActors.size > 0) {
              return memo.merge(Map().set(id, typeActors));
            }
            return memo;
          },
          Map(),
        );
    }
  }
  return (
    <Box>
      {(!actiontypeIdsForSubjectOptions || actiontypeIdsForSubjectOptions.size === 0) && (
        <Box margin={{ vertical: 'small' }}>
          {viewSubject === 'actors' && (
            <Text>
              No activities for actor in database
            </Text>
          )}
          {viewSubject === 'targets' && (
            <Text>
              Actor not target of any activities in database
            </Text>
          )}
        </Box>
      )}
      {actiontypeIdsForSubjectOptions && actiontypeIdsForSubjectOptions.size > 0 && (
        <>
          <PrintHide>
            <TypeSelectBox
              direction="row"
              gap="xxsmall"
              margin={{ top: 'small', bottom: 'medium' }}
              wrap
            >
              {actiontypeIdsForSubjectOptions.map(
                (id) => (
                  <TypeButton
                    key={id}
                    onClick={() => onSetActiontype(id)}
                    active={qe(activeActiontypeId, id) || actiontypeIdsForSubjectOptions.size === 1}
                    listItems={actiontypeIdsForSubjectOptions.size}
                  >
                    <Text size="small">
                      <FormattedMessage {...appMessages.entities[`actions_${id}`].pluralShort} />
                    </Text>
                  </TypeButton>
                )
              )}
            </TypeSelectBox>
          </PrintHide>
        </>
      )}
      {viewEntity
        && actiontypes
        && (activeActiontypeId || showAllActionTypes)
        && actiontypeIdsForSubjectOptions
        && actiontypeIdsForSubjectOptions.size > 0
        && actiontypeIdsForSubjectOptions.filter(
          (typeId) => showAllActionTypes || qe(typeId, activeActiontypeId)
        ).map((typeId) => {
          const typeLabel = intl.formatMessage(appMessages.entities[`actions_${typeId}`].plural);
          return (
            <div key={typeId}>
              <PrintOnly>
                <StyledPrint>
                  <Text size="small" style={{ textDecoration: 'underline' }}>{typeLabel}</Text>
                </StyledPrint>
              </PrintOnly>
              <TabActivitiesByType
                isAdmin={isAdmin}
                viewEntity={viewEntity}
                viewSubject={viewSubject}
                taxonomies={taxonomies}
                canBeMember={canBeMember}
                canHaveMembers={canHaveMembers}
                activeActiontypeId={activeActiontypeId}
                activeActiontypeActions={activeActiontypeActions}
                typeLabel={typeLabel}
                actiontypesAsMemberForSubject={actiontypesAsMemberForSubject}
                actiontypesViaMembersForSubject={actiontypesViaMembersForSubject}
                onEntityClick={onEntityClick}
              />
            </div>
          );
        })}
    </Box>
  );
}

TabActivities.propTypes = {
  viewEntity: PropTypes.instanceOf(Map),
  viewSubject: PropTypes.string,
  isAdmin: PropTypes.bool,
  showAllActionTypes: PropTypes.bool,
  taxonomies: PropTypes.instanceOf(Map),
  onSetActiontype: PropTypes.func,
  onEntityClick: PropTypes.func,
  viewActiontypeId: PropTypes.string,
  actionsByActiontype: PropTypes.instanceOf(Map),
  actionsAsTargetByActiontype: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  actionsAsMemberByActortype: PropTypes.instanceOf(Map),
  actionsAsTargetAsMemberByActortype: PropTypes.instanceOf(Map),
  actionsViaMembersByActortype: PropTypes.instanceOf(Map),
  actionsAsTargetViaMembersByActortype: PropTypes.instanceOf(Map),
  intl: intlShape,
};


const mapStateToProps = (state, { viewEntity }) => ({
  actiontypes: selectActiontypes(state),
  viewActiontypeId: selectActiontypeQuery(state),
  actionsAsTargetByActiontype: selectActionsAsTargetByType(state, viewEntity.get('id')),
  actionsAsMemberByActortype: selectActionsAsMemberByActortype(state, viewEntity.get('id')),
  actionsAsTargetAsMemberByActortype: selectActionsAsTargetAsMemberByActortype(state, viewEntity.get('id')),
  actionsViaMembersByActortype: selectActionsViaMembersByActortype(state, viewEntity.get('id')),
  actionsAsTargetViaMembersByActortype: selectActionsAsTargetViaMembersByActortype(state, viewEntity.get('id')),
});

function mapDispatchToProps(dispatch) {
  return {
    onSetActiontype: (type) => {
      dispatch(setActiontype(type));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(TabActivities));
