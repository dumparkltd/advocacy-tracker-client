import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
// import { List, Map } from 'immutable';
// import { injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import FieldFactory from 'components/fields/FieldFactory';
// import styled from 'styled-components';
import { Box } from 'grommet';

import { ACTIONTYPES, API } from 'themes/config';

import qe from 'utils/quasi-equals';
import {
  getActorConnectionField,
  getActionConnectionField,
  // hasTaxonomyCategories,
  getTaxonomyFields,
  getDateField,
  getTextField,
  // mapCategoryOptions,
  getUserConnectionField,
} from 'utils/fields';
import {
  checkActionAttribute,
  getActortypeColumns,
  checkActorAttribute,
} from 'utils/entities';

import {
  setListPreview,
  updatePath,
  loadEntitiesIfNeeded,
} from 'containers/App/actions';

import {
  selectReady,
  selectActorConnections,
  selectActionConnections,
  selectTaxonomiesWithCategories,
  selectIsUserAdmin,
  selectCategories,
} from 'containers/App/selectors';

import {
  selectViewTaxonomies,
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
  actionConnections,
  taxonomies,
  categories,
  // onSetPreviewItemId,
  // previewEntity,
  // onUpdatePath,
  onEntityClick,
  viewTaxonomies,
  // intl,
  // dataReady,
  isAdmin,
}) {
  // check date comment for date spceficity
  // const DATE_SPECIFICITIES = ['y', 'm', 'd'];
  const dateSpecificity = 'd';
  let datesEqual;
  if (
    item
    && item.getIn(['attributes', 'date_start'])
    && item.getIn(['attributes', 'date_end'])
  ) {
    const [ds] = item.getIn(['attributes', 'date_start']).split('T');
    const [de] = item.getIn(['attributes', 'date_end']).split('T');
    datesEqual = ds === de;
  }
  const typeId = item && item.getIn(['attributes', 'measuretype_id']);

  console.log(item.toJS());
  console.log(columns.toJS());
  console.log(actionConnections.toJS());
  console.log(viewTaxonomies.toJS());
  console.log(categories.toJS());
  console.log(actorConnections.toJS());
  let fields = [];
  fields = columns.reduce(
    (memo, column) => {
      // actor view
      // member of
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
      // members
      if (actorConnections && column.get('type') === 'members' && item.get('membersByType')) {
        return item.get('membersByType').reduce(
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
      // action view
      // date
      if (column.get('type') === 'date') {
        return [...memo,
          ...[checkActionAttribute(typeId, 'date_start')
            && getDateField(
              item,
              'date_start',
              {
                specificity: dateSpecificity,
                attributeLabel: datesEqual ? 'date' : 'date_start',
                fallbackAttribute: qe(typeId, ACTIONTYPES.EXPRESS) ? 'created_at' : null,
                fallbackAttributeLabel: 'created_at_fallback',
              },
            ),
          !datesEqual
          && checkActionAttribute(typeId, 'date_end')
          && getDateField(item, 'date_end', { specificity: dateSpecificity }),
          !dateSpecificity
          && checkActionAttribute(typeId, 'date_comment')
          && getTextField(item, 'date_comment'),
          ]];
      }
      // categories
      if (column.get('type') === 'taxonomy' && item.get('categories') && viewTaxonomies) {
        const columnTaxId = column.get('taxonomy_id').toString();
        /*
        console.log(columnTaxId);
        console.log(taxonomies.toJS());
        let currentTaxonomy = taxonomies.filter(
          (tax, typeid) => parseInt(typeid, 10) === parseInt(columnTaxId, 10)
        );
        console.log(currentTaxonomy.toJS());
        currentTaxonomy = currentTaxonomy.setIn([columnTaxId, 'categories'], Map());
        const taxCategories = item.get('categories').map(
          (categoryId, typeid) => categories.filter(
            (cat) => parseInt(cat.get('id'), 10) === categoryId
          )
        );
        console.log(taxCategories.toJS());
        currentTaxonomy = currentTaxonomy.setIn([columnTaxId, 'categories'], taxCategories.get(columnTaxId));
        console.log(currentTaxonomy.toJS());
        return [...memo, ...getTaxonomyFields(currentTaxonomy)]; */

        const itemTaxonomyWithAssociatedCategories = viewTaxonomies.filter(
          (taxonomy, typeid) => parseInt(columnTaxId, 10) === parseInt(typeid, 10)
        );
        if (itemTaxonomyWithAssociatedCategories) {
          return [
            ...memo,
            ...getTaxonomyFields(itemTaxonomyWithAssociatedCategories),
          ];
        }
        return memo;
      }
      // stakeholders
      if (actorConnections && column.get('type') === 'actors' && item.get('actorsByType')) {
        return item.get('actorsByType').reduce(
          (memo2, actorIds, typeid) => {
            const actors = actorConnections.get(API.ACTORS).filter(
              (actor) => actorIds.includes(parseInt(actor.get('id'), 10)),
            );
            return [...memo2,
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
              })];
          }, memo
        );
      }
      // child activities
      if (actionConnections && column.get('type') === 'childActions' && item.get('childrenByType')) {
        return item.get('childrenByType').reduce(
          (memo2, actionIds, actiontypeid) => {
            const actions = actionConnections.get(API.ACTIONS).filter(
              (action) => actionIds.includes(parseInt(action.get('id'), 10)),
            );
            console.log(actions.toJS());
            return [...memo2,
              getActionConnectionField({
                actions,
                taxonomies,
                onEntityClick,
                connections: actionConnections,
                typeid: actiontypeid,
                columns: getActortypeColumns(actiontypeid),
              }),
            ];
          }, memo
        );
      }
      // parent activities
      if (column.get('type') === 'parentActions' && item.get('parentsByType')) {
        return item.get('parentsByType').reduce(
          (memo2, actionIds, actiontypeid) => {
            const actions = actionConnections.get(API.ACTIONS).filter(
              (action) => actionIds.includes(parseInt(action.get('id'), 10)),
            );
            return [...memo2,
              getActionConnectionField({
                actions,
                taxonomies,
                onEntityClick,
                connections: actionConnections,
                typeid: actiontypeid,
                columns: getActortypeColumns(actiontypeid),
              }),
            ];
          }, memo
        );
      }
      return memo;
    },
    fields,
  );
  // users action + actor
  if (actionConnections && item.get('users')) {
    const users = item.get('users').map(
      (actorId) => {
        const user = actionConnections.get(API.USERS).filter(
          (actor) => actorId === parseInt(actor.get('id'), 10)
        );
        return user && user.get(actorId.toString());
      }
    );
    fields = [
      ...fields,
      getUserConnectionField({
        users,
        onEntityClick,
        connections: actorConnections,
        skipLabel: true,
      }),
    ];
  }
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
  actionConnections: PropTypes.object, // immutable Map
  viewTaxonomies: PropTypes.object, // immutable Map
  isAdmin: PropTypes.bool,
  taxonomies: PropTypes.object, // immutable Map
  onEntityClick: PropTypes.func,
  // onUpdatePath: PropTypes.func,
  // dataReady: PropTypes.bool,
  // intl: intlShape.isRequired,
};

// const mapStateToProps = (state, { item }) => ({
const mapStateToProps = (state, { item }) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  // previewEntity: selectPreviewContent(state, { item }),
  actionConnections: selectActionConnections(state),
  actorConnections: selectActorConnections(state),
  taxonomies: selectTaxonomiesWithCategories(state),
  viewTaxonomies: selectViewTaxonomies(state, item.get('id')),
  isAdmin: selectIsUserAdmin(state),
  categories: selectCategories(state),
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
