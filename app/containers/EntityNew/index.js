/*
 *
 * EntityNew
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect as reduxConnect } from 'react-redux';

import ActorNewForm from 'containers/ActorNew/ActorNewForm';
import ActionNewForm from 'containers/ActionNew/ActionNewForm';
import CategoryNewForm from 'containers/CategoryNew/CategoryNewForm';
import ResourceNewForm from 'containers/ResourceNew/ResourceNewForm';

import {
  API,
} from 'themes/config';

import { selectDomain } from './selectors';
import { resetForm } from './actions';

export class EntityNew extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const {
      path,
      attributes,
      connect,
      viewDomain,
      onSaveSuccess,
      onCancel,
      onResetForm,
    } = this.props;
    // console.log('path', path)
    // console.log('viewDomain', viewDomain.toJS())
    // console.log('attributes', attributes.toJS())
    // console.log('connect', connect.toJS())
    if (path === API.ACTIONS) {
      return (
        <ActionNewForm
          inModal
          modalAttributes={attributes}
          modalConnect={connect}
          viewDomain={viewDomain}
          onSaveSuccess={onSaveSuccess}
          onCancel={(arg) => {
            onResetForm();
            onCancel(arg);
          }}
          formDataPath="entityNew.form.data"
          typeId={attributes.get('measuretype_id')}
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
          onCancel={(arg) => {
            onResetForm();
            onCancel(arg);
          }}
          formDataPath="entityNew.form.data"
          typeId={attributes.get('actortype_id')}
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
          onCancel={(arg) => {
            onResetForm();
            onCancel(arg);
          }}
          formDataPath="entityNew.form.data"
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
          onCancel={(arg) => {
            onResetForm();
            onCancel(arg);
          }}
          formDataPath="entityNew.form.data"
          typeId={attributes.get('resourcetype_id')}
        />
      );
    }
    return null;
  }
}

EntityNew.propTypes = {
  path: PropTypes.string.isRequired,
  attributes: PropTypes.object,
  connect: PropTypes.object,
  viewDomain: PropTypes.object,
  onSaveSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  onResetForm: PropTypes.func,
};

const mapStateToProps = (state) => ({
  viewDomain: selectDomain(state),
});

function mapDispatchToProps(
  dispatch,
) {
  return {
    onResetForm: () => {
      dispatch(resetForm());
    },
  };
}
export default reduxConnect(mapStateToProps, mapDispatchToProps)(EntityNew);
