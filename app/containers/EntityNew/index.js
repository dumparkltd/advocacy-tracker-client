/*
 *
 * EntityNew
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { actions as formActions } from 'react-redux-form/immutable';
import { Map, List } from 'immutable';

import { getEntityAttributeFields } from 'utils/forms';
import { scrollToTop } from 'utils/scroll-to-component';
import { hasNewError } from 'utils/entity-form';

import {
  newEntity,
  submitInvalid,
  saveErrorDismiss,
} from 'containers/App/actions';

import { selectEntity } from 'containers/App/selectors';
import { selectParentOptions, selectParentTaxonomy } from 'containers/CategoryNew/selectors';


import {
  API, DEFAULT_ACTIONTYPE, DEFAULT_ACTORTYPE, DEFAULT_RESOURCETYPE,
} from 'themes/config';
import { CONTENT_MODAL } from 'containers/App/constants';
import appMessages from 'containers/App/messages';
import { getCheckedValuesFromOptions } from 'components/forms/MultiSelectControl';

import Content from 'components/Content';
import Messages from 'components/Messages';
import Loading from 'components/Loading';
import ContentHeader from 'components/ContentHeader';
import EntityForm from 'containers/EntityForm';

import { selectDomain } from './selectors';
import { FORM_INITIAL } from './constants';

import messages from './messages';

export class EntityNew extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.scrollContainer = React.createRef();
  }

  UNSAFE_componentWillMount() {
    this.props.initialiseForm('entityNew.form.data', this.getInitialFormData());
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (hasNewError(nextProps, this.props) && this.scrollContainer) {
      scrollToTop(this.scrollContainer.current);
    }
    if (!this.props.attributes && nextProps.attributes) {
      this.props.initialiseForm('actorNew.form.data', this.getInitialFormData(nextProps));
    }
  }


  // todo set/pass type
  getInitialFormData = (nextProps) => {
    const props = nextProps || this.props;
    const { attributes, path } = props;
    if (path === API.ACTORS) {
      return attributes && attributes.get('actortype_id')
        ? Map(FORM_INITIAL.set('attributes', attributes))
        : Map(FORM_INITIAL.setIn(['attributes', 'actortype_id'], DEFAULT_ACTORTYPE));
    }
    if (path === API.ACTIONS) {
      return attributes && attributes.get('measuretype_id')
        ? Map(FORM_INITIAL.set('attributes', attributes))
        : Map(FORM_INITIAL.setIn(['attributes', 'measuretype_id'], DEFAULT_ACTIONTYPE));
    }
    if (path === API.RESOURCES) {
      return attributes && attributes.get('resourcetype_id')
        ? Map(FORM_INITIAL.set('attributes', attributes))
        : Map(FORM_INITIAL.setIn(['attributes', 'resourcetype_id'], DEFAULT_RESOURCETYPE));
    }
    return Map(FORM_INITIAL);
  }

  /* eslint-disable react/destructuring-assignment */
  getTaxTitle = (id) => this.context.intl.formatMessage(appMessages.entities.taxonomies[id].single);
  /* eslint-enable react/destructuring-assignment */

  render() {
    const { intl } = this.context;
    const {
      viewDomain,
      path,
      attributes,
      inModal,
      taxonomy,
      categoryParentOptions,
      parentTaxonomy,
      type,
    } = this.props;
    const { saveSending, saveError, submitValid } = viewDomain.get('page').toJS();
    let pageTitle;
    let icon = path;
    if (path === API.CATEGORIES && taxonomy && taxonomy.get('attributes')) {
      pageTitle = intl.formatMessage(messages[path].pageTitleTaxonomy, {
        taxonomy: this.getTaxTitle(taxonomy.get('id')),
      });
    } else if (path === API.ACTORS) {
      // figure out actortype id from form if not set
      const currentTypeId = (type && type.get('id'))
        || viewDomain.getIn(['form', 'data', 'attributes', 'actortype_id'])
        || DEFAULT_ACTORTYPE;
      // check if single actortype set
      // get current actortype
      // check if response is required
      // figure out title and icon
      pageTitle = intl.formatMessage(
        messages.actors.pageTitle,
        {
          type: intl.formatMessage(
            appMessages.entities[`actors_${currentTypeId}`].single
          ),
        }
      );
    } else if (path === API.ACTIONS) {
      // figure out actortype id from form if not set
      const currentTypeId = (type && type.get('id'))
        || viewDomain.getIn(['form', 'data', 'attributes', 'measuretype_id'])
        || DEFAULT_ACTIONTYPE;
      // check if single actortype set
      // figure out title and icon
      pageTitle = intl.formatMessage(
        messages.actions.pageTitle,
        {
          type: intl.formatMessage(
            appMessages.entities[`actions_${currentTypeId}`].single
          ),
        }
      );
      icon = `${path}_${currentTypeId}`;
    } else if (path === API.RESOURCES) {
      // figure out actortype id from form if not set
      const currentTypeId = (type && type.get('id'))
        || viewDomain.getIn(['form', 'data', 'attributes', 'resourcetype_id'])
        || DEFAULT_RESOURCETYPE;
      // check if single actortype set
      // figure out title and icon
      pageTitle = intl.formatMessage(
        messages.resources.pageTitle,
        {
          type: intl.formatMessage(
            appMessages.entities[`resources_${currentTypeId}`].single
          ),
        }
      );
      icon = `${path}_${currentTypeId}`;
    } else {
      pageTitle = intl.formatMessage(messages[path].pageTitle);
    }

    return (
      <div>
        <Content
          ref={this.scrollContainer}
          inModal={inModal}
        >
          <ContentHeader
            title={pageTitle}
            type={CONTENT_MODAL}
            icon={icon}
            buttons={[{
              type: 'cancel',
              onClick: this.props.onCancel,
            },
            {
              type: 'save',
              disabled: saveSending,
              onClick: () => this.props.handleSubmitRemote('entityNew.form.data'),
            }]}
          />
          {!submitValid
            && (
              <Messages
                type="error"
                messageKey="submitInvalid"
                onDismiss={this.props.onErrorDismiss}
              />
            )
          }
          {saveError
            && (
              <Messages
                type="error"
                messages={saveError.messages}
                onDismiss={this.props.onServerErrorDismiss}
              />
            )
          }
          {(saveSending)
            && <Loading />
          }
          <EntityForm
            model="entityNew.form.data"
            formData={viewDomain.getIn(['form', 'data'])}
            inModal={inModal}
            saving={saveSending}
            handleSubmit={(formData) => this.props.handleSubmit(
              formData,
              attributes
            )}
            handleSubmitFail={this.props.handleSubmitFail}
            handleCancel={this.props.onCancel}
            scrollContainer={this.scrollContainer.current}
            fields={getEntityAttributeFields(
              path,
              {
                categories: {
                  taxonomy,
                  categoryParentOptions,
                  parentTaxonomy,
                },
              },
              intl,
            )}
          />
          {saveSending
            && <Loading />
          }
        </Content>
      </div>
    );
  }
}

EntityNew.propTypes = {
  path: PropTypes.string.isRequired,
  attributes: PropTypes.object,
  // connect: PropTypes.object,
  taxonomy: PropTypes.object,
  parentTaxonomy: PropTypes.object,
  categoryParentOptions: PropTypes.object,
  handleSubmitRemote: PropTypes.func.isRequired,
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  inModal: PropTypes.bool,
  // onSaveSuccess: PropTypes.func,
  viewDomain: PropTypes.object,
  initialiseForm: PropTypes.func,
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  type: PropTypes.object,
};

EntityNew.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, { path, attributes }) => {
  let type;
  if (path === API.ACTORS && attributes && attributes.get('actortype_id')) {
    type = selectEntity(state, { path: API.ACTORTYPES, id: attributes.get('actortype_id') });
  }
  if (path === API.ACTIONS && attributes && attributes.get('measuretype_id')) {
    type = selectEntity(state, { path: API.ACTIONTYPES, id: attributes.get('measuretype_id') });
  }
  if (path === API.RESOURCES && attributes && attributes.get('resourcetype_id')) {
    type = selectEntity(state, { path: API.RESOURCETYPES, id: attributes.get('resourcetype_id') });
  }
  return {
    viewDomain: selectDomain(state),
    taxonomy: path === API.CATEGORIES && attributes && attributes.get('taxonomy_id')
      ? selectEntity(state, { path: API.TAXONOMIES, id: attributes.get('taxonomy_id') })
      : null,
    categoryParentOptions: path === API.CATEGORIES && attributes && attributes.get('taxonomy_id')
      ? selectParentOptions(state, attributes.get('taxonomy_id'))
      : null,
    parentTaxonomy: path === API.CATEGORIES && attributes && attributes.get('taxonomy_id')
      ? selectParentTaxonomy(state, attributes.get('taxonomy_id'))
      : null,
    type,
  };
};

function mapDispatchToProps(dispatch, props) {
  return {
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
    handleSubmit: (formData, attributes) => {
      let saveData = attributes
        ? formData.mergeIn(['attributes'], attributes)
        : formData;

      // saveData = saveData.setIn(['attributes', 'taxonomy_id'], taxonomy.get('id'));

      if (props.path === API.CATEGORIES) {
        const formCategoryIds = formData.get('associatedCategory')
          && getCheckedValuesFromOptions(formData.get('associatedCategory'));
        if (List.isList(formCategoryIds) && formCategoryIds.size) {
          saveData = saveData.setIn(['attributes', 'parent_id'], formCategoryIds.first());
        } else {
          saveData = saveData.setIn(['attributes', 'parent_id'], null);
        }
      }

      if (props.connect) {
        if (props.connect.get('type') === 'actorActions') {
          saveData = saveData.set(
            'actorActions',
            Map().set('create', props.connect.get('create')),
          );
        }
      }

      dispatch(newEntity({
        entity: saveData.toJS(),
        path: props.path,
        onSuccess: props.onSaveSuccess,
      }));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EntityNew);
