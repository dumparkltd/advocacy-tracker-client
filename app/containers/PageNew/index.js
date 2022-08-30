/*
 *
 * PageNew
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { intlShape, injectIntl } from 'react-intl';

import messages from './messages';

import PageNewForm from './PageNewForm';
import { selectDomain } from './selectors';

export function PageNew({
  viewDomain,
  intl,
}) {
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
      <PageNewForm
        viewDomain={viewDomain}
        formDataPath="pageNew.form.data"
      />
    </div>
  );
}

PageNew.propTypes = {
  viewDomain: PropTypes.object,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state) => ({
  viewDomain: selectDomain(state),
});

export default connect(mapStateToProps, null)(injectIntl(PageNew));
