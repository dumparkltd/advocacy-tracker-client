/*
 *
 * Activities
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { Box, Text } from 'grommet';
import { List, Map } from 'immutable';
import styled from 'styled-components';

import qe from 'utils/quasi-equals';

import {
  ACTIONTYPES_CONFIG,
  ACTIONTYPE_ACTORTYPES,
  ACTIONTYPE_TARGETTYPES,
  MEMBERSHIPS,
} from 'themes/config';
import ButtonPill from 'components/buttons/ButtonPill';

import appMessages from 'containers/App/messages';
import ActivitiesByType from './ActivitiesByType';

const TypeSelectBox = styled((p) => <Box {...p} />)``;
const TypeButton = styled((p) => <ButtonPill {...p} />)`
  margin-bottom: 5px;
`;


export function Activities(props) {
  const {
    viewEntity, // current entity
    viewSubject,
    taxonomies,
    actionConnections,
    onSetActiontype,
    viewActiontypeId, // as set in URL
    actionsByActiontype,
    actionsAsTargetByActiontype,
    actiontypes,
    actionsAsMemberByActortype,
    actionsAsTargetAsMemberByActortype,
    viewActortype, // the type of current entity
    onEntityClick,
    intl,
    onCreateOption,
  } = props;

  // figure out connected action types ##################################################
  const canBeMember = viewActortype
    && MEMBERSHIPS[viewActortype.get('id')]
    && MEMBERSHIPS[viewActortype.get('id')].length > 0;

  let actiontypesForSubject;
  let actiontypesAsMemberByActortypeForSubject;
  let actiontypeIdsAsMemberForSubject;
  let actiontypesForSubjectOptions;
  let actiontypeIdsForSubjectOptions;
  let actiontypesAsMemberForSubject;
  let activeActiontypeId;
  let activeActiontypeActions;

  if (viewSubject !== 'members') {
    // direct actions by type for selected subject
    if (viewSubject === 'actors') {
      actiontypesForSubject = actionsByActiontype;
      actiontypesForSubjectOptions = actiontypes.filter(
        (at) => {
          const atId = at.get('id');
          return ACTIONTYPE_ACTORTYPES[atId] && ACTIONTYPE_ACTORTYPES[atId].indexOf(viewActortype.get('id')) > -1;
        }
      );
    } else if (viewSubject === 'targets') {
      actiontypesForSubject = actionsAsTargetByActiontype;
      actiontypesForSubjectOptions = actiontypes.filter(
        (at) => {
          const atId = at.get('id');
          return ACTIONTYPE_TARGETTYPES[atId] && ACTIONTYPE_TARGETTYPES[atId].indexOf(viewActortype.get('id') > -1);
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
        actiontypesAsMemberByActortypeForSubject = actionsAsMemberByActortype;
        // indirect actiontypeids for selected subject
        actiontypeIdsAsMemberForSubject = actiontypesAsMemberByActortypeForSubject
          .reduce(
            (memo, typeActors) => memo.concat(
              typeActors.reduce(
                (memo2, actor) => memo2.concat(actor.get('actionsByType').keySeq()),
                List(),
              )
            ),
            List(),
          )
          .toSet()
          .filter(
            (atId) => ACTIONTYPE_ACTORTYPES[atId] && ACTIONTYPE_ACTORTYPES[atId].indexOf(viewActortype.get('id')) > -1
          );
      } else if (viewSubject === 'targets') {
        actiontypesAsMemberByActortypeForSubject = actionsAsTargetAsMemberByActortype;
        // indirect actiontypeids for selected subject
        actiontypeIdsAsMemberForSubject = actiontypesAsMemberByActortypeForSubject
          .reduce(
            (memo, typeActors) => memo.concat(
              typeActors.reduce(
                (memo2, actor) => memo2.concat(actor.get('targetingActionsByType').keySeq()),
                List(),
              )
            ),
            List(),
          )
          .toSet()
          .filter(
            (atId) => ACTIONTYPE_TARGETTYPES[atId] && ACTIONTYPE_TARGETTYPES[atId].indexOf(viewActortype.get('id')) > -1
          );
      }
    }

    // concat w/ active types for available tabs
    if (actiontypeIdsAsMemberForSubject) {
      actiontypeIdsForSubjectOptions = actiontypeIdsForSubjectOptions
        ? actiontypeIdsForSubjectOptions.concat(
          actiontypeIdsAsMemberForSubject
        ).toSet()
        : (actiontypeIdsAsMemberForSubject && actiontypeIdsAsMemberForSubject.toSet());
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
    if (canBeMember) {
      // figure out inactive action types
      if (viewSubject === 'actors' || viewSubject === 'targets') {
        actiontypesAsMemberForSubject = actiontypesAsMemberByActortypeForSubject.reduce(
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
  }

  const typeLabel = intl.formatMessage(appMessages.entities[`actions_${activeActiontypeId}`].plural);
  return (
    <Box>
      {(!actiontypeIdsForSubjectOptions || actiontypeIdsForSubjectOptions.size === 0) && (
        <Box margin={{ vertical: 'small', horizontal: 'medium' }}>
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
        <TypeSelectBox
          direction="row"
          gap="xxsmall"
          margin={{ top: 'small', horizontal: 'medium', bottom: 'medium' }}
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
      )}
      <ActivitiesByType
        viewEntity={viewEntity}
        viewSubject={viewSubject}
        taxonomies={taxonomies}
        actionConnections={actionConnections}
        canBeMember={canBeMember}
        activeActiontypeId={activeActiontypeId}
        activeActiontypeActions={activeActiontypeActions}
        typeLabel={typeLabel}
        actiontypesAsMemberForSubject={actiontypesAsMemberForSubject}
        onEntityClick={onEntityClick}
        onCreateOption={onCreateOption}
      />
    </Box>
  );
}

Activities.propTypes = {
  viewEntity: PropTypes.instanceOf(Map),
  viewSubject: PropTypes.string,
  viewActortype: PropTypes.instanceOf(Map),
  taxonomies: PropTypes.instanceOf(Map),
  actionConnections: PropTypes.instanceOf(Map),
  onSetActiontype: PropTypes.func,
  onEntityClick: PropTypes.func,
  viewActiontypeId: PropTypes.string,
  actionsByActiontype: PropTypes.instanceOf(Map),
  actionsAsTargetByActiontype: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  actionsAsMemberByActortype: PropTypes.instanceOf(Map),
  actionsAsTargetAsMemberByActortype: PropTypes.instanceOf(Map),
  onCreateOption: PropTypes.func,
  intl: intlShape,
};


export default injectIntl(Activities);
