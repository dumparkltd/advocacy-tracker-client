import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
// import { injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import FieldFactory from 'components/fields/FieldFactory';
// import styled from 'styled-components';
import { Box } from 'grommet';

// import { ROUTES, API, API_FOR_ROUTE } from 'themes/config';
import { API } from 'themes/config';

// import qe from 'utils/quasi-equals';
import { getActorConnectionField } from 'utils/fields';

import {
  setListPreview,
  updatePath,
  loadEntitiesIfNeeded,
} from 'containers/App/actions';

import {
  selectReady,
  selectActorConnections,
  selectTaxonomiesWithCategories,
} from 'containers/App/selectors';

import {
// selectPreviewContent,
} from './selectors';

export const DEPENDENCIES = [
  API.USERS,
  API.USER_ROLES,
  API.CATEGORIES,
  API.ACTORS,
  API.ACTIONS,
  API.ACTOR_ACTIONS,
  API.MEMBERSHIPS,
  API.ACTION_CATEGORIES,
  API.INDICATORS,
  API.ACTION_INDICATORS,
];

export function PreviewContent({
  item,
  columns,
  actorConnections,
  taxonomies,
  // onSetPreviewItemId,
  // previewEntity,
  // onUpdatePath,
  onEntityClick,
  // intl,
  // dataReady,
}) {
  console.log('item', item && item.toJS());
  console.log('columns', columns && columns.toJS());
  console.log('taxonomies', taxonomies && taxonomies.toJS());
  let fields = [];
  fields = columns.reduce(
    (memo, column) => {
      if (actorConnections && column.get('type') === 'associations' && item.get('associationsByType')) {
        return item.get('associationsByType').reduce(
          (memo2, actorIds, typeid) => {
            const actors = actorConnections.get(API.ACTORS).filter(
              (actor) => actorIds.includes(parseInt(actor.get('id'), 10)),
            );
            return ([
              ...memo2,
              getActorConnectionField({
                actors,
                onEntityClick,
                typeid,
              }),
            ]);
          },
          memo,
        );
      }
      if (actorConnections && column.get('type') === 'members' && item.get('membersByType')) {
        // console.log('memo', memo)
        return item.get('membersByType').reduce(
          (memo2, actorIds, typeid) => {
            // console.log('memo2', memo2)
            const actors = actorConnections.get(API.ACTORS).filter(
              (actor) => actorIds.includes(parseInt(actor.get('id'), 10)),
            );
            return ([
              ...memo2,
              getActorConnectionField({
                actors,
                onEntityClick,
                typeid,
              }),
            ]);
          },
          memo,
        );
      }
      return memo;
    },
    fields,
  );
  console.log('fields', fields);
  return (
    <>
      {fields && fields.length > 0 && (
        <Box margin={{ vertical: 'medium' }} flex={{ shrink: 0 }}>
          {fields.map(
            (field, i) => field
              ? (
                <FieldFactory
                  key={i}
                  field={{ ...field }}
                />
              )
              : null
          )}
        </Box>
      )}
    </>
  );
}

PreviewContent.propTypes = {
  item: PropTypes.object, // immutable Map
  columns: PropTypes.object, // immutable List
  // previewEntity: PropTypes.object, // immutable Map
  actorConnections: PropTypes.object, // immutable Map
  taxonomies: PropTypes.object, // immutable Map
  onEntityClick: PropTypes.func,
  // onUpdatePath: PropTypes.func,
  // dataReady: PropTypes.bool,
  // intl: intlShape.isRequired,
};

// const mapStateToProps = (state, { item }) => ({
const mapStateToProps = (state) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  // previewEntity: selectPreviewContent(state, { item }),
  actorConnections: selectActorConnections(state),
  taxonomies: selectTaxonomiesWithCategories(state),
});
export function mapDispatchToProps(dispatch) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onSetPreviewItemId: (val) => {
      dispatch(setListPreview(val));
    },
    onUpdatePath: (path) => {
      dispatch(updatePath(path));
    },
    onEntityClick: (id, path) => {
      dispatch(updatePath(`${path}/${id}`));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(PreviewContent));
