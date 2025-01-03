import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Map } from 'immutable';
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
  getTaxonomyFields,
  getDateField,
  getUserConnectionField,
  getMarkdownField,
} from 'utils/fields';
import {
} from 'utils/entities';

import {
  setListPreview,
  updatePath,
  loadEntitiesIfNeeded,
} from 'containers/App/actions';

import {
  selectReady,
  selectTaxonomies,
  // selectTaxonomiesWithCategories,
  // selectIsUserAdmin,
  selectCategories,
  selectActionConnections,
  selectActorConnections,
} from 'containers/App/selectors';

// import { selectPreviewContent } from './selectors';

export const DEPENDENCIES = [
  API.USERS,
  API.USER_ROLES,
  API.CATEGORIES,
  API.ACTORS,
  API.ACTIONS,
  API.ACTOR_ACTIONS,
  API.ACTOR_CATEGORIES,
  API.MEMBERSHIPS,
  API.ACTION_CATEGORIES,
  API.INDICATORS,
  API.ACTION_INDICATORS,
];

export function PreviewItem({
  item,
  columns,
  taxonomies,
  categories,
  actorConnections,
  actionConnections,
  // onSetPreviewItemId,
  // previewEntity,
  // onUpdatePath,
  onEntityClick,
  // intl,
  // dataReady,
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
  let measureTypeId;
  if (item.get('type') === API.ACTIONS) {
    measureTypeId = item && item.getIn(['attributes', 'measuretype_id']);
  }

  let fields = [];
  // date
  if (item
    && item.getIn(['attributes', 'date_start'])
    && item.getIn(['attributes', 'date_start']).trim().length > 0
    && measureTypeId
  ) {
    fields = [
      ...fields,
      getDateField(
        item,
        'date_start',
        {
          specificity: dateSpecificity,
          attributeLabel: datesEqual ? 'date' : 'date_start',
          fallbackAttribute: qe(measureTypeId, ACTIONTYPES.EXPRESS) ? 'created_at' : null,
          fallbackAttributeLabel: 'created_at_fallback',
        },
      ),
    ];
  }
  if (item
    && !datesEqual
    && item.getIn(['attributes', 'date_end'])
    && item.getIn(['attributes', 'date_end']).trim().length > 0
  ) {
    fields = [
      ...fields,
      getDateField(item, 'date_end', { specificity: dateSpecificity }),
    ];
  }
  // description
  if (item
    && item.getIn(['attributes', 'description'])
    && item.getIn(['attributes', 'description']).trim().length > 0
  ) {
    fields = [
      ...fields,
      getMarkdownField(item, 'description', true, null, true),
    ];
    // export const getMarkdownField = (
    //   entity,
    //   attribute,
    //   hasLabel = true,
    //   label,
    //   moreLess,
    // )
  }
  // users action + actor
  if (item && item.get('users') && actionConnections) {
    const users = item.get('users').map(
      (actorId) => {
        const user = actionConnections.get(API.USERS).filter(
          (actor) => qe(actorId, parseInt(actor.get('id'), 10))
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
        columns: null,
      }),
    ];
  }
  fields = columns.reduce(
    (memo, column) => {
      if (!item) {
        return memo;
      }
      // categories action + actor
      // categories
      if (qe(column.get('type'), 'taxonomy') && item.get('categories')) {
        const taxId = column.get('taxonomy_id').toString();
        const itemTaxonomy = taxonomies.filter(
          (tax) => qe(tax.get('id'), taxId)
        );
        if (itemTaxonomy) {
          const taxonomyWithCategories = item.get('categories').reduce(
            (memo2, categoryId) => {
              const category = categories.get(categoryId.toString());
              if (category && qe(category.getIn(['attributes', 'taxonomy_id']), parseInt(taxId, 10))) {
                let updatedTaxWithCategories = memo2.get(taxId);
                if (!updatedTaxWithCategories.get('categories')) {
                  updatedTaxWithCategories = updatedTaxWithCategories.set('categories', Map());
                }
                updatedTaxWithCategories = updatedTaxWithCategories.setIn(
                  ['categories', category.get('id')], category
                );
                return memo2.set(taxId, updatedTaxWithCategories);
              }
              return memo2;
            }, itemTaxonomy
          );
          return [
            ...memo,
            ...getTaxonomyFields(taxonomyWithCategories),
          ];
        }
      }
      // actor view
      // member of
      if (actorConnections && qe(column.get('type'), 'associations') && item.get('associationsByType')) {
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
                columns: null,
              }),
            ]);
          },
          memo,
        );
      }
      // members
      if (actorConnections && qe(column.get('type'), 'members') && item.get('membersByType')) {
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
                columns: null,
              }),
            ]);
          },
          memo,
        );
      }
      // stakeholders
      if (measureTypeId && actorConnections && qe(column.get('type'), 'actors') && item.get('actorsByType')) {
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
                columns: null,
                // columns: getActortypeColumns({
                //   typeId: typeid,
                //   showCode: checkActorAttribute(typeid, 'code', isAdmin),
                // }),
              })];
          }, memo
        );
      }
      // child activities
      if (measureTypeId && actionConnections && qe(column.get('type'), 'childActions') && item.get('childrenByType')) {
        return item.get('childrenByType').reduce(
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
                columns: null,
                // columns: getActortypeColumns(actiontypeid),
              }),
            ];
          }, memo
        );
      }
      // parent activities
      /* if (qe(column.get('type'), 'parentActions') && item.get('parentsByType')) {
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
      } */
      return memo;
    },
    fields,
  );

  return fields && fields.length > 0
    ? (
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
    )
    : null;
}

PreviewItem.propTypes = {
  item: PropTypes.object, // immutable Map
  columns: PropTypes.object, // immutable List
  // previewEntity: PropTypes.object, // immutable Map
  categories: PropTypes.object, // immutable Map
  taxonomies: PropTypes.object, // immutable Map
  actionConnections: PropTypes.object, // immutable Map
  actorConnections: PropTypes.object, // immutable Map
  onEntityClick: PropTypes.func,
  // onUpdatePath: PropTypes.func,
  // dataReady: PropTypes.bool,
  // intl: intlShape.isRequired,
};

// const mapStateToProps = (state, { item }) => ({
const mapStateToProps = (state) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  // previewEntity: selectPreviewContent(state, { item }),
  taxonomies: selectTaxonomies(state),
  categories: selectCategories(state),
  actionConnections: selectActionConnections(state),
  actorConnections: selectActorConnections(state),
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

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(PreviewItem));
