/*
 *
 * IndicatorEdit
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { actions as formActions } from 'react-redux-form/immutable';
import { Map, fromJS } from 'immutable';

import {
  entityOptions,
  getTitleFormField,
  getStatusField,
  getCodeFormField,
  getMarkdownFormField,
  renderActionsByActiontypeControl,
  getConnectionUpdatesFromFormData,
} from 'utils/forms';
import { getMetaField } from 'utils/fields';
import {
  checkIndicatorAttribute,
  checkIndicatorRequired,
} from 'utils/entities';
import qe from 'utils/quasi-equals';

import { scrollToTop } from 'utils/scroll-to-component';
import { hasNewError } from 'utils/entity-form';

import { CONTENT_SINGLE } from 'containers/App/constants';
import {
  USER_ROLES,
  ROUTES,
  API,
  ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS,
} from 'themes/config';
import appMessages from 'containers/App/messages';

import {
  loadEntitiesIfNeeded,
  redirectIfNotPermitted,
  updatePath,
  updateEntityForm,
  deleteEntity,
  openNewEntityModal,
  submitInvalid,
  saveErrorDismiss,
} from 'containers/App/actions';

import {
  selectReady,
  selectReadyForAuthCheck,
  selectIsUserAdmin,
  selectIsUserMember,
  selectSessionUserId,
  selectTaxonomiesWithCategories,
} from 'containers/App/selectors';

import Content from 'components/Content';
import ContentHeader from 'containers/ContentHeader';
import FormWrapper from './FormWrapper';

import {
  selectDomainPage,
  selectViewEntity,
  selectActionsByActiontype,
} from './selectors';

import messages from './messages';
import { save } from './actions';
import { DEPENDENCIES, FORM_INITIAL } from './constants';

export class IndicatorEdit extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.scrollContainer = React.createRef();
  }

  UNSAFE_componentWillMount() {
    loadEntitiesIfNeeded();
    if (this.props.dataReady && this.props.viewEntity) {
      this.props.initialiseForm('indicatorEdit.form.data', this.getInitialFormData());
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
    // repopulate if new data becomes ready
    if (nextProps.dataReady && !this.props.dataReady && nextProps.viewEntity) {
      this.props.initialiseForm('indicatorEdit.form.data', this.getInitialFormData(nextProps));
    }
    if (nextProps.authReady && !this.props.authReady) {
      this.props.redirectIfNotPermitted();
    }
    if (hasNewError(nextProps, this.props) && this.scrollContainer) {
      scrollToTop(this.scrollContainer.current);
    }
  }

  getInitialFormData = (nextProps) => {
    const props = nextProps || this.props;
    const {
      viewEntity,
      actionsByActiontype,
    } = props;
    return viewEntity
      ? Map({
        id: viewEntity.get('id'),
        attributes: viewEntity.get('attributes').mergeWith(
          (oldVal, newVal) => oldVal === null ? newVal : oldVal,
          FORM_INITIAL.get('attributes')
        ),
        associatedActionsByActiontype: actionsByActiontype
          ? actionsByActiontype.map((actions) => entityOptions({ entities: actions }))
          : Map(),
      })
      : Map();
  };

  getHeaderMainFields = (isAdmin) => {
    const { intl } = this.context;
    return (
      [ // fieldGroups
        { // fieldGroup
          fields: [
            checkIndicatorAttribute('code', isAdmin) && getCodeFormField(
              intl.formatMessage,
              'code',
              checkIndicatorRequired('code'),
            ),
            getTitleFormField(
              intl.formatMessage,
              'title',
              'title',
              true,
            ),
          ],
        },
      ]
    );
  };

  getHeaderAsideFields = (entity, isAdmin, isMine) => {
    const { intl } = this.context;
    return ([
      {
        fields: [
          getStatusField(intl.formatMessage),
          (isAdmin || isMine) && getStatusField(intl.formatMessage, 'private'),
          isAdmin && getStatusField(intl.formatMessage, 'is_archive'),
          getMetaField(entity, true),
        ],
      },
    ]);
  };

  getBodyMainFields = (
    entity,
    connectedTaxonomies,
    actionsByActiontype,
    onCreateOption,
    isAdmin,
  ) => {
    const { intl } = this.context;
    const groups = [];
    groups.push(
      {
        fields: [
          getMarkdownFormField(
            intl.formatMessage,
            false,
            'description',
          ),
        ],
      },
    );

    if (actionsByActiontype) {
      const actionConnections = renderActionsByActiontypeControl({
        entitiesByActiontype: actionsByActiontype,
        taxonomies: connectedTaxonomies,
        onCreateOption,
        intl,
        isAdmin,
        connectionAttributesForType: (actiontypeId) => ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS[actiontypeId]
          ? [
            {
              attribute: 'supportlevel_id',
              type: 'select',
              options: ACTIONTYPE_ACTION_INDICATOR_SUPPORTLEVELS[actiontypeId].map(
                (level) => ({
                  label: intl.formatMessage(appMessages.supportlevels[level.value]),
                  ...level,
                }),
              ),
            },
          ]
          : null,
      });
      if (actionConnections) {
        groups.push(
          {
            label: intl.formatMessage(appMessages.nav.actions),
            fields: actionConnections,
          },
        );
      }
    }
    return groups;
  };

  // getBodyAsideFields = (entity) => {
  //   const { intl } = this.context;
  //   const typeId = entity.getIn(['attributes', 'indicatortype_id']);
  //   return ([ // fieldGroups
  //     { // fieldGroup
  //       fields: [
  //         checkResourceAttribute(typeId, 'publication_date') && getDateField(
  //           intl.formatMessage,
  //           'publication_date',
  //           checkResourceRequired(typeId, 'publication_date'),
  //         ),
  //         checkResourceAttribute(typeId, 'access_date') && getDateField(
  //           intl.formatMessage,
  //           'access_date',
  //           checkResourceRequired(typeId, 'access_date'),
  //         ),
  //       ],
  //     },
  //   ]);
  // };

  render() {
    const { intl } = this.context;
    const {
      viewEntity,
      dataReady,
      viewDomainPage,
      connectedTaxonomies,
      actionsByActiontype,
      onCreateOption,
      isAdmin,
      isUserMember,
      myId,
      onErrorDismiss,
      onServerErrorDismiss,
      handleCancel,
      handleSubmitRemote,
      handleSubmit,
      handleSubmitFail,
      handleUpdate,
      handleDelete,
    } = this.props;

    const { saveSending, saveError, deleteSending } = viewDomainPage.toJS();

    const type = intl.formatMessage(appMessages.entities.indicators.single);
    const isMine = viewEntity && qe(viewEntity.getIn(['attributes', 'created_by_id']), myId);

    // user can delete content
    // if they are admins or
    // if they are at least members and its their own content
    const canDelete = isAdmin
      || (isUserMember && viewEntity && qe(myId, viewEntity.getIn(['attributes', 'created_by_id'])));

    return (
      <div>
        <Helmet
          title={`${intl.formatMessage(messages.pageTitle, { type })}`}
          meta={[
            { name: 'description', content: intl.formatMessage(messages.metaDescription) },
          ]}
        />
        <Content ref={this.scrollContainer}>
          <ContentHeader
            title={intl.formatMessage(messages.pageTitle, { type })}
            type={CONTENT_SINGLE}
            buttons={
              viewEntity && dataReady ? [{
                type: 'cancel',
                onClick: handleCancel,
              },
              {
                type: 'save',
                disabled: saveSending,
                onClick: () => handleSubmitRemote('indicatorEdit.form.data'),
              }] : null
            }
          />
          {!viewEntity && dataReady && !saveError && !deleteSending
            && (
              <div>
                <FormattedMessage {...messages.notFound} />
              </div>
            )
          }
          {viewEntity && !deleteSending
            && (
              <FormWrapper
                model="indicatorEdit.form.data"
                saving={saveSending}
                handleSubmit={(formData) => handleSubmit(
                  formData,
                  actionsByActiontype,
                )}
                handleSubmitFail={handleSubmitFail}
                handleCancel={handleCancel}
                handleUpdate={handleUpdate}
                handleDelete={canDelete ? handleDelete : null}
                onErrorDismiss={onErrorDismiss}
                onServerErrorDismiss={onServerErrorDismiss}
                fields={dataReady && {
                  header: {
                    main: this.getHeaderMainFields(isAdmin),
                    aside: this.getHeaderAsideFields(viewEntity, isAdmin, isMine),
                  },
                  body: {
                    main: this.getBodyMainFields(
                      viewEntity,
                      connectedTaxonomies,
                      actionsByActiontype,
                      onCreateOption,
                      isAdmin,
                    ),
                    // aside: this.getBodyAsideFields(
                    //   viewEntity
                    // ),
                  },
                }}
                scrollContainer={this.scrollContainer.current}
              />
            )
          }
        </Content>
      </div>
    );
  }
}

IndicatorEdit.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  redirectIfNotPermitted: PropTypes.func,
  initialiseForm: PropTypes.func,
  handleSubmitRemote: PropTypes.func.isRequired,
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  handleDelete: PropTypes.func,
  viewDomainPage: PropTypes.object,
  viewEntity: PropTypes.object,
  dataReady: PropTypes.bool,
  authReady: PropTypes.bool,
  isAdmin: PropTypes.bool,
  isUserMember: PropTypes.bool,
  params: PropTypes.object,
  actionsByActiontype: PropTypes.object,
  onCreateOption: PropTypes.func,
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  connectedTaxonomies: PropTypes.object,
  myId: PropTypes.string,
};

IndicatorEdit.contextTypes = {
  intl: PropTypes.object.isRequired,
};
const mapStateToProps = (state, props) => ({
  viewDomainPage: selectDomainPage(state),
  isAdmin: selectIsUserAdmin(state),
  isUserMember: selectIsUserMember(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  authReady: selectReadyForAuthCheck(state),
  viewEntity: selectViewEntity(state, props.params.id),
  actionsByActiontype: selectActionsByActiontype(state, props.params.id),
  connectedTaxonomies: selectTaxonomiesWithCategories(state),
  myId: selectSessionUserId(state),
});

function mapDispatchToProps(dispatch, props) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    redirectIfNotPermitted: () => {
      dispatch(redirectIfNotPermitted(USER_ROLES.MEMBER.value));
    },
    initialiseForm: (model, formData) => {
      dispatch(formActions.reset(model));
      dispatch(formActions.change(model, formData, { silent: true }));
    },
    onErrorDismiss: () => {
      dispatch(submitInvalid(true));
    },
    onServerErrorDismiss: () => {
      dispatch(saveErrorDismiss());
    },
    handleSubmitFail: () => {
      dispatch(submitInvalid(false));
    },
    handleSubmitRemote: (model) => {
      dispatch(formActions.submit(model));
    },
    handleSubmit: (
      formData,
      actionsByActiontype,
    ) => {
      let saveData = formData;
      if (actionsByActiontype) {
        saveData = saveData.set(
          'actionIndicators',
          actionsByActiontype
            .map((actions, actiontypeid) => getConnectionUpdatesFromFormData({
              formData,
              connections: actions,
              connectionAttribute: ['associatedActionsByActiontype', actiontypeid.toString()],
              createConnectionKey: 'measure_id',
              createKey: 'indicator_id',
              connectionAttributes: ['supportlevel_id'],
            }))
            .reduce(
              (memo, deleteCreateLists) => {
                const deletes = memo.get('delete').concat(deleteCreateLists.get('delete'));
                const creates = memo.get('create').concat(deleteCreateLists.get('create'));
                const updates = memo.get('update').concat(deleteCreateLists.get('update'));
                return memo
                  .set('delete', deletes)
                  .set('create', creates)
                  .set('update', updates);
              },
              fromJS({
                delete: [],
                create: [],
                update: [],
              }),
            )
        );
      }
      dispatch(save(saveData.toJS()));
    },
    handleCancel: () => {
      dispatch(updatePath(`${ROUTES.INDICATOR}/${props.params.id}`, { replace: true }));
    },
    handleUpdate: (formData) => {
      dispatch(updateEntityForm(formData));
    },
    handleDelete: () => {
      dispatch(deleteEntity({
        path: API.INDICATORS,
        id: props.params.id,
        redirect: ROUTES.INDICATORS,
      }));
    },
    onCreateOption: (args) => {
      dispatch(openNewEntityModal(args));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(IndicatorEdit);
