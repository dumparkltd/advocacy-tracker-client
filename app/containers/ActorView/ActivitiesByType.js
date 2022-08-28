/*
 *
 * ActivitiesByType
 *
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import {
  Box,
  Accordion,
  AccordionPanel,
} from 'grommet';
import { Map } from 'immutable';
// import styled from 'styled-components';

import { getActionConnectionField } from 'utils/fields';
import { lowerCase } from 'utils/string';

import {
  ACTIONTYPES_CONFIG,
  API,
} from 'themes/config';
import FieldGroup from 'components/fields/FieldGroup';
import AccordionHeader from 'components/AccordionHeader';

import appMessages from 'containers/App/messages';

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


const getTypeLabel = (
  typeId,
  count,
  intl,
) => lowerCase(intl.formatMessage(appMessages.entities[`actions_${typeId}`][count === 1 ? 'single' : 'plural']));

const defaultState = [0];

export function ActivitiesByType(props) {
  const {
    viewEntity, // current entity
    viewSubject,
    taxonomies,
    actionConnections,
    canBeMember,
    activeActiontypeId,
    activeActiontypeActions,
    actiontypesAsMemberForSubject,
    onEntityClick,
    intl,
    onCreateOption,
  } = props;
  const [actives, setActive] = useState(defaultState);

  // reset state
  useEffect(() => {
    setActive(defaultState);
  }, [viewSubject, activeActiontypeId]);

  const associationsWithActionsViaMemberships = canBeMember
    && actiontypesAsMemberForSubject
    && actiontypesAsMemberForSubject
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
  const uniqueActionsViaMemberships = canBeMember
    && associationsWithActionsViaMemberships
    && associationsWithActionsViaMemberships.map(
      (association) => {
        if (viewSubject === 'actors') {
          return association.getIn(['actionsByType', activeActiontypeId]);
        }
        return association.getIn(['targetingActionsByType', activeActiontypeId]);
      }
    ).toSet();
  return (
    <Box>
      <Accordion
        activeIndex={actives}
        onActive={(newActive) => setActive(newActive)}
        multiple
        margin="medium"
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
                    columns: getActiontypeColumns(activeActiontypeId, viewSubject),
                    onCreateOption: () => onCreateOption({
                      path: API.ACTIONS,
                      attributes: {
                        measuretype_id: activeActiontypeId,
                      },
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
        {canBeMember && uniqueActionsViaMemberships && uniqueActionsViaMemberships.size > 0 && (
          <AccordionPanel
            header={(
              <AccordionHeader
                title={
                  `As member${viewSubject === 'actors' ? '' : ' (of target)'}: ${uniqueActionsViaMemberships.size} ${getTypeLabel(activeActiontypeId, uniqueActionsViaMemberships.size, intl)}`
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
                            columns: getActiontypeColumns(activeActiontypeId, viewSubject),
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

ActivitiesByType.propTypes = {
  viewEntity: PropTypes.instanceOf(Map),
  viewSubject: PropTypes.string,
  taxonomies: PropTypes.instanceOf(Map),
  actionConnections: PropTypes.instanceOf(Map),
  onEntityClick: PropTypes.func,
  canBeMember: PropTypes.bool,
  activeActiontypeId: PropTypes.string,
  activeActiontypeActions: PropTypes.instanceOf(Map),
  actiontypesAsMemberForSubject: PropTypes.instanceOf(Map),
  onCreateOption: PropTypes.func,
  intl: intlShape,
};


export default injectIntl(ActivitiesByType);
