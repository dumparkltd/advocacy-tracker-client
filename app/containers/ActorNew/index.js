/*
 *
 * ActorNew
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { intlShape, injectIntl } from 'react-intl';

import appMessages from 'containers/App/messages';
import messages from './messages';

import ActorNewForm from './ActorNewForm';
import { selectDomain } from './selectors';

export function ActorNew({
  params,
  viewDomain,
  intl,
}) {
  const typeId = params.id;
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
      <ActorNewForm
        typeId={typeId}
        viewDomain={viewDomain}
        formDataPath="actorNew.form.data"
        autoUser
      />
    </div>
  );
}

ActorNew.propTypes = {
  viewDomain: PropTypes.object,
  params: PropTypes.object,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state) => ({
  viewDomain: selectDomain(state),
});

export default connect(mapStateToProps, null)(injectIntl(ActorNew));
