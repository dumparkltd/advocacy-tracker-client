/*
 *
 * Activities
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Box, Text } from 'grommet';
import { Map } from 'immutable';
import styled from 'styled-components';

import {
  getActionConnectionField,
} from 'utils/fields';
import qe from 'utils/quasi-equals';
import { getActiontypeColumns } from 'utils/entities';

import {
  USER_ACTIONTYPES,
  API,
} from 'themes/config';
import FieldGroup from 'components/fields/FieldGroup';
import ButtonPill from 'components/buttons/ButtonPill';

import appMessages from 'containers/App/messages';

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
    onEntityClick,
    onCreateOption,
    viewActiontypeId, // as set in URL
    actionsByActiontype,
    actiontypes,
    isAdmin,
    isPrint,
  } = props;
  const actiontypeIds = actiontypes && actiontypes
    .filter((type, id) => USER_ACTIONTYPES.indexOf(id) > -1)
    .entrySeq()
    .map(([id]) => id.toString());
  const activeActiontypeActions = actionsByActiontype && actionsByActiontype.get(parseInt(viewActiontypeId, 10));

  return (
    <Box>
      {(!actiontypeIds || actiontypeIds.size === 0) && (
        <Box margin={{ vertical: 'small', horizontal: 'medium', left: isPrint ? 0 : 'medium' }}>
          {viewSubject === 'uactivities' && (
            <Text>
              No activities assigned
            </Text>
          )}
          {viewSubject === 'uactors' && (
            <Text>
              No actors assigned
            </Text>
          )}
        </Box>
      )}
      {actiontypeIds && actiontypeIds.size > 0 && (
        <TypeSelectBox
          direction="row"
          gap="xxsmall"
          margin={{
            top: 'small', bottom: 'medium', horizontal: 'medium', left: isPrint ? '0px' : 'medium',
          }}
          wrap
        >
          {actiontypeIds.map(
            (id) => {
              const actiontypeActions = actionsByActiontype && actionsByActiontype.get(parseInt(id, 10));
              const noActions = actiontypeActions ? actiontypeActions.size : 0;
              return (
                <TypeButton
                  key={id}
                  onClick={() => onSetActiontype(id)}
                  active={qe(viewActiontypeId, id) || actiontypeIds.size === 1}
                  listItems={actiontypeIds.size}
                >
                  <Text size="small">
                    {`${noActions} `}
                    {actiontypeIds.size > 4 && (
                      <FormattedMessage {...appMessages.entities[`actions_${id}`][noActions === 1 ? 'singleShort' : 'pluralShort']} />
                    )}
                    {actiontypeIds.size <= 4 && (
                      <FormattedMessage {...appMessages.entities[`actions_${id}`][noActions === 1 ? 'single' : 'plural']} />
                    )}
                  </Text>
                </TypeButton>
              );
            }
          )}
        </TypeSelectBox>
      )}
      <Box>
        <FieldGroup
          group={{
            fields: [
              getActionConnectionField({
                actions: activeActiontypeActions,
                taxonomies,
                onEntityClick,
                connections: actionConnections,
                typeid: viewActiontypeId,
                columns: getActiontypeColumns({
                  typeId: viewActiontypeId,
                  isAdmin,
                }),
                onCreateOption: () => onCreateOption({
                  path: API.ACTIONS,
                  attributes: {
                    measuretype_id: viewActiontypeId,
                  },
                  invalidateEntitiesOnSuccess: [API.USERS, API.ACTIONS],
                  connect: {
                    type: 'userActions',
                    create: [{
                      user_id: viewEntity.get('id'),
                    }],
                  },
                }),
              }),
            ],
          }}
        />
      </Box>
    </Box>
  );
}

Activities.propTypes = {
  viewEntity: PropTypes.instanceOf(Map),
  viewSubject: PropTypes.string,
  // viewActortype: PropTypes.instanceOf(Map),
  taxonomies: PropTypes.instanceOf(Map),
  actionConnections: PropTypes.instanceOf(Map),
  onSetActiontype: PropTypes.func,
  onEntityClick: PropTypes.func,
  viewActiontypeId: PropTypes.string,
  actionsByActiontype: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  onCreateOption: PropTypes.func,
  isAdmin: PropTypes.bool,
  isPrint: PropTypes.bool,
};


export default Activities;
