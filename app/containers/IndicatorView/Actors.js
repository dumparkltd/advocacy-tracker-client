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
  getActorConnectionField,
} from 'utils/fields';

import qe from 'utils/quasi-equals';

import {
  updatePath,
} from 'containers/App/actions';

import {
  selectTaxonomiesWithCategories,
  selectActorConnections,
} from 'containers/App/selectors';

import {
  MEMBERSHIPS,
  ACTORTYPES,
} from 'themes/config';

import FieldGroup from 'components/fields/FieldGroup';

import appMessages from 'containers/App/messages';

import {
  selectActorsByType,
} from './selectors';

const getActortypeColumns = (typeid, viewEntity, intl, showCode) => {
  let columns = [{
    id: 'main',
    type: 'main',
    sort: 'title',
    attributes: showCode ? ['code', 'title'] : ['title'],
  }];
  columns = [
    ...columns,
    {
      id: 'supportlevel_id',
      type: 'supportlevel',
      title: intl.formatMessage(appMessages.attributes.supportlevel_id),
    },
    {
      id: 'positionStatement',
      type: 'positionStatement',
    },
    {
      id: 'authority',
      type: 'positionStatementAuthority',
    },
  ];
  if (MEMBERSHIPS[typeid] && MEMBERSHIPS[typeid].length > 0) {
    columns = [
      ...columns,
      {
        id: 'viaGroups',
        type: 'viaGroups',
      },
    ];
  }
  return columns;
};

export function Actors({
  viewEntity,
  taxonomies,
  actorConnections,
  onEntityClick,
  actorsByActortype,
  isAdmin,
  intl,
}) {
  if (!actorsByActortype) {
    return null;
  }
  return (
    <FieldGroup
      group={{
        fields: actorsByActortype.reduce(
          (memo, actors, actortypeid) => ([
            ...memo,
            getActorConnectionField({
              actors,
              taxonomies,
              onEntityClick,
              connections: actorConnections,
              typeid: actortypeid,
              columns: getActortypeColumns(
                actortypeid,
                viewEntity,
                intl,
                isAdmin || qe(actortypeid, ACTORTYPES.COUNTRY)
              ),
            }),
          ]),
          [],
        ),
      }}
    />
  );
}

Actors.propTypes = {
  viewEntity: PropTypes.object,
  onEntityClick: PropTypes.func,
  taxonomies: PropTypes.object,
  actorConnections: PropTypes.object,
  actorsByActortype: PropTypes.object,
  isAdmin: PropTypes.bool,
  intl: intlShape,
};

const mapStateToProps = (state, { viewEntity }) => ({
  taxonomies: selectTaxonomiesWithCategories(state),
  actorConnections: selectActorConnections(state),
  actorsByActortype: selectActorsByType(state, viewEntity.get('id')),

});

function mapDispatchToProps(dispatch) {
  return {
    onEntityClick: (id, path) => {
      dispatch(updatePath(`${path}/${id}`));
    },
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Actors));
