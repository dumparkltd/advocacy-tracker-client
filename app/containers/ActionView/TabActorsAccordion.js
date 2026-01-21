/*
 *
 * TabActorsAccordion
 *
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Box } from 'grommet';
import {
  getActorConnectionField,
} from 'utils/fields';

import { checkActorAttribute, getActortypeColumns } from 'utils/entities';
import { lowerCase } from 'utils/string';

import FieldGroup from 'components/fields/FieldGroup';
import Accordion from 'components/Accordion';
import A from 'components/styled/A';

import appMessages from 'containers/App/messages';
import { ROUTES } from 'themes/config';
import TabActorsAccordionChildActors from './TabActorsAccordionChildActors';

const getTypeLabel = (
  typeId,
  count,
  intl,
) => lowerCase(intl.formatMessage(appMessages.entities[`actions_${typeId}`][count === 1 ? 'single' : 'plural']));

const getActionLink = (entity) => `${ROUTES.ACTION}/${entity.get('id')}`;

const getActionOnClick = (entity, onEntityClick) => (evt) => {
  if (evt) evt.preventDefault();
  onEntityClick(entity.get('id'), ROUTES.ACTION);
};


const defaultState = [];

export function TabActorsAccordion({
  taxonomies,
  onEntityClick,
  actorConnections,
  actorsByType,
  childActionsByActiontype,
  hasChildActors,
  intl,
  viewSubject,
  isAdmin,
}) {
  const [actives, setActive] = useState(defaultState);

  // reset state
  useEffect(() => {
    setActive(defaultState);
  }, [viewSubject, hasChildActors]);

  useEffect(() => {
    if (actorsByType) {
      setActive([0]);
    }
  }, [actorsByType]);
  return (
    <>
      <Box margin={{ vertical: 'medium' }}>
        {!hasChildActors && actorsByType && (
          <FieldGroup
            seamless
            group={{
              fields: actorsByType.reduce(
                (memo, actors, typeid) => memo.concat([
                  getActorConnectionField({
                    actors,
                    taxonomies,
                    onEntityClick,
                    connections: actorConnections,
                    typeid,
                    columns: getActortypeColumns({
                      typeId: typeid,
                      showCode: checkActorAttribute(typeid, 'code', isAdmin),
                    }),
                  }),
                ]),
                [],
              ),
            }}
          />
        )}
        {hasChildActors && (
          <Accordion
            activePanels={actives}
            onActive={(newActives) => setActive(newActives)}
            options={[
              actorsByType
                ? {
                  id: 0,
                  titleButton: 'Directly targeted stakeholders',
                  renderContent: (() => (
                    <Box pad={{ vertical: 'small' }}>
                      <FieldGroup
                        seamless
                        group={{
                          fields: actorsByType.reduce(
                            (memo, actors, typeid) => memo.concat([
                              getActorConnectionField({
                                actors,
                                taxonomies,
                                onEntityClick,
                                connections: actorConnections,
                                typeid,
                                columns: getActortypeColumns({
                                  typeId: typeid,
                                  showCode: checkActorAttribute(typeid, 'code', isAdmin),
                                  isAdmin,
                                }),
                              }),
                            ]),
                            [],
                          ),
                        }}
                      />
                    </Box>
                  )),
                }
                : null,
              hasChildActors
                ? {
                  id: 1,
                  titleButton: 'Indirectly targeted (from sub-activities)',
                  renderContent: (() => (
                    <div>
                      {childActionsByActiontype.flatten(true).entrySeq().map(
                        ([childId, childAction]) => {
                          const actorIdsByType = childAction.get('actorsByType');
                          if (!actorIdsByType) return null;
                          const typeid = childAction.getIn(['attributes', 'measuretype_id']);
                          const actiontypeLabel = getTypeLabel(
                            typeid,
                            0,
                            intl,
                          );
                          return (
                            <TabActorsAccordionChildActors
                              key={childId}
                              actorIds={actorIdsByType.flatten(true)}
                              title={(
                                <div>
                                  {`As parent of ${actiontypeLabel}: `}
                                  <A
                                    weight={600}
                                    href={getActionLink(childAction)}
                                    onClick={getActionOnClick(childAction, onEntityClick)}
                                    title={childAction.getIn(['attributes', 'title'])}
                                  >
                                    {childAction.getIn(['attributes', 'title'])}
                                  </A>
                                </div>
                              )}
                              taxonomies={taxonomies}
                              onEntityClick={onEntityClick}
                              actorConnections={actorConnections}
                              getActortypeColumns={(actortypeid) => getActortypeColumns({
                                typeId: actortypeid,
                                showCode: checkActorAttribute(actortypeid, 'code', isAdmin),
                              })}
                              isAdmin={isAdmin}
                            />
                          );
                        }
                      )}
                    </div>
                  )),
                }
                : null,
            ]}
          />
        )}
      </Box>
    </>
  );
}

TabActorsAccordion.propTypes = {
  actorsByType: PropTypes.object,
  onEntityClick: PropTypes.func,
  taxonomies: PropTypes.object,
  actorConnections: PropTypes.object,
  childActionsByActiontype: PropTypes.object,
  hasChildActors: PropTypes.bool,
  isAdmin: PropTypes.bool,
  viewSubject: PropTypes.string,
  intl: intlShape,
};


export default injectIntl(TabActorsAccordion);
