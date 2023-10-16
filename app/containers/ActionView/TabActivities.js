/*
 *
 * TabActivities
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Box, Text } from 'grommet';
import { Map } from 'immutable';
import styled from 'styled-components';

import {
  getActionConnectionField,
} from 'utils/fields';
import qe from 'utils/quasi-equals';
import { getActiontypeColumns } from 'utils/entities';

import { API } from 'themes/config';
import FieldGroup from 'components/fields/FieldGroup';
import ButtonPill from 'components/buttons/ButtonPill';
import PrintHide from 'components/styled/PrintHide';
import PrintOnly from 'components/styled/PrintOnly';

import appMessages from 'containers/App/messages';

import {
  setActiontype,
  openNewEntityModal,
} from 'containers/App/actions';
import {
  selectActionConnections,
} from 'containers/App/selectors';

const TypeSelectBox = styled((p) => <Box {...p} />)``;
const TypeButton = styled((p) => <ButtonPill {...p} />)`
  margin-bottom: 5px;
`;
const StyledPrint = styled.div`
  margin-left: 0;
`;
// max-width: ${({ listItems }) => 100 / listItems}%;

export function TabActivities({
  viewEntity, // current entity
  // viewSubject,
  taxonomies,
  actionConnections,
  onSetActiontype,
  onEntityClick,
  onCreateOption,
  viewActiontypeId, // as set in URL
  actionsByActiontype,
  actiontypes,
  isAdmin,
  intl,
}) {
  const actiontypeIds = actiontypes && actiontypes.entrySeq().map(([id]) => id.toString());
  const activeActiontypeActions = actionsByActiontype && actionsByActiontype.get(parseInt(viewActiontypeId, 10));
  const typeLabel = intl.formatMessage(appMessages.entities[`actions_${viewActiontypeId}`].plural);
  return (
    <Box>
      {(!actiontypeIds || actiontypeIds.size === 0) && (
        <Box margin={{ vertical: 'small', horizontal: 'medium' }}>
          <Text>
            No activities yet
          </Text>
        </Box>
      )}
      {actiontypeIds && actiontypeIds.size > 0 && (
        <>
          <PrintHide>
            <TypeSelectBox
              direction="row"
              gap="xxsmall"
              margin={{ top: 'small', bottom: 'medium' }}
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
          </PrintHide>
          <PrintOnly>
            <StyledPrint>
              <Text size="small" style={{ textDecoration: 'underline' }}>{typeLabel}</Text>
            </StyledPrint>
          </PrintOnly>
        </>
      )}
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
                  invalidateEntitiesOnSuccess: API.ACTIONS,
                  autoUser: true,
                  connect: {
                    type: 'subActions',
                    create: [{
                      other_measure_id: viewEntity.get('id'),
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

TabActivities.propTypes = {
  viewEntity: PropTypes.instanceOf(Map),
  taxonomies: PropTypes.instanceOf(Map),
  actionConnections: PropTypes.instanceOf(Map),
  onSetActiontype: PropTypes.func,
  onEntityClick: PropTypes.func,
  viewActiontypeId: PropTypes.string,
  actionsByActiontype: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  onCreateOption: PropTypes.func,
  isAdmin: PropTypes.bool,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state) => ({
  actionConnections: selectActionConnections(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onSetActiontype: (type) => {
      dispatch(setActiontype(type));
    },
    onCreateOption: (args) => {
      dispatch(openNewEntityModal(args));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(TabActivities));
