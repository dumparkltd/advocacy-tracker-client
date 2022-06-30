/*
*
* ActorNew
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { actions as formActions } from 'react-redux-form/immutable';

import { Map, List, fromJS } from 'immutable';

import {
  getConnectionUpdatesFromFormData,
  getTitleFormField,
  getStatusField,
  getMarkdownFormField,
  getCodeFormField,
  renderTaxonomyControl,
  getLinkFormField,
  renderActionsByActiontypeControl,
  renderActionsAsTargetByActiontypeControl,
  renderAssociationsByActortypeControl,
  renderMembersByActortypeControl,
  getEmailField,
  getTextFormField,
  getTextareaField,
  renderUserMultiControl,
} from 'utils/forms';

// import { qe } from 'utils/quasi-equals';
import { scrollToTop } from 'utils/scroll-to-component';
import { hasNewErrorNEW } from 'utils/entity-form';
import { checkActorAttribute, checkActorRequired } from 'utils/entities';

import { getCheckedValuesFromOptions } from 'components/forms/MultiSelectControl';

import { CONTENT_SINGLE } from 'containers/App/constants';
import { ROUTES, USER_ROLES } from 'themes/config';
import appMessages from 'containers/App/messages';

import {
  loadEntitiesIfNeeded,
  redirectIfNotPermitted,
  updatePath,
  updateEntityForm,
  openNewEntityModal,
  submitInvalid,
  saveErrorDismiss,
} from 'containers/App/actions';

import {
  selectReady,
  selectReadyForAuthCheck,
  selectActortypeTaxonomiesWithCats,
  selectActortype,
} from 'containers/App/selectors';

import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';

import FormWrapper from './FormWrapper';

import {
  selectDomainPage,
  selectConnectedTaxonomies,
  selectActionsByActiontype,
  selectActionsAsTargetByActiontype,
  selectMembersByActortype,
  selectAssociationsByActortype,
  selectUserOptions,
} from './selectors';

import messages from './messages';
import { save } from './actions';
import { DEPENDENCIES, FORM_INITIAL } from './constants';


export class ActorNew extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.scrollContainer = React.createRef();
  }

  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
    this.props.initialiseForm('actorNew.form.data', this.getInitialFormData());
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
    if (nextProps.authReady && !this.props.authReady) {
      this.props.redirectIfNotPermitted();
    }
    if (hasNewErrorNEW(nextProps, this.props) && this.scrollContainer) {
      scrollToTop(this.scrollContainer.current);
    }
  }

  getInitialFormData = (nextProps) => {
    const props = nextProps || this.props;
    const { params } = props;
    return Map(FORM_INITIAL.setIn(
      ['attributes', 'actortype_id'],
      params.id,
    ));
  }

  getHeaderMainFields = (type) => {
    const { intl } = this.context;
    const typeId = type.get('id');
    return ([ // fieldGroups
      { // fieldGroup
        fields: [
          checkActorAttribute(typeId, 'code') && getCodeFormField(
            intl.formatMessage,
            'code',
            checkActorRequired(typeId, 'code'),
          ),
          checkActorAttribute(typeId, 'prefix') && getCodeFormField(
            intl.formatMessage,
            'prefix',
            checkActorRequired(typeId, 'prefix'),
          ),
          checkActorAttribute(typeId, 'title') && getTitleFormField(
            intl.formatMessage,
            'title',
            'title',
            checkActorRequired(typeId, 'title'),
          ),
          checkActorAttribute(typeId, 'name') && getTitleFormField(
            intl.formatMessage,
            'title',
            'title',
            checkActorRequired(typeId, 'name'),
            'name' // label
          ),
        ],
      },
    ]);
  };

  getHeaderAsideFields = () => {
    const { intl } = this.context;
    return ([
      {
        fields: [
          getStatusField(intl.formatMessage),
          getStatusField(intl.formatMessage, 'private'),
        ],
      },
    ]);
  }

  getBodyMainFields = (
    type,
    connectedTaxonomies,
    actionsByActiontype,
    actionsAsTargetByActiontype,
    membersByActortype,
    onCreateOption,
  ) => {
    const { intl } = this.context;
    const typeId = type.get('id');
    const groups = [];
    groups.push({
      fields: [
        checkActorAttribute(typeId, 'description') && getMarkdownFormField(
          intl.formatMessage,
          checkActorRequired(typeId, 'description'),
          'description',
        ),
        checkActorAttribute(typeId, 'activity_summary') && getMarkdownFormField(
          intl.formatMessage,
          checkActorRequired(typeId, 'activity_summary'),
          'activity_summary',
        ),
      ],
    });
    if (actionsByActiontype) {
      const actionConnections = renderActionsByActiontypeControl({
        entitiesByActiontype: actionsByActiontype,
        taxonomies: connectedTaxonomies,
        onCreateOption,
        contextIntl: intl,
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
    if (actionsAsTargetByActiontype) {
      const actionConnections = renderActionsAsTargetByActiontypeControl(
        actionsAsTargetByActiontype,
        connectedTaxonomies,
        onCreateOption,
        intl,
      );
      if (actionConnections) {
        groups.push(
          {
            label: intl.formatMessage(appMessages.nav.targetingActions),
            fields: actionConnections,
          },
        );
      }
    }
    if (membersByActortype) {
      const memberConnections = renderMembersByActortypeControl(
        membersByActortype,
        connectedTaxonomies,
        onCreateOption,
        intl,
      );
      if (memberConnections) {
        groups.push(
          {
            label: intl.formatMessage(appMessages.nav.members),
            fields: memberConnections,
          },
        );
      }
    }
    return groups;
  }

  getBodyAsideFields = (
    type,
    taxonomies,
    connectedTaxonomies,
    associationsByActortype,
    userOptions,
    onCreateOption,
  ) => {
    const { intl } = this.context;
    const typeId = type.get('id');
    const groups = [ // fieldGroups
      { // fieldGroup
        fields: [
          checkActorAttribute(typeId, 'email') && getEmailField(intl.formatMessage, checkActorRequired(typeId, 'email')),
          checkActorAttribute(typeId, 'phone') && getTextFormField(intl.formatMessage, 'phone', checkActorRequired(typeId, 'phone')),
          checkActorAttribute(typeId, 'address') && getTextareaField(intl.formatMessage, 'address', checkActorRequired(typeId, 'address')),
          checkActorAttribute(typeId, 'url') && getLinkFormField(
            intl.formatMessage,
            checkActorRequired(typeId, 'url'),
            'url',
          ),
        ],
      },
      { // fieldGroup
        label: intl.formatMessage(appMessages.entities.taxonomies.plural),
        icon: 'categories',
        fields: renderTaxonomyControl(taxonomies, onCreateOption, intl),
      },
    ];
    if (userOptions) {
      groups.push(
        {
          label: intl.formatMessage(appMessages.nav.userActors),
          fields: [
            renderUserMultiControl(userOptions, null, intl),
          ],
        },
      );
    }
    if (associationsByActortype) {
      const associationConnections = renderAssociationsByActortypeControl(
        associationsByActortype,
        connectedTaxonomies,
        onCreateOption,
        intl,
      );
      if (associationConnections) {
        groups.push(
          {
            label: intl.formatMessage(appMessages.nav.associations),
            fields: associationConnections,
          },
        );
      }
    }
    return groups;
  };

  render() {
    const { intl } = this.context;
    const {
      dataReady,
      viewDomainPage,
      connectedTaxonomies,
      actionsByActiontype,
      actionsAsTargetByActiontype,
      taxonomies,
      onCreateOption,
      actortype,
      params,
      membersByActortype,
      associationsByActortype,
      userOptions,
      onErrorDismiss,
      onServerErrorDismiss,
      handleCancel,
      handleSubmitRemote,
      handleSubmit,
      handleSubmitFail,
      handleUpdate,
    } = this.props;
    const typeId = params.id;
    const { saveSending } = viewDomainPage.toJS();

    const type = intl.formatMessage(appMessages.entities[`actors_${typeId}`].single);
    return (
      <div>
        <Helmet
          title={`${intl.formatMessage(messages.pageTitle, { type })}`}
          meta={[
            {
              name: 'description',
              content: intl.formatMessage(messages.metaDescription),
            },
          ]}
        />
        <Content ref={this.scrollContainer}>
          <ContentHeader
            title={intl.formatMessage(messages.pageTitle, { type })}
            type={CONTENT_SINGLE}
            buttons={
              dataReady ? [{
                type: 'cancel',
                onClick: () => handleCancel(typeId),
              },
              {
                type: 'save',
                disabled: saveSending,
                onClick: () => handleSubmitRemote('actorNew.form.data'),
              }] : null
            }
          />
          <FormWrapper
            model="actorNew.form.data"
            handleSubmit={(formData) => handleSubmit(
              formData,
              actortype,
              actionsByActiontype,
              actionsAsTargetByActiontype,
              membersByActortype,
              associationsByActortype,
              userOptions,
            )}
            handleSubmitFail={handleSubmitFail}
            handleCancel={() => handleCancel(typeId)}
            handleUpdate={handleUpdate}
            onErrorDismiss={onErrorDismiss}
            onServerErrorDismiss={onServerErrorDismiss}
            scrollContainer={this.scrollContainer.current}
            fields={dataReady && { // isManager, taxonomies,
              header: {
                main: this.getHeaderMainFields(actortype),
                aside: this.getHeaderAsideFields(),
              },
              body: {
                main: this.getBodyMainFields(
                  actortype,
                  connectedTaxonomies,
                  actionsByActiontype,
                  actionsAsTargetByActiontype,
                  membersByActortype,
                  onCreateOption,
                ),
                aside: this.getBodyAsideFields(
                  actortype,
                  taxonomies,
                  connectedTaxonomies,
                  associationsByActortype,
                  userOptions,
                  onCreateOption,
                ),
              },
            }}
          />
        </Content>
      </div>
    );
  }
}

ActorNew.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  redirectIfNotPermitted: PropTypes.func,
  handleSubmitRemote: PropTypes.func.isRequired,
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  viewDomainPage: PropTypes.object,
  dataReady: PropTypes.bool,
  authReady: PropTypes.bool,
  taxonomies: PropTypes.object,
  onCreateOption: PropTypes.func,
  initialiseForm: PropTypes.func,
  actionsByActiontype: PropTypes.object,
  actionsAsTargetByActiontype: PropTypes.object,
  connectedTaxonomies: PropTypes.object,
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  actortype: PropTypes.instanceOf(Map),
  params: PropTypes.object,
  membersByActortype: PropTypes.object,
  associationsByActortype: PropTypes.object,
  userOptions: PropTypes.object,
};

ActorNew.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, { params }) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  authReady: selectReadyForAuthCheck(state),
  taxonomies: selectActortypeTaxonomiesWithCats(
    state,
    {
      type: params.id,
      includeParents: false,
    },
  ),
  connectedTaxonomies: selectConnectedTaxonomies(state),
  actortype: selectActortype(state, params.id),
  actionsByActiontype: selectActionsByActiontype(state, params.id),
  actionsAsTargetByActiontype: selectActionsAsTargetByActiontype(state, params.id),
  membersByActortype: selectMembersByActortype(state, params.id),
  associationsByActortype: selectAssociationsByActortype(state, params.id),
  userOptions: selectUserOptions(state, params.id),
  viewDomainPage: selectDomainPage(state),
});

function mapDispatchToProps(dispatch) {
  return {
    initialiseForm: (model, formData) => {
      dispatch(formActions.reset(model));
      dispatch(formActions.change(model, formData, { silent: true }));
    },
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    redirectIfNotPermitted: () => {
      dispatch(redirectIfNotPermitted(USER_ROLES.MANAGER.value));
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
      actortype,
      actionsByActiontype,
      actionsAsTargetByActiontype,
      membersByActortype,
      associationsByActortype,
      userOptions,
    ) => {
      let saveData = formData.setIn(
        ['attributes', 'actortype_id'],
        actortype.get('id'),
      );
      // actorCategories=
      if (formData.get('associatedTaxonomies')) {
        // get List of valid categories (for actortype)
        // const validCategories = actortypeTaxonomies && actortypeTaxonomies
        //   .map((actortypet) => actortypet.get('categories').keySeq())
        //   .valueSeq()
        //   .flatten();
        // get list of selected categories by taxonomy,
        // filter by valid categories
        const selectedCategories = formData
          .get('associatedTaxonomies')
          .map(getCheckedValuesFromOptions)
          .valueSeq()
          .flatten();
          // .filter((id) => !validCategories || validCategories.includes(id));
        // const categoryIds =
        saveData = saveData.set(
          'actorCategories',
          Map({
            delete: List(),
            create: selectedCategories.map((id) => Map({ category_id: id })),
          }),
        );
      }
      //
      // actions if allowed by actortype
      if (actionsByActiontype && formData.get('associatedActionsByActiontype')) {
        saveData = saveData.set(
          'actorActions',
          actionsByActiontype
            .map((actors, actortypeid) => getConnectionUpdatesFromFormData({
              formData,
              connections: actors,
              connectionAttribute: ['associatedActionsByActiontype', actortypeid.toString()],
              createConnectionKey: 'measure_id',
              createKey: 'actor_id',
            }))
            .reduce(
              (memo, deleteCreateLists) => {
                const creates = memo.get('create').concat(deleteCreateLists.get('create'));
                return memo.set('create', creates);
              },
              fromJS({
                create: [],
              }),
            )
        );
      }
      // actions if allowed by actortype
      if (actionsAsTargetByActiontype && formData.get('associatedActionsAsTargetByActiontype')) {
        saveData = saveData.set(
          'actionActors',
          actionsAsTargetByActiontype
            .map((actors, actortypeid) => getConnectionUpdatesFromFormData({
              formData,
              connections: actors,
              connectionAttribute: ['associatedActionsAsTargetByActiontype', actortypeid.toString()],
              createConnectionKey: 'measure_id',
              createKey: 'actor_id',
            }))
            .reduce(
              (memo, deleteCreateLists) => {
                const creates = memo.get('create').concat(deleteCreateLists.get('create'));
                return memo.set('create', creates);
              },
              fromJS({
                create: [],
              }),
            )
        );
      }
      if (membersByActortype && formData.get('associatedMembersByActortype')) {
        saveData = saveData.set(
          'memberships',
          membersByActortype
            .map((members, typeid) => getConnectionUpdatesFromFormData({
              formData,
              connections: members,
              connectionAttribute: ['associatedMembersByActortype', typeid.toString()],
              createConnectionKey: 'member_id',
              createKey: 'memberof_id',
            }))
            .reduce(
              (memo, deleteCreateLists) => {
                const creates = memo.get('create').concat(deleteCreateLists.get('create'));
                return memo.set('create', creates);
              },
              fromJS({
                create: [],
              }),
            )
        );
      }
      if (associationsByActortype && formData.get('associatedAssociationsByActortype')) {
        saveData = saveData.set(
          'associations',
          associationsByActortype
            .map((associations, typeid) => getConnectionUpdatesFromFormData({
              formData,
              connections: associations,
              connectionAttribute: ['associatedAssociationsByActortype', typeid.toString()],
              createConnectionKey: 'memberof_id',
              createKey: 'member_id',
            }))
            .reduce(
              (memo, deleteCreateLists) => {
                const creates = memo.get('create').concat(deleteCreateLists.get('create'));
                return memo.set('create', creates);
              },
              fromJS({
                create: [],
              }),
            )
        );
      }
      if (formData.get('associatedUsers') && userOptions) {
        saveData = saveData.set(
          'userActors',
          Map({
            delete: List(),
            create: getCheckedValuesFromOptions(formData.get('associatedUsers'))
              .map((id) => Map({
                user_id: id,
              })),
          })
        );
      }
      dispatch(save(saveData.toJS(), actortype.get('id')));
    },
    handleCancel: (typeId) => {
      dispatch(updatePath(`${ROUTES.ACTORS}/${typeId}`), { replace: true });
    },
    handleUpdate: (formData) => {
      dispatch(updateEntityForm(formData));
    },
    onCreateOption: (args) => {
      dispatch(openNewEntityModal(args));
    },
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(ActorNew);
