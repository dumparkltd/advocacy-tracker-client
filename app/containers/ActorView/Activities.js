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

import {
  getActionConnectionField,
} from 'utils/fields';
import qe from 'utils/quasi-equals';

import {
  ROUTES,
  ACTIONTYPES,
  ACTIONTYPES_CONFIG,
  ACTIONTYPE_ACTORTYPES,
  ACTIONTYPE_TARGETTYPES,
  API,
} from 'themes/config';
import FieldGroup from 'components/fields/FieldGroup';
import ButtonPill from 'components/buttons/ButtonPill';

import appMessages from 'containers/App/messages';
import ActorActivitiesMap from './ActorActivitiesMap';

const TypeSelectBox = styled((p) => <Box {...p} />)``;
const TypeButton = styled((p) => <ButtonPill {...p} />)`
  margin-bottom: 5px;
`;
// max-width: ${({ listItems }) => 100 / listItems}%;

const getActiontypeColumns = (typeid, viewSubject) => {
  if (
    ACTIONTYPES_CONFIG[parseInt(typeid, 10)]
    && ACTIONTYPES_CONFIG[parseInt(typeid, 10)].columns
  ) {
    return ACTIONTYPES_CONFIG[parseInt(typeid, 10)].columns.filter(
      (col) => {
        if (typeof col.showOnSingle !== 'undefined') {
          if (viewSubject && Array.isArray(col.showOnSingle)) {
            return col.showOnSingle.indexOf(viewSubject) > -1;
          }
          return col.showOnSingle;
        }
        return true;
      }
    );
  }
  return [{
    id: 'main',
    type: 'main',
    sort: 'title',
    attributes: ['title'],
  }];
};

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
    hasMembers,
    intl,
    onCreateOption,
  } = props;

  // console.log('viewSubject', viewSubject)
  // console.log('viewActiontypeId', viewActiontypeId)
  // console.log('actionsByActiontype', actionsByActiontype && actionsByActiontype.toJS())
  // console.log('actionsAsTargetByActiontype', actionsAsTargetByActiontype && actionsAsTargetByActiontype.toJS())
  // console.log('actiontypes', actiontypes && actiontypes.toJS())
  // console.log('actionsAsMemberByActortype', actionsAsMemberByActortype && actionsAsMemberByActortype.toJS())
  // console.log('actionsAsTargetAsMemberByActortype', actionsAsTargetAsMemberByActortype && actionsAsTargetAsMemberByActortype.toJS())
  // console.log('viewActortype', viewActortype && viewActortype.toJS())
  // console.log('hasMembers', hasMembers)
  // figure out connected action types ##################################################
  const canBeMember = viewActortype && !hasMembers;

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
      if (viewSubject === 'actors') {
        actiontypesAsMemberForSubject = actiontypesAsMemberByActortypeForSubject.reduce(
          (memo, typeActors, id) => {
            const typeActorsForActiveType = typeActors.filter(
              (actor) => actor.get('actionsByType')
              && actor.getIn(['actionsByType', activeActiontypeId])
              && actor.getIn(['actionsByType', activeActiontypeId]).size > 0
            );
            if (typeActorsForActiveType && typeActorsForActiveType.size > 0) {
              return memo.merge(Map().set(id, typeActorsForActiveType));
            }
            return memo;
          },
          Map(),
        );
      } else if (viewSubject === 'targets') {
        actiontypesAsMemberForSubject = actiontypesAsMemberByActortypeForSubject.reduce(
          (memo, typeActors, id) => {
            const typeActorsForActiveType = typeActors.filter(
              (actor) => actor.get('targetingActionsByType')
                && actor.getIn(['targetingActionsByType', activeActiontypeId])
                && actor.getIn(['targetingActionsByType', activeActiontypeId]).size > 0
            );
            if (typeActorsForActiveType && typeActorsForActiveType.size > 0) {
              return memo.merge(Map().set(id, typeActorsForActiveType));
            }
            return memo;
          },
          Map(),
        );
      }
    }
  }
  // figure out if we have a map and what to show #################################################

  // we have the option to include actions for
  //    actors that can be members (i.e. countries)
  // we can have
  // let mapSubject = false;
  // let hasActivityMap = typeId && qe(typeId, ACTORTYPES.COUNTRY);
  let mapSubject = false;
  const hasMemberOption = activeActiontypeId && !qe(activeActiontypeId, ACTIONTYPES.NATL);
  const hasActivityMap = false; // typeId && qe(typeId, ACTORTYPES.COUNTRY);
  let hasTarget;
  const activeActionType = actiontypes && activeActiontypeId && actiontypes.get(activeActiontypeId.toString());
  if (hasActivityMap) {
    if (viewSubject === 'actors') {
      mapSubject = 'targets';
      hasTarget = activeActionType && activeActionType.getIn(['attributes', 'has_target']);
      // only show target maps
      // hasActivityMap = !qe(activeActiontypeId, ACTIONTYPES.NATL);
    } else if (viewSubject === 'targets') {
      mapSubject = 'actors';
    }
  }
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
            (id) => {
              const actiontypeActions = actiontypesForSubject && actiontypesForSubject.get(parseInt(id, 10));
              const noActions = actiontypeActions ? actiontypeActions.size : 0;
              return (
                <TypeButton
                  key={id}
                  onClick={() => onSetActiontype(id)}
                  active={qe(activeActiontypeId, id) || actiontypeIdsForSubjectOptions.size === 1}
                  listItems={actiontypeIdsForSubjectOptions.size}
                >
                  <Text size="small">
                    {`${noActions} `}
                    {actiontypeIdsForSubjectOptions.size > 4 && (
                      <FormattedMessage {...appMessages.entities[`actions_${id}`][noActions === 1 ? 'singleShort' : 'pluralShort']} />
                    )}
                    {actiontypeIdsForSubjectOptions.size <= 4 && (
                      <FormattedMessage {...appMessages.entities[`actions_${id}`][noActions === 1 ? 'single' : 'plural']} />
                    )}
                  </Text>
                </TypeButton>
              );
            }
          )}
        </TypeSelectBox>
      )}
      {actiontypeIdsForSubjectOptions && actiontypeIdsForSubjectOptions.size > 0 && (
        <Box>
          {viewEntity && hasActivityMap && (
            <ActorActivitiesMap
              actor={viewEntity}
              actions={activeActiontypeActions}
              actionsAsMember={actiontypesAsMemberForSubject}
              hasMemberOption={hasMemberOption}
              viewSubject={viewSubject}
              mapSubject={mapSubject}
              actiontypeHasTarget={hasTarget}
              dataReady
              onEntityClick={(id) => onEntityClick(id, ROUTES.ACTOR)}
              actiontypeId={activeActiontypeId}
              actorCanBeMember={canBeMember}
            />
          )}
        </Box>
      )}
      <Box>
        <FieldGroup
          group={{
            title: viewSubject === 'actors' ? 'Individually' : 'Explicitly targeted',
            fields: [
              getActionConnectionField({
                actions: activeActiontypeActions,
                taxonomies,
                onEntityClick,
                connections: actionConnections,
                typeid: activeActiontypeId,
                columns: getActiontypeColumns(activeActiontypeId, viewSubject),
                onCreateOption: () => onCreateOption({
                  path: API.ACTIONS,
                  attributes: {
                    measuretype_id: activeActiontypeId,
                  },
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
      {canBeMember && actiontypesAsMemberForSubject.entrySeq().map(([actortypeId, typeActors]) => (
        <Box key={actortypeId}>
          {typeActors.entrySeq().map(([actorId, actor]) => {
            const typeLabel = intl.formatMessage(appMessages.entities[`actors_${actortypeId}`].singleShort);
            const prefix = viewSubject === 'actors' ? 'As member of ' : 'Targeted as member of ';
            return (
              <Box key={actorId}>
                <FieldGroup
                  group={{
                    title: `${prefix} ${typeLabel}: "${actor.getIn(['attributes', 'title'])}"`,
                    fields: [
                      getActionConnectionField({
                        actions: actor.getIn([viewSubject === 'actors' ? 'actionsByType' : 'targetingActionsByType', activeActiontypeId]),
                        taxonomies,
                        onEntityClick,
                        connections: actionConnections,
                        typeid: activeActiontypeId,
                        columns: getActiontypeColumns(activeActiontypeId, viewSubject),
                      }),
                    ],
                  }}
                />
              </Box>
            );
          })}
        </Box>
      ))}
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
  hasMembers: PropTypes.bool,
  actionsByActiontype: PropTypes.instanceOf(Map),
  actionsAsTargetByActiontype: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  actionsAsMemberByActortype: PropTypes.instanceOf(Map),
  actionsAsTargetAsMemberByActortype: PropTypes.instanceOf(Map),
  onCreateOption: PropTypes.func,
  intl: intlShape,
};


export default injectIntl(Activities);
