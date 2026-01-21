/*
 *
 * EntityNewModal
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect as reduxConnect } from 'react-redux';

import ActorNewForm from 'containers/ActorNew/ActorNewForm';
import ActionNewForm from 'containers/ActionNew/ActionNewForm';
import CategoryNewForm from 'containers/CategoryNew/CategoryNewForm';
import ResourceNewForm from 'containers/ResourceNew/ResourceNewForm';

import { API } from 'themes/config';
import { REDUCER_NAME } from './constants';

import { selectDomain } from './selectors';

export class EntityNewModal extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const {
      path,
      attributes,
      autoUser,
      connect,
      viewDomain,
      onSaveSuccess,
      onCancel,
      invalidateEntitiesOnSuccess,
    } = this.props;

    if (path === API.ACTIONS) {
      return (
        <ActionNewForm
          inModal
          modalAttributes={attributes}
          modalConnect={connect}
          viewDomain={viewDomain}
          onSaveSuccess={onSaveSuccess}
          invalidateEntitiesOnSuccess={invalidateEntitiesOnSuccess}
          onCancel={onCancel}
          formDataPath={`${REDUCER_NAME}.form.data`}
          formId={REDUCER_NAME}
          typeId={attributes.get('measuretype_id')}
          autoUser={autoUser}
        />
      );
    }
    if (path === API.ACTORS) {
      return (
        <ActorNewForm
          inModal
          modalAttributes={attributes}
          modalConnect={connect}
          viewDomain={viewDomain}
          onSaveSuccess={onSaveSuccess}
          invalidateEntitiesOnSuccess={invalidateEntitiesOnSuccess}
          onCancel={onCancel}
          formDataPath={`${REDUCER_NAME}.form.data`}
          formId={REDUCER_NAME}
          typeId={attributes.get('actortype_id')}
          autoUser={autoUser}
        />
      );
    }
    if (path === API.CATEGORIES) {
      return (
        <CategoryNewForm
          inModal
          modalAttributes={attributes}
          modalConnect={connect}
          viewDomain={viewDomain}
          onSaveSuccess={onSaveSuccess}
          invalidateEntitiesOnSuccess={invalidateEntitiesOnSuccess}
          onCancel={onCancel}
          formDataPath={`${REDUCER_NAME}.form.data`}
          formId={REDUCER_NAME}
          typeId={attributes.get('taxonomy_id')}
        />
      );
    }
    if (path === API.RESOURCES) {
      return (
        <ResourceNewForm
          inModal
          modalAttributes={attributes}
          modalConnect={connect}
          viewDomain={viewDomain}
          onSaveSuccess={onSaveSuccess}
          invalidateEntitiesOnSuccess={invalidateEntitiesOnSuccess}
          onCancel={onCancel}
          formDataPath={`${REDUCER_NAME}.form.data`}
          formId={REDUCER_NAME}
          typeId={attributes.get('resourcetype_id')}
        />
      );
    }
    return null;
  }
}

EntityNewModal.propTypes = {
  path: PropTypes.string.isRequired,
  attributes: PropTypes.object,
  connect: PropTypes.object,
  viewDomain: PropTypes.object,
  onSaveSuccess: PropTypes.func,
  invalidateEntitiesOnSuccess: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
  onCancel: PropTypes.func,
  autoUser: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  viewDomain: selectDomain(state),
});


export default reduxConnect(mapStateToProps, null)(EntityNewModal);
