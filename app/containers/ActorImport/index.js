/*
 *
 * ActorImport
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
  ACTOR_FIELDS,
  DATE_FORMAT,
  API_DATE_FORMAT,
} from 'themes/config';
import qe from 'utils/quasi-equals';
import { getImportFields, getColumnAttribute } from 'utils/import';
import { checkActorAttribute, checkAttribute } from 'utils/entities';
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
  selectActorConnections,
  selectCategories,
} from 'containers/App/selectors';

// import Loading from 'components/Loading';
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

export class ActorImport extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  UNSAFE_componentWillMount() {
    if (this.props.dataReady) {
      this.props.initialiseForm('actorImport.form.data', FORM_INITIAL);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
    if (nextProps.dataReady && !this.props.dataReady) {
      this.props.initialiseForm('actorImport.form.data', FORM_INITIAL);
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
      ? intl.formatMessage(appMessages.entities[`actors_${typeId}`].plural)
      : intl.formatMessage(appMessages.entities.actors.plural);
    const fields = Object.keys(ACTOR_FIELDS.ATTRIBUTES).reduce((memo, key) => {
      const val = ACTOR_FIELDS.ATTRIBUTES[key];
      if (
        !val.skipImport
        && checkActorAttribute(typeId, key)
      ) {
        return [
          ...memo,
          {
            attribute: key,
            type: val.type || 'text',
            required: !!val.required,
            import: true,
          },
        ];
      }
      return memo;
    }, []);
    const relationshipFields = Object.keys(
      ACTOR_FIELDS.RELATIONSHIPS_IMPORT
    ).reduce(
      (memo, key) => {
        if (
          checkAttribute({
            typeId,
            att: key,
            attributes: ACTOR_FIELDS.RELATIONSHIPS_IMPORT,
          })
          // (val.optional && val.optional.indexOf(typeId) > -1)
          // || (val.required && val.required.indexOf(typeId) > -1)
        ) {
          const val = ACTOR_FIELDS.RELATIONSHIPS_IMPORT[key];
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
          title={`${intl.formatMessage(messages.pageTitle)}`}
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
            icon="actors"
            buttons={[{
              type: 'cancel',
              onClick: this.props.handleCancel,
            }]}
          />
          <ImportEntitiesForm
            typeLabel={typeLabel}
            model="actorImport.form.data"
            fieldModel="import"
            formData={this.props.formData}
            handleSubmit={(formData) => this.props.handleSubmit(formData, connections, categories)}
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

ActorImport.propTypes = {
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

ActorImport.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  formData: selectFormData(state),
  progress: selectProgress(state),
  errors: selectErrors(state),
  success: selectSuccess(state),
  connections: selectActorConnections(state),
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
    initialiseForm: (model, formData) => {
      dispatch(formActions.load(model, formData));
    },
    redirectIfNotPermitted: () => {
      dispatch(redirectIfNotPermitted(USER_ROLES.MEMBER.value));
    },
    handleSubmit: (formData, connections, categories) => {
      if (formData.get('import') !== null) {
        fromJS(formData.get('import').rows).forEach((row, index) => {
          let rowCleanColumns = row.mapKeys((k) => getColumnAttribute(k));
          const typeId = params.id;
          // make sure type id is set
          rowCleanColumns = rowCleanColumns.set('actortype_id', typeId);
          let rowClean = {
            attributes: rowCleanColumns
              // make sure only valid fields are imported
              .filter((val, att) => checkActorAttribute(typeId, att))
              // make sure we store well formatted date
              .map((val, att) => {
                const config = ACTOR_FIELDS.ATTRIBUTES[att];
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
                attributes: ACTOR_FIELDS.RELATIONSHIPS_IMPORT,
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
            let memberships;
            let actorActions;
            let actorCategories;
            let userActors;
            Object.values(relRows).forEach(
              (relationship) => {
                if (relationship.values) {
                  const relField = relationship.field;
                  const relConfig = ACTOR_FIELDS.RELATIONSHIPS_IMPORT[relationship.field];
                  // console.log('connections', connections && connections.toJS(0))
                  relationship.values.forEach(
                    (relValue) => {
                      const id = relValue;
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
                        // memberships by code or id
                        if (
                          relField === 'country-code'
                          || relField === 'actor-code'
                          || relField === 'actor-id'
                        ) {
                          const create = { memberof_id: connectionId };
                          if (memberships && memberships.create) {
                            memberships.create = [
                              ...memberships.create,
                              create,
                            ];
                          } else {
                            memberships = { create: [create] };
                          }
                        }
                        // actor actions
                        if (relField === 'event-code') {
                          const create = {
                            measure_id: connectionId,
                          };
                          if (actorActions && actorActions.create) {
                            actorActions.create = [
                              ...actorActions.create,
                              create,
                            ];
                          } else {
                            actorActions = {
                              create: [create],
                            };
                          }
                        }
                        // actionUsers by id or email
                        if (
                          relField === 'user-id'
                          || relField === 'user-email'
                        ) {
                          const create = { user_id: connectionId };
                          if (userActors && userActors.create) {
                            userActors.create = [
                              ...userActors.create,
                              create,
                            ];
                          } else {
                            userActors = { create: [create] };
                          }
                        } // actionUsers
                        // actorCategories by code or id
                        if (relField === 'category-code' || relField === 'category-id') {
                          const create = { category_id: connectionId };
                          if (actorCategories && actorCategories.create) {
                            actorCategories.create = [
                              ...actorCategories.create,
                              create,
                            ];
                          } else {
                            actorCategories = { create: [create] };
                          }
                        }
                      } // relConfig
                    }
                  ); // forEach
                }
              }
            );
            rowClean = {
              ...rowClean,
              memberships,
              actorActions,
              userActors,
              actorCategories,
            };
          }
          dispatch(save(rowClean));
        });
      }
    },
    handleCancel: () => {
      dispatch(updatePath(`${ROUTES.ACTORS}/${params ? params.id : ''}`));
    },
    handleReset: () => {
      dispatch(resetProgress());
      dispatch(resetForm());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActorImport);
