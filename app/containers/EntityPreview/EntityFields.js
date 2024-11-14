import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Map } from 'immutable';
// import { injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Box, Text } from 'grommet';

import FieldFactory from 'components/fields/FieldFactory';

import {
  // ACTIONTYPES,
  // ACTORTYPES,
  API,
} from 'themes/config';

import qe from 'utils/quasi-equals';
import {
  getUserConnectionField,
  getActorConnectionField,
  getTaxonomyFields,
  // getActionConnectionField,
  // getDateField,
  // getTextField,
  // getMarkdownField,
} from 'utils/fields';

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

import PreviewCountryTopicPosition from './PreviewCountryTopicPosition';
import PreviewCountryTopicStatementList from './PreviewCountryTopicStatementList';
import PreviewCountryPositionsList from './PreviewCountryPositionsList';
import ActorUsersField from './ActorUsersField';
import AssociationsField from './AssociationsField';

const Styled = styled((p) => <Box {...p} />)``;

const SectionTitle = styled((p) => <Text size="xsmall" {...p} />)`
  text-transform: uppercase;
  font-weight: bold;
`;
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

export function EntityFields({
  fields,
  onUpdatePath,
  item,
  // itemContent,
  columns,
  taxonomies,
  categories,
  actorConnections,
  actionConnections,
  onEntityClick,
}) {
  // console.log('fields', fields && fields.toJS())
  // console.log('item', item && item.toJS())
  // console.log('columns', columns && columns.toJS())
  return (
    <Styled gap="xlarge">
      {fields && fields.entrySeq().map(([fieldId, fieldContent]) => {
        if (!fieldContent) {
          return null;
        }
        if (columns && fieldContent.get('columnId')) {
          // console.log('columns', columns && columns.toJS())
          const column = columns.find((c) => c.get('id') === fieldContent.get('columnId'));
          if (column) {
            let theField;
            // console.log('column', column && column.toJS())
            if (column.get('type') === 'users' && item.get('users') && actionConnections) {
              const users = item.get('users').map(
                (actorId) => {
                  const user = actionConnections.get(API.USERS).filter(
                    (actor) => qe(actorId, parseInt(actor.get('id'), 10))
                  );
                  return user && user.get(actorId.toString());
                }
              );
              // console.log('users', users && users.toJS())
              theField = getUserConnectionField({
                users,
                onEntityClick,
                connections: actionConnections,
                skipLabel: true,
                columns: null,
              });
            }
            if (qe(column.get('type'), 'taxonomy') && item.get('categories') && categories) {
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
                theField = getTaxonomyFields(taxonomyWithCategories);
              }
            }
            if (actorConnections && qe(column.get('type'), 'associations') && item.get('associationsByType')) {
              if (fieldContent.get('type')) {
                const actorIds = item.getIn(['associationsByType', parseInt(fieldContent.get('type'), 10)]);
                if (actorIds) {
                  const actors = actorConnections.get(API.ACTORS).filter(
                    (actor) => actorIds.includes(parseInt(actor.get('id'), 10)),
                  );
                  theField = getActorConnectionField({
                    actors,
                    onEntityClick,
                    typeid: parseInt(fieldContent.get('type'), 10),
                    columns: null,
                  });
                }
              }
            }
            return theField
              ? (
                <Box key={fieldId} gap="small">
                  {fieldContent.get('title') && (
                    <SectionTitle>
                      {fieldContent.get('title')}
                    </SectionTitle>
                  )}
                  <FieldFactory
                    field={{
                      ...theField,
                      onEntityClick,
                      noPadding: true,
                    }}
                  />
                </Box>
              )
              : null;
          }
        }
        if (fieldId === 'countryPositions') {
          return (
            <PreviewCountryPositionsList
              key={fieldId}
              content={fieldContent}
              onUpdatePath={onUpdatePath}
            />
          );
        }
        if (fieldId === 'topicPosition') {
          return (
            <PreviewCountryTopicPosition
              key={fieldId}
              content={fieldContent}
              onUpdatePath={onUpdatePath}
            />
          );
        }
        if (fieldId === 'topicStatements') {
          return (
            <PreviewCountryTopicStatementList
              key={fieldId}
              content={fieldContent}
              onUpdatePath={onUpdatePath}
            />
          );
        }
        if (fieldId === 'actorUsers' || fieldContent.get('type') === 'actorUsers') {
          return (
            <ActorUsersField
              key={fieldId}
              actorId={item.get('id')}
              content={fieldContent}
              onEntityClick={onEntityClick}
            />
          );
        }
        if (fieldId === 'associations' || fieldContent.get('type') === 'associations') {
          return (
            <AssociationsField
              key={fieldId}
              actorId={item.get('id')}
              content={fieldContent}
              onEntityClick={onEntityClick}
            />
          );
        }
        return null;
      })}
    </Styled>
  );
}

EntityFields.propTypes = {
  fields: PropTypes.object, // immutable Map
  item: PropTypes.object, // immutable Map
  // itemContent: PropTypes.object, // immutable Map
  columns: PropTypes.object, // immutable Map
  onUpdatePath: PropTypes.func,
  onEntityClick: PropTypes.func,
  categories: PropTypes.object, // immutable Map
  taxonomies: PropTypes.object, // immutable Map
  actionConnections: PropTypes.object, // immutable Map
  actorConnections: PropTypes.object, // immutable Map
  // onUpdatePath: PropTypes.func,
};

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

export default connect(mapStateToProps, null)(injectIntl(EntityFields));
