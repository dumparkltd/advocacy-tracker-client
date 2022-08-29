/*
 *
 * TabActorsAccordion
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
import {
  getActorConnectionField,
} from 'utils/fields';

import { lowerCase } from 'utils/string';

import {
  ACTORTYPES_CONFIG,
} from 'themes/config';

import FieldGroup from 'components/fields/FieldGroup';
import AccordionHeader from 'components/AccordionHeader';

import appMessages from 'containers/App/messages';
import TabActorsAccordionChildTargets from './TabActorsAccordionChildTargets';

const getActortypeColumns = (typeid) => {
  let columns = [{
    id: 'main',
    type: 'main',
    sort: 'title',
    attributes: ['code', 'title'],
  }];
  if (
    ACTORTYPES_CONFIG[parseInt(typeid, 10)]
    && ACTORTYPES_CONFIG[parseInt(typeid, 10)].columns
  ) {
    columns = [
      ...columns,
      ...ACTORTYPES_CONFIG[parseInt(typeid, 10)].columns,
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

export function TabActorsAccordion({
  taxonomies,
  onEntityClick,
  actorConnections,
  actorsByType,
  childActionsByActiontype,
  hasChildTargets,
  intl,
  viewSubject,
}) {
  const [actives, setActive] = useState(defaultState);

  // reset state
  useEffect(() => {
    setActive(defaultState);
  }, [viewSubject, hasChildTargets]);

  const hasChildPanel = hasChildTargets && childActionsByActiontype && childActionsByActiontype.flatten(true).size > 0;
  return (
    <>
      <Box margin={{ vertical: 'medium' }}>
        {!hasChildTargets && actorsByType && (
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
                    columns: getActortypeColumns(typeid),
                  }),
                ]),
                [],
              ),
            }}
          />
        )}
        {hasChildTargets && actorsByType && (
          <Accordion
            activeIndex={actives}
            onActive={(newActive) => setActive(newActive)}
            multiple
            animate={false}
          >
            <AccordionPanel
              header={(
                <AccordionHeader
                  title="Direct targets"
                  open={actives.includes(0)}
                />
              )}
            >
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
                          columns: getActortypeColumns(typeid),
                        }),
                      ]),
                      [],
                    ),
                  }}
                />
              </Box>
            </AccordionPanel>
            {hasChildPanel && (
              <AccordionPanel
                header={(
                  <AccordionHeader
                    title="Indirect targets (from child activities)"
                    open={actives.includes(1)}
                  />
                )}
              >
                {childActionsByActiontype.flatten(true).entrySeq().map(
                  ([childId, childAction]) => {
                    const actorIdsByType = childAction.get('targetsByType');
                    if (!actorIdsByType) return null;
                    const typeid = childAction.getIn(['attributes', 'measuretype_id']);
                    const actiontypeLabel = getTypeLabel(
                      typeid,
                      0,
                      intl,
                    );
                    return (
                      <TabActorsAccordionChildTargets
                        key={childId}
                        targetIds={actorIdsByType.flatten(true)}
                        title={`As parent of ${actiontypeLabel}: "${childAction.getIn(['attributes', 'title'])}"`}
                        taxonomies={taxonomies}
                        onEntityClick={onEntityClick}
                        actorConnections={actorConnections}
                        getActortypeColumns={(actortypeid) => getActortypeColumns(actortypeid)}
                      />
                    );
                  }
                )}
              </AccordionPanel>
            )}
          </Accordion>
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
  hasChildTargets: PropTypes.bool,
  viewSubject: PropTypes.string,
  intl: intlShape,
};


export default injectIntl(TabActorsAccordion);
