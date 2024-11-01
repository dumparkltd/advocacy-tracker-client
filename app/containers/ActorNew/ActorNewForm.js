/*
*
* ActorNewForm
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { actions as formActions } from 'react-redux-form/immutable';

import { Map, List, fromJS } from 'immutable';

import {
  getConnectionUpdatesFromFormData,
  getActortypeFormFields,
} from 'utils/forms';

import { scrollToTop } from 'utils/scroll-to-component';
import { hasNewErrorNEW } from 'utils/entity-form';

import { getCheckedValuesFromOptions } from 'components/forms/MultiSelectControl';

import { CONTENT_SINGLE, CONTENT_MODAL } from 'containers/App/constants';
import { API, ROUTES, USER_ROLES } from 'themes/config';
import appMessages from 'containers/App/messages';

import {
  loadEntitiesIfNeeded,
  redirectIfNotPermitted,
  updatePath,
  updateEntityForm,
  openNewEntityModal,
  submitInvalid,
  saveErrorDismiss,
  newEntity,
} from 'containers/App/actions';

import {
  selectReady,
  selectReadyForAuthCheck,
  selectActortypeTaxonomiesWithCats,
  selectActortype,
  selectSessionUser,
  selectIsUserAdmin,
  selectTaxonomiesWithCategories,
} from 'containers/App/selectors';

import Content from 'components/Content';
import ContentHeader from 'containers/ContentHeader';

import EntityFormWrapper from 'containers/EntityForm/EntityFormWrapper';

import {
  selectActionsByActiontype,
  selectMembersByActortype,
  selectAssociationsByActortype,
  selectUserOptions,
} from './selectors';

import messages from './messages';
import { DEPENDENCIES, FORM_INITIAL } from './constants';


export class ActorNewForm extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.scrollContainer = React.createRef();
  }

  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
    this.props.initialiseForm(this.getInitialFormData());
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
    // repopulate if new data becomes ready
    if (nextProps.dataReady && !this.props.dataReady && nextProps.sessionUser) {
      this.props.initialiseForm(this.getInitialFormData(nextProps));
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
    const { typeId, sessionUser } = props;
    const dataWithType = FORM_INITIAL.setIn(['attributes', 'actortype_id'], typeId);
    return sessionUser
      && sessionUser.getIn(['attributes', 'id'])
      ? dataWithType.set(
        'associatedUsers',
        fromJS([{
          value: sessionUser.getIn(['attributes', 'id']).toString(),
          checked: true,
          label: sessionUser.getIn(['attributes', 'name']),
          reference: sessionUser.getIn(['attributes', 'id']).toString(),
        }])
      )
      : dataWithType;
  };

  render() {
    const { intl } = this.context;
    const {
      viewDomain,
      connectedTaxonomies,
      actionsByActiontype,
      taxonomies,
      onCreateOption,
      actortype,
      typeId,
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
      formDataPath,
      inModal,
      isAdmin,
      invalidateEntitiesOnSuccess,
    } = this.props;

    const type = intl.formatMessage(appMessages.entities[`actors_${typeId}`].single);
    return (
      <Content ref={this.scrollContainer} inModal={inModal}>
        <ContentHeader
          title={intl.formatMessage(messages.pageTitle, { type })}
          type={inModal ? CONTENT_MODAL : CONTENT_SINGLE}
        />
        <EntityFormWrapper
          typeLabel={type}
          isNewEntityView
          model={formDataPath}
          inModal={inModal}
          viewDomain={viewDomain}
          handleSubmit={(formData) => handleSubmit(
            formData,
            actortype,
            actionsByActiontype,
            membersByActortype,
            associationsByActortype,
            userOptions,
            invalidateEntitiesOnSuccess,
          )}
          handleSubmitFail={handleSubmitFail}
          handleSubmitRemote={() => handleSubmitRemote(formDataPath)}
          handleCancel={() => handleCancel(typeId)}
          handleUpdate={handleUpdate}
          onErrorDismiss={onErrorDismiss}
          onServerErrorDismiss={onServerErrorDismiss}
          scrollContainer={this.scrollContainer.current}
          fieldsByStep={getActortypeFormFields({
            isMine: true,
            isAdmin,
            typeId,
            taxonomies,
            connectedTaxonomies,
            userOptions,
            actionsByActiontype,
            associationsByActortype,
            membersByActortype,
            onCreateOption: inModal ? null : onCreateOption,
            intl,
          })}
        />
      </Content>
    );
  }
}

ActorNewForm.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  redirectIfNotPermitted: PropTypes.func,
  handleSubmitRemote: PropTypes.func.isRequired,
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  viewDomain: PropTypes.object,
  dataReady: PropTypes.bool,
  authReady: PropTypes.bool,
  taxonomies: PropTypes.object,
  onCreateOption: PropTypes.func,
  initialiseForm: PropTypes.func,
  actionsByActiontype: PropTypes.object,
  connectedTaxonomies: PropTypes.object,
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  actortype: PropTypes.instanceOf(Map),
  membersByActortype: PropTypes.object,
  associationsByActortype: PropTypes.object,
  userOptions: PropTypes.object,
  typeId: PropTypes.string,
  formDataPath: PropTypes.string,
  inModal: PropTypes.bool,
  isAdmin: PropTypes.bool,
  invalidateEntitiesOnSuccess: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
  // autoUser: PropTypes.bool,
};

ActorNewForm.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, { typeId, autoUser }) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  authReady: selectReadyForAuthCheck(state),
  taxonomies: selectActortypeTaxonomiesWithCats(
    state,
    {
      type: typeId,
      includeParents: false,
    },
  ),
  connectedTaxonomies: selectTaxonomiesWithCategories(state),
  actortype: selectActortype(state, typeId),
  actionsByActiontype: selectActionsByActiontype(state, typeId),
  membersByActortype: selectMembersByActortype(state, typeId),
  associationsByActortype: selectAssociationsByActortype(state, typeId),
  userOptions: selectUserOptions(state, typeId),
  sessionUser: autoUser && selectSessionUser(state),
  isAdmin: selectIsUserAdmin(state),
});

function mapDispatchToProps(
  dispatch,
  {
    formDataPath,
    modalAttributes,
    modalConnect,
    inModal,
    onSaveSuccess,
    onCancel,
  }
) {
  return {
    initialiseForm: (formData) => {
      dispatch(formActions.reset(formDataPath));
      dispatch(formActions.change(formDataPath, formData, { silent: true }));
    },
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    redirectIfNotPermitted: () => {
      dispatch(redirectIfNotPermitted(USER_ROLES.MEMBER.value));
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
      membersByActortype,
      associationsByActortype,
      userOptions,
      invalidateEntitiesOnSuccess,
    ) => {
      // console.log('formData', formData.toJS())

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
        //   .flatten(true);
        // get list of selected categories by taxonomy,
        // filter by valid categories
        const selectedCategories = formData
          .get('associatedTaxonomies')
          .map(getCheckedValuesFromOptions)
          .valueSeq()
          .flatten(true);
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
      // additional connections when created from modal
      if (inModal) {
        if (modalAttributes) {
          saveData = saveData.mergeIn(['attributes'], modalAttributes);
        }
        if (modalConnect
          && (
            modalConnect.get('type') === 'actorActions'
            || modalConnect.get('type') === 'userActions'
            || modalConnect.get('type') === 'subActions'
          )
        ) {
          if (saveData.get('type')) {
            saveData = saveData.mergeIn(
              [modalConnect.get('type'), 'create'],
              modalConnect.get('create'),
            );
          } else {
            saveData = saveData.setIn(
              [modalConnect.get('type'), 'create'],
              modalConnect.get('create'),
            );
          }
        }
      }
      dispatch(
        newEntity({
          path: API.ACTORS,
          entity: saveData.toJS(),
          redirect: !inModal ? ROUTES.ACTOR : null,
          invalidateEntitiesOnSuccess,
          onSuccess: inModal && onSaveSuccess
            ? () => {
              // cleanup
              dispatch(submitInvalid(true));
              dispatch(saveErrorDismiss());
              onSaveSuccess();
            }
            : null,
        })
      );
    },
    handleCancel: (typeId) => {
      if (inModal && onCancel) {
        // cleanup
        dispatch(submitInvalid(true));
        dispatch(saveErrorDismiss());
        onCancel();
      } else {
        dispatch(updatePath(`${ROUTES.ACTORS}/${typeId}`), { replace: true });
      }
    },
    handleUpdate: (formData) => {
      dispatch(updateEntityForm(formData));
    },
    onCreateOption: (args) => {
      dispatch(openNewEntityModal(args));
    },
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(ActorNewForm);
