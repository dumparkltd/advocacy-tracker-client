import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Map, fromJS } from 'immutable';
// import { injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Box, Text } from 'grommet';
// import { checkActorAttribute, getActortypeColumns } from 'utils/entities';

import FieldFactory from 'components/fields/FieldFactory';

import {
  // ACTIONTYPES,
  // ACTORTYPES,
  API,
} from 'themes/config';

import qe from 'utils/quasi-equals';
import asArray from 'utils/as-array';
import {
  getUserConnectionField,
  getActorConnectionField,
  getTaxonomyFields,
  getEntityLinkField,
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
import ActionUsersField from './ActionUsersField';
import AssociationsField from './AssociationsField';
import AttributeField from './AttributeField';
import StatementIndicatorsField from './StatementIndicatorsField';
import ChildIndicatorsField from './ChildIndicatorsField';
import ActorIndicatorsField from './ActorIndicatorsField';

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
  isAdmin,
}) {
  return (
    <Styled gap="large">
      {fields && Object.keys(fields).map((fieldId) => {
        const fieldContent = fields[fieldId];
        if (!fieldContent) {
          return null;
        }
        // console.log(fieldContent)
        if (columns && fieldContent.columnId) {
          // console.log('columns', columns && columns.toJS())
          const column = columns.find((c) => c.get('id') === fieldContent.columnId);
          if (column) {
            let theField;
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

                // console.log(taxonomyWithCategories && taxonomyWithCategories.toJS())
                if (taxonomyWithCategories && taxonomyWithCategories.getIn([taxId, 'categories'])) {
                  theField = getTaxonomyFields(taxonomyWithCategories);
                }
              }
            }
            if (actorConnections && qe(column.get('type'), 'actors') && item.get('actorsByType')) {
              theField = item.get('actorsByType').reduce(
                (memo, actorIds, typeid) => {
                  if (actorIds) {
                    const actors = actorConnections.get(API.ACTORS).filter(
                      (actor) => actorIds.includes(parseInt(actor.get('id'), 10)),
                    );
                    return [
                      ...memo,
                      getActorConnectionField({
                        actors,
                        onEntityClick,
                        typeid,
                      }),
                    ];
                  }
                  return memo;
                },
                [],
              );
            }
            if (actorConnections && qe(column.get('type'), 'indicators') && item.get('actorsByType')) {
              theField = item.get('actorsByType').reduce(
                (memo, actorIds, typeid) => {
                  if (actorIds) {
                    const actors = actorConnections.get(API.ACTORS).filter(
                      (actor) => actorIds.includes(parseInt(actor.get('id'), 10)),
                    );
                    return [
                      ...memo,
                      getActorConnectionField({
                        actors,
                        onEntityClick,
                        typeid,
                      }),
                    ];
                  }
                  return memo;
                },
                [],
              );
            }
            if (actorConnections && qe(column.get('type'), 'associations') && item.get('associationsByType')) {
              if (fieldContent.type) {
                const actorIds = item.getIn(['associationsByType', parseInt(fieldContent.type, 10)]);
                if (actorIds) {
                  const actors = actorConnections.get(API.ACTORS).filter(
                    (actor) => actorIds.includes(parseInt(actor.get('id'), 10)),
                  );
                  theField = getActorConnectionField({
                    actors,
                    onEntityClick,
                    typeid: parseInt(fieldContent.type, 10),
                    columns: null,
                  });
                }
              }
            }
            if (theField) {
              return (
                <Box key={fieldId} direction="row" fill={false} flex={false}>
                  <Box gap="small">
                    {fieldContent.title && (
                      <SectionTitle>
                        {fieldContent.title}
                      </SectionTitle>
                    )}
                    {asArray(theField).map((f, i) => (
                      <FieldFactory
                        key={i}
                        field={{
                          ...f,
                          onEntityClick,
                          noPadding: true,
                          fill: false,
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              );
            }
            return null;
          }
        }
        if (fieldId === 'countryPositions') {
          return (
            <PreviewCountryPositionsList
              key={fieldId}
              content={fromJS(fieldContent)}
              onUpdatePath={onUpdatePath}
              isAdmin={isAdmin}
            />
          );
        }
        if (fieldId === 'topicPosition') {
          return (
            <PreviewCountryTopicPosition
              key={fieldId}
              content={fromJS(fieldContent)}
              onUpdatePath={onUpdatePath}
              isAdmin={isAdmin}
            />
          );
        }
        if (fieldId === 'topicStatements' && !fieldContent.isAggregateIndicator) {
          return (
            <PreviewCountryTopicStatementList
              key={fieldId}
              content={fromJS(fieldContent)}
              onUpdatePath={onUpdatePath}
              isAdmin={isAdmin}
            />
          );
        }
        if (fieldId === 'actorUsers' || fieldContent.type === 'actorUsers') {
          return (
            <ActorUsersField
              key={fieldId}
              actorId={item.get('id')}
              content={fromJS(fieldContent)}
              onEntityClick={onEntityClick}
              isAdmin={isAdmin}
            />
          );
        }
        if (fieldId === 'actionUsers' || fieldContent.type === 'actionUsers') {
          return (
            <ActionUsersField
              key={fieldId}
              actionId={item.get('id')}
              content={fromJS(fieldContent)}
              onEntityClick={onEntityClick}
              isAdmin={isAdmin}
            />
          );
        }
        if (fieldId === 'associations' || fieldContent.type === 'associations') {
          return (
            <AssociationsField
              key={fieldId}
              actorId={item.get('id')}
              content={fromJS(fieldContent)}
              onEntityClick={onEntityClick}
              isAdmin={isAdmin}
            />
          );
        }
        if (fieldId === 'statementIndicators') {
          return (
            <StatementIndicatorsField
              key={fieldId}
              statement={item}
              content={fromJS(fieldContent)}
              onEntityClick={onEntityClick}
              isAdmin={isAdmin}
            />
          );
        }
        if (fieldId === 'actorIndicators') {
          return (
            <ActorIndicatorsField
              key={fieldId}
              actorId={item.get('id')}
              content={fromJS(fieldContent)}
            />
          );
        }
        if (fieldId === 'parentIndicator' && item.get('parentIndicator')) {
          const field = getEntityLinkField(
            item.get('parentIndicator'),
            '/topic',
            '',
            'Parent topic'
          );
          return (
            <Box gap="small" key={fieldId}>
              <FieldFactory
                field={{
                  ...field,
                  onEntityClick,
                  noPadding: true,
                }}
              />
            </Box>
          );
        }
        if (
          fieldId === 'childIndicators'
          && item.getIn(['attributes', 'is_parent'])
        ) {
          return (
            <ChildIndicatorsField
              key={fieldId}
              indicator={item}
              content={fromJS(fieldContent)}
              onEntityClick={onEntityClick}
            />
          );
        }
        if (fieldId === 'fields') {
          return (
            <Box gap="large" key={fieldId}>
              {fieldContent.map(
                (field, i) => (
                  <FieldFactory
                    key={i}
                    field={{
                      ...field,
                      onEntityClick,
                      noPadding: true,
                      fill: false,
                    }}
                  />
                )
              )}
            </Box>
          );
        }
        if (fieldContent.attribute) {
          return (
            <AttributeField
              key={fieldId}
              entity={item}
              content={fromJS(fieldContent)}
              isAdmin={isAdmin}
            />
          );
        }
        return null;
      })}
    </Styled>
  );
}

EntityFields.propTypes = {
  fields: PropTypes.object,
  item: PropTypes.object, // immutable Map
  // itemContent: PropTypes.object, // immutable Map
  columns: PropTypes.object, // immutable Map
  onUpdatePath: PropTypes.func,
  onEntityClick: PropTypes.func,
  categories: PropTypes.object, // immutable Map
  taxonomies: PropTypes.object, // immutable Map
  actionConnections: PropTypes.object, // immutable Map
  actorConnections: PropTypes.object, // immutable Map
  isAdmin: PropTypes.bool,
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
  const props = {
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
  return props;
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(EntityFields));
