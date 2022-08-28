/*
 *
 * ResourceNew
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { intlShape, injectIntl } from 'react-intl';

import appMessages from 'containers/App/messages';
import messages from './messages';

import ResourceNewForm from './ResourceNewForm';
import { selectDomain } from './selectors';

export function ResourceNew({
  params,
  viewDomain,
  intl,
}) {
  const typeId = params.id;
  const type = intl.formatMessage(appMessages.entities[`resources_${typeId}`].single);
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
      <ResourceNewForm
        typeId={typeId}
        viewDomain={viewDomain}
        formDataPath="resourceNew.form.data"
      />
    </div>
  );
}

ResourceNew.propTypes = {
  viewDomain: PropTypes.object,
  params: PropTypes.object,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state) => ({
  viewDomain: selectDomain(state),
});

export default connect(mapStateToProps, null)(injectIntl(ResourceNew));
