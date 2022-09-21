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
} from 'containers/App/selectors';

import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';
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
    const { connections, params } = this.props;
    const typeId = params.id;
    const typeLabel = typeId
      ? intl.formatMessage(appMessages.entities[`actions_${typeId}`].plural)
      : intl.formatMessage(appMessages.entities.actions.plural);

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
              this.props.handleSubmit(formData, connections);
            }}
            handleCancel={this.props.handleCancel}
            handleReset={this.props.handleReset}
            resetProgress={this.props.resetProgress}
            errors={this.props.errors}
            success={this.props.success}
            progress={this.props.progress}
            template={{
              filename: `${intl.formatMessage(messages.filename)}.csv`,
              data: getImportFields(
                {
                  fields: Object.keys(ACTION_FIELDS.ATTRIBUTES).reduce((memo, key) => {
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
                  }, []),
                  relationshipFields: Object.keys(
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
                          },
                        ];
                      }
                      return memo;
                    },
                    [],
                  ),
                },
                intl.formatMessage,
              ),
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
    handleSubmit: (formData, connections) => {
      if (formData.get('import') !== null) {
        fromJS(formData.get('import').rows).forEach((row, index) => {
          const rowCleanColumns = row.mapKeys((k) => getColumnAttribute(k));
          const typeId = rowCleanColumns.get('measuretype_id');
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
            Object.values(relRows).forEach(
              (relationship) => {
                const [id, value] = relationship.value.split('|');
                const relField = relationship.field;
                const relConfig = ACTION_FIELDS.RELATIONSHIPS_IMPORT[relationship.field];
                if (relConfig) {
                  let connectionId = id;
                  if (
                    connections
                    && relConfig.lookup
                    && relConfig.lookup.table
                    && relConfig.lookup.attribute
                  ) {
                    const connection = connections.get(relConfig.lookup.table)
                      && connections.get(relConfig.lookup.table).find(
                        (entity) => qe(entity.getIn(['attributes', relConfig.lookup.attribute]), id)
                      );
                    connectionId = connection ? connection.get('id') : 'INVALID';
                  }
                  if (relField === 'topicCode') {
                    const create = {
                      indicator_id: connectionId,
                      supportlevel_id: value,
                    };
                    if (actionIndicators && actionIndicators.create) {
                      actionIndicators.create = [
                        ...actionIndicators.create,
                        create,
                      ];
                    } else {
                      actionIndicators = {
                        create: [create],
                      };
                    }
                  }
                  if (relField === 'countryCode') {
                    const create = {
                      actor_id: connectionId,
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
                  if (relField === 'eventCode') {
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
                  if (relField === 'resourcesID') {
                    const create = {
                      resource_id: connectionId,
                    };
                    if (actionResources && actionResources.create) {
                      actionResources.create = [
                        ...actionResources.create,
                        create,
                      ];
                    } else {
                      actionResources = {
                        create: [create],
                      };
                    }
                  }
                }
              }
            );
            rowClean = {
              ...rowClean,
              actionIndicators,
              actorActions,
              topActions,
              actionResources,
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
