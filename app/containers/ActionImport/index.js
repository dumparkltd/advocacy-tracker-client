/*
 *
 * ActionImport
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { actions as formActions } from 'react-redux-form/immutable';

import { format, parse } from 'date-fns';

import { fromJS } from 'immutable';

import { CONTENT_SINGLE } from 'containers/App/constants';
import {
  ROUTES,
  USER_ROLES,
  API,
  ACTION_FIELDS,
  DATE_FORMAT,
  API_DATE_FORMAT,
} from 'themes/config';
import qe from 'utils/quasi-equals';
import { getImportFields, getColumnAttribute } from 'utils/import';
import { checkActionAttribute, checkAttribute } from 'utils/entities';
import { lowerCase } from 'utils/string';
import validateDateFormat from 'components/forms/validators/validate-date-format';

import {
  redirectIfNotPermitted,
  updatePath,
  loadEntitiesIfNeeded,
  resetProgress,
} from 'containers/App/actions';

import {
  selectReady,
  selectReadyForAuthCheck,
  selectActionConnections,
  selectCategories,
} from 'containers/App/selectors';

import Content from 'components/Content';
import ContentHeader from 'containers/ContentHeader';
import ImportEntitiesForm from 'components/forms/ImportEntitiesForm';

import appMessages from 'containers/App/messages';

import {
  selectErrors,
  selectProgress,
  selectFormData,
  selectSuccess,
} from './selectors';

import messages from './messages';
import { save, resetForm } from './actions';
import { FORM_INITIAL, DEPENDENCIES } from './constants';

export class ActionImport extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  UNSAFE_componentWillMount() {
    if (this.props.dataReady) {
      this.props.initialiseForm('actionImport.form.data', FORM_INITIAL);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
    if (nextProps.dataReady && !this.props.dataReady) {
      this.props.initialiseForm('actionImport.form.data', FORM_INITIAL);
    }
    if (nextProps.authReady && !this.props.authReady) {
      this.props.redirectIfNotPermitted();
    }
  }

  render() {
    const { intl } = this.context;
    const { connections, categories, params } = this.props;
    const typeId = params.id;
    const typeLabel = typeId
      ? intl.formatMessage(appMessages.entities[`actions_${typeId}`].plural)
      : intl.formatMessage(appMessages.entities.actions.plural);

    const fields = Object.keys(ACTION_FIELDS.ATTRIBUTES).reduce((memo, key) => {
      const val = ACTION_FIELDS.ATTRIBUTES[key];
      if (
        !val.skipImport
        && checkActionAttribute(typeId, key)
      ) {
        return [
          ...memo,
          {
            attribute: key,
            type: val.type || 'text',
            value: (val.importDefault && val.importDefault === 'type')
              ? typeId
              : null,
            required: !!val.required,
            import: true,
          },
        ];
      }
      return memo;
    }, []);
    const relationshipFields = Object.keys(
      ACTION_FIELDS.RELATIONSHIPS_IMPORT
    ).reduce(
      (memo, key) => {
        if (
          checkAttribute({
            typeId,
            att: key,
            attributes: ACTION_FIELDS.RELATIONSHIPS_IMPORT,
          })
          // (val.optional && val.optional.indexOf(typeId) > -1)
          // || (val.required && val.required.indexOf(typeId) > -1)
        ) {
          const val = ACTION_FIELDS.RELATIONSHIPS_IMPORT[key];
          return [
            ...memo,
            {
              attribute: key,
              type: val.type || 'text',
              required: !!val.required,
              import: true,
              relationshipValue: val.attribute,
              separator: val.separator,
              hint: val.hint,
            },
          ];
        }
        return memo;
      },
      [],
    );
    return (
      <div>
        <Helmet
          title={intl.formatMessage(messages.pageTitle)}
          meta={[
            {
              name: 'description',
              content: intl.formatMessage(messages.metaDescription),
            },
          ]}
        />
        <Content>
          <ContentHeader
            title={intl.formatMessage(messages.pageTitle)}
            type={CONTENT_SINGLE}
            icon="actions"
            buttons={[{
              type: 'cancel',
              onClick: this.props.handleCancel,
            }]}
          />
          <ImportEntitiesForm
            typeLabel={typeLabel}
            model="actionImport.form.data"
            fieldModel="import"
            formData={this.props.formData}
            handleSubmit={(formData) => {
              this.props.handleSubmit(formData, connections, categories);
            }}
            handleCancel={this.props.handleCancel}
            handleReset={this.props.handleReset}
            resetProgress={this.props.resetProgress}
            errors={this.props.errors}
            success={this.props.success}
            progress={this.props.progress}
            template={{
              filename: `${intl.formatMessage(messages.filename, { type: lowerCase(typeLabel) })}.csv`,
              data: getImportFields({ fields, relationshipFields }, intl.formatMessage),
            }}
          />
        </Content>
      </div>
    );
  }
}

ActionImport.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  redirectIfNotPermitted: PropTypes.func,
  initialiseForm: PropTypes.func,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleReset: PropTypes.func.isRequired,
  formData: PropTypes.object,
  dataReady: PropTypes.bool,
  authReady: PropTypes.bool,
  resetProgress: PropTypes.func.isRequired,
  progress: PropTypes.number,
  errors: PropTypes.object,
  success: PropTypes.object,
  params: PropTypes.object,
  connections: PropTypes.object,
  categories: PropTypes.object,
};

ActionImport.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  formData: selectFormData(state),
  progress: selectProgress(state),
  errors: selectErrors(state),
  success: selectSuccess(state),
  connections: selectActionConnections(state),
  categories: selectCategories(state),
  dataReady: selectReady(state, {
    path: [
      API.USER_ROLES,
    ],
  }),
  authReady: selectReadyForAuthCheck(state),
});

function mapDispatchToProps(dispatch, { params }) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    resetProgress: () => {
      dispatch(resetProgress());
      dispatch(resetForm());
    },
    redirectIfNotPermitted: () => {
      dispatch(redirectIfNotPermitted(USER_ROLES.MEMBER.value));
    },
    initialiseForm: (model, formData) => {
      dispatch(formActions.load(model, formData));
    },
    handleSubmit: (formData, connections, categories) => {
      if (formData.get('import') !== null) {
        fromJS(formData.get('import').rows).forEach((row, index) => {
          let rowCleanColumns = row.mapKeys((k) => getColumnAttribute(k));
          // make sure type id is set
          const typeId = params.id;
          rowCleanColumns = rowCleanColumns.set('measuretype_id', typeId);
          let rowClean = {
            attributes: rowCleanColumns
              // make sure only valid fields are imported
              .filter((val, att) => checkActionAttribute(typeId, att))
              // make sure we store well formatted date
              .map((val, att) => {
                const config = ACTION_FIELDS.ATTRIBUTES[att];
                if (config.type === 'date' && val && val.trim() !== '') {
                  if (validateDateFormat(val, DATE_FORMAT)) {
                    return format(
                      parse(val, DATE_FORMAT, new Date()),
                      API_DATE_FORMAT
                    );
                  }
                  return '';
                }
                return val;
              })
              .set('draft', true)
              .toJS(),
            saveRef: index + 1,
          };
          const rowJS = row.toJS();
          const relRows = Object.keys(rowJS).reduce(
            (memo, key) => {
              const hasRelData = key.indexOf('[rel:') > -1
                && rowJS[key]
                && rowJS[key].trim() !== '';
              // console.log('hasRelData', hasRelData, key, rowJS[key])
              if (!hasRelData) return memo;
              const start = key.indexOf('[');
              const end = key.indexOf(']');
              const [, fieldValues] = key.substring(start + 1, end).split('rel:');
              const [field, values] = fieldValues.split('|');
              // console.log('values', values);
              return checkAttribute({
                typeId,
                att: field,
                attributes: ACTION_FIELDS.RELATIONSHIPS_IMPORT,
              })
                ? [
                  ...memo,
                  {
                    column: key,
                    value: rowJS[key],
                    values: rowJS[key].trim().split(','),
                    field,
                    fieldValues: values,
                  },
                ]
                : memo;
            },
            [],
          );
          // check relationships
          if (relRows) {
            let actionIndicators;
            let actorActions;
            let topActions;
            let actionResources;
            let actionCategories;
            let userActions;
            Object.values(relRows).forEach(
              (relationship) => {
                if (relationship.values) {
                  const relField = relationship.field;
                  const relConfig = ACTION_FIELDS.RELATIONSHIPS_IMPORT[relationship.field];
                  relationship.values.forEach(
                    (relValue) => {
                      const [id, value] = relValue.trim().split('|');
                      if (relConfig) {
                        // assume field to referencet the id
                        let connectionId = id;
                        // unless attribute specified
                        if (relConfig.lookup
                          && relConfig.lookup.table
                          && relConfig.lookup.attribute
                        ) {
                          if (categories && relConfig.lookup.table === API.CATEGORIES) {
                            const category = categories.find(
                              (entity) => qe(entity.getIn(['attributes', relConfig.lookup.attribute]), id)
                            );
                            connectionId = category ? category.get('id') : 'INVALID';
                          } else if (connections) {
                            const connection = connections.get(relConfig.lookup.table)
                              && connections.get(relConfig.lookup.table).find(
                                (entity) => qe(entity.getIn(['attributes', relConfig.lookup.attribute]), id)
                              );
                            connectionId = connection ? connection.get('id') : 'INVALID';
                          }
                        }
                        // actionIndicators by code
                        if (relField === 'topic-code') {
                          const create = { indicator_id: connectionId, supportlevel_id: value };
                          if (actionIndicators && actionIndicators.create) {
                            actionIndicators.create = [
                              ...actionIndicators.create,
                              create,
                            ];
                          } else {
                            actionIndicators = { create: [create] };
                          }
                        }
                        // actorActions by code or id
                        if (
                          relField === 'country-code'
                          || relField === 'actor-code'
                          || relField === 'actor-id'
                        ) {
                          const create = { actor_id: connectionId };
                          if (actorActions && actorActions.create) {
                            actorActions.create = [
                              ...actorActions.create,
                              create,
                            ];
                          } else {
                            actorActions = { create: [create] };
                          }
                        }

                        // actionCategories by code or id
                        if (relField === 'category-code' || relField === 'category-id') {
                          const create = { category_id: connectionId };
                          if (actionCategories && actionCategories.create) {
                            actionCategories.create = [
                              ...actionCategories.create,
                              create,
                            ];
                          } else {
                            actionCategories = { create: [create] };
                          }
                        }
                        // topActions/parent actions
                        if (
                          relField === 'interaction-code'
                          || relField === 'event-code'
                          || relField === 'parent-action-code'
                          || relField === 'parent-action-id'
                        ) {
                          const create = {
                            other_measure_id: connectionId,
                          };
                          if (topActions && topActions.create) {
                            topActions.create = [
                              ...topActions.create,
                              create,
                            ];
                          } else {
                            topActions = {
                              create: [create],
                            };
                          }
                        }
                        // actionResources by id
                        if (relField === 'resources-id') {
                          const create = { resource_id: connectionId };
                          if (actionResources && actionResources.create) {
                            actionResources.create = [
                              ...actionResources.create,
                              create,
                            ];
                          } else {
                            actionResources = { create: [create] };
                          }
                        } // actionResources
                        // actionUsers by id or email
                        if (
                          relField === 'user-id'
                          || relField === 'user-email'
                        ) {
                          const create = { user_id: connectionId };
                          if (userActions && userActions.create) {
                            userActions.create = [
                              ...userActions.create,
                              create,
                            ];
                          } else {
                            userActions = { create: [create] };
                          }
                        } // actionUsers
                      } // relConfig
                    }
                  ); // forEach
                }
              }
            );
            rowClean = {
              ...rowClean,
              actorActions,
              actionIndicators,
              actionCategories,
              topActions,
              actionResources,
              userActions,
            };
          }
          dispatch(save(rowClean));
        });
      }
    },
    handleCancel: () => {
      dispatch(updatePath(`${ROUTES.ACTIONS}/${params ? params.id : ''}`));
    },
    handleReset: () => {
      dispatch(resetProgress());
      dispatch(resetForm());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActionImport);
