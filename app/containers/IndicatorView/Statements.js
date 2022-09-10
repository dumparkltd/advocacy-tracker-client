/*
 *
 * IndicatorView
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';

import {
  getActionConnectionField,
} from 'utils/fields';
import { getActiontypeColumns } from 'utils/entities';

import {
  updatePath,
} from 'containers/App/actions';

import {
  selectTaxonomiesWithCategories,
  selectActionConnections,
  selectIsUserAdmin,
} from 'containers/App/selectors';

import {
  ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS,
} from 'themes/config';

import FieldGroup from 'components/fields/FieldGroup';

import appMessages from 'containers/App/messages';

import {
  selectActionsByType,
} from './selectors';

const getOtherActiontypeColumns = (typeid, actionId, intl) => {
  // supportlevel
  if (
    ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS[typeid]
    && ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS[typeid].length > 0
  ) {
    return [
      {
        id: 'supportlevel_id',
        type: 'supportlevel',
        actionId,
        title: intl.formatMessage(appMessages.attributes.supportlevel_id),
      },
    ];
  }
  return [];
};

export function Statements({
  viewEntity,
  taxonomies,
  actionsByActiontype,
  actionConnections,
  onEntityClick,
  intl,
  isAdmin,
}) {
  if (!actionsByActiontype) {
    return null;
  }
  return (
    <FieldGroup
      group={{
        fields: actionsByActiontype.reduce(
          (memo, actions, actiontypeid) => ([
            ...memo,
            getActionConnectionField({
              actions,
              taxonomies,
              onEntityClick,
              connections: actionConnections,
              typeid: actiontypeid,
              columns: getActiontypeColumns({
                typeId: actiontypeid,
                isAdmin,
                otherColumns: getOtherActiontypeColumns(
                  actiontypeid,
                  viewEntity.get('id'),
                  intl,
                  isAdmin,
                ),
              }),
            }),
          ]),
          [],
        ),
      }}
    />
  );
}

Statements.propTypes = {
  viewEntity: PropTypes.object,
  onEntityClick: PropTypes.func,
  taxonomies: PropTypes.object,
  actionConnections: PropTypes.object,
  actionsByActiontype: PropTypes.object,
  intl: intlShape,
  isAdmin: PropTypes.bool,
};

const mapStateToProps = (state, { viewEntity }) => ({
  taxonomies: selectTaxonomiesWithCategories(state),
  actionsByActiontype: selectActionsByType(state, viewEntity.get('id')),
  actionConnections: selectActionConnections(state),
  isAdmin: selectIsUserAdmin(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onEntityClick: (id, path) => {
      dispatch(updatePath(`${path}/${id}`));
    },
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Statements));
