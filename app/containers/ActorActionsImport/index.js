/*
 *
 * ActorActionsImport
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { actions as formActions } from 'react-redux-form/immutable';
import { fromJS, Map } from 'immutable';

import { CONTENT_SINGLE } from 'containers/App/constants';
import {
  ROUTES,
  USER_ROLES,
} from 'themes/config';
import { getColumnAttribute } from 'utils/import';
import qe from 'utils/quasi-equals';
import isNumber from 'utils/is-number';
import {
  redirectIfNotPermitted,
  updatePath,
  loadEntitiesIfNeeded,
  resetProgress,
} from 'containers/App/actions';

import {
  selectReady,
  selectReadyForAuthCheck,
  selectAction,
  selectActors,
} from 'containers/App/selectors';

// import Loading from 'components/Loading';
import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';
import ImportActorActionsForm from 'components/forms/ImportActorActionsForm';

import {
  selectErrors,
  selectProgress,
  selectFormData,
  selectSuccess,
} from './selectors';

import messages from './messages';
import { save, resetForm } from './actions';
import { FORM_INITIAL, DEPENDENCIES } from './constants';

export class ActorActionsImport extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
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
            buttons={[{
              type: 'cancel',
              onClick: this.props.handleCancel,
            }]}
          />
          <ImportActorActionsForm
            model="actorActionsImport.form.data"
            fieldModel="import"
            formData={this.props.formData}
            handleSubmit={(formData) => this.props.handleSubmit(formData, this.props.actors, this.props.params.id)}
            handleCancel={this.props.handleCancel}
            handleReset={this.props.handleReset}
            resetProgress={this.props.resetProgress}
            errors={this.props.errors}
            success={this.props.success}
            progress={this.props.progress}
            action={this.props.action}
          />
        </Content>
      </div>
    );
  }
}

ActorActionsImport.propTypes = {
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
  action: PropTypes.instanceOf(Map),
  actors: PropTypes.instanceOf(Map),
};

ActorActionsImport.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, { params }) => ({
  formData: selectFormData(state),
  progress: selectProgress(state),
  errors: selectErrors(state),
  success: selectSuccess(state),
  action: selectAction(state, params.id),
  actors: selectActors(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  authReady: selectReadyForAuthCheck(state),
});
const FIELDS = ['value'];
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
    handleSubmit: (formData, actors, actionId) => {
      if (formData.get('import') !== null) {
        fromJS(formData.get('import').rows).forEach((row, index) => {
          const rowCleanColumns = row.mapKeys((k) => getColumnAttribute(k));
          const rowActor = actors.find((actor) => qe(actor.getIn(['attributes', 'code']), rowCleanColumns.get('code')));
          const rowClean = {
            attributes: rowCleanColumns
              // make sure only valid fields are imported
              .filter((val, att) => FIELDS.indexOf(att) > -1)
              .map((val, att) => {
                if (att === 'value' && isNumber(val)) {
                  return parseFloat(val);
                }
                return null;
              })
              .set('actor_id', rowActor ? rowActor.get('id') : '') // '' should cause an error
              .set('measure_id', actionId)
              .toJS(),
            saveRef: index + 1,
          };
          dispatch(save(rowClean));
        });
      }
    },
    handleCancel: () => {
      dispatch(updatePath(`${ROUTES.ACTION}/${params.id}`));
    },
    handleReset: () => {
      dispatch(resetProgress());
      dispatch(resetForm());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActorActionsImport);
